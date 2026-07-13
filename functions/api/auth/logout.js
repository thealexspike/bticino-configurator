import { json, getSessionToken, sha256Hex, clearSessionCookie } from '../../_shared/auth.js';

export async function onRequestPost(context) {
  const { env, request } = context;
  const token = getSessionToken(request);
  if (token) {
    const tokenHash = await sha256Hex(token);
    await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?1').bind(tokenHash).run();
  }
  return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie() });
}
