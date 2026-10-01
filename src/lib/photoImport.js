// Pregătește pozele de șantier înainte de încărcare: pozele de telefon (4-12 MB)
// se micșorează la max PHOTO_SIDE px și se comprimă JPEG; se face și o miniatură
// pentru liste și pentru hover pe plan. Orientarea din EXIF e respectată de browser.
import { canvasFor, loadImage, encodeJpeg } from './planImport';

const PHOTO_SIDE = 2560;
const THUMB_SIDE = 480;
const PHOTO_MAX_BYTES = 6 * 1024 * 1024;
const THUMB_MAX_BYTES = 400 * 1024;

export const PHOTO_ACCEPT = 'image/jpeg,image/png,image/heic,image/heif,image/webp,.jpg,.jpeg,.png,.heic,.webp';

function drawScaled(img, maxSide) {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const scale = Math.min(1, maxSide / Math.max(w, h));
  const { canvas, ctx } = canvasFor(w * scale, h * scale);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export async function preparePhoto(file) {
  let img;
  try {
    img = await loadImage(file);
  } catch {
    throw new Error(`Nu pot citi poza ${file.name}. Folosește JPEG sau PNG.`);
  }
  const full = await encodeJpeg(drawScaled(img, PHOTO_SIDE), PHOTO_MAX_BYTES, [0.82, 0.72, 0.62]);
  const thumb = await encodeJpeg(drawScaled(img, THUMB_SIDE), THUMB_MAX_BYTES, [0.75, 0.6]);
  return { file: full.blob, thumb: thumb.blob, width: full.width, height: full.height };
}
