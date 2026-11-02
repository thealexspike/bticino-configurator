// Self-check for the SketchUp merge logic: node src/sketchup.check.mjs
import assert from 'node:assert/strict';
import { mergeModelAssemblies, buildPlacementPayload, getMountHeight } from './sketchup.js';

let n = 0;
const generateId = () => `id${++n}`;
const generateCode = (assemblies, type) => {
  const prefix = type === 'outlet' ? 'P' : 'I';
  const nums = assemblies.filter(a => a.type === type).map(a => parseInt(a.code.slice(1)));
  return `${prefix}${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(2, '0')}`;
};

const project = {
  id: 'proj',
  assemblies: [
    { id: 'a1', sketchupId: 's1', type: 'outlet', code: 'P01', room: 'Bucătărie', size: 4, color: 'white', modules: [{ id: 'm1', moduleId: 'schuko' }], mountHeightMm: null },
    { id: 'a2', sketchupId: 's2', type: 'switch', code: 'I01', room: 'Hol', size: 2, color: 'white', modules: [] },
    { id: 'a3', type: 'outlet', code: 'P02', room: 'Dormitor', size: 2, color: 'black', modules: [] },
  ],
};

const items = [
  // s1 moved: model wins on room/height, app keeps size/modules
  { sketchupId: 's1', type: 'outlet', room: 'Living', size: 6, color: 'black', mountHeightMm: 1050, modules: ['usb'] },
  // copy made in SketchUp, listed twice by mistake: one new assembly only
  { sketchupId: 's9', type: 'switch', room: 'Hol', size: 3, color: 'white', mountHeightMm: 1100, modules: ['switch_simple', 'switch_stair'] },
  { sketchupId: 's9', type: 'switch', room: 'Hol', size: 3, color: 'white', mountHeightMm: 1100, modules: ['switch_simple', 'switch_stair'] },
];

const { project: merged, created, missing } = mergeModelAssemblies(project, items, { generateId, generateCode });
const byId = Object.fromEntries(merged.assemblies.map(a => [a.id, a]));

assert.equal(byId.a1.room, 'Living');
assert.equal(byId.a1.mountHeightMm, 1050);
assert.equal(byId.a1.size, 4);
assert.deepEqual(byId.a1.modules, [{ id: 'm1', moduleId: 'schuko' }]);
assert.equal(byId.a3.room, 'Dormitor', 'unlinked assemblies untouched');

assert.equal(created.length, 1);
assert.equal(created[0].code, 'I02');
assert.equal(created[0].sketchupId, 's9');
assert.deepEqual(created[0].modules.map(m => m.moduleId), ['switch_simple', 'switch_stair']);

assert.deepEqual(missing.map(a => a.id), ['a2'], 'linked but absent from model');
assert.equal(project.assemblies[0].room, 'Bucătărie', 'input not mutated');

assert.equal(getMountHeight({ type: 'switch' }), 1100);
assert.equal(getMountHeight({ type: 'outlet', mountHeightMm: 0 }), 0, '0 is a real height');

const library = { systemId: 'gewiss', availableColors: [{ id: 'black', hex: '#333333' }], modules: [{ id: 'schuko', size: 2, standardType: 'schuko', nameRo: 'Priză Schuko' }] };
const payload = buildPlacementPayload(project, { ...byId.a1, color: 'black' }, library, { moduleWidth1M: 40 });
assert.equal(payload.system, 'gewiss');
assert.equal(payload.colorHex, '#333333');
assert.equal(payload.mountHeightMm, 1050);
assert.equal(payload.snapHeightMm, 1050);
const unset = buildPlacementPayload(project, { type: 'switch', modules: [] }, library, {});
assert.equal(unset.mountHeightMm, null, 'no height in the app: rebuild leaves the instance where it is');
assert.equal(unset.snapHeightMm, 1100);
assert.deepEqual(payload.modules, [{ moduleId: 'schuko', size: 2, startPos: 0, standardType: 'schuko', name: 'Priză Schuko' }]);

// Post system: a half-post module pinned on the second post keeps its slot, with a gap before it
const posts = { systemId: 'generic_posts', mounting: 'posts', postSize: 2, modules: [{ id: 'half', size: 1, standardType: 'switch_simple' }] };
const pp = buildPlacementPayload({ id: 'p' }, { size: 4, modules: [{ moduleId: 'half', pos: 2 }] }, posts, {});
assert.deepEqual(pp.modules.map(m => [m.startPos, m.size, m.pos]), [[2, 1, 2]]);

// A copy of that assembly coming back from the model keeps the slot
const fromModel = mergeModelAssemblies({ id: 'p', assemblies: [] },
  [{ sketchupId: 'c1', type: 'switch', size: 4, modules: [{ moduleId: 'half', pos: 2 }] }], { generateId, generateCode });
assert.deepEqual(fromModel.created[0].modules.map(({ moduleId, pos }) => [moduleId, pos]), [['half', 2]]);

console.log('sketchup bridge: ok');
