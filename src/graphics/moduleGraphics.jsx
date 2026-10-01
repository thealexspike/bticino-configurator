import React from 'react';
import { svgPalette, resolveColorHex } from './colors';

// Graficile modulelor sunt independente de dimensiunea tastei.
//
// Fiecare simbol e desenat o singură dată, în coordonatele lui naturale
// (lățime `natW`, înălțime 80). La randare, fundalul umple toată tasta
// (1M, 2M sau oricât), iar simbolul se centrează pe ea; dacă tasta e mai
// îngustă decât simbolul, simbolul se micșorează proporțional ca să încapă.
// Astfel orice grafică merge pe orice dimensiune de modul.

const makeGraphic = (natW, draw) => {
  const Graphic = ({ color = 'white', width = natW, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    const W = height > 0 ? (80 * width) / height : natW; // lățimea tastei, în unități de desen
    const s = Math.min(1, W / natW);
    const tx = (W - natW * s) / 2;
    const ty = 40 * (1 - s);
    return (
      <svg width={width} height={height} viewBox={`0 0 ${W} 80`}>
        <rect x="0" y="0" width={W} height="80" fill={p.bg}/>
        <g transform={`translate(${tx} ${ty}) scale(${s})`}>
          {draw(p)}
        </g>
      </svg>
    );
  };
  return Graphic;
};

const genericDraw = (p) => (
  <>
    <circle cx="15" cy="38" r="12" fill="none" stroke={p.placeholder} strokeWidth="2" strokeDasharray="4 2"/>
    <text x="15" y="44" fontSize="14" fill={p.placeholder} textAnchor="middle" fontFamily="Arial" fontWeight="bold">?</text>
  </>
);

export const ModuleGraphicsByType = {
  schuko: makeGraphic(60, (p) => (
    <>
      <circle cx="30" cy="40" r="24" fill={p.accent}/>
      <rect x="8" y="32" width="4" height="16" rx="1" fill={p.ground}/>
      <rect x="48" y="32" width="4" height="16" rx="1" fill={p.ground}/>
      <circle cx="20" cy="40" r="5" fill={p.holes}/>
      <circle cx="40" cy="40" r="5" fill={p.holes}/>
    </>
  )),
  italian: makeGraphic(30, (p) => (
    <>
      <ellipse cx="15" cy="40" rx="10" ry="22" fill={p.accent}/>
      <circle cx="15" cy="28" r="3" fill={p.holes}/>
      <circle cx="15" cy="40" r="3" fill={p.holes}/>
      <circle cx="15" cy="52" r="3" fill={p.holes}/>
    </>
  )),
  switch: makeGraphic(30, (p) => (
    <>
      <path d="M10 40 L20 40 M15 35 L15 45" stroke={p.symbol} strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="15" cy="70" r="3" fill="#4ade80"/>
    </>
  )),
  switch_stair: makeGraphic(30, (p) => (
    <>
      <path d="M9 38 L15 30 L21 38" stroke={p.symbol} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M9 46 L15 54 L21 46" stroke={p.symbol} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="15" cy="70" r="3" fill="#fbbf24"/>
    </>
  )),
  switch_cross: makeGraphic(30, (p) => (
    <>
      <path d="M9 32 L21 52 M21 32 L9 52" stroke={p.symbol} strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="15" cy="70" r="3" fill="#f97316"/>
    </>
  )),
  dimmer: makeGraphic(60, (p) => (
    <>
      <line x1="30" y1="5" x2="30" y2="75" stroke={p.divider} strokeWidth="1"/>
      <path d="M10 40 L20 40 M15 35 L15 45" stroke={p.symbol} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M40 40 L50 40" stroke={p.symbol} strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="15" cy="70" r="3" fill="#4ade80"/>
      <circle cx="45" cy="70" r="3" fill="#4ade80"/>
    </>
  )),
  usb: makeGraphic(30, (p) => (
    <>
      <rect x="7" y="18" width="16" height="10" rx="1" fill={p.port}/>
      <rect x="9" y="20" width="12" height="6" rx="0.5" fill={p.portInner}/>
      <rect x="7" y="38" width="16" height="10" rx="1" fill={p.port}/>
      <rect x="9" y="40" width="12" height="6" rx="0.5" fill={p.portInner}/>
      <text x="15" y="68" fontSize="8" fill={p.symbol} textAnchor="middle" fontFamily="Arial" fontWeight="bold">USB</text>
    </>
  )),
  coax: makeGraphic(30, (p) => (
    <>
      <circle cx="15" cy="38" r="10" fill={p.connector}/>
      <circle cx="15" cy="38" r="6" fill={p.bg}/>
      <circle cx="15" cy="38" r="2.5" fill={p.holes}/>
      <text x="15" y="68" fontSize="7" fill={p.symbol} textAnchor="middle" fontFamily="Arial" fontWeight="bold">TV</text>
    </>
  )),
  utp: makeGraphic(30, (p) => (
    <>
      <rect x="6" y="28" width="18" height="22" rx="1" fill={p.port}/>
      <rect x="8" y="32" width="14" height="14" rx="0.5" fill={p.bg}/>
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <rect key={i} x={9 + i * 1.5} y="33" width="1" height="8" fill={p.contacts}/>
      ))}
      <rect x="12" y="46" width="6" height="3" fill={p.bg}/>
      <text x="15" y="68" fontSize="7" fill={p.symbol} textAnchor="middle" fontFamily="Arial" fontWeight="bold">UTP</text>
    </>
  )),
  generic: makeGraphic(30, genericDraw),
  blank: makeGraphic(30, () => null),
};

