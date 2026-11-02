// Bridge to the SketchUp extension.
// Inside SketchUp the app runs in a UI::HtmlDialog, which exposes window.sketchup.<callback>(jsonString).
// The extension answers by calling window.azimutSketchup.onModelAssemblies(items).
//
// JS -> Ruby:
//   placeAssembly(payload)                 place a new instance, or rebuild existing ones with payload.sketchupId
//   deleteAssembly({ projectId, sketchupId })  erase the linked instance, so the next sync doesn't bring it back
//   requestModelAssemblies({ projectId })  ask for every instance in the model
//   syncDone({ projectId, codes })         codes = [{ sketchupId, code }], so labels follow the app's numbering
// Ruby -> JS, one item per instance:
//   { sketchupId, type, room, size, color, wallBoxType, mountHeightMm, modules: [{ moduleId, pos }] }
//   (instances placed by v0.1.0 send modules as plain moduleId strings)

export const inSketchUp = () => typeof window !== 'undefined' && !!window.sketchup;

export const callSketchup = (name, data) => window.sketchup?.[name]?.(JSON.stringify(data));

export const newSketchupId = () => crypto.randomUUID();

export const DEFAULT_MOUNT_HEIGHT_MM = { outlet: 300, switch: 1100 };

export const getMountHeight = (assembly) =>
  assembly.mountHeightMm ?? DEFAULT_MOUNT_HEIGHT_MM[assembly.type] ?? DEFAULT_MOUNT_HEIGHT_MM.outlet;

import { layoutModules } from './lib/mounting.js';

// Everything Ruby needs to build the geometry, so the extension never reads the library itself.
export const buildPlacementPayload = (project, assembly, library, proportions) => ({
  projectId: project.id,
  sketchupId: assembly.sketchupId,
  code: assembly.code,
  type: assembly.type,
  room: assembly.room || '',
  system: library?.systemId || project.system || 'bticino',
  proportions,
  size: assembly.size,
  color: assembly.color,
  colorHex: (library?.availableColors || []).find(c => c.id === assembly.color)?.hex || '#FFFFFF',
  wallBoxType: assembly.wallBoxType || 'masonry',
  mountHeightMm: getMountHeight(assembly),
  // Physical order with the start slot (in modules): post systems can leave gaps between modules
  modules: layoutModules(assembly.modules, library).map(s => ({
    moduleId: s.moduleId,
    size: s.size,
    startPos: s.startPos,
    ...(Number.isInteger(s.pos) ? { pos: s.pos } : {}), // pinned slot, kept so copies made in SketchUp come back the same
    standardType: s.catalogItem?.standardType || s.moduleId,
    name: s.catalogItem?.nameRo || s.catalogItem?.nameEn || s.moduleId,
  })),
});

// Merge the model's instances into the project.
// The app owns what an assembly is (modules, size, color); the model owns where it sits (room, height).
// Instances the project doesn't know yet (copies made in SketchUp) become new assemblies.
// Assemblies linked to an instance that is gone are returned as `missing`; the caller decides what to do.
export const mergeModelAssemblies = (project, items, { generateId, generateCode }) => {
  const bySketchupId = new Map(items.map(i => [i.sketchupId, i]));
  const known = new Set(project.assemblies.map(a => a.sketchupId).filter(Boolean));

  let assemblies = project.assemblies.map(a => {
    const item = a.sketchupId && bySketchupId.get(a.sketchupId);
    if (!item) return a;
    return { ...a, room: item.room ?? a.room, mountHeightMm: item.mountHeightMm ?? a.mountHeightMm };
  });

  const created = [];
  for (const item of bySketchupId.values()) {
    if (known.has(item.sketchupId)) continue;
    const type = item.type === 'switch' ? 'switch' : 'outlet';
    const assembly = {
      id: generateId(),
      sketchupId: item.sketchupId,
      type,
      code: generateCode(assemblies, type),
      room: item.room || '',
      size: item.size || 2,
      color: item.color || 'white',
      wallBoxType: item.wallBoxType || 'masonry',
      mountHeightMm: item.mountHeightMm ?? null,
      modules: (item.modules || []).map(m => typeof m === 'string'
        ? { id: generateId(), moduleId: m }
        : { id: generateId(), moduleId: m.moduleId, ...(Number.isInteger(m.pos) ? { pos: m.pos } : {}) }),
    };
    assemblies = [...assemblies, assembly];
    created.push(assembly);
  }

  const missing = assemblies.filter(a => a.sketchupId && !bySketchupId.has(a.sketchupId));
  return { project: { ...project, assemblies }, created, missing };
};
