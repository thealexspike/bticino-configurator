import { json } from '../../_shared/auth.js';

export async function onRequestGet(context) {
  return json({ user: context.data.user || null });
}
