import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import { Plus, Trash2, Pencil, ZoomIn, ZoomOut, Maximize, PanelRightClose, X, MapPin, Camera } from 'lucide-react';
import { api } from '../api';
import { useLanguage } from '../i18n';
import { useReadOnly } from '../readOnly';
import { ASSEMBLY_DRAG_TYPE, usePlanLink } from '../planLink';
import { photoUrl } from './AssemblyPhotos';
import { PhotoPasteInput } from './PhotoPasteInput';
import { PLAN_FILE_ACCEPT } from '../lib/planImport';
import { LibraryContext } from '../lib/library';
import { AssemblyThumbnail } from './visual/ModuleVisuals';
import { QuickModuleEditor } from './QuickModuleEditor';

const MIN_ZOOM = 0.03;
const MAX_ZOOM = 6;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const round4 = (v) => Math.round(v * 10000) / 10000;

// Culorile marcajelor: conturul după tip (ca tab-urile Prize / Întrerupătoare),
// fundalul după doză (ca în listă: zidărie roșu, gips-carton verde)
export const MARKER_BORDER = { outlet: '#2563eb', switch: '#7c3aed' };
export const MARKER_FILL = { masonry: '#fecaca', drywall: '#bbf7d0' };
const markerBorder = (a) => MARKER_BORDER[a.type === 'switch' ? 'switch' : 'outlet'];
const markerFill = (a) => MARKER_FILL[(a.wallBoxType || 'masonry') === 'drywall' ? 'drywall' : 'masonry'];

export const planImageUrl = (projectId, planId) => `/api/projects/${projectId}/plans/${planId}/image`;

