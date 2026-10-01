import { getModuleCatalog } from './library';

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateAssemblyCode = (assemblies, type) => {
  const prefix = type === 'outlet' ? 'P' : 'I';
  const existing = assemblies
    .filter(a => a.type === type)
    .map(a => parseInt(a.code.slice(1)))
    .filter(n => !isNaN(n));
  const next = existing.length ? Math.max(...existing) + 1 : 1;
  return `${prefix}${String(next).padStart(2, '0')}`;
};

// Renumber assemblies of a given type sequentially
export const renumberAssemblies = (assemblies, type) => {
  const prefix = type === 'outlet' ? 'P' : 'I';
  let counter = 1;
  return assemblies.map(a => {
    if (a.type === type) {
      return { ...a, code: `${prefix}${String(counter++).padStart(2, '0')}` };
    }
    return a;
  });
};

// Move assembly to a new position (0-indexed within its type)
export const reorderAssembly = (assemblies, assemblyId, newIndex, type) => {
  const typeAssemblies = assemblies.filter(a => a.type === type);
  const otherAssemblies = assemblies.filter(a => a.type !== type);
  
  const currentIndex = typeAssemblies.findIndex(a => a.id === assemblyId);
  if (currentIndex === -1 || currentIndex === newIndex) return assemblies;
  
  // Remove from current position
  const [moved] = typeAssemblies.splice(currentIndex, 1);
  // Insert at new position
  typeAssemblies.splice(newIndex, 0, moved);
  
  // Combine and renumber
  const combined = [...otherAssemblies, ...typeAssemblies];
  return renumberAssemblies(combined, type);
};

export const calculateModulesSize = (modules, library) => {
  const catalog = getModuleCatalog(library);
  return modules.reduce((sum, m) => {
    const catalogItem = catalog.find(c => c.id === m.moduleId);
    return sum + (catalogItem?.size || 0);
  }, 0);
};

export const createAssembly = (type, code, room = '', library = null) => ({
  id: generateId(),
  type,
  code,
  room,
  size: 2,
  color: library?.availableColors?.[0]?.id || 'white',
  wallBoxType: 'masonry',
  notes: '',
  modules: [],
});

// Module instance now stores moduleId (stable) instead of moduleSku (color-dependent)
export const createModuleInstance = (moduleId) => ({
  id: generateId(),
  moduleId,
});

// Cheile pot fi: "<categorie>" (toată categoria) sau "<categorie>:<cheieArticol>" (un singur articol)
export function isEntryExcluded(excluded, category, itemKey) {
  return !!(excluded && (excluded[category] || excluded[`${category}:${itemKey}`]));
}
