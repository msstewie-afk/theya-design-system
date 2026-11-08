'use client';

import { Children, useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import { NavArrowLeft, NavArrowRight, Pause, Play } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { inertProps } from '../../lib/inert';
import { useTheyaI18n } from '../../lib/i18n';
import { Button } from './button';
import { useInView } from './use-in-view';
import { useMediaQuery } from './use-media-query';

/**
 * Motion: a showcase carousel that moves its cards along a circle.
 *
 * - `drum` — the cards stand round a cylinder that turns on its vertical
 *   axis; the neighbours are seen in perspective at the sides. With `lean`
 *   it tips toward the viewer; with `center` the cards orbit a word or a
 *   logo, passing behind and in front of it.
 * - `wheel` — the cards sit on the rim of a large wheel off to the start
 *   side and roll past vertically, like a deck fanned along an arc.
 * - `wall` — the viewer stands inside the cylinder: a curved wall of cards,
 *   the middle one in front and the edges swinging in (coverflow).
 * - `fan` — the cards fanned on an arc below the stage, the middle one
 *   upright and in focus; deals itself out the first time it scrolls in.
 * - `rolodex` — the cards turn round a horizontal axis behind them, like a
 *   card file: the next one comes down from the top, tilted back, and the
 *   previous one leaves under the bottom. ↑ / ↓ (↓ turns it down, as the arrow shows).
 * - `stack` — a compact pile: the cards behind step away to the top start
 *   and the bottom end, smaller and dimmer (Compact Stack).
 * - `cascade` — a tilted staircase: the cards step down to the end in
 *   perspective, the front one largest (Tilted Cascade).
 *
 * Drum, wheel, rolodex, stack and cascade wrap round; wall and fan stop at
 * the ends and show dots.
 * Previous / Next, the arrow keys while it has focus, and a drag or swipe
 * (the cards follow the finger) move it; on a fan a click on a side card
 * brings it to the middle. `autoplay` moves it on a timer, pauses on hover
 * and focus, and adds a Pause button (WCAG 2.2.2). Only the card in front is
 * exposed to assistive tech, and its position and name are announced
 * ("2 of 8: Research"). prefers-reduced-motion: no travelling and no
 * autoplay — the same states switch in place.
 */
export type OrbitCarouselShape = 'drum' | 'wheel' | 'wall' | 'fan' | 'rolodex' | 'stack' | 'cascade';

export interface OrbitCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: OrbitCarouselShape;
  /** Card width in px. Default 240 (fan: 352, never wider than 72vw). */
  itemWidth?: number;
  /** Stage height, any CSS length. Default depends on the shape. */
  height?: string;
  /** Drum and wall: tip toward the viewer, degrees (default 0). */
  lean?: number;
  /** Drum only: something in the middle of the drum — a word, a logo — that the cards orbit. */
  center?: ReactNode;
  /** The card in front at first (default: the first; fan: the middle one). */
  defaultIndex?: number;
  /** Move on its own every `autoplay` ms. Off by default. */
  autoplay?: number;
  /** Called with the index of the card that comes to the front. */
  onIndexChange?: (index: number) => void;
}

const mod = (a: number, n: number) => ((a % n) + n) % n;

