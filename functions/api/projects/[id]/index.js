import { json, readJson, requireUser } from '../../../_shared/auth.js';

async function getOwnedProject(env, userId, projectId) {
  return env.DB.prepare('SELECT * FROM projects WHERE id = ?1 AND user_id = ?2')
    .bind(projectId, userId).first();
}

// PUT /api/projects/:id — actualizare date proiect
export async function onRequestPut(context) {
  const denied = requireUser(context);
  if (denied) return denied;

  const { env, params } = context;
  const project = await getOwnedProject(env, context.data.user.id, params.id);
  if (!project) return json({ error: 'Proiect inexistent' }, 404);

  const body = await readJson(context.request);
  let excludedItems = project.excluded_items || '{}';
  if (body && typeof body.excluded_items === 'object' && body.excluded_items !== null) {
    excludedItems = JSON.stringify(body.excluded_items);
  }
  await env.DB.prepare(
    `UPDATE projects SET name = ?1, client_name = ?2, client_contact = ?3, system = ?4, excluded_items = ?5 WHERE id = ?6`
  ).bind(
    String(body?.name ?? project.name),
    String(body?.client_name ?? project.client_name ?? ''),
    String(body?.client_contact ?? project.client_contact ?? ''),
    String(body?.system ?? project.system ?? 'bticino'),
    excludedItems,
    project.id
  ).run();

  return json({ ok: true });
}

// DELETE /api/projects/:id — ștergere proiect + ansambluri
export async function onRequestDelete(context) {
  const denied = requireUser(context);
  if (denied) return denied;

  const { env, params } = context;
  const project = await getOwnedProject(env, context.data.user.id, params.id);
  if (!project) return json({ error: 'Proiect inexistent' }, 404);

  await env.DB.batch([
    env.DB.prepare('DELETE FROM assemblies WHERE project_id = ?1').bind(project.id),
    env.DB.prepare('DELETE FROM projects WHERE id = ?1').bind(project.id),
  ]);

  return json({ ok: true });
}
