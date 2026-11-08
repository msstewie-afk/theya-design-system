// Runs the generated check/sync scripts against an in-memory stand-in for the
// Figma variables API, seeded from the payload's Theya values (as the file
// looked before brands). Checks: sync creates "9. Brand" and the brand modes,
// check then reports ok; a mode limit below what is needed stops sync before
// any change.
//   node scripts/figma/test/mock-run.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const FIG = join(ROOT, 'build/figma');
const P = JSON.parse(readFileSync(join(FIG, 'payload.json'), 'utf8'));
const NAMES = { '1.': '1. Color Primitive Variables', '2.': '2. Color Semantic Variables', '3.': '3. Size Primitive Variables', '4.': '4. Size Semantic Variables', '5.': '5. Primitive Typography', '6.': '6. Semantic Typography Variables', '7.': '7. Density' };

function makeFigma(modeLimit) {
  let n = 0; const id = (p) => `${p}:${++n}`;
  const cols = []; const vars = [];
  const api = {
    createVariableCollection(name) {
      const c = { id: id('C'), name, modes: [{ modeId: id('M'), name: 'Mode 1' }], removed: false,
        addMode(m) { if (c.modes.length >= modeLimit) throw new Error(`Limited to ${modeLimit} modes only`); const mid = id('M'); c.modes.push({ modeId: mid, name: m });
          for (const v of vars) if (v.variableCollectionId === c.id) v.valuesByMode[mid] = v.valuesByMode[c.modes[0].modeId]; return mid; },
        renameMode(mid, m) { c.modes.find((x) => x.modeId === mid).name = m; },
        remove() { c.removed = true; cols.splice(cols.indexOf(c), 1); } };
      cols.push(c); return c;
    },
    createVariable(name, col, type) {
      const v = { id: id('V'), name, variableCollectionId: col.id, resolvedType: type, scopes: [], valuesByMode: {},
        setValueForMode(m, x) { v.valuesByMode[m] = x; }, setVariableCodeSyntax() {} };
      for (const m of col.modes) v.valuesByMode[m.modeId] = type === 'STRING' ? '' : 0;
      vars.push(v); return v;
    },
    createVariableAlias(t) { return { type: 'VARIABLE_ALIAS', id: t.id }; },
    async getLocalVariableCollectionsAsync() { return cols; },
    async getLocalVariablesAsync() { return vars; },
  };
  return { variables: api, _cols: cols, _vars: vars };
}
const run = async (figma, file) => {
  const code = readFileSync(join(FIG, file), 'utf8');
  return new Function('figma', `return (async () => {\n${code}\n})();`)(figma);
};
// Seed: Theya as it is in Figma today (collections 1–7, default/dark in 2., Density modes in 7.).
async function seeded(limit) {
  const figma = makeFigma(limit);
  const seedPayload = JSON.parse(JSON.stringify(P));
  delete seedPayload.collections['9.'];
  for (const [k, c] of Object.entries(seedPayload.collections)) {
    const col = figma.variables.createVariableCollection(NAMES[k]);
    if (k === '2.') { col.renameMode(col.modes[0].modeId, 'default'); col.addMode('dark'); c.modes = ['default', 'dark']; }
    if (k === '7.') { col.renameMode(col.modes[0].modeId, 'Default'); col.addMode('Compact'); col.addMode('Comfortable'); }
    // Brand aliases did not exist yet: "4."–"6." held the theya value.
    for (const [name, v] of Object.entries(c.vars)) if (typeof v === 'string' && v.startsWith('@brand:')) c.vars[name] = P.collections['9.'].vars[name].theya;
  }
  // Alias targets first, then the collections that point into them.
  seedPayload.collections = Object.fromEntries(['1.', '3.', '5.', '7.', '2.', '4.', '6.'].map((k) => [k, seedPayload.collections[k]]));
  // Run the real sync once over the seed payload to fill values (aliases included).
  const code = readFileSync(join(FIG, 'sync-2.js'), 'utf8').replace(/^const PAYLOAD = .*;$/m, 'const PAYLOAD = ' + JSON.stringify({ ...seedPayload, creatable: [] }) + ';');
  await new Function('figma', `return (async () => {\n${code}\n})();`)(figma);
  return figma;
}
const files = readdirSync(FIG);
const pick = (a, k) => files.find((f) => f.startsWith(a) && f.includes(k));
let failed = 0; const expect = (cond, msg) => { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) failed++; };

{ // 1. enough modes: sync both parts, then both checks are ok
  const figma = await seeded(10);
  const before = await run(figma, pick('check', '-9-'));
  expect(before.ok === false && before['9. Brand']?.missingCollection, 'check before sync: not ok, "9. Brand" missing');
  const b2 = await run(figma, pick('check', '-2.js') || pick('check', 'check-2'));
  expect(b2.ok === false && b2['2. Color Semantic Variables'].missingModes.length === 6, 'check before sync: 6 brand modes missing in "2."');
  const s9 = await run(figma, pick('sync', '-9-'));
  const s2 = await run(figma, pick('sync', 'sync-2'));
  expect(s9.createdCollections?.[0] === '9. Brand', 'sync creates "9. Brand"');
  expect(JSON.stringify(s2['2. Color Semantic Variables'].modes) === JSON.stringify(['added ember', 'added ember dark', 'added iris', 'added iris dark', 'added lime', 'added lime dark']), 'sync adds the 6 brand modes to "2."');
  const brand = figma._cols.find((c) => c.name === '9. Brand');
  expect(brand.modes.map((m) => m.name).join() === 'theya,ember,iris,lime', '"9. Brand" modes theya, ember, iris, lime');
  const density = figma._cols.find((c) => c.name === '7. Density');
  expect(density.modes.length === 3, '"7. Density" untouched (3 modes)');
  const extra = [s9, s2].flatMap((l) => Object.values(l).flatMap((x) => x.extra ?? []));
  expect(extra.length === 0, 'nothing reported as extra (sync never deletes)');
  const a9 = await run(figma, pick('check', '-9-')); const a2 = await run(figma, pick('check', 'check-2'));
  expect(a9.ok && a2.ok, 'check after sync: ok in both parts');
  // Density and brand do not meet: no "9." variable aliases "7.", no density variable is in "9.".
  const byId = new Map(figma._vars.map((v) => [v.id, v]));
  const brandIds = new Set(figma._vars.filter((v) => v.variableCollectionId === brand.id).map((v) => v.id));
  const touchesDensity = figma._vars.filter((v) => brandIds.has(v.id)).some((v) => Object.values(v.valuesByMode).some((x) => x?.type === 'VARIABLE_ALIAS' && byId.get(x.id).variableCollectionId === density.id));
  expect(!touchesDensity, 'no "9. Brand" value aliases "7. Density"');
}
{ // 2. limit below 8: sync stops before writing anything
  const figma = await seeded(4);
  const snapshot = JSON.stringify(figma._vars.map((v) => [v.name, v.valuesByMode])) + figma._cols.map((c) => c.name + c.modes.length).join();
  let err = null; try { await run(figma, pick('sync', 'sync-2')); } catch (e) { err = e.message; }
  expect(err && /fewer than 8 modes/.test(err), 'mode limit 4: sync refuses with a clear error');
  const after = JSON.stringify(figma._vars.map((v) => [v.name, v.valuesByMode])) + figma._cols.map((c) => c.name + c.modes.length).join();
  expect(after === snapshot, 'mode limit 4: file unchanged, probe collection removed');
}
process.exit(failed ? 1 : 0);