export function OrbitCarousel({
  shape = 'drum',
  itemWidth,
  height,
  lean = 0,
  center,
  defaultIndex,
  autoplay,
  onIndexChange,
  className,
  children,
  onKeyDown,
  'aria-describedby': describedBy,
  ...props
}: OrbitCarouselProps) {
  const { t } = useTheyaI18n();
  const uid = useId();
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const items = Children.toArray(children);
  const n = items.length;
  const wraps = shape !== 'wall' && shape !== 'fan';
  const vertical = shape === 'wheel' || shape === 'rolodex';
  const width = itemWidth ?? (shape === 'fan' ? 352 : 240);
  const clampTurn = (v: number) => (wraps ? v : Math.min(n - 1, Math.max(0, v)));

  // `turn` keeps counting past n on the wrapping shapes, so they always take the short way round.
  const [turn, setTurn] = useState(() => clampTurn(defaultIndex ?? (shape === 'fan' ? Math.floor(n / 2) : 0)));
  // While dragging: how far the finger has moved, in cards (fractional).
  const [pull, setPull] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hold, setHold] = useState(false);
  const index = mod(turn, n);
  const pos = turn + pull;
  const dragging = pull !== 0;

  const stage = useRef<HTMLDivElement>(null);
  const [cardH, setCardH] = useState(0);
  useEffect(() => {
    const el = stage.current?.querySelector<HTMLElement>('[data-slide="0"]');
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => el.offsetHeight && setCardH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [shape, n]);
  // A drum leans toward the viewer, so its cards sit lower than the stage's middle and the
  // height worked out from the card leaves a band above them. Once it has drawn, measure the
  // cards that show, fit the stage to them (24px above and below) and lift the ring to match.
  const [fit, setFit] = useState<{ h: number; lift: number } | null>(null);
  useEffect(() => {
    setFit(null);
    if (shape !== 'drum' || height || !cardH) return;
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        const st = stage.current;
        if (!st) return;
        const s = st.getBoundingClientRect();
        let top = Infinity;
        let bottom = -Infinity;
        st.querySelectorAll<HTMLElement>('[data-slide]').forEach((el) => {
          if (parseFloat(getComputedStyle(el).opacity) < 0.05) return;
          const r = (el.firstElementChild ?? el).getBoundingClientRect();
          if (!r.height) return;
          top = Math.min(top, r.top);
          bottom = Math.max(bottom, r.bottom);
        });
        const pad = 24;
        // Cards that already spill past the stage: keep the worked-out height.
        if (!Number.isFinite(top) || top - s.top < pad || bottom > s.bottom) return;
        const h = Math.round(bottom - top + 2 * pad);
        // The ring is centred, so a shorter stage already moves it up by half the difference.
        setFit({ h, lift: Math.round(top - s.top + (h - s.height) / 2 - pad) });
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [shape, height, cardH, width, n, lean, center]);
  // The announcement is built from one state — number and heading together —
  // so the live region changes in a single render and never reads a new
  // number with the old heading in between.
  const [spoken, setSpoken] = useState('');
  const shown = useRef(index);
  useEffect(() => {
    if (!n) return;
    onIndexChange?.(index);
    // Nothing to say on load: the region fills only once the reader moves it.
    if (index === shown.current && !spoken) return;
    shown.current = index;
    // The name of the card in front, from its heading.
    const h = stage.current?.querySelector(`[data-slide="${index}"] :is(h2, h3, h4)`);
    setSpoken(t.carousel.position(index + 1, n, h?.textContent?.trim() || undefined));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, n, t]);

  const go = (step: number) => setTurn((v) => clampTurn(v + step));
  const advance = () => setTurn((v) => (wraps ? v + 1 : v >= n - 1 ? 0 : v + 1));

  const running = !!autoplay && !reduced && !paused && !hold && n > 1;
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(advance, autoplay);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, turn, autoplay]);

  // The fan deals itself out the first time it comes into view: the middle
  // card rises from below, then the others open out to its sides.
  const seen = useInView(stage, { threshold: 0.35 });
  const [dealing, setDealing] = useState(true);
  useEffect(() => {
    if (!seen || shape !== 'fan') return;
    const id = window.setTimeout(() => setDealing(false), 1400);
    return () => window.clearTimeout(id);
  }, [seen, shape]);

  // Drag: captured only once the pointer has really moved, so a plain click
  // (on a fan's side card, a link inside a card) still lands where it was aimed.
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const pullRef = useRef(0);
  const swallowClick = useRef(false);
  const perCard = vertical ? 160 : width * 0.85;
  const setPullBoth = (v: number) => ((pullRef.current = v), setPull(v));
  const endDrag = () => {
    const s = drag.current;
    drag.current = null;
    if (!s?.moved) return;
    swallowClick.current = true;
    // Read the pull now: the updater can run after setPullBoth(0) has already zeroed the ref,
    // and the drag would then spring back instead of landing on the next card.
    const step = Math.round(pullRef.current);
    setTurn((v) => clampTurn(v + step));
    setPullBoth(0);
  };
  const dragHandlers = {
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      drag.current = { x: e.clientX, y: e.clientY, moved: false };
    },
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
      const s = drag.current;
      if (!s) return;
      const d = vertical ? e.clientY - s.y : e.clientX - s.x;
      if (!s.moved) {
        if (Math.abs(d) < 6) return;
        s.moved = true;
        e.currentTarget.setPointerCapture(e.pointerId);
      }
      // Vertical shapes (wheel, rolodex) keep their next cards above, so a downward drag brings them in
      // (the cards follow the finger).
      let c = (vertical ? d : -d) / perCard;
      // The ends of a wall or a fan give a little, then stop.
      if (!wraps) c = Math.max(-turn - 0.3, Math.min(n - 1 - turn + 0.3, c));
      setPullBoth(c);
    },
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    onClickCapture: (e: React.MouseEvent) => {
      if (!swallowClick.current) return;
      swallowClick.current = false;
      e.stopPropagation();
      e.preventDefault();
    },
  };

  if (!n) return null;

  const motion = !dragging && !reduced;
  // The stage is as tall as the shape needs for the cards it holds, so there are no wide empty
  // bands above or below them: measured from the first card, with room for what the shape adds.
  const drumRadius = Math.round((width / 2 + 12) / Math.tan(Math.PI / Math.max(n, 3))) + (center ? 72 : 0);
  const extra: Record<OrbitCarouselShape, (h: number) => number> = {
    // The near edges of the side cards come closer in perspective, so they need headroom.
    // Round a word the ring leans toward the viewer: its near and far sides sit above and below
    // the word, ±radius·sin(lean) from the middle, so that span plus a card and a half.
    drum: (h) => (center ? h * 1.5 + 2 * drumRadius * Math.sin((Math.min(lean, 40) * Math.PI) / 180) + 64 : h * (1.25 + Math.min(lean, 40) / 60) + 48),
    wheel: (h) => h * 2.4,
    wall: (h) => h * 1.2 + 32,
    fan: (h) => h * 1.08 + 72,
    rolodex: (h) => h * 2.1,
    stack: (h) => h + 2 * 3 * 22 + 24,
    cascade: (h) => h + 2 * 3 * 44 + 24,
  };
  const stageHeight = height ?? (fit ? `${fit.h}px` : cardH ? `${Math.round(extra[shape](cardH))}px` : '20rem');
  const slide = (i: number) => {
    const front = i === index;
    return {
      role: 'group',
      'aria-roledescription': 'slide',
      'aria-label': t.carousel.position(i + 1, n),
      'data-slide': i,
      'data-slot': 'orbit-carousel-item',
      'aria-hidden': front ? undefined : true,
      ...inertProps(!front),
    } as const;
  };
  const shapeProps = { items, pos, index, width, lean, motion, slide };

  return (
    <div
      data-slot="orbit-carousel"
      data-shape={shape}
      role="group"
      aria-roledescription="carousel"
      aria-describedby={cn(`${uid}-hint`, describedBy)}
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
      className={cn('flex w-full flex-col items-center gap-5 rounded-[var(--size-border-radius-border-radius-2xl)] outline-none focus-visible:focus-ring', className)}
      {...props}
    >
      <div
        ref={stage}
        className={cn('relative w-full select-none overflow-hidden', vertical ? 'touch-pan-x' : 'touch-pan-y', dragging ? 'cursor-grabbing' : 'cursor-grab')}
        style={{ height: stageHeight, perspective: shape === 'drum' ? (center ? '1400px' : '1100px') : shape === 'wall' ? '900px' : shape === 'rolodex' || shape === 'cascade' ? '1200px' : undefined } as CSSProperties}
        {...dragHandlers}
      >
        {shape === 'drum' && <Drum {...shapeProps} center={center} lift={fit?.lift ?? 0} />}
        {shape === 'wheel' && <Wheel {...shapeProps} />}
        {shape === 'wall' && <Wall {...shapeProps} />}
        {shape === 'fan' && <Fan {...shapeProps} seen={seen} dealing={dealing} onPick={(i) => setTurn(i)} />}
        {shape === 'rolodex' && <Rolodex {...shapeProps} />}
        {(shape === 'stack' || shape === 'cascade') && <Pile {...shapeProps} cascade={shape === 'cascade'} />}
      </div>
      {/* Where you are, then the buttons under it: dots for every shape (the announcement says it in words). */}
      <div className="flex flex-col items-center gap-3">
        {n <= 12 && (
          <ol aria-hidden className="m-0 flex list-none gap-2 p-0">
            {items.map((_, i) => (
              <li key={i} className={cn('h-2 rounded-full motion-safe:transition-[width,background-color] motion-safe:duration-moderate', i === index ? 'w-6 bg-[var(--color-icon-icon-primary)]' : 'w-2 bg-[var(--color-border-border-strong)]')} />
            ))}
          </ol>
        )}
        <div className="flex items-center gap-2">
          <Button appearance="outlined" tone="secondary" size="md" iconOnly aria-label={t.carousel.previous} leftIcon={<NavArrowLeft className={cn(vertical ? 'rotate-90' : 'rtl:-scale-x-100')} />} onClick={() => go(-1)} />
          {!!autoplay && !reduced && (
            <Button
              appearance="ghost"
              tone="neutral"
              size="md"
              iconOnly
              aria-label={paused ? t.cardDeck.play : t.cardDeck.pause}
              // No aria-pressed: the name already changes (Pause / Play); both would read as "Play, pressed".
              leftIcon={paused ? <Play /> : <Pause />}
              onClick={() => setPaused((p) => !p)}
            />
          )}
          <Button appearance="outlined" tone="secondary" size="md" iconOnly aria-label={t.carousel.next} leftIcon={<NavArrowRight className={cn(vertical ? 'rotate-90' : 'rtl:-scale-x-100')} />} onClick={() => go(1)} />
        </div>
      </div>
      <p id={`${uid}-hint`} className="sr-only">
        {vertical ? t.carousel.keysHintVertical : t.carousel.keysHint}
      </p>
      {/* Silent while autoplay runs, so it doesn't talk over the reader every few seconds. */}
      <p className="sr-only" aria-live={running ? 'off' : 'polite'}>
        {spoken}
      </p>
    </div>
  );
}

