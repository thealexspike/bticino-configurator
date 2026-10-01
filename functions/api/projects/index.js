import { json, readJson, requireUser, uuid, nowIso } from '../../_shared/auth.js';
import { listProjectsForUser } from '../../_shared/projects.js';

// GET /api/projects — toate proiectele utilizatorului, cu ansambluri
export async function onRequestGet(context) {
  const denied = requireUser(context);
  if (denied) return denied;

  const projects = await listProjectsForUser(context.env.DB, context.data.user.id);
  return json({ projects });
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
