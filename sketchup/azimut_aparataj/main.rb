require 'json'
require 'securerandom'
require_relative 'geometry'
require_relative 'placement_tool'

# The panel is the configurator web app itself, loaded in an HtmlDialog. It talks to this file through
# window.sketchup.<callback>(json); see src/sketchup.js in the app for the other side of the contract.
module AzimutAparataj
  PREFS = 'AzimutAparataj'.freeze
  DEFAULT_URL = 'https://configurator.atelierazimut.com'.freeze
  TAGS = { 'outlet' => 'Aparataj - Prize', 'switch' => 'Aparataj - Întrerupătoare' }.freeze

  def self.app_url
    Sketchup.read_default(PREFS, 'app_url', DEFAULT_URL)
  end

  def self.ask_app_url
    input = UI.inputbox(['Adresa aplicației'], [app_url], 'Aparataj Azimut')
    return unless input

    Sketchup.write_default(PREFS, 'app_url', input[0].strip)
    @dialog&.set_url(app_url)
  end

  def self.show_dialog
    @dialog ||= create_dialog
    @dialog.visible? ? @dialog.bring_to_front : @dialog.show
  end

  def self.create_dialog
    dialog = UI::HtmlDialog.new(dialog_title: 'Aparataj Azimut', preferences_key: PREFS,
                                width: 560, height: 820, style: UI::HtmlDialog::STYLE_DIALOG)
    dialog.add_action_callback('placeAssembly') { |_ctx, json| safely { place_assembly(JSON.parse(json)) } }
    dialog.add_action_callback('deleteAssembly') { |_ctx, json| safely { delete_assembly(JSON.parse(json)) } }
    dialog.add_action_callback('requestModelAssemblies') { |_ctx, json| safely { send_model_items(JSON.parse(json)['projectId']) } }
    dialog.add_action_callback('syncDone') { |_ctx, json| safely { apply_codes(JSON.parse(json)) } }
    # After the callbacks: SketchUp 2026 only exposes the ones registered before the first set_url
    dialog.set_url(app_url)
    dialog
  end

  def self.safely
    yield
  rescue StandardError => e
    puts e.full_message
    UI.messagebox("Aparataj Azimut: #{e.message}")
  end

  # Rebuild the instance already linked to this assembly, or start placing a new one.
  def self.place_assembly(payload)
    linked = instances_of(payload['projectId'], payload['sketchupId'])
    return Sketchup.active_model.select_tool(PlacementTool.new(payload)) if linked.empty?

    model = Sketchup.active_model
    model.start_operation('Actualizează aparataj', true)
    defn = Geometry.definition_for(model, payload)
    linked.each do |inst, world|
      inst.definition = defn
      write_instance(inst, payload)
      floor_z = inst.get_attribute(DICT, 'floor_z')
      next unless floor_z

      dz = floor_z + payload['mountHeightMm'].to_f.mm - world.origin.z
      inst.transform!(Geom::Transformation.translation([0, 0, dz])) if dz.abs > 0.5.mm
    end
    model.commit_operation
  end

  def self.place_instance(payload, hit)
    model = Sketchup.active_model
    model.start_operation('Plasează aparataj', true)
    defn = Geometry.definition_for(model, payload)
    world = Geom::Transformation.axes(hit[:center], hit[:xaxis], hit[:normal].reverse, Z_AXIS)
    inst = model.active_entities.add_instance(defn, model.edit_transform.inverse * world)
    write_instance(inst, payload)
    inst.set_attribute(DICT, 'floor_z', hit[:floor_z].to_f)
    model.commit_operation
  end

  def self.delete_assembly(data)
    linked = instances_of(data['projectId'], data['sketchupId'])
    return if linked.empty?

    model = Sketchup.active_model
    model.start_operation('Șterge aparataj', true)
    linked.each { |inst, _| inst.erase! if inst.valid? }
    model.commit_operation
  end

  def self.send_model_items(project_id)
    items = model_items(project_id)
    @dialog&.execute_script("window.azimutSketchup && window.azimutSketchup.onModelAssemblies(#{JSON.generate(items)})")
  end

  # Every instance of the project, as the app expects it. Copies made in SketchUp get their own id first.
  def self.model_items(project_id)
    model = Sketchup.active_model
    model.start_operation('Sincronizează aparataj', true)
    seen = {}
    items = instances_of(project_id).sort_by { |inst, _| inst.persistent_id }.map do |inst, world|
      id = inst.get_attribute(DICT, 'sketchup_id')
      if seen[id]
        id = SecureRandom.uuid
        inst.set_attribute(DICT, 'sketchup_id', id)
      end
      seen[id] = true
      defn = inst.definition
      floor_z = inst.get_attribute(DICT, 'floor_z')
      {
        sketchupId: id,
        type: defn.get_attribute(DICT, 'type'),
        room: inst.get_attribute(DICT, 'room'),
        size: defn.get_attribute(DICT, 'size'),
        color: defn.get_attribute(DICT, 'color'),
        wallBoxType: defn.get_attribute(DICT, 'wall_box_type'),
        mountHeightMm: floor_z && (world.origin.z - floor_z).to_mm.round,
        modules: JSON.parse(defn.get_attribute(DICT, 'modules') || '[]'),
      }
    end
    model.commit_operation
    items
  end

  def self.apply_codes(data)
    codes = data['codes'].to_h { |c| [c['sketchupId'], c['code']] }
    model = Sketchup.active_model
    model.start_operation('Coduri aparataj', true)
    instances_of(data['projectId']).each do |inst, _|
      code = codes[inst.get_attribute(DICT, 'sketchup_id')]
      next unless code

      inst.set_attribute(DICT, 'code', code)
      inst.name = code
    end
    model.commit_operation
  end

  def self.write_instance(inst, payload)
    { 'sketchup_id' => payload['sketchupId'], 'project_id' => payload['projectId'],
      'code' => payload['code'], 'room' => payload['room'] }.each { |k, v| inst.set_attribute(DICT, k, v) }
    inst.name = payload['code'].to_s
    inst.layer = inst.model.layers.add(TAGS[payload['type']] || TAGS['outlet'])
  end

  # [instance, world transformation] pairs for the project; instances may sit inside groups.
  def self.instances_of(project_id, sketchup_id = nil)
    found = []
    walk = lambda do |entities, tr|
      entities.each do |e|
        next unless e.is_a?(Sketchup::ComponentInstance) || e.is_a?(Sketchup::Group)

        world = tr * e.transformation
        if e.is_a?(Sketchup::ComponentInstance) && e.definition.attribute_dictionary(DICT)
          found << [e, world] if e.get_attribute(DICT, 'project_id') == project_id && found.none? { |i, _| i == e }
        else
          walk.(e.definition.entities, world)
        end
      end
    end
    walk.(Sketchup.active_model.entities, IDENTITY)
    sketchup_id ? found.select { |inst, _| inst.get_attribute(DICT, 'sketchup_id') == sketchup_id } : found
  end

  unless file_loaded?(__FILE__)
    menu = UI.menu('Extensions').add_submenu('Aparataj Azimut')
    menu.add_item('Deschide panoul') { show_dialog }
    menu.add_item('Adresa aplicației...') { ask_app_url }
    file_loaded(__FILE__)
  end
end