interface ShapeProps {
  items: ReactNode[];
  /** Fractional position: the settled card plus the drag. */
  pos: number;
  index: number;
  width: number;
  lean: number;
  /** Animate between states (off while dragging and with reduced motion). */
  motion: boolean;
  slide: (i: number) => Record<string, unknown>;
}

function Drum({ items, pos, width, lean, motion, slide, center, lift = 0 }: ShapeProps & { center?: ReactNode; lift?: number }) {
  const n = items.length;
  const step = 360 / n;
  // Distance from the axis so neighbouring cards just touch, plus a gap.
  // With a word in the middle, the drum widens so the cards clear it.
  const radius = Math.round((width / 2 + 12) / Math.tan(Math.PI / n)) + (center ? 72 : 0);
  const transition = motion ? 'transition-[transform,opacity] duration-slower ease-glide motion-reduce:transition-none' : '';
  return (
    <div className="absolute inset-0 [transform-style:preserve-3d]">
      {center && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `translateY(${-lift}px) translateZ(0)` }}>
          {center}
        </div>
      )}
      <div
        className={cn('absolute left-1/2 top-1/2 [transform-style:preserve-3d]', transition)}
        // With something in the middle the axis stays at the stage's depth, so the cards pass in front of it and behind it.
        style={{ width, top: `calc(50% - ${lift}px)`, transform: `translate(-50%, -50%) translateZ(${center ? 0 : -radius}px) rotateX(${-lean}deg) rotateY(${-pos * step}deg)` }}
      >
        {items.map((item, i) => {
          // How squarely the card faces the viewer: 1 in front, -1 at the back.
          const facing = Math.cos(((i - pos) * step * Math.PI) / 180);
          return (
            <div
              key={i}
              {...slide(i)}
              className={cn('absolute inset-x-0 top-1/2', !center && '[backface-visibility:hidden]', transition)}
              style={{
                transform: `translateY(-50%) rotateY(${i * step}deg) translateZ(${radius}px)`,
                // Cards turning away fade into the page rather than darken: a darkened photo reads
                // as dirt on a light page. Round a word, the cards at the back stay faintly visible.
                opacity: center ? (facing < -0.2 ? 0.45 : 0.55 + 0.45 * Math.max(0, facing)) : 0.35 + 0.65 * Math.max(0, facing),
              }}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Wheel({ items, pos, width, motion, slide }: ShapeProps) {
  const n = items.length;
  const step = 16; // degrees between neighbouring cards on the rim
  const radius = 760; // the wheel's centre sits this far to the start side
  const transition = motion ? 'transition-[transform,opacity] duration-slower ease-glide motion-reduce:transition-none' : '';
  return (
    <div className="absolute inset-0">
      {items.map((item, i) => {
        // Shortest signed offset from the front, so it wraps round.
        let k = mod(i - pos, n);
        if (k > n / 2) k -= n;
        const visible = Math.abs(k) <= 3;
        return (
          <div
            key={i}
            {...slide(i)}
            className={cn('absolute top-1/2', transition, !visible && 'pointer-events-none')}
            style={{
              width,
              insetInlineStart: `calc(50% - ${width / 2}px)`,
              transformOrigin: `${-radius + width / 2}px 50%`,
              // Next cards wait above the front one: Next (↓, ArrowDown) rolls the rim down, as the arrow shows.
              transform: `translateY(-50%) rotate(${-k * step}deg)`,
              opacity: visible ? 1 - Math.abs(k) * 0.18 : 0,
              zIndex: 10 - Math.round(Math.abs(k)),
            }}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
}

function Wall({ items, pos, index, width, lean, motion, slide }: ShapeProps) {
  // A wide cylinder (radius 2.6 cards) seen from inside, the cards side by side with a small gap.
  const radius = Math.round(width * 2.6);
  const step = (2 * Math.asin((width / 2 + 10) / radius) * 180) / Math.PI;
  const transition = motion ? 'transition-[transform,opacity] duration-slower ease-spring motion-reduce:transition-none' : '';
  return (
    <div className="absolute inset-0 [transform-style:preserve-3d]">
      <div
        className={cn('absolute left-1/2 top-1/2 [transform-style:preserve-3d]', transition)}
        // The axis is pushed toward the viewer by the radius, so the front card sits at the stage's depth.
        style={{ transform: `translateZ(${radius}px) rotateX(${-lean}deg) rotateY(${pos * step}deg)` }}
      >
        {items.map((item, i) => {
          const rel = (i - pos) * step; // degrees from straight ahead
          // Beyond ~75° a card would pass beside the camera: hide it.
          const out = Math.abs(rel) > 75;
          return (
            <div
              key={i}
              {...slide(i)}
              className={cn('absolute -translate-x-1/2 -translate-y-1/2', transition)}
              style={{
                width,
                transform: `rotateY(${-i * step}deg) translateZ(${-radius}px)`,
                opacity: out ? 0 : i === index ? 1 : 0.85 - 0.3 * (Math.min(Math.abs(rel), 60) / 60),
                visibility: out ? 'hidden' : undefined,
              }}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Fan({ items, pos, index, width, motion, slide, seen, dealing, onPick }: ShapeProps & { seen: boolean; dealing: boolean; onPick: (i: number) => void }) {
  return (
    <>
      {items.map((item, i) => {
        const d = i - pos; // distance from the middle, following the finger while dragging
        const ad = Math.abs(d);
        return (
          // A full-width row per card, centred, so no physical left / translate is needed (RTL-safe).
          <div key={i} className="pointer-events-none absolute inset-x-0 top-6 flex justify-center" style={{ zIndex: 100 - Math.round(ad * 10) }}>
            <div className="pointer-events-auto relative" style={{ width: `min(${width}px, 72vw)` }}>
              <div
                {...slide(i)}
                className={cn('[transform-origin:50%_140%] [&>*]:h-full', motion && 'transition-[rotate,scale,translate,opacity] duration-slower ease-spring motion-reduce:transition-none')}
                style={
                  !seen
                    ? // Before the deal: all in a pile below the stage.
                      { translate: '0 70%', scale: '0.9', opacity: 0 }
                    : {
                        rotate: `${d * 9}deg`,
                        scale: `${1 - Math.min(ad, 3) * 0.06}`,
                        opacity: ad > 3.2 ? 0 : 1,
                        // The middle card first, then outward, pair by pair. raw-ok: a stagger step, not a duration.
                        transitionDelay: dealing ? `${Math.round(ad) * 110}ms` : undefined,
                      }
                }
              >
                {item}
              </div>
              {/* Pointer shortcut: a click on a side card brings it to the middle. Keyboard uses the arrows. */}
              {i !== index && <div aria-hidden className="absolute inset-0 cursor-pointer" onClick={() => onPick(i)} />}
            </div>
          </div>
        );
      })}
    </>
  );
}

/** Shortest signed distance from the front card, so the shape wraps round. */
const offset = (i: number, pos: number, n: number) => {
  let k = mod(i - pos, n);
  if (k > n / 2) k -= n;
  return k;
};

function Rolodex({ items, pos, width, motion, slide }: ShapeProps) {
  const n = items.length;
  const step = 38; // degrees between neighbouring cards round the axis
  // The axis sits behind the cards, at the distance that makes neighbours
  // just meet: half a card's height over tan(half a step), plus a gap.
  const first = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(Math.round(width * 0.62));
  useEffect(() => {
    const el = first.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => el.offsetHeight && setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const radius = Math.round((h / 2 + 8) / Math.tan(((step / 2) * Math.PI) / 180));
  const transition = motion ? 'transition-[transform,opacity] duration-slower ease-glide motion-reduce:transition-none' : '';
  return (
    <div className="absolute inset-0 [transform-style:preserve-3d]">
      {items.map((item, i) => {
        const k = offset(i, pos, n);
        // Past ~80° a card would turn edge-on: hide it (two on each side stay).
        const out = Math.abs(k * step) > 80;
        return (
          <div
            key={i}
            ref={i === 0 ? first : undefined}
            {...slide(i)}
            className={cn('absolute left-1/2 top-1/2 [backface-visibility:hidden]', transition, out && 'pointer-events-none')}
            style={{
              width,
              // Turn round an axis `radius` behind the card: the next one (k = 1) comes up from below.
              transformOrigin: `50% 50% ${-radius}px`,
              // Next cards wait above the front one: Next (↓, ArrowDown) turns the rolodex down, as the arrow shows.
              transform: `translate(-50%, -50%) rotateX(${k * step}deg)`,
              opacity: out ? 0 : 1 - Math.min(Math.abs(k), 2) * 0.25,
              zIndex: 10 - Math.round(Math.abs(k)),
            }}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
}

function Pile({ items, pos, width, motion, slide, cascade }: ShapeProps & { cascade: boolean }) {
  const n = items.length;
  const transition = motion ? 'transition-[transform,opacity] duration-slower ease-spring motion-reduce:transition-none' : '';
  return (
    // Flat (no preserve-3d): each card has its own perspective, so z-index — not 3D depth — decides which is on top.
    <div className="absolute inset-0">
      {items.map((item, i) => {
        const k = offset(i, pos, n);
        const ak = Math.abs(k);
        const visible = ak <= 3;
        // Stack: a tight pile stepping to the top start / bottom end. Cascade: a wider
        // staircase down to the end, turned a little in perspective.
        const x = k * width * (cascade ? 0.3 : 0.16);
        const y = k * (cascade ? 44 : 22);
        const tilt = cascade ? ' perspective(1200px) rotateY(-16deg) rotateX(6deg)' : '';
        return (
          <div
            key={i}
            {...slide(i)}
            className={cn('absolute left-1/2 top-1/2', transition, !visible && 'pointer-events-none')}
            style={{
              width,
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${1 - Math.min(ak, 3) * (cascade ? 0.1 : 0.08)})${tilt}`,
              opacity: visible ? 1 : 0,
              // The front card on top; behind it, the nearer ones over the farther.
              zIndex: 10 - Math.round(ak),
            }}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
}
