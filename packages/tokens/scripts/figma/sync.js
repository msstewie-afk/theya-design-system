// Writes code values into the Figma variables: updates differing values,
// creates missing variables (in the existing group spelling, e.g. "size control/…"),
// sets WEB code syntax. Never deletes — Figma-only variables are reported.
const { C, byId } = await loadState();
const log = {};
const groupSpelling = (key) => { const m = new Map(); for (const v of C[key].live) { const parts = v.name.split('/'); for (let i = 1; i < parts.length; i++) m.set(slug(parts.slice(0, i).join('/')), parts.slice(0, i).join('/')); } return m; };
for (const [key, spec] of Object.entries(PAYLOAD.collections)) {
  const { col, bySlug } = C[key]; const groups = groupSpelling(key);
  const l = { created: [], updated: 0, extra: [] };
  for (const [name, val] of Object.entries(spec.vars)) {
    let v = bySlug.get(slug(name));
    const sample = want(val, spec.modes[0] === '*' ? '*' : spec.modes[0]);
    if (!v) {
      const parts = name.split('/'); const g = groups.get(slug(parts.slice(0, -1).join('/')));
      const figmaName = g ? g + '/' + parts[parts.length - 1] : name;
      let type = spec.kind;
      if (type === 'MIXED') {
        if (typeof sample === 'number') type = 'FLOAT';
        else if (typeof sample === 'string' && sample.startsWith('@')) { const [tk, tp] = aliasTarget(key, sample); type = C[tk].bySlug.get(slug(tp)).resolvedType; }
        else type = 'STRING';
      }
      v = figma.variables.createVariable(figmaName, col, type);
      const sib = C[key].live.find((x) => slug(x.name).startsWith(slug(parts.slice(0, -1).join('/')) + '/'));
      v.scopes = sib ? sib.scopes : [];
      bySlug.set(slug(name), v); l.created.push(figmaName);
    }
    for (const [m, id] of modeIds(col, spec.modes)) {
      const w = want(val, m); if (equal(describe(v.valuesByMode[id], byId), w)) continue;
      let next;
      if (typeof w === 'string' && w.startsWith('@')) { const [tk, tp] = aliasTarget(key, w); const t = C[tk].bySlug.get(slug(tp)); if (!t) throw new Error(`${name}: alias target ${tp} missing in ${tk}`); next = figma.variables.createVariableAlias(t); }
      else if (typeof w === 'string' && w.startsWith('#')) next = parseHex(w);
      else next = w;
      v.setValueForMode(id, next); l.updated++;
    }
    v.setVariableCodeSyntax('WEB', `var(${cssName(key, name)})`);
  }
  const codeSlugs = new Set(Object.keys(spec.vars).map(slug));
  for (const [s, v] of bySlug) if (!codeSlugs.has(s)) l.extra.push(v.name);
  log[col.name] = l;
}
return log;
