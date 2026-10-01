import React from 'react';
import { svgPalette, resolveColorHex } from './colors';

// Graphics definitions by type
// Each receives colorHex (e.g. '#C2A878') and derives all SVG fill colors from it

export const ModuleGraphicsByType = {
  // Schuko outlet - 2M full size
  schuko: ({ color = 'white', width = 60, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    return (
      <svg width={width} height={height} viewBox="0 0 60 80">
        <rect x="0" y="0" width="60" height="80" fill={p.bg}/>
        <circle cx="30" cy="40" r="24" fill={p.accent}/>
        <rect x="8" y="32" width="4" height="16" rx="1" fill={p.ground}/>
        <rect x="48" y="32" width="4" height="16" rx="1" fill={p.ground}/>
        <circle cx="20" cy="40" r="5" fill={p.holes}/>
        <circle cx="40" cy="40" r="5" fill={p.holes}/>
      </svg>
    );
  },
  italian: ({ color = 'white', width = 30, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    return (
      <svg width={width} height={height} viewBox="0 0 30 80">
        <rect x="0" y="0" width="30" height="80" fill={p.bg}/>
        <ellipse cx="15" cy="40" rx="10" ry="22" fill={p.accent}/>
        <circle cx="15" cy="28" r="3" fill={p.holes}/>
        <circle cx="15" cy="40" r="3" fill={p.holes}/>
        <circle cx="15" cy="52" r="3" fill={p.holes}/>
      </svg>
    );
  },
  switch: ({ color = 'white', width = 30, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    return (
      <svg width={width} height={height} viewBox="0 0 30 80">
        <rect x="0" y="0" width="30" height="80" fill={p.bg}/>
        <path d="M10 40 L20 40 M15 35 L15 45" stroke={p.symbol} strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="15" cy="70" r="3" fill="#4ade80"/>
      </svg>
    );
  },
  switch_stair: ({ color = 'white', width = 30, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    return (
      <svg width={width} height={height} viewBox="0 0 30 80">
        <rect x="0" y="0" width="30" height="80" fill={p.bg}/>
        <path d="M9 38 L15 30 L21 38" stroke={p.symbol} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M9 46 L15 54 L21 46" stroke={p.symbol} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="15" cy="70" r="3" fill="#fbbf24"/>
      </svg>
    );
  },
  switch_cross: ({ color = 'white', width = 30, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    return (
      <svg width={width} height={height} viewBox="0 0 30 80">
        <rect x="0" y="0" width="30" height="80" fill={p.bg}/>
        <path d="M9 32 L21 52 M21 32 L9 52" stroke={p.symbol} strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="15" cy="70" r="3" fill="#f97316"/>
      </svg>
    );
  },
  dimmer: ({ color = 'white', width = 60, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    return (
      <svg width={width} height={height} viewBox="0 0 60 80">
        <rect x="0" y="0" width="60" height="80" fill={p.bg}/>
        <line x1="30" y1="5" x2="30" y2="75" stroke={p.divider} strokeWidth="1"/>
        <path d="M10 40 L20 40 M15 35 L15 45" stroke={p.symbol} strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M40 40 L50 40" stroke={p.symbol} strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="15" cy="70" r="3" fill="#4ade80"/>
        <circle cx="45" cy="70" r="3" fill="#4ade80"/>
      </svg>
    );
  },
  usb: ({ color = 'white', width = 30, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    return (
      <svg width={width} height={height} viewBox="0 0 30 80">
        <rect x="0" y="0" width="30" height="80" fill={p.bg}/>
        <rect x="7" y="18" width="16" height="10" rx="1" fill={p.port}/>
        <rect x="9" y="20" width="12" height="6" rx="0.5" fill={p.portInner}/>
        <rect x="7" y="38" width="16" height="10" rx="1" fill={p.port}/>
        <rect x="9" y="40" width="12" height="6" rx="0.5" fill={p.portInner}/>
        <text x="15" y="68" fontSize="8" fill={p.symbol} textAnchor="middle" fontFamily="Arial" fontWeight="bold">USB</text>
      </svg>
    );
  },
  coax: ({ color = 'white', width = 30, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    return (
      <svg width={width} height={height} viewBox="0 0 30 80">
        <rect x="0" y="0" width="30" height="80" fill={p.bg}/>
        <circle cx="15" cy="38" r="10" fill={p.connector}/>
        <circle cx="15" cy="38" r="6" fill={p.bg}/>
        <circle cx="15" cy="38" r="2.5" fill={p.holes}/>
        <text x="15" y="68" fontSize="7" fill={p.symbol} textAnchor="middle" fontFamily="Arial" fontWeight="bold">TV</text>
      </svg>
    );
  },
  utp: ({ color = 'white', width = 30, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    return (
      <svg width={width} height={height} viewBox="0 0 30 80">
        <rect x="0" y="0" width="30" height="80" fill={p.bg}/>
        <rect x="6" y="28" width="18" height="22" rx="1" fill={p.port}/>
        <rect x="8" y="32" width="14" height="14" rx="0.5" fill={p.bg}/>
        {[0,1,2,3,4,5,6,7].map(i => (
          <rect key={i} x={9 + i * 1.5} y="33" width="1" height="8" fill={p.contacts}/>
        ))}
        <rect x="12" y="46" width="6" height="3" fill={p.bg}/>
        <text x="15" y="68" fontSize="7" fill={p.symbol} textAnchor="middle" fontFamily="Arial" fontWeight="bold">UTP</text>
      </svg>
    );
  },
  generic1m: ({ color = 'white', width = 30, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    return (
      <svg width={width} height={height} viewBox="0 0 30 80">
        <rect x="0" y="0" width="30" height="80" fill={p.bg}/>
        <circle cx="15" cy="36" r="12" fill="none" stroke={p.placeholder} strokeWidth="2" strokeDasharray="4 2"/>
        <text x="15" y="42" fontSize="14" fill={p.placeholder} textAnchor="middle" fontFamily="Arial" fontWeight="bold">?</text>
        <text x="15" y="68" fontSize="7" fill={p.placeholder} textAnchor="middle" fontFamily="Arial">1M</text>
      </svg>
    );
  },
  generic2m: ({ color = 'white', width = 60, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    return (
      <svg width={width} height={height} viewBox="0 0 60 80">
        <rect x="0" y="0" width="60" height="80" fill={p.bg}/>
        <circle cx="30" cy="36" r="14" fill="none" stroke={p.placeholder} strokeWidth="2" strokeDasharray="4 2"/>
        <text x="30" y="44" fontSize="16" fill={p.placeholder} textAnchor="middle" fontFamily="Arial" fontWeight="bold">?</text>
        <text x="30" y="68" fontSize="7" fill={p.placeholder} textAnchor="middle" fontFamily="Arial">2M</text>
      </svg>
    );
  },
  blank: ({ color = 'white', width = 30, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    return (
      <svg width={width} height={height} viewBox="0 0 30 80">
        <rect x="0" y="0" width="30" height="80" fill={p.bg}/>
      </svg>
    );
  },
};

// Map module ID to graphic types
export const getGraphicTypeFromId = (moduleId, moduleSize = 1) => {
  if (!moduleId) return moduleSize === 2 ? 'generic2m' : 'generic1m';
  const idLower = moduleId.toLowerCase();
  if (idLower.includes('schuko')) return 'schuko';
  if (idLower.includes('italian')) return 'italian';
  if (idLower.includes('switch_cross') || idLower.includes('cross')) return 'switch_cross';
  if (idLower.includes('switch_stair') || idLower.includes('stair')) return 'switch_stair';
  if (idLower.includes('switch')) return 'switch';
  if (idLower.includes('dimmer')) return 'dimmer';
  if (idLower.includes('usb')) return 'usb';
  if (idLower.includes('coax') || idLower.includes('tv')) return 'coax';
  if (idLower.includes('utp') || idLower.includes('rj45') || idLower.includes('ethernet') || idLower.includes('network')) return 'utp';
  if (idLower.includes('blank')) return 'blank';
  // Return generic placeholder based on size for unknown modules
  return moduleSize === 2 ? 'generic2m' : 'generic1m';
};

// Graficile predefinite dintre care adminul alege la definirea unui modul
export const GRAPHIC_TYPES = [
  { id: 'schuko', nameEn: 'Schuko outlet', nameRo: 'Priză Schuko', size: 2 },
  { id: 'italian', nameEn: 'Italian / bivalent outlet', nameRo: 'Priză bivalentă', size: 1 },
  { id: 'usb', nameEn: 'USB outlet', nameRo: 'Priză USB', size: 1 },
  { id: 'coax', nameEn: 'TV coaxial', nameRo: 'TV coaxial', size: 1 },
  { id: 'utp', nameEn: 'RJ45 / data', nameRo: 'RJ45 / date', size: 1 },
  { id: 'switch', nameEn: 'Simple switch', nameRo: 'Întrerupător simplu', size: 1 },
  { id: 'switch_stair', nameEn: 'Stair switch', nameRo: 'Cap scară', size: 1 },
  { id: 'switch_cross', nameEn: 'Cross switch', nameRo: 'Cap cruce', size: 1 },
  { id: 'dimmer', nameEn: 'Dimmer', nameRo: 'Variator', size: 2 },
  { id: 'blank', nameEn: 'Blank', nameRo: 'Obturator', size: 1 },
  { id: 'generic1m', nameEn: 'Generic 1M', nameRo: 'Generic 1M', size: 1 },
  { id: 'generic2m', nameEn: 'Generic 2M', nameRo: 'Generic 2M', size: 2 },
];

// Tipul de grafică al unui modul din catalog: cel ales explicit (module.graphic),
// altfel dedus din id
export const getModuleGraphicType = (module) => {
  if (module?.graphic && ModuleGraphicsByType[module.graphic]) return module.graphic;
  return getGraphicTypeFromId(module?.id, module?.size || 1);
};

// Componenta de grafică; acceptă un modul din catalog sau (id, dimensiune)
export const getModuleGraphic = (moduleOrId, moduleSize = 1) => {
  const type = (moduleOrId && typeof moduleOrId === 'object')
    ? getModuleGraphicType(moduleOrId)
    : getGraphicTypeFromId(moduleOrId, moduleSize);
  return ModuleGraphicsByType[type] || ModuleGraphicsByType.generic1m;
};
