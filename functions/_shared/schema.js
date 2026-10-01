// Completări de schemă aplicate automat, o dată per instanță de worker.
// Toate sunt idempotente (IF NOT EXISTS / coloană adăugată doar dacă lipsește),
// deci baza de producție se actualizează singură la primul request după deploy.

let ensured = null;

async function addMissingColumns(db, table, columns) {
  const { results } = await db.prepare(`PRAGMA table_info(${table})`).all();
  const existing = new Set(results.map(r => r.name));
  for (const [name, type] of columns) {
    if (existing.has(name)) continue;
    try {
      await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${name} ${type}`).run();
    } catch (err) {
      // O altă cerere a adăugat coloana între timp
      if (!/duplicate column/i.test(String(err?.message || err))) throw err;
    }
  }
}

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
      image TEXT NOT NULL DEFAULT '',
      image_key TEXT,
      created_at TEXT NOT NULL
    )`
  ).run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_plans_project ON plans(project_id)').run();
  await addMissingColumns(db, 'plans', [['image_key', 'TEXT']]);

  await db.prepare(
    `CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      assembly_id TEXT NOT NULL,
      image_key TEXT NOT NULL,
      thumb_key TEXT,
      width INTEGER,
      height INTEGER,
      created_by TEXT,
      created_at TEXT NOT NULL
    )`
  ).run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_photos_project ON photos(project_id)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_photos_assembly ON photos(assembly_id)').run();

  await addMissingColumns(db, 'assemblies', [
    ['plan_id', 'TEXT'],
    ['plan_x', 'REAL'],
    ['plan_y', 'REAL'],
  ]);
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
