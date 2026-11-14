// Runs the generated check/sync scripts against an in-memory stand-in for the
// Figma variables API, seeded from the payload's Theya values (as the file
// looked before brands). Checks: sync adds the brand modes and the brand/
// variables to "2." (Theme), points the "@brand:" aliases there, check then
// reports ok; a mode limit below what is needed stops sync before
// any change.
//   node scripts/figma/test/mock-run.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const FIG = join(ROOT, 'build/figma');
const P = JSON.parse(readFileSync(join(FIG, 'payload.json'), 'utf8'));
// The file as it is since 2026-11-14: names without numbers, except one still numbered
// ("7. Density"), which the scripts must find as well.
const NAMES = { ...P.collectionNames, '7.': '7. Density' };

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
    setBoundVariableForEffect(e, field, v) { return { ...e, boundVariables: { [field]: { type: 'VARIABLE_ALIAS', id: v.id } } }; },
    async getLocalVariableCollectionsAsync() { return cols; },
    async getLocalVariablesAsync() { return vars; },
  };
  // Effect styles as the file had them: an older scale, unbound colours.
  const styles = Object.keys(P.effects).map((name) => ({ name, effects: [{ type: 'DROP_SHADOW', color: { r: 0.05, g: 0.05, b: 0.1, a: 0.1 }, offset: { x: 0, y: 2 }, radius: 4, spread: -2, visible: true }] }));
  return { variables: api, getLocalEffectStylesAsync: async () => styles, _cols: cols, _vars: vars, _styles: styles };
}
const run = async (figma, file) => {
  const code = readFileSync(join(FIG, file), 'utf8');
  return new Function('figma', `return (async () => {\n${code}\n})();`)(figma);
};
// Seed: Theya as it is in Figma today (collections 1–7, default/dark in 2., Density modes in 7.).
async function seeded(limit) {
  const figma = makeFigma(limit);
  const seedPayload = JSON.parse(JSON.stringify(P));
  // Before brands: no brand/ variables in "2.".
  const c2 = seedPayload.collections['2.'];
  c2.vars = Object.fromEntries(Object.entries(c2.vars).filter(([n]) => !n.startsWith('brand/')));
  delete seedPayload.effects; // the styles start unbound, as in the file before 2026-11-14
  for (const [k, c] of Object.entries(seedPayload.collections)) {
    const col = figma.variables.createVariableCollection(NAMES[k]);
    if (k === '2.') { col.renameMode(col.modes[0].modeId, 'default'); col.addMode('dark'); c.modes = ['default', 'dark']; }
    if (k === '7.') { col.renameMode(col.modes[0].modeId, 'Default'); col.addMode('Compact'); col.addMode('Comfortable'); }
    // Brand aliases did not exist yet: "4."–"6." held the theya value.
    for (const [name, v] of Object.entries(c.vars)) if (typeof v === 'string' && v.startsWith('@brand:')) c.vars[name] = P.collections['2.'].vars['brand/' + v.slice(7)].default;
  }
  // Alias targets first, then the collections that point into them.
  seedPayload.collections = Object.fromEntries(['1.', '3.', '5.', '7.', '2.', '4.', '6.'].map((k) => [k, seedPayload.collections[k]]));
  // Run the real sync once over the seed payload to fill values (aliases included).
  const code = readFileSync(join(FIG, 'sync-2-not-brand.js'), 'utf8').replace(/^const PAYLOAD = .*;$/m, 'const PAYLOAD = ' + JSON.stringify({ ...seedPayload, creatable: [] }) + ';');
  await new Function('figma', `return (async () => {\n${code}\n})();`)(figma);
  return figma;
}
const byIdOf = (figma, id) => figma._vars.find((v) => v.id === id);
const files = readdirSync(FIG);
const pick = (a, k) => files.find((f) => f.startsWith(a) && f.includes(k));
let failed = 0; const expect = (cond, msg) => { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) failed++; };

