import { json, requireUser } from '../../../../../_shared/auth.js';
import { getProjectForPlans } from '../../../../../_shared/plans.js';

// GET /api/projects/:id/plans/:planId/image — imaginea planului
// Imaginea unui plan nu se modifică niciodată (înlocuirea = plan nou), deci se poate
// păstra în cache-ul browserului.
export async function onRequestGet(context) {
  const denied = requireUser(context);
  if (denied) return denied;

  const project = await getProjectForPlans(context);
  if (!project) return json({ error: 'Proiect inexistent' }, 404);

  const row = await context.env.DB.prepare(
    'SELECT mime, image FROM plans WHERE id = ?1 AND project_id = ?2'
  ).bind(context.params.planId, project.id).first();
  if (!row) return json({ error: 'Plan inexistent' }, 404);

  const binary = atob(row.image);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  return new Response(bytes, {
    headers: {
      'Content-Type': row.mime || 'image/jpeg',
      'Cache-Control': 'private, max-age=31536000, immutable',
    },
  });
}
