// Planurile proiectelor. Imaginea stă în R2 (vezi files.js); coloana `image`
// păstrează doar imaginile vechi, salvate în D1 înainte de mutarea în R2.

export const PLAN_COLUMNS = 'id, project_id, name, sort_order, width, height, marker_scale, created_at';

export function clampMarkerScale(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0.022;
  return Math.min(0.08, Math.max(0.005, n));
}
