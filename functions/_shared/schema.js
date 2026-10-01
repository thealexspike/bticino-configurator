// Completări de schemă aplicate automat, o dată per instanță de worker.
// Toate sunt idempotente (IF NOT EXISTS / coloană adăugată doar dacă lipsește),
// deci baza de producție se actualizează singură la primul request după deploy.

let ensured = null;

const ASSEMBLY_COLUMNS = [
  ['plan_id', 'TEXT'],
  ['plan_x', 'REAL'],
  ['plan_y', 'REAL'],
];

async function apply(db) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      marker_scale REAL NOT NULL DEFAULT 0.022,
      mime TEXT NOT NULL DEFAULT 'image/jpeg',
      image TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`
  ).run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_plans_project ON plans(project_id)').run();

  const { results } = await db.prepare('PRAGMA table_info(assemblies)').all();
  const existing = new Set(results.map(r => r.name));
  for (const [name, type] of ASSEMBLY_COLUMNS) {
    if (existing.has(name)) continue;
    try {
      await db.prepare(`ALTER TABLE assemblies ADD COLUMN ${name} ${type}`).run();
    } catch (err) {
      // O altă cerere a adăugat coloana între timp
      if (!/duplicate column/i.test(String(err?.message || err))) throw err;
    }
  }
}

export function ensureSchema(db) {
  if (!ensured) {
    ensured = apply(db).catch(err => {
      ensured = null; // se reîncearcă la următoarea cerere
      throw err;
    });
  }
  return ensured;
}