// Panoul cu planurile proiectului (un plan per etaj). Aparatajele se trag din
// listă pe plan și apar ca cerculețe albe cu codul lor (P01, I01...).
// Pozițiile se salvează pe ansamblu (planId, planX, planY), relativ la imagine (0..1).
export function PlanView({
  ref, project, plans, activePlanId, onSelectPlan, onPlansChange, onUpdate,
  onAddFiles, importStatus, onCollapse,
}) {
  const lang = useLanguage();
  const readOnly = useReadOnly();
  const library = React.useContext(LibraryContext);
  const L = (ro, en) => (lang === 'ro' ? ro : en);
  const planLink = usePlanLink();
  const photosOf = (assemblyId) => planLink.photosByAssembly?.[assemblyId] || [];

  const plan = plans.find(p => p.id === activePlanId) || plans[0] || null;
  const [view, setView] = useState({ zoom: 0.2, x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState(null);
  const [liveMarker, setLiveMarker] = useState(null); // { id, x, y } în timpul mutării
  const [hoverId, setHoverId] = useState(null);
  const viewportRef = useRef(null);
  const fileInputRef = useRef(null);
  const panRef = useRef(null);
  const markerDragRef = useRef(null);
  const pendingFocusRef = useRef(null);

  const assemblies = project.assemblies || [];
  const onPlan = plan ? assemblies.filter(a => a.planId === plan.id && a.planX != null && a.planY != null) : [];
  const placedTotal = assemblies.filter(a => a.planId && plans.some(p => p.id === a.planId)).length;
  const selected = assemblies.find(a => a.id === selectedId) || null;

  // ---------------------------------------------------------------- vedere
  const viewportSize = () => {
    const r = viewportRef.current?.getBoundingClientRect();
    return { w: r?.width || 800, h: r?.height || 600, left: r?.left || 0, top: r?.top || 0 };
  };

  const fitZoom = (p) => {
    const { w, h } = viewportSize();
    return clamp(Math.min(w / p.width, h / p.height) * 0.96, MIN_ZOOM, MAX_ZOOM);
  };

  const fit = (p = plan) => {
    if (!p) return;
    const { w, h } = viewportSize();
    const zoom = fitZoom(p);
    setView({ zoom, x: (w - p.width * zoom) / 2, y: (h - p.height * zoom) / 2 });
  };

  const centerOn = (a, p = plan) => {
    if (!p || a?.planX == null) return;
    const { w, h } = viewportSize();
    const zoom = clamp(Math.max(view.zoom, fitZoom(p) * 2.5), MIN_ZOOM, 3);
    setView({ zoom, x: w / 2 - a.planX * p.width * zoom, y: h / 2 - a.planY * p.height * zoom });
  };

  const zoomBy = (factor) => {
    const { w, h } = viewportSize();
    setView(v => {
      const zoom = clamp(v.zoom * factor, MIN_ZOOM, MAX_ZOOM);
      const k = zoom / v.zoom;
      return { zoom, x: w / 2 - (w / 2 - v.x) * k, y: h / 2 - (h / 2 - v.y) * k };
    });
  };

  // Zoom cu rotița, în jurul cursorului (ascultător non-pasiv, ca să oprească scroll-ul paginii)
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      // Peste fișa aparatului rotița derulează fișa, nu face zoom pe plan
      if (e.target.closest?.('[data-plan-overlay]')) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      setView(v => {
        const zoom = clamp(v.zoom * factor, MIN_ZOOM, MAX_ZOOM);
        const k = zoom / v.zoom;
        return { zoom, x: mx - (mx - v.x) * k, y: my - (my - v.y) * k };
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [plan?.id]);

  const handleImageLoad = () => {
    const pendingId = pendingFocusRef.current;
    pendingFocusRef.current = null;
    const a = pendingId ? assemblies.find(x => x.id === pendingId) : null;
    if (a && a.planId === plan?.id) centerOn(a);
    else fit();
  };

  // Apelat din listă: arată aparatul pe planul lui
  useImperativeHandle(ref, () => ({
    focusAssembly(id) {
      const a = assemblies.find(x => x.id === id);
      if (!a?.planId || !plans.some(p => p.id === a.planId)) return;
      setSelectedId(id);
      if (a.planId !== plan?.id) {
        pendingFocusRef.current = id;
        onSelectPlan(a.planId);
      } else {
        centerOn(a);
      }
    },
  }));

  // ---------------------------------------------------------------- poziții
  const toPlanCoords = (clientX, clientY) => {
    const { left, top } = viewportSize();
    const px = (clientX - left - view.x) / view.zoom;
    const py = (clientY - top - view.y) / view.zoom;
    return { x: clamp(px / plan.width, 0, 1), y: clamp(py / plan.height, 0, 1) };
  };

  const setPlacement = (assemblyId, planId, x, y) => {
    onUpdate({
      ...project,
      assemblies: assemblies.map(a => (a.id === assemblyId
        ? { ...a, planId, planX: x == null ? null : round4(x), planY: y == null ? null : round4(y) }
        : a)),
    });
  };

  // Tragere din listă pe plan
  const handleDragOver = (e) => {
    if (readOnly || !plan || !e.dataTransfer.types.includes(ASSEMBLY_DRAG_TYPE)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = (e) => {
    if (readOnly || !plan) return;
    const id = e.dataTransfer.getData(ASSEMBLY_DRAG_TYPE);
    if (!id) return;
    e.preventDefault();
    const { x, y } = toPlanCoords(e.clientX, e.clientY);
    setPlacement(id, plan.id, x, y);
    setSelectedId(id);
  };

  // Deplasarea planului (tragere pe fundal)
  const handleViewportPointerDown = (e) => {
    if (e.button !== 0) return;
    panRef.current = { sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handleViewportPointerMove = (e) => {
    const p = panRef.current;
    if (!p) return;
    const dx = e.clientX - p.sx;
    const dy = e.clientY - p.sy;
    if (Math.abs(dx) + Math.abs(dy) > 3) p.moved = true;
    if (p.moved) setView(v => ({ ...v, x: p.vx + dx, y: p.vy + dy }));
  };
  const handleViewportPointerUp = () => {
    if (panRef.current && !panRef.current.moved) setSelectedId(null);
    panRef.current = null;
  };

  // Mutarea unui marcaj
  const handleMarkerPointerDown = (e, a) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    markerDragRef.current = { id: a.id, sx: e.clientX, sy: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handleMarkerPointerMove = (e) => {
    const d = markerDragRef.current;
    if (!d || readOnly) return;
    if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 3) d.moved = true;
    if (d.moved) setLiveMarker({ id: d.id, ...toPlanCoords(e.clientX, e.clientY) });
  };
  const handleMarkerPointerUp = (e) => {
    const d = markerDragRef.current;
    markerDragRef.current = null;
    if (!d) return;
    e.stopPropagation();
    if (d.moved && !readOnly) {
      const { x, y } = toPlanCoords(e.clientX, e.clientY);
      setPlacement(d.id, plan.id, x, y);
    }
    setLiveMarker(null);
    setSelectedId(d.id);
  };

  // ---------------------------------------------------------------- planuri
  const renamePlan = async () => {
    const name = window.prompt(L('Numele planului (ex. Parter, Etaj 1):', 'Plan name (e.g. Ground floor):'), plan.name);
    if (!name || !name.trim() || name.trim() === plan.name) return;
    try {
      const { plan: updated } = await api.updatePlan(project.id, plan.id, { name: name.trim() });
      onPlansChange(plans.map(p => (p.id === plan.id ? { ...p, ...updated } : p)));
    } catch (err) {
      alert(err.message);
    }
  };

  const deletePlan = async () => {
    const count = onPlan.length;
    const msg = L(
      `Ștergi planul „${plan.name}"?${count ? ` Cele ${count} aparate de pe el rămân în listă, fără poziție.` : ''}`,
      `Delete plan "${plan.name}"?${count ? ` Its ${count} assemblies stay in the list, without a position.` : ''}`,
    );
    if (!window.confirm(msg)) return;
    try {
      await api.deletePlan(project.id, plan.id);
      onPlansChange(plans.filter(p => p.id !== plan.id));
      if (count) {
        onUpdate({
          ...project,
          assemblies: assemblies.map(a => (a.planId === plan.id ? { ...a, planId: null, planX: null, planY: null } : a)),
        });
      }
      setSelectedId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const changeMarkerScale = (value) => {
    onPlansChange(plans.map(p => (p.id === plan.id ? { ...p, marker_scale: value } : p)));
  };
  const saveMarkerScale = () => {
    if (readOnly || !plan) return;
    api.updatePlan(project.id, plan.id, { marker_scale: plan.marker_scale }).catch(err => console.error(err));
  };

  // ---------------------------------------------------------------- randare
  const markerSize = plan ? plan.width * (plan.marker_scale || 0.022) : 0;

  return (
    <div className="bg-white rounded-lg shadow h-full flex flex-col overflow-hidden">
      {/* Bara de sus: planuri + unelte */}
      <div className="flex items-center gap-2 px-3 py-2 border-b flex-wrap">
        <button
          onClick={onCollapse}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
          title={L('Ascunde planul', 'Hide plan')}
        >
          <PanelRightClose className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1 flex-wrap">
          {plans.map(p => (
            <button
              key={p.id}
              onClick={() => { setSelectedId(null); onSelectPlan(p.id); }}
              className={`px-2.5 py-1 rounded text-sm ${p.id === plan?.id ? 'bg-teal-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              {p.name}
            </button>
          ))}
          {!readOnly && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={!!importStatus}
                className="px-2 py-1 rounded text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-1 disabled:opacity-50"
                title={L('Adaugă plan (JPEG, PNG sau PDF; fiecare pagină devine un plan)', 'Add plan (JPEG, PNG or PDF; each page becomes a plan)')}
              >
                <Plus className="w-3.5 h-3.5" /> {L('Plan', 'Plan')}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={PLAN_FILE_ACCEPT}
                multiple
                className="hidden"
                onChange={(e) => { onAddFiles(e.target.files); e.target.value = ''; }}
              />
            </>
          )}
        </div>

        {plan && !readOnly && (
          <div className="flex items-center gap-0.5">
            <button onClick={renamePlan} className="p-1.5 rounded hover:bg-gray-100 text-gray-500" title={L('Redenumește planul', 'Rename plan')}>
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={deletePlan} className="p-1.5 rounded hover:bg-red-50 text-red-500" title={L('Șterge planul', 'Delete plan')}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
          {plan && (
            <label className="flex items-center gap-1.5" title={L('Mărimea marcajelor pe acest plan', 'Marker size on this plan')}>
              <span className="w-3 h-3 rounded-full border-2 border-gray-700 bg-white inline-block" />
              <input
                type="range"
                min="0.008"
                max="0.06"
                step="0.001"
                value={plan.marker_scale || 0.022}
                onChange={(e) => changeMarkerScale(Number(e.target.value))}
                onPointerUp={saveMarkerScale}
                onKeyUp={saveMarkerScale}
                disabled={readOnly}
                className="w-20"
              />
            </label>
          )}
          <button onClick={() => zoomBy(1 / 1.3)} className="p-1.5 rounded hover:bg-gray-100" title={L('Micșorează', 'Zoom out')}><ZoomOut className="w-4 h-4" /></button>
          <button onClick={() => zoomBy(1.3)} className="p-1.5 rounded hover:bg-gray-100" title={L('Mărește', 'Zoom in')}><ZoomIn className="w-4 h-4" /></button>
          <button onClick={() => fit()} className="p-1.5 rounded hover:bg-gray-100" title={L('Potrivește în ecran', 'Fit to screen')}><Maximize className="w-4 h-4" /></button>
          <span className="whitespace-nowrap text-xs text-gray-500" title={L('Aparate puse pe planuri / total', 'Assemblies placed / total')}>
            <MapPin className="w-3.5 h-3.5 inline -mt-0.5" /> {placedTotal}/{assemblies.length}
          </span>
        </div>
      </div>

      {/* Zona planului */}
      <div
        ref={viewportRef}
        className="relative flex-1 overflow-hidden bg-gray-200 select-none"
        style={{ cursor: 'grab', touchAction: 'none' }}
        onPointerDown={handleViewportPointerDown}
        onPointerMove={handleViewportPointerMove}
        onPointerUp={handleViewportPointerUp}
        onPointerCancel={() => { panRef.current = null; }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {plan ? (
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              width: plan.width,
              height: plan.height,
              transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,
            }}
          >
            <img
              key={plan.id}
              src={planImageUrl(project.id, plan.id)}
              alt={plan.name}
              width={plan.width}
              height={plan.height}
              draggable={false}
              onLoad={handleImageLoad}
              className="block bg-white shadow"
              style={{ pointerEvents: 'none' }}
            />
            {onPlan.map(a => {
              const live = liveMarker?.id === a.id ? liveMarker : null;
              const x = (live ? live.x : a.planX) * plan.width;
              const y = (live ? live.y : a.planY) * plan.height;
              const isSelected = a.id === selectedId;
              return (
                <div
                  key={a.id}
                  onPointerDown={(e) => handleMarkerPointerDown(e, a)}
                  onPointerMove={handleMarkerPointerMove}
                  onPointerUp={handleMarkerPointerUp}
                  onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHoverId(a.id); }}
                  onPointerLeave={() => setHoverId(h => (h === a.id ? null : h))}
                  className="absolute rounded-full flex items-center justify-center font-bold text-gray-900 leading-none"
                  style={{
                    left: x - markerSize / 2,
                    top: y - markerSize / 2,
                    width: markerSize,
                    height: markerSize,
                    fontSize: markerSize * 0.34,
                    backgroundColor: markerFill(a),
                    border: `${Math.max(2, markerSize * 0.09)}px solid ${markerBorder(a)}`,
                    boxShadow: isSelected
                      ? `0 0 0 ${markerSize * 0.08}px #fff, 0 0 0 ${markerSize * 0.18}px rgba(37, 99, 235, 0.55)`
                      : '0 1px 3px rgba(0,0,0,0.35)',
                    cursor: readOnly ? 'pointer' : (live ? 'grabbing' : 'grab'),
                    zIndex: isSelected || live ? 2 : 1,
                    touchAction: 'none',
                  }}
                >
                  {a.code}
                  {photosOf(a.id).length > 0 && (
                    <span
                      className="absolute rounded-full bg-sky-500 border-white"
                      style={{
                        width: markerSize * 0.28,
                        height: markerSize * 0.28,
                        right: -markerSize * 0.04,
                        top: -markerSize * 0.04,
                        borderWidth: Math.max(1, markerSize * 0.04),
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm p-6 text-center">
            {readOnly
              ? L('Proiectul nu are planuri.', 'This project has no plans.')
              : L('Adaugă un plan (JPEG, PNG sau PDF) cu butonul „+ Plan".', 'Add a plan (JPEG, PNG or PDF) with the "+ Plan" button.')}
          </div>
        )}

        {plan && !readOnly && onPlan.length === 0 && !importStatus && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/90 rounded px-3 py-1.5 text-sm text-gray-600 shadow pointer-events-none">
            {L('Trage prizele și întrerupătoarele din listă pe plan.', 'Drag outlets and switches from the list onto the plan.')}
          </div>
        )}

        {importStatus && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-sm text-gray-700">
            <span className="bg-white shadow rounded px-4 py-2">⏳ {importStatus}</span>
          </div>
        )}

        {/* Legenda marcajelor */}
        {plan && onPlan.length > 0 && (
          <div className="absolute bottom-3 right-3 bg-white/95 rounded-lg shadow px-3 py-2 text-xs text-gray-700 flex flex-col gap-1 pointer-events-none" style={{ zIndex: 3 }}>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-white inline-block" style={{ border: `2.5px solid ${MARKER_BORDER.outlet}` }} />{L('Priză', 'Outlet')}</span>
              <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-white inline-block" style={{ border: `2.5px solid ${MARKER_BORDER.switch}` }} />{L('Întrerupător', 'Switch')}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full inline-block border border-gray-400" style={{ backgroundColor: MARKER_FILL.masonry }} />{L('Zidărie', 'Masonry')}</span>
              <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full inline-block border border-gray-400" style={{ backgroundColor: MARKER_FILL.drywall }} />{L('Gips-carton', 'Drywall')}</span>
            </div>
          </div>
        )}

        {/* Previzualizare la hover: cod, cameră, pozele de șantier */}
        {(() => {
          const a = hoverId && !liveMarker ? onPlan.find(x => x.id === hoverId) : null;
          if (!a) return null;
          const sx = view.x + a.planX * plan.width * view.zoom;
          const sy = view.y + a.planY * plan.height * view.zoom;
          const r = (markerSize * view.zoom) / 2;
          const above = sy > 220;
          const list = photosOf(a.id);
          return (
            <div
              className="absolute bg-white rounded-lg shadow-lg p-2 text-xs pointer-events-none"
              style={{
                left: sx,
                top: above ? sy - r - 8 : sy + r + 8,
                transform: `translate(-50%, ${above ? '-100%' : '0'})`,
                width: list.length ? 232 : 'auto',
                zIndex: 5,
              }}
            >
              <div className="font-semibold text-sm whitespace-nowrap">
                {a.code}{a.room ? <span className="font-normal text-gray-500"> · {a.room}</span> : null}
              </div>
              {list.length > 0 ? (
                <div className="mt-1.5">
                  <img src={photoUrl(project.id, list[list.length - 1].id, true)} alt={a.code} className="w-full h-36 object-cover rounded bg-gray-100" />
                  {list.length > 1 && (
                    <div className="mt-1 text-gray-500 flex items-center gap-1">
                      <Camera className="w-3 h-3" /> {list.length} {L('poze', 'photos')}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-400 mt-0.5 whitespace-nowrap">{L('Fără poze', 'No photos')}</div>
              )}
            </div>
          );
        })()}

        {/* Fișa aparatului selectat */}
        {selected && selected.planId === plan?.id && (
          <div
            data-plan-overlay
            className="absolute bottom-3 left-3 bg-white rounded-lg shadow-lg p-3 w-80 text-sm overflow-y-auto"
            style={{ maxHeight: 'calc(100% - 1.5rem)' }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="font-bold">{selected.code}</div>
                <div className="text-gray-500">{selected.room || L('Fără cameră', 'No room')}</div>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600 p-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-center mb-2">
              <AssemblyThumbnail assembly={selected} library={library} maxWidth={200} maxHeight={80} />
            </div>
            <QuickModuleEditor
              assembly={selected}
              library={library}
              readOnly={readOnly}
              onChange={(updated) => onUpdate({ ...project, assemblies: assemblies.map(a => (a.id === updated.id ? updated : a)) })}
            />
            {selected.notes && <div className="text-xs text-gray-500 italic mb-2">{selected.notes}</div>}
            {(photosOf(selected.id).length > 0 || !readOnly) && (
              <div className="mb-2">
                {photosOf(selected.id).length > 0 && (
                  <div className="flex gap-1 mb-1 overflow-x-auto">
                    {photosOf(selected.id).map(p => (
                      <button key={p.id} onClick={() => planLink.openPhotos?.(selected.id)} className="shrink-0">
                        <img src={photoUrl(project.id, p.id, true)} alt={selected.code} className="w-14 h-14 object-cover rounded border" />
                      </button>
                    ))}
                  </div>
                )}
                {!readOnly && planLink.uploadPhotos && (
                  <PhotoPasteInput
                    key={selected.id}
                    autoFocus
                    className="mb-1"
                    disabled={!!planLink.photoUploadStatus}
                    onImages={(files) => planLink.uploadPhotos(selected.id, files)}
                    placeholder={planLink.photoUploadStatus || L('Lipește poza de pe șantier (Ctrl+V)', 'Paste site photo (Ctrl+V)')}
                  />
                )}
                {photosOf(selected.id).length > 0 && (
                  <button
                    onClick={() => planLink.openPhotos?.(selected.id)}
                    className="text-sky-700 hover:underline text-xs flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    {L(`Toate pozele (${photosOf(selected.id).length})`, `All photos (${photosOf(selected.id).length})`)}
                  </button>
                )}
              </div>
            )}
            {!readOnly && (
              <button
                onClick={() => { setPlacement(selected.id, null, null, null); setSelectedId(null); }}
                className="text-red-600 hover:underline text-xs"
              >
                {L('Scoate de pe plan', 'Remove from plan')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
