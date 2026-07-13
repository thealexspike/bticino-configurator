import {
  json, readJson, uuid, hashPassword, createSession, sessionCookie,
  normalizeEmail, validCredentials,
} from '../../_shared/auth.js';

export async function onRequestPost(context) {
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
  await env.DB.prepare(
    'INSERT INTO users (id, email, password_hash, last_login) VALUES (?1, ?2, ?3, ?4)'
  ).bind(id, email, passwordHash, new Date().toISOString()).run();

  const { token } = await createSession(env.DB, id);
  return json({ user: { id, email } }, 200, { 'Set-Cookie': sessionCookie(token) });
}
