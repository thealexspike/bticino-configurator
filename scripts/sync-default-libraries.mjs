// Aplică regulile din scripts/lib/moduleIdMigration.mjs pe librăriile default din
// src/data/libraries.js (redenumiri + modulele comune obligatorii) și rescrie fișierul.
//
//   node scripts/sync-default-libraries.mjs
//
// Pentru baza de producție folosește scripts/migrate-module-ids.mjs.

import fs from 'node:fs';
import { migrateLibrary } from './lib/moduleIdMigration.mjs';

const FILE = 'src/data/libraries.js';
let src = fs.readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n');

const start = src.search(/\n(\/\/ [^\n]*\n)?export const DEFAULT_LIBRARY = \{/) + 1;
const end = src.indexOf('export const DEFAULT_LIBRARIES = {');
if (start <= 0 || end < 0) throw new Error('Nu găsesc blocul DEFAULT_LIBRARY* în ' + FILE);

const region = src.slice(start, end);
const sandbox = {};
new Function('out', region.replace(/^export /mg, '') +
  '\nout.libs = { DEFAULT_LIBRARY, DEFAULT_LIBRARY_GEWISS, DEFAULT_LIBRARY_SCHNEIDER, DEFAULT_LIBRARY_GENERIC };')(sandbox);

// Serializare JS lizibilă (chei fără ghilimele, obiecte mici pe un rând)
const isIdent = k => /^[A-Za-z_$][\w$]*$/.test(k) || /^\d+$/.test(k);
const str = v => `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const prim = v => v === null ? 'null' : typeof v === 'string' ? str(v) : String(v);
const isPrim = v => v === null || typeof v !== 'object';
const flat = o => Object.values(o).every(isPrim);
const key = k => (isIdent(k) ? k : str(k));
const oneLine = o => '{ ' + Object.entries(o).map(([k, v]) =>
  `${key(k)}: ${isPrim(v) ? prim(v) : Array.isArray(v) ? '[' + v.map(prim).join(', ') + ']' : oneLine(v)}`).join(', ') + ' }';
const toJs = (v, ind) => {
  const pad = '  '.repeat(ind);
  if (isPrim(v)) return prim(v);
  if (Array.isArray(v)) {
    if (v.every(isPrim)) return '[' + v.map(prim).join(', ') + ']';
    return '[\n' + v.map(x => pad + '  ' + toJs(x, ind + 1)).join(',\n') + ',\n' + pad + ']';
  }
  const small = Object.values(v).every(x => isPrim(x) || (Array.isArray(x) && x.every(isPrim))
    || (x && typeof x === 'object' && !Array.isArray(x) && flat(x)));
  if (small) { const l = oneLine(v); if (l.length <= 160) return l; }
  return '{\n' + Object.entries(v).map(([k, x]) => `${pad}  ${key(k)}: ${toJs(x, ind + 1)}`).join(',\n') + ',\n' + pad + '}';
};

const labels = { DEFAULT_LIBRARY: 'BTicino', DEFAULT_LIBRARY_GEWISS: 'Gewiss', DEFAULT_LIBRARY_SCHNEIDER: 'Schneider', DEFAULT_LIBRARY_GENERIC: 'Generic' };
let out = '';
for (const [name, lib] of Object.entries(sandbox.libs)) {
  const { lib: next, changes } = migrateLibrary(lib);
  console.log(`${labels[name]}: ${changes.join(', ') || 'nicio schimbare'}`);
  out += `// ${labels[name]}\nexport const ${name} = ${toJs(next, 0)};\n\n`;
}

fs.writeFileSync(FILE, src.slice(0, start) + out + src.slice(end));
console.log(`Scris ${FILE}`);
