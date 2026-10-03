// Reguli de montaj comune pentru necesar, ofertă, profit, editor și listă.
// Sistemele modulare: o doză, un suport și o ramă de N module pe aparat.
// Sistemele cu posturi (library.mounting === 'posts'): 1 post = postSize module;
// doze individuale (N × 1 post) sau multi-post (1 × N posturi); suportul poate veni
// la pachet cu rama decor.

export const isPostSystem = (library) => library?.mounting === 'posts';
export const postSizeM = (library) => library?.postSize || 2;
export const postsOf = (size, library) => Math.max(1, Math.round((Number(size) || 0) / postSizeM(library)));
export const hasSeparateSupports = (library) => !library?.supportIncludedInFrame;

const postWord = (n, lang) => (lang === 'ro' ? (n === 1 ? 'post' : 'posturi') : (n === 1 ? 'post' : 'posts'));

// „4M" la sistemele modulare, „2 posturi" la cele cu posturi
export function sizeLabel(size, library, lang = 'ro') {
  if (!isPostSystem(library)) return `${size}M`;
  const n = postsOf(size, library);
  return `${n} ${postWord(n, lang)}`;
}

// „3/4M" sau „1/2 posturi"
export function capacityLabel(used, size, library, lang = 'ro') {
  if (!isPostSystem(library)) return `${used}/${size}M`;
  const p = postSizeM(library);
  const u = Math.round((used / p) * 10) / 10;
  const n = postsOf(size, library);
  return `${u}/${n} ${postWord(n, lang)}`;
}

// Spațiul liber, în aceeași unitate
export function freeLabel(free, library, lang = 'ro') {
  if (!isPostSystem(library)) return `${free}M`;
  const n = Math.round((free / postSizeM(library)) * 10) / 10;
  return `${n} ${postWord(n, lang)}`;
}

// Mărimea unui modul rămâne în module, ca la modulare: 1M = jumătate de post, 2M = un post
export const moduleSizeLabel = (moduleSize) => `${moduleSize}M`;

// 'single' | 'multi' — ales pe aparat, altfel implicitul sistemului pentru tipul de doză
export function wallBoxMode(assembly, library) {
  if (assembly?.wallBoxMode === 'single' || assembly?.wallBoxMode === 'multi') return assembly.wallBoxMode;
  return library?.defaultWallBoxMode?.[assembly?.wallBoxType || 'masonry'] || 'single';
}

const hasEntry = (entry) => !!entry && (!!entry.sku || Number(entry.price) > 0 || Number(entry.purchasePrice) > 0);

// Dozele unui aparat: [{ size, qty, label, fallback }]
//   size  - cheia din tabelul de doze (în module)
//   fallback - s-a cerut multi-post, dar doza de N posturi nu e definită
export function wallBoxLines(assembly, library, lang = 'ro') {
  const size = Number(assembly.size) || 2;
  if (!isPostSystem(library)) return [{ size, qty: 1, label: sizeLabel(size, library, lang), fallback: false }];

  const posts = postsOf(size, library);
  const one = postSizeM(library);
  const table = (assembly.wallBoxType || 'masonry') === 'drywall' ? library.wallBoxesDrywall : library.wallBoxesMasonry;
  const mode = wallBoxMode(assembly, library);

  if (mode === 'multi' && posts > 1) {
    if (hasEntry(table?.[size])) return [{ size, qty: 1, label: sizeLabel(size, library, lang), fallback: false }];
    return [{ size: one, qty: posts, label: sizeLabel(one, library, lang), fallback: true }];
  }
  return [{ size: one, qty: posts, label: sizeLabel(one, library, lang), fallback: false }];
}

