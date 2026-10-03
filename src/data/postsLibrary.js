// Sistem generic cu posturi (tip Livolo, Tosyco): rame de sticlă cu 1-4 posturi,
// fiecare post = un mecanism într-o doză de 2 module. Prețuri estimative.
//
// Diferențe față de sistemele modulare (vezi lib/mounting.js):
//   mounting: 'posts'          mărimea ramei e tot în module (M), 1 post = postSize M
//   supportIncludedInFrame     rama de montaj vine la pachet cu rama decor (fără rând separat)
//   doze                       tabelele de doze sunt pe mărime (2 = 1 post, 4 = 2 posturi...);
//                              pe aparat se alege „individuale" (N doze de 1 post) sau
//                              „multi-post" (1 doză de N posturi), cu valoare implicită pe sistem
//
// Fișier separat de libraries.js: scriptul sync-default-libraries.mjs regenerează doar
// librăriile modulare și nu trebuie să atingă acest sistem.

const VAT = 0.21;
const price = (purchase, markup = 25) => Math.round(purchase * (1 + markup / 100) * (1 + VAT) * 100) / 100;
const item = (purchase, sku = '') => ({ sku, purchasePrice: purchase, markup: 25, price: price(purchase) });

const COLORS = [
  { id: 'white', name: 'White', nameEn: 'White', nameRo: 'Alb', hex: '#FFFFFF' },
  { id: 'black', name: 'Black', nameEn: 'Black', nameRo: 'Negru', hex: '#333333' },
  { id: 'grey', name: 'Grey', nameEn: 'Grey', nameRo: 'Gri', hex: '#8A8D91' },
];

// Rama decor (sticlă) + rama de montaj, pe număr de posturi
const FRAME_PURCHASE = { 2: 35, 4: 55, 6: 75, 8: 95 };

const mechanism = (id, standardType, nameEn, nameRo, category, purchase, graphic) => ({
  id,
  standardType,
  graphic,
  moduleHasColorVariants: false,
  faceHasColorVariants: false,
  moduleSku: '',
  nameEn,
  nameRo,
  size: 2, // ocupă un post întreg
  category,
  faceSku: '',
  modulePurchasePrice: purchase,
  moduleMarkup: 25,
  modulePrice: price(purchase),
  facePurchasePrice: 0,
  faceMarkup: 25,
  facePrice: 0,
});

export const DEFAULT_LIBRARY_GENERIC_POSTS = {
  systemId: 'generic_posts',
  systemName: 'Generic Post System',
  mounting: 'posts',
  postSize: 2,
  supportIncludedInFrame: true,
  hasModuleFaces: false,
  defaultWallBoxMode: { masonry: 'single', drywall: 'multi' },
  availableColors: COLORS,
  availableSizes: [2, 4, 6, 8],
  // Zidărie: doze individuale (ex. Batibox 80141, Dietzel fagure); cele multi-post
  // nu sunt definite, deci „multi-post" cade automat pe doze individuale
  wallBoxesMasonry: {
    2: item(2),
  },
  // Gips-carton: Batibox 80041 / 80042 / 80043 / 80044 (1-4 posturi)
  wallBoxesDrywall: {
    2: item(7),
    4: item(15),
    6: item(22),
    8: item(30),
  },
  installFaces: {},
  decorFaces: Object.fromEntries(
    Object.entries(FRAME_PURCHASE).flatMap(([size, purchase]) =>
      COLORS.map(c => [`${size}-${c.id}`, item(purchase)]))
  ),
  modules: [
    mechanism('schuko', 'schuko', 'Schuko Outlet', 'Priză Schuko', 'outlet', 22, 'schuko'),
    mechanism('usb', 'usb', 'USB Outlet (A+C)', 'Priză USB (A+C)', 'outlet', 60, 'usb'),
    mechanism('coax', 'coax', 'TV Coaxial Outlet', 'Priză TV Coaxial', 'outlet', 25, 'coax'),
    mechanism('rj45', 'rj45', 'RJ45 Data Outlet', 'Priză Date RJ45', 'outlet', 30, 'utp'),
    mechanism('switch_simple_2m', 'switch_simple', 'Simple Switch', 'Întrerupător Simplu', 'switch', 22, 'switch'),
    mechanism('switch_double', 'switch_double', 'Double Switch', 'Întrerupător Dublu', 'switch', 26, 'switch_double'),
    mechanism('switch_stair_2m', 'switch_stair', 'Stair Switch', 'Întrerupător Cap Scară', 'switch', 25, 'switch_stair'),
    mechanism('switch_cross_2m', 'switch_cross', 'Cross Switch', 'Întrerupător Cap Cruce', 'switch', 32, 'switch_cross'),
    mechanism('dimmer', 'dimmer', 'Dimmer', 'Variator (Dimmer)', 'switch', 75, 'dimmer'),
    mechanism('blank', 'blank', 'Blank Cover', 'Obturator', 'other', 8, 'blank'),
  ],
  presets: [],
};

// Proporții reale: ramă 80 mm înaltă, 80 mm lată pe 1 post, +71 mm pe fiecare post în plus.
// Un post = pas de 71 mm (2 × 35.5); fereastra mecanismului (~55 mm) e desenată în interiorul
// pasului, cu slotInset de jur împrejur — așa calculele de poziție rămân cele modulare.
export const POSTS_PROPORTIONS = {
  moduleWidth1M: 35.5,
  moduleHeight: 71,
  sideMargin: 4.5,
  topMargin: 4.5,
  bottomMargin: 4.5,
  cornerRadius: 4,
  hasSupportBars: false,
  supportBarHeight: 0,
  supportBarOffset: 0,
  moduleCornerRadius: 3,
  slotInset: 8,
};
