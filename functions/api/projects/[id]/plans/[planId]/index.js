import { json, readJson, requireUser } from '../../../../../_shared/auth.js';
import { PLAN_COLUMNS, clampMarkerScale } from '../../../../../_shared/plans.js';
import { getProjectAccess, deleteKeys } from '../../../../../_shared/files.js';

async function getPlan(context, projectId) {
  return context.env.DB.prepare(`SELECT ${PLAN_COLUMNS}, image_key FROM plans WHERE id = ?1 AND project_id = ?2`)
    .bind(context.params.planId, projectId).first();
}

// PUT /api/projects/:id/plans/:planId — redenumire, ordine, mărimea marcajelor
export async function onRequestPut(context) {
  const denied = requireUser(context);
  if (denied) return denied;

  const project = await getProjectAccess(context, { write: true });
  if (!project) return json({ error: 'Proiect inexistent' }, 404);
  const plan = await getPlan(context, project.id);
  if (!plan) return json({ error: 'Plan inexistent' }, 404);

  const body = (await readJson(context.request)) || {};
  const name = body.name !== undefined ? (String(body.name).trim().slice(0, 120) || plan.name) : plan.name;
  const sortOrder = body.sort_order !== undefined ? Math.round(Number(body.sort_order)) || 0 : plan.sort_order;
  const markerScale = body.marker_scale !== undefined ? clampMarkerScale(body.marker_scale) : plan.marker_scale;

  await context.env.DB.prepare(
    'UPDATE plans SET name = ?1, sort_order = ?2, marker_scale = ?3 WHERE id = ?4'
  ).bind(name, sortOrder, markerScale, plan.id).run();

  const { image_key: _key, ...publicPlan } = plan;
  return json({ plan: { ...publicPlan, name, sort_order: sortOrder, marker_scale: markerScale } });
}

// DELETE /api/projects/:id/plans/:planId — șterge planul; aparatele de pe el rămân, fără poziție
export async function onRequestDelete(context) {
  const denied = requireUser(context);
  if (denied) return denied;

  const project = await getProjectAccess(context, { write: true });
  if (!project) return json({ error: 'Proiect inexistent' }, 404);
  const plan = await getPlan(context, project.id);
  if (!plan) return json({ error: 'Plan inexistent' }, 404);

  await context.env.DB.batch([
    context.env.DB.prepare(
      'UPDATE assemblies SET plan_id = NULL, plan_x = NULL, plan_y = NULL WHERE project_id = ?1 AND plan_id = ?2'
    ).bind(project.id, plan.id),
    context.env.DB.prepare('DELETE FROM plans WHERE id = ?1').bind(plan.id),
  ]);
  await deleteKeys(context.env, [plan.image_key]);

  return json({ ok: true });
}
