import { json, readJson, requireUser, hashPassword, verifyPassword } from '../../_shared/auth.js';

export async function onRequestPut(context) {
  const denied = requireUser(context);
  if (denied) return denied;

  const { env } = context;
  const body = await readJson(context.request);
  const currentPassword = body?.currentPassword || '';
  const newPassword = body?.newPassword || '';

  if (newPassword.length < 6) {
    return json({ error: 'Parola nouă trebuie să aibă minim 6 caractere' }, 400);
  }

  const user = await env.DB.prepare('SELECT id, password_hash FROM users WHERE id = ?1')
    .bind(context.data.user.id).first();

  if (user.password_hash) {
    const ok = await verifyPassword(currentPassword, user.password_hash);
    if (!ok) return json({ error: 'Parola actuală este greșită' }, 403);
  }

  const passwordHash = await hashPassword(newPassword);
  await env.DB.prepare('UPDATE users SET password_hash = ?1 WHERE id = ?2')
    .bind(passwordHash, user.id).run();

  return json({ ok: true });
}
