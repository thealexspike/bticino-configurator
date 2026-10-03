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

// Așezarea fizică a modulelor în ramă. Ordinea din listă dă prioritatea.
//   Sisteme modulare: unul după altul.
//   Sisteme cu posturi (completare pe posturi):
//     - un modul de jumătate de post (1M) ocupă primul loc liber dintr-un post, inclusiv
//       jumătatea rămasă liberă dintr-un post început mai devreme;
//     - un modul de un post întreg ocupă primul post complet liber.
// Rezultat, în ordinea fizică din ramă:
//   [{ ...modul, index (în listă), startPos, size, gapBefore, catalogItem }], pozițiile în module.
export function layoutModules(modules, library) {
  const catalog = library?.modules || [];
  const step = isPostSystem(library) ? postSizeM(library) : 0;
  const taken = [];
  const free = (p, size) => { for (let i = p; i < p + size; i++) if (taken[i]) return false; return true; };

  let seq = 0;
  const placed = (modules || []).map((m, index) => {
    const catalogItem = catalog.find(c => c.id === m.moduleId);
    const size = catalogItem?.size || 1;
    let pos;
    if (!step) {
      pos = seq;
      seq += size;
    } else if (size >= step) {
      pos = 0;
      while (!free(pos, size)) pos += step; // doar la început de post
    } else {
      pos = 0;
      while (!(free(pos, size) && (pos % step) + size <= step)) pos += 1; // fără să treacă de granița postului
    }
    for (let i = pos; i < pos + size; i++) taken[i] = true;
    return { ...m, index, startPos: pos, size, catalogItem };
  });

  placed.sort((x, y) => x.startPos - y.startPos);
  let end = 0;
  return placed.map(slot => {
    const out = { ...slot, gapBefore: Math.max(0, slot.startPos - end) };
    end = slot.startPos + slot.size;
    return out;
  });
}

// Lista de module în ordinea fizică din ramă (pentru salvare după o adăugare)
export const packModules = (modules, library) =>
  layoutModules(modules, library).map(({ index }) => modules[index]);

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
