import React, { useMemo } from 'react';
import { FileText, Eye, EyeOff } from 'lucide-react';
import { useTranslation, useLanguage } from '../i18n';
import { isEntryExcluded } from '../lib/assemblies';
import { wallBoxLines, hasSeparateSupports, sizeLabel } from '../lib/mounting';
import { getColorName, LibraryContext, getWallBoxSku, getInstallFaceSku, getDecorFaceSku, getModuleSku, getModuleFaceSku, getModuleName, getModuleCatalog } from '../lib/library';
import { generateBoqPdf } from '../pdf/boqPdf';

export function BOQView({ project, onUpdate }) {
  const library = React.useContext(LibraryContext);
  const t = useTranslation();
  const lang = useLanguage();
  const MODULE_CATALOG = getModuleCatalog(library);

  const excluded = project.excludedItems || {};

  const setExcluded = (next) => {
    if (onUpdate) onUpdate({ ...project, excludedItems: next });
  };

  const toggleItem = (category, itemKey) => {
    const key = `${category}:${itemKey}`;
    const next = { ...excluded };
    if (next[key]) delete next[key]; else next[key] = true;
    setExcluded(next);
  };

  const toggleCategory = (category) => {
    const next = { ...excluded };
    if (next[category]) {
      delete next[category];
    } else {
      next[category] = true;
      // Curăță excluderile individuale, categoria acoperă tot
      Object.keys(next).forEach(k => { if (k.startsWith(`${category}:`)) delete next[k]; });
    }
    setExcluded(next);
  };

  const boqData = useMemo(() => {
    const items = {
      wallBoxesMasonry: {},
      wallBoxesDrywall: {},
      installFaces: {},
      decorFaces: {},
      modules: {},
      moduleFaces: {},
    };

    project.assemblies.forEach((assembly) => {
      const colorName = getColorName(assembly.color, library, lang);
      const wallBoxType = assembly.wallBoxType || 'masonry';

      // Doze — la sistemele cu posturi: individuale (N × 1 post) sau multi-post (1 × N posturi)
      const wbCategory = wallBoxType === 'drywall' ? 'wallBoxesDrywall' : 'wallBoxesMasonry';
      const wbItemName = wallBoxType === 'drywall' ? t.wallBoxDrywallItem : t.wallBoxMasonryItem;
      for (const line of wallBoxLines(assembly, library, lang)) {
        const wbKey = `${line.size}M`;
        items[wbCategory][wbKey] = items[wbCategory][wbKey] || {
          name: `${wbItemName} ${line.label}`,
          sku: getWallBoxSku(line.size, wallBoxType, library),
          color: '—',
          qty: 0,
        };
        items[wbCategory][wbKey].qty += line.qty;
      }

      // Ramă suport — lipsește când vine la pachet cu rama decor
      if (hasSeparateSupports(library)) {
        const ifKey = `${assembly.size}M`;
        items.installFaces[ifKey] = items.installFaces[ifKey] || {
          name: `${t.supportItem} ${sizeLabel(assembly.size, library, lang)}`,
          sku: getInstallFaceSku(assembly.size, library),
          color: '—',
          qty: 0,
        };
        items.installFaces[ifKey].qty++;
      }

      // Ramă decor (+ montaj, la sistemele unde vin la pachet)
      const dfKey = `${assembly.size}M-${assembly.color}`;
      items.decorFaces[dfKey] = items.decorFaces[dfKey] || {
        name: `${hasSeparateSupports(library) ? t.coverPlateItem : t.coverPlateWithSupportItem} ${sizeLabel(assembly.size, library, lang)}`,
        sku: getDecorFaceSku(assembly.size, assembly.color, library),
        color: colorName,
        qty: 0,
      };
      items.decorFaces[dfKey].qty++;

      // Modules and their faces
      assembly.modules.forEach((mod) => {
        const catalogItem = MODULE_CATALOG.find(c => c.id === mod.moduleId);
        if (catalogItem) {
          const modSku = getModuleSku(mod.moduleId, assembly.color, library);
          const modKey = `${mod.moduleId}-${assembly.color}`;
          const translatedName = getModuleName(catalogItem, lang);
          items.modules[modKey] = items.modules[modKey] || { 
            name: translatedName, 
            sku: modSku,
            color: colorName,
            qty: 0 
          };
          items.modules[modKey].qty++;

          // Systems without separate module faces (e.g. generic placeholder)
          if (library?.hasModuleFaces === false) return;

          const mfKey = `${mod.moduleId}-${assembly.color}-face`;
          const mfSku =getModuleFaceSku(mod.moduleId, assembly.color, library);
          items.moduleFaces[mfKey] = items.moduleFaces[mfKey] || { 
            name: `${translatedName} - ${t.face}`, 
            sku: mfSku,
            color: colorName,
            qty: 0 
          };
          items.moduleFaces[mfKey].qty++;
        }
      });
    });

    return items;
  }, [project, library, MODULE_CATALOG, t, lang]);

  const sections = [
    { key: 'wallBoxesMasonry', title: t.wallBoxesMasonry || 'Wall Boxes (Masonry)' },
    { key: 'wallBoxesDrywall', title: t.wallBoxesDrywall || 'Wall Boxes (Drywall)' },
    { key: 'installFaces', title: t.installFaces },
    { key: 'decorFaces', title: t.decorFaces },
    { key: 'modules', title: t.modules },
    { key: 'moduleFaces', title: t.moduleFaces },
  ];

  const activeEntries = (catKey) => Object.entries(boqData[catKey])
    .filter(([itemKey]) => !isEntryExcluded(excluded, catKey, itemKey));

  const totalItems = sections.reduce(
    (sum, { key }) => sum + activeEntries(key).reduce((s, [, item]) => s + item.qty, 0),
    0
  );

  // Export PDF function
  const exportPDF = () => generateBoqPdf({ lang, t, project, totalItems, sections, activeEntries });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="font-semibold">{t.billOfQuantities} ({t.forSupplier})</h2>
          <p className="text-sm text-gray-500">
            {project.name} · {project.assemblies.length} {t.assemblies} · {totalItems} {t.totalItems}
          </p>
        </div>
        {project.assemblies.length > 0 && (
          <button
            onClick={exportPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
        )}
      </div>

      {project.assemblies.length === 0 ? (
        <p className="p-4 text-gray-500">{t.noAssemblies}</p>
      ) : (
        <div className="divide-y">
          <p className="px-4 pt-3 text-xs text-gray-400">{t.excludedItemsNote}</p>
          {sections.map(({ key, title }) => {
            const entries = Object.entries(boqData[key]);
            if (entries.length === 0) return null;
            const categoryExcluded = !!excluded[key];
            return (
              <div key={key} className="p-4">
                <h3 className={`font-medium text-white px-3 py-2 rounded-t flex items-center justify-between ${categoryExcluded ? 'bg-gray-400' : 'bg-gray-600'}`}>
                  <span className={categoryExcluded ? 'line-through' : ''}>
                    {title}
                    {categoryExcluded && <span className="ml-2 text-xs font-normal no-underline">({t.excludedLabel})</span>}
                  </span>
                  <button
                    onClick={() => toggleCategory(key)}
                    className="text-xs flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-1 rounded"
                    title={categoryExcluded ? t.includeCategory : t.excludeCategory}
                  >
                    {categoryExcluded ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {categoryExcluded ? t.includeInOrder : t.excludeFromOrder}
                  </button>
                </h3>
                <table className="w-full text-sm border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100 text-left text-gray-600">
                      <th className="p-2 border-b w-[36%]">{t.item}</th>
                      <th className="p-2 border-b w-[18%]">{t.color}</th>
                      <th className="p-2 border-b w-[22%]">{t.sku}</th>
                      <th className="p-2 border-b text-center w-[12%]">{t.qty}</th>
                      <th className="p-2 border-b w-[12%]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(([itemKey, item]) => {
                      const rowExcluded = isEntryExcluded(excluded, key, itemKey);
                      return (
                        <tr key={itemKey} className={`border-b hover:bg-gray-50 ${rowExcluded ? 'opacity-50' : ''}`}>
                          <td className={`p-2 ${rowExcluded ? 'line-through' : ''}`}>{item.name}</td>
                          <td className="p-2 text-gray-600">{item.color}</td>
                          <td className="p-2 font-mono text-gray-400 italic">{item.sku || '—'}</td>
                          <td className={`p-2 text-center font-mono font-bold ${rowExcluded ? 'line-through' : ''}`}>{item.qty}</td>
                          <td className="p-2 text-right">
                            {!categoryExcluded && (
                              <button
                                onClick={() => toggleItem(key, itemKey)}
                                className={`text-xs flex items-center gap-1 ml-auto px-2 py-1 rounded ${rowExcluded ? 'text-green-700 hover:bg-green-50' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                                title={rowExcluded ? t.includeInOrder : t.excludeFromOrder}
                              >
                                {rowExcluded ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
