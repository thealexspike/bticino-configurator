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
  DEFAULT_HEIGHTS = { 'outlet' => 300.0, 'switch' => 1100.0 }.freeze # same as DEFAULT_MOUNT_HEIGHT_MM in the app

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
    dialog.add_action_callback('updateAssemblies') { |_ctx, json| safely { update_assemblies(JSON.parse(json)) } }
    dialog.add_action_callback('setActiveProject') { |_ctx, json| safely { activate_project(JSON.parse(json)['projectId']) } }
    # Reopening a closed dialog reloads the page without the callbacks, so a closed one is dropped and
    # the next show builds a fresh one
    dialog.set_on_closed do
      @dialog = nil
      @project_id = nil
    end
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
    rebuild(model, payload, linked)
    model.commit_operation
  end

  # Edits made in the app, pushed on their own: rebuild what is in the model, never start a placement.
  def self.update_assemblies(payloads)
    model = Sketchup.active_model
    model.start_operation('Actualizează aparataj', true)
    payloads.each { |payload| rebuild(model, payload, instances_of(payload['projectId'], payload['sketchupId'])) }
    model.commit_operation
  end

  def self.rebuild(model, payload, linked)
    return if linked.empty?

    defn = Geometry.definition_for(model, payload)
    linked.each do |inst, world|
      inst.definition = defn
      write_instance(inst, payload)
      floor_z = inst.get_attribute(DICT, 'floor_z')
      next unless floor_z && payload['mountHeightMm'] # no height set in the app: stays where it was placed

      dz = floor_z + payload['mountHeightMm'].to_f.mm - world.origin.z
      inst.transform!(Geom::Transformation.translation([0, 0, dz])) if dz.abs > 0.5.mm
    end
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

  # Called inside the move tool's operation.
  def self.move_instance(inst, hit)
    world = Geom::Transformation.axes(hit[:center], hit[:xaxis], hit[:normal].reverse, Z_AXIS)
    parent = world_of(inst) * inst.transformation.inverse # the groups it sits in
    inst.transformation = parent.inverse * world
    inst.set_attribute(DICT, 'floor_z', hit[:floor_z].to_f)
  end

  def self.world_of(inst)
    instances_of(inst.get_attribute(DICT, 'project_id')).find { |i, _| i == inst }&.last || inst.transformation
  end

  # Plate axis and room-facing normal of every placed assembly (any project), to snap to them.
  def self.assembly_axes(except = nil)
    instances_of(nil).filter_map do |inst, world|
      next if inst == except

      { center: world.origin, normal: world.yaxis.reverse.normalize }
    end
  end

  def self.mount_height_mm(inst)
    floor_z = inst.get_attribute(DICT, 'floor_z')
    floor_z && (world_of(inst).origin.z - floor_z).to_mm.round.to_f
  end

  # Our assembly under the cursor, even inside groups.
  def self.picked_instance(view, x, y)
    ph = view.pick_helper
    ph.do_pick(x, y)
    (0...ph.count).each do |i|
      found = ph.path_at(i).find { |e| e.is_a?(Sketchup::ComponentInstance) && e.definition.attribute_dictionary(DICT) }
      return found if found
    end
    nil
  end

  # Toolbar move: straight into the preview when one of ours is selected, otherwise pick it first.
  def self.start_move
    model = Sketchup.active_model
    sel = model.selection.grep(Sketchup::ComponentInstance).find { |e| e.definition.attribute_dictionary(DICT) }
    model.select_tool(sel ? PlacementTool.new(nil, sel) : MoveTool.new)
  end

  # Toolbar new outlet / switch: the app adds it to the open project (preset dialog), then placement starts.
  def self.new_assembly(type)
    show_dialog
    return UI.messagebox('Deschide întâi un proiect în panoul Aparataj Azimut, apoi apasă din nou.') unless @project_id

    @dialog.execute_script("window.azimutSketchup && window.azimutSketchup.newAssembly('#{type}')")
  end

  def self.delete_assembly(data)
    linked = instances_of(data['projectId'], data['sketchupId'])
    return if linked.empty?

    model = Sketchup.active_model
    model.start_operation('Șterge aparataj', true)
    linked.each { |inst, _| inst.erase! if inst.valid? }
    model.commit_operation
  end

  # Manual sync (the app's button): always answers, and the app may propose deleting what is gone.
  # Auto sync (after every model change): only when the project's instances changed; the app never deletes.
  def self.send_model_items(project_id, auto: false)
    json = JSON.generate(model_items(project_id))
    return if auto && json == @last_sent

    @last_sent = json
    @dialog&.execute_script("window.azimutSketchup && window.azimutSketchup.onModelAssemblies(#{json}, #{auto})")
  end

  # The project open in the panel; nil when the app leaves it.
  def self.activate_project(project_id)
    @project_id = project_id
    @last_sent = nil
    watch(Sketchup.active_model)
    schedule_sync
  end

  def self.watch(model)
    @watched ||= {}
    return if @watched[model]

    @watched[model] = true
    model.add_observer(ModelWatcher.new)
  end

  # Debounced: a copy-paste or a move fires several commits in a row.
  # ponytail: walks the whole model on each change; watch only our instances if big models get slow.
  def self.schedule_sync
    return unless @project_id && @dialog&.visible? && !@sync_pending

    @sync_pending = true
    UI.start_timer(0.4, false) do
      @sync_pending = false
      safely { send_model_items(@project_id, auto: true) if @project_id }
    end
  end

  class ModelWatcher < Sketchup::ModelObserver
    def onTransactionCommit(_model)
      AzimutAparataj.schedule_sync
    end

    def onTransactionUndo(_model)
      AzimutAparataj.schedule_sync
    end

    def onTransactionRedo(_model)
      AzimutAparataj.schedule_sync
    end
  end

  class AppWatcher < Sketchup::AppObserver
    def onNewModel(model)
      AzimutAparataj.watch(model)
    end

    def onOpenModel(model)
      AzimutAparataj.watch(model)
    end
  end

  # Every instance of the project, as the app expects it. Copies made in SketchUp get their own id first.
  def self.model_items(project_id)
    model = Sketchup.active_model
    pairs = instances_of(project_id).sort_by { |inst, _| inst.persistent_id }
    seen = {}
    copies = pairs.select do |inst, _|
      id = inst.get_attribute(DICT, 'sketchup_id')
      seen[id] ? true : !(seen[id] = true)
    end
    unless copies.empty?
      model.start_operation('Sincronizează aparataj', true, false, true)
      copies.each { |inst, _| inst.set_attribute(DICT, 'sketchup_id', SecureRandom.uuid) }
      model.commit_operation
    end

    pairs.map do |inst, world|
      defn = inst.definition
      floor_z = inst.get_attribute(DICT, 'floor_z')
      {
        sketchupId: inst.get_attribute(DICT, 'sketchup_id'),
        type: defn.get_attribute(DICT, 'type'),
        room: inst.get_attribute(DICT, 'room'),
        size: defn.get_attribute(DICT, 'size'),
        color: defn.get_attribute(DICT, 'color'),
        wallBoxType: defn.get_attribute(DICT, 'wall_box_type'),
        mountHeightMm: floor_z && (world.origin.z - floor_z).to_mm.round,
        modules: JSON.parse(defn.get_attribute(DICT, 'modules') || '[]'),
      }
    end
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

  # [instance, world transformation] pairs for the project (nil: every project); instances may sit inside groups.
  def self.instances_of(project_id, sketchup_id = nil)
    found = []
    walk = lambda do |entities, tr|
      entities.each do |e|
        next unless e.is_a?(Sketchup::ComponentInstance) || e.is_a?(Sketchup::Group)

        world = tr * e.transformation
        if e.is_a?(Sketchup::ComponentInstance) && e.definition.attribute_dictionary(DICT)
          found << [e, world] if (project_id.nil? || e.get_attribute(DICT, 'project_id') == project_id) && found.none? { |i, _| i == e }
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

    toolbar = UI::Toolbar.new('Aparataj Azimut')
    [
      ['Deschide aplicația de aparataje', 'panel', -> { show_dialog }],
      ['Mută un aparat', 'move', -> { start_move }],
      ['Priză nouă', 'outlet', -> { new_assembly('outlet') }],
      ['Întrerupător nou', 'switch', -> { new_assembly('switch') }],
    ].each do |tip, icon, action|
      cmd = UI::Command.new(tip) { safely { action.call } }
      cmd.tooltip = tip
      cmd.small_icon = cmd.large_icon = File.join(__dir__, 'icons', "#{icon}.svg")
      toolbar.add_item(cmd)
    end
    toolbar.get_last_state == TB_NEVER_SHOWN ? toolbar.show : toolbar.restore

    Sketchup.add_observer(AppWatcher.new)
    file_loaded(__FILE__)
  end
end