// Valori vechi, păstrate pentru modulele salvate înainte de unificare
ModuleGraphicsByType.generic1m = ModuleGraphicsByType.generic;
ModuleGraphicsByType.generic2m = ModuleGraphicsByType.generic;

// Grafica dedusă din id-ul modulului, când nu e aleasă explicit
export const getGraphicTypeFromId = (moduleId) => {
  if (!moduleId) return 'generic';
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
  return 'generic';
};

// Graficile predefinite dintre care adminul alege la definirea unui modul.
// Oricare se poate folosi pe orice dimensiune de modul.
export const GRAPHIC_TYPES = [
  { id: 'schuko', nameEn: 'Schuko outlet', nameRo: 'Priză Schuko' },
  { id: 'italian', nameEn: 'Italian / bivalent outlet', nameRo: 'Priză bivalentă' },
  { id: 'usb', nameEn: 'USB outlet', nameRo: 'Priză USB' },
  { id: 'coax', nameEn: 'TV coaxial', nameRo: 'TV coaxial' },
  { id: 'utp', nameEn: 'RJ45 / data', nameRo: 'RJ45 / date' },
  { id: 'switch', nameEn: 'Simple switch', nameRo: 'Întrerupător simplu' },
  { id: 'switch_stair', nameEn: 'Stair switch', nameRo: 'Cap scară' },
  { id: 'switch_cross', nameEn: 'Cross switch', nameRo: 'Cap cruce' },
  { id: 'dimmer', nameEn: 'Dimmer', nameRo: 'Variator' },
  { id: 'blank', nameEn: 'Blank', nameRo: 'Obturator' },
  { id: 'generic', nameEn: 'Generic', nameRo: 'Generic' },
];

// Tipul de grafică al unui modul din catalog: cel ales explicit (module.graphic),
// altfel dedus din id
export const getModuleGraphicType = (module) => {
  if (module?.graphic && ModuleGraphicsByType[module.graphic]) return module.graphic;
  return getGraphicTypeFromId(module?.id);
};

// Componenta de grafică; acceptă un modul din catalog sau un id
export const getModuleGraphic = (moduleOrId) => {
  const type = (moduleOrId && typeof moduleOrId === 'object')
    ? getModuleGraphicType(moduleOrId)
    : getGraphicTypeFromId(moduleOrId);
  return ModuleGraphicsByType[type] || ModuleGraphicsByType.generic;
};
