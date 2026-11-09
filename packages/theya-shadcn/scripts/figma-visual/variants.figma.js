// Figma side of `figma-visual-diff.mjs --figma-dir` (no REST token): the
// variants of the given sets with their first visible text, in the shape the
// diff script reads as variants.json. Set IDS (from sets.txt), paste into the
// Figma MCP use_figma tool on the Theya file and save the returned `json`.
// Each variant also reports its size: render it with get_screenshot
// (contentsOnly, maxDimension = 2 × the longer side) as <id with "-">.png.
const IDS = ['32667:219', '32597:1139', '32666:3', '32666:95', '32597:15565', '32666:233', '32594:15207', '32666:97', '32666:110', '32666:157', '32590:16137', '32599:15885', '32582:997', '32664:224'];
const firstText = (n) => {
  if (n.visible === false) return null;
  if (n.type === 'TEXT' && n.characters.trim()) return n.characters;
  for (const c of n.children ?? []) {
    const t = firstText(c);
    if (t) return t;
  }
  return null;
};
const out = {};
for (const id of IDS) {
  const n = await figma.getNodeByIdAsync(id);
  if (!n) continue;
  const kids = n.type === 'COMPONENT_SET' ? n.children.filter((c) => c.type === 'COMPONENT') : [];
  out[id] = {
    type: n.type,
    id: n.id,
    text: n.type === 'COMPONENT' ? firstText(n) : null,
    size: n.type === 'COMPONENT' ? [n.width, n.height] : null,
    children: kids.map((c) => ({ id: c.id, name: c.name, type: c.type, text: firstText(c), size: [c.width, c.height] })),
  };
}
return { json: JSON.stringify(out) };
