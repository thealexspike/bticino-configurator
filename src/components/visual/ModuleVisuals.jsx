import React from 'react';
import { getSystemProportions } from '../../data/libraries';
import { adjustBrightness } from '../../graphics/colors';
import { ModuleGraphicsByType, getGraphicTypeFromId, getModuleGraphic } from '../../graphics/moduleGraphics';
import { isDarkColor } from '../../lib/library';
import { layoutModules } from '../../lib/mounting';

// Module image component
export const ModuleImage = ({ moduleId, graphic, color, colorHex, width = 60, height = 80, className = '' }) => {
  const graphicType = (graphic && ModuleGraphicsByType[graphic]) ? graphic : getGraphicTypeFromId(moduleId);
  const SvgComponent = ModuleGraphicsByType[graphicType] || ModuleGraphicsByType.generic;
  const effectiveColor = colorHex || color;

  return (
    <div className={className} style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <SvgComponent color={effectiveColor} width={width} height={height} />
    </div>
  );
};

// Thumbnail for module list in Library
export const ModuleThumbnail = ({ moduleId, graphic, size = 40, moduleSize = 1 }) => {
  const graphicType = (graphic && ModuleGraphicsByType[graphic]) ? graphic : getGraphicTypeFromId(moduleId);
  // Real BTicino proportions: 1M = 8.5 x 31, 2M = 17 x 31
  const is2M = moduleSize === 2; // dimensiunea vine din modul, nu din grafică
  const aspectRatio = is2M ? (17 / 31) : (8.5 / 31);
  const height = size;
  const width = height * aspectRatio;

  const Graphic = ModuleGraphicsByType[graphicType] || ModuleGraphicsByType.generic;

  return (
    <div
      className="border border-gray-400 bg-gray-100"
      style={{
        width: width,
        height: height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Graphic color="white" width={width} height={height} />
    </div>
  );
};

// Assembly Thumbnail - static preview of an assembly
// Uses fit-to-box scaling so all systems produce consistent-size thumbnails
export const AssemblyThumbnail = ({ assembly, library, maxWidth = 120, maxHeight = 70 }) => {
  if (!assembly) return null;

  const MODULE_CATALOG = library?.modules || [];
  const props = getSystemProportions(library);

  // Calculate natural (unscaled) dimensions from system proportions
  const naturalModuleArea = assembly.size * props.moduleWidth1M;
  const naturalWidth = naturalModuleArea + (props.sideMargin * 2);
  // For systems without top/bottom margins (BTicino), use support bar area for effective height
  const naturalHeight = (props.topMargin + props.moduleHeight + props.bottomMargin)
    || (props.moduleHeight + (props.supportBarHeight + props.supportBarOffset) * 2);

  // Fit-to-box: scale to fit within maxWidth x maxHeight while preserving aspect ratio
  const fitScale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight);

  const moduleWidth1M = props.moduleWidth1M * fitScale;
  const moduleHeight = props.moduleHeight * fitScale;
  const sideMargin = props.sideMargin * fitScale;
  const topMargin = props.topMargin * fitScale;
  const totalHeight = (props.topMargin + props.moduleHeight + props.bottomMargin) * fitScale
    || (props.moduleHeight + (props.supportBarHeight + props.supportBarOffset) * 2) * fitScale;
  const cornerRadius = props.cornerRadius * fitScale;
  const moduleCornerRadius = props.moduleCornerRadius * fitScale;
  const inset = (props.slotInset || 0) * fitScale; // ferestrele posturilor (sisteme cu posturi)

  const moduleAreaWidth = assembly.size * moduleWidth1M;
  const totalWidth = moduleAreaWidth + (sideMargin * 2);

  // Vertical offset: center modules in totalHeight for systems without explicit margins
  const moduleTop = props.topMargin > 0 ? topMargin : (totalHeight - moduleHeight) / 2;

  // Colors
  const _dark = isDarkColor(assembly.color, library);
  const colorHex = (library?.availableColors || []).find(c => c.id === assembly.color)?.hex;
  const faceBgColor = colorHex || (_dark ? '#3a3a3a' : '#f5f5f5');
  const frameBorderColor = _dark ? '#888' : '#999';
  const moduleBorderColor = _dark ? adjustBrightness(colorHex || '#3a3a3a', 30) : adjustBrightness(colorHex || '#f5f5f5', -25);

  // Module slots
  // Pozițiile modulelor (la posturi: cu goluri de aliniere, gapBefore)
  const moduleSlots = layoutModules(assembly.modules, { ...library, modules: MODULE_CATALOG });
  const lastSlot = moduleSlots[moduleSlots.length - 1];
  const currentPos = lastSlot ? lastSlot.startPos + lastSlot.size : 0;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: totalWidth,
        height: totalHeight,
        backgroundColor: faceBgColor,
        border: `1px solid ${frameBorderColor}`,
        borderRadius: cornerRadius,
      }}
    >
      {/* Module area */}
      <div
        className="absolute flex"
        style={{
          left: sideMargin,
          top: moduleTop,
          width: moduleAreaWidth,
          height: moduleHeight,
        }}
      >
        {moduleSlots.map((slot, idx) => {
          const ModuleGraphic = slot.catalogItem ? getModuleGraphic(slot.catalogItem) : null;
          const postStep = props.postSize || 2;
          const insetL = inset > 0 && slot.startPos % postStep === 0 ? inset : 0;
          const insetR = inset > 0 && (slot.startPos + slot.size) % postStep === 0 ? inset : 0;
          return (
            <React.Fragment key={slot.id || idx}>
            {/* Gol de aliniere: jumătatea liberă a unui post început */}
            {slot.gapBefore > 0 && (
              <div className="relative flex-shrink-0" style={{ width: slot.gapBefore * moduleWidth1M, height: '100%', paddingTop: inset, paddingBottom: inset, paddingRight: inset, boxSizing: 'border-box' }}>
                {inset > 0 && <div style={{ width: '100%', height: '100%', border: `1px dashed ${moduleBorderColor}`, borderRadius: moduleCornerRadius }} />}
              </div>
            )}
            <div
              className="relative flex-shrink-0 flex items-center justify-center"
              style={inset > 0 ? {
                width: slot.size * moduleWidth1M,
                height: '100%',
                paddingTop: inset,
                paddingBottom: inset,
                paddingLeft: insetL,
                paddingRight: insetR,
                boxSizing: 'border-box',
              } : {
                width: slot.size * moduleWidth1M,
                height: '100%',
                borderLeft: idx === 0 ? `1px solid ${moduleBorderColor}` : 'none',
                borderRight: `1px solid ${moduleBorderColor}`,
                borderRadius: moduleCornerRadius,
              }}
            >
              {inset > 0 ? (
                <div className="overflow-hidden" style={{ lineHeight: 0, border: `1px solid ${moduleBorderColor}`, borderRadius: moduleCornerRadius }}>
                  {ModuleGraphic && (
                    <ModuleGraphic color={colorHex || assembly.color} width={Math.max(1, slot.size * moduleWidth1M - insetL - insetR - 2)} height={Math.max(1, moduleHeight - 2 * inset - 2)} />
                  )}
                </div>
              ) : ModuleGraphic && (
                <ModuleGraphic color={colorHex || assembly.color} width={slot.size * moduleWidth1M - 2} height={moduleHeight} />
              )}
            </div>
            </React.Fragment>
          );
        })}
        {/* Sistem cu posturi: ferestre goale pe posturile libere */}
        {inset > 0 && currentPos % (props.postSize || 2) !== 0 && currentPos < assembly.size && (
          <div className="relative flex-shrink-0 flex items-center" style={{ width: moduleWidth1M, height: '100%', paddingRight: inset, paddingTop: inset, paddingBottom: inset, boxSizing: 'border-box' }}>
            <div style={{ width: '100%', height: '100%', border: `1px dashed ${moduleBorderColor}`, borderRadius: moduleCornerRadius }} />
          </div>
        )}
        {inset > 0 && Array.from({ length: Math.max(0, Math.floor((assembly.size - (currentPos + (currentPos % (props.postSize || 2) ? (props.postSize || 2) - (currentPos % (props.postSize || 2)) : 0))) / (props.postSize || 2))) }).map((_, i) => (
          <div key={`empty-${i}`} className="relative flex-shrink-0 flex items-center justify-center" style={{ width: (props.postSize || 2) * moduleWidth1M, height: '100%' }}>
            <div style={{ width: (props.postSize || 2) * moduleWidth1M - 2 * inset, height: moduleHeight - 2 * inset, border: `1px dashed ${moduleBorderColor}`, borderRadius: moduleCornerRadius }} />
          </div>
        ))}
      </div>
    </div>
  );
};