// Așezarea fizică a modulelor în ramă.
//   Sisteme modulare: unul după altul, în ordinea din listă.
//   Sisteme cu posturi:
//     1. modulele cu poziție fixată (m.pos, în module) stau unde au fost puse, dacă locul e valid;
//     2. restul se așază automat, în ordinea din listă:
//        - un modul de jumătate de post (1M) în primul loc liber dintr-un post,
//          inclusiv jumătatea rămasă liberă dintr-un post început;
//        - un modul de un post întreg în primul post complet liber.
// Rezultat, în ordinea fizică din ramă:
//   [{ ...modul, index (în listă), startPos, size, gapBefore, catalogItem }], pozițiile în module.
export function layoutModules(modules, library) {
  const catalog = library?.modules || [];
  const step = isPostSystem(library) ? postSizeM(library) : 0;
  const list = modules || [];
  const sizeOf = (m) => catalog.find(c => c.id === m.moduleId)?.size || 1;
  const taken = [];
  const free = (p, size) => { for (let i = p; i < p + size; i++) if (taken[i]) return false; return true; };
  const take = (p, size) => { for (let i = p; i < p + size; i++) taken[i] = true; };
  const fitsPost = (p, size) => (size >= step ? p % step === 0 : (p % step) + size <= step);

  const placed = new Array(list.length);
  if (!step) {
    let seq = 0;
    list.forEach((m, index) => { const size = sizeOf(m); placed[index] = { pos: seq, size }; seq += size; });
  } else {
    list.forEach((m, index) => {
      const size = sizeOf(m);
      if (Number.isInteger(m.pos) && m.pos >= 0 && fitsPost(m.pos, size) && free(m.pos, size)) {
        take(m.pos, size);
        placed[index] = { pos: m.pos, size };
      }
    });
    list.forEach((m, index) => {
      if (placed[index]) return;
      const size = sizeOf(m);
      let pos = 0;
      if (size >= step) { while (!free(pos, size)) pos += step; } // doar la început de post
      else { while (!(free(pos, size) && fitsPost(pos, size))) pos += 1; }
      take(pos, size);
      placed[index] = { pos, size };
    });
  }

  const slots = list.map((m, index) => ({
    ...m, index, startPos: placed[index].pos, size: placed[index].size,
    catalogItem: catalog.find(c => c.id === m.moduleId),
  }));
  slots.sort((x, y) => x.startPos - y.startPos);
  let end = 0;
  return slots.map(slot => {
    const out = { ...slot, gapBefore: Math.max(0, slot.startPos - end) };
    end = slot.startPos + slot.size;
    return out;
  });
}

// Lista de module în ordinea fizică. La sistemele cu posturi fiecare modul primește poziția
// curentă (pos), ca o adăugare sau o mutare ulterioară să nu le rearanjeze pe celelalte.
export function packModules(modules, library) {
  const slots = layoutModules(modules, library);
  if (!isPostSystem(library)) return slots.map(({ index }) => modules[index]);
  return slots.map(({ index, startPos }) => ({ ...modules[index], pos: startPos }));
}

// Mută un modul existent (index) sau pune unul nou (newModule) la poziția targetPos (în module),
// pe un sistem cu posturi. Un modul de post întreg se aliniază la începutul postului.
// Locul liber: modulul se mută acolo. Locul ocupat de module care încap în fereastra țintă
// (ex. alt post întreg sau două jumătăți): schimb de locuri cu poziția de unde a plecat modulul.
// Altfel null (mutare imposibilă). Rezultat: lista în ordinea fizică, cu pozițiile fixate.
export function placeModuleAt(modules, library, frameSize, { index = null, newModule = null, targetPos }) {
  const step = postSizeM(library);
  const catalog = library?.modules || [];
  const slots = layoutModules(modules, library);
  const moving = index !== null ? slots.find(s => s.index === index) : null;
  const size = moving ? moving.size : (catalog.find(c => c.id === newModule?.moduleId)?.size || 1);
  const pos = size >= step ? Math.floor(targetPos / step) * step : targetPos;
  if (pos < 0 || pos + size > frameSize) return null;

  const overlaps = (a, as, b, bs) => a < b + bs && b < a + as;
  const hits = slots.filter(s => (!moving || s.index !== moving.index) && overlaps(s.startPos, s.size, pos, size));
  const posByIndex = new Map(slots.map(s => [s.index, s.startPos]));
  if (hits.length > 0) {
    const inside = hits.every(h => h.startPos >= pos && h.startPos + h.size <= pos + size);
    if (!moving || !inside) return null;
    for (const h of hits) posByIndex.set(h.index, moving.startPos + (h.startPos - pos));
  }

  const result = modules.map((m, i) => ({ ...m, pos: posByIndex.get(i) }));
  if (moving) result[moving.index] = { ...result[moving.index], pos };
  else result.push({ ...newModule, pos });
  return result.sort((x, y) => x.pos - y.pos);
}

// Cât ocupă efectiv modulele (fără golurile dintre ele)
export function occupiedSizeOf(modules, library) {
  return layoutModules(modules, library).reduce((sum, s) => sum + s.size, 0);
}

// Cât ocupă modulele în ramă, cu tot cu golurile de aliniere
export function usedSizeOf(modules, library) {
  const slots = layoutModules(modules, library);
  const last = slots[slots.length - 1];
  return last ? last.startPos + last.size : 0;
}

// Încape lista de module în ramă? (la posturi: pe subtotaluri de post, nu pe sumă)
export const fitsInFrame = (modules, frameSize, library) => usedSizeOf(modules, library) <= frameSize;

// Posturile cu module de jumătate (1M) → câte suporturi pentru module 1/2.
// straddling rămâne pentru compatibilitate; cu alinierea automată nu mai apare.
export function postLayout(modules, library) {
  if (!isPostSystem(library)) return { halfPosts: 0, straddling: false };
  const step = postSizeM(library);
  const half = new Set();
  for (const slot of layoutModules(modules, library)) {
    if (slot.size < step) half.add(Math.floor(slot.startPos / step));
  }
  return { halfPosts: half.size, straddling: false };
}

export const halfPostSupportOf = (library) => library?.halfPostSupport || null;
