import React, { useMemo } from 'react';
import { FileText, Eye, EyeOff } from 'lucide-react';
import { useTranslation, useLanguage } from '../i18n';
import { isEntryExcluded } from '../lib/assemblies';
import { getColorName, LibraryContext, getWallBoxPrice, getInstallFacePrice, getDecorFacePrice, getModulePrice, getModuleFacePrice, getModuleName, getModuleCatalog } from '../lib/library';
import { VAT_RATE } from '../lib/pricing';
import { generateQuotePdf } from '../pdf/quotePdf';

export function QuoteView({ project, onUpdate }) {
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
      Object.keys(next).forEach(k => { if (k.startsWith(`${category}:`)) delete next[k]; });
    }
    setExcluded(next);
  };

  const quoteData = useMemo(() => {
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

      // Wall Box - separate by type
      const wbKey = `${assembly.size}M`;
      const wbPrice = getWallBoxPrice(assembly.size, wallBoxType, library);
      
      if (wallBoxType === 'drywall') {
        items.wallBoxesDrywall[wbKey] = items.wallBoxesDrywall[wbKey] || { 
          name: `${t.wallBoxDrywallItem} ${assembly.size}M`, 
          color: '—',
          unitPrice: wbPrice,
          qty: 0 
        };
        items.wallBoxesDrywall[wbKey].qty++;
      } else {
        items.wallBoxesMasonry[wbKey] = items.wallBoxesMasonry[wbKey] || { 
          name: `${t.wallBoxMasonryItem} ${assembly.size}M`, 
          color: '—',
          unitPrice: wbPrice,
          qty: 0 
        };
        items.wallBoxesMasonry[wbKey].qty++;
      }

      // Install Face
      const ifKey = `${assembly.size}M`;
      const ifPrice = getInstallFacePrice(assembly.size, library);
      items.installFaces[ifKey] = items.installFaces[ifKey] || { 
        name: `${t.supportItem} ${assembly.size}M`, 
        color: '—',
        unitPrice: ifPrice,
        qty: 0 
      };
      items.installFaces[ifKey].qty++;

      // Decor Face
      const dfKey = `${assembly.size}M-${assembly.color}`;
      const dfPrice = getDecorFacePrice(assembly.size, assembly.color, library);
      items.decorFaces[dfKey] = items.decorFaces[dfKey] || { 
        name: `${t.coverPlateItem} ${assembly.size}M`, 
        color: colorName,
        unitPrice: dfPrice,
        qty: 0 
      };
      items.decorFaces[dfKey].qty++;

      // Modules and their faces
      assembly.modules.forEach((mod) => {
        const catalogItem = MODULE_CATALOG.find(c => c.id === mod.moduleId);
        if (catalogItem) {
          // Module - use color-specific price
          const modKey = `${mod.moduleId}-${assembly.color}`;
          const modPrice = getModulePrice(mod.moduleId, assembly.color, library);
          const translatedName = getModuleName(catalogItem, lang);
          items.modules[modKey] = items.modules[modKey] || { 
            name: translatedName, 
            color: colorName,
            unitPrice: modPrice,
            qty: 0 
          };
          items.modules[modKey].qty++;

          // Module Face
          if (library?.hasModuleFaces === false) return;
          const mfKey = `${mod.moduleId}-${assembly.color}-face`;
          const mfPrice = getModuleFacePrice(mod.moduleId, assembly.color, library);
          items.moduleFaces[mfKey] = items.moduleFaces[mfKey] || { 
            name: `${translatedName} - ${t.face}`, 
            color: colorName,
            unitPrice: mfPrice,
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

  // Calculate totals
  const VAT_RATE = 0.21; // 21% TVA in Romania

  const activeEntries = (catKey) => Object.entries(quoteData[catKey])
    .filter(([itemKey]) => !isEntryExcluded(excluded, catKey, itemKey));

  const calculateSectionTotal = (entries) => {
    return entries.reduce((sum, [, item]) => sum + (item.unitPrice * item.qty), 0);
  };

  const grandTotalWithVat = sections.reduce(
    (sum, { key }) => sum + calculateSectionTotal(activeEntries(key)),
    0
  );

  // Prices in library are stored WITH VAT, so we calculate backwards
  const grandTotalWithoutVat = grandTotalWithVat / (1 + VAT_RATE);
  const vatAmount = grandTotalWithVat - grandTotalWithoutVat;

  const totalItems = sections.reduce(
    (sum, { key }) => sum + activeEntries(key).reduce((s, [, item]) => s + item.qty, 0),
    0
  );

  const formatPrice = (price) => {
    return price.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  // Calculate price without VAT from price with VAT
  const priceWithoutVat = (priceWithVat) => priceWithVat / (1 + VAT_RATE);

  // Export PDF function for Quote
  const exportQuotePDF = () => generateQuotePdf({ lang, t, project, totalItems, sections, activeEntries, calculateSectionTotal, formatPrice, priceWithoutVat, grandTotalWithoutVat, vatAmount, grandTotalWithVat });

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">{t.clientQuote}</h2>
            <p className="text-gray-600 mt-1">{project.name}</p>
            {project.clientName && (
              <p className="text-gray-500">{t.quoteFor}: {project.clientName}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm text-gray-500">
              <p>{t.date}: {new Date().toLocaleDateString()}</p>
              <p>{project.assemblies.length} {t.assemblies}</p>
              <p>{totalItems} {t.totalItems}</p>
            </div>
            {project.assemblies.length > 0 && (
              <button
                onClick={exportQuotePDF}
                className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700"
              >
                <FileText className="w-4 h-4" />
                Export PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {project.assemblies.length === 0 ? (
        <p className="p-4 text-gray-500">{t.noAssemblies}</p>
      ) : (
        <>
          <div className="divide-y">
            <p className="px-4 pt-3 text-xs text-gray-400">{t.excludedItemsNote}</p>
            {sections.map(({ key, title }) => {
              const entries = Object.entries(quoteData[key]);
              if (entries.length === 0) return null;
              const categoryExcluded = !!excluded[key];
              const sectionTotalWithVat = calculateSectionTotal(activeEntries(key));
              return (
                <div key={key} className="p-4">
                  <h3 className={`font-medium text-white px-3 py-2 rounded-t flex items-center justify-between ${categoryExcluded ? 'bg-gray-400' : 'bg-gray-600'}`}>
                    <span className={categoryExcluded ? 'line-through' : ''}>
                      {title}
                      {categoryExcluded && <span className="ml-2 text-xs font-normal">({t.excludedLabel})</span>}
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
                        <th className="p-2 border-b w-[26%]">{t.item}</th>
                        <th className="p-2 border-b w-[10%]">{t.color}</th>
                        <th className="p-2 border-b text-right w-[14%]">{t.unitPriceExclVat}</th>
                        <th className="p-2 border-b text-right w-[14%]">{t.unitPriceInclVat}</th>
                        <th className="p-2 border-b text-center w-[8%]">{t.qty}</th>
                        <th className="p-2 border-b text-right w-[16%]">{t.total}</th>
                        <th className="p-2 border-b w-[12%]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map(([itemKey, item]) => {
                        const rowExcluded = isEntryExcluded(excluded, key, itemKey);
                        const unitWithoutVat = priceWithoutVat(item.unitPrice);
                        const totalWithVat = item.unitPrice * item.qty;
                        return (
                          <tr key={itemKey} className={`border-b hover:bg-gray-50 ${rowExcluded ? 'opacity-50' : ''}`}>
                            <td className={`p-2 ${rowExcluded ? 'line-through' : ''}`}>{item.name}</td>
                            <td className="p-2 text-gray-600">{item.color}</td>
                            <td className="p-2 text-right font-mono text-gray-400">{formatPrice(unitWithoutVat)}</td>
                            <td className="p-2 text-right font-mono">{formatPrice(item.unitPrice)}</td>
                            <td className={`p-2 text-center font-mono ${rowExcluded ? 'line-through' : ''}`}>{item.qty}</td>
                            <td className={`p-2 text-right font-mono font-bold ${rowExcluded ? 'line-through' : ''}`}>
                              {formatPrice(totalWithVat)}
                            </td>
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
                      <tr className="bg-gray-100">
                        <td colSpan={5} className="p-2 text-right font-bold">{t.subtotal}:</td>
                        <td className="p-2 text-right font-mono font-bold">{formatPrice(sectionTotalWithVat)}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>

          {/* Grand Total with VAT breakdown */}
          <div className="p-6 bg-gray-100 border-t mt-8">
            <div className="flex justify-between items-start">
              <div className="text-sm text-gray-600">
                <p className="mb-1">{t.vatRate}</p>
              </div>
              <div className="text-right">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between gap-8">
                    <span className="text-gray-600">{t.totalWithoutVat}:</span>
                    <span className="font-mono">{formatPrice(grandTotalWithoutVat)}</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span className="text-gray-600">{t.vatAmount}:</span>
                    <span className="font-mono">{formatPrice(vatAmount)}</span>
                  </div>
                  <div className="flex justify-between gap-8 pt-2 border-t border-gray-300">
                    <span className="font-semibold">{t.totalWithVat}:</span>
                    <span className="font-mono font-bold text-lg">{formatPrice(grandTotalWithVat)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
