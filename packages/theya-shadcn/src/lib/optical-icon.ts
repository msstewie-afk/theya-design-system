'use client';

import { useEffect, useLayoutEffect, type DependencyList, type RefObject } from 'react';

// Optical alignment for an icon at the start or end of a label (T9,
// 2026-11-09). A chevron like iconoir's NavArrowRight is drawn 6px wide in
// the middle of a 24px box, so 9px of the box on the outer side is empty and
// the button's padding looks 9px wider on that side than on the label's.
// We measure the drawing (getBBox, plus half the stroke, which getBBox leaves
// out) and pull the icon toward the edge by the empty part of its outer side,
// with a negative inline margin. Measured, not a fixed fraction: ArrowRight
// has 3px of air, NavArrowRight 9px, Plus 5px.

const useBrowserLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Empty space (px, as rendered) on one side of the drawing inside an
 * element's svg: `left` or `right` in the svg's own (physical) coordinates.
 * 0 when there is no svg or it can't be measured (not rendered, jsdom).
 */
export function svgEmptySide(el: Element, side: 'left' | 'right'): number {
  const svg = el instanceof SVGSVGElement ? el : el.querySelector('svg');
  if (!svg || typeof svg.getBBox !== 'function') return 0;
  let box: DOMRect;
  try {
    box = svg.getBBox();
  } catch {
    return 0;
  }
  const rect = svg.getBoundingClientRect();
  const vb = svg.viewBox?.baseVal;
  const vbX = vb && vb.width ? vb.x : 0;
  const vbWidth = vb && vb.width ? vb.width : rect.width;
  if (!box.width || !vbWidth || !rect.width) return 0;
  const scale = rect.width / vbWidth;
  // Half the stroke of the widest stroked shape (stroke-width is in user units).
  let halfStroke = 0;
  svg.querySelectorAll('path, line, polyline, polygon, circle, ellipse, rect').forEach((shape) => {
    const cs = getComputedStyle(shape);
    if (cs.stroke && cs.stroke !== 'none') halfStroke = Math.max(halfStroke, (parseFloat(cs.strokeWidth) || 0) / 2);
  });
  const empty = side === 'left' ? box.x - vbX - halfStroke : vbX + vbWidth - (box.x + box.width) - halfStroke;
  return Math.max(0, Math.round(empty * scale * 2) / 2);
}

/**
 * Pulls the first / last child of `contentRef` toward the outer edge by the
 * empty space of the icon drawn in it. `start` / `end` say which ends hold an
 * icon. Off (and any margin it set removed) when `enabled` is false.
 */
export function useOpticalIcons(
  contentRef: RefObject<HTMLElement | null>,
  { enabled, start, end }: { enabled: boolean; start: boolean; end: boolean },
  deps: DependencyList,
) {
  useBrowserLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const first = content.firstElementChild as HTMLElement | null;
    const last = content.lastElementChild as HTMLElement | null;
    const touched: HTMLElement[] = [];
    if (enabled) {
      const rtl = getComputedStyle(content).direction === 'rtl';
      // The start icon's outer side is its left in LTR, its right in RTL.
      if (start && first) {
        const px = svgEmptySide(first, rtl ? 'right' : 'left');
        if (px) {
          first.style.marginInlineStart = `-${px}px`;
          touched.push(first);
        }
      }
      if (end && last && last !== first) {
        const px = svgEmptySide(last, rtl ? 'left' : 'right');
        if (px) {
          last.style.marginInlineEnd = `-${px}px`;
          touched.push(last);
        }
      }
    }
    return () => {
      for (const el of touched) {
        el.style.marginInlineStart = '';
        el.style.marginInlineEnd = '';
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, start, end, ...deps]);
}
