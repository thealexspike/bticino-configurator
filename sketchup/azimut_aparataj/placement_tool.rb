module AzimutAparataj
  # Follows the cursor on a vertical face and shows the clearances, to place a new assembly (payload)
  # or move one already in the model (instance).
  # Height = plate axis above the bottom of the wall face. Near a snap height it sticks to it;
  # a typed value in mm fixes the height instead.
  class PlacementTool
    SNAP_MM = 40 # how close to a snap height the cursor has to be to stick

    def initialize(payload, instance = nil)
      @payload = payload
      @instance = instance
      if instance
        bb = instance.definition.bounds
        @w = bb.width
        @h = bb.depth
        @label = instance.name
        standard = DEFAULT_HEIGHTS[instance.definition.get_attribute(DICT, 'type')] || DEFAULT_HEIGHTS['outlet']
        @snaps = [AzimutAparataj.mount_height_mm(instance), standard].compact.uniq # current height first
      else
        d = Geometry.dims(payload)
        @w = d[:w].mm
        @h = d[:h].mm
        @label = payload['code']
        @snaps = [(payload['snapHeightMm'] || payload['mountHeightMm'] || DEFAULT_HEIGHTS['outlet']).to_f]
      end
      @height_mm = @snaps.first
      @locked = false
      @ip = Sketchup::InputPoint.new
      @hit = nil
    end

    def activate
      Sketchup.vcb_label = 'Înălțime ax (mm)'
      Sketchup.vcb_value = @height_mm.round.to_s
      verb = @instance ? 'muți' : 'plasezi'
      Sketchup.status_text = "#{@label}: click pe perete ca să #{verb}; se prinde de #{@snaps.map(&:round).join(' / ')} mm. " \
                             'Tastează o înălțime în mm ca s-o fixezi. Esc = renunță.'
      return unless @instance && !@moving

      # Hidden while it moves, so it doesn't cover the wall behind it; aborting the operation undoes that
      @moving = true
      Sketchup.active_model.start_operation('Mută aparataj', true)
      @instance.hidden = true
    end

    def resume(view)
      activate
      view.invalidate
    end

    def deactivate(view)
      Sketchup.active_model.abort_operation if @moving
      @moving = false
      view.invalidate
    end

    def onCancel(_reason, _view)
      Sketchup.active_model.select_tool(nil)
    end

    def onMouseMove(_flags, x, y, view)
      @ip.pick(view, x, y)
      @hit = wall_hit(view)
      view.invalidate
    end

    def onUserText(text, view)
      value = Float(text.delete('m').strip.tr(',', '.')) rescue nil
      return UI.beep unless value && value >= 0

      @height_mm = value
      @locked = true
      Sketchup.vcb_value = value.round.to_s
      @hit = wall_hit(view) if @hit
      view.invalidate
    end

    def onLButtonDown(_flags, _x, _y, _view)
      return UI.beep unless @hit

      if @instance
        @instance.hidden = false
        AzimutAparataj.move_instance(@instance, @hit)
        @moving = false
        Sketchup.active_model.commit_operation
      else
        AzimutAparataj.place_instance(@payload, @hit)
      end
      Sketchup.active_model.select_tool(nil)
    end

    def getExtents
      bb = Geom::BoundingBox.new
      bb.add(@hit[:center]) if @hit
      bb
    end

    def draw(view)
      @ip.draw(view) if @ip.display?
      return unless @hit

      c = @hit[:center]
      x = @hit[:xaxis]
      corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map { |sx, sz| along(along(c, x, sx * @w / 2), Z_AXIS, sz * @h / 2) }
      view.line_stipple = ''
      view.line_width = 2
      view.drawing_color = @hit[:snapped] ? 'ForestGreen' : 'DarkOrange'
      view.draw(GL_LINE_LOOP, corners)

      view.line_width = 1
      view.line_stipple = '-'
      floor = Geom::Point3d.new(c.x, c.y, @hit[:floor_z])
      ceiling = Geom::Point3d.new(c.x, c.y, @hit[:ceiling_z])
      bottom = along(c, Z_AXIS, -@h / 2)
      top = along(c, Z_AXIS, @h / 2)
      view.draw(GL_LINES, [bottom, floor, top, ceiling])
      label(view, along(floor, Z_AXIS, (bottom.z - floor.z) / 2), "ax #{mm(c.z - floor.z)}#{' (fixat)' if @locked}#{' (standard)' if @hit[:snapped] && !@locked}")
      label(view, along(top, Z_AXIS, (ceiling.z - top.z) / 2), "sus #{mm(ceiling.z - top.z)}")
      [[@hit[:left], -1], [@hit[:right], 1]].each do |gap, side|
        next unless gap

        edge = along(c, x, side * @w / 2)
        wall_end = along(c, x, side * (@w / 2 + gap))
        view.draw(GL_LINES, [edge, wall_end])
        label(view, Geom.linear_combination(0.5, edge, 0.5, wall_end), mm(gap))
      end
    end

    private

    def wall_hit(view)
      face = @ip.face
      return nil unless face
      return nil if face.parent.is_a?(Sketchup::ComponentDefinition) && face.parent.attribute_dictionary(DICT)

      tr = @ip.transformation
      n = face.normal.transform(tr)
      return nil if n.length.zero? || n.normalize.z.abs > 0.1 # walls only

      normal = Geom::Vector3d.new(n.x, n.y, 0).normalize
      normal.reverse! if normal % view.camera.direction > 0
      plane = [tr * face.vertices.first.position, normal]
      pos = @ip.position.project_to_plane(plane)
      zs = face.outer_loop.vertices.map { |v| (tr * v.position).z }
      target = @locked ? @height_mm : @snaps.min_by { |s| (pos.z - zs.min - s.mm).abs }
      standard_z = zs.min + target.mm
      snapped = @locked || (pos.z - standard_z).abs < SNAP_MM.mm
      center = Geom::Point3d.new(pos.x, pos.y, snapped ? standard_z : pos.z)
      xaxis = Z_AXIS * normal
      left, right = edge_gaps(face, tr, center, xaxis)
      { center: center, normal: normal, xaxis: xaxis, floor_z: zs.min, ceiling_z: zs.max, left: left, right: right, snapped: snapped }
    end

    # Clear distance from the plate's sides to the face boundary, along the plate's horizontal axis.
    def edge_gaps(face, tr, center, xaxis)
      dists = face.outer_loop.edges.filter_map do |e|
        a = tr * e.start.position
        b = tr * e.end.position
        pt = Geom.intersect_line_line([center, xaxis], [a, b])
        next unless pt && pt.distance(a) + pt.distance(b) <= a.distance(b) + 0.01

        (pt - center) % xaxis
      end
      left = dists.select(&:negative?).max
      right = dists.select(&:positive?).min
      [left && (-left - @w / 2), right && (right - @w / 2)]
    end

    def along(point, unit_vector, length)
      point + Geom::Vector3d.new(unit_vector.x * length, unit_vector.y * length, unit_vector.z * length)
    end

    def label(view, point, text)
      view.draw_text(view.screen_coords(point), text, size: 11, color: Sketchup::Color.new('DarkOrange'))
    end

    def mm(length)
      "#{length.to_mm.round} mm"
    end
  end

  # Toolbar "move": click an assembly in the model, then it follows the placement preview.
  class MoveTool
    def activate
      Sketchup.status_text = 'Click pe aparatul pe care vrei să-l muți. Esc = renunță.'
    end

    def onCancel(_reason, _view)
      Sketchup.active_model.select_tool(nil)
    end

    def onLButtonDown(_flags, x, y, view)
      inst = AzimutAparataj.picked_instance(view, x, y)
      return UI.beep unless inst

      Sketchup.active_model.select_tool(PlacementTool.new(nil, inst))
    end
  end
end
