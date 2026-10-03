import React, { useState } from 'react';
import { Plus, Trash2, ChevronLeft, Box, Layers } from 'lucide-react';
import { RoomSelector } from './RoomSelector';
import { ModuleImage } from './visual/ModuleVisuals';
import { getSystemProportions } from '../data/libraries';
import { sizeLabel, capacityLabel, freeLabel, isPostSystem, postsOf, wallBoxMode, wallBoxLines, hasSeparateSupports, postLayout, halfPostSupportOf, moduleSizeLabel, layoutModules, fitsInFrame } from '../lib/mounting';
import { adjustBrightness } from '../graphics/colors';
import { useTranslation, useLanguage } from '../i18n';
import { calculateModulesSize, createModuleInstance } from '../lib/assemblies';
import { getAvailableColors, getAvailableSizes, isDarkColor, getColorName, LibraryContext, getWallBoxSku, getInstallFaceSku, getDecorFaceSku, getModuleSku, getModuleFaceSku, getModuleName, getModuleCatalog } from '../lib/library';

export function AssemblyEditor({ assembly, onBack, onUpdate, existingRooms = [] }) {
  const [draggedModule, setDraggedModule] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);
  const [dragOverFace, setDragOverFace] = useState(false);
  const facePlateContainerRef = React.useRef(null);
  const [facePlateScale, setFacePlateScale] = useState(1);
  const [notesValue, setNotesValue] = useState(assembly.notes || '');

  // Get library and translations from context
  const library = React.useContext(LibraryContext);
  const t = useTranslation();
  const lang = useLanguage();
  const MODULE_CATALOG = getModuleCatalog(library);

  const usedSize = calculateModulesSize(assembly.modules, library);
  const remainingSize = assembly.size - usedSize;
  const isOverCapacity = remainingSize < 0;

  const updateField = (field, value) => {
    onUpdate({ ...assembly, [field]: value });
  };

  // Încape modulul? La sistemele cu posturi, pe subtotaluri de post (un post întreg sare
  // în postul următor dacă cel curent e început), nu doar pe suma modulelor
  const canAddModuleId = (moduleId, atIndex = assembly.modules.length) => {
    const next = [...assembly.modules];
    next.splice(atIndex, 0, { moduleId });
    return fitsInFrame(next, assembly.size, library);
  };

  // Quick add module
  const addModule = (moduleId) => {
    const catalogItem = MODULE_CATALOG.find(c => c.id === moduleId);
    if (catalogItem && canAddModuleId(moduleId)) {
      const newModule = createModuleInstance(moduleId);
      onUpdate({ ...assembly, modules: [...assembly.modules, newModule] });
    }
  };

  // Pozițiile modulelor în ramă (la posturi: cu goluri de aliniere, gapBefore)
  const moduleSlots = layoutModules(assembly.modules, library);

  // Drag from catalog
  const handleCatalogDragStart = (e, moduleId) => {
    const catalogItem = MODULE_CATALOG.find(c => c.id === moduleId);
    if (catalogItem && canAddModuleId(moduleId)) {
      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'catalog', moduleId }));
      e.dataTransfer.effectAllowed = 'copy';

      // Find the ModuleImage container in the dragged row and use it as drag image
      const moduleImageContainer = e.currentTarget.querySelector('.module-drag-preview');
      if (moduleImageContainer) {
        const rect = moduleImageContainer.getBoundingClientRect();
        e.dataTransfer.setDragImage(moduleImageContainer, rect.width / 2, rect.height / 2);
      }

      setDraggedModule({ type: 'catalog', moduleId });
    }
  };

  // Drag from installed slot
  const handleSlotDragStart = (e, slotIndex) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'installed', index: slotIndex }));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedModule({ type: 'installed', index: slotIndex });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFace(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverFace(false);
    setDragOverSlot(null);
  };

  const handleSlotDragOver = (e, slotIndex) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlot(slotIndex);
    setDragOverFace(true);
  };

  const handleDrop = (e, dropIndex = null) => {
    e.preventDefault();
    e.stopPropagation();

    let dragData = draggedModule;

    // Try to get data from dataTransfer if state is lost
    if (!dragData) {
      try {
        const data = e.dataTransfer.getData('text/plain');
        if (data) {
          dragData = JSON.parse(data);
        }
      } catch {
        console.log('Could not parse drag data');
      }
    }

    if (!dragData) {
      resetDragState();
      return;
    }

    if (dragData.type === 'catalog') {
      // Add new module from catalog
      const catalogItem = MODULE_CATALOG.find(c => c.id === dragData.moduleId);
      const insertAt = dropIndex !== null && dropIndex >= 0 ? dropIndex : assembly.modules.length;
      if (catalogItem && canAddModuleId(dragData.moduleId, insertAt)) {
        const newModule = createModuleInstance(dragData.moduleId);
        let newModules = [...assembly.modules];

        if (dropIndex !== null && dropIndex >= 0) {
          newModules.splice(dropIndex, 0, newModule);
        } else {
          newModules.push(newModule);
        }

        onUpdate({ ...assembly, modules: newModules });
      }
    } else if (dragData.type === 'installed') {
      // Reorder existing module
      const fromIndex = dragData.index;
      let toIndex = dropIndex !== null ? dropIndex : assembly.modules.length - 1;

      if (fromIndex !== toIndex && fromIndex >= 0 && fromIndex < assembly.modules.length) {
        const newModules = [...assembly.modules];
        const [moved] = newModules.splice(fromIndex, 1);
        // Adjust index if moving forward
        if (toIndex > fromIndex) {
          toIndex--;
        }
        newModules.splice(Math.max(0, toIndex), 0, moved);
        onUpdate({ ...assembly, modules: newModules });
      }
    }

    resetDragState();
  };

  const handleRemoveModule = (index) => {
    const newModules = assembly.modules.filter((_, i) => i !== index);
    onUpdate({ ...assembly, modules: newModules });
  };

  const resetDragState = () => {
    setDraggedModule(null);
    setDragOverSlot(null);
    setDragOverFace(false);
  };

  // Get derived SKUs
  const wallBoxSku = getWallBoxSku(assembly.size, assembly.wallBoxType || 'masonry', library);
  const installFaceSku = getInstallFaceSku(assembly.size, library);
  const decorFaceSku = getDecorFaceSku(assembly.size, assembly.color, library);
  const wallBoxTypeLabel = (assembly.wallBoxType || 'masonry') === 'drywall' ? t.drywall : t.masonry;

  // Visual dimensions - from system proportions
  const props = getSystemProportions(library);
  const baseScale = 4;
  // Normalize so modules are similar pixel size across systems (match BTicino module height of 31)
  const normalizedScale = 31 / props.moduleHeight;
  const effectiveScale = baseScale * normalizedScale;

  const moduleWidth1M = props.moduleWidth1M * effectiveScale;
  const moduleHeight = props.moduleHeight * effectiveScale;
  const sideMargin = props.sideMargin * effectiveScale;
  const topMargin = props.topMargin * effectiveScale;
  const bottomMargin = props.bottomMargin * effectiveScale;
  const faceHeight = topMargin + moduleHeight + bottomMargin;
  const cornerRadius = props.cornerRadius * effectiveScale;
  const moduleCornerRadius = props.moduleCornerRadius * effectiveScale;
  const slotInset = (props.slotInset || 0) * effectiveScale; // ferestrele posturilor
  const postCount = isPostSystem(library) ? postsOf(assembly.size, library) : 0;
  const moduleAreaWidth = assembly.size * moduleWidth1M;
  const faceWidth = moduleAreaWidth + (sideMargin * 2);

  // Scale face plate down if it's wider than the container
  React.useEffect(() => {
    const el = facePlateContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Available width = container width minus padding (p-6 = 24px each side) and face margin (10px each side)
        const available = entry.contentRect.width - 20; // 10px margin each side
        if (faceWidth > available && available > 0) {
          setFacePlateScale(available / faceWidth);
        } else {
          setFacePlateScale(1);
        }
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [faceWidth]);

  const availableColors = getAvailableColors(library);
  const colorInfo = availableColors.find(c => c.id === assembly.color);
  const _detailDark = isDarkColor(assembly.color, library);
  const faceBgColor = colorInfo?.hex || (_detailDark ? '#454545' : '#f0f0f0');

  const _wbMasonry = (assembly.wallBoxType || 'masonry') === 'masonry';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-blue-600 mb-4 hover:text-blue-800"
      >
        <ChevronLeft className="w-4 h-4" /> {t.backToList}
      </button>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-2xl font-bold font-mono">{assembly.code}</h1>
          <span className={`px-3 py-1 rounded text-sm font-medium ${
            isOverCapacity ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {capacityLabel(usedSize, assembly.size, library, lang)} {t.used}
            {isOverCapacity && ` (${t.overCapacity})`}
          </span>
          {postLayout(assembly.modules, library).straddling && (
            <span className="text-sm text-amber-700">⚠ {lang === 'ro' ? 'Un mecanism de un post întreg nu poate sta între două posturi. Pune modulele de 1/2 în perechi, pe același post.' : 'A full-post device cannot sit across two posts. Put half modules in pairs on the same post.'}</span>
          )}
        </div>

        {/* Basic Settings */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.room}</label>
            <RoomSelector
              value={assembly.room}
              onChange={(room) => updateField('room', room)}
              existingRooms={existingRooms}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.size}</label>
            <select
              value={assembly.size}
              onChange={(e) => updateField('size', parseInt(e.target.value))}
              className="w-full border rounded px-3 py-2"
            >
              {getAvailableSizes(library).map(s => (
                <option key={s} value={s}>{sizeLabel(s, library, lang)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.color}</label>
            <select
              value={assembly.color}
              onChange={(e) => updateField('color', e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              {availableColors.map(c => (
                <option key={c.id} value={c.id}>{getColorName(c.id, library, lang)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.wallBoxType}</label>
            <select
              value={assembly.wallBoxType || 'masonry'}
              onChange={(e) => updateField('wallBoxType', e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="masonry">{t.masonry}</option>
              <option value="drywall">{t.drywall}</option>
            </select>
          </div>
          {isPostSystem(library) && postsOf(assembly.size, library) > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{lang === 'ro' ? 'Doze' : 'Wall boxes'}</label>
              <select
                value={wallBoxMode(assembly, library)}
                onChange={(e) => updateField('wallBoxMode', e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="single">{lang === 'ro' ? 'Doze individuale' : 'Individual boxes'}</option>
                <option value="multi">{lang === 'ro' ? 'Doză multi-post' : 'Multi-post box'}</option>
              </select>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.notes}</label>
          <input
            type="text"
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            onBlur={() => {
              const notes = notesValue.trim();
              if (notes !== (assembly.notes || '')) updateField('notes', notes);
            }}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
            placeholder={t.addNote}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Auto-derived SKUs */}
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Box className="w-4 h-4" /> {t.assemblyComponents}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {isPostSystem(library) ? wallBoxLines(assembly, library, lang).map((line, i) => (
              <div key={i} className="flex justify-between p-2 bg-white rounded border">
                <span className="text-gray-600">
                  {line.qty} × {t.wallBox} {line.label} ({wallBoxTypeLabel})
                  {line.fallback && <span className="text-amber-700" title={lang === 'ro' ? 'Doza multi-post nu e definită pentru această mărime' : 'No multi-post box defined for this size'}> ⚠</span>}
                </span>
                <span className="font-mono text-gray-400">{getWallBoxSku(line.size, assembly.wallBoxType || 'masonry', library) || '—'}</span>
              </div>
            )) : (
            <div className="flex justify-between p-2 bg-white rounded border">
              <span className="text-gray-600">{t.wallBox} {assembly.size}M ({wallBoxTypeLabel})</span>
              <span className="font-mono text-gray-400">{wallBoxSku || '—'}</span>
            </div>
            )}
            {hasSeparateSupports(library) && (
            <div className="flex justify-between p-2 bg-white rounded border">
              <span className="text-gray-600">{t.installFace} {sizeLabel(assembly.size, library, lang)}</span>
              <span className="font-mono text-gray-400">{installFaceSku || '—'}</span>
            </div>
            )}
            {postLayout(assembly.modules, library).halfPosts > 0 && halfPostSupportOf(library) && (
            <div className="flex justify-between p-2 bg-white rounded border">
              <span className="text-gray-600">{postLayout(assembly.modules, library).halfPosts} × {t.halfPostSupportItem}</span>
              <span className="font-mono text-gray-400">{halfPostSupportOf(library).sku || '—'}</span>
            </div>
            )}
            <div className="flex justify-between p-2 bg-white rounded border">
              <span className="text-gray-600">{hasSeparateSupports(library) ? t.decorFace : t.coverPlateWithSupportItem} {sizeLabel(assembly.size, library, lang)} {getColorName(assembly.color, library, lang)}</span>
              <span className="font-mono text-gray-400">{decorFaceSku || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Assembly Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Face Plate */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4" /> {t.visualAssembly}
          </h2>

          <div
            ref={facePlateContainerRef}
            className="flex justify-center mb-4 p-6 rounded-lg"
            style={_wbMasonry ? {
              backgroundColor: '#f0d4d0',
              backgroundImage: 'linear-gradient(45deg, #e8ccc8 25%, transparent 25%), linear-gradient(-45deg, #e8ccc8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e8ccc8 75%), linear-gradient(-45deg, transparent 75%, #e8ccc8 75%)',
              backgroundSize: '4px 4px',
              backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px',
            } : {
              backgroundColor: '#e3f2e6',
              backgroundImage: 'none',
            }}
          >
            {/* Face plate container - wrapper handles layout size, inner div handles visual scale */}
            <div style={{
              width: faceWidth * facePlateScale,
              height: faceHeight * facePlateScale,
              margin: '10px',
            }}>
            <div
              className={`relative transition-all origin-top-left ${
                dragOverFace ? 'ring-2 ring-blue-400 ring-offset-2' : ''
              }`}
              style={{
                width: faceWidth,
                height: faceHeight,
                backgroundColor: faceBgColor,
                borderRadius: cornerRadius,
                transform: facePlateScale < 1 ? `scale(${facePlateScale})` : undefined,
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, null)}
            >
              {/* Top/bottom margins (frame edges) - only if system has them */}
              {topMargin > 0 && (
                <>
                  <div className="absolute left-0 right-0 top-0 pointer-events-none" style={{ height: topMargin, backgroundColor: faceBgColor, zIndex: 3 }} />
                  <div className="absolute left-0 right-0 bottom-0 pointer-events-none" style={{ height: bottomMargin, backgroundColor: faceBgColor, zIndex: 3 }} />
                </>
              )}

              {/* Side margins (face plate edges) */}
              <div className="absolute top-0 bottom-0 left-0 pointer-events-none" style={{ width: sideMargin, backgroundColor: faceBgColor, zIndex: 3 }} />
              <div className="absolute top-0 bottom-0 right-0 pointer-events-none" style={{ width: sideMargin, backgroundColor: faceBgColor, zIndex: 3 }} />

              {/* Support frame bars - only for systems that have them (BTicino) */}
              {props.hasSupportBars && (
                <>
                  <div className="absolute" style={{ left: sideMargin, right: sideMargin, top: topMargin + 10, height: 16, backgroundColor: '#4a4a4a', zIndex: 0 }} />
                  <div className="absolute" style={{ left: sideMargin, right: sideMargin, bottom: bottomMargin + 10, height: 16, backgroundColor: '#4a4a4a', zIndex: 0 }} />
                </>
              )}

              {/* Slot grid background */}
              <div
                className="absolute flex"
                style={{ left: sideMargin, right: sideMargin, top: topMargin, height: moduleHeight, gap: 0, zIndex: 1 }}
              >
                {slotInset > 0 ? Array.from({ length: postCount }).map((_, i) => (
                  <div key={i} className="flex-shrink-0" style={{ width: (props.postSize || 2) * moduleWidth1M, height: moduleHeight, padding: slotInset, boxSizing: 'border-box' }}>
                    <div className="border border-dashed w-full h-full" style={{ borderColor: _detailDark ? '#555' : '#ccc', borderRadius: moduleCornerRadius }} />
                  </div>
                )) : Array.from({ length: assembly.size }).map((_, i) => (
                  <div
                    key={i}
                    className="border border-dashed flex-shrink-0"
                    style={{
                      width: moduleWidth1M,
                      height: moduleHeight,
                      borderColor: _detailDark ? '#555' : '#ccc',
                      borderRadius: moduleCornerRadius,
                    }}
                  />
                ))}
              </div>

              {/* Installed modules */}
              <div
                className="absolute flex"
                style={{ left: sideMargin, right: sideMargin, top: topMargin, height: moduleHeight, zIndex: 5 }}
              >
                {moduleSlots.map((slot, idx) => {
                  const isDragging = draggedModule?.type === 'installed' && draggedModule?.index === idx;
                  // Fereastra postului: marginea ramei doar spre exteriorul postului (jumătățile se ating la mijloc)
                  const postStep = props.postSize || 2;
                  const insetL = slotInset > 0 && slot.startPos % postStep === 0 ? slotInset : 0;
                  const insetR = slotInset > 0 && (slot.startPos + slot.size) % postStep === 0 ? slotInset : 0;
                  const isDragOver = dragOverSlot === idx;

                  return (
                    <div
                      key={slot.id}
                      draggable
                      onDragStart={(e) => handleSlotDragStart(e, idx)}
                      onDragEnd={resetDragState}
                      onDragOver={(e) => handleSlotDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      className={`relative flex-shrink-0 cursor-grab active:cursor-grabbing transition-all duration-150 group ${
                        isDragging ? 'opacity-40 scale-95' : 'hover:scale-110 hover:z-20 hover:shadow-xl'
                      } ${isDragOver ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                      style={slotInset > 0 ? {
                        width: slot.size * moduleWidth1M,
                        height: moduleHeight,
                        marginLeft: slot.gapBefore * moduleWidth1M,
                      } : {
                        width: slot.size * moduleWidth1M,
                        height: moduleHeight,
                        marginLeft: slot.gapBefore * moduleWidth1M,
                        backgroundColor: colorInfo?.hex || (_detailDark ? '#3a3a3a' : '#f5f5f5'),
                        border: `1.5px solid ${_detailDark ? adjustBrightness(colorInfo?.hex || '#3a3a3a', 30) : adjustBrightness(colorInfo?.hex || '#f5f5f5', -25)}`,
                        borderRadius: moduleCornerRadius,
                      }}
                    >
                      {/* Module image - fills the module (at post systems: the post window, inset in the step) */}
                      <div
                        className={`absolute flex items-center justify-center overflow-hidden ${slotInset > 0 ? '' : 'inset-0'}`}
                        style={slotInset > 0 ? {
                          top: slotInset,
                          bottom: slotInset,
                          left: insetL,
                          right: insetR,
                          backgroundColor: colorInfo?.hex || (_detailDark ? '#3a3a3a' : '#f5f5f5'),
                          border: `1.5px solid ${_detailDark ? adjustBrightness(colorInfo?.hex || '#3a3a3a', 30) : adjustBrightness(colorInfo?.hex || '#f5f5f5', -25)}`,
                          borderRadius: moduleCornerRadius,
                        } : undefined}
                      >
                        <ModuleImage
                          moduleId={slot.moduleId}
                          graphic={slot.catalogItem?.graphic}
                          color={assembly.color}
                          colorHex={colorInfo?.hex}
                          width={slot.size * moduleWidth1M - insetL - insetR}
                          height={moduleHeight - 2 * slotInset}
                        />
                      </div>

                      {/* Hover overlay - on top of module image */}
                      <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none z-10" />

                      {/* Remove button - visible on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveModule(idx);
                        }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow z-50 opacity-70 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="text-xs">×</span>
                      </button>
                    </div>
                  );
                })}

                {/* Empty drop zone indicator */}
                {remainingSize > 0 && (
                  <div
                    className={`flex-shrink-0 border-2 border-dashed flex items-center justify-center transition-all ${
                      draggedModule ? 'border-blue-400 bg-blue-100/30' : 'border-gray-300'
                    }`}
                    style={{
                      width: remainingSize * moduleWidth1M,
                      height: moduleHeight,
                    }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, assembly.modules.length)}
                  >
                    {draggedModule ? (
                      <span className="text-xs text-blue-600 font-medium">{t.dropHere}</span>
                    ) : (
                      <span className="text-xs text-gray-400">{remainingSize}M {t.free}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>

          {/* Capacity bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{t.capacity}</span>
              <span>{capacityLabel(usedSize, assembly.size, library, lang)} ({freeLabel(remainingSize, library, lang)} {t.free})</span>
            </div>
            <div className="h-3 bg-gray-200 rounded overflow-hidden flex">
              {moduleSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="h-full bg-blue-500 border-r border-blue-600 last:border-r-0"
                  style={{ width: `${(slot.size / assembly.size) * 100}%`, marginLeft: `${(slot.gapBefore / assembly.size) * 100}%` }}
                  title={getModuleName(slot.catalogItem, lang)}
                />
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3 text-center">
            💡 {t.dragHint}
          </p>

          {/* Installed modules list */}
          {assembly.modules.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium text-gray-700 mb-2">{t.installed} ({assembly.modules.length})</h3>
              <ul className="space-y-1 text-sm">
                {assembly.modules.map((mod, idx) => {
                  const catalogItem = MODULE_CATALOG.find(c => c.id === mod.moduleId);
                  const moduleSku = getModuleSku(mod.moduleId, assembly.color, library);
                  const faceSku = getModuleFaceSku(mod.moduleId, assembly.color, library);
                  return (
                    <li key={mod.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{idx + 1}. {getModuleName(catalogItem, lang)} ({moduleSizeLabel(catalogItem?.size || 1)})</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-mono">
                          {moduleSku || '—'} / {faceSku || '—'}
                        </span>
                        <button
                          onClick={() => handleRemoveModule(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Module Catalog */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">{t.availableModules}</h2>
          <p className="text-sm text-gray-500 mb-3">
            {t.remainingCapacity}: <span className="font-medium">{freeLabel(Math.max(0, remainingSize), library, lang)}</span>
          </p>
          <div className="space-y-2">
            {MODULE_CATALOG.map((mod) => {
              const canAdd = canAddModuleId(mod.id);
              return (
                <div
                  key={mod.id}
                  draggable={canAdd}
                  onDragStart={(e) => handleCatalogDragStart(e, mod.id)}
                  onDragEnd={resetDragState}
                  className={`p-3 rounded border flex justify-between items-center transition-all ${
                    canAdd
                      ? 'hover:bg-blue-50 hover:border-blue-300 cursor-grab active:cursor-grabbing'
                      : 'opacity-50 cursor-not-allowed bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: 40, // Fixed container width for text alignment
                        height: 56,
                      }}
                    >
                      <div
                        className="module-drag-preview rounded bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-300"
                        style={{
                          width: (() => { const p = getSystemProportions(library); const ar = mod.size === 2 ? (p.moduleWidth1M * 2 / p.moduleHeight) : (p.moduleWidth1M / p.moduleHeight); return Math.round(52 * ar); })(),
                          height: 52,
                        }}
                      >
                        <ModuleImage
                          moduleId={mod.id}
                          graphic={mod.graphic}
                          moduleSize={mod.size}
                          color="white"
                          width={(() => { const p = getSystemProportions(library); const ar = mod.size === 2 ? (p.moduleWidth1M * 2 / p.moduleHeight) : (p.moduleWidth1M / p.moduleHeight); return Math.round(52 * ar); })()}
                          height={52}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">{getModuleName(mod, lang)}</span>
                      {library?.hasModuleFaces !== false && (
                        <span className="text-xs text-gray-400 ml-2">+ {t.face}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium bg-gray-100 px-2 py-0.5 rounded">
                      {moduleSizeLabel(mod.size)}
                    </span>
                    <button
                      onClick={() => addModule(mod.id)}
                      disabled={!canAdd}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        canAdd
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      title={canAdd ? `${t.add} ${getModuleName(mod, lang)}` : t.overCapacity}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
