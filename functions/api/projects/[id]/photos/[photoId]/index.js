import { json, requireUser } from '../../../../../_shared/auth.js';
import { getProjectAccess, deleteKeys } from '../../../../../_shared/files.js';

// DELETE /api/projects/:id/photos/:photoId — șterge poza (D1 + R2)
export async function onRequestDelete(context) {
  const denied = requireUser(context);
  if (denied) return denied;

  const project = await getProjectAccess(context, { write: true });
  if (!project) return json({ error: 'Proiect inexistent' }, 404);

  const photo = await context.env.DB.prepare(
    'SELECT id, image_key, thumb_key FROM photos WHERE id = ?1 AND project_id = ?2'
  ).bind(context.params.photoId, project.id).first();
  if (!photo) return json({ error: 'Poză inexistentă' }, 404);

  await context.env.DB.prepare('DELETE FROM photos WHERE id = ?1').bind(photo.id).run();
  await deleteKeys(context.env, [photo.image_key, photo.thumb_key]);

  return json({ ok: true });
}
