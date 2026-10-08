// Shared helpers for the Figma plugin-API scripts in this folder. Not run on
// its own: scripts/figma-run.mjs concatenates PAYLOAD + this file + an action
// (check.js / sync.js) into one script for the Figma MCP `use_figma` tool.
const slug = (s) => s.split('/').map((p) => p.trim().toLowerCase().replace(/,/g, '-').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '')).filter(Boolean).join('/');
const hex = (c) => { const h = (x) => Math.round(x * 255).toString(16).padStart(2, '0'); return '#' + h(c.r) + h(c.g) + h(c.b) + (c.a !== undefined && c.a < 0.999 ? h(c.a) : ''); };
const parseHex = (s) => { const n = s.replace('#', ''); const p = (i) => parseInt(n.slice(i, i + 2), 16) / 255; return { r: p(0), g: p(2), b: p(4), a: n.length > 6 ? p(6) : 1 }; };
const sameHex = (a, b) => { const x = parseHex(a), y = parseHex(b); return ['r', 'g', 'b', 'a'].every((k) => Math.abs(x[k] - y[k]) < 1.5 / 255); };

async function loadState() {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const vars = await figma.variables.getLocalVariablesAsync();
  const byId = new Map(vars.map((v) => [v.id, v]));
  const C = {};
  for (const key of Object.keys(PAYLOAD.collections)) {
    const col = cols.find((c) => c.name.startsWith(key));
    if (!col) throw new Error('No Figma collection starting with ' + key);
    const live = vars.filter((v) => v.variableCollectionId === col.id && !v.name.startsWith('_legacy'));
    C[key] = { col, bySlug: new Map(live.map((v) => [slug(v.name), v])), live };
  }
  return { C, byId };
}
// Which collection an alias in collection `key` points into.
const aliasTarget = (key, ref) => {
  if (ref.startsWith('@size:')) return ['3.', ref.slice(6)];
  if (ref.startsWith('@typo:')) return ['5.', ref.slice(6)];
  return [PAYLOAD.collections[key].aliasTo, ref.slice(1)];
};
const modeIds = (col, modes) => modes.map((m) => [m, m === '*' ? col.modes[0].modeId : (col.modes.find((x) => x.name === m) || {}).modeId]);
const want = (spec, m) => (typeof spec === 'object' && spec !== null && !Array.isArray(spec) ? spec[m] : spec);

// Describe a Figma value the same way the payload does, for comparison.
function describe(val, byId) {
  if (val && val.type === 'VARIABLE_ALIAS') { const t = byId.get(val.id); return t ? '@' + slug(t.name) : '@(broken)'; }
  if (val && typeof val === 'object' && 'r' in val) return hex(val);
  return val;
}
function equal(have, wantV) {
  if (typeof wantV === 'string' && wantV.startsWith('@')) return typeof have === 'string' && have === '@' + slug(wantV.replace(/^@(size:|typo:)?/, ''));
  if (typeof wantV === 'string' && wantV.startsWith('#')) return typeof have === 'string' && have.startsWith('#') && sameHex(have, wantV);
  if (typeof wantV === 'number') return typeof have === 'number' && Math.abs(have - wantV) < 0.001;
  return String(have) === String(wantV);
}
function cssName(key, name) {
  const dash = name.replace(/\//g, '-');
  if (key === '1.') { const m = name.match(/^(white|black)-a\/(.+)$/); return m ? '--' + m[2] : '--color-' + dash; }
  if (key === '2.') {
    if (name.startsWith('bg/chart/')) return '--color-bg-' + name.split('/')[2];
    if (name.startsWith('bg/primary/primary-on-primary')) return '--color-bg-' + name.split('/')[2];
    return '--color-' + dash;
  }
  if (key === '3.' || key === '4.') return '--size-' + dash;
  return '--typography-' + dash;
}
