import {
  json, readJson, verifyPassword, createSession, sessionCookie, normalizeEmail,
} from '../../_shared/auth.js';

export async function onRequestPost(context) {
  const { env } = context;
  const body = await readJson(context.request);
  const email = normalizeEmail(body?.email);
  const password = body?.password || '';

  const user = await env.DB.prepare(
    'SELECT id, email, password_hash FROM users WHERE email = ?1'
  ).bind(email).first();

  if (!user) return json({ error: 'Email sau parolă greșită' }, 401);
  if (!user.password_hash) {
    return json({ error: 'Contul nu are parolă setată — cere administratorului să îți seteze una' }, 403);
  }

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return json({ error: 'Email sau parolă greșită' }, 401);

  await env.DB.prepare('UPDATE users SET last_login = ?1 WHERE id = ?2')
    .bind(new Date().toISOString(), user.id).run();

  const { token } = await createSession(env.DB, user.id);
  return json({ user: { id: user.id, email: user.email } }, 200, { 'Set-Cookie': sessionCookie(token) });
}
