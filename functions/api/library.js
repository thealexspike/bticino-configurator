import { json, readJson, requireUser, requireAdmin, nowIso } from '../_shared/auth.js';

// GET /api/library — toate librăriile salvate (orice utilizator autentificat)
export async function onRequestGet(context) {
  const denied = requireUser(context);
  if (denied) return denied;

  const { results } = await context.env.DB.prepare(
    'SELECT id, library_data FROM global_library'
  ).all();

  const rows = results.map(r => {
    let data = null;
    try { data = JSON.parse(r.library_data); } catch { data = null; }
    return { id: r.id, library_data: data };
  }).filter(r => r.library_data);

  return json({ rows });
}

// PUT /api/library — upsert o librărie (doar admin)
export async function onRequestPut(context) {
  const denied = requireAdmin(context);
  if (denied) return denied;

  const body = await readJson(context.request);
  const id = String(body?.id || '').trim();
  if (!id || typeof body?.library_data !== 'object' || body.library_data === null) {
    return json({ error: 'Date invalide' }, 400);
  }

  await context.env.DB.prepare(
    `INSERT INTO global_library (id, library_data, updated_at, updated_by)
     VALUES (?1, ?2, ?3, ?4)
     ON CONFLICT(id) DO UPDATE SET library_data = ?2, updated_at = ?3, updated_by = ?4`
  ).bind(id, JSON.stringify(body.library_data), nowIso(), context.data.user.email).run();

  return json({ ok: true });
}
