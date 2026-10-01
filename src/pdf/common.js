// Utilitare comune pentru generarea PDF-urilor (jsPDF)

// Function to remove diacritics
export const removeDiacritics = (str) => {
  if (!str) return str;
  return str
    .replace(/[ăÄƒ]/g, 'a').replace(/[ĂÄ‚]/g, 'A')
    .replace(/[âÃ¢]/g, 'a').replace(/[ÂÃ‚]/g, 'A')
    .replace(/[îÃ®]/g, 'i').replace(/[ÎÃŽ]/g, 'I')
    .replace(/[șşÈ™]/g, 's').replace(/[ȘŞÈ˜]/g, 'S')
    .replace(/[țţÈ›]/g, 't').replace(/[ȚŢÈš]/g, 'T');
};

// Convert SVG to image data URL
export const svgToImage = (svgString, width, height) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = width * 2; // 2x for better quality
    canvas.height = height * 2;
    ctx.scale(2, 2);
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => {
      resolve(null);
    };
    
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    img.src = URL.createObjectURL(svgBlob);
  });
};
