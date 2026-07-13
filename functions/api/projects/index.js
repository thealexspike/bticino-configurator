import { json, readJson, requireUser, uuid, nowIso } from '../../_shared/auth.js';

// GET /api/projects — toate proiectele utilizatorului, cu ansambluri
export async function onRequestGet(context) {
  const denied = requireUser(context);
  if (denied) return denied;

  const { env } = context;
  const userId = context.data.user.id;

  const { results: projects } = await env.DB.prepare(
    'SELECT * FROM projects WHERE user_id = ?1 ORDER BY created_at DESC'
  ).bind(userId).all();

  const { results: assemblies } = await env.DB.prepare(
    `SELECT a.* FROM assemblies a JOIN projects p ON p.id = a.project_id
     WHERE p.user_id = ?1 ORDER BY a.created_at`
  ).bind(userId).all();

  const byProject = {};
  for (const a of assemblies) {
    let modules = [];
    try { modules = JSON.parse(a.modules || '[]'); } catch { modules = []; }
    (byProject[a.project_id] ||= []).push({ ...a, modules });
  }

  return json({
    projects: projects.map(p => ({ ...p, assemblies: byProject[p.id] || [] })),
  });
}

// POST /api/projects — creare proiect
export async function onRequestPost(context) {
  const denied = requireUser(context);
  if (denied) return denied;

  const { env } = context;
  const body = await readJson(context.request);
  const name = String(body?.name || '').trim();
  if (!name) return json({ error: 'Numele proiectului este obligatoriu' }, 400);

  const project = {
    id: uuid(),
    user_id: context.data.user.id,
    name,
    client_name: String(body?.client_name || ''),
    client_contact: String(body?.client_contact || ''),
    system: String(body?.system || 'bticino'),
    created_at: nowIso(),
  };

  await env.DB.prepare(
    `INSERT INTO projects (id, user_id, name, client_name, client_contact, system, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`
  ).bind(
    project.id, project.user_id, project.name, project.client_name,
    project.client_contact, project.system, project.created_at
  ).run();

  return json({ project });
}
