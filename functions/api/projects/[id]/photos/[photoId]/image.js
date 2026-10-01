import { json, requireUser } from '../../../../../_shared/auth.js';
import { getProjectAccess, filesMissing, imageResponse } from '../../../../../_shared/files.js';

// GET /api/projects/:id/photos/:photoId/image[?size=thumb] — poza sau miniatura ei
export async function onRequestGet(context) {
  const denied = requireUser(context) || filesMissing(context.env);
  if (denied) return denied;

  const project = await getProjectAccess(context);
  if (!project) return json({ error: 'Proiect inexistent' }, 404);

  const photo = await context.env.DB.prepare(
    'SELECT image_key, thumb_key FROM photos WHERE id = ?1 AND project_id = ?2'
  ).bind(context.params.photoId, project.id).first();
  if (!photo) return json({ error: 'Poză inexistentă' }, 404);

  const wantsThumb = new URL(context.request.url).searchParams.get('size') === 'thumb';
  return imageResponse(context.env, (wantsThumb && photo.thumb_key) || photo.image_key);
}
