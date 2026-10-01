import React from 'react';
import { GRAPHIC_TYPES, ModuleGraphicsByType } from '../graphics/moduleGraphics';
import { useTranslation, useLanguage } from '../i18n';

// Alegerea graficii unui modul dintre desenele predefinite.
// Valoarea '' înseamnă „automat": grafica se deduce din id-ul modulului.
export function GraphicPicker({ value, onChange }) {
  const t = useTranslation();
  const lang = useLanguage();
  const options = [{ id: '', nameEn: t.graphicAuto, nameRo: t.graphicAuto }, ...GRAPHIC_TYPES];

  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{t.moduleGraphic}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const Graphic = opt.id ? ModuleGraphicsByType[opt.id] : null;
          const selected = (value || '') === opt.id;
          const width = Math.round(((opt.size === 2 ? 17 : 8.5) / 31) * 44);
          return (
            <button
              type="button"
              key={opt.id || 'auto'}
              onClick={() => onChange(opt.id)}
              title={lang === 'ro' ? opt.nameRo : opt.nameEn}
              className={`flex flex-col items-center gap-1 p-1.5 rounded border w-16 text-[10px] leading-tight ${
                selected ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-400' : 'border-gray-200 bg-white hover:border-gray-400'
              }`}
            >
              <div className="h-11 flex items-center justify-center">
                {Graphic ? (
                  <div className="border border-gray-300" style={{ lineHeight: 0 }}>
                    <Graphic color="white" width={width} height={44} />
                  </div>
                ) : (
                  <span className="text-gray-400 text-lg">?</span>
                )}
              </div>
              <span className="text-gray-700 text-center truncate w-full">{lang === 'ro' ? opt.nameRo : opt.nameEn}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
