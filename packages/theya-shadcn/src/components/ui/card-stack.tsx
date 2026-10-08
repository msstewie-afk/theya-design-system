'use client';

import { Children, useEffect, useState } from 'react';
import { useDirection } from '@radix-ui/react-direction';
import { Pause, Play, NavArrowRight } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';
import { Button } from './button';
import { useMediaQuery } from './use-media-query';

/**
 * Motion: a deck that shows its cards one after another (`layout="fan"`
 * spreads the cards behind like a hand of cards). On a timer the
 * front card drops away and returns to the back while the rest move one
 * step forward (testimonials, feature highlights, invoices on a landing).
 *
 * It pauses while hovered or focused, and has its own Pause / Play and
 * Next buttons (WCAG 2.2.2: anything that moves on its own longer than
 * 5 s needs a way to stop it). Only the front card is exposed to
 * assistive tech. prefers-reduced-motion: no timer and no animation —
 * the cards change only with Next.
 */
export interface CardStackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Time each card stays in front, ms (default 4000). */
  interval?: number;
  /** Cards visible behind the front one (default 2). */
  depth?: number;
  /** Hide the Pause / Next controls — only when the page has another way to stop it. */
  hideControls?: boolean;
  /** `stack`: cards behind sit higher and smaller. `fan`: they spread to the side like a hand of cards. */
  layout?: 'stack' | 'fan';
}

const LEAVE_MS = 450;

export function CardStack({ interval = 4000, depth = 2, hideControls = false, layout = 'stack', className, children, onPointerEnter, onPointerLeave, onFocus, onBlur, ...props }: CardStackProps) {
  const { t } = useTheyaI18n();
  // The fan spreads toward the inline end, so it mirrors in RTL.
  const sx = useDirection() === 'rtl' ? -1 : 1;
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const cards = Children.toArray(children);
  const n = cards.length;
  const [front, setFront] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const next = () => {
    if (n < 2 || leaving) return;
    if (reduced) return setFront((f) => (f + 1) % n);
    setLeaving(true);
    window.setTimeout(() => {
      setFront((f) => (f + 1) % n);
      setLeaving(false);
    }, LEAVE_MS);
  };

  const running = !reduced && !paused && !hovered && !focused && n > 1;
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(next, interval);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, front, interval]);

  return (
    <div
      data-slot="card-stack"
      role="group"
      aria-roledescription="card stack"
      className={cn('flex w-full max-w-sm flex-col items-center gap-4', className)}
      onPointerEnter={(e) => (onPointerEnter?.(e), setHovered(true))}
      onPointerLeave={(e) => (onPointerLeave?.(e), setHovered(false))}
      onFocus={(e) => (onFocus?.(e), setFocused(true))}
      onBlur={(e) => {
        onBlur?.(e);
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      {...props}
    >
      <div
        className="relative grid w-full [grid-template-areas:'stack']"
        // Fan: reserve room at the inline end for the spread and the turn of the
        // cards behind, so the stack stays inside its own box (no overflow on phones).
        style={layout === 'fan' ? { paddingInlineEnd: depth * 22 + 24 } : undefined}
      >
        {cards
          .map((card, i) => {
            // Position in the deck, 0 = front.
            const pos = (i - front + n) % n;
            if (pos > depth && !(leaving && pos === 0)) return null;
            const isFront = pos === 0;
            const step = leaving ? Math.max(0, pos - 1) : pos;
            const fan = layout === 'fan';
            const transform =
              isFront && leaving
                ? fan
                  ? `translateX(${-24 * sx}px) rotate(${-8 * sx}deg) scale(0.92)`
                  : 'translateY(24px) scale(0.92)'
                : fan
                  ? `translateX(${step * 22 * sx}px) rotate(${step * 7 * sx}deg) scale(${1 - step * 0.03})`
                  : `translateY(${-step * 12}px) scale(${1 - step * 0.05})`;
            return (
              <div
                key={i}
                data-slot="card-stack-item"
                aria-hidden={isFront ? undefined : true}
                {...(isFront ? {} : ({ inert: '' } as object))}
                className={cn(
                  '[grid-area:stack] transition-[transform,opacity] duration-slower ease-glide motion-reduce:transition-none',
                  layout === 'fan' ? 'origin-bottom-left' : 'origin-top',
                  isFront && leaving && 'opacity-0',
                )}
                style={{ transform, zIndex: isFront && leaving ? 0 : depth + 1 - pos }}
              >
                {card}
              </div>
            );
          })
          .reverse()}
      </div>
      {!hideControls && n > 1 && (
        <div className="flex items-center gap-2">
          {!reduced && (
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
          <Button appearance="ghost" tone="neutral" size="md" iconOnly aria-label={t.cardDeck.next} leftIcon={<NavArrowRight className="rtl:-scale-x-100" />} onClick={next} />
        </div>
      )}
    </div>
  );
}
