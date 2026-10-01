import React from 'react';
import { GRAPHIC_TYPES, ModuleGraphicsByType, getGraphicTypeFromId } from '../graphics/moduleGraphics';
import { getSystemProportions } from '../data/libraries';
import { useTranslation, useLanguage } from '../i18n';

const PREVIEW_HEIGHT = 44;

// Alegerea graficii unui modul dintre desenele predefinite, independent de dimensiune.
// Previzualizările sunt desenate la dimensiunea modulului (size), în proporțiile
// sistemului curent. Valoarea '' înseamnă „automat": grafica se deduce din id.
export function GraphicPicker({ value, onChange, size = 1, moduleId = '', library }) {
  const t = useTranslation();
  const lang = useLanguage();
  const props = getSystemProportions(library);
  const width = Math.max(10, Math.round(PREVIEW_HEIGHT * (props.moduleWidth1M * (size || 1)) / props.moduleHeight));
  const autoType = getGraphicTypeFromId(moduleId);
  // generic1m / generic2m sunt valori vechi pentru „generic"
  const current = value === 'generic1m' || value === 'generic2m' ? 'generic' : (value || '');

  const options = [
    { id: '', nameEn: t.graphicAuto, nameRo: t.graphicAuto, render: autoType },
    ...GRAPHIC_TYPES.map(g => ({ ...g, render: g.id })),
  ];

  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">
        {t.moduleGraphic} <span className="text-gray-400">· {size || 1}M</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const Graphic = ModuleGraphicsByType[opt.render] || ModuleGraphicsByType.generic;
          const selected = current === opt.id;
          return (
            <button
              type="button"
              key={opt.id || 'auto'}
              onClick={() => onChange(opt.id)}
              title={lang === 'ro' ? opt.nameRo : opt.nameEn}
              className={`flex flex-col items-center gap-1 p-1.5 rounded border min-w-16 text-[10px] leading-tight ${
                selected ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-400' : 'border-gray-200 bg-white hover:border-gray-400'
              }`}
            >
              <div className="h-11 flex items-center justify-center">
                <div className={`border border-gray-300 ${opt.id ? '' : 'opacity-60'}`} style={{ lineHeight: 0 }}>
                  <Graphic color="white" width={width} height={PREVIEW_HEIGHT} />
                </div>
              </div>
              <span className="text-gray-700 text-center truncate max-w-20">{lang === 'ro' ? opt.nameRo : opt.nameEn}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
