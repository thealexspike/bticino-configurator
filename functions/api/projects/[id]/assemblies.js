import { json, readJson, requireUser, uuid, nowIso } from '../../../_shared/auth.js';

// PUT /api/projects/:id/assemblies — sincronizează întreaga listă de ansambluri
// Body: { assemblies: [{ id, type, code, room, size, color, wall_box_type, modules }] }
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

  // Șterge ansamblurile care nu mai există în proiect
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
      modules,
    ];

    if (existingIds.has(localId)) {
      statements.push(env.DB.prepare(
        `UPDATE assemblies SET type = ?1, code = ?2, room = ?3, size = ?4,
         color = ?5, wall_box_type = ?6, modules = ?7 WHERE id = ?8`
      ).bind(...fields, localId));
    } else {
      const serverId = uuid();
      mapping[localId] = serverId;
      statements.push(env.DB.prepare(
        `INSERT INTO assemblies (id, project_id, type, code, room, size, color, wall_box_type, modules, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`
      ).bind(serverId, project.id, ...fields, nowIso()));
    }
  }

  if (statements.length > 0) {
    await env.DB.batch(statements);
  }

  return json({ ok: true, mapping });
}