{ // 1. enough modes: sync the three parts, then the three checks are ok
  const figma = await seeded(10);
  const parts = ['2-brand', '2-not-brand', '1-3-4-5-6-7'];
  const theme = () => figma._cols.find((c) => c.name === 'Theme');
  const before = await Promise.all(parts.map((x) => run(figma, `check-${x}.js`)));
  expect(before.every((r) => !r.ok) && before[0].Theme.missingModes.length === 6, 'check before sync: not ok, 6 brand modes missing in Theme');
  expect(before[0].Theme.missing > 0, 'check before sync: brand/ variables missing in Theme');
  const s = [];
  for (const x of parts) s.push(await run(figma, `sync-${x}.js`));
  expect(JSON.stringify(s[0].Theme.modes) === JSON.stringify(['added ember', 'added ember dark', 'added iris', 'added iris dark', 'added lime', 'added lime dark']), 'sync adds the 6 brand modes to Theme');
  expect(!s.some((l) => l.createdCollections), 'no Brand collection is created');
  const t = theme(); const mode = (n) => t.modes.find((m) => m.name === n).modeId;
  const byId = new Map(figma._vars.map((v) => [v.id, v]));
  const fam = figma._vars.find((v) => v.variableCollectionId === t.id && v.name === 'brand/font-family/heading');
  expect(fam && fam.valuesByMode[mode('ember')] === 'Playfair Display' && fam.valuesByMode[mode('ember dark')] === 'Playfair Display' && fam.valuesByMode[mode('dark')] !== 'Playfair Display', 'brand/font-family/heading: Playfair Display in ember and ember dark only');
  const h = figma._vars.find((v) => v.name === 'heading/heading-xl/font');
  const hTarget = h && byId.get(Object.values(h.valuesByMode)[0]?.id);
  expect(hTarget && hTarget.variableCollectionId === t.id && hTarget.name.startsWith('brand/'), '"6." heading font aliases a brand/ variable in Theme');
  const density = figma._cols.find((c) => c.name === '7. Density');
  expect(density.modes.length === 3, '"7. Density" untouched (3 modes), found by its old numbered name');
  const extra = s.flatMap((l) => Object.values(l).flatMap((x) => x.extra ?? []));
  expect(extra.length === 0, 'nothing reported as extra (each part ignores the other part)');
  const names2 = figma._vars.filter((v) => v.variableCollectionId === t.id).map((v) => v.name);
  expect(names2.filter((n) => n.startsWith('bg/chart/')).length === 7 && !names2.some((n) => /^bg\/chart-\d/.test(n)), 'Theme has exactly seven bg/chart/… and no bg/chart-0N');
  const after = await Promise.all(parts.map((x) => run(figma, `check-${x}.js`)));
  expect(after.every((r) => r.ok), 'check after sync: ok in all three parts');
  expect(Object.keys(before[1].effects ?? {}).length === Object.keys(P.effects).length && !before[0].effects, 'check before sync: every Elevation style differs (reported in the non-brand part)');
  expect(s[1].effects?.updated.length === Object.keys(P.effects).length && !s[0].effects && !s[2].effects, 'sync rebuilds the Elevation styles, only in the non-brand part of Theme');
  const md = figma._styles.find((x) => x.name === 'Elevation/md');
  const mdVars = md.effects.map((e) => byIdOf(figma, e.boundVariables?.color?.id)?.name);
  expect(md.effects.length === P.effects['Elevation/md'].length && mdVars.every((n, i) => n === `elevation/md/layer-${i + 1}`), 'Elevation/md: each layer bound to elevation/md/layer-N');
  const l2 = figma._vars.find((v) => v.name === 'elevation/md/layer-2');
  expect(l2 && l2.scopes.join() === 'EFFECT_COLOR', 'new shadow variables are scoped to effect colour');
  const tt = figma._vars.find((v) => v.name === 'brand/theme-text/drawer-description/size');
  expect(tt && tt.scopes.join() === 'FONT_SIZE,LINE_HEIGHT', 'brand/theme-text variables are scoped to font size and line height');
  // Density and brand do not meet: no brand/ variable aliases "7.".
  const touchesDensity = figma._vars.filter((v) => v.name.startsWith('brand/')).some((v) => Object.values(v.valuesByMode).some((x) => x?.type === 'VARIABLE_ALIAS' && byId.get(x.id).variableCollectionId === density.id));
  expect(!touchesDensity, 'no brand/ value aliases "7. Density"');
}
{ // 2. limit below 8: sync stops before writing anything
  const figma = await seeded(4);
  const snapshot = JSON.stringify(figma._vars.map((v) => [v.name, v.valuesByMode])) + figma._cols.map((c) => c.name + c.modes.length).join();
  let err = null; try { await run(figma, 'sync-2-brand.js'); } catch (e) { err = e.message; }
  expect(err && /fewer than 8 modes/.test(err), 'mode limit 4: sync refuses with a clear error');
  const after = JSON.stringify(figma._vars.map((v) => [v.name, v.valuesByMode])) + figma._cols.map((c) => c.name + c.modes.length).join();
  expect(after === snapshot, 'mode limit 4: file unchanged, probe collection removed');
}
process.exit(failed ? 1 : 0);
