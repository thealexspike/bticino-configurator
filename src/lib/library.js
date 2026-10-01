import React from 'react';
import { FRAME_SIZES, COLORS, SYSTEMS } from '../data/libraries';

// Helpers for dynamic colors/sizes from library
export const getAvailableColors = (library) => library?.availableColors || COLORS;

export const getAvailableSizes = (library) => library?.availableSizes || FRAME_SIZES;

export const getSystemName = (systemId, lang) => {
  const sys = SYSTEMS.find(s => s.id === systemId);
  if (!sys) return systemId || 'BTicino Living Now';
  return lang === 'ro' ? sys.nameRo : sys.nameEn;
};

// Build an object with a key for each color, optionally from a template
export const buildColorObj = (colors, defaultVal = '', template = null) => {
  const obj = {};
  colors.forEach(c => { obj[c.id] = template ? (template[c.id] ?? defaultVal) : defaultVal; });
  return obj;
};

// Check if a color is dark based on hex luminance
export const isDarkColor = (colorId, library) => {
  const colorObj = (library?.availableColors || []).find(c => c.id === colorId);
  if (!colorObj?.hex) return colorId === 'black'; // fallback
  const hex = colorObj.hex;
  const r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
  return (0.299*r + 0.587*g + 0.114*b) < 0.5;
};

export const getColorName = (colorId, library, lang) => {
  const colors = getAvailableColors(library);
  const c = colors.find(col => col.id === colorId);
  if (!c) return colorId;
  return lang === 'ro' ? (c.nameRo || c.nameEn || c.name || colorId) : (c.nameEn || c.name || colorId);
};

// Library storage functions
export const LIBRARY_KEY = 'configurator-aparataj-library';

export const saveLibrary = (library) => {
  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
  } catch (e) {
    console.error('Failed to save library:', e);
  }
};

// Create a context for library data
export const LibraryContext = React.createContext(null);

export const getWallBoxSku = (size, wallBoxType, library) => {
  if (wallBoxType === 'drywall') {
    return library?.wallBoxesDrywall?.[size]?.sku || '';
  }
  return library?.wallBoxesMasonry?.[size]?.sku || '';
};

export const getInstallFaceSku = (size, library) => library?.installFaces?.[size]?.sku || '';

export const getDecorFaceSku = (size, color, library) => library?.decorFaces?.[`${size}-${color}`]?.sku || '';

// Module lookup by ID (id is the stable identifier, moduleSku varies by color)
export const getModuleById = (moduleId, library) => {
  return library?.modules?.find(m => m.id === moduleId);
};

// Get module SKU for specific color
export const getModuleSku = (moduleId, color, library) => {
  const mod = getModuleById(moduleId, library);
  if (!mod) return '';
  if (typeof mod.moduleSku === 'string') return mod.moduleSku;
  if (typeof mod.moduleSku === 'object') return mod.moduleSku?.[color] || Object.values(mod.moduleSku)[0] || '';
  return '';
};

// Get module face SKU
export const getModuleFaceSku = (moduleId, color, library) => {
  const mod = getModuleById(moduleId, library);
  if (!mod) return '';
  if (typeof mod.faceSku === 'string') return mod.faceSku;
  if (typeof mod.faceSku === 'object') return mod.faceSku?.[color] || Object.values(mod.faceSku)[0] || '';
  return '';
};

// Price lookup functions
export const getWallBoxPrice = (size, wallBoxType, library) => {
  if (wallBoxType === 'drywall') {
    return library?.wallBoxesDrywall?.[size]?.price || 0;
  }
  return library?.wallBoxesMasonry?.[size]?.price || 0;
};

export const getInstallFacePrice = (size, library) => library?.installFaces?.[size]?.price || 0;

export const getDecorFacePrice = (size, color, library) => library?.decorFaces?.[`${size}-${color}`]?.price || 0;

// Get module price for specific color
export const getModulePrice = (moduleId, color, library) => {
  const mod = getModuleById(moduleId, library);
  if (!mod) return 0;
  if (typeof mod.modulePrice === 'number') return mod.modulePrice;
  if (typeof mod.modulePrice === 'object') return mod.modulePrice?.[color] || Object.values(mod.modulePrice)[0] || 0;
  return 0;
};

// Get module face price
export const getModuleFacePrice = (moduleId, color, library) => {
  const mod = getModuleById(moduleId, library);
  if (!mod) return 0;
  if (typeof mod.facePrice === 'number') return mod.facePrice;
  if (typeof mod.facePrice === 'object') return mod.facePrice?.[color] || Object.values(mod.facePrice)[0] || 0;
  return 0;
};

// Helper to get translated module name based on language
// Now uses nameEn/nameRo fields stored in module
export const getModuleName = (mod, lang) => {
  if (!mod) return '';
  if (lang === 'ro') {
    return mod.nameRo || mod.nameEn || '';
  }
  return mod.nameEn || '';
};

// Helper to get MODULE_CATALOG from library
export const getModuleCatalog = (library) => library?.modules || [];
