import { isAdminEmail } from './auth.js';

// Limită sub plafonul D1 de ~2 MB pe valoare. Clientul comprimă imaginea
// (JPEG, max ~3000 px) până intră sub ea.
export const MAX_IMAGE_BASE64 = 1_900_000;
export const ALLOWED_MIME = new Set(['image/jpeg', 'image/png']);

export const PLAN_COLUMNS = 'id, project_id, name, sort_order, width, height, marker_scale, created_at';

// Proiectul, dacă utilizatorul are acces. Citirea e permisă și adminilor
// (vizualizare doar-citire); scrierea doar proprietarului.
export async function getProjectForPlans(context, { write = false } = {}) {
  const { env, params, data } = context;
  const project = await env.DB.prepare('SELECT id, user_id FROM projects WHERE id = ?1')
    .bind(params.id).first();
  if (!project) return null;
  if (project.user_id === data.user.id) return project;
  if (!write && isAdminEmail(data.user.email)) return project;
  return null;
}

export function clampMarkerScale(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0.022;
  return Math.min(0.08, Math.max(0.005, n));
}
