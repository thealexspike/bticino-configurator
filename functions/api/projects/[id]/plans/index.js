import { json, readJson, requireUser, uuid, nowIso } from '../../../../_shared/auth.js';
import {
  getProjectForPlans, PLAN_COLUMNS, MAX_IMAGE_BASE64, ALLOWED_MIME, clampMarkerScale,
} from '../../../../_shared/plans.js';

// GET /api/projects/:id/plans — planurile proiectului (fără imagine)
export async function onRequestGet(context) {
  const denied = requireUser(context);
  if (denied) return denied;

  const project = await getProjectForPlans(context);
  if (!project) return json({ error: 'Proiect inexistent' }, 404);

  const { results } = await context.env.DB.prepare(
    `SELECT ${PLAN_COLUMNS} FROM plans WHERE project_id = ?1 ORDER BY sort_order, created_at`
  ).bind(project.id).all();

  return json({ plans: results });
}

// POST /api/projects/:id/plans — plan nou
// Body: { name, width, height, mime, data (base64, fără prefix data:) }
export async function onRequestPost(context) {
  const denied = requireUser(context);
  if (denied) return denied;

  const project = await getProjectForPlans(context, { write: true });
  if (!project) return json({ error: 'Proiect inexistent' }, 404);

  const body = await readJson(context.request);
  const width = Math.round(Number(body?.width));
  const height = Math.round(Number(body?.height));
  const mime = String(body?.mime || '');
  const data = String(body?.data || '');

  if (!ALLOWED_MIME.has(mime)) return json({ error: 'Format de imagine neacceptat' }, 400);
  if (!(width > 0 && height > 0)) return json({ error: 'Dimensiuni invalide' }, 400);
  if (!data || !/^[A-Za-z0-9+/=]+$/.test(data)) return json({ error: 'Imagine invalidă' }, 400);
  if (data.length > MAX_IMAGE_BASE64) return json({ error: 'Imaginea este prea mare' }, 413);

  const { results: countRows } = await context.env.DB.prepare(
    'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM plans WHERE project_id = ?1'
  ).bind(project.id).all();

  const plan = {
    id: uuid(),
    project_id: project.id,
    name: String(body?.name || '').trim().slice(0, 120) || 'Plan',
    sort_order: countRows[0]?.next ?? 0,
    width,
    height,
    marker_scale: clampMarkerScale(body?.marker_scale),
    created_at: nowIso(),
  };

  await context.env.DB.prepare(
    `INSERT INTO plans (id, project_id, name, sort_order, width, height, marker_scale, mime, image, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`
  ).bind(plan.id, plan.project_id, plan.name, plan.sort_order, plan.width, plan.height,
    plan.marker_scale, mime, data, plan.created_at).run();

  return json({ plan });
}
