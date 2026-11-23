'use client';

import { useEffect, useRef, useState } from 'react';
import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import { useReducedMotion } from '../../ui/use-in-view';

export interface ArcStageProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** The pictures, one shown at a time (a dish per stage, a screen per step). Give each its alt text. */
  items: ReactNode[];
  /** The shown item. Controlled with onIndexChange; otherwise ArcStage keeps its own. */
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  /**
   * Move to the next item every so many ms (PlateCovery: 7000). 0 = only
   * when `index` changes. Stops while `paused`, while the tab is hidden,
   * and with reduced motion.
   */
  autoplay?: number;
  /** Stop the autoplay; wire it to the page's visible pause (WCAG 2.2.2). */
  paused?: boolean;
  /** The corner the arc turns around. Default 'bottom-end'. */
  corner?: 'bottom-end' | 'bottom-start';
  /** The arc's radius, % of the stage width. Default 62. */
  radius?: number;
  /** The item's size, % of the stage width. Default 58. */
  itemSize?: number;
  /** Where the shown item rests on the quarter arc, degrees from the corner's side (0) to its top (90). Default 45. */
  restAngle?: number;
  /** How far one step travels along the arc. Default 70: the next item comes in past the top, the last one leaves past the side. */
  step?: number;
  /** How far the item turns on its own per step, counterclockwise. Default 120. */
  spin?: number;
  /** The item's own turn at rest. Default -60. */
  restSpin?: number;
  /** The stage's shape, as CSS aspect-ratio. Default '1 / 1'. */
  ratio?: string;
  /** Names the stage for screen readers ("Dishes by stage"). */
  label: string;
}

/**
 * One picture at a time on an invisible quarter arc around a corner: the
 * next comes in from the top, turns as it travels, and settles at rest
 * while the last one leaves past the side. A calm, long move
 * (--transition-duration-journey, --ease-travel). Drive it with Tabs chips
 * (stages) or its own autoplay; with reduced motion the pictures cross-fade
 * in place and nothing changes by itself.
 *
 * Sizes are % of the stage's own width, so it fits any column.
 */
export function ArcStage({
  items,
  index: indexProp,
  defaultIndex = 0,
  onIndexChange,
  autoplay = 0,
  paused = false,
  corner = 'bottom-end',
  radius = 62,
  itemSize = 58,
  restAngle = 45,
  step = 70,
  spin = 120,
  restSpin = -60,
  ratio = '1 / 1',
  label,
  className,
  style,
  ...props
}: ArcStageProps) {
  const n = items.length;
  const [own, setOwn] = useState(defaultIndex);
  const index = (((indexProp ?? own) % n) + n) % n;
  const reduced = useReducedMotion();
  const go = (next: number) => {
    const i = ((next % n) + n) % n;
    if (indexProp === undefined) setOwn(i);
    onIndexChange?.(i);
  };

  // Autoplay: paused, hidden tab and reduced motion all stop it.
  const indexRef = useRef(index);
  indexRef.current = index;
  const goRef = useRef(go);
  goRef.current = go;
  useEffect(() => {
    if (!autoplay || paused || reduced || n < 2) return;
    let id = 0;
    const start = () => {
      window.clearInterval(id);
      if (document.visibilityState === 'visible') id = window.setInterval(() => goRef.current(indexRef.current + 1), autoplay);
    };
    start();
    document.addEventListener('visibilitychange', start);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', start);
    };
  }, [autoplay, paused, reduced, n]);
  // An item whose place jumps by more than one step (the wrap from the end
  // back to the start) moves there unseen, without a transition.
  const offsets = items.map((_, i) => {
    let o = i - index;
    if (o > n / 2) o -= n;
    if (o < -n / 2) o += n;
    return o;
  });
  const previous = useRef(offsets);
  const jumps = offsets.map((o, i) => Math.abs(o - (previous.current[i] ?? o)) > 1);
  useEffect(() => {
    previous.current = offsets;
  });

  const mirror = corner === 'bottom-start' ? -1 : 1;

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      data-slot="arc-stage"
      className={cn('@container relative w-full overflow-hidden', className)}
      style={{ aspectRatio: ratio, ...style }}
      {...props}
    >
      {items.map((item, i) => {
        const o = offsets[i];
        const shown = o === 0;
        // Angle on the arc: the shown item at rest, the next one step past the
        // top (+), the last one step past the side (−); farther ones wait there.
        const angle = restAngle - Math.max(-1, Math.min(1, o)) * -step;
        return (
          <div
            key={i}
            aria-hidden={!shown}
            // The arm: from the corner, turned to the item's angle.
            className={cn(
              'absolute bottom-0 size-0',
              mirror === 1 ? 'right-0' : 'left-0',
              !jumps[i] && 'transition-[transform,opacity] duration-journey ease-travel',
              'motion-reduce:transition-opacity motion-reduce:duration-slower',
            )}
            style={
              {
                transform: reduced ? `rotate(${mirror * restAngle}deg)` : `rotate(${mirror * angle}deg)`,
                opacity: shown ? 1 : 0,
                zIndex: shown ? 1 : 0,
              } as CSSProperties
            }
          >
            <div
              className={cn(
                'absolute top-0 -translate-y-1/2 [&>img]:block [&>img]:size-full [&>img]:object-contain',
                !jumps[i] && 'transition-transform duration-journey ease-travel',
              )}
              style={{
                width: `${itemSize}cqw`,
                height: `${itemSize}cqw`,
                // Out along the arm (toward the corner's side), then turned on its own:
                // counter the arm's turn, add the rest turn and the travel spin.
                [mirror === 1 ? 'right' : 'left']: `calc(${radius}cqw - ${itemSize / 2}cqw)`,
                transform: `rotate(${mirror * (-(reduced ? restAngle : angle) + restSpin + (reduced ? 0 : ((angle - restAngle) / step) * spin))}deg)`,
              }}
            >
              {item}
            </div>
          </div>
        );
      })}
    </div>
  );
}
