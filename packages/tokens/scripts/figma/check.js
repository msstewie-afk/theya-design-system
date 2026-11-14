// Read-only: compares the Figma variables with PAYLOAD (built from code) and
// returns what differs. Nothing in the file is changed.
const { C, byId } = await loadState();
const report = {};
// ok is true only when every collection, mode and value matches: a missing
// brand mode or collection is a mismatch, not something to skip quietly.
let ok = true;
for (const [key, spec] of Object.entries(PAYLOAD.collections)) {
  const { col, bySlug } = C[key];
  if (!col) { report[spec.create] = { missingCollection: true, missing: Object.keys(spec.vars).length }; ok = false; continue; }
  const r = { missing: [], diff: [], extra: [], figmaOnly: [] };
  // A mode the payload has and Figma lacks (a new brand): reported once, its values skipped.
  const missingModes = spec.modes.filter((m) => m !== '*' && !col.modes.some((x) => x.name === m));
  const allowed = new Set((PAYLOAD.figmaOnly?.[key] ?? []).map(slug));
  for (const [name, val] of Object.entries(spec.vars)) {
    const v = bySlug.get(slug(name));
    if (!v) { r.missing.push(name); continue; }
    for (const [m, id] of modeIds(col, spec.modes)) {
      if (!id) continue;
      const w = want(val, m); const h = describe(v.valuesByMode[id], byId);
      if (!equal(h, w)) r.diff.push(`${name} [${m}] figma=${h} code=${w}`);
    }
  }
  const codeSlugs = new Set(Object.keys(spec.vars).map(slug));
  for (const [s, v] of bySlug) if (!codeSlugs.has(s)) (allowed.has(s) ? r.figmaOnly : r.extra).push(v.name);
  if (missingModes.length || r.missing.length || r.diff.length) ok = false;
  report[col.name] = { missingModes, missing: r.missing.length, diff: r.diff.length, extra: r.extra.length, figmaOnly: r.figmaOnly, details: { missing: r.missing.slice(0, 40), diff: r.diff.slice(0, 40), extra: r.extra.slice(0, 40) } };
}
// Effect styles bound to the shadow layer variables (only in the part with "2.").
if (PAYLOAD.effects) {
  const styles = await figma.getLocalEffectStylesAsync();
  const fx = {};
  for (const [name, layers] of Object.entries(PAYLOAD.effects)) {
    const st = styles.find((s) => s.name === name);
    const d = st ? effectDiff(st, layers, C) : ['missing'];
    if (d.length) { fx[name] = d.slice(0, 10); ok = false; }
  }
  report.effects = fx;
}
return { ok, ...report };
