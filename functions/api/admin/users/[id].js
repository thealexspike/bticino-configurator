import { json, readJson, requireAdmin, hashPassword } from '../../../_shared/auth.js';

// PUT /api/admin/users/:id — resetare parolă
export async function onRequestPut(context) {
  const denied = requireAdmin(context);
  if (denied) return denied;

  const { env, params } = context;
  const body = await readJson(context.request);
  const password = body?.password || '';
  if (password.length < 6) return json({ error: 'Parola trebuie să aibă minim 6 caractere' }, 400);

  const user = await env.DB.prepare('SELECT id FROM users WHERE id = ?1').bind(params.id).first();
  if (!user) return json({ error: 'Cont inexistent' }, 404);

  const passwordHash = await hashPassword(password);
  await env.DB.batch([
    env.DB.prepare('UPDATE users SET password_hash = ?1 WHERE id = ?2').bind(passwordHash, user.id),
    // Invalidează sesiunile existente ale contului
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?1').bind(user.id),
  ]);

  return json({ ok: true });
}

// DELETE /api/admin/users/:id — ștergere cont + toate datele lui
export async function onRequestDelete(context) {
  const denied = requireAdmin(context);
  if (denied) return denied;

  const { env, params } = context;
  if (params.id === context.data.user.id) {
    return json({ error: 'Nu îți poți șterge propriul cont' }, 400);
  }

  const user = await env.DB.prepare('SELECT id FROM users WHERE id = ?1').bind(params.id).first();
  if (!user) return json({ error: 'Cont inexistent' }, 404);

  await env.DB.batch([
    env.DB.prepare(
      'DELETE FROM assemblies WHERE project_id IN (SELECT id FROM projects WHERE user_id = ?1)'
    ).bind(user.id),
    env.DB.prepare('DELETE FROM projects WHERE user_id = ?1').bind(user.id),
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?1').bind(user.id),
    env.DB.prepare('DELETE FROM users WHERE id = ?1').bind(user.id),
  ]);

  return json({ ok: true });
}
