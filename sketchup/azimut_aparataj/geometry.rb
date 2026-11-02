require 'json'

module AzimutAparataj
  DICT = 'azimut_aparataj'.freeze

  # Builds one component definition per distinct assembly content (system, size, color, modules).
  # Local axes: x to the right as seen from the room, -y toward the room, z up.
  # Origin: center of the plate's back, on the wall surface.
  module Geometry
    MODULE_PITCH_MM = 22.5 # Italian modular format, shared by Living Now, Chorus and Unica
    PLATE_DEPTH_MM = 9.0
    KEY_DEPTH_MM = 2.0

    # Post systems send their own pitch (proportions.pitchMm); modular ones use 22.5 mm.
    def self.pitch(payload)
      ((payload['proportions'] || {})['pitchMm'] || MODULE_PITCH_MM).to_f
    end

    # ponytail: plate size comes from the app's drawing proportions scaled to the module pitch;
    # swap for real per-system plate dimensions once the library stores them.
    def self.dims(payload)
      p = payload['proportions'] || {}
      unit = pitch(payload) / (p['moduleWidth1M'] || 8.5).to_f
      side = (p['sideMargin'] || 10.5).to_f * unit
      top = (p['topMargin'] || 0).to_f * unit
      bottom = (p['bottomMargin'] || 0).to_f * unit
      key_h = (p['moduleHeight'] || 31).to_f * unit
      inset = (p['slotInset'] || 0).to_f * unit # post systems: the mechanism window sits inside each slot
      { w: 2 * side + payload['size'].to_i * pitch(payload), h: top + key_h + bottom, side: side, bottom: bottom, key_h: key_h, inset: inset }
    end

    def self.definition_name(payload)
      ids = payload['modules'].map { |m| m['pos'] ? "#{m['moduleId']}@#{m['pos']}" : m['moduleId'] }.join('+')
      "AZ #{payload['system']} #{payload['size']}M #{payload['color']} #{payload['wallBoxType']} #{payload['type']} #{ids}"
    end

    def self.definition_for(model, payload)
      name = definition_name(payload)
      existing = model.definitions[name]
      return existing if existing&.attribute_dictionary(DICT)

      defn = model.definitions.add(name)
      build(defn.entities, payload)
      {
        'system' => payload['system'], 'type' => payload['type'], 'size' => payload['size'].to_i,
        'color' => payload['color'], 'wall_box_type' => payload['wallBoxType'],
        'modules' => JSON.generate(payload['modules'].map { |m| { 'moduleId' => m['moduleId'], 'pos' => m['pos'] } }),
      }.each { |k, v| defn.set_attribute(DICT, k, v) }
      defn
    end

    def self.build(ents, payload)
      d = dims(payload)
      w = d[:w].mm
      h = d[:h].mm
      front = -PLATE_DEPTH_MM.mm
      toward_room(rect(ents, -w / 2, w / 2, -h / 2, h / 2, 0), PLATE_DEPTH_MM.mm)

      x0 = -w / 2 + d[:side].mm
      z0 = -h / 2 + d[:bottom].mm
      kh = d[:key_h].mm
      gap = [0.5, d[:inset]].max.mm
      step = pitch(payload).mm
      seq = 0
      payload['modules'].each do |m|
        start = (m['startPos'] || seq).to_i # post systems can leave empty slots
        seq = start + m['size'].to_i
        x = x0 + start * step
        kw = m['size'].to_i * step
        key = rect(ents, x + gap, x + kw - gap, z0 + gap, z0 + kh - gap, front)
        toward_room(key, KEY_DEPTH_MM.mm) if key
        symbol(ents, m['standardType'], Geom::Point3d.new(x + kw / 2, front - KEY_DEPTH_MM.mm, z0 + kh / 2))
      end
      paint(ents, payload['colorHex'] || '#FFFFFF')
    end

    def self.rect(ents, x0, x1, z0, z1, y)
      ents.add_face([x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1])
    end

    def self.toward_room(face, dist)
      face.reverse! if face.normal.y > 0
      face.pushpull(dist)
    end

    # Simple front-face marks so outlets and switches read apart in the model.
    def self.symbol(ents, type, c)
      n = Y_AXIS.reverse
      at = ->(dx, dz) { c + Geom::Vector3d.new(dx.mm, 0, dz.mm) }
      circle = ->(dx, dz, r) { ents.add_circle(at.(dx, dz), n, r.mm, 24) }
      box = ->(w, h) { ents.add_edges(at.(-w / 2, -h / 2), at.(w / 2, -h / 2), at.(w / 2, h / 2), at.(-w / 2, h / 2), at.(-w / 2, -h / 2)) }
      line = ->(x0, z0, x1, z1) { ents.add_line(at.(x0, z0), at.(x1, z1)) }
      case type
      when 'schuko' then circle.(0, 0, 17); circle.(-9.5, 0, 2.4); circle.(9.5, 0, 2.4)
      when 'italian' then [-5.5, 0, 5.5].each { |dz| circle.(0, dz, 1.8) }
      when 'usb' then box.(12.0, 5.0)
      when 'rj45' then box.(11.0, 9.0)
      when 'coax' then circle.(0, 0, 4); circle.(0, 0, 1.5)
      when 'switch_simple' then line.(-6, 0, 6, 0)
      when 'switch_stair' then line.(-6, 2, 6, 2); line.(-6, -2, 6, -2)
      when 'switch_cross' then line.(-5, -5, 5, 5); line.(-5, 5, 5, -5)
      when 'dimmer' then circle.(0, 0, 9)
      when 'blank' then nil
      else circle.(0, 0, 3)
      end
    end

    def self.paint(ents, hex)
      model = ents.model
      plate = material(model, hex)
      key = material(model, shade(hex))
      key_limit = -PLATE_DEPTH_MM.mm - 0.1.mm
      ents.grep(Sketchup::Face).each { |f| f.material = f.bounds.min.y < key_limit ? key : plate }
    end

    def self.material(model, hex)
      name = "AZ #{hex.upcase}"
      model.materials[name] || model.materials.add(name).tap { |m| m.color = Sketchup::Color.new(*rgb(hex)) }
    end

    # Keys a touch darker (or lighter on dark plates) than the plate.
    def self.shade(hex)
      r, g, b = rgb(hex)
      delta = (0.299 * r + 0.587 * g + 0.114 * b) < 128 ? 35 : -18
      format('#%02X%02X%02X', *[r, g, b].map { |v| (v + delta).clamp(0, 255) })
    end

    def self.rgb(hex)
      hex.delete('#').scan(/../).first(3).map(&:hex)
    end
  end
end
