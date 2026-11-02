require 'sketchup.rb'
require 'extensions.rb'

module AzimutAparataj
  unless file_loaded?(__FILE__)
    ex = SketchupExtension.new('Aparataj Azimut', File.join(__dir__, 'azimut_aparataj', 'main'))
    ex.description = 'Plasează ansamblurile din configuratorul de aparataj pe pereți și sincronizează necesarul.'
    ex.version = '0.2.0'
    ex.creator = 'Atelier Azimut'
    Sketchup.register_extension(ex, true)
    file_loaded(__FILE__)
  end
end
