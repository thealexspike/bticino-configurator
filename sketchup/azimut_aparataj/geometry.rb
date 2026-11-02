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
    GEOMETRY_VERSION = 2 # part of the definition name: bump it so the pin rebuilds instances made by older versions

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
      { w: 2 * side + payload['size'].to_i * pitch(payload), h: top + key_h + bottom, side: side, top: top, bottom: bottom, key_h: key_h, inset: inset }
    end

    def self.definition_name(payload)
      ids = payload['modules'].map { |m| m['pos'] ? "#{m['moduleId']}@#{m['pos']}" : m['moduleId'] }.join('+')
      "AZ#{GEOMETRY_VERSION} #{payload['system']} #{payload['size']}M #{payload['color']} #{payload['wallBoxType']} #{payload['type']} #{ids}"
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
      x1 = w / 2 - d[:side].mm
      z0 = -h / 2 + d[:bottom].mm
      kh = d[:key_h].mm
      wings(ents, d, w, h, x0, x1, front)

      gap = [0.5, d[:inset]].max.mm
      step = pitch(payload).mm
      seq = 0
      keys = []
      payload['modules'].each do |m|
        start = (m['startPos'] || seq).to_i # post systems can leave empty slots
        seq = start + m['size'].to_i
        x = x0 + start * step
        kw = m['size'].to_i * step
        key = rect(ents, x + gap, x + kw - gap, z0 + gap, z0 + kh - gap, front)
        toward_room(key, KEY_DEPTH_MM.mm) if key
        keys << [x + gap, x + kw - gap, z0 + gap, z0 + kh - gap]
        symbol(ents, m['standardType'], Geom::Point3d.new(x + kw / 2, front - KEY_DEPTH_MM.mm, z0 + kh / 2))
      end
      paint(ents, payload['colorHex'] || '#FFFFFF', keys)
    end

    # The frame border around the modules stands out as far as the keys do.
    def self.wings(ents, d, w, h, x0, x1, front)
      lip = KEY_DEPTH_MM.mm
      bands = [[-w / 2, x0, -h / 2, h / 2], [x1, w / 2, -h / 2, h / 2]]
      bands << [x0, x1, h / 2 - d[:top].mm, h / 2] if d[:top] > 0.1
      bands << [x0, x1, -h / 2, -h / 2 + d[:bottom].mm] if d[:bottom] > 0.1
      bands.each do |bx0, bx1, bz0, bz1|
        next if bx1 - bx0 < 0.1.mm || bz1 - bz0 < 0.1.mm

        face = rect(ents, bx0, bx1, bz0, bz1, front)
        toward_room(face, lip) if face
      end
    end

    def self.rect(ents, x0, x1, z0, z1, y)
      ents.add_face([x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1])
    end

    def self.toward_room(face, dist)
      face.reverse! if face.normal.y > 0
      face.pushpull(dist)
    end

    # Front-face features cut into the key, deep enough to read in a render (depths in mm, + = into the wall).
    def self.symbol(ents, type, c)
      n = Y_AXIS.reverse
      at = ->(dx, dz, dy = 0) { c + Geom::Vector3d.new(dx.mm, dy.mm, dz.mm) }
      circle = ->(dx, dz, r, depth, dy = 0) { recess(ents, ents.add_circle(at.(dx, dz, dy), n, r.mm, 24), depth) }
      box = lambda do |dx, dz, w, h, depth|
        pts = [[-w, -h], [w, -h], [w, h], [-w, h], [-w, -h]].map { |sx, sz| at.(dx + sx / 2.0, dz + sz / 2.0) }
        recess(ents, ents.add_edges(pts), depth)
      end
      case type
      when 'schuko'
        circle.(0, 0, 17, 4)
        [-9.5, 9.5].each { |dx| circle.(dx, 0, 2.4, 3, 4) } # pin holes at the bottom of the well
      when 'italian' then [-5.5, 0, 5.5].each { |dz| circle.(0, dz, 1.8, 3) }
      when 'usb' then box.(0, 0, 12.0, 5.0, 3)
      when 'rj45' then box.(0, 0, 11.0, 9.0, 4)
      when 'coax'
        circle.(0, 0, 4, 2)
        circle.(0, 0, 1.5, -1.5, 2) # center pin standing up from the bottom
      when 'switch_simple' then box.(0, 0, 12.0, 1.2, 0.6)
      when 'switch_stair' then [-2, 2].each { |dz| box.(0, dz, 12.0, 1.2, 0.6) }
      when 'switch_cross' then [-2.5, 2.5].each { |dx| box.(dx, 0, 1.2, 12.0, 0.6) }
      when 'dimmer' then circle.(0, 0, 9, 0.6)
      when 'blank' then nil
      else circle.(0, 0, 3, 0.6)
      end
    end

    # Push the face closed by these edges into the key (negative depth: out toward the room).
    def self.recess(ents, edges, depth)
      edges = edges.grep(Sketchup::Edge)
      face = edges.first&.faces&.find { |f| f.outer_loop.edges.all? { |e| edges.include?(e) } }
      return unless face

      face.reverse! if face.normal.y > 0
      face.pushpull(-depth.mm)
    end

    # Keys (and what is cut into them) in the key shade, everything else in the plate color.
    def self.paint(ents, hex, keys)
      model = ents.model
      plate = material(model, hex)
      key = material(model, shade(hex))
      tol = 0.01.mm
      ents.grep(Sketchup::Face).each do |f|
        b = f.bounds
        in_key = keys.any? { |kx0, kx1, kz0, kz1| b.min.x >= kx0 - tol && b.max.x <= kx1 + tol && b.min.z >= kz0 - tol && b.max.z <= kz1 + tol }
        f.material = in_key && b.min.y < -PLATE_DEPTH_MM.mm - tol ? key : plate
      end
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
