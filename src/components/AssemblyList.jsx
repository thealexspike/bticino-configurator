import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Settings, FileText, Home, Copy, MessageSquare, ArrowRightLeft , MapPin, Camera } from 'lucide-react';
import { AssemblyThumbnail } from './visual/ModuleVisuals';
import { useTranslation, useLanguage } from '../i18n';
import { useReadOnly } from '../readOnly';
import { usePlanLink, ASSEMBLY_DRAG_TYPE } from '../planLink';
import { calculateModulesSize } from '../lib/assemblies';
import { sizeLabel, capacityLabel, isPostSystem, postsOf, wallBoxMode, wallBoxLines } from '../lib/mounting';
import { getAvailableColors, getAvailableSizes, isDarkColor, LibraryContext, getModuleName, getModuleCatalog } from '../lib/library';
import { generateAssemblyListPdf } from '../pdf/assemblyListPdf';

export function AssemblyList({ assemblies, type, project, onAdd, onAddEmpty, onEdit, onDelete, onDuplicate, onConfirmDuplicate, onCancelDuplicate, confirmDuplicateId, onReorder, onUpdate, onMoveToType, existingRooms = [] }) {
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dragOverRoom, setDragOverRoom] = useState(null);
  const [editingCodeId, setEditingCodeId] = useState(null);
  const [editingCodeValue, setEditingCodeValue] = useState('');
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editingRoomValue, setEditingRoomValue] = useState('');
  const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);
  const [groupByRoom, setGroupByRoom] = useState(false);
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [editingNotesValue, setEditingNotesValue] = useState('');
  const skipNotesBlur = React.useRef(false);

  // Get library and translations from context
  const library = React.useContext(LibraryContext);
  const t = useTranslation();
  const lang = useLanguage();
  const readOnly = useReadOnly();
  const planLink = usePlanLink();
  const MODULE_CATALOG = getModuleCatalog(library);

  const sortedAssemblies = [...assemblies].sort((a, b) => a.code.localeCompare(b.code));
  const addLabel = type === 'outlet' ? t.addOutlet : t.addSwitch;
  const noItemsLabel = type === 'outlet' ? t.noOutlets : t.noSwitches;
  const prefix = type === 'outlet' ? 'P' : 'I';

  // Group assemblies by room
  const groupedByRoom = useMemo(() => {
    const groups = {};
    sortedAssemblies.forEach(assembly => {
      const room = assembly.room || t.noRoom;
      if (!groups[room]) {
        groups[room] = [];
      }
      groups[room].push(assembly);
    });
    // Sort rooms alphabetically, but put "No room" at the end
    const sortedRooms = Object.keys(groups).sort((a, b) => {
      if (a === t.noRoom) return 1;
      if (b === t.noRoom) return -1;
      return a.localeCompare(b);
    });
    return { groups, sortedRooms };
  }, [sortedAssemblies, t.noRoom]);

  // Common room suggestions (translated)
  const defaultRooms = useMemo(() => [
    t.livingRoom, t.kitchen, `${t.bedroom} 1`, `${t.bedroom} 2`, `${t.bedroom} 3`,
    `${t.bathroom} 1`, `${t.bathroom} 2`, t.hallway, t.entrance, t.office,
    t.diningRoom, t.garage, t.laundry, t.storage, t.balcony
  ], [t]);

  const allRoomSuggestions = useMemo(() => {
    const existing = existingRooms.filter(r => r && r.trim());
    return [...new Set([...existing, ...defaultRooms])];
  }, [existingRooms, defaultRooms]);

  const filteredRoomSuggestions = useMemo(() => {
    if (!editingRoomValue.trim()) return allRoomSuggestions;
    const lower = editingRoomValue.toLowerCase();
    return allRoomSuggestions.filter(room => room.toLowerCase().includes(lower));
  }, [editingRoomValue, allRoomSuggestions]);

  const handleDragStart = (e, assembly) => {
    setDraggedId(assembly.id);
    e.dataTransfer.effectAllowed = 'move';
    // Permite și tragerea pe plan, când panoul de plan e deschis
    e.dataTransfer.setData(ASSEMBLY_DRAG_TYPE, assembly.id);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedId && onReorder) {
      onReorder(draggedId, targetIndex, type);
    }
    setDraggedId(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverIndex(null);
    setDragOverRoom(null);
  };

  // Room drag handlers for grouped view
  const handleRoomDragOver = (e, room) => {
    e.preventDefault();
    setDragOverRoom(room);
  };

  const handleRoomDragLeave = () => {
    setDragOverRoom(null);
  };

  const handleRoomDrop = (e, targetRoom) => {
    e.preventDefault();
    if (draggedId && onUpdate) {
      const assembly = assemblies.find(a => a.id === draggedId);
      if (assembly) {
        // Convert "Fără cameră" / "No room" back to empty string
        const newRoom = targetRoom === t.noRoom ? '' : targetRoom;
        if (assembly.room !== newRoom) {
          onUpdate({ ...assembly, room: newRoom });
        }
      }
    }
    setDraggedId(null);
    setDragOverRoom(null);
  };

  const startEditingCode = (assembly, e) => {
    e.stopPropagation();
    if (readOnly) return;
    setEditingCodeId(assembly.id);
    const num = parseInt(assembly.code.slice(1));
    setEditingCodeValue(String(num));
  };

  const handleCodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setEditingCodeValue(val);
  };

  const handleCodeSubmit = (assemblyId) => {
    const newNum = parseInt(editingCodeValue);
    if (!isNaN(newNum) && newNum >= 1 && onReorder) {
      const targetIndex = Math.min(newNum - 1, sortedAssemblies.length - 1);
      onReorder(assemblyId, Math.max(0, targetIndex), type);
    }
    setEditingCodeId(null);
    setEditingCodeValue('');
  };

  const handleCodeKeyDown = (e, assemblyId) => {
    if (e.key === 'Enter') {
      handleCodeSubmit(assemblyId);
    } else if (e.key === 'Escape') {
      setEditingCodeId(null);
      setEditingCodeValue('');
    }
  };

  // Size change handler
  const handleSizeChange = (assembly, newSize) => {
    if (onUpdate) {
      onUpdate({ ...assembly, size: parseInt(newSize) });
    }
  };

  // Room editing handlers
  const startEditingRoom = (assembly, e) => {
    e.stopPropagation();
    if (readOnly) return;
    setEditingRoomId(assembly.id);
    setEditingRoomValue(assembly.room || '');
    setRoomDropdownOpen(true);
  };

  const handleRoomChange = (e) => {
    setEditingRoomValue(e.target.value);
    setRoomDropdownOpen(true);
  };

  const handleRoomSelect = (assembly, room) => {
    if (onUpdate) {
      onUpdate({ ...assembly, room });
    }
    setEditingRoomId(null);
    setEditingRoomValue('');
    setRoomDropdownOpen(false);
  };

  const handleRoomSubmit = (assembly) => {
    if (onUpdate) {
      onUpdate({ ...assembly, room: editingRoomValue });
    }
    setEditingRoomId(null);
    setEditingRoomValue('');
    setRoomDropdownOpen(false);
  };

  const handleRoomKeyDown = (e, assembly) => {
    if (e.key === 'Enter') {
      handleRoomSubmit(assembly);
    } else if (e.key === 'Escape') {
      setEditingRoomId(null);
      setEditingRoomValue('');
      setRoomDropdownOpen(false);
    }
  };

  const handleRoomBlur = (assembly) => {
    setTimeout(() => {
      handleRoomSubmit(assembly);
    }, 150);
  };

  // Notes editing handlers
  const startEditingNotes = (assembly, e) => {
    e.stopPropagation();
    if (readOnly) return;
    skipNotesBlur.current = false;
    setEditingNotesId(assembly.id);
    setEditingNotesValue(assembly.notes || '');
  };

  const handleNotesSubmit = (assembly) => {
    if (skipNotesBlur.current) {
      skipNotesBlur.current = false;
      return;
    }
    const notes = editingNotesValue.trim();
    if (onUpdate && notes !== (assembly.notes || '')) {
      onUpdate({ ...assembly, notes });
    }
    setEditingNotesId(null);
    setEditingNotesValue('');
  };

  const handleNotesKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    } else if (e.key === 'Escape') {
      skipNotesBlur.current = true;
      setEditingNotesId(null);
      setEditingNotesValue('');
    }
  };

  // Render a single assembly item
  const renderAssemblyItem = (assembly, index, showRoom = true) => {
    const usedSize = calculateModulesSize(assembly.modules, library);
    const availableColors = getAvailableColors(library);
    const colorInfo = availableColors.find(c => c.id === assembly.color);
    const isDragging = draggedId === assembly.id;
    const isDragOver = !groupByRoom && dragOverIndex === index && draggedId !== assembly.id;
    // Collapse consecutive identical modules into one chip (e.g. 3x Switch), keeping left-to-right order
    const moduleGroups = assembly.modules.reduce((groups, mod) => {
      const last = groups[groups.length - 1];
      if (last && last.moduleId === mod.moduleId) last.count++;
      else groups.push({ moduleId: mod.moduleId, count: 1 });
      return groups;
    }, []);

    // Cu planul deschis lista are doar ~30% din lățime: rând compact pe două linii
    // (acțiunile sus în dreapta, fără schiță — se vede pe plan, la hover și în fișă).
    const compact = !!planLink.active;
    const selCls = compact
      ? 'text-xs px-1 py-0 rounded border-0 cursor-pointer'
      : 'text-sm px-2 py-0.5 rounded border-0 cursor-pointer';
    const btnPad = compact ? 'p-1' : 'p-2';

    const pinEl = (
          <>
            {/* Pe plan: iconiță; click = arată pe plan */}
            {assembly.planId && planLink.planNames?.[assembly.planId] && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); planLink.locate?.(assembly.id); }}
                disabled={!planLink.active}
                className="text-teal-600 hover:text-teal-800 disabled:hover:text-teal-600 disabled:cursor-default -mr-2"
                title={(lang === 'ro' ? 'Pe plan: ' : 'On plan: ') + planLink.planNames[assembly.planId]}
              >
                <MapPin className="w-4 h-4" />
              </button>
            )}
          </>
        );
    const codeEl = (
          <>
            {/* Code (position) editor */}
            {editingCodeId === assembly.id ? (
              <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                <span className="font-mono font-bold text-lg">{prefix}</span>
                <input
                  type="text"
                  value={editingCodeValue}
                  onChange={handleCodeChange}
                  onBlur={() => handleCodeSubmit(assembly.id)}
                  onKeyDown={(e) => handleCodeKeyDown(e, assembly.id)}
                  className="w-12 font-mono font-bold text-lg border rounded px-1 ml-0.5"
                  autoFocus
                  maxLength={2}
                />
              </div>
            ) : (
              <span 
                className={`font-mono font-bold ${compact ? 'text-base' : 'text-lg'} hover:bg-blue-100 px-1 rounded cursor-text`}
                onClick={(e) => startEditingCode(assembly, e)}
                title="Click to change position"
              >
                {assembly.code}
              </span>
            )}

          </>
        );
    const sizeEl = (
          <>
            {/* Size selector */}
            <select
              value={assembly.size}
              disabled={readOnly}
              onChange={(e) => {
                e.stopPropagation();
                handleSizeChange(assembly, e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              className={`${selCls} bg-gray-100 hover:bg-gray-200`}
              title="Change size"
            >
              {getAvailableSizes(library).map(s => (
                <option key={s} value={s}>{sizeLabel(s, library, lang)}</option>
              ))}
            </select>

          </>
        );
    const colorEl = (
          <>
            {/* Color selector */}
            <select
              value={assembly.color}
              disabled={readOnly}
              onChange={(e) => {
                e.stopPropagation();
                if (onUpdate) {
                  onUpdate({ ...assembly, color: e.target.value });
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className={`${selCls} hover:opacity-80`}
              style={{ 
                backgroundColor: colorInfo?.hex,
                color: isDarkColor(assembly.color, library) ? '#fff' : '#333'
              }}
              title="Change color"
            >
              {availableColors.map(c => (
                <option key={c.id} value={c.id}>{c.nameEn || c.name}</option>
              ))}
            </select>

          </>
        );
    const wallEl = (
          <>
            {/* Wall box type selector */}
            <select
              value={assembly.wallBoxType || 'masonry'}
              disabled={readOnly}
              onChange={(e) => {
                e.stopPropagation();
                if (onUpdate) {
                  onUpdate({ ...assembly, wallBoxType: e.target.value });
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className={`${selCls} hover:opacity-80`}
              style={{
                backgroundColor: (assembly.wallBoxType || 'masonry') === 'masonry' ? '#fee2e2' : '#dcfce7',
                color: (assembly.wallBoxType || 'masonry') === 'masonry' ? '#991b1b' : '#166534',
              }}
              title={t.wallBoxType}
            >
              <option value="masonry">{t.masonry}</option>
              <option value="drywall">{t.drywall}</option>
            </select>

          </>
        );
    const capacityEl = (
          <>
            {/* Capacity indicator */}
            <span className={`${compact ? 'text-xs px-1.5' : 'text-sm px-2'} py-0.5 rounded whitespace-nowrap ${
              usedSize > assembly.size ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {capacityLabel(usedSize, assembly.size, library, lang)}
            </span>
          </>
        );
    const roomEl = (
          <>
            {showRoom && (
              <>
                <Home className="w-3 h-3" />
                {editingRoomId === assembly.id ? (
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingRoomValue}
                      onChange={handleRoomChange}
                      onBlur={() => handleRoomBlur(assembly)}
                      onKeyDown={(e) => handleRoomKeyDown(e, assembly)}
                      onFocus={() => setRoomDropdownOpen(true)}
                      placeholder={t.room + '...'}
                      className="border rounded px-2 py-0.5 text-sm w-40"
                      autoFocus
                    />
                    {roomDropdownOpen && filteredRoomSuggestions.length > 0 && (
                      <ul className="absolute z-20 w-48 mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-auto">
                        {filteredRoomSuggestions.map((room, idx) => {
                          const isExisting = existingRooms.includes(room);
                          return (
                            <li
                              key={idx}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleRoomSelect(assembly, room);
                              }}
                              className="px-3 py-1.5 hover:bg-blue-50 cursor-pointer flex justify-between items-center text-sm"
                            >
                              <span>{room}</span>
                              {isExisting && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded">
                                  {t.used}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : (
                  <span
                    className="hover:bg-blue-100 px-1 rounded cursor-text"
                    onClick={(e) => startEditingRoom(assembly, e)}
                    title={t.room}
                  >
                    {assembly.room || t.noRoom}
                  </span>
                )}
                <span className="text-gray-400">·</span>
              </>
            )}
          </>
        );
    // Sistem cu posturi: doze individuale sau o doză multi-post (doar pentru ramele de 2+ posturi)
    const wbLines = isPostSystem(library) ? wallBoxLines(assembly, library, lang) : null;
    const modeEl = isPostSystem(library) && postsOf(assembly.size, library) > 1 ? (
      <select
        value={wallBoxMode(assembly, library)}
        disabled={readOnly}
        onChange={(e) => { e.stopPropagation(); if (onUpdate) onUpdate({ ...assembly, wallBoxMode: e.target.value }); }}
        onClick={(e) => e.stopPropagation()}
        className={`${selCls} bg-gray-100 hover:bg-gray-200`}
        title={wbLines?.[0]?.fallback
          ? (lang === 'ro' ? 'Doza multi-post nu e definită în librărie pentru această mărime: se folosesc doze individuale' : 'No multi-post box defined for this size: individual boxes are used')
          : (lang === 'ro' ? 'Tipul dozelor' : 'Wall box layout')}
      >
        <option value="single">{compact ? (lang === 'ro' ? 'Indiv.' : 'Single') : (lang === 'ro' ? 'Doze individuale' : 'Individual boxes')}</option>
        <option value="multi">{compact ? 'Multi' : (lang === 'ro' ? 'Doză multi-post' : 'Multi-post box')}{wbLines?.[0]?.fallback ? ' ⚠' : ''}</option>
      </select>
    ) : null;
    const modulesCountEl = <span className="whitespace-nowrap">{assembly.modules.length} {t.modules}</span>;
    const chipsEl = (
          <>
            {/* Module quick view */}
            {assembly.modules.length > 0 && (
              <div className={`flex items-center gap-1 ${compact ? 'ml-1 flex-nowrap overflow-hidden min-w-0' : 'ml-2 flex-wrap'}`}>
                {moduleGroups.map((group, idx) => {
                  const catalogItem = MODULE_CATALOG.find(c => c.id === group.moduleId);
                  const moduleName = catalogItem ? getModuleName(catalogItem, lang) : group.moduleId;
                  const moduleSize = catalogItem?.size || 1;
                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-1.5 py-0.5 rounded whitespace-nowrap"
                      title={group.count > 1 ? `${group.count}x ${moduleName}` : moduleName}
                    >
                      {group.count > 1 && <span className="font-bold">{group.count}x</span>}
                      {moduleName.length > 12 ? moduleName.substring(0, 10) + '...' : moduleName}
                      <span className="text-blue-400 text-[10px]">{sizeLabel(moduleSize, library, lang)}</span>
                    </span>
                  );
                })}
              </div>
            )}
          </>
        );
    const notesEl = (
          <>
          {/* Notes editor */}
          <div className={`flex items-center gap-1 ${compact ? 'text-xs mt-0.5 min-w-0' : 'text-sm mt-1'}`}>
            <MessageSquare className="w-3 h-3 text-gray-400 flex-shrink-0" />
            {editingNotesId === assembly.id ? (
              <input
                type="text"
                value={editingNotesValue}
                onChange={(e) => setEditingNotesValue(e.target.value)}
                onBlur={() => handleNotesSubmit(assembly)}
                onKeyDown={(e) => handleNotesKeyDown(e)}
                onClick={(e) => e.stopPropagation()}
                placeholder={t.addNote}
                className="border rounded px-2 py-0.5 text-sm flex-1 max-w-md"
                autoFocus
              />
            ) : (
              <span
                className={`hover:bg-blue-100 px-1 rounded cursor-text ${compact ? 'truncate min-w-0' : ''} ${assembly.notes ? 'text-gray-700' : 'text-gray-400 italic'}`}
                onClick={(e) => startEditingNotes(assembly, e)}
                title={compact && assembly.notes ? assembly.notes : t.notes}
              >
                {assembly.notes || t.addNote}
              </span>
            )}
          </div>
          </>
        );
    const actionsEl = (
          <>
          <div className="flex items-center gap-1">
            {(() => {
              const count = planLink.photosByAssembly?.[assembly.id]?.length || 0;
              if (!planLink.openPhotos || (readOnly && count === 0)) return null;
              return (
                <button
                  onClick={(e) => { e.stopPropagation(); planLink.openPhotos(assembly.id); }}
                  className={`${btnPad} flex items-center gap-0.5 ${count ? 'text-sky-600 hover:text-sky-800' : 'text-gray-400 hover:text-gray-600'}`}
                  title={lang === 'ro' ? 'Poze de pe șantier' : 'Site photos'}
                >
                  <Camera className="w-4 h-4" />
                  {count > 0 && <span className="text-xs font-medium">{count}</span>}
                </button>
              );
            })()}
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(assembly); }}
              className={`text-blue-500 hover:text-blue-700 ${btnPad}`}
              title={t.edit + ' ' + t.modules}
            >
              <Settings className="w-4 h-4" />
            </button>
            {onMoveToType && !readOnly && (
              <button
                onClick={(e) => { e.stopPropagation(); onMoveToType(assembly.id, type === 'outlet' ? 'switch' : 'outlet'); }}
                className={`text-purple-500 hover:text-purple-700 ${btnPad}`}
                title={type === 'outlet' ? t.moveToSwitches : t.moveToOutlets}
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            )}
            {readOnly ? null : confirmDuplicateId === assembly.id ? (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onConfirmDuplicate(assembly.id)}
                  className="bg-green-500 text-white text-xs px-2 py-1 rounded hover:bg-green-600"
                >
                  {t.duplicate}?
                </button>
                <button
                  onClick={() => onCancelDuplicate()}
                  className="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-400"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(assembly.id);
                }}
                className={`text-green-500 hover:text-green-700 ${btnPad}`}
                title={t.duplicate}
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
            {!readOnly && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(assembly.id); }}
              className={`text-red-500 hover:text-red-700 ${btnPad}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            )}
          </div>
          </>
        );
    const editingRoomHere = editingRoomId === assembly.id;
    const editingNotesHere = editingNotesId === assembly.id;

    return (
      <li
        key={assembly.id}
        draggable={!readOnly}
        onDragStart={(e) => handleDragStart(e, assembly)}
        onDragOver={(e) => !groupByRoom && handleDragOver(e, index)}
        onDragLeave={!groupByRoom ? handleDragLeave : undefined}
        onDrop={(e) => !groupByRoom && handleDrop(e, index)}
        onDragEnd={handleDragEnd}
        className={`flex ${compact ? 'items-start px-2 py-2' : 'items-center justify-between p-4'} border-b last:border-b-0 hover:bg-gray-50 ${readOnly ? '' : 'cursor-grab active:cursor-grabbing'} transition-all ${
          isDragging ? 'opacity-50 bg-blue-50' : ''
        } ${isDragOver ? 'border-t-2 border-t-blue-500' : ''}`}
      >
        {compact ? (
          <>
            <div className="text-gray-300 hover:text-gray-500 pt-1 mr-1 flex-shrink-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap gap-y-1">
                {pinEl}
                {codeEl}
                {sizeEl}
                {colorEl}
                {wallEl}
                {modeEl}
                {capacityEl}
                <div className="ml-auto flex items-center flex-shrink-0">
                  {actionsEl}
                </div>
              </div>
              <div className={`text-xs text-gray-500 flex items-center gap-1 mt-0.5 min-w-0 whitespace-nowrap ${editingRoomHere ? '' : 'overflow-hidden'}`}>
                {roomEl}
                {modulesCountEl}
                {chipsEl}
                {!readOnly && !editingNotesHere && !assembly.notes && (
                  <button
                    type="button"
                    onClick={(e) => startEditingNotes(assembly, e)}
                    className="ml-auto pl-1 text-gray-300 hover:text-gray-600 flex-shrink-0"
                    title={t.addNote}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {(editingNotesHere || assembly.notes) && notesEl}
            </div>
          </>
        ) : (
          <>
        <div className="flex items-center gap-3 mr-3">
          <div className="text-gray-300 hover:text-gray-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
            </svg>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            {pinEl}
            {codeEl}
            {sizeEl}
            {colorEl}
            {wallEl}
            {modeEl}
            {capacityEl}
          </div>

          {/* Room editor - only show if not grouped */}
          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1 flex-wrap">
            {roomEl}
            {modulesCountEl}
            {chipsEl}
          </div>

          {notesEl}
        </div>

        <div className="flex items-center gap-3 ml-3 flex-shrink-0">
          {/* Assembly Preview Thumbnail */}
          <div className="hidden sm:block">
            <AssemblyThumbnail assembly={assembly} library={library} />
          </div>
          {actionsEl}
        </div>
          </>
        )}
      </li>
    );
  };

  // Export PDF for electrician
  const exportElectricianPDF = () => generateAssemblyListPdf({ type, lang, project, library, assemblies: sortedAssemblies, moduleCatalog: MODULE_CATALOG });

  return (
    <div className={`bg-white rounded-lg shadow ${planLink.active ? 'flex flex-col flex-1 min-h-0' : ''}`}>
      <div className="flex justify-between items-center p-4 border-b shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold">{type === 'outlet' ? t.outlets : t.switches}</h2>
          {/* Group by room toggle */}
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={groupByRoom}
              onChange={(e) => setGroupByRoom(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Home className="w-4 h-4" />
            {t.groupByRoom}
          </label>
        </div>
        <div className="flex items-center gap-2">
          {sortedAssemblies.length > 0 && (
            <button
              onClick={exportElectricianPDF}
              className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded flex items-center gap-1 text-sm hover:bg-gray-200 border"
              title={lang === 'ro' ? 'Export pentru electrician' : 'Export for electrician'}
            >
              <FileText className="w-4 h-4" /> PDF
            </button>
          )}
          {!readOnly && (<>
          <button
            onClick={onAddEmpty}
            className="bg-gray-500 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm hover:bg-gray-600"
          >
            <Plus className="w-4 h-4" /> {t.addEmpty}
          </button>
          <button
            onClick={onAdd}
            className="bg-green-600 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm hover:bg-green-700"
          >
            <Plus className="w-4 h-4" /> {addLabel}
          </button>
          </>)}
        </div>
      </div>

      {/* Cu planul deschis se derulează doar rândurile; bara de sus rămâne fixă */}
      <div className={planLink.active ? 'flex-1 min-h-0 overflow-y-auto' : ''}>
      {sortedAssemblies.length === 0 ? (
        <p className="p-4 text-gray-500">{noItemsLabel}</p>
      ) : groupByRoom ? (
        // Grouped by room view
        <div>
          {groupedByRoom.sortedRooms.map(room => {
            const isDropTarget = dragOverRoom === room && draggedId;
            const draggedAssembly = draggedId ? assemblies.find(a => a.id === draggedId) : null;
            const draggedFromSameRoom = draggedAssembly && (draggedAssembly.room || t.noRoom) === room;
            
            return (
              <div 
                key={room}
                onDragOver={(e) => handleRoomDragOver(e, room)}
                onDragLeave={handleRoomDragLeave}
                onDrop={(e) => handleRoomDrop(e, room)}
                className={`transition-all ${
                  isDropTarget && !draggedFromSameRoom
                    ? 'bg-blue-50 ring-2 ring-blue-400 ring-inset' 
                    : ''
                }`}
              >
                <div 
                  className={`px-4 py-2 border-b flex items-center gap-2 transition-all ${
                    isDropTarget && !draggedFromSameRoom
                      ? 'bg-blue-100' 
                      : 'bg-gray-100'
                  }`}
                >
                  <Home className={`w-4 h-4 ${isDropTarget && !draggedFromSameRoom ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className={`font-medium ${isDropTarget && !draggedFromSameRoom ? 'text-blue-700' : 'text-gray-700'}`}>
                    {room}
                  </span>
                  <span className="text-sm text-gray-500">({groupedByRoom.groups[room].length})</span>
                  {isDropTarget && !draggedFromSameRoom && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded ml-auto animate-pulse">
                      {t.dropHere}
                    </span>
                  )}
                </div>
                <ul>
                  {groupedByRoom.groups[room].map((assembly, index) => 
                    renderAssemblyItem(assembly, index, false)
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        // Regular list view
        <ul>
          {sortedAssemblies.map((assembly, index) => renderAssemblyItem(assembly, index, true))}
        </ul>
      )}
      </div>
      
      <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 border-t shrink-0">
        💡 {groupByRoom ? t.editHintGrouped : t.editHint}
      </div>
    </div>
  );
}
