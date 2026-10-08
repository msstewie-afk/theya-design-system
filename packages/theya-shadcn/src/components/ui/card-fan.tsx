'use client';

import { Children, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

/**
 * Motion: a small stack of cards that fans out on hover or keyboard focus,
 * and the card under the pointer (or focus) lifts to the front — profile
 * cards, a team, a set of plans in a hero.
 *
 * Every card stays in the tab order and the accessibility tree; the fan
 * only changes how they're laid out. On touch, a tap on the stack opens the
 * fan. prefers-reduced-motion: the fan opens without animation.
 */
export interface CardFanProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Rotation between neighbouring cards when open, degrees (default 8). */
  spread?: number;
  /** Horizontal distance between neighbouring cards when open, px (default 88). Tightened automatically when the container is too narrow for it. */
  offset?: number;
}

export function CardFan({ spread = 8, offset = 88, className, children, onPointerEnter, onPointerLeave, onFocus, onBlur, onClick, ...props }: CardFanProps) {
  const cards = Children.toArray(children);
  const n = cards.length;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const mid = (n - 1) / 2;
  // Narrow containers (phones) get a tighter spread so the open fan fits.
  const rootRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(offset);
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || n < 2 || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      const item = root.querySelector<HTMLElement>('[data-slot=card-fan-item]');
      if (!item) return;
      // Outer card: its offset, half its width, and how far its top swings out.
      const swing = item.offsetHeight * Math.sin((mid * spread * Math.PI) / 180);
      const room = (root.clientWidth / 2 - item.offsetWidth / 2 - swing) / mid;
      setFit(Math.max(0, Math.min(offset, Math.floor(room))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, [n, mid, offset, spread]);

  return (
    <div
      ref={rootRef}
      data-slot="card-fan"
      data-open={open || undefined}
      className={cn('relative grid w-full place-items-center py-6 [grid-template-areas:"fan"]', className)}
      onPointerEnter={(e) => (onPointerEnter?.(e), e.pointerType === 'mouse' && setOpen(true))}
      onPointerLeave={(e) => (onPointerLeave?.(e), setOpen(false), setActive(null))}
      onClick={(e) => (onClick?.(e), setOpen(true))}
      onFocus={(e) => (onFocus?.(e), setOpen(true))}
      onBlur={(e) => {
        onBlur?.(e);
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) (setOpen(false), setActive(null));
      }}
      {...props}
    >
      {cards.map((card, i) => {
        const d = i - mid;
        const isActive = active === i;
        const transform = open
          ? `translateX(${d * fit}px) translateY(${Math.abs(d) * 6 - (isActive ? 16 : 0)}px) rotate(${d * spread}deg)`
          : `translateY(${-i * 2}px) rotate(${d * 2}deg)`;
        return (
          <div
            key={i}
            data-slot="card-fan-item"
            onPointerEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            className="[grid-area:fan] origin-bottom transition-transform duration-slow ease-spring motion-reduce:transition-none"
            style={{ transform, zIndex: isActive ? n + 1 : i, transitionDelay: open ? `${Math.abs(d) * 30}ms` : '0ms' }}
          >
            {card}
          </div>
        );
      })}
    </div>
  );
}
