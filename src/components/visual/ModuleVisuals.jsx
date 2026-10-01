import React from 'react';
import { getSystemProportions } from '../../data/libraries';
import { adjustBrightness } from '../../graphics/colors';
import { ModuleGraphicsByType, getGraphicTypeFromId, getModuleGraphic } from '../../graphics/moduleGraphics';
import { isDarkColor } from '../../lib/library';

// Module image component
export const ModuleImage = ({ moduleId, graphic, color, colorHex, width = 60, height = 80, className = '', moduleSize = 1 }) => {
  const graphicType = (graphic && ModuleGraphicsByType[graphic]) ? graphic : getGraphicTypeFromId(moduleId, moduleSize);
  const SvgComponent = ModuleGraphicsByType[graphicType] || ModuleGraphicsByType.generic1m;
  const effectiveColor = colorHex || color;
  
  return (
    <div className={className} style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <SvgComponent color={effectiveColor} width={width} height={height} />
    </div>
  );
};

// Thumbnail for module list in Library
export const ModuleThumbnail = ({ moduleId, graphic, size = 40, moduleSize = 1 }) => {
  const graphicType = (graphic && ModuleGraphicsByType[graphic]) ? graphic : getGraphicTypeFromId(moduleId, moduleSize);
  // Real BTicino proportions: 1M = 8.5 x 31, 2M = 17 x 31
  const is2M = graphicType === 'schuko' || graphicType === 'dimmer' || graphicType === 'generic2m' || moduleSize === 2;
  const aspectRatio = is2M ? (17 / 31) : (8.5 / 31);
  const height = size;
  const width = height * aspectRatio;
  
  const Graphic = ModuleGraphicsByType[graphicType] || ModuleGraphicsByType.generic1m;
  
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
  const moduleSlots = [];
  let currentPos = 0;
  (assembly.modules || []).forEach((mod, index) => {
    const catalogItem = MODULE_CATALOG.find(c => c.id === mod.moduleId);
    const size = catalogItem?.size || 1;
    moduleSlots.push({ ...mod, index, startPos: currentPos, size, catalogItem });
    currentPos += size;
  });
  
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
          return (
            <div
              key={slot.id || idx}
              className="relative flex-shrink-0 flex items-center justify-center"
              style={{
                width: slot.size * moduleWidth1M,
                height: '100%',
                borderLeft: idx === 0 ? `1px solid ${moduleBorderColor}` : 'none',
                borderRight: `1px solid ${moduleBorderColor}`,
                borderRadius: moduleCornerRadius,
              }}
            >
              {ModuleGraphic && (
                <ModuleGraphic color={colorHex || assembly.color} width={slot.size * moduleWidth1M - 2} height={moduleHeight} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
