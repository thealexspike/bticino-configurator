import { json, requireUser, uuid, nowIso } from '../../../../_shared/auth.js';
import {
  getProjectAccess, filesMissing, uploadedImage, putImage, photoKey, photoThumbKey,
  MAX_PHOTO_BYTES, MAX_THUMB_BYTES,
} from '../../../../_shared/files.js';

const PHOTO_COLUMNS = 'id, assembly_id, width, height, created_by, created_at';

// GET /api/projects/:id/photos — pozele de șantier ale proiectului (metadate)
export async function onRequestGet(context) {
  const denied = requireUser(context);
  if (denied) return denied;

  const project = await getProjectAccess(context);
  if (!project) return json({ error: 'Proiect inexistent' }, 404);

  const { results } = await context.env.DB.prepare(
    `SELECT ${PHOTO_COLUMNS} FROM photos WHERE project_id = ?1 ORDER BY created_at`
  ).bind(project.id).all();

  return json({ photos: results });
}

// POST /api/projects/:id/photos — poză nouă pentru un aparataj
// Multipart: assembly_id, file (JPEG, deja redimensionat), thumb (opțional), width, height
export async function onRequestPost(context) {
  const denied = requireUser(context) || filesMissing(context.env);
  if (denied) return denied;

  const project = await getProjectAccess(context, { write: true });
  if (!project) return json({ error: 'Proiect inexistent' }, 404);

  let form;
  try { form = await context.request.formData(); } catch { return json({ error: 'Cerere invalidă' }, 400); }

  const assemblyId = String(form.get('assembly_id') || '');
  const assembly = await context.env.DB.prepare(
    'SELECT id FROM assemblies WHERE id = ?1 AND project_id = ?2'
  ).bind(assemblyId, project.id).first();
  if (!assembly) {
    return json({ error: 'Aparatul nu este încă salvat. Încearcă din nou în câteva secunde.' }, 409);
  }

  const full = uploadedImage(form, 'file', MAX_PHOTO_BYTES);
  if (full.error) return json({ error: full.error }, full.error.includes('mare') ? 413 : 400);
  if (!full.file) return json({ error: 'Lipsește poza' }, 400);
  const thumb = uploadedImage(form, 'thumb', MAX_THUMB_BYTES);
  if (thumb.error) return json({ error: thumb.error }, 400);

  const id = uuid();
  const imageKey = photoKey(project.id, id);
  const thumbKey = thumb.file ? photoThumbKey(project.id, id) : null;
  await putImage(context.env, imageKey, full.file, full.type);
  if (thumb.file) await putImage(context.env, thumbKey, thumb.file, thumb.type);

  const photo = {
    id,
    assembly_id: assembly.id,
    width: Math.round(Number(form.get('width'))) || null,
    height: Math.round(Number(form.get('height'))) || null,
    created_by: context.data.user.email,
    created_at: nowIso(),
  };
  await context.env.DB.prepare(
    `INSERT INTO photos (id, project_id, assembly_id, image_key, thumb_key, width, height, created_by, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
  ).bind(photo.id, project.id, photo.assembly_id, imageKey, thumbKey, photo.width, photo.height,
    photo.created_by, photo.created_at).run();

  return json({ photo });
}
