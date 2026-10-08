'use client';

import { Children, useEffect, useRef, useState } from 'react';
import { NavArrowLeft, NavArrowRight, Pause, Play } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';
import { Button } from './button';
import { useMediaQuery } from './use-media-query';

/**
 * Motion: a showcase carousel that moves its cards along a circle.
 *
 * - `drum` — the cards stand round a cylinder that turns on its vertical
 *   axis; the neighbours are seen in perspective at the sides.
 * - `wheel` — the cards sit on the rim of a large wheel off to the start
 *   side and roll past vertically, like a deck fanned along an arc.
 *
 * Previous / Next buttons, arrow keys while it has focus, and a drag or
 * swipe all turn it one card. `autoplay` turns it on a timer, pauses on
 * hover and focus, and adds a Pause button (WCAG 2.2.2). Only the current
 * card is exposed to assistive tech. prefers-reduced-motion: no turning
 * animation and no autoplay.
 */
export interface OrbitCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: 'drum' | 'wheel';
  /** Card width in px (drum) or the card box width (wheel). Default 240. */
  itemWidth?: number;
  /** Turn on its own every `autoplay` ms. Off by default. */
  autoplay?: number;
  /** Called with the index of the card that comes to the front. */
  onIndexChange?: (index: number) => void;
}

export function OrbitCarousel({ shape = 'drum', itemWidth = 240, autoplay, onIndexChange, className, children, onKeyDown, ...props }: OrbitCarouselProps) {
  const { t } = useTheyaI18n();
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const items = Children.toArray(children);
  const n = items.length;
  // `turn` keeps counting past n so the drum always takes the short way round.
  const [turn, setTurn] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hold, setHold] = useState(false);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const index = ((turn % n) + n) % n;

  const go = (step: number) => {
    setTurn((v) => v + step);
  };
  useEffect(() => {
    if (n) onIndexChange?.(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const running = !!autoplay && !reduced && !paused && !hold && n > 1;
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => go(1), autoplay);
    return () => window.clearTimeout(id);
  }, [running, turn, autoplay]);

  if (!n) return null;

  const vertical = shape === 'wheel';
  const transition = reduced ? '' : 'transition-[transform,opacity] duration-slower ease-glide motion-reduce:transition-none';

  return (
    <div
      data-slot="orbit-carousel"
      data-shape={shape}
      role="group"
      aria-roledescription="carousel"
      tabIndex={0}
      onPointerEnter={() => setHold(true)}
      onPointerLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setHold(false)}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
        const back = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
        const fwd = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
        if (e.key === back) (e.preventDefault(), go(-1));
        if (e.key === fwd) (e.preventDefault(), go(1));
      }}
      className={cn('flex flex-col items-center gap-5 rounded-[var(--size-border-radius-border-radius-2xl)] outline-none focus-visible:focus-ring', className)}
      {...props}
    >
      <div
        className={cn('relative w-full touch-pan-y select-none overflow-hidden', vertical ? 'h-[28rem] touch-pan-x' : 'h-80')}
        style={{ perspective: vertical ? undefined : '1100px' }}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          const s = drag.current;
          drag.current = null;
          if (!s) return;
          const d = vertical ? e.clientY - s.y : e.clientX - s.x;
          if (Math.abs(d) > 40) go(d < 0 ? 1 : -1);
        }}
        onPointerCancel={() => (drag.current = null)}
      >
        {shape === 'drum' ? (
          <Drum items={items} turn={turn} index={index} itemWidth={itemWidth} transition={transition} />
        ) : (
          <Wheel items={items} turn={turn} index={index} itemWidth={itemWidth} transition={transition} />
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button appearance="outlined" tone="secondary" size="md" iconOnly aria-label={t.carousel.previous} leftIcon={<NavArrowLeft className={cn(vertical ? 'rotate-90' : 'rtl:-scale-x-100')} />} onClick={() => go(-1)} />
        {!!autoplay && !reduced && (
          <Button
            appearance="ghost"
            tone="neutral"
            size="md"
            iconOnly
            aria-label={paused ? t.cardDeck.play : t.cardDeck.pause}
            aria-pressed={paused}
            leftIcon={paused ? <Play /> : <Pause />}
            onClick={() => setPaused((p) => !p)}
          />
        )}
        <Button appearance="outlined" tone="secondary" size="md" iconOnly aria-label={t.carousel.next} leftIcon={<NavArrowRight className={cn(vertical ? 'rotate-90' : 'rtl:-scale-x-100')} />} onClick={() => go(1)} />
      </div>
    </div>
  );
}

interface ShapeProps {
  items: React.ReactNode[];
  turn: number;
  index: number;
  itemWidth: number;
  transition: string;
}

function Drum({ items, turn, index, itemWidth, transition }: ShapeProps) {
  const n = items.length;
  const step = 360 / n;
  // Distance from the axis so neighbouring cards just touch, plus a gap.
  const radius = Math.round((itemWidth / 2 + 12) / Math.tan(Math.PI / n));
  return (
    <div className={cn('absolute left-1/2 top-1/2 [transform-style:preserve-3d]', transition)} style={{ width: itemWidth, transform: `translate(-50%, -50%) translateZ(${-radius}px) rotateY(${-turn * step}deg)` }}>
      {items.map((item, i) => {
        const current = i === index;
        return (
          <div
            key={i}
            data-slot="orbit-carousel-item"
            aria-hidden={current ? undefined : true}
            {...(current ? {} : ({ inert: '' } as object))}
            className={cn('absolute inset-x-0 top-1/2 [backface-visibility:hidden]', transition, !current && 'opacity-80')}
            style={{ transform: `translateY(-50%) rotateY(${i * step}deg) translateZ(${radius}px)` }}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
}

function Wheel({ items, turn, index, itemWidth, transition }: ShapeProps) {
  const n = items.length;
  const step = 16; // degrees between neighbouring cards on the rim
  const radius = 760; // the wheel's centre sits this far to the start side
  return (
    <div className="absolute inset-0">
      {items.map((item, i) => {
        // Shortest signed offset from the current card, so it wraps round.
        let k = (((i - turn) % n) + n) % n;
        if (k > n / 2) k -= n;
        const current = i === index;
        const visible = Math.abs(k) <= 3;
        return (
          <div
            key={i}
            data-slot="orbit-carousel-item"
            aria-hidden={current ? undefined : true}
            {...(current ? {} : ({ inert: '' } as object))}
            className={cn('absolute top-1/2', transition, !visible && 'pointer-events-none')}
            style={{
              width: itemWidth,
              insetInlineStart: `calc(50% - ${itemWidth / 2}px)`,
              transformOrigin: `${-radius + itemWidth / 2}px 50%`,
              transform: `translateY(-50%) rotate(${k * step}deg)`,
              opacity: visible ? 1 - Math.abs(k) * 0.18 : 0,
              zIndex: 10 - Math.abs(k),
            }}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
}
