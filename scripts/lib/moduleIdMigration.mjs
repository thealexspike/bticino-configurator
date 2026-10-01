// Normalizarea id-urilor de module între sisteme.
//
// Regula: același produs are același id în toate librăriile, ca un proiect să
// poată fi mutat de pe un sistem pe altul fără remapare. Întrerupător simplu
// (switch_simple = 1M, switch_simple_2m), cap scară și cap cruce există pe 1M și 2M;
// coax și rj45 există peste tot.
//
// Pentru un modul nou comun tuturor sistemelor: adaugă-l în SPECS, apoi rulează
// scripts/sync-default-libraries.mjs (cod) și scripts/migrate-module-ids.mjs (D1).

export const FIXED_RENAMES = {
  two_way_gewiss: 'switch_stair_1m',
  three_way: 'switch_cross_1m',
};

const SPECS = {
  switch_simple_2m: { nameEn: 'Simple Switch 2M', nameRo: 'Întrerupător Simplu 2M', size: 2, category: 'switch', standardType: 'switch_simple', graphic: 'switch' },
  switch_stair_1m: { nameEn: 'Stair Switch 1M', nameRo: 'Întrerupător Cap Scară 1M', size: 1, category: 'switch', standardType: 'switch_stair', graphic: 'switch_stair' },
  switch_stair_2m: { nameEn: 'Stair Switch 2M', nameRo: 'Întrerupător Cap Scară 2M', size: 2, category: 'switch', standardType: 'switch_stair', graphic: 'switch_stair' },
  switch_cross_1m: { nameEn: 'Cross Switch 1M', nameRo: 'Întrerupător Cap Cruce 1M', size: 1, category: 'switch', standardType: 'switch_cross', graphic: 'switch_cross' },
  switch_cross_2m: { nameEn: 'Cross Switch 2M', nameRo: 'Întrerupător Cap Cruce 2M', size: 2, category: 'switch', standardType: 'switch_cross', graphic: 'switch_cross' },
  coax: { nameEn: 'TV Coaxial Outlet', nameRo: 'Priză TV Coaxial', size: 1, category: 'outlet', standardType: 'coax', graphic: 'coax' },
  rj45: { nameEn: 'RJ45 Data Outlet', nameRo: 'Priză Date RJ45', size: 1, category: 'outlet', standardType: 'rj45', graphic: 'utp' },
};

export const REQUIRED_MODULES = Object.keys(SPECS);

// Ordinea de afișare pentru id-urile cunoscute; restul rămân după, în ordinea lor
const ORDER = ['schuko', 'italian', 'usb', 'coax', 'rj45', 'switch_simple', 'switch_simple_2m',
  'switch_stair_1m', 'switch_stair_2m', 'switch_cross_1m', 'switch_cross_2m', 'dimmer', 'blank'];

// Harta de redenumire specifică unei librării (depinde de dimensiunea pe care o are
// switch_stair / switch_cross în acea librărie)
export function renameMapFor(lib) {
  const map = { ...FIXED_RENAMES };
  for (const m of lib.modules || []) {
    if (m.id === 'switch_stair') map[m.id] = m.size === 2 ? 'switch_stair_2m' : 'switch_stair_1m';
    if (m.id === 'switch_cross') map[m.id] = m.size === 2 ? 'switch_cross_2m' : 'switch_cross_1m';
  }
  return map;
}

const zeroLike = v => (v && typeof v === 'object') ? Object.fromEntries(Object.keys(v).map(k => [k, 0])) : 0;
const emptyLike = v => (v && typeof v === 'object') ? Object.fromEntries(Object.keys(v).map(k => [k, ''])) : '';

// Modul nou, construit după forma unui modul existent din aceeași librărie
// (ca să respecte structura de culori/fețe a sistemului), cu SKU gol și prețuri 0
function makeModule(lib, id) {
  const spec = SPECS[id];
  const mods = lib.modules || [];
  const tpl = mods.find(m => m.category === spec.category && m.size === spec.size)
    || mods.find(m => m.category === spec.category) || mods[0] || {};
  const m = JSON.parse(JSON.stringify(tpl));
  Object.assign(m, { id, standardType: spec.standardType, nameEn: spec.nameEn, nameRo: spec.nameRo,
    size: spec.size, category: spec.category, graphic: spec.graphic });
  for (const k of ['moduleSku', 'faceSku']) if (k in m) m[k] = emptyLike(m[k]);
  for (const k of ['modulePurchasePrice', 'modulePrice', 'facePurchasePrice', 'facePrice']) if (k in m) m[k] = zeroLike(m[k]);
  return m;
}

export function migrateLibrary(input) {
  const lib = JSON.parse(JSON.stringify(input));
  const map = renameMapFor(lib);
  const changes = [];

  lib.modules = (lib.modules || []).map(m => {
    const to = map[m.id];
    if (!to) return m;
    const spec = SPECS[to];
    changes.push(`${m.id} -> ${to}`);
    return { ...m, id: to, standardType: spec.standardType, nameEn: spec.nameEn, nameRo: spec.nameRo,
      size: spec.size, category: spec.category, graphic: m.graphic || spec.graphic };
  });

  // Dacă redenumirea a produs duplicate, rămâne primul
  const seen = new Set();
  lib.modules = lib.modules.filter(m => (seen.has(m.id) ? false : (seen.add(m.id), true)));

  for (const id of REQUIRED_MODULES) {
    if (!lib.modules.some(m => m.id === id)) {
      lib.modules.push(makeModule(lib, id));
      changes.push(`+ ${id}`);
    }
  }

  lib.modules = lib.modules
    .map((m, i) => ({ m, k: ORDER.includes(m.id) ? ORDER.indexOf(m.id) : ORDER.length + i }))
    .sort((a, b) => a.k - b.k)
    .map(x => x.m);

  lib.presets = (lib.presets || []).map(p => ({ ...p, modules: (p.modules || []).map(id => map[id] || id) }));

  return { lib, map, changes };
}

export function migrateAssemblyModules(modules, map) {
  let changed = false;
  const out = (modules || []).map(m => {
    const to = map[m.moduleId];
    if (!to) return m;
    changed = true;
    return { ...m, moduleId: to };
  });
  return { modules: out, changed };
}
