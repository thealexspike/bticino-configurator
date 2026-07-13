// Client pentru API-ul propriu (Cloudflare Pages Functions + D1)
// Înlocuiește Supabase: autentificare pe bază de cookie de sesiune + REST simplu.

let authListeners = [];

function notifyAuthChange(session) {
  authListeners.forEach(cb => {
    try { cb(session); } catch {}
  });
}

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const message = data?.error || `Eroare de server (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return data;
}

function toSession(user) {
  return user ? { user } : null;
}

export const api = {
  // --- Autentificare ---
  async getSession() {
    try {
      const { user } = await request('/auth/me');
      return toSession(user);
    } catch {
      return null;
    }
  },

  onAuthChange(cb) {
    authListeners.push(cb);
    return () => { authListeners = authListeners.filter(l => l !== cb); };
  },

  async signIn(email, password) {
    const { user } = await request('/auth/login', { method: 'POST', body: { email, password } });
    const session = toSession(user);
    notifyAuthChange(session);
    return session;
  },

  async signUp(email, password) {
    const { user } = await request('/auth/signup', { method: 'POST', body: { email, password } });
    const session = toSession(user);
    notifyAuthChange(session);
    return session;
  },

  async signOut() {
    try { await request('/auth/logout', { method: 'POST' }); } catch {}
    notifyAuthChange(null);
  },

  async changePassword(currentPassword, newPassword) {
    return request('/auth/password', { method: 'PUT', body: { currentPassword, newPassword } });
  },

  // --- Proiecte ---
  async listProjects() {
    const { projects } = await request('/projects');
    return projects;
  },

  async createProject(fields) {
    const { project } = await request('/projects', { method: 'POST', body: fields });
    return project;
  },

  async updateProject(id, fields) {
    return request(`/projects/${id}`, { method: 'PUT', body: fields });
  },

  async deleteProject(id) {
    return request(`/projects/${id}`, { method: 'DELETE' });
  },

  async syncAssemblies(projectId, assemblies) {
    const { mapping } = await request(`/projects/${projectId}/assemblies`, {
      method: 'PUT',
      body: { assemblies },
    });
    return mapping || {};
  },

  // --- Librărie globală ---
  async getLibraryRows() {
    const { rows } = await request('/library');
    return rows;
  },

  async saveLibrary(id, libraryData) {
    return request('/library', { method: 'PUT', body: { id, library_data: libraryData } });
  },

  // --- Administrare conturi ---
  async adminListUsers() {
    const { users } = await request('/admin/users');
    return users;
  },

  async adminCreateUser(email, password) {
    return request('/admin/users', { method: 'POST', body: { email, password } });
  },

  async adminResetPassword(userId, password) {
    return request(`/admin/users/${userId}`, { method: 'PUT', body: { password } });
  },

  async adminDeleteUser(userId) {
    return request(`/admin/users/${userId}`, { method: 'DELETE' });
  },

  // --- Import AI ---
  async parseNecesar(pdfBase64, modules, system) {
    return request('/ai/parse-necesar', {
      method: 'POST',
      body: { pdfBase64, modules, system },
    });
  },
};
