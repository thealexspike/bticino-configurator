// Migrare date din Supabase în Cloudflare D1.
//
// Utilizare:
//   SUPABASE_SERVICE_KEY=<service_role key> node scripts/migrate-from-supabase.mjs
//   npx wrangler d1 execute bticino-configurator-db --remote --file scripts/import.sql -y
//
// Cheia service_role se găsește în dashboard-ul Supabase:
//   Project Settings -> API keys -> service_role (secret)
//
// Scriptul descarcă utilizatorii, proiectele, ansamblurile și librăriile,
// apoi generează scripts/import.sql. Parolele nu pot fi migrate (hash
// incompatibil) — fiecare utilizator NOU primește o parolă temporară,
// afișată la consolă. Conturile care există deja în D1 (același email)
// sunt păstrate, iar proiectele lor vechi le sunt atașate.

import { randomUUID, randomBytes, pbkdf2Sync } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const SUPABASE_URL = 'https://xdrexercxxbgsobmtvfr.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_KEY) {
  console.error('Setează variabila SUPABASE_SERVICE_KEY (cheia service_role din dashboard).');
  process.exit(1);
}

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
};

async function fetchAll(path) {
  const rows = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const res = await fetch(`${SUPABASE_URL}${path}${path.includes('?') ? '&' : '?'}limit=${pageSize}&offset=${offset}`, { headers });
    if (!res.ok) throw new Error(`${path}: HTTP ${res.status} ${await res.text()}`);
    const page = await res.json();
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows;
}

async function fetchUsers() {
  const users = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=1000`, { headers });
    if (!res.ok) throw new Error(`admin/users: HTTP ${res.status} ${await res.text()}`);
    const data = await res.json();
    const batch = data.users || [];
    users.push(...batch);
    if (batch.length < 1000) break;
  }
  return users;
}

function hashPassword(password) {
  const iterations = 100000;
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, iterations, 32, 'sha256');
  return `pbkdf2$${iterations}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

function tempPassword() {
  return `Azimut-${randomBytes(4).toString('hex')}`;
}

const q = (v) => v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`;

const users = await fetchUsers();
const projects = await fetchAll('/rest/v1/projects?select=*');
const assemblies = await fetchAll('/rest/v1/assemblies?select=*');
const library = await fetchAll('/rest/v1/global_library?select=*');

console.log(`Găsit: ${users.length} utilizatori, ${projects.length} proiecte, ${assemblies.length} ansambluri, ${library.length} librării\n`);

const emailById = {};
const sql = ['-- generat de migrate-from-supabase.mjs', 'PRAGMA defer_foreign_keys = true;'];
const tempPasswords = [];

for (const u of users) {
  if (!u.email) continue;
  emailById[u.id] = u.email.toLowerCase();
  const pw = tempPassword();
  tempPasswords.push(`  ${u.email.toLowerCase()}  ->  ${pw}`);
  sql.push(
    `INSERT INTO users (id, email, password_hash, created_at) VALUES (${q(u.id)}, ${q(u.email.toLowerCase())}, ${q(hashPassword(pw))}, ${q(u.created_at || new Date().toISOString())}) ON CONFLICT(email) DO NOTHING;`
  );
}

for (const p of projects) {
  const ownerEmail = emailById[p.user_id];
  if (!ownerEmail) { console.warn(`Proiect ${p.id} fără utilizator — sărit`); continue; }
  sql.push(
    `INSERT INTO projects (id, user_id, name, client_name, client_contact, system, created_at)
     SELECT ${q(String(p.id))}, u.id, ${q(p.name)}, ${q(p.client_name || '')}, ${q(p.client_contact || '')}, ${q(p.system || 'bticino')}, ${q(p.created_at || new Date().toISOString())}
     FROM users u WHERE u.email = ${q(ownerEmail)}
     ON CONFLICT(id) DO NOTHING;`
  );
}

for (const a of assemblies) {
  sql.push(
    `INSERT INTO assemblies (id, project_id, type, code, room, size, color, wall_box_type, modules, created_at) VALUES (` +
    [q(String(a.id)), q(String(a.project_id)), q(a.type || 'outlet'), q(a.code || ''), q(a.room || ''),
     Number(a.size) || 2, q(a.color || ''), q(a.wall_box_type || 'masonry'),
     q(JSON.stringify(a.modules || [])), q(a.created_at || new Date().toISOString())].join(', ') +
    `) ON CONFLICT(id) DO NOTHING;`
  );
}

for (const row of library) {
  sql.push(
    `INSERT INTO global_library (id, library_data, updated_at, updated_by) VALUES (${q(row.id)}, ${q(JSON.stringify(row.library_data))}, ${q(row.updated_at)}, ${q(row.updated_by)}) ON CONFLICT(id) DO UPDATE SET library_data = excluded.library_data, updated_at = excluded.updated_at, updated_by = excluded.updated_by;`
  );
}

writeFileSync(new URL('./import.sql', import.meta.url), sql.join('\n'), 'utf8');

console.log('Scris scripts/import.sql — rulează:');
console.log('  npx wrangler d1 execute bticino-configurator-db --remote --file scripts/import.sql -y\n');
console.log('Parole temporare (doar pentru conturile NOI importate; cele existente rămân neschimbate):');
console.log(tempPasswords.join('\n'));
