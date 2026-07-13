import { json, readJson, requireAdmin, uuid, hashPassword, normalizeEmail, validCredentials, nowIso } from '../../../_shared/auth.js';

// GET /api/admin/users — lista conturilor
export async function onRequestGet(context) {
  const denied = requireAdmin(context);
  if (denied) return denied;

  const { results } = await context.env.DB.prepare(
    `SELECT u.id, u.email, u.created_at, u.last_login,
            (SELECT COUNT(*) FROM projects p WHERE p.user_id = u.id) AS project_count,
            (u.password_hash IS NOT NULL) AS has_password
     FROM users u ORDER BY u.created_at`
  ).all();

  return json({ users: results });
}

// POST /api/admin/users — creare cont de către admin
export async function onRequestPost(context) {
  const denied = requireAdmin(context);
  if (denied) return denied;

  const { env } = context;
  const body = await readJson(context.request);
  const email = normalizeEmail(body?.email);
  const password = body?.password || '';

  const invalid = validCredentials(email, password);
  if (invalid) return json({ error: invalid }, 400);

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?1').bind(email).first();
  if (existing) return json({ error: 'Există deja un cont cu acest email' }, 409);

  const id = uuid();
  const passwordHash = await hashPassword(password);
  await env.DB.prepare('INSERT INTO users (id, email, password_hash, created_at) VALUES (?1, ?2, ?3, ?4)')
    .bind(id, email, passwordHash, nowIso()).run();

  return json({ user: { id, email } });
}
