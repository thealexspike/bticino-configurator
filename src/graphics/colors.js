export const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
};

export const rgbToHex = (r, g, b) => '#' + [r,g,b].map(c => Math.max(0,Math.min(255,Math.round(c))).toString(16).padStart(2,'0')).join('');

export const adjustBrightness = (hex, amount) => {
  const {r,g,b} = hexToRgb(hex);
  return rgbToHex(r + amount, g + amount, b + amount);
};

export const getLuminance = (hex) => {
  const {r,g,b} = hexToRgb(hex);
  return (0.299*r + 0.587*g + 0.114*b) / 255;
};

export const svgPalette = (colorHex = '#f5f5f5') => {
  const lum = getLuminance(colorHex);
  const dark = lum < 0.5;
  return {
    bg: colorHex,
    accent: dark ? adjustBrightness(colorHex, 20) : adjustBrightness(colorHex, -15),
    holes: dark ? adjustBrightness(colorHex, -40) : '#333',
    ground: dark ? adjustBrightness(colorHex, 50) : '#999',
    connector: dark ? adjustBrightness(colorHex, 50) : '#999',
    symbol: dark ? '#ffffff' : '#333333',
    divider: dark ? adjustBrightness(colorHex, 30) : adjustBrightness(colorHex, -20),
    port: dark ? adjustBrightness(colorHex, -40) : '#333',
    portInner: colorHex,
    contacts: dark ? '#888' : '#666',
    placeholder: dark ? adjustBrightness(colorHex, 40) : '#bbb',
    led: null, // LEDs stay fixed color
  };
};

// Resolve color prop: if hex string (#...) use directly, else map via known palette
export const colorIdToHex = { white: '#f5f5f5', black: '#3a3a3a' };

export const resolveColorHex = (color) => {
  if (!color) return '#f5f5f5';
  if (color.startsWith('#')) return color;
  return colorIdToHex[color] || '#f5f5f5';
};
