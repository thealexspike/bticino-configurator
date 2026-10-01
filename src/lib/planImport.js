// Transformă fișierele încărcate (JPEG, PNG, PDF) în imagini de plan gata de salvat.
// Totul se face în browser: imaginea se redimensionează la max MAX_SIDE px pe latura
// lungă și se comprimă JPEG până intră sub limita serverului (MAX_BASE64).
// Fiecare pagină dintr-un PDF devine un plan separat (ex. un etaj pe pagină).

const MAX_SIDE = 3000;
const MAX_BASE64 = 1_850_000; // sub limita serverului (1.9 MB), cu marjă
const MAX_PDF_PAGES = 20;
const QUALITIES = [0.85, 0.75, 0.65, 0.55];

const baseName = (fileName) => String(fileName || 'Plan').replace(/\.[^.]+$/, '');

function canvasFor(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; // fundal alb pentru PNG-uri transparente și PDF
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return { canvas, ctx };
}

// Comprimă canvas-ul la JPEG; scade calitatea, apoi rezoluția, până încape
function encode(sourceCanvas) {
  let canvas = sourceCanvas;
  for (let attempt = 0; attempt < 6; attempt++) {
    for (const q of QUALITIES) {
      const dataUrl = canvas.toDataURL('image/jpeg', q);
      const data = dataUrl.slice(dataUrl.indexOf(',') + 1);
      if (data.length <= MAX_BASE64) {
        return { width: canvas.width, height: canvas.height, mime: 'image/jpeg', data };
      }
    }
    const { canvas: smaller, ctx } = canvasFor(canvas.width * 0.8, canvas.height * 0.8);
    ctx.drawImage(canvas, 0, 0, smaller.width, smaller.height);
    canvas = smaller;
  }
  throw new Error('Imaginea planului este prea mare, chiar și comprimată.');
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Nu pot citi imaginea ${file.name}`)); };
    img.src = url;
  });
}

async function imageToPlan(file) {
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const { canvas, ctx } = canvasFor(img.naturalWidth * scale, img.naturalHeight * scale);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return [{ name: baseName(file.name), ...encode(canvas) }];
}

async function pdfToPlans(file, onProgress) {
  // pdf.js se încarcă doar când e nevoie, ca să nu îngreuneze aplicația
  const pdfjs = await import('pdfjs-dist');
  const { default: workerUrl } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pageCount = Math.min(pdf.numPages, MAX_PDF_PAGES);
  const plans = [];
  for (let n = 1; n <= pageCount; n++) {
    onProgress?.(`${file.name}: pagina ${n} din ${pageCount}`);
    const page = await pdf.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const scale = MAX_SIDE / Math.max(base.width, base.height);
    const viewport = page.getViewport({ scale });
    const { canvas, ctx } = canvasFor(viewport.width, viewport.height);
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const name = pdf.numPages > 1 ? `${baseName(file.name)} - pag. ${n}` : baseName(file.name);
    plans.push({ name, ...encode(canvas) });
    page.cleanup();
  }
  await pdf.destroy();
  return plans;
}

export const PLAN_FILE_ACCEPT = 'image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf';

// Lista de planuri rezultate din fișierele alese (în ordinea fișierelor și a paginilor)
export async function filesToPlans(files, onProgress) {
  const out = [];
  for (const file of Array.from(files || [])) {
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    const isImage = /^image\/(jpeg|png)$/.test(file.type) || /\.(jpe?g|png)$/i.test(file.name);
    if (isPdf) {
      out.push(...await pdfToPlans(file, onProgress));
    } else if (isImage) {
      onProgress?.(file.name);
      out.push(...await imageToPlan(file));
    } else {
      throw new Error(`Format neacceptat: ${file.name}. Folosește JPEG, PNG sau PDF.`);
    }
  }
  return out;
}
