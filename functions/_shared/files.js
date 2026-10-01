import { isAdminEmail, json } from './auth.js';

// Fișierele proiectelor stau în R2 (binding FILES, bucket bticino-configurator-files):
//   plans/<projectId>/<planId>.jpg                imaginea unui plan
//   photos/<projectId>/<photoId>.jpg              poza de șantier, mărime întreagă
//   photos/<projectId>/<photoId>-thumb.jpg        miniatura pozei
// În D1 se țin doar metadatele și cheia R2.

export const MAX_PLAN_BYTES = 20 * 1024 * 1024;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const MAX_THUMB_BYTES = 1024 * 1024;
export const ALLOWED_MIME = new Set(['image/jpeg', 'image/png']);

export const planKey = (projectId, planId) => `plans/${projectId}/${planId}.jpg`;
export const photoKey = (projectId, photoId) => `photos/${projectId}/${photoId}.jpg`;
export const photoThumbKey = (projectId, photoId) => `photos/${projectId}/${photoId}-thumb.jpg`;

export function filesMissing(env) {
  return env.FILES ? null : json({ error: 'Stocarea de fișiere nu este configurată' }, 500);
}

// Proiectul, dacă utilizatorul are acces. Citirea e permisă și adminilor
// (vizualizare doar-citire); scrierea doar proprietarului.
export async function getProjectAccess(context, { write = false } = {}) {
  const { env, params, data } = context;
  const project = await env.DB.prepare('SELECT id, user_id FROM projects WHERE id = ?1')
    .bind(params.id).first();
  if (!project) return null;
  if (project.user_id === data.user.id) return project;
  if (!write && isAdminEmail(data.user.email)) return project;
  return null;
}

// Fișier dintr-un formular multipart; null dacă lipsește sau nu e imagine acceptată
export function uploadedImage(form, field, maxBytes) {
  const file = form.get(field);
  if (!file || typeof file === 'string') return { error: null, file: null };
  const type = file.type || 'image/jpeg';
  if (!ALLOWED_MIME.has(type)) return { error: 'Format de imagine neacceptat', file: null };
  if (file.size > maxBytes) return { error: 'Imaginea este prea mare', file: null };
  return { error: null, file, type };
}

export async function putImage(env, key, file, type) {
  await env.FILES.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: type || 'image/jpeg' } });
}

// Răspuns cu imaginea din R2. Cheile nu se refolosesc niciodată, deci imaginea
// poate sta în cache-ul browserului.
export async function imageResponse(env, key) {
  const obj = await env.FILES.get(key);
  if (!obj) return json({ error: 'Imagine inexistentă' }, 404);
  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg',
      'Cache-Control': 'private, max-age=31536000, immutable',
      ETag: obj.httpEtag,
    },
  });
}

export async function deleteKeys(env, keys) {
  const list = keys.filter(Boolean);
  if (!env.FILES || list.length === 0) return;
  // R2 acceptă până la 1000 de chei per apel
  for (let i = 0; i < list.length; i += 1000) {
    await env.FILES.delete(list.slice(i, i + 1000));
  }
}

// Cheile R2 ale fișierelor (planuri + poze) din proiectele care corespund condiției.
// Subinterogare, nu listă de id-uri: D1 acceptă max. 100 de parametri pe interogare.
async function fileKeysWhere(db, projectCondition, value) {
  const { results: plans } = await db.prepare(
    `SELECT image_key FROM plans WHERE project_id IN (SELECT id FROM projects WHERE ${projectCondition})`
  ).bind(value).all();
  const { results: photos } = await db.prepare(
    `SELECT image_key, thumb_key FROM photos WHERE project_id IN (SELECT id FROM projects WHERE ${projectCondition})`
  ).bind(value).all();
  return [
    ...plans.map(p => p.image_key),
    ...photos.flatMap(p => [p.image_key, p.thumb_key]),
  ].filter(Boolean);
}

export const fileKeysForProject = (db, projectId) => fileKeysWhere(db, 'id = ?1', projectId);
export const fileKeysForUser = (db, userId) => fileKeysWhere(db, 'user_id = ?1', userId);
