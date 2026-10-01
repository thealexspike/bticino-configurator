import {
  json, readJson, uuid, hashPassword, createSession, sessionCookie,
  normalizeEmail, validCredentials,
} from '../../_shared/auth.js';

// POST /api/auth/signup — înregistrarea publică este închisă.
// Funcționează doar pentru primul cont (bază de date goală); restul conturilor
// le creează un administrator din pagina „Conturi" (POST /api/admin/users).
export async function onRequestPost(context) {
  const { env } = context;

  const anyUser = await env.DB.prepare('SELECT id FROM users LIMIT 1').first();
  if (anyUser) {
    return json({ error: 'Înregistrarea este închisă — cere un cont administratorului' }, 403);
  }

  const body = await readJson(context.request);
  const email = normalizeEmail(body?.email);
  const password = body?.password || '';

  const invalid = validCredentials(email, password);
  if (invalid) return json({ error: invalid }, 400);

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?1').bind(email).first();
  if (existing) return json({ error: 'Există deja un cont cu acest email' }, 409);

  const id = uuid();
  const passwordHash = await hashPassword(password);
  await env.DB.prepare(
    'INSERT INTO users (id, email, password_hash, last_login) VALUES (?1, ?2, ?3, ?4)'
  ).bind(id, email, passwordHash, new Date().toISOString()).run();

  const { token } = await createSession(env.DB, id);
  return json({ user: { id, email } }, 200, { 'Set-Cookie': sessionCookie(token) });
}
