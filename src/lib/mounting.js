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

// Mărimea unui modul: „2M" sau „1 post"
export const moduleSizeLabel = (moduleSize, library, lang = 'ro') => sizeLabel(moduleSize, library, lang);

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
