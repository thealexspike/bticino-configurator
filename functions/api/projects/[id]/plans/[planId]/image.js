import { json, requireUser } from '../../../../../_shared/auth.js';
import { getProjectAccess, filesMissing, imageResponse, planKey } from '../../../../../_shared/files.js';

// GET /api/projects/:id/plans/:planId/image — imaginea planului, din R2.
// Planurile vechi, salvate în D1 ca base64, se mută în R2 la prima cerere.
export async function onRequestGet(context) {
  const denied = requireUser(context) || filesMissing(context.env);
  if (denied) return denied;

  const project = await getProjectAccess(context);
  if (!project) return json({ error: 'Proiect inexistent' }, 404);

  const { env, params } = context;
  const row = await env.DB.prepare(
    'SELECT id, mime, image_key, image FROM plans WHERE id = ?1 AND project_id = ?2'
  ).bind(params.planId, project.id).first();
  if (!row) return json({ error: 'Plan inexistent' }, 404);

  if (!row.image_key && row.image) {
    const binary = atob(row.image);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const key = planKey(project.id, row.id);
    await env.FILES.put(key, bytes, { httpMetadata: { contentType: row.mime || 'image/jpeg' } });
    await env.DB.prepare("UPDATE plans SET image_key = ?1, image = '' WHERE id = ?2").bind(key, row.id).run();
    row.image_key = key;
  }

  if (!row.image_key) return json({ error: 'Imagine inexistentă' }, 404);
  return imageResponse(env, row.image_key);
}
