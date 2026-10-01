// Încărcarea proiectelor unui utilizator, cu ansamblurile lor.
// Folosită de GET /api/projects (utilizatorul logat) și de
// GET /api/admin/users/:id/projects (vizualizare doar-citire pentru admin).
export async function listProjectsForUser(db, userId) {
  const { results: projects } = await db.prepare(
    'SELECT * FROM projects WHERE user_id = ?1 ORDER BY created_at DESC'
  ).bind(userId).all();

  const { results: assemblies } = await db.prepare(
    `SELECT a.* FROM assemblies a JOIN projects p ON p.id = a.project_id
     WHERE p.user_id = ?1 ORDER BY a.created_at`
  ).bind(userId).all();

  const byProject = {};
  for (const a of assemblies) {
    let modules = [];
    try { modules = JSON.parse(a.modules || '[]'); } catch { modules = []; }
    (byProject[a.project_id] ||= []).push({ ...a, modules });
  }

  return projects.map(p => ({ ...p, assemblies: byProject[p.id] || [] }));
}
