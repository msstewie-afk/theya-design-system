// Read-only: compares the Figma variables with PAYLOAD (built from code) and
// returns what differs. Nothing in the file is changed.
const { C, byId } = await loadState();
const report = {};
for (const [key, spec] of Object.entries(PAYLOAD.collections)) {
  const { col, bySlug } = C[key];
  const r = { missing: [], diff: [], extra: [] };
  for (const [name, val] of Object.entries(spec.vars)) {
    const v = bySlug.get(slug(name));
    if (!v) { r.missing.push(name); continue; }
    for (const [m, id] of modeIds(col, spec.modes)) {
      const w = want(val, m); const h = describe(v.valuesByMode[id], byId);
      if (!equal(h, w)) r.diff.push(`${name} [${m}] figma=${h} code=${w}`);
    }
  }
  const codeSlugs = new Set(Object.keys(spec.vars).map(slug));
  for (const [s, v] of bySlug) if (!codeSlugs.has(s)) r.extra.push(v.name);
  report[col.name] = { missing: r.missing.length, diff: r.diff.length, extra: r.extra.length, details: { missing: r.missing.slice(0, 40), diff: r.diff.slice(0, 40), extra: r.extra.slice(0, 40) } };
}
return report;
