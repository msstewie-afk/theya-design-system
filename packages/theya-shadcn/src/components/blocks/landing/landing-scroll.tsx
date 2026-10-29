'use client';

import { Children, useEffect, useId, useRef, useState, type ComponentProps, type CSSProperties, type ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../../ui/carousel';
import { SectionHead } from './feature-shared';

/*
 * Scroll behaviours for landing cards. None of them takes over the scroll:
 * the page moves at the reader's pace, every card is in the DOM in reading
 * order, and everything reads the same with reduced motion.
 */

// ---------------------------------------------------------------------------

export interface StickyStackProps extends ComponentProps<'ol'> {
  /** Where the first card sticks, px from the top (clear of a 64px sticky header). */
  top?: number;
  /** How much lower each next card sticks, px, so the edges of the pile show. */
  offset?: number;
}

/**
 * Cards that pile up as the page scrolls: each one sticks a little lower
 * than the one before, and the next slides over it (monday, Apple). Plain
 * CSS position: sticky — nothing is animated, nothing is hijacked. Give the
 * cards an opaque surface and a similar height.
 */
export function StickyStack({ top = 96, offset = 24, className, children, ...props }: StickyStackProps) {
  const items = Children.toArray(children);
  return (
    <ol data-slot="sticky-stack" className={cn('m-0 flex list-none flex-col gap-8 p-0 pb-16', className)} {...props}>
      {items.map((child, i) => (
        <li
          key={i}
          className="sticky [&>*]:shadow-elevation-lg"
          // Each card sticks one step lower than the previous one.
          style={{ top: `${top + i * offset}px` } as CSSProperties}
        >
          {child}
        </li>
      ))}
    </ol>
  );
}

// ---------------------------------------------------------------------------

export interface CardRailProps extends Omit<ComponentProps<'section'>, 'title'> {
  eyebrow?: ReactNode;
  /** Names the section and the carousel region. */
  title: string;
  description?: ReactNode;
  /** The cards; each becomes one slide. */
  children: ReactNode;
}

/**
 * A row of cards wider than the page: the next one peeks in from the edge,
 * arrows at the top end, drag or swipe, Arrow keys when the rail has focus
 * (monday customer stories, template galleries). Built on Carousel.
 */
export function CardRail({ eyebrow, title, description, className, children, ...props }: CardRailProps) {
  const items = Children.toArray(children);
  return (
    <section data-slot="card-rail" data-scale="display" className={cn('section-display', className)} {...props}>
      <div className="container-display">
        <Carousel opts={{ align: 'start' }} aria-label={title} className="flex flex-col gap-8 lg:gap-10">
          <div className="flex items-end justify-between gap-6">
            <SectionHead eyebrow={eyebrow} title={title} description={description} />
            <div className="flex shrink-0 gap-2">
              <CarouselPrevious className="static my-0" />
              <CarouselNext className="static my-0" />
            </div>
          </div>
          {/* ps-1 / pb-2: room for the cards' focus ring and shadow inside the clipped track. */}
          <CarouselContent className="pb-2 ps-1">
            {items.map((child, i) => (
              <CarouselItem key={i} aria-label={`${i + 1} of ${items.length}`} className="basis-[85%] sm:basis-[46%] lg:basis-[31%]">
                {child}
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

export interface StickyStep {
  id: string;
  title: string;
  description: ReactNode;
  media?: ReactNode;
}

export interface StickyStepsProps extends Omit<ComponentProps<'section'>, 'title'> {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  steps: StickyStep[];
}

/**
 * A heading and numbered steps that stay on the start side while the steps
 * scroll by on the end side; the step in view is marked (LaunchDarkly).
 * The numbers are links to their steps. On phones the steps simply follow
 * the heading.
 */
export function StickySteps({ eyebrow, title, description, steps, className, ...props }: StickyStepsProps) {
  const uid = useId();
  const [active, setActive] = useState<string | undefined>(steps[0]?.id);
  const refs = useRef(new Map<string, HTMLElement>());

  // The step crossing the middle band of the viewport is the current one.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive((hit.target as HTMLElement).dataset.step);
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    refs.current.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [steps]);

  return (
    <section data-slot="sticky-steps" data-scale="display" className={cn('section-display', className)} {...props}>
      <div className="container-display grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="flex flex-col gap-8 lg:sticky lg:top-24 lg:self-start">
          <SectionHead eyebrow={eyebrow} title={title} description={description} />
          <nav aria-label="Steps" className="max-lg:hidden">
            <ol className="m-0 flex list-none flex-col p-0">
              {steps.map((s, i) => {
                const current = s.id === active;
                return (
                  <li key={s.id}>
                    <a
                      href={`#${uid}-${s.id}`}
                      aria-current={current ? 'step' : undefined}
                      className={cn(
                        // The current step: semibold and a 2px bar at the start edge, not color alone.
                        'flex items-baseline gap-4 border-s-2 border-solid py-3 ps-4 font-body text-body-l no-underline outline-none focus-visible:focus-ring',
                        current
                          ? 'border-[var(--color-border-border-primary)] font-semibold text-[var(--color-text-text)]'
                          : 'border-[var(--color-border-border-subtler)] text-[var(--color-text-text-subtle)] hover:text-[var(--color-text-text)]',
                        'motion-safe:transition-colors motion-safe:duration-standard',
                      )}
                    >
                      <span className="font-body text-body-s font-medium tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                      {s.title}
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
        <ol className="m-0 flex list-none flex-col gap-16 p-0 lg:gap-24 lg:py-[10vh]">
          {steps.map((s, i) => (
            <li
              key={s.id}
              id={`${uid}-${s.id}`}
              data-step={s.id}
              ref={(el) => {
                if (el) refs.current.set(s.id, el);
                else refs.current.delete(s.id);
              }}
              className="flex scroll-mt-24 flex-col gap-6"
            >
              {s.media && (
                <div className="flex min-h-[18rem] items-center justify-center rounded-[var(--size-border-radius-border-radius-5xl)] bg-[var(--color-bg-surface-bg-surface-sunken)] p-4 sm:p-6">
                  {s.media}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <p className="m-0 font-body text-body-s font-medium tabular-nums text-[var(--color-text-text-subtle)]">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="m-0 font-heading text-heading-xl text-[var(--color-text-text)]">{s.title}</h3>
                <p className="m-0 font-body text-body-l text-[var(--color-text-text-subtle)]">{s.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
