import { json, readJson, requireUser, uuid, nowIso } from '../../../_shared/auth.js';
import { deleteKeys } from '../../../_shared/files.js';

// PUT /api/projects/:id/assemblies — sincronizează întreaga listă de ansambluri
// Body: { assemblies: [{ id, type, code, room, size, color, wall_box_type, modules, notes }] }
// Răspuns: { mapping: { <idLocal>: <idServer> } } pentru ansamblurile nou create
export async function onRequestPut(context) {
  const denied = requireUser(context);
  if (denied) return denied;

  const { env, params } = context;
  const project = await env.DB.prepare('SELECT id FROM projects WHERE id = ?1 AND user_id = ?2')
    .bind(params.id, context.data.user.id).first();
  if (!project) return json({ error: 'Proiect inexistent' }, 404);

  const body = await readJson(context.request);
  const incoming = Array.isArray(body?.assemblies) ? body.assemblies : [];

  const { results: existingRows } = await env.DB.prepare(
    'SELECT id FROM assemblies WHERE project_id = ?1'
  ).bind(project.id).all();
  const existingIds = new Set(existingRows.map(r => r.id));

  const incomingIds = new Set(incoming.map(a => String(a.id)));
  const statements = [];
  const mapping = {};

  // Șterge ansamblurile care nu mai există în proiect (pozele lor se șterg după batch)
  for (const oldId of existingIds) {
    if (!incomingIds.has(oldId)) {
      statements.push(env.DB.prepare('DELETE FROM assemblies WHERE id = ?1').bind(oldId));
    }
  }

  for (const a of incoming) {
    const localId = String(a.id);
    const modules = JSON.stringify(Array.isArray(a.modules) ? a.modules : []);
    const fields = [
      String(a.type || 'outlet'), String(a.code || ''), String(a.room || ''),
      Number(a.size) || 2, String(a.color || ''), String(a.wall_box_type || 'masonry'),
      modules, String(a.notes || ''),
      a.plan_id ? String(a.plan_id) : null,
      Number.isFinite(Number(a.plan_x)) && a.plan_x !== null ? Math.min(1, Math.max(0, Number(a.plan_x))) : null,
      Number.isFinite(Number(a.plan_y)) && a.plan_y !== null ? Math.min(1, Math.max(0, Number(a.plan_y))) : null,
      a.wall_box_mode === 'single' || a.wall_box_mode === 'multi' ? a.wall_box_mode : null,
    ];

    if (existingIds.has(localId)) {
      statements.push(env.DB.prepare(
        `UPDATE assemblies SET type = ?1, code = ?2, room = ?3, size = ?4,
         color = ?5, wall_box_type = ?6, modules = ?7, notes = ?8,
         plan_id = ?9, plan_x = ?10, plan_y = ?11, wall_box_mode = ?12 WHERE id = ?13`
      ).bind(...fields, localId));
    } else {
      const serverId = uuid();
      mapping[localId] = serverId;
      statements.push(env.DB.prepare(
        `INSERT INTO assemblies (id, project_id, type, code, room, size, color, wall_box_type, modules, notes,
         plan_id, plan_x, plan_y, wall_box_mode, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)`
      ).bind(serverId, project.id, ...fields, nowIso()));
    }
  }

  if (statements.length > 0) {
    try {
      await env.DB.batch(statements);
    } catch (err) {
      // Bază de date creată înainte de câmpul „observații": adaugă coloana și reîncearcă
      if (!/column.*notes/i.test(String(err?.message || err))) throw err;
      try {
        await env.DB.prepare("ALTER TABLE assemblies ADD COLUMN notes TEXT DEFAULT ''").run();
      } catch (alterErr) {
        // O altă cerere a adăugat deja coloana
        if (!/duplicate column/i.test(String(alterErr?.message || alterErr))) throw alterErr;
      }
      await env.DB.batch(statements);
    }
  }

  // Pozele de șantier ale ansamblurilor șterse (subinterogare: fără limită de parametri)
  const orphanCondition = 'project_id = ?1 AND assembly_id NOT IN (SELECT id FROM assemblies WHERE project_id = ?1)';
  const { results: orphans } = await env.DB.prepare(
    `SELECT image_key, thumb_key FROM photos WHERE ${orphanCondition}`
  ).bind(project.id).all();
  if (orphans.length > 0) {
    await env.DB.prepare(`DELETE FROM photos WHERE ${orphanCondition}`).bind(project.id).run();
    await deleteKeys(env, orphans.flatMap(p => [p.image_key, p.thumb_key]));
  }

  return json({ ok: true, mapping });
}
