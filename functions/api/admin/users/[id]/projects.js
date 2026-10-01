import { json, requireAdmin } from '../../../../_shared/auth.js';
import { listProjectsForUser } from '../../../../_shared/projects.js';

// GET /api/admin/users/:id/projects — proiectele unui utilizator, pentru vizualizare
// doar-citire de către un admin. Nu există rută de scriere corespunzătoare: rutele
// de modificare a proiectelor verifică proprietarul, deci adminul nu le poate altera.
export async function onRequestGet(context) {
  const denied = requireAdmin(context);
  if (denied) return denied;

  const { env, params } = context;
  const user = await env.DB.prepare('SELECT id, email FROM users WHERE id = ?1').bind(params.id).first();
  if (!user) return json({ error: 'Cont inexistent' }, 404);

  // Urmă în jurnalele Pages: cine a văzut proiectele cui
  console.log(`admin-view-projects admin=${context.data.user.email} target=${user.email}`);

  const projects = await listProjectsForUser(env.DB, user.id);
  return json({ user, projects });
}
