import { json, requireUser, uuid, nowIso } from '../../../../_shared/auth.js';
import { PLAN_COLUMNS, clampMarkerScale } from '../../../../_shared/plans.js';
import {
  getProjectAccess, filesMissing, uploadedImage, putImage, planKey, MAX_PLAN_BYTES,
} from '../../../../_shared/files.js';

// GET /api/projects/:id/plans — planurile proiectului (fără imagine)
export async function onRequestGet(context) {
  const denied = requireUser(context);
  if (denied) return denied;

  const project = await getProjectAccess(context);
  if (!project) return json({ error: 'Proiect inexistent' }, 404);

  const { results } = await context.env.DB.prepare(
    `SELECT ${PLAN_COLUMNS} FROM plans WHERE project_id = ?1 ORDER BY sort_order, created_at`
  ).bind(project.id).all();

  return json({ plans: results });
}

// POST /api/projects/:id/plans — plan nou (multipart: file, name, width, height, marker_scale?)
export async function onRequestPost(context) {
  const denied = requireUser(context) || filesMissing(context.env);
  if (denied) return denied;

  const project = await getProjectAccess(context, { write: true });
  if (!project) return json({ error: 'Proiect inexistent' }, 404);

  let form;
  try { form = await context.request.formData(); } catch { return json({ error: 'Cerere invalidă' }, 400); }

  const { error, file, type } = uploadedImage(form, 'file', MAX_PLAN_BYTES);
  if (error) return json({ error }, error.includes('mare') ? 413 : 400);
  if (!file) return json({ error: 'Lipsește imaginea planului' }, 400);

  const width = Math.round(Number(form.get('width')));
  const height = Math.round(Number(form.get('height')));
  if (!(width > 0 && height > 0)) return json({ error: 'Dimensiuni invalide' }, 400);

  const { results: next } = await context.env.DB.prepare(
    'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM plans WHERE project_id = ?1'
  ).bind(project.id).all();

  const plan = {
    id: uuid(),
    project_id: project.id,
    name: String(form.get('name') || '').trim().slice(0, 120) || 'Plan',
    sort_order: next[0]?.next ?? 0,
    width,
    height,
    marker_scale: clampMarkerScale(form.get('marker_scale')),
    created_at: nowIso(),
  };
  const key = planKey(project.id, plan.id);

  await putImage(context.env, key, file, type);
  await context.env.DB.prepare(
    `INSERT INTO plans (id, project_id, name, sort_order, width, height, marker_scale, mime, image, image_key, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, '', ?9, ?10)`
  ).bind(plan.id, plan.project_id, plan.name, plan.sort_order, plan.width, plan.height,
    plan.marker_scale, type, key, plan.created_at).run();

  return json({ plan });
}
