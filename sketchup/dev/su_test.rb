# In-SketchUp check for the Aparataj Azimut extension.
# From the Ruby console (or the MCP eval_ruby tool):
#   load '<repo>/sketchup/dev/su_test.rb'; AzTest.demo
# Builds an L-shaped test room in a group and places 8 assemblies through the real placement tool.
module AzTest
  EXT = File.expand_path('../azimut_aparataj', __dir__)

  PROPS = {
    'bticino' => { 'moduleWidth1M' => 8.5, 'moduleHeight' => 31, 'sideMargin' => 10.5, 'topMargin' => 0, 'bottomMargin' => 0 },
    'gewiss' => { 'moduleWidth1M' => 40, 'moduleHeight' => 80, 'sideMargin' => 50, 'topMargin' => 45, 'bottomMargin' => 45 },
    'schneider' => { 'moduleWidth1M' => 8.5, 'moduleHeight' => 31, 'sideMargin' => 10.5, 'topMargin' => 0, 'bottomMargin' => 0 },
  }.freeze
  MOD_SIZE = { 'schuko' => 2, 'italian' => 1, 'usb' => 1, 'switch_simple' => 1, 'switch_stair' => 1, 'switch_cross' => 1,
               'dimmer' => 2, 'blank' => 1, 'coax' => 1, 'rj45' => 1 }.freeze

  def self.reload
    %w[geometry placement_tool main].each { |f| load "#{EXT}/#{f}.rb" }
  end

  def self.payload(project, system, sid, code, type, room, size, color, hex, mods, height, mod_sizes = {})
    { 'projectId' => project, 'sketchupId' => sid, 'code' => code, 'type' => type, 'room' => room,
      'system' => system, 'proportions' => PROPS[system], 'size' => size, 'color' => color, 'colorHex' => hex,
      'wallBoxType' => 'masonry', 'mountHeightMm' => height,
      'modules' => mods.map { |m| { 'moduleId' => m, 'size' => mod_sizes[m] || MOD_SIZE[m], 'standardType' => m, 'name' => m } } }
  end

  # Wall A along X (inner face y=100), wall B along Y (inner face x=100), floor; 2700 high, inside a group.
  def self.build_room
    model = Sketchup.active_model
    model.start_operation('Cameră test', true)
    g = model.active_entities.add_group
    g.name = 'Cameră test'
    e = g.entities
    [[[0, 0], [5000, 0], [5000, 4000], [0, 4000], 0],
     [[0, 0], [5000, 0], [5000, 100], [0, 100], 2700],
     [[0, 100], [100, 100], [100, 4000], [0, 4000], 2700]].each do |*pts, up|
      f = e.add_face(pts.map { |x, y| [x.mm, y.mm, 0] })
      f.reverse! if f.normal.z < 0
      f.pushpull(up.mm) if up > 0
    end
    model.commit_operation
    g
  end

  def self.look(eye, target)
    view = Sketchup.active_model.active_view
    view.camera = Sketchup::Camera.new(eye, target, Z_AXIS, true, 55)
    view.refresh
  end

  # Drives the real placement tool: hover a wall point, optionally type a height, click.
  def self.place_with_tool(payload, wall_point, typed_height = nil, click = true)
    model = Sketchup.active_model
    view = model.active_view
    tool = AzimutAparataj::PlacementTool.new(payload)
    model.select_tool(tool)
    sx, sy = view.screen_coords(wall_point).to_a
    tool.onMouseMove(0, sx, sy, view)
    tool.onUserText(typed_height.to_s, view) if typed_height
    hit = tool.instance_variable_get(:@hit)
    tool.onLButtonDown(0, sx, sy, view) if click
    hit && { left: hit[:left]&.to_mm&.round, right: hit[:right]&.to_mm&.round, center_z: hit[:center].z.to_mm.round }
  end

  def self.demo
    reload
    build_room
    look([5600.mm, 4600.mm, 1900.mm], [1500.mm, 1100.mm, 800.mm])
    wa = ->(x, z = 1200) { Geom::Point3d.new(x.mm, 100.mm, z.mm) }
    wb = ->(y, z = 1200) { Geom::Point3d.new(100.mm, y.mm, z.mm) }
    w = '#FFFFFF'
    hits = {
      'BT P01' => place_with_tool(payload('demo-bt', 'bticino', 'bt-p01', 'P01', 'outlet', 'Bucătărie', 4, 'white', w, %w[schuko schuko], 1100), wa.(1500)),
      'BT P02' => place_with_tool(payload('demo-bt', 'bticino', 'bt-p02', 'P02', 'outlet', 'Bucătărie', 3, 'white', w, %w[schuko usb], 1100), wa.(2100), 1050),
      'BT I01' => place_with_tool(payload('demo-bt', 'bticino', 'bt-i01', 'I01', 'switch', 'Hol', 2, 'white', w, %w[switch_simple blank], 1100), wb.(700)),
      'BT I02' => place_with_tool(payload('demo-bt', 'bticino', 'bt-i02', 'I02', 'switch', 'Living', 3, 'black', '#1a1a1a', %w[switch_simple switch_stair dimmer], 1100, 'dimmer' => 1), wb.(1100)),
      'GW P01' => place_with_tool(payload('demo-gw', 'gewiss', 'gw-p01', 'P01', 'outlet', 'Dormitor', 3, 'titanium', '#8C8C8C', %w[schuko usb], 300), wb.(2000, 600)),
      'GW P02' => place_with_tool(payload('demo-gw', 'gewiss', 'gw-p02', 'P02', 'outlet', 'Dormitor', 2, 'white', w, %w[rj45 coax], 300), wb.(2500, 600)),
      'SN P01' => place_with_tool(payload('demo-sn', 'schneider', 'sn-p01', 'P01', 'outlet', 'Living', 4, 'anthracite', '#383838', %w[schuko schuko], 300), wa.(3300, 600)),
      'SN I01' => place_with_tool(payload('demo-sn', 'schneider', 'sn-i01', 'I01', 'switch', 'Living', 2, 'white', w, %w[switch_cross], 1100, 'switch_cross' => 2), wa.(3300)),
    }
    raise "no wall hit: #{hits.select { |_, h| h.nil? }.keys.join(', ')}" if hits.values.any?(&:nil?)
    raise 'BT P01 clearances wrong' unless hits['BT P01'] == { left: 3428, right: 1327, center_z: 1100 }
    raise 'typed height ignored' unless hits['BT P02'][:center_z] == 1050

    items = AzimutAparataj.model_items('demo-bt')
    raise "expected 4 BTicino items, got #{items.size}" unless items.size == 4

    hits
  end
end
