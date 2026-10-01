import React, { useState } from 'react';
import { Plus, Trash2, ChevronLeft, Package, Zap, Settings } from 'lucide-react';
import { PriceInput } from './PriceInput';
import { GraphicPicker } from './GraphicPicker';
import { FRAME_SIZES, SYSTEMS } from '../data/libraries';
import { getModuleGraphic } from '../graphics/moduleGraphics';
import { useTranslation, useLanguage } from '../i18n';
import { getAvailableColors, getAvailableSizes, buildColorObj, getColorName, getModuleName } from '../lib/library';
import { VAT_RATE, calcPriceWithVat, calcMarkupFromPriceWithVat, calcMarkupFromPriceWithoutVat, calcPriceWithVatFromWithout } from '../lib/pricing';

export function LibraryPage({ library, onUpdate, onBack, isAdmin = false, onSwitchSystem }) {
  const [activeTab, setActiveTab] = useState('modules');
  const [editingModule, setEditingModule] = useState(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showAddPreset, setShowAddPreset] = useState(false);
  const [editingColorId, setEditingColorId] = useState(null);
  const [pendingColorHex, setPendingColorHex] = useState('');
  const [originalColorHex, setOriginalColorHex] = useState('');
  const t = useTranslation();
  const lang = useLanguage();

  // Protect updates - non-admins cannot modify
  const safeOnUpdate = isAdmin ? onUpdate : () => {};

  // New module form state
  const [newModule, setNewModule] = useState({
    id: '',
    graphic: '',
    moduleHasColorVariants: false,
    faceHasColorVariants: true,
    moduleSku: '',
    nameEn: '',
    nameRo: '',
    size: 1,
    category: 'outlet',
    faceSku: {},
    modulePurchasePrice: 0,
    moduleMarkup: 25,
    modulePrice: 0,
    facePurchasePrice: {},
    faceMarkup: {},
    facePrice: {},
  });

  // New preset form state
  const [newPreset, setNewPreset] = useState({
    id: '',
    nameEn: '',
    nameRo: '',
    type: 'outlet',
    size: 2,
    modules: [],
  });

  const updateWallBoxMasonry = (size, field, value) => {
    const currentItem = library.wallBoxesMasonry?.[size] || {};
    safeOnUpdate({
      ...library,
      wallBoxesMasonry: {
        ...library.wallBoxesMasonry,
        [size]: {
          ...currentItem,
          [field]: field === 'price' ? parseFloat(value) || 0 : value,
        },
      },
    });
  };

  const updateWallBoxDrywall = (size, field, value) => {
    const currentItem = library.wallBoxesDrywall?.[size] || {};
    safeOnUpdate({
      ...library,
      wallBoxesDrywall: {
        ...library.wallBoxesDrywall,
        [size]: {
          ...currentItem,
          [field]: field === 'price' ? parseFloat(value) || 0 : value,
        },
      },
    });
  };

  const updateInstallFace = (size, field, value) => {
    safeOnUpdate({
      ...library,
      installFaces: {
        ...library.installFaces,
        [size]: {
          ...library.installFaces[size],
          [field]: field === 'price' ? parseFloat(value) || 0 : value,
        },
      },
    });
  };

  const updateDecorFace = (key, field, value) => {
    safeOnUpdate({
      ...library,
      decorFaces: {
        ...library.decorFaces,
        [key]: {
          ...library.decorFaces[key],
          [field]: field === 'price' ? parseFloat(value) || 0 : value,
        },
      },
    });
  };

  const updateModule = (moduleId, updates) => {
    safeOnUpdate({
      ...library,
      modules: library.modules.map(m => 
        m.id === moduleId ? { ...m, ...updates } : m
      ),
    });
  };

  const addModule = () => {
    if (!newModule.id.trim() || !newModule.nameEn.trim()) {
      alert(t.enterIdAndName);
      return;
    }
    if (library.modules.some(m => m.id === newModule.id)) {
      alert(t.moduleIdExists);
      return;
    }
    safeOnUpdate({
      ...library,
      modules: [...library.modules, { ...newModule, graphic: newModule.graphic || undefined }],
    });
    setNewModule({
      id: '',
      graphic: '',
      moduleHasColorVariants: false,
      faceHasColorVariants: true,
      moduleSku: '',
      nameEn: '',
      nameRo: '',
      size: 1,
      category: 'outlet',
      faceSku: { white: '', black: '' },
      modulePurchasePrice: 0,
      moduleMarkup: 25,
      modulePrice: 0,
      facePurchasePrice: { white: 0, black: 0 },
      faceMarkup: { white: 25, black: 25 },
      facePrice: { white: 0, black: 0 },
    });
    setShowAddModule(false);
  };

  const deleteModule = (moduleId) => {
    safeOnUpdate({
      ...library,
      modules: library.modules.filter(m => m.id !== moduleId),
    });
    setConfirmDeleteId(null);
  };

  // Preset functions
  const addPreset = () => {
    if (!newPreset.id.trim() || !newPreset.nameEn.trim()) {
      alert(t.enterIdAndName);
      return;
    }
    if (library.presets?.some(p => p.id === newPreset.id)) {
      alert('A preset with this ID already exists');
      return;
    }
    safeOnUpdate({
      ...library,
      presets: [...(library.presets || []), { ...newPreset }],
    });
    setNewPreset({
      id: '',
      nameEn: '',
      nameRo: '',
      type: 'outlet',
      size: 2,
      modules: [],
    });
    setShowAddPreset(false);
  };

  const deletePreset = (presetId) => {
    safeOnUpdate({
      ...library,
      presets: (library.presets || []).filter(p => p.id !== presetId),
    });
    setConfirmDeleteId(null);
  };

  const getPresetName = (preset) => lang === 'ro' ? (preset.nameRo || preset.nameEn) : preset.nameEn;
  const getModuleNameById = (moduleId) => {
    const mod = library.modules?.find(m => m.id === moduleId);
    if (!mod) return moduleId;
    return lang === 'ro' ? (mod.nameRo || mod.nameEn) : mod.nameEn;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-blue-600 mb-4 hover:text-blue-800"
      >
        <ChevronLeft className="w-4 h-4" /> {t.backToProjects}
      </button>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="w-6 h-6" /> {t.componentLibrary}
            </h1>
            <p className="text-gray-600">{t.manageSKUs}</p>
          </div>
          {isAdmin && onSwitchSystem && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">{t.editingSystem}:</label>
              <select
                value={library.systemId || 'bticino'}
                onChange={(e) => onSwitchSystem(e.target.value)}
                className="border rounded px-3 py-2 bg-white font-medium"
              >
                {SYSTEMS.map(sys => (
                  <option key={sys.id} value={sys.id}>{lang === 'ro' ? sys.nameRo : sys.nameEn}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        {!isAdmin && (
          <div className="mt-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded text-sm">
            🔒 {lang === 'ro' ? 'Vizualizare doar. Doar conturile @atelierazimut.com pot edita biblioteca.' : 'View only. Only @atelierazimut.com accounts can edit the library.'}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setActiveTab('colors')}
          className={`px-4 py-2 rounded ${activeTab === 'colors' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          🎨 {t.manageColors}
        </button>
        <button
          onClick={() => setActiveTab('modules')}
          className={`px-4 py-2 rounded ${activeTab === 'modules' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          {t.modules}
        </button>
        <button
          onClick={() => setActiveTab('wallboxes')}
          className={`px-4 py-2 rounded ${activeTab === 'wallboxes' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          {t.wallBoxes}
        </button>
        <button
          onClick={() => setActiveTab('installfaces')}
          className={`px-4 py-2 rounded ${activeTab === 'installfaces' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          {t.installFaces}
        </button>
        <button
          onClick={() => setActiveTab('decorfaces')}
          className={`px-4 py-2 rounded ${activeTab === 'decorfaces' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          {t.decorFacesTab}
        </button>
        <button
          onClick={() => setActiveTab('presets')}
          className={`px-4 py-2 rounded ${activeTab === 'presets' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
        >
          {t.presets}
        </button>
      </div>

      {/* Presets Tab */}
      {activeTab === 'presets' && (
        <div className="bg-white rounded-lg shadow">
          <div className="flex justify-between items-center p-4 border-b">
            <div>
              <h2 className="font-semibold">{t.presets}</h2>
              <p className="text-sm text-gray-500">{t.presetsDescription}</p>
            </div>
            {isAdmin && (
            <button
              onClick={() => setShowAddPreset(true)}
              className="bg-purple-600 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" /> {t.addPreset}
            </button>
            )}
          </div>

          {/* Add Preset Form */}
          {showAddPreset && (
            <div className="p-4 bg-purple-50 border-b">
              <h3 className="font-medium mb-3">{t.addPreset}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">ID</label>
                  <input
                    type="text"
                    value={newPreset.id}
                    onChange={(e) => setNewPreset({ ...newPreset, id: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                    placeholder="e.g., triple_outlet"
                    className="w-full border rounded px-2 py-1 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">🇬🇧 {t.presetName} (EN)</label>
                  <input
                    type="text"
                    value={newPreset.nameEn}
                    onChange={(e) => setNewPreset({ ...newPreset, nameEn: e.target.value })}
                    placeholder="e.g., Triple Outlet"
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">🇷🇴 {t.presetName} (RO)</label>
                  <input
                    type="text"
                    value={newPreset.nameRo}
                    onChange={(e) => setNewPreset({ ...newPreset, nameRo: e.target.value })}
                    placeholder="ex: Priză Triplă"
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">{t.presetType}</label>
                    <select
                      value={newPreset.type}
                      onChange={(e) => setNewPreset({ ...newPreset, type: e.target.value })}
                      className="w-full border rounded px-2 py-1 text-sm"
                    >
                      <option value="outlet">{t.outlet}</option>
                      <option value="switch">{t.switch}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">{t.size}</label>
                    <select
                      value={newPreset.size}
                      onChange={(e) => setNewPreset({ ...newPreset, size: parseInt(e.target.value) })}
                      className="w-full border rounded px-2 py-1 text-sm"
                    >
                      {FRAME_SIZES.map(s => (
                        <option key={s} value={s}>{s}M</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Module selection */}
              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-2">{t.presetModules}</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newPreset.modules.map((moduleId, idx) => (
                    <span key={idx} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                      {getModuleNameById(moduleId)}
                      <button
                        onClick={() => setNewPreset({
                          ...newPreset,
                          modules: newPreset.modules.filter((_, i) => i !== idx)
                        })}
                        className="text-purple-600 hover:text-purple-800"
                      >×</button>
                    </span>
                  ))}
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      setNewPreset({
                        ...newPreset,
                        modules: [...newPreset.modules, e.target.value]
                      });
                      e.target.value = '';
                    }
                  }}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="">+ Add module...</option>
                  {library.modules?.map(mod => (
                    <option key={mod.id} value={mod.id}>
                      {getModuleNameById(mod.id)} ({mod.size}M)
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={addPreset}
                  className="bg-purple-600 text-white px-4 py-1.5 rounded text-sm hover:bg-purple-700"
                >
                  {t.save}
                </button>
                <button
                  onClick={() => {
                    setShowAddPreset(false);
                    setNewPreset({ id: '', nameEn: '', nameRo: '', type: 'outlet', size: 2, modules: [] });
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-400"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          )}

          {/* Preset List */}
          <div className="divide-y">
            {/* Outlet Presets */}
            <div className="p-4">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" /> {t.outlets}
              </h3>
              {(library.presets || []).filter(p => p.type === 'outlet').length === 0 ? (
                <p className="text-gray-400 text-sm">{t.noPresets}</p>
              ) : (
                <div className="space-y-2">
                  {(library.presets || []).filter(p => p.type === 'outlet').map(preset => (
                    <div key={preset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{getPresetName(preset)}</div>
                        <div className="text-sm text-gray-500">
                          {preset.size}M · {preset.modules.map(m => getModuleNameById(m)).join(' + ')}
                        </div>
                      </div>
                      {isAdmin && (
                      <div className="flex items-center gap-2">
                        {confirmDeleteId === preset.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => deletePreset(preset.id)}
                              className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                            >
                              {t.delete}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-400"
                            >
                              {t.cancel}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(preset.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Switch Presets */}
            <div className="p-4">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" /> {t.switches}
              </h3>
              {(library.presets || []).filter(p => p.type === 'switch').length === 0 ? (
                <p className="text-gray-400 text-sm">{t.noPresets}</p>
              ) : (
                <div className="space-y-2">
                  {(library.presets || []).filter(p => p.type === 'switch').map(preset => (
                    <div key={preset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{getPresetName(preset)}</div>
                        <div className="text-sm text-gray-500">
                          {preset.size}M · {preset.modules.map(m => getModuleNameById(m)).join(' + ')}
                        </div>
                      </div>
                      {isAdmin && (
                      <div className="flex items-center gap-2">
                        {confirmDeleteId === preset.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => deletePreset(preset.id)}
                              className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                            >
                              {t.delete}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-400"
                            >
                              {t.cancel}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(preset.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modules Tab */}
      {activeTab === 'modules' && (
        <div className="bg-white rounded-lg shadow">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="font-semibold">{t.modules}</h2>
            {isAdmin && (
            <button
              onClick={() => setShowAddModule(true)}
              className="bg-green-600 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm hover:bg-green-700"
            >
              <Plus className="w-4 h-4" /> {t.addModule}
            </button>
            )}
          </div>

          {/* Add Module Form */}
          {showAddModule && (
            <div className="p-4 bg-blue-50 border-b">
              <h3 className="font-medium mb-3">{t.addNewModule}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t.moduleId}</label>
                  <input
                    type="text"
                    value={newModule.id}
                    onChange={(e) => setNewModule({ ...newModule, id: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                    placeholder="e.g., switch_double"
                    className="w-full border rounded px-2 py-1 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">🇬🇧 {t.moduleName} (EN)</label>
                  <input
                    type="text"
                    value={newModule.nameEn}
                    onChange={(e) => setNewModule({ ...newModule, nameEn: e.target.value })}
                    placeholder="e.g., Double Switch"
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">🇷🇴 {t.moduleName} (RO)</label>
                  <input
                    type="text"
                    value={newModule.nameRo}
                    onChange={(e) => setNewModule({ ...newModule, nameRo: e.target.value })}
                    placeholder="ex: Întrerupător Dublu"
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">{t.size}</label>
                    <select
                      value={newModule.size}
                      onChange={(e) => setNewModule({ ...newModule, size: parseInt(e.target.value) })}
                      className="w-full border rounded px-2 py-1 text-sm"
                    >
                      {[1, 2, 3, 4].map(s => (
                        <option key={s} value={s}>{s}M</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">{t.category}</label>
                    <select
                      value={newModule.category}
                      onChange={(e) => setNewModule({ ...newModule, category: e.target.value })}
                      className="w-full border rounded px-2 py-1 text-sm"
                    >
                      <option value="outlet">{t.outlet}</option>
                      <option value="switch">{t.switch}</option>
                      <option value="other">{t.other}</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <GraphicPicker value={newModule.graphic} onChange={(g) => setNewModule({ ...newModule, graphic: g })} size={newModule.size} moduleId={newModule.id} library={library} />
              </div>

              {/* Module color variants checkbox */}
              <div className="mb-4 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newModule.moduleHasColorVariants || false}
                    onChange={(e) => {
                      const has = e.target.checked;
                      const colors = getAvailableColors(library);
                      setNewModule({
                        ...newModule,
                        moduleHasColorVariants: has,
                        moduleSku: has ? buildColorObj(colors, '') : '',
                        modulePurchasePrice: has ? buildColorObj(colors, 0) : 0,
                        moduleMarkup: has ? buildColorObj(colors, 25) : 25,
                        modulePrice: has ? buildColorObj(colors, 0) : 0,
                      });
                    }}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{t.moduleHasColorVariants}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newModule.faceHasColorVariants !== false}
                    onChange={(e) => {
                      const has = e.target.checked;
                      const colors = getAvailableColors(library);
                      setNewModule({
                        ...newModule,
                        faceHasColorVariants: has,
                        faceSku: has ? buildColorObj(colors, '') : '',
                        facePurchasePrice: has ? buildColorObj(colors, 0) : 0,
                        faceMarkup: has ? buildColorObj(colors, 25) : 25,
                        facePrice: has ? buildColorObj(colors, 0) : 0,
                      });
                    }}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{t.faceHasColorVariants}</span>
                </label>
              </div>
              
              {/* SKU & Price Table - dynamic colors */}
              <div className="overflow-x-auto">
              <table className="w-full text-sm mb-4 border rounded bg-white">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-600">
                    <th className="p-2 border-b">{t.item}</th>
                    <th className="p-2 border-b">{t.sku}</th>
                    <th className="p-2 border-b">{t.purchasePrice}</th>
                    <th className="p-2 border-b">{t.markup}</th>
                    <th className="p-2 border-b">{t.sellingPrice}</th>
                    <th className="p-2 border-b">{t.sellingPriceVat}</th>
                  </tr>
                </thead>
                <tbody>
                  {newModule.moduleHasColorVariants ? (
                    getAvailableColors(library).map((color, idx) => (
                      <tr key={`mod-${color.id}`} className={`border-b ${idx % 2 ? 'bg-gray-50' : ''}`}>
                        <td className="p-2"><span className="flex items-center gap-2"><span className="w-3 h-3 rounded border" style={{backgroundColor: color.hex}}></span>{t.modules} ({getColorName(color.id, library, lang)})</span></td>
                        <td className="p-2"><input type="text" value={newModule.moduleSku?.[color.id] || ''} onChange={(e) => setNewModule({...newModule, moduleSku: {...(typeof newModule.moduleSku === 'object' ? newModule.moduleSku : {}), [color.id]: e.target.value.toUpperCase()}})} placeholder={t.enterSku} className="w-full border rounded px-2 py-1 text-sm font-mono" /></td>
                        <td className="p-2"><input type="number" step="0.01" value={newModule.modulePurchasePrice?.[color.id] || 0} onChange={(e) => { const pp = parseFloat(e.target.value)||0; const mk = newModule.moduleMarkup?.[color.id]||25; setNewModule({...newModule, modulePurchasePrice: {...newModule.modulePurchasePrice, [color.id]: pp}, modulePrice: {...newModule.modulePrice, [color.id]: calcPriceWithVat(pp, mk)}}); }} className="w-20 border rounded px-2 py-1 text-sm" /></td>
                        <td className="p-2"><PriceInput value={newModule.moduleMarkup?.[color.id]||25} onChange={(mk) => { const pp = newModule.modulePurchasePrice?.[color.id]||0; setNewModule({...newModule, moduleMarkup: {...newModule.moduleMarkup, [color.id]: mk}, modulePrice: {...newModule.modulePrice, [color.id]: calcPriceWithVat(pp, mk)}}); }} step="1" decimals={0} className="w-16 border rounded px-2 py-1 text-sm" /></td>
                        <td className="p-2 text-gray-500 font-mono text-sm">{((newModule.modulePrice?.[color.id]||0)/(1+VAT_RATE)).toFixed(2)}</td>
                        <td className="p-2"><PriceInput value={newModule.modulePrice?.[color.id]||0} onChange={(np) => { const pp = newModule.modulePurchasePrice?.[color.id]||0; setNewModule({...newModule, moduleMarkup: {...newModule.moduleMarkup, [color.id]: calcMarkupFromPriceWithVat(pp, np)}, modulePrice: {...newModule.modulePrice, [color.id]: np}}); }} className="w-20 border rounded px-2 py-1 text-sm font-medium" /></td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b">
                      <td className="p-2 font-medium">{t.modules}</td>
                      <td className="p-2"><input type="text" value={typeof newModule.moduleSku === 'string' ? newModule.moduleSku : ''} onChange={(e) => setNewModule({...newModule, moduleSku: e.target.value.toUpperCase()})} placeholder={t.enterSku} className="w-full border rounded px-2 py-1 text-sm font-mono" /></td>
                      <td className="p-2"><input type="number" step="0.01" value={typeof newModule.modulePurchasePrice === 'number' ? newModule.modulePurchasePrice : 0} onChange={(e) => { const pp = parseFloat(e.target.value)||0; const mk = typeof newModule.moduleMarkup === 'number' ? newModule.moduleMarkup : 25; setNewModule({...newModule, modulePurchasePrice: pp, modulePrice: calcPriceWithVat(pp, mk)}); }} className="w-20 border rounded px-2 py-1 text-sm" /></td>
                      <td className="p-2"><PriceInput value={typeof newModule.moduleMarkup === 'number' ? newModule.moduleMarkup : 25} onChange={(mk) => { const pp = typeof newModule.modulePurchasePrice === 'number' ? newModule.modulePurchasePrice : 0; setNewModule({...newModule, moduleMarkup: mk, modulePrice: calcPriceWithVat(pp, mk)}); }} step="1" decimals={0} className="w-16 border rounded px-2 py-1 text-sm" /></td>
                      <td className="p-2 text-gray-500 font-mono text-sm">{((typeof newModule.modulePrice === 'number' ? newModule.modulePrice : 0)/(1+VAT_RATE)).toFixed(2)}</td>
                      <td className="p-2"><PriceInput value={typeof newModule.modulePrice === 'number' ? newModule.modulePrice : 0} onChange={(np) => { const pp = typeof newModule.modulePurchasePrice === 'number' ? newModule.modulePurchasePrice : 0; setNewModule({...newModule, moduleMarkup: calcMarkupFromPriceWithVat(pp, np), modulePrice: np}); }} className="w-20 border rounded px-2 py-1 text-sm font-medium" /></td>
                    </tr>
                  )}
                  {/* Face rows - dynamic per color */}
                  {(newModule.faceHasColorVariants !== false) ? (
                    getAvailableColors(library).map((color, idx) => (
                      <tr key={`face-${color.id}`} className={`border-b ${idx % 2 ? 'bg-gray-50' : ''}`}>
                        <td className="p-2"><span className="flex items-center gap-2"><span className="w-3 h-3 rounded border" style={{backgroundColor: color.hex}}></span>{t.face} ({getColorName(color.id, library, lang)})</span></td>
                        <td className="p-2"><input type="text" value={newModule.faceSku?.[color.id] || ''} onChange={(e) => setNewModule({...newModule, faceSku: {...(typeof newModule.faceSku === 'object' ? newModule.faceSku : {}), [color.id]: e.target.value.toUpperCase()}})} placeholder={t.enterSku} className="w-full border rounded px-2 py-1 text-sm font-mono" /></td>
                        <td className="p-2"><input type="number" step="0.01" value={newModule.facePurchasePrice?.[color.id] || 0} onChange={(e) => { const pp = parseFloat(e.target.value)||0; const mk = newModule.faceMarkup?.[color.id]||25; setNewModule({...newModule, facePurchasePrice: {...newModule.facePurchasePrice, [color.id]: pp}, facePrice: {...newModule.facePrice, [color.id]: calcPriceWithVat(pp, mk)}}); }} className="w-20 border rounded px-2 py-1 text-sm" /></td>
                        <td className="p-2"><PriceInput value={newModule.faceMarkup?.[color.id]||25} onChange={(mk) => { const pp = newModule.facePurchasePrice?.[color.id]||0; setNewModule({...newModule, faceMarkup: {...newModule.faceMarkup, [color.id]: mk}, facePrice: {...newModule.facePrice, [color.id]: calcPriceWithVat(pp, mk)}}); }} step="1" decimals={0} className="w-16 border rounded px-2 py-1 text-sm" /></td>
                        <td className="p-2 text-gray-500 font-mono text-sm">{((newModule.facePrice?.[color.id]||0)/(1+VAT_RATE)).toFixed(2)}</td>
                        <td className="p-2"><PriceInput value={newModule.facePrice?.[color.id]||0} onChange={(np) => { const pp = newModule.facePurchasePrice?.[color.id]||0; setNewModule({...newModule, faceMarkup: {...newModule.faceMarkup, [color.id]: calcMarkupFromPriceWithVat(pp, np)}, facePrice: {...newModule.facePrice, [color.id]: np}}); }} className="w-20 border rounded px-2 py-1 text-sm font-medium" /></td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b">
                      <td className="p-2 font-medium">{t.face}</td>
                      <td className="p-2"><input type="text" value={typeof newModule.faceSku === 'string' ? newModule.faceSku : ''} onChange={(e) => setNewModule({...newModule, faceSku: e.target.value.toUpperCase()})} placeholder={t.enterSku} className="w-full border rounded px-2 py-1 text-sm font-mono" /></td>
                      <td className="p-2"><input type="number" step="0.01" value={typeof newModule.facePurchasePrice === 'number' ? newModule.facePurchasePrice : 0} onChange={(e) => { const pp = parseFloat(e.target.value)||0; const mk = typeof newModule.faceMarkup === 'number' ? newModule.faceMarkup : 25; setNewModule({...newModule, facePurchasePrice: pp, facePrice: calcPriceWithVat(pp, mk)}); }} className="w-20 border rounded px-2 py-1 text-sm" /></td>
                      <td className="p-2"><PriceInput value={typeof newModule.faceMarkup === 'number' ? newModule.faceMarkup : 25} onChange={(mk) => { const pp = typeof newModule.facePurchasePrice === 'number' ? newModule.facePurchasePrice : 0; setNewModule({...newModule, faceMarkup: mk, facePrice: calcPriceWithVat(pp, mk)}); }} step="1" decimals={0} className="w-16 border rounded px-2 py-1 text-sm" /></td>
                      <td className="p-2 text-gray-500 font-mono text-sm">{((typeof newModule.facePrice === 'number' ? newModule.facePrice : 0)/(1+VAT_RATE)).toFixed(2)}</td>
                      <td className="p-2"><PriceInput value={typeof newModule.facePrice === 'number' ? newModule.facePrice : 0} onChange={(np) => { const pp = typeof newModule.facePurchasePrice === 'number' ? newModule.facePurchasePrice : 0; setNewModule({...newModule, faceMarkup: calcMarkupFromPriceWithVat(pp, np), facePrice: np}); }} className="w-20 border rounded px-2 py-1 text-sm font-medium" /></td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={addModule}
                  className="bg-green-600 text-white px-4 py-1.5 rounded text-sm hover:bg-green-700"
                >
                  {t.addModule}
                </button>
                <button
                  onClick={() => setShowAddModule(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-400"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          )}

          {/* Module List */}
          <div className="divide-y">
            {library.modules.map((mod) => {
              const displayName = getModuleName(mod, lang);
              const GraphicComponent = getModuleGraphic(mod);
              return (
              <div key={mod.id} className="p-4">
                {editingModule === mod.id ? (
                  // Edit mode - Table format
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div 
                        className="flex items-center justify-center"
                        style={{
                          width: 56, // Fixed width for alignment
                          height: 56,
                        }}
                      >
                        {GraphicComponent && (
                          <div className="border border-gray-300" style={{ lineHeight: 0 }}>
                            {React.createElement(GraphicComponent, { 
                              color: 'white', 
                              // BTicino proportions: 1M = 8.5x31, 2M = 17x31
                              width: mod.size === 2 ? Math.round(52 * 17 / 31) : Math.round(52 * 8.5 / 31), 
                              height: 52 
                            })}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-lg">{displayName}</div>
                        <div className="text-sm text-gray-500 font-mono">{t.moduleId}: {mod.id}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">🇬🇧 {t.moduleName} (EN)</label>
                        <input
                          type="text"
                          value={mod.nameEn || ''}
                          onChange={(e) => updateModule(mod.id, { nameEn: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">🇷🇴 {t.moduleName} (RO)</label>
                        <input
                          type="text"
                          value={mod.nameRo || ''}
                          onChange={(e) => updateModule(mod.id, { nameRo: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">{t.size} (M)</label>
                        <select
                          value={mod.size}
                          onChange={(e) => updateModule(mod.id, { size: parseInt(e.target.value) })}
                          className="w-full border rounded px-2 py-1 text-sm"
                        >
                          {[1, 2, 3, 4].map(s => (
                            <option key={s} value={s}>{s}M</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">{t.category}</label>
                        <select
                          value={mod.category}
                          onChange={(e) => updateModule(mod.id, { category: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                        >
                          <option value="outlet">{t.outlet}</option>
                          <option value="switch">{t.switch}</option>
                          <option value="other">{t.other}</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <GraphicPicker value={mod.graphic} onChange={(g) => updateModule(mod.id, { graphic: g || undefined })} size={mod.size} moduleId={mod.id} library={library} />
                    </div>

                    {/* Module/face color variants checkboxes */}
                    <div className="mb-4 flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={mod.moduleHasColorVariants || mod.hasColorVariants || false}
                          onChange={(e) => {
                            const has = e.target.checked;
                            const colors = getAvailableColors(library);
                            if (has) {
                              const curSku = typeof mod.moduleSku === 'string' ? mod.moduleSku : '';
                              const curPrice = typeof mod.modulePrice === 'number' ? mod.modulePrice : 0;
                              const curPP = typeof mod.modulePurchasePrice === 'number' ? mod.modulePurchasePrice : 0;
                              const curMk = typeof mod.moduleMarkup === 'number' ? mod.moduleMarkup : 25;
                              updateModule(mod.id, { moduleHasColorVariants: true, hasColorVariants: undefined,
                                moduleSku: buildColorObj(colors, curSku, typeof mod.moduleSku === 'object' ? mod.moduleSku : null),
                                modulePurchasePrice: buildColorObj(colors, curPP, typeof mod.modulePurchasePrice === 'object' ? mod.modulePurchasePrice : null),
                                moduleMarkup: buildColorObj(colors, curMk, typeof mod.moduleMarkup === 'object' ? mod.moduleMarkup : null),
                                modulePrice: buildColorObj(colors, curPrice, typeof mod.modulePrice === 'object' ? mod.modulePrice : null),
                              });
                            } else {
                              const firstColor = colors[0]?.id || 'white';
                              updateModule(mod.id, { moduleHasColorVariants: false, hasColorVariants: undefined,
                                moduleSku: typeof mod.moduleSku === 'object' ? (mod.moduleSku?.[firstColor] || '') : (mod.moduleSku || ''),
                                modulePurchasePrice: typeof mod.modulePurchasePrice === 'object' ? (mod.modulePurchasePrice?.[firstColor] || 0) : (mod.modulePurchasePrice || 0),
                                moduleMarkup: typeof mod.moduleMarkup === 'object' ? (mod.moduleMarkup?.[firstColor] || 25) : (mod.moduleMarkup || 25),
                                modulePrice: typeof mod.modulePrice === 'object' ? (mod.modulePrice?.[firstColor] || 0) : (mod.modulePrice || 0),
                              });
                            }
                          }} className="w-4 h-4 rounded border-gray-300" />
                        <span className="text-sm text-gray-700">{t.moduleHasColorVariants}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={mod.faceHasColorVariants !== false}
                          onChange={(e) => {
                            const has = e.target.checked;
                            const colors = getAvailableColors(library);
                            if (has) {
                              updateModule(mod.id, { faceHasColorVariants: true,
                                faceSku: buildColorObj(colors, '', typeof mod.faceSku === 'object' ? mod.faceSku : null),
                                facePurchasePrice: buildColorObj(colors, 0, typeof mod.facePurchasePrice === 'object' ? mod.facePurchasePrice : null),
                                faceMarkup: buildColorObj(colors, 25, typeof mod.faceMarkup === 'object' ? mod.faceMarkup : null),
                                facePrice: buildColorObj(colors, 0, typeof mod.facePrice === 'object' ? mod.facePrice : null),
                              });
                            } else {
                              const firstColor = colors[0]?.id || 'white';
                              updateModule(mod.id, { faceHasColorVariants: false,
                                faceSku: typeof mod.faceSku === 'object' ? (mod.faceSku?.[firstColor] || '') : (mod.faceSku || ''),
                                facePurchasePrice: typeof mod.facePurchasePrice === 'object' ? (mod.facePurchasePrice?.[firstColor] || 0) : (mod.facePurchasePrice || 0),
                                faceMarkup: typeof mod.faceMarkup === 'object' ? (mod.faceMarkup?.[firstColor] || 25) : (mod.faceMarkup || 25),
                                facePrice: typeof mod.facePrice === 'object' ? (mod.facePrice?.[firstColor] || 0) : (mod.facePrice || 0),
                              });
                            }
                          }} className="w-4 h-4 rounded border-gray-300" />
                        <span className="text-sm text-gray-700">{t.faceHasColorVariants}</span>
                      </label>
                    </div>
                    
                    {/* SKU & Price Table - dynamic colors */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm mb-4 border rounded">
                        <thead>
                          <tr className="bg-gray-50 text-left text-gray-600">
                            <th className="p-2 border-b">{t.item}</th>
                            <th className="p-2 border-b">{t.sku}</th>
                            <th className="p-2 border-b">{t.purchasePrice}</th>
                            <th className="p-2 border-b">{t.markup}</th>
                            <th className="p-2 border-b">{t.sellingPrice}</th>
                            <th className="p-2 border-b">{t.sellingPriceVat}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(mod.moduleHasColorVariants || mod.hasColorVariants) ? (
                            getAvailableColors(library).map((color, idx) => (
                              <tr key={`emod-${color.id}`} className={`border-b ${idx % 2 ? 'bg-gray-50' : ''}`}>
                                <td className="p-2"><span className="flex items-center gap-2"><span className="w-3 h-3 rounded border" style={{backgroundColor: color.hex}}></span>{t.modules} ({getColorName(color.id, library, lang)})</span></td>
                                <td className="p-2"><input type="text" value={typeof mod.moduleSku === 'object' ? (mod.moduleSku?.[color.id]||'') : ''} onChange={(e) => updateModule(mod.id, {moduleSku: {...(typeof mod.moduleSku === 'object' ? mod.moduleSku : {}), [color.id]: e.target.value.toUpperCase()}})} placeholder={t.enterSku} className="w-full border rounded px-2 py-1 text-sm font-mono" /></td>
                                <td className="p-2"><input type="number" step="0.01" value={typeof mod.modulePurchasePrice === 'object' ? (mod.modulePurchasePrice?.[color.id]||0) : 0} onChange={(e) => { const pp = parseFloat(e.target.value)||0; const mk = typeof mod.moduleMarkup === 'object' ? (mod.moduleMarkup?.[color.id]||0) : 0; updateModule(mod.id, {modulePurchasePrice: {...(typeof mod.modulePurchasePrice==='object'?mod.modulePurchasePrice:{}), [color.id]: pp}, modulePrice: {...(typeof mod.modulePrice==='object'?mod.modulePrice:{}), [color.id]: calcPriceWithVat(pp, mk)}}); }} className="w-20 border rounded px-2 py-1 text-sm" /></td>
                                <td className="p-2"><PriceInput value={typeof mod.moduleMarkup === 'object' ? (mod.moduleMarkup?.[color.id]||0) : 0} onChange={(mk) => { const pp = typeof mod.modulePurchasePrice==='object'?(mod.modulePurchasePrice?.[color.id]||0):0; updateModule(mod.id, {moduleMarkup: {...(typeof mod.moduleMarkup==='object'?mod.moduleMarkup:{}), [color.id]: mk}, modulePrice: {...(typeof mod.modulePrice==='object'?mod.modulePrice:{}), [color.id]: calcPriceWithVat(pp, mk)}}); }} step="1" decimals={0} className="w-16 border rounded px-2 py-1 text-sm" /></td>
                                <td className="p-2"><PriceInput value={(typeof mod.modulePrice==='object'?(mod.modulePrice?.[color.id]||0):0)/(1+VAT_RATE)} onChange={(nwv) => { const pp = typeof mod.modulePurchasePrice==='object'?(mod.modulePurchasePrice?.[color.id]||0):0; const np = calcPriceWithVatFromWithout(nwv); updateModule(mod.id, {moduleMarkup: {...(typeof mod.moduleMarkup==='object'?mod.moduleMarkup:{}), [color.id]: calcMarkupFromPriceWithoutVat(pp, nwv)}, modulePrice: {...(typeof mod.modulePrice==='object'?mod.modulePrice:{}), [color.id]: np}}); }} className="w-20 border rounded px-2 py-1 text-sm" /></td>
                                <td className="p-2"><PriceInput value={typeof mod.modulePrice==='object'?(mod.modulePrice?.[color.id]||0):0} onChange={(np) => { const pp = typeof mod.modulePurchasePrice==='object'?(mod.modulePurchasePrice?.[color.id]||0):0; updateModule(mod.id, {moduleMarkup: {...(typeof mod.moduleMarkup==='object'?mod.moduleMarkup:{}), [color.id]: calcMarkupFromPriceWithVat(pp, np)}, modulePrice: {...(typeof mod.modulePrice==='object'?mod.modulePrice:{}), [color.id]: np}}); }} className="w-20 border rounded px-2 py-1 text-sm font-medium" /></td>
                              </tr>
                            ))
                          ) : (
                            <tr className="border-b">
                              <td className="p-2 font-medium">{t.modules}</td>
                              <td className="p-2"><input type="text" value={typeof mod.moduleSku === 'string' ? mod.moduleSku : ''} onChange={(e) => updateModule(mod.id, {moduleSku: e.target.value.toUpperCase()})} placeholder={t.enterSku} className="w-full border rounded px-2 py-1 text-sm font-mono" /></td>
                              <td className="p-2"><input type="number" step="0.01" value={typeof mod.modulePurchasePrice === 'number' ? mod.modulePurchasePrice : 0} onChange={(e) => { const pp = parseFloat(e.target.value)||0; const mk = typeof mod.moduleMarkup==='number'?mod.moduleMarkup:0; updateModule(mod.id, {modulePurchasePrice: pp, modulePrice: calcPriceWithVat(pp, mk)}); }} className="w-20 border rounded px-2 py-1 text-sm" /></td>
                              <td className="p-2"><PriceInput value={typeof mod.moduleMarkup === 'number' ? mod.moduleMarkup : 0} onChange={(mk) => { const pp = typeof mod.modulePurchasePrice==='number'?mod.modulePurchasePrice:0; updateModule(mod.id, {moduleMarkup: mk, modulePrice: calcPriceWithVat(pp, mk)}); }} step="1" decimals={0} className="w-16 border rounded px-2 py-1 text-sm" /></td>
                              <td className="p-2"><PriceInput value={(typeof mod.modulePrice==='number'?mod.modulePrice:0)/(1+VAT_RATE)} onChange={(nwv) => { const pp = typeof mod.modulePurchasePrice==='number'?mod.modulePurchasePrice:0; updateModule(mod.id, {moduleMarkup: calcMarkupFromPriceWithoutVat(pp, nwv), modulePrice: calcPriceWithVatFromWithout(nwv)}); }} className="w-20 border rounded px-2 py-1 text-sm" /></td>
                              <td className="p-2"><PriceInput value={typeof mod.modulePrice === 'number' ? mod.modulePrice : 0} onChange={(np) => { const pp = typeof mod.modulePurchasePrice==='number'?mod.modulePurchasePrice:0; updateModule(mod.id, {moduleMarkup: calcMarkupFromPriceWithVat(pp, np), modulePrice: np}); }} className="w-20 border rounded px-2 py-1 text-sm font-medium" /></td>
                            </tr>
                          )}
                          {/* Face rows */}
                          {(mod.faceHasColorVariants !== false) ? (
                            getAvailableColors(library).map((color, idx) => (
                              <tr key={`eface-${color.id}`} className={`border-b ${idx % 2 ? 'bg-gray-50' : ''}`}>
                                <td className="p-2"><span className="flex items-center gap-2"><span className="w-3 h-3 rounded border" style={{backgroundColor: color.hex}}></span>{t.face} ({getColorName(color.id, library, lang)})</span></td>
                                <td className="p-2"><input type="text" value={typeof mod.faceSku==='object'?(mod.faceSku?.[color.id]||''):''} onChange={(e) => updateModule(mod.id, {faceSku: {...(typeof mod.faceSku==='object'?mod.faceSku:{}), [color.id]: e.target.value.toUpperCase()}})} placeholder={t.enterSku} className="w-full border rounded px-2 py-1 text-sm font-mono" /></td>
                                <td className="p-2"><input type="number" step="0.01" value={typeof mod.facePurchasePrice==='object'?(mod.facePurchasePrice?.[color.id]||0):0} onChange={(e) => { const pp = parseFloat(e.target.value)||0; const mk = typeof mod.faceMarkup==='object'?(mod.faceMarkup?.[color.id]||0):0; updateModule(mod.id, {facePurchasePrice: {...(typeof mod.facePurchasePrice==='object'?mod.facePurchasePrice:{}), [color.id]: pp}, facePrice: {...(typeof mod.facePrice==='object'?mod.facePrice:{}), [color.id]: calcPriceWithVat(pp, mk)}}); }} className="w-20 border rounded px-2 py-1 text-sm" /></td>
                                <td className="p-2"><PriceInput value={typeof mod.faceMarkup==='object'?(mod.faceMarkup?.[color.id]||0):0} onChange={(mk) => { const pp = typeof mod.facePurchasePrice==='object'?(mod.facePurchasePrice?.[color.id]||0):0; updateModule(mod.id, {faceMarkup: {...(typeof mod.faceMarkup==='object'?mod.faceMarkup:{}), [color.id]: mk}, facePrice: {...(typeof mod.facePrice==='object'?mod.facePrice:{}), [color.id]: calcPriceWithVat(pp, mk)}}); }} step="1" decimals={0} className="w-16 border rounded px-2 py-1 text-sm" /></td>
                                <td className="p-2"><PriceInput value={(typeof mod.facePrice==='object'?(mod.facePrice?.[color.id]||0):0)/(1+VAT_RATE)} onChange={(nwv) => { const pp = typeof mod.facePurchasePrice==='object'?(mod.facePurchasePrice?.[color.id]||0):0; updateModule(mod.id, {faceMarkup: {...(typeof mod.faceMarkup==='object'?mod.faceMarkup:{}), [color.id]: calcMarkupFromPriceWithoutVat(pp, nwv)}, facePrice: {...(typeof mod.facePrice==='object'?mod.facePrice:{}), [color.id]: calcPriceWithVatFromWithout(nwv)}}); }} className="w-20 border rounded px-2 py-1 text-sm" /></td>
                                <td className="p-2"><PriceInput value={typeof mod.facePrice==='object'?(mod.facePrice?.[color.id]||0):0} onChange={(np) => { const pp = typeof mod.facePurchasePrice==='object'?(mod.facePurchasePrice?.[color.id]||0):0; updateModule(mod.id, {faceMarkup: {...(typeof mod.faceMarkup==='object'?mod.faceMarkup:{}), [color.id]: calcMarkupFromPriceWithVat(pp, np)}, facePrice: {...(typeof mod.facePrice==='object'?mod.facePrice:{}), [color.id]: np}}); }} className="w-20 border rounded px-2 py-1 text-sm font-medium" /></td>
                              </tr>
                            ))
                          ) : (
                            <tr className="border-b">
                              <td className="p-2 font-medium">{t.face}</td>
                              <td className="p-2"><input type="text" value={typeof mod.faceSku==='string'?mod.faceSku:''} onChange={(e) => updateModule(mod.id, {faceSku: e.target.value.toUpperCase()})} placeholder={t.enterSku} className="w-full border rounded px-2 py-1 text-sm font-mono" /></td>
                              <td className="p-2"><input type="number" step="0.01" value={typeof mod.facePurchasePrice==='number'?mod.facePurchasePrice:0} onChange={(e) => { const pp = parseFloat(e.target.value)||0; const mk = typeof mod.faceMarkup==='number'?mod.faceMarkup:0; updateModule(mod.id, {facePurchasePrice: pp, facePrice: calcPriceWithVat(pp, mk)}); }} className="w-20 border rounded px-2 py-1 text-sm" /></td>
                              <td className="p-2"><PriceInput value={typeof mod.faceMarkup==='number'?mod.faceMarkup:0} onChange={(mk) => { const pp = typeof mod.facePurchasePrice==='number'?mod.facePurchasePrice:0; updateModule(mod.id, {faceMarkup: mk, facePrice: calcPriceWithVat(pp, mk)}); }} step="1" decimals={0} className="w-16 border rounded px-2 py-1 text-sm" /></td>
                              <td className="p-2"><PriceInput value={(typeof mod.facePrice==='number'?mod.facePrice:0)/(1+VAT_RATE)} onChange={(nwv) => { const pp = typeof mod.facePurchasePrice==='number'?mod.facePurchasePrice:0; updateModule(mod.id, {faceMarkup: calcMarkupFromPriceWithoutVat(pp, nwv), facePrice: calcPriceWithVatFromWithout(nwv)}); }} className="w-20 border rounded px-2 py-1 text-sm" /></td>
                              <td className="p-2"><PriceInput value={typeof mod.facePrice==='number'?mod.facePrice:0} onChange={(np) => { const pp = typeof mod.facePurchasePrice==='number'?mod.facePurchasePrice:0; updateModule(mod.id, {faceMarkup: calcMarkupFromPriceWithVat(pp, np), facePrice: np}); }} className="w-20 border rounded px-2 py-1 text-sm font-medium" /></td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    <button
                      onClick={() => setEditingModule(null)}
                      className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700"
                    >
                      {t.done}
                    </button>
                  </div>
                ) : (
                  // View mode
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="flex items-center justify-center"
                        style={{
                          width: 56, // Fixed width for alignment
                          height: 56,
                        }}
                      >
                        {GraphicComponent && (
                          <div className="border border-gray-300" style={{ lineHeight: 0 }}>
                            {React.createElement(GraphicComponent, { 
                              color: 'white', 
                              // BTicino proportions: 1M = 8.5x31, 2M = 17x31
                              width: mod.size === 2 ? Math.round(52 * 17 / 31) : Math.round(52 * 8.5 / 31), 
                              height: 52 
                            })}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{getModuleName(mod, lang)}</div>
                        <div className="text-sm text-gray-500">
                          <span className="font-mono">{typeof mod.moduleSku === 'object' ? Object.values(mod.moduleSku).filter(Boolean).join(' / ') : mod.moduleSku}</span> · {mod.size}M · {mod.category === 'outlet' ? t.outlet : mod.category === 'switch' ? t.switch : t.other}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {t.priceInclVat}: {typeof mod.modulePrice === 'object' 
                            ? Object.values(mod.modulePrice).map(p => (p || 0).toFixed(2)).join(' / ')
                            : (mod.modulePrice || 0).toFixed(2)} RON
                        </div>
                      </div>
                    </div>
                    {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingModule(mod.id)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      {confirmDeleteId === mod.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteModule(mod.id)}
                            className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                          >
                            {t.delete}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-400"
                          >
                            {t.cancel}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(mod.id)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    )}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Colors Tab */}
      {activeTab === 'colors' && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-bold mb-4">🎨 {t.manageColors}</h2>
          <div className="space-y-2 mb-4">
            {getAvailableColors(library).map((color) => {
              const isEditingThis = editingColorId === color.id;
              return (
              <div key={color.id} className="flex items-center gap-3 p-2 border rounded">
                {isAdmin ? (
                  <input
                    type="color"
                    value={isEditingThis ? pendingColorHex : color.hex}
                    onChange={(e) => {
                      if (!isEditingThis) {
                        setEditingColorId(color.id);
                        setOriginalColorHex(color.hex);
                      }
                      setPendingColorHex(e.target.value);
                    }}
                    className="w-8 h-8 rounded border cursor-pointer p-0"
                    title={t.editColorHex || 'Edit color'}
                  />
                ) : (
                  <span className="w-8 h-8 rounded border" style={{ backgroundColor: color.hex }}></span>
                )}
                <span className="font-medium w-24">{color.id}</span>
                <span className="text-sm text-gray-600 w-32">{color.nameEn}</span>
                <span className="text-sm text-gray-600 w-32">{color.nameRo}</span>
                <span className="text-xs font-mono text-gray-400">{isEditingThis ? pendingColorHex : color.hex}</span>
                {isEditingThis && (
                  <div className="flex items-center gap-1 ml-2">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <span className="w-4 h-4 rounded border" style={{ backgroundColor: originalColorHex }}></span>
                      →
                      <span className="w-4 h-4 rounded border" style={{ backgroundColor: pendingColorHex }}></span>
                    </span>
                    <button
                      onClick={() => {
                        const newColors = library.availableColors.map(c =>
                          c.id === color.id ? { ...c, hex: pendingColorHex } : c
                        );
                        safeOnUpdate({ ...library, availableColors: newColors });
                        setEditingColorId(null);
                        setPendingColorHex('');
                        setOriginalColorHex('');
                      }}
                      className="bg-green-500 text-white text-xs px-2 py-1 rounded hover:bg-green-600"
                      title={t.save}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setEditingColorId(null);
                        setPendingColorHex('');
                        setOriginalColorHex('');
                      }}
                      className="bg-gray-400 text-white text-xs px-2 py-1 rounded hover:bg-gray-500"
                      title={t.cancel}
                    >
                      ✕
                    </button>
                  </div>
                )}
                {isAdmin && getAvailableColors(library).length > 1 && (
                  <button
                    onClick={() => {
                      if (!confirm(t.confirmRemoveColor)) return;
                      const newColors = library.availableColors.filter(c => c.id !== color.id);
                      // Remove color keys from all modules
                      const newModules = (library.modules || []).map(mod => {
                        const updated = { ...mod };
                        ['moduleSku','modulePurchasePrice','moduleMarkup','modulePrice'].forEach(field => {
                          if (typeof updated[field] === 'object' && updated[field] !== null) {
                            const copy = { ...updated[field] };
                            delete copy[color.id];
                            updated[field] = copy;
                          }
                        });
                        ['faceSku','facePurchasePrice','faceMarkup','facePrice'].forEach(field => {
                          if (typeof updated[field] === 'object' && updated[field] !== null) {
                            const copy = { ...updated[field] };
                            delete copy[color.id];
                            updated[field] = copy;
                          }
                        });
                        return updated;
                      });
                      // Remove decorFaces for this color
                      const newDecor = { ...library.decorFaces };
                      Object.keys(newDecor).forEach(key => {
                        if (key.endsWith('-' + color.id)) delete newDecor[key];
                      });
                      safeOnUpdate({ ...library, availableColors: newColors, modules: newModules, decorFaces: newDecor });
                    }}
                    className="ml-auto text-red-500 hover:text-red-700 text-sm"
                    title={t.removeColor}
                  >
                    ✕
                  </button>
                )}
              </div>
              );
            })}
          </div>
          {isAdmin && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-2">{t.addColor}</h3>
              <div className="flex gap-2 items-end flex-wrap">
                <div>
                  <label className="block text-xs text-gray-600">{t.colorId}</label>
                  <input id="newColorId" type="text" placeholder="sand" className="border rounded px-2 py-1 text-sm w-24" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">{t.colorNameEn}</label>
                  <input id="newColorNameEn" type="text" placeholder="Sand" className="border rounded px-2 py-1 text-sm w-28" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">{t.colorNameRo}</label>
                  <input id="newColorNameRo" type="text" placeholder="Nisip" className="border rounded px-2 py-1 text-sm w-28" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">{t.colorHex}</label>
                  <div className="flex items-center gap-1">
                    <input id="newColorHex" type="color" defaultValue="#C2A878" onInput={(e) => { const lbl = document.getElementById('newColorHexLabel'); if (lbl) lbl.textContent = e.target.value; }} className="w-10 h-8 rounded border cursor-pointer p-0" />
                    <span id="newColorHexLabel" className="text-xs font-mono text-gray-400">#C2A878</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const id = document.getElementById('newColorId').value.trim().toLowerCase();
                    const nameEn = document.getElementById('newColorNameEn').value.trim();
                    const nameRo = document.getElementById('newColorNameRo').value.trim();
                    const hex = document.getElementById('newColorHex').value.trim();
                    if (!id || !nameEn || !hex) return;
                    if (getAvailableColors(library).some(c => c.id === id)) return alert('Color ID already exists');
                    const newColor = { id, name: nameEn, nameEn, nameRo: nameRo || nameEn, hex };
                    const newColors = [...(library.availableColors || []), newColor];
                    // Add color keys to modules that have color variants
                    const newModules = (library.modules || []).map(mod => {
                      const updated = { ...mod };
                      if (updated.moduleHasColorVariants || updated.hasColorVariants) {
                        ['moduleSku','modulePurchasePrice','moduleMarkup','modulePrice'].forEach(field => {
                          if (typeof updated[field] === 'object' && updated[field] !== null) {
                            updated[field] = { ...updated[field], [id]: field.includes('Markup') ? 25 : (field.includes('Sku') ? '' : 0) };
                          }
                        });
                      }
                      if (updated.faceHasColorVariants !== false) {
                        ['faceSku','facePurchasePrice','faceMarkup','facePrice'].forEach(field => {
                          if (typeof updated[field] === 'object' && updated[field] !== null) {
                            updated[field] = { ...updated[field], [id]: field.includes('Markup') ? 25 : (field.includes('Sku') ? '' : 0) };
                          }
                        });
                      }
                      return updated;
                    });
                    // Add decorFaces for new color
                    const newDecor = { ...library.decorFaces };
                    getAvailableSizes(library).forEach(size => {
                      if (!newDecor[`${size}-${id}`]) {
                        newDecor[`${size}-${id}`] = { sku: '', purchasePrice: 0, markup: 25, price: 0 };
                      }
                    });
                    safeOnUpdate({ ...library, availableColors: newColors, modules: newModules, decorFaces: newDecor });
                    document.getElementById('newColorId').value = '';
                    document.getElementById('newColorNameEn').value = '';
                    document.getElementById('newColorNameRo').value = '';
                    document.getElementById('newColorHex').value = '#C2A878';
                    const lbl = document.getElementById('newColorHexLabel'); if (lbl) lbl.textContent = '#C2A878';
                  }}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  + {t.addColor}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Wall Boxes Tab */}
      {activeTab === 'wallboxes' && (
        <div className="space-y-6">
          {/* Masonry Wall Boxes */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-semibold">{t.wallBoxesMasonry || 'Wall Boxes (Masonry)'}</h2>
              <p className="text-sm text-gray-500">{t.masonry} - {t.configureSKUs}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-600">
                    <th className="p-2 w-16">{t.size}</th>
                    <th className="p-2 w-28">{t.sku}</th>
                    <th className="p-2 w-28">{t.purchasePrice}</th>
                    <th className="p-2 w-20">{t.markup}</th>
                    <th className="p-2 w-28">{t.sellingPrice}</th>
                    <th className="p-2 w-28">{t.sellingPriceVat}</th>
                  </tr>
                </thead>
                <tbody>
                  {getAvailableSizes(library).map((size) => {
                    const item = library.wallBoxesMasonry?.[size] || {};
                    const purchasePrice = item.purchasePrice || 0;
                    const markup = item.markup || 0;
                    const priceWithVat = item.price || 0;
                    const sellingWithoutVat = priceWithVat / (1 + VAT_RATE);
                    
                    return (
                      <tr key={size} className="border-t">
                        <td className="p-2 font-medium">{size}M</td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.sku || ''}
                            onChange={(e) => updateWallBoxMasonry(size, 'sku', e.target.value)}
                            placeholder={t.enterSku}
                            className="w-full border rounded px-2 py-1 text-sm font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            value={purchasePrice}
                            onChange={(e) => {
                              const newPurchase = parseFloat(e.target.value) || 0;
                              const newPrice = calcPriceWithVat(newPurchase, markup);
                              safeOnUpdate({
                                ...library,
                                wallBoxesMasonry: {
                                  ...library.wallBoxesMasonry,
                                  [size]: { ...item, purchasePrice: newPurchase, price: newPrice }
                                }
                              });
                            }}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <PriceInput
                            value={markup}
                            onChange={(newMarkup) => {
                              const newPrice = calcPriceWithVat(purchasePrice, newMarkup);
                              safeOnUpdate({
                                ...library,
                                wallBoxesMasonry: {
                                  ...library.wallBoxesMasonry,
                                  [size]: { ...item, markup: newMarkup, price: newPrice }
                                }
                              });
                            }}
                            step="1"
                            decimals={0}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <PriceInput
                            value={sellingWithoutVat}
                            onChange={(newSellingWithoutVat) => {
                              const newPrice = calcPriceWithVatFromWithout(newSellingWithoutVat);
                              const newMarkup = calcMarkupFromPriceWithoutVat(purchasePrice, newSellingWithoutVat);
                              safeOnUpdate({
                                ...library,
                                wallBoxesMasonry: {
                                  ...library.wallBoxesMasonry,
                                  [size]: { ...item, markup: newMarkup, price: newPrice }
                                }
                              });
                            }}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <PriceInput
                            value={priceWithVat}
                            onChange={(newPrice) => {
                              const newMarkup = calcMarkupFromPriceWithVat(purchasePrice, newPrice);
                              safeOnUpdate({
                                ...library,
                                wallBoxesMasonry: {
                                  ...library.wallBoxesMasonry,
                                  [size]: { ...item, markup: newMarkup, price: newPrice }
                                }
                              });
                            }}
                            className="w-full border rounded px-2 py-1 text-sm font-medium"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Drywall Wall Boxes */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-semibold">{t.wallBoxesDrywall || 'Wall Boxes (Drywall)'}</h2>
              <p className="text-sm text-gray-500">{t.drywall} - {t.configureSKUs}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-600">
                    <th className="p-2 w-16">{t.size}</th>
                    <th className="p-2 w-28">{t.sku}</th>
                    <th className="p-2 w-28">{t.purchasePrice}</th>
                    <th className="p-2 w-20">{t.markup}</th>
                    <th className="p-2 w-28">{t.sellingPrice}</th>
                    <th className="p-2 w-28">{t.sellingPriceVat}</th>
                  </tr>
                </thead>
                <tbody>
                  {getAvailableSizes(library).map((size) => {
                    const item = library.wallBoxesDrywall?.[size] || {};
                    const purchasePrice = item.purchasePrice || 0;
                    const markup = item.markup || 0;
                    const priceWithVat = item.price || 0;
                    const sellingWithoutVat = priceWithVat / (1 + VAT_RATE);
                    
                    return (
                      <tr key={size} className="border-t">
                        <td className="p-2 font-medium">{size}M</td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.sku || ''}
                            onChange={(e) => updateWallBoxDrywall(size, 'sku', e.target.value)}
                            placeholder={t.enterSku}
                            className="w-full border rounded px-2 py-1 text-sm font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            value={purchasePrice}
                            onChange={(e) => {
                              const newPurchase = parseFloat(e.target.value) || 0;
                              const newPrice = calcPriceWithVat(newPurchase, markup);
                              safeOnUpdate({
                                ...library,
                                wallBoxesDrywall: {
                                  ...library.wallBoxesDrywall,
                                  [size]: { ...item, purchasePrice: newPurchase, price: newPrice }
                                }
                              });
                            }}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <PriceInput
                            value={markup}
                            onChange={(newMarkup) => {
                              const newPrice = calcPriceWithVat(purchasePrice, newMarkup);
                              safeOnUpdate({
                                ...library,
                                wallBoxesDrywall: {
                                  ...library.wallBoxesDrywall,
                                  [size]: { ...item, markup: newMarkup, price: newPrice }
                                }
                              });
                            }}
                            step="1"
                            decimals={0}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <PriceInput
                            value={sellingWithoutVat}
                            onChange={(newSellingWithoutVat) => {
                              const newPrice = calcPriceWithVatFromWithout(newSellingWithoutVat);
                              const newMarkup = calcMarkupFromPriceWithoutVat(purchasePrice, newSellingWithoutVat);
                              safeOnUpdate({
                                ...library,
                                wallBoxesDrywall: {
                                  ...library.wallBoxesDrywall,
                                  [size]: { ...item, markup: newMarkup, price: newPrice }
                                }
                              });
                            }}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <PriceInput
                            value={priceWithVat}
                            onChange={(newPrice) => {
                              const newMarkup = calcMarkupFromPriceWithVat(purchasePrice, newPrice);
                              safeOnUpdate({
                                ...library,
                                wallBoxesDrywall: {
                                  ...library.wallBoxesDrywall,
                                  [size]: { ...item, markup: newMarkup, price: newPrice }
                                }
                              });
                            }}
                            className="w-full border rounded px-2 py-1 text-sm font-medium"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Install Faces Tab */}
      {activeTab === 'installfaces' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="font-semibold">{t.installFaces} ({t.supports})</h2>
            <p className="text-sm text-gray-500">{t.configureSKUs}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600">
                  <th className="p-2 w-16">{t.size}</th>
                  <th className="p-2 w-28">{t.sku}</th>
                  <th className="p-2 w-28">{t.purchasePrice}</th>
                  <th className="p-2 w-20">{t.markup}</th>
                  <th className="p-2 w-28">{t.sellingPrice}</th>
                  <th className="p-2 w-28">{t.sellingPriceVat}</th>
                </tr>
              </thead>
              <tbody>
                {getAvailableSizes(library).map((size) => {
                  const item = library.installFaces[size] || {};
                  const purchasePrice = item.purchasePrice || 0;
                  const markup = item.markup || 0;
                  const priceWithVat = item.price || 0;
                  const sellingWithoutVat = priceWithVat / (1 + VAT_RATE);
                  
                  return (
                    <tr key={size} className="border-t">
                      <td className="p-2 font-medium">{size}M</td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.sku || ''}
                          onChange={(e) => updateInstallFace(size, 'sku', e.target.value)}
                          placeholder={t.enterSku}
                          className="w-full border rounded px-2 py-1 text-sm font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          value={purchasePrice}
                          onChange={(e) => {
                            const newPurchase = parseFloat(e.target.value) || 0;
                            const newPrice = calcPriceWithVat(newPurchase, markup);
                            safeOnUpdate({
                              ...library,
                              installFaces: {
                                ...library.installFaces,
                                [size]: { ...item, purchasePrice: newPurchase, price: newPrice }
                              }
                            });
                          }}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <PriceInput
                          value={markup}
                          onChange={(newMarkup) => {
                            const newPrice = calcPriceWithVat(purchasePrice, newMarkup);
                            safeOnUpdate({
                              ...library,
                              installFaces: {
                                ...library.installFaces,
                                [size]: { ...item, markup: newMarkup, price: newPrice }
                              }
                            });
                          }}
                          step="1"
                          decimals={0}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <PriceInput
                          value={sellingWithoutVat}
                          onChange={(newSellingWithoutVat) => {
                            const newPrice = calcPriceWithVatFromWithout(newSellingWithoutVat);
                            const newMarkup = calcMarkupFromPriceWithoutVat(purchasePrice, newSellingWithoutVat);
                            safeOnUpdate({
                              ...library,
                              installFaces: {
                                ...library.installFaces,
                                [size]: { ...item, markup: newMarkup, price: newPrice }
                              }
                            });
                          }}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <PriceInput
                          value={priceWithVat}
                          onChange={(newPrice) => {
                            const newMarkup = calcMarkupFromPriceWithVat(purchasePrice, newPrice);
                            safeOnUpdate({
                              ...library,
                              installFaces: {
                                ...library.installFaces,
                                [size]: { ...item, markup: newMarkup, price: newPrice }
                              }
                            });
                          }}
                          className="w-full border rounded px-2 py-1 text-sm font-medium"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Decor Faces Tab */}
      {activeTab === 'decorfaces' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="font-semibold">{t.decorFaces} ({t.coverPlates})</h2>
            <p className="text-sm text-gray-500">{t.configureSKUsColor}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600">
                  <th className="p-2 w-16">{t.size}</th>
                  <th className="p-2 w-20">{t.color}</th>
                  <th className="p-2 w-28">{t.sku}</th>
                  <th className="p-2 w-24">{t.purchasePrice}</th>
                  <th className="p-2 w-16">{t.markup}</th>
                  <th className="p-2 w-24">{t.sellingPrice}</th>
                  <th className="p-2 w-24">{t.sellingPriceVat}</th>
                </tr>
              </thead>
              <tbody>
                {getAvailableSizes(library).map((size) => (
                  getAvailableColors(library).map((color, colorIdx) => {
                    const key = `${size}-${color.id}`;
                    const item = library.decorFaces[key] || {};
                    const purchasePrice = item.purchasePrice || 0;
                    const markup = item.markup || 0;
                    const priceWithVat = item.price || 0;
                    const sellingWithoutVat = priceWithVat / (1 + VAT_RATE);
                    
                    return (
                      <tr key={key} className={colorIdx === 0 ? 'border-t' : ''}>
                        {colorIdx === 0 && (
                          <td className="p-2 font-medium" rowSpan={getAvailableColors(library).length}>{size}M</td>
                        )}
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: color.hex }}
                            />
                            {getColorName(color.id, library, lang)}
                          </div>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.sku || ''}
                            onChange={(e) => updateDecorFace(key, 'sku', e.target.value)}
                            placeholder={t.enterSku}
                            className="w-full border rounded px-2 py-1 text-sm font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            value={purchasePrice}
                            onChange={(e) => {
                              const newPurchase = parseFloat(e.target.value) || 0;
                              const newPrice = calcPriceWithVat(newPurchase, markup);
                              safeOnUpdate({
                                ...library,
                                decorFaces: {
                                  ...library.decorFaces,
                                  [key]: { ...item, purchasePrice: newPurchase, price: newPrice }
                                }
                              });
                            }}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <PriceInput
                            value={markup}
                            onChange={(newMarkup) => {
                              const newPrice = calcPriceWithVat(purchasePrice, newMarkup);
                              safeOnUpdate({
                                ...library,
                                decorFaces: {
                                  ...library.decorFaces,
                                  [key]: { ...item, markup: newMarkup, price: newPrice }
                                }
                              });
                            }}
                            step="1"
                            decimals={0}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <PriceInput
                            value={sellingWithoutVat}
                            onChange={(newSellingWithoutVat) => {
                              const newPrice = calcPriceWithVatFromWithout(newSellingWithoutVat);
                              const newMarkup = calcMarkupFromPriceWithoutVat(purchasePrice, newSellingWithoutVat);
                              safeOnUpdate({
                                ...library,
                                decorFaces: {
                                  ...library.decorFaces,
                                  [key]: { ...item, markup: newMarkup, price: newPrice }
                                }
                              });
                            }}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <PriceInput
                            value={priceWithVat}
                            onChange={(newPrice) => {
                              const newMarkup = calcMarkupFromPriceWithVat(purchasePrice, newPrice);
                              safeOnUpdate({
                                ...library,
                                decorFaces: {
                                  ...library.decorFaces,
                                  [key]: { ...item, markup: newMarkup, price: newPrice }
                                }
                              });
                            }}
                            className="w-full border rounded px-2 py-1 text-sm font-medium"
                          />
                        </td>
                      </tr>
                    );
                  })
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
