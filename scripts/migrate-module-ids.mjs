// Migrare D1: id-uri de module identice între sisteme (vezi scripts/lib/moduleIdMigration.mjs).
//
//   node scripts/migrate-module-ids.mjs           -> doar raport + scripts/migrate-module-ids.sql
//   node scripts/migrate-module-ids.mjs --apply   -> rulează SQL-ul pe baza remote
//
// Salvează un backup al rândurilor citite în scripts/backup-<data>.json înainte de orice.
// Necesită `npx wrangler login` făcut în prealabil.

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { migrateLibrary, migrateAssemblyModules, FIXED_RENAMES } from './lib/moduleIdMigration.mjs';

const DB = 'bticino-configurator-db';
const apply = process.argv.includes('--apply');

function query(sql) {
  const out = execSync(`npx wrangler d1 execute ${DB} --remote --json --command "${sql}"`, {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'],
  });
  return JSON.parse(out)[0].results;
}
const sqlStr = s => `'${String(s).replace(/'/g, "''")}'`;

const libRows = query('SELECT id, library_data, updated_at, updated_by FROM global_library');
const asmRows = query('SELECT a.id, a.modules, p.system FROM assemblies a JOIN projects p ON p.id = a.project_id');

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
fs.writeFileSync(`scripts/backup-${stamp}.json`, JSON.stringify({ libRows, asmRows }, null, 2));
console.log(`Backup: scripts/backup-${stamp}.json`);

const stmts = [];
const mapsBySystem = {};
for (const r of libRows) {
  const sys = r.id === 'main' ? 'bticino' : r.id;
  let lib;
  try { lib = JSON.parse(r.library_data); } catch { console.log(`!! ${r.id}: library_data invalid, sărit`); continue; }
  const { lib: next, map, changes } = migrateLibrary(lib);
  mapsBySystem[sys] = map;
  console.log(`\n[${sys}] ${changes.length ? changes.join(', ') : 'nicio schimbare'}`);
  if (changes.length) {
    stmts.push(`UPDATE global_library SET library_data = ${sqlStr(JSON.stringify(next))}, updated_at = ${sqlStr(new Date().toISOString())}, updated_by = 'migrate-module-ids' WHERE id = ${sqlStr(r.id)};`);
  }
}

let asmChanged = 0;
for (const a of asmRows) {
  let mods;
  try { mods = JSON.parse(a.modules || '[]'); } catch { continue; }
  const map = { ...FIXED_RENAMES, ...(mapsBySystem[a.system || 'bticino'] || {}) };
  const { modules, changed } = migrateAssemblyModules(mods, map);
  if (changed) {
    asmChanged++;
    stmts.push(`UPDATE assemblies SET modules = ${sqlStr(JSON.stringify(modules))} WHERE id = ${sqlStr(a.id)};`);
  }
}
console.log(`\nAnsambluri de actualizat: ${asmChanged} din ${asmRows.length}`);

fs.writeFileSync('scripts/migrate-module-ids.sql', stmts.join('\n') + '\n');
console.log(`SQL: scripts/migrate-module-ids.sql (${stmts.length} instrucțiuni)`);

if (!stmts.length) {
  console.log('Nimic de aplicat.');
} else if (apply) {
  execSync(`npx wrangler d1 execute ${DB} --remote --file scripts/migrate-module-ids.sql -y`, { stdio: 'inherit' });
  console.log('Aplicat.');
} else {
  console.log('Rulează cu --apply pentru a scrie în D1.');
}
