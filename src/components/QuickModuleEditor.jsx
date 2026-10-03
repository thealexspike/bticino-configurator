import React from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../i18n';
import { getModuleGraphic } from '../graphics/moduleGraphics';
import { getSystemProportions } from '../data/libraries';
import { getAvailableSizes, getModuleCatalog, getModuleName } from '../lib/library';
import { calculateModulesSize, createModuleInstance } from '../lib/assemblies';
import { sizeLabel, capacityLabel, freeLabel, moduleSizeLabel, postLayout, fitsInFrame } from '../lib/mounting';

const TILE_HEIGHT = 30;

// Editare rapidă a unui aparataj, fără editorul complet: mărimea ramei, modulele
// puse (cu scoatere) și paleta de module ale sistemului (clic = adaugă, dacă încape).
export function QuickModuleEditor({ assembly, library, onChange, readOnly = false }) {
  const lang = useLanguage();
  const L = (ro, en) => (lang === 'ro' ? ro : en);
  const catalog = getModuleCatalog(library);
  const props = getSystemProportions(library);
  const used = calculateModulesSize(assembly.modules || [], library);
  const free = assembly.size - used;
  const over = used > assembly.size;
  const { straddling } = postLayout(assembly.modules || [], library);

  const nameOf = (moduleId) => {
    const mod = catalog.find(c => c.id === moduleId);
    return mod ? getModuleName(mod, lang) : moduleId;
  };

  const addModule = (mod) => {
    if (readOnly || !fitsInFrame([...(assembly.modules || []), { moduleId: mod.id }], assembly.size, library)) return;
    onChange({ ...assembly, modules: [...(assembly.modules || []), createModuleInstance(mod.id)] });
  };
  const removeModule = (instanceId) => {
    onChange({ ...assembly, modules: (assembly.modules || []).filter(m => m.id !== instanceId) });
  };
  const setSize = (size) => onChange({ ...assembly, size: Number(size) });

  // Modulele de tipul aparatului (prize la P, întrerupătoare la I) primele
  const preferred = assembly.type === 'switch' ? 'switch' : 'outlet';
  const palette = [...catalog].sort((a, b) =>
    (a.category === preferred ? 0 : 1) - (b.category === preferred ? 0 : 1));

  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 mb-1.5">
        <select
          value={assembly.size}
          onChange={(e) => setSize(e.target.value)}
          disabled={readOnly}
          className="text-xs bg-gray-100 px-1 py-0.5 rounded border-0"
          title={L('Mărimea ramei', 'Frame size')}
        >
          {getAvailableSizes(library).map(s => <option key={s} value={s}>{sizeLabel(s, library, lang)}</option>)}
        </select>
        <span className={`text-xs px-1.5 py-0.5 rounded ${over ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {capacityLabel(used, assembly.size, library, lang)}
        </span>
        {!readOnly && !over && free > 0 && (
          <span className="text-xs text-gray-400">{L(`${freeLabel(free, library, lang)} liber`, `${freeLabel(free, library, lang)} free`)}</span>
        )}
      </div>

      {straddling && (
        <div className="text-xs text-amber-700 mb-1.5">⚠ {L('Un mecanism de un post întreg nu poate sta între două posturi. Pune modulele de 1/2 în perechi, pe același post.', 'A full-post device cannot sit across two posts. Put half modules in pairs on the same post.')}</div>
      )}

      {/* Modulele puse, în ordinea din ramă */}
      {(assembly.modules || []).length > 0 ? (
        <div className="flex flex-wrap gap-1 mb-2">
          {assembly.modules.map(m => (
            <span key={m.id} className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-700 text-xs pl-1.5 pr-0.5 py-0.5 rounded">
              {nameOf(m.moduleId)}
              {!readOnly && (
                <button onClick={() => removeModule(m.id)} className="text-blue-400 hover:text-red-600 p-0.5" title={L('Scoate modulul', 'Remove module')}>
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      ) : (
        <div className="text-xs text-gray-400 mb-2">{L('Fără module', 'No modules')}</div>
      )}

      {/* Paleta: clic = adaugă */}
      {!readOnly && (
        <div className="grid grid-cols-4 gap-1">
          {palette.map(mod => {
            const fits = fitsInFrame([...(assembly.modules || []), { moduleId: mod.id }], assembly.size, library);
            const Graphic = getModuleGraphic(mod);
            const w = Math.max(8, Math.round(TILE_HEIGHT * (props.moduleWidth1M * mod.size) / props.moduleHeight));
            const name = getModuleName(mod, lang);
            return (
              <button
                key={mod.id}
                onClick={() => addModule(mod)}
                disabled={!fits}
                title={fits ? `${name} (${moduleSizeLabel(mod.size)})` : L(`${name}: nu mai încape (${freeLabel(free, library, lang)} liber)`, `${name}: does not fit (${freeLabel(free, library, lang)} free)`)}
                className="flex flex-col items-center gap-0.5 p-1 rounded border border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 disabled:opacity-35 disabled:hover:border-gray-200 disabled:hover:bg-white disabled:cursor-not-allowed"
              >
                <div className="border border-gray-300" style={{ lineHeight: 0 }}>
                  <Graphic color="white" width={w} height={TILE_HEIGHT} />
                </div>
                <span className="text-[9px] leading-tight text-gray-700 text-center w-full truncate">{name}</span>
                <span className="text-[9px] leading-none text-gray-400">{moduleSizeLabel(mod.size)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
