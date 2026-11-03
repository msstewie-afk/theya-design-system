'use client';

import { useId, useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { inertProps } from '../../lib/inert';
import { FILL_HUE_BG, FILL_HUE_INK, type FillHue } from '../../lib/fill-hues';

/**
 * Motion (landing pages): a row of tall panels, one open. The open panel
 * takes most of the width and shows its text; the others shrink to narrow
 * strips with their title running up the side (a flex accordion, the
 * "expanding cards" gallery). Hover or focus a strip and it opens; nothing
 * closes when the pointer leaves, so the row never flickers back.
 *
 * - It is an accordion: each title is a button (aria-expanded) inside a
 *   heading; the open panel's text is the region it controls. Only one is
 *   open. Collapsed text is inert, so Tab never lands in a hidden panel.
 * - The row keeps its height: only the widths change, nothing below moves.
 * - Below 768px the panels stack and open downwards, the titles horizontal.
 * - Panels are dark (data-theme="dark") so the text reads over any picture;
 *   a gradient sits between the picture and the text.
 * - prefers-reduced-motion: the panels switch without sliding.
 */
export type ExpandingPanelsTone = FillHue;

export interface ExpandingPanelsItem {
  /** Names the panel: the button and the open panel's heading. */
  title: string;
  /** A picture behind the panel (an <img>, alt="" when decorative). Use sparingly: a bright `tone` reads cleaner. */
  media?: ReactNode;
  /**
   * A bright fill instead of a picture: a primitive hue with white text, no gradient or darkening
   * (the text reads on the fill as it is). Give neighbouring panels hues in FILL_HUES order
   * (lib/fill-hues) so they never blend.
   */
  tone?: ExpandingPanelsTone;
  /** What the open panel says: a line or two and, at most, one link. */
  content?: ReactNode;
}

export interface ExpandingPanelsProps extends Omit<React.ComponentProps<'div'>, 'children' | 'onChange'> {
  items: ExpandingPanelsItem[];
  /** The panel open at first (default 0). */
  defaultIndex?: number;
  /** Called with the index of the panel that opens. */
  onChange?: (index: number) => void;
  /** Row height on wide screens (CSS length, default 28rem). */
  height?: string;
  /** Heading level of the titles (default h3). */
  titleAs?: 'h2' | 'h3' | 'h4';
}

export function ExpandingPanels({ items, defaultIndex = 0, onChange, height = '28rem', titleAs: Title = 'h3', className, style, ...props }: ExpandingPanelsProps) {
  const uid = useId();
  const [open, setOpen] = useState(defaultIndex);
  const choose = (i: number) => {
    if (i === open) return;
    setOpen(i);
    onChange?.(i);
  };

  return (
    <div
      data-slot="expanding-panels"
      className={cn('flex flex-col gap-3 md:h-[var(--ep-height)] md:flex-row', className)}
      style={{ ...style, '--ep-height': height } as React.CSSProperties}
      {...props}
    >
      {items.map((item, i) => {
        const isOpen = i === open;
        const btn = `${uid}-b${i}`;
        const panel = `${uid}-p${i}`;
        return (
          <div
            key={i}
            data-slot="expanding-panels-item"
            data-state={isOpen ? 'open' : 'closed'}
            // A picture (or no fill) gets the dark theme, so its text reads over the gradient; a tone brings its own colors.
            data-theme={item.tone ? undefined : 'dark'}
            data-tone={item.tone}
            onPointerEnter={(e) => e.pointerType === 'mouse' && choose(i)}
            className={cn(
              'relative isolate flex min-w-0 flex-col justify-end overflow-hidden rounded-[var(--size-border-radius-border-radius-4xl)]',
              item.tone ? `${FILL_HUE_BG[item.tone]} ${FILL_HUE_INK}` : 'bg-[var(--color-bg-surface-bg-surface-sunken)] text-[var(--color-text-text)]',
              // Wide: the open panel grows, the others stay narrow strips. Narrow: the open one is taller.
              'md:basis-0 md:[flex-grow:var(--ep-grow)]',
              isOpen ? 'h-[22rem] md:h-auto' : 'h-16 md:h-auto',
              'motion-safe:transition-[flex-grow,height] motion-safe:duration-slow motion-safe:ease-glide',
            )}
            style={{ '--ep-grow': isOpen ? 5 : 1 } as React.CSSProperties}
          >
            {item.media && (
              <div
                className={cn(
                  'absolute inset-0 -z-10 [&>img]:size-full [&>img]:object-cover',
                  // Collapsed strips are darker, so the open panel leads.
                  'motion-safe:transition-[filter,scale] motion-safe:duration-slow',
                  isOpen ? 'brightness-100 scale-100' : 'brightness-[0.55] scale-105',
                )}
              >
                {item.media}
              </div>
            )}
            {/* Between the picture and the text, so white text always reads. Not on a tone: the fill needs none. */}
            {!item.tone && <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-[color-mix(in_srgb,var(--color-bg-surface-bg-surface-sunken)_92%,transparent)] via-[color-mix(in_srgb,var(--color-bg-surface-bg-surface-sunken)_40%,transparent)] to-transparent" />}

            <Title className="m-0">
              <button
                id={btn}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panel}
                onClick={() => choose(i)}
                onFocus={() => choose(i)}
                className={cn(
                  // The button covers the whole panel, so the strip is one big target.
                  "w-full cursor-pointer border-0 bg-transparent p-0 text-start text-inherit outline-none after:absolute after:inset-0 after:rounded-[inherit] after:content-[''] focus-visible:after:focus-ring-inset",
                  isOpen && 'cursor-default',
                )}
              >
                {/* Narrow: always a horizontal title. Wide: horizontal when open, running up the strip when closed. */}
                <span
                  className={cn(
                    'block px-5 py-5 font-heading text-heading-xs font-semibold md:px-6',
                    !isOpen && 'md:absolute md:bottom-6 md:max-h-[calc(100%-3rem)] md:-translate-x-1/2 md:truncate md:p-0 md:[writing-mode:vertical-rl] md:rotate-180',
                    isOpen && 'md:px-8 md:pb-2 md:text-heading-s',
                  )}
                  // Physical left on purpose: in vertical writing-mode the inline axis is vertical,
                  // so inset-inline-start would move the label up the strip. Centring is the same in RTL.
                  // (Ignored on narrow screens, where the label is not positioned.)
                  style={isOpen ? undefined : { left: '50%' }}
                >
                  {item.title}
                </span>
              </button>
            </Title>
            <div
              id={panel}
              role="region"
              aria-labelledby={btn}
              aria-hidden={!isOpen || undefined}
              {...inertProps(!isOpen)}
              className={cn(
                // Above the button's stretched target, so a link inside stays clickable.
                'relative z-[1] px-5 pb-5 font-body text-body-m md:max-w-[36rem] md:px-8 md:pb-8',
                // On a tone the text keeps the fill's own color at full strength: faded white fails contrast on the fill.
                item.tone ? '[&_a]:text-inherit [&_a]:underline' : 'text-[var(--color-text-text-subtle)]',
                isOpen ? 'opacity-100 motion-safe:transition-opacity motion-safe:duration-moderate' : 'hidden md:block md:pointer-events-none md:absolute md:opacity-0',
              )}
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
