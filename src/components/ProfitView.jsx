import React, { useMemo } from 'react';
import { useTranslation, useLanguage } from '../i18n';
import { isEntryExcluded } from '../lib/assemblies';
import { getColorName, LibraryContext, getModuleName, getModuleCatalog } from '../lib/library';
import { wallBoxLines, hasSeparateSupports, sizeLabel, postLayout, halfPostSupportOf } from '../lib/mounting';
import { VAT_RATE } from '../lib/pricing';

export function ProfitView({ project }) {
  const library = React.useContext(LibraryContext);
  const t = useTranslation();
  const lang = useLanguage();
  const MODULE_CATALOG = getModuleCatalog(library);
  const excluded = useMemo(() => project.excludedItems || {}, [project.excludedItems]);

  const profitDataAll = useMemo(() => {
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
      const wbTable = wallBoxType === 'drywall' ? library.wallBoxesDrywall : library.wallBoxesMasonry;
      for (const line of wallBoxLines(assembly, library, lang)) {
        const wbKey = `${line.size}M`;
        items[wbCategory][wbKey] = items[wbCategory][wbKey] || {
          name: `${wbItemName} ${line.label}`,
          purchasePrice: wbTable?.[line.size]?.purchasePrice || 0,
          sellingPrice: (wbTable?.[line.size]?.price || 0) / (1 + VAT_RATE),
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
          purchasePrice: library.installFaces?.[assembly.size]?.purchasePrice || 0,
          sellingPrice: (library.installFaces?.[assembly.size]?.price || 0) / (1 + VAT_RATE),
          color: '—',
          qty: 0,
        };
        items.installFaces[ifKey].qty++;
      }

      // Suport pentru module 1/2 — câte unul pe fiecare post cu module de jumătate
      const halfPosts = postLayout(assembly.modules, library).halfPosts;
      const halfSupport = halfPostSupportOf(library);
      if (halfPosts > 0 && halfSupport) {
        items.installFaces['half-post'] = items.installFaces['half-post'] || {
          name: t.halfPostSupportItem,
          purchasePrice: halfSupport.purchasePrice || 0,
          sellingPrice: (halfSupport.price || 0) / (1 + VAT_RATE),
          color: '—',
          qty: 0,
        };
        items.installFaces['half-post'].qty += halfPosts;
      }

      // Ramă decor (+ montaj, la sistemele unde vin la pachet)
      const dfKey = `${assembly.size}M-${assembly.color}`;
      items.decorFaces[dfKey] = items.decorFaces[dfKey] || {
        name: `${hasSeparateSupports(library) ? t.coverPlateItem : t.coverPlateWithSupportItem} ${sizeLabel(assembly.size, library, lang)}`,
        purchasePrice: library.decorFaces?.[`${assembly.size}-${assembly.color}`]?.purchasePrice || 0,
        sellingPrice: (library.decorFaces?.[`${assembly.size}-${assembly.color}`]?.price || 0) / (1 + VAT_RATE),
        color: colorName,
        qty: 0,
      };
      items.decorFaces[dfKey].qty++;

      // Modules and their faces
      assembly.modules.forEach((mod) => {
        const catalogItem = MODULE_CATALOG.find(c => c.id === mod.moduleId);
        if (catalogItem) {
          const translatedName = getModuleName(catalogItem, lang);

          // Module
          const modKey = `${mod.moduleId}-${assembly.color}`;
          const modPurchase = typeof catalogItem.modulePurchasePrice === 'object'
            ? catalogItem.modulePurchasePrice?.[assembly.color] || 0
            : catalogItem.modulePurchasePrice || 0;
          const modPrice = typeof catalogItem.modulePrice === 'object'
            ? catalogItem.modulePrice?.[assembly.color] || 0
            : catalogItem.modulePrice || 0;
          const modSellingWithoutVat = modPrice / (1 + VAT_RATE);

          items.modules[modKey] = items.modules[modKey] || {
            name: translatedName,
            color: colorName,
            purchasePrice: modPurchase,
            sellingPrice: modSellingWithoutVat,
            qty: 0
          };
          items.modules[modKey].qty++;

          // Module Face
          if (library?.hasModuleFaces === false) return;
          const mfKey = `${mod.moduleId}-${assembly.color}-face`;
          const mfPurchase =catalogItem.facePurchasePrice?.[assembly.color] || 0;
          const mfPrice = catalogItem.facePrice?.[assembly.color] || 0;
          const mfSellingWithoutVat = mfPrice / (1 + VAT_RATE);

          items.moduleFaces[mfKey] = items.moduleFaces[mfKey] || {
            name: `${translatedName} - ${t.face}`,
            color: colorName,
            purchasePrice: mfPurchase,
            sellingPrice: mfSellingWithoutVat,
            qty: 0
          };
          items.moduleFaces[mfKey].qty++;
        }
      });
    });

    return items;
  }, [project, library, MODULE_CATALOG, t, lang]);

  // Articolele excluse din comandă nu intră în analiza de profit
  const profitData = useMemo(() => {
    const filtered = {};
    Object.entries(profitDataAll).forEach(([cat, items]) => {
      filtered[cat] = {};
      Object.entries(items).forEach(([itemKey, item]) => {
        if (!isEntryExcluded(excluded, cat, itemKey)) filtered[cat][itemKey] = item;
      });
    });
    return filtered;
  }, [profitDataAll, excluded]);

  const sections = [
    { key: 'wallBoxesMasonry', title: t.wallBoxesMasonry || 'Wall Boxes (Masonry)' },
    { key: 'wallBoxesDrywall', title: t.wallBoxesDrywall || 'Wall Boxes (Drywall)' },
    { key: 'installFaces', title: t.installFaces },
    { key: 'decorFaces', title: t.decorFaces },
    { key: 'modules', title: t.modules },
    { key: 'moduleFaces', title: t.moduleFaces },
  ];

  // Calculate totals
  const calculateSectionTotals = (items) => {
    let totalPurchase = 0;
    let totalSelling = 0;
    Object.values(items).forEach(item => {
      totalPurchase += item.purchasePrice * item.qty;
      totalSelling += item.sellingPrice * item.qty;
    });
    return { totalPurchase, totalSelling, profit: totalSelling - totalPurchase };
  };

  const grandTotals = useMemo(() => {
    let totalPurchase = 0;
    let totalSelling = 0;

    Object.values(profitData).forEach(category => {
      Object.values(category).forEach(item => {
        totalPurchase += item.purchasePrice * item.qty;
        totalSelling += item.sellingPrice * item.qty;
      });
    });

    const grossProfit = totalSelling - totalPurchase;
    const profitMargin = totalSelling > 0 ? (grossProfit / totalSelling) * 100 : 0;

    // VAT calculations
    const vatCollected = totalSelling * VAT_RATE; // TVA colectat din vânzări
    const vatDeductible = totalPurchase * VAT_RATE; // TVA deductibil din achiziții
    const vatPayable = vatCollected - vatDeductible; // TVA de plată

    return {
      totalPurchase,
      totalSelling,
      grossProfit,
      profitMargin,
      vatCollected,
      vatDeductible,
      vatPayable
    };
  }, [profitData]);

  const totalItems = Object.values(profitData).reduce(
    (sum, category) => sum + Object.values(category).reduce((s, item) => s + item.qty, 0),
    0
  );

  const formatPrice = (price) => {
    return price.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex justify-between items-center p-4 border-b">
        <div>
          <h2 className="font-semibold text-lg">{t.profitAnalysis}</h2>
          <p className="text-sm text-gray-500">{project.name} · {totalItems} {t.totalItems?.toLowerCase()}</p>
        </div>
      </div>

      {project.assemblies.length === 0 ? (
        <p className="p-4 text-gray-500">{t.noAssemblies}</p>
      ) : (
        <>
          <div className="divide-y">
            {sections.map(({ key, title }) => {
              const items = Object.values(profitData[key]);
              if (items.length === 0) return null;
              const sectionTotals = calculateSectionTotals(profitData[key]);

              return (
                <div key={key} className="p-4">
                  <h3 className="font-medium text-white bg-gray-600 px-3 py-2 rounded-t">{title}</h3>
                  <table className="w-full text-sm border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100 text-left text-gray-600">
                        <th className="p-2 border-b w-[26%]">{t.item}</th>
                        <th className="p-2 border-b w-[10%]">{t.color}</th>
                        <th className="p-2 border-b text-right w-[12%]">{t.unitPurchase}</th>
                        <th className="p-2 border-b text-right w-[12%]">{t.unitSelling}</th>
                        <th className="p-2 border-b text-right w-[10%]">{t.unitDifference}</th>
                        <th className="p-2 border-b text-center w-[8%]">{t.qty}</th>
                        <th className="p-2 border-b text-right w-[14%]">{t.unitProfit}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => {
                        const unitDiff = item.sellingPrice - item.purchasePrice;
                        const lineProfit = unitDiff * item.qty;
                        return (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="p-2">{item.name}</td>
                            <td className="p-2 text-gray-600">{item.color}</td>
                            <td className="p-2 text-right font-mono text-gray-500">{formatPrice(item.purchasePrice)}</td>
                            <td className="p-2 text-right font-mono">{formatPrice(item.sellingPrice)}</td>
                            <td className={`p-2 text-right font-mono ${unitDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatPrice(unitDiff)}</td>
                            <td className="p-2 text-center font-mono">{item.qty}</td>
                            <td className={`p-2 text-right font-mono font-bold ${lineProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatPrice(lineProfit)}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-gray-100">
                        <td colSpan={6} className="p-2 text-right font-bold">{t.subtotal}:</td>
                        <td className={`p-2 text-right font-mono font-bold ${sectionTotals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPrice(sectionTotals.profit)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>

          {/* Grand Totals - Profit Summary */}
          <div className="p-6 bg-green-50 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profit Section */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">{t.grossProfit}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.purchaseTotalExclVat}:</span>
                    <span className="font-mono">{formatPrice(grandTotals.totalPurchase)} RON</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.sellingTotalExclVat}:</span>
                    <span className="font-mono">{formatPrice(grandTotals.totalSelling)} RON</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-semibold">{t.grossProfit}:</span>
                    <span className={`font-mono font-bold text-lg ${grandTotals.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPrice(grandTotals.grossProfit)} RON
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>{t.profitMargin}:</span>
                    <span className="font-mono">{grandTotals.profitMargin.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* VAT Section */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">{t.vatPayable}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.vatCollected}:</span>
                    <span className="font-mono">{formatPrice(grandTotals.vatCollected)} RON</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.vatDeductible}:</span>
                    <span className="font-mono">-{formatPrice(grandTotals.vatDeductible)} RON</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-semibold">{t.vatPayable}:</span>
                    <span className={`font-mono font-bold text-lg ${grandTotals.vatPayable >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {formatPrice(grandTotals.vatPayable)} RON
                    </span>
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
