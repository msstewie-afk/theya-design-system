/**
 * Story helper: which letters of a headline an overlay (Sticker, Stamp)
 * actually hides. For every letter it takes the ink box of the glyph (canvas
 * measureText in the same font, so the empty line space above the capitals
 * does not count), samples a grid of points inside it and asks the browser
 * what is on top there: tilt, rounded corners and the theme's font all count.
 *
 * LANDING rule: an overlay may hide part of one letter, never two.
 */
export interface CoveredLetter {
  char: string;
  /** Share of the letter box under the overlay, 0…1. */
  share: number;
}

export function coveredLetters(text: Element, overlay: Element, grid = 8): CoveredLetter[] {
  const out: CoveredLetter[] = [];
  const doc = text.ownerDocument;
  const ctx = doc.createElement('canvas').getContext('2d')!;
  const walker = doc.createTreeWalker(text, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const cs = getComputedStyle(node.parentElement ?? text);
    ctx.font = cs.font;
    const raw = node.textContent ?? '';
    const value = cs.textTransform === 'uppercase' ? raw.toUpperCase() : raw;
    for (let i = 0; i < value.length; i++) {
      if (!value[i].trim()) continue;
      const range = doc.createRange();
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const rect = range.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      // Ink box of the glyph, from its baseline.
      const m = ctx.measureText(value[i]);
      const baseline = rect.top + m.fontBoundingBoxAscent;
      const left = rect.left - m.actualBoundingBoxLeft;
      const top = baseline - m.actualBoundingBoxAscent;
      const box = { left, top, width: m.actualBoundingBoxRight + m.actualBoundingBoxLeft, height: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent };
      if (box.width <= 0 || box.height <= 0) continue;
      let hit = 0;
      for (let gx = 0; gx < grid; gx++) {
        for (let gy = 0; gy < grid; gy++) {
          const x = box.left + ((gx + 0.5) * box.width) / grid;
          const y = box.top + ((gy + 0.5) * box.height) / grid;
          const top = doc.elementFromPoint(x, y);
          if (top && overlay.contains(top)) hit++;
        }
      }
      if (hit) out.push({ char: value[i], share: hit / (grid * grid) });
    }
  }
  return out;
}
