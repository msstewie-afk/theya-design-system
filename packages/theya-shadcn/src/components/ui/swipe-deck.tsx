'use client';

import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Check, Xmark } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';
import { Button } from './button';
import { useMediaQuery } from './use-media-query';

/**
 * Motion: a stack of cards you swipe away one at a time (Tinder-style).
 * Drag the top card sideways — it follows the pointer and tilts, the card
 * under it rises as you drag; past a third of the width (or a fast flick)
 * it flies out, otherwise it springs back.
 *
 * Swiping is never the only way: the Skip / Keep buttons and the arrow
 * keys (← skip, → keep, while the deck has focus) do the same thing.
 * Only the top card is exposed to assistive tech; the remaining count is
 * announced after each swipe. prefers-reduced-motion: no fly-out or
 * spring, the next card just appears.
 */
export type SwipeDirection = 'left' | 'right';

export interface SwipeDeckProps<T> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  items: T[];
  getKey: (item: T) => string;
  renderCard: (item: T) => ReactNode;
  /** Called when a card leaves: `left` = skip, `right` = keep. */
  onSwipe?: (item: T, direction: SwipeDirection) => void;
  /** Shown when every card has been swiped. */
  empty?: ReactNode;
  /** Cards visible in the stack behind the top one (default 2). */
  depth?: number;
  /** Button labels; default from the locale (Skip / Keep). */
  skipLabel?: string;
  keepLabel?: string;
  /** Hide the Skip / Keep buttons (keep the arrow keys). Only when the page offers another non-drag way to decide. */
  hideButtons?: boolean;
}

const FLY_MS = 280;

export function SwipeDeck<T>({
  items,
  getKey,
  renderCard,
  onSwipe,
  empty,
  depth = 2,
  skipLabel,
  keepLabel,
  hideButtons = false,
  className,
  onKeyDown,
  ...props
}: SwipeDeckProps<T>) {
  const { t } = useTheyaI18n();
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const [leaving, setLeaving] = useState<SwipeDirection | null>(null);
  const [announce, setAnnounce] = useState('');
  const start = useRef<{ x: number; y: number; t: number; w: number } | null>(null);

  const rest = items.slice(index);
  const top = rest[0];

  const decide = (dir: SwipeDirection) => {
    if (!top || leaving) return;
    const finish = () => {
      onSwipe?.(top, dir);
      setIndex((i) => i + 1);
      setLeaving(null);
      setDrag({ x: 0, y: 0, active: false });
      const left = rest.length - 1;
      setAnnounce(`${dir === 'right' ? (keepLabel ?? t.cardDeck.keep) : (skipLabel ?? t.cardDeck.skip)}. ${t.cardDeck.remaining(left)}`);
    };
    if (reduced) return finish();
    setLeaving(dir);
    window.setTimeout(finish, FLY_MS);
  };

  const down = (e: React.PointerEvent<HTMLDivElement>) => {
    if (leaving || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY, t: performance.now(), w: e.currentTarget.offsetWidth };
    setDrag({ x: 0, y: 0, active: true });
  };
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    setDrag({ x: e.clientX - start.current.x, y: (e.clientY - start.current.y) * 0.3, active: true });
  };
  const up = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const velocity = Math.abs(dx) / Math.max(1, performance.now() - s.t); // px/ms
    if (Math.abs(dx) > s.w / 3 || (velocity > 0.6 && Math.abs(dx) > 24)) decide(dx > 0 ? 'right' : 'left');
    else setDrag({ x: 0, y: 0, active: false });
  };

  // 0…1: how far the top card has been dragged towards a decision.
  const progress = Math.min(1, Math.abs(drag.x) / 160);

  return (
    <div
      data-slot="swipe-deck"
      role="group"
      aria-roledescription="card deck"
      tabIndex={0}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
        if (e.key === 'ArrowLeft') (e.preventDefault(), decide(rtl ? 'right' : 'left'));
        if (e.key === 'ArrowRight') (e.preventDefault(), decide(rtl ? 'left' : 'right'));
      }}
      className={cn('flex w-full max-w-sm flex-col items-center gap-5 rounded-[var(--size-border-radius-border-radius-2xl)] outline-none focus-visible:focus-ring', className)}
      {...props}
    >
      <div className="relative grid w-full [grid-template-areas:'stack']">
        {rest.length === 0 && <div className="[grid-area:stack]">{empty}</div>}
        {rest
          .slice(0, depth + 1)
          .map((item, i) => {
            const isTop = i === 0;
            // Cards behind sit lower and smaller; they rise as the top card is dragged.
            const lift = isTop ? 0 : Math.max(0, i - progress);
            const transform = isTop
              ? leaving
                ? `translateX(${leaving === 'right' ? 140 : -140}%) rotate(${leaving === 'right' ? 18 : -18}deg)`
                : `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 18}deg)`
              : `translateY(${lift * 10}px) scale(${1 - lift * 0.05})`;
            return (
              <div
                key={getKey(item)}
                data-slot="swipe-deck-card"
                aria-hidden={isTop ? undefined : true}
                // React 18's types don't know `inert`; an empty string sets the attribute.
                {...(isTop ? {} : ({ inert: '' } as object))}
                onPointerDown={isTop ? down : undefined}
                onPointerMove={isTop ? move : undefined}
                onPointerUp={isTop ? up : undefined}
                onPointerCancel={isTop ? up : undefined}
                className={cn(
                  '[grid-area:stack] origin-bottom select-none',
                  isTop ? 'cursor-grab touch-pan-y active:cursor-grabbing' : 'pointer-events-none',
                  // Follow the finger 1:1 while dragging; animate the settle and the fly-out.
                  !drag.active || !isTop ? 'transition-[transform,opacity] duration-slow ease-glide motion-reduce:transition-none' : '',
                  isTop && leaving && 'opacity-0',
                )}
                style={{ transform, zIndex: depth + 1 - i }}
              >
                {renderCard(item)}
              </div>
            );
          })
          .reverse()}
      </div>
      {!hideButtons && (
        <div className="flex items-center gap-3">
          <Button appearance="outlined" tone="neutral" size="xl" leftIcon={<Xmark />} disabled={!top} onClick={() => decide('left')}>
            {skipLabel ?? t.cardDeck.skip}
          </Button>
          <Button appearance="tonal" tone="primary" size="xl" leftIcon={<Check />} disabled={!top} onClick={() => decide('right')}>
            {keepLabel ?? t.cardDeck.keep}
          </Button>
        </div>
      )}
      <span role="status" className="sr-only">
        {announce}
      </span>
    </div>
  );
}
