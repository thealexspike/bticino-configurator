import React, { useState, useEffect } from 'react';
import { api } from './api';
import Auth from './Auth';
import AdminUsers from './AdminUsers';
import { GlobalHeader } from './components/GlobalHeader';
import { LibraryPage } from './components/LibraryPage';
import { ProjectDetail } from './components/ProjectDetail';
import { ProjectList } from './components/ProjectList';
import { DEFAULT_LIBRARY, DEFAULT_LIBRARY_GEWISS, DEFAULT_LIBRARY_SCHNEIDER, DEFAULT_LIBRARY_GENERIC, DEFAULT_LIBRARIES } from './data/libraries';
import { TRANSLATIONS, LanguageContext } from './i18n';
import { saveLibrary, LibraryContext } from './lib/library';
import { ReadOnlyContext } from './readOnly';

// --- Mapare rânduri API -> modelul folosit în UI ---

const parseExcluded = (raw) => {
  try {
    const parsed = JSON.parse(raw || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch { return {}; }
};

const projectFromApi = (project) => ({
  ...project,
  id: project.id,
  name: project.name,
  clientName: project.client_name,
  clientContact: project.client_contact,
  system: project.system || 'bticino',
  excludedItems: parseExcluded(project.excluded_items),
  createdAt: project.created_at,
  assemblies: (project.assemblies || []).map(a => ({
    id: a.id,
    type: a.type,
    code: a.code,
    room: a.room,
    size: a.size,
    color: a.color,
    wallBoxType: a.wall_box_type || 'masonry',
    notes: a.notes || '',
    modules: a.modules || [],
    planId: a.plan_id || null,
    planX: a.plan_x ?? null,
    planY: a.plan_y ?? null,
  })),
});

// Default-urile tuturor sistemelor, suprascrise de rândurile salvate în D1
const librariesFromRows = (rows) => {
  const libs = {
    bticino: { ...DEFAULT_LIBRARY },
    gewiss: { ...DEFAULT_LIBRARY_GEWISS },
    schneider: { ...DEFAULT_LIBRARY_SCHNEIDER },
    generic: { ...DEFAULT_LIBRARY_GENERIC },
  };
  (rows || []).forEach(row => {
    const libData = row.library_data || {};
    const systemId = row.id === 'main' ? 'bticino' : row.id;
    if (libData.modules && libData.modules.length > 0) {
      if (!libData.systemId) libData.systemId = systemId;
      libs[systemId] = libData;
    }
  });
  return libs;
};

// Presetele sunt comune tuturor sistemelor (modulele au aceleași id-uri peste tot).
// Se țin în global_library, pe rândul PRESETS_ROW_ID. Până la prima salvare, lista
// comună se obține unificând presetele vechi, salvate pe fiecare sistem.
const PRESETS_ROW_ID = 'presets';
const presetKey = (p) => `${p.type}|${p.size}|${(p.modules || []).join('+')}`;

const mergeSystemPresets = (libs) => {
  const seenKeys = new Set();
  const seenIds = new Set();
  const seenNames = new Set();
  const out = [];
  for (const sys of ['bticino', 'generic', 'gewiss', 'schneider']) {
    for (const p of libs[sys]?.presets || []) {
      const key = presetKey(p);
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);
      let id = p.id || `preset_${out.length + 1}`;
      for (let n = 2; seenIds.has(id); n++) id = `${p.id}_${n}`;
      seenIds.add(id);
      // Același nume, conținut diferit (ex. cap scară 1M + obturator vs. cap scară 2M)
      const n = (p.modules || []).length;
      const clash = seenNames.has(p.nameRo || p.nameEn);
      const named = clash
        ? { ...p, nameRo: `${p.nameRo} – ${n} ${n === 1 ? 'modul' : 'module'}`, nameEn: `${p.nameEn} – ${n} ${n === 1 ? 'module' : 'modules'}` }
        : p;
      seenNames.add(named.nameRo || named.nameEn);
      out.push({ ...named, id });
    }
  }
  return out;
};

// Rezultat: { libs (fără presete proprii), presets (comune), fromRow (există deja rândul comun) }
const splitLibrariesAndPresets = (rows) => {
  const libs = librariesFromRows(rows);
  const row = (rows || []).find(r => r.id === PRESETS_ROW_ID);
  const fromRow = Array.isArray(row?.library_data?.presets);
  const presets = fromRow ? row.library_data.presets : mergeSystemPresets(libs);
  for (const sys of Object.keys(libs)) {
    const { presets: _legacy, ...rest } = libs[sys];
    libs[sys] = rest;
  }
  return { libs, presets, fromRow };
};

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ projects: [] });
  const [library, setLibrary] = useState(DEFAULT_LIBRARY);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showAdminUsers, setShowAdminUsers] = useState(false);
  // Admin: proiectele altui utilizator, doar citire ({ user, projects })
  const [viewAs, setViewAs] = useState(null);
  const [viewAsProjectId, setViewAsProjectId] = useState(null);
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('configurator-aparataj-lang') || localStorage.getItem('bticino-lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Admin check - @atelierazimut.com emails are admins
  const isAdmin = session?.user?.email?.endsWith('@atelierazimut.com') || false;

  // Verifică sesiunea la start
  useEffect(() => {
    api.getSession().then((session) => {
      setSession(session);
      setLoading(false);
    });

    const unsubscribe = api.onAuthChange((session) => {
      setSession(session);
    });

    return unsubscribe;
  }, []);

  // Librăriile tuturor sistemelor (default-uri suprascrise de ce e salvat pe server)
  const [libraries, setLibraries] = useState({});
  const [commonPresets, setCommonPresets] = useState([]);
  // O librărie de sistem, completată cu presetele comune
  const withPresets = (lib) => (lib ? { ...lib, presets: commonPresets } : lib);

  // Încarcă proiectele și librăriile la autentificare
  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;

    api.listProjects()
      .then(rows => { if (!cancelled) setData({ projects: rows.map(projectFromApi) }); })
      .catch(error => console.error('Error loading projects:', error));

    api.getLibraryRows()
      .catch(error => { console.error('Error loading library:', error); return []; })
      .then(rows => {
        if (cancelled) return;
        const { libs, presets, fromRow } = splitLibrariesAndPresets(rows);
        setLibraries(libs);
        setLibrary(libs.bticino);
        setCommonPresets(presets);
        // Prima încărcare de către un admin: lista unificată devine lista comună
        const email = session?.user?.email || '';
        if (!fromRow && email.toLowerCase().endsWith('@atelierazimut.com')) {
          api.saveLibrary(PRESETS_ROW_ID, { presets }).catch(err => console.error('Error saving presets:', err));
        }
      });

    return () => { cancelled = true; };
  }, [session]);

  const getLibraryForSystem = (systemId) => {
    return withPresets(libraries[systemId] || DEFAULT_LIBRARIES[systemId] || library);
  };

  const saveLibraryToServer = async (libraryData, systemId) => {
    if (!isAdmin) return;
    const sysId = systemId || libraryData?.systemId || 'bticino';
    const rowId = sysId === 'bticino' ? 'main' : sysId;

    try {
      await api.saveLibrary(rowId, libraryData);
    } catch (error) {
      console.error('Error saving library:', error);
    }
  };

  // Orice editare din LibraryPage: actualizează starea și salvează (local + server)
  // Presetele merg pe rândul comun; restul, în librăria sistemului (doar dacă s-a schimbat ceva)
  const handleLibraryUpdate = (nextLibrary) => {
    if (!nextLibrary) return;
    const { presets, ...systemLibrary } = nextLibrary;
    if (presets && presets !== commonPresets) {
      setCommonPresets(presets);
      if (isAdmin) {
        api.saveLibrary(PRESETS_ROW_ID, { presets }).catch(err => console.error('Error saving presets:', err));
      }
    }
    const systemChanged = Object.keys(systemLibrary).some(k => systemLibrary[k] !== library?.[k])
      || Object.keys(library || {}).some(k => k !== 'presets' && !(k in systemLibrary));
    if (!systemChanged) return;
    setLibrary(systemLibrary);
    if (!systemLibrary.systemId) return;
    setLibraries(prev => ({ ...prev, [systemLibrary.systemId]: systemLibrary }));
    if (systemLibrary.systemId === 'bticino') saveLibrary(systemLibrary);
    saveLibraryToServer(systemLibrary, systemLibrary.systemId);
  };

  const saveProject = async (project) => {
  try {
    await api.updateProject(project.id, {
      name: project.name,
      client_name: project.clientName,
      client_contact: project.clientContact,
      system: project.system || 'bticino',
      excluded_items: project.excludedItems || {},
    });

    // Sincronizează toate ansamblurile într-un singur apel;
    // serverul șterge ce nu mai există și întoarce id-urile noi
    const mapping = await api.syncAssemblies(project.id, project.assemblies.map(a => ({
      id: a.id,
      type: a.type,
      code: a.code,
      room: a.room,
      size: a.size,
      color: a.color,
      wall_box_type: a.wallBoxType || 'masonry',
      notes: a.notes || '',
      modules: a.modules,
      plan_id: a.planId || null,
      plan_x: a.planX ?? null,
      plan_y: a.planY ?? null,
    })));

    // Actualizează id-urile locale cu cele din server
    for (const assembly of project.assemblies) {
      if (mapping[assembly.id]) {
        assembly.id = mapping[assembly.id];
      }
    }
  } catch (error) {
    console.error('Error saving project:', error);
  }
};


  useEffect(() => {
    try {
      localStorage.setItem('configurator-aparataj-lang', lang);
    } catch {}
  }, [lang]);

  const updateProject = async (updated) => {
    setData({
      ...data,
      projects: data.projects.map(p => p.id === updated.id ? updated : p),
    });
    if (selectedProject?.id === updated.id) {
      setSelectedProject(updated);
    }
    await saveProject(updated);
  };

  const createProject = async (name, client, system = 'bticino') => {
  let savedProject;
  try {
    savedProject = await api.createProject({
      name, client_name: client, client_contact: '', system,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return;
  }

  const newProject = {
    id: savedProject.id,
    name: savedProject.name,
    clientName: savedProject.client_name,
    clientContact: savedProject.client_contact,
    system: savedProject.system || system,
    createdAt: savedProject.created_at,
    assemblies: [],
  };

  setData({ ...data, projects: [...data.projects, newProject] });
};

const deleteProject = async (id) => {
  try {
    // Serverul șterge și ansamblurile asociate
    await api.deleteProject(id);
  } catch (error) {
    console.error('Error deleting project:', error);
  }

  setData({
    ...data,
    projects: data.projects.filter(p => p.id !== id),
  });
};

  const openViewAs = async (user) => {
    try {
      const result = await api.adminUserProjects(user.id);
      setViewAs({ user: result.user, projects: result.projects.map(projectFromApi) });
      setViewAsProjectId(null);
      setShowAdminUsers(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const closeViewAs = () => {
    setViewAs(null);
    setViewAsProjectId(null);
    setShowAdminUsers(true);
  };

  const handleLogout = async () => {
    await api.signOut();
    setData({ projects: [] });
    setSelectedProject(null);
    setViewAs(null);
    setViewAsProjectId(null);
  };

  const languageContextValue = { lang, t, setLang };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Se încarcă...</p>
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return <Auth />;
  }

  const openAdminUsers = () => { setShowAdminUsers(true); setShowLibrary(false); setSelectedProject(null); setViewAs(null); setViewAsProjectId(null); };
  const header = (
    <GlobalHeader lang={lang} email={session.user.email} isAdmin={isAdmin} onOpenUsers={openAdminUsers} onLogout={handleLogout} />
  );

  // Admin: proiectele altui utilizator, doar citire
  if (viewAs && isAdmin) {
    const viewedProject = viewAs.projects.find(p => p.id === viewAsProjectId);
    const banner = (
      <div className="sticky top-12 z-40 bg-amber-100 border-b border-amber-300 px-4 py-2 flex items-center justify-between gap-3 text-sm">
        <span className="text-amber-900">
          {lang === 'ro' ? 'Vizualizezi proiectele lui' : 'Viewing projects of'} <strong>{viewAs.user.email}</strong>
          {' · '}{lang === 'ro' ? 'doar citire, nimic nu se salvează' : 'read-only, nothing is saved'}
        </span>
        <button onClick={closeViewAs} className="bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700 whitespace-nowrap">
          {lang === 'ro' ? 'Închide' : 'Close'}
        </button>
      </div>
    );
    const noop = () => {};
    return (
      <LanguageContext.Provider value={languageContextValue}>
        <ReadOnlyContext.Provider value={true}>
          <LibraryContext.Provider value={viewedProject ? getLibraryForSystem(viewedProject.system || 'bticino') : withPresets(library)}>
            <div className="min-h-screen bg-gray-100">
              {header}
              <div className="pt-16">
                {banner}
                {viewedProject ? (
                  <ProjectDetail
                    project={viewedProject}
                    onBack={() => setViewAsProjectId(null)}
                    onUpdate={noop}
                    getLibraryForSystem={getLibraryForSystem}
                  />
                ) : (
                  <ProjectList
                    projects={viewAs.projects}
                    onSelect={(p) => setViewAsProjectId(p.id)}
                    onCreate={noop}
                    onDelete={noop}
                    onOpenLibrary={noop}
                    title={viewAs.user.email}
                  />
                )}
              </div>
            </div>
          </LibraryContext.Provider>
        </ReadOnlyContext.Provider>
      </LanguageContext.Provider>
    );
  }

  // Show Admin Users page
  if (showAdminUsers && isAdmin) {
    return (
      <LanguageContext.Provider value={languageContextValue}>
        <div className="min-h-screen bg-gray-100">
          {header}
          <div className="pt-16">
            <AdminUsers
              onBack={() => setShowAdminUsers(false)}
              currentUserId={session.user.id}
              onViewProjects={openViewAs}
            />
          </div>
        </div>
      </LanguageContext.Provider>
    );
  }

  // Show Library page
  if (showLibrary) {
    const handleSwitchLibrarySystem = (systemId) => {
      const { presets: _legacy, ...targetLib } = libraries[systemId] || DEFAULT_LIBRARIES[systemId] || DEFAULT_LIBRARY;
      setLibrary(targetLib);
    };

    return (
      <LanguageContext.Provider value={languageContextValue}>
        <LibraryContext.Provider value={withPresets(library)}>
          <div className="min-h-screen bg-gray-100">
            {header}
            <div className="pt-16">
              <LibraryPage
                library={withPresets(library)}
                onUpdate={handleLibraryUpdate}
                onBack={() => setShowLibrary(false)}
                isAdmin={isAdmin}
                onSwitchSystem={handleSwitchLibrarySystem}
              />
            </div>
          </div>
        </LibraryContext.Provider>
      </LanguageContext.Provider>
    );
  }

  // Show Project Detail
  if (selectedProject) {
    const currentProject = data.projects.find(p => p.id === selectedProject.id);
    const projectLibrary = getLibraryForSystem(currentProject?.system || selectedProject?.system || 'bticino');
    return (
      <LanguageContext.Provider value={languageContextValue}>
        <LibraryContext.Provider value={projectLibrary}>
          <div className="min-h-screen bg-gray-100">
            {header}
            <div className="pt-16">
              <ProjectDetail
                project={currentProject || selectedProject}
                onBack={() => setSelectedProject(null)}
                onUpdate={updateProject}
                getLibraryForSystem={getLibraryForSystem}
              />
            </div>
          </div>
        </LibraryContext.Provider>
      </LanguageContext.Provider>
    );
  }

  // Show Project List
  return (
    <LanguageContext.Provider value={languageContextValue}>
      <LibraryContext.Provider value={withPresets(library)}>
        <div className="min-h-screen bg-gray-100">
          {header}
          <div className="pt-16">
            <ProjectList
              projects={data.projects}
              onSelect={setSelectedProject}
              onCreate={createProject}
              onDelete={deleteProject}
              onOpenLibrary={() => setShowLibrary(true)}
            />
          </div>
        </div>
      </LibraryContext.Provider>
    </LanguageContext.Provider>
  );
}
