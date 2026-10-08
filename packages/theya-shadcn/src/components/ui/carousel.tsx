'use client';

import { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import type { ReactNode, KeyboardEvent as ReactKeyboardEvent } from 'react';
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import { useDirection } from '@radix-ui/react-direction';
import { ArrowLeft, ArrowRight } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { useMediaQuery } from './use-media-query';
import { useTheyaI18n } from '../../lib/i18n';

/**
 * A horizontal/vertical slide track on embla-carousel-react v8 — the
 * standard purpose-built library for drag/swipe physics, same
 * rationale as react-day-picker for Calendar. Prev/next arrows,
 * arrow-key navigation, and pointer drag/swipe.
 *
 * Pass an aria-label to name the region (falls back to "Carousel" if
 * neither aria-label nor aria-labelledby is given, so the carousel
 * roledescription always lands on a named region). Navigation: the
 * on-canvas arrow buttons, Arrow keys while the region is focused
 * (the root is a real tab stop), and pointer/touch drag. Per-slide
 * naming is the consumer's job — pass aria-label to each CarouselItem
 * when position matters (e.g. "1 of 5").
 */
export type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

export interface CarouselProps extends React.ComponentProps<'div'> {
  orientation?: 'horizontal' | 'vertical';
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  setApi?: (api: CarouselApi) => void;
  /**
   * The current slide sits in the middle, its neighbours peek in from the
   * sides smaller, dimmer and turned slightly away; the effect follows the
   * drag. Give CarouselItem a basis under 100% (e.g. basis-[72%]). Centers
   * the slides (`align: 'center'`) unless `opts` says otherwise. No turn
   * with prefers-reduced-motion.
   */
  peek?: boolean;
}

interface CarouselContextValue {
  carouselRef: UseEmblaCarouselType[0];
  api: CarouselApi;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  orientation: 'horizontal' | 'vertical';
  peek: boolean;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

export function useCarousel() {
  const context = useContext(CarouselContext);
  if (!context) throw new Error('useCarousel must be used within a <Carousel>.');
  return context;
}

export function Carousel({ orientation = 'horizontal', opts, setApi, plugins, peek = false, className, children, ...props }: CarouselProps) {
  const { t } = useTheyaI18n();
  // embla animates scroll in JS, so prefers-reduced-motion can't be
  // handled by CSS alone — force the effective duration to 0 for
  // those users.
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  // Reading direction from TheyaLocaleProvider's `dir` (Radix
  // DirectionProvider): in RTL the first slide sits at the right and
  // "next" scrolls left, so embla needs to know.
  const dir = useDirection();
  const resolvedOpts = useMemo<CarouselOptions>(
    () => ({
      inViewThreshold: 0.5,
      direction: dir,
      ...(peek ? { align: 'center' as const } : null),
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
      ...(prefersReducedMotion ? { duration: 0 } : null),
    }),
    [opts, orientation, prefersReducedMotion, dir, peek],
  );

  const [carouselRef, api] = useEmblaCarousel(resolvedOpts, plugins);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback((api: CarouselApi) => {
    if (!api) return;
    const prev = api.canScrollPrev();
    const next = api.canScrollNext();
    // Paging to the first/last slide disables the arrow that was just
    // pressed; a disabled button drops focus to <body>. Hand it to the
    // carousel region instead so keyboard users stay in place.
    const active = document.activeElement as HTMLElement | null;
    const slot = active?.getAttribute('data-slot');
    if ((slot === 'carousel-previous' && !prev) || (slot === 'carousel-next' && !next)) {
      const root = active?.closest<HTMLElement>('[data-slot="carousel"]');
      if (root && api.rootNode() && root.contains(api.rootNode())) root.focus();
    }
    setCanScrollPrev(prev);
    setCanScrollNext(next);
  }, []);

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      if (target.closest('input,textarea,select,[contenteditable="true"],[role="slider"],[role="spinbutton"],[role="listbox"],[role="textbox"]')) return;
      // Horizontal arrows follow the reading direction: in RTL, ← is next.
      const back = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
      const forward = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
      const prevKey = orientation === 'horizontal' ? back : 'ArrowUp';
      const nextKey = orientation === 'horizontal' ? forward : 'ArrowDown';
      if (event.key === prevKey) {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === nextKey) {
        event.preventDefault();
        scrollNext();
      }
    },
    [orientation, scrollPrev, scrollNext, dir],
  );

  useEffect(() => {
    if (api && setApi) setApi(api);
  }, [api, setApi]);

  useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on('reInit', onSelect);
    api.on('select', onSelect);
    return () => {
      api.off('reInit', onSelect);
      api.off('select', onSelect);
    };
  }, [api, onSelect]);

  // Take off-screen slides out of the tab order + AT reading order
  // (WCAG 2.4.3 / 4.1.2). If focus is inside a slide leaving view,
  // move it to the carousel region before inert-ing the slide.
  useEffect(() => {
    if (!api) return;
    const applyInView = () => {
      const inView = new Set(api.slidesInView());
      inView.add(api.selectedScrollSnap());
      api.slideNodes().forEach((node, i) => {
        const offscreen = !inView.has(i);
        if (offscreen && node.contains(document.activeElement)) {
          (node.closest('[data-slot="carousel"]') as HTMLElement | null)?.focus();
        }
        (node as HTMLElement & { inert: boolean }).inert = offscreen;
        if (offscreen) node.setAttribute('aria-hidden', 'true');
        else node.removeAttribute('aria-hidden');
      });
    };
    applyInView();
    api.on('select', applyInView);
    api.on('reInit', applyInView);
    api.on('slidesInView', applyInView);
    return () => {
      api.off('select', applyInView);
      api.off('reInit', applyInView);
      api.off('slidesInView', applyInView);
      api.slideNodes().forEach((node) => {
        (node as HTMLElement & { inert: boolean }).inert = false;
        node.removeAttribute('aria-hidden');
      });
    };
  }, [api]);

  // Peek: each slide gets --peek (0 at the centre … 1 one slide away) and
  // --peek-dir (−1 left, 1 right) from the live scroll position; the CSS on
  // CarouselItem turns them into scale, opacity and a slight turn.
  useEffect(() => {
    if (!api || !peek) return;
    const tween = () => {
      const snaps = api.scrollSnapList();
      const progress = api.scrollProgress();
      const span = snaps.length > 1 ? snaps[1] - snaps[0] : 1;
      api.slideNodes().forEach((node, i) => {
        const d = ((snaps[i] ?? 0) - progress) / (span || 1);
        node.style.setProperty('--peek', String(Math.min(1, Math.abs(d))));
        node.style.setProperty('--peek-dir', String(Math.sign(d)));
      });
    };
    tween();
    api.on('scroll', tween);
    api.on('reInit', tween);
    return () => {
      api.off('scroll', tween);
      api.off('reInit', tween);
    };
  }, [api, peek]);

  const hasName = props['aria-label'] != null || props['aria-labelledby'] != null;

  return (
    <CarouselContext.Provider value={{ carouselRef, api, scrollPrev, scrollNext, canScrollPrev, canScrollNext, orientation, peek }}>
      <div
        data-slot="carousel"
        role="region"
        aria-roledescription="carousel"
        aria-label={hasName ? undefined : t.carousel.label}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative rounded-[var(--size-border-radius-border-radius-2xl)] outline-none',
          'focus-visible:focus-ring',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

export function CarouselContent({ className, ...props }: React.ComponentProps<'div'>) {
  const { carouselRef, orientation } = useCarousel();
  return (
    <div ref={carouselRef} data-slot="carousel-content" className="h-full overflow-hidden">
      <div className={cn('flex', orientation === 'horizontal' ? '-ms-4' : '-mt-4 flex-col', className)} {...props} />
    </div>
  );
}

export function CarouselItem({ className, ...props }: React.ComponentProps<'div'>) {
  const { orientation, peek } = useCarousel();
  return (
    <div
      data-slot="carousel-item"
      role="group"
      aria-roledescription="slide"
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? 'ps-4' : 'pt-4',
        peek && [
          'opacity-[calc(1-var(--peek,0)*0.45)]',
          '[transform:perspective(1000px)_rotateY(calc(var(--peek-dir,0)*var(--peek,0)*-14deg))_scale(calc(1-var(--peek,0)*0.14))]',
          'motion-reduce:[transform:scale(calc(1-var(--peek,0)*0.14))]',
        ],
        className,
      )}
      {...props}
    />
  );
}

/** On-canvas (inset, never a negative offset) so it can't widen the page below 360px. */
export function CarouselPrevious({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { t } = useTheyaI18n();
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();
  return (
    <Button
      data-slot="carousel-previous"
      appearance="outlined"
      tone="secondary"
      iconOnly
      aria-label={t.carousel.previous}
      className={cn('absolute z-10 rounded-full', orientation === 'horizontal' ? 'start-3 inset-y-0 my-auto' : 'left-1/2 top-3 -translate-x-1/2', className)}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      leftIcon={<ArrowLeft aria-hidden="true" className={cn(orientation === 'vertical' ? 'rotate-90' : 'rtl:-scale-x-100')} />}
      {...props}
    />
  );
}


export interface CarouselIndicatorsProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /** `on-dark` uses white/translucent-white dots for an image or video background; `default` uses the standard surface tokens. */
  variant?: 'default' | 'on-dark';
}

/**
 * Slide picker for a Carousel's current slide — the "dash" style
 * (small dot, active one widens into a pill). Must render inside a
 * <Carousel>; reads position from the same embla api CarouselPrevious/
 * CarouselNext use, so it stays in sync with drag/swipe/arrow-key
 * navigation, not just its own clicks. Renders nothing for a single slide.
 */
export function CarouselIndicators({ className, variant = 'default', ...props }: CarouselIndicatorsProps) {
  const { t } = useTheyaI18n();
  const { api } = useCarousel();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelectedIndex(api.selectedScrollSnap());
    const onInit = () => {
      setCount(api.scrollSnapList().length);
      onSelect();
    };
    onInit();
    api.on('select', onSelect);
    api.on('reInit', onInit);
    return () => {
      api.off('select', onSelect);
      api.off('reInit', onInit);
    };
  }, [api]);

  if (count < 2) return null;

  return (
    // A group of plain buttons, not tablist/tab: the tabs pattern also
    // needs tabpanels, aria-controls and roving arrow-key focus, none of
    // which apply here, so it announced an incomplete widget. The current
    // slide is marked with aria-current instead of aria-selected.
    //
    // Hit area vs. visual: each button is a 24px-tall pill with 8px side
    // padding (WCAG 2.5.8 target size: 24x24 for a dot, 40x24 for the
    // active one) and draws an 8px dot inside it. Buttons sit flush, so the
    // visible gap is a uniform 16px between every pair, active or not.
    //
    // Colors: inactive used bg-secondary-subtle (#e7e7f8, 1.22:1 light /
    // white 10%, 1.36:1 dark) and was nearly invisible.
    // Light: icon-subtler (#9a9cce, 2.62:1). DELIBERATE DEVIATION from
    // WCAG 1.4.11 (3:1) — border-subtle (3.0:1) read too heavy next to
    // the active dot; design decision, 2026-10-01.
    // Dark: border-subtle (#6e709f, 3.01:1, passes). icon-subtler can't be
    // used there — it's #caccf0 in dark, brighter than the active dot.
    // Active used bg-primary
    // (#0068de in both themes, only 2.71:1 on the dark surface); now
    // icon-primary, which lightens in dark (#63acff). The active dot is
    // also wider, so the state never relies on color alone.
    <div data-slot="carousel-indicators" role="group" aria-label={t.carousel.slides} className={cn('flex items-center', className)} {...props}>
      {Array.from({ length: count }, (_, i) => {
        const active = i === selectedIndex;
        return (
          <button
            key={i}
            type="button"
            aria-current={active || undefined}
            aria-label={t.carousel.goTo(i + 1)}
            onClick={() => api?.scrollTo(i)}
            className="group flex h-6 min-w-6 cursor-pointer items-center justify-center rounded-full px-2 outline-none focus-visible:focus-ring"
          >
            <span
              aria-hidden="true"
              className={cn(
                'h-2 rounded-full transition-[width,background-color] duration-moderate ease-enter motion-reduce:transition-none',
                active ? 'w-6' : 'w-2',
                variant === 'on-dark'
                  ? active
                    ? 'bg-[var(--color-icon-icon-on-dark)]'
                    : 'bg-[var(--color-bg-secondary-bg-secondary-on-dark)] group-hover:bg-[var(--color-bg-secondary-bg-secondary-on-dark-hover)]'
                  : active
                    ? 'bg-[var(--color-icon-icon-primary)]'
                    : 'bg-[var(--color-icon-icon-subtler)] [[data-theme=dark]_&]:bg-[var(--color-border-border)] group-hover:bg-[var(--color-icon-icon-subtle)]',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export function CarouselNext({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { t } = useTheyaI18n();
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  return (
    <Button
      data-slot="carousel-next"
      appearance="outlined"
      tone="secondary"
      iconOnly
      aria-label={t.carousel.next}
      className={cn('absolute z-10 rounded-full', orientation === 'horizontal' ? 'end-3 inset-y-0 my-auto' : 'left-1/2 bottom-3 -translate-x-1/2', className)}
      disabled={!canScrollNext}
      onClick={scrollNext}
      leftIcon={<ArrowRight aria-hidden="true" className={cn(orientation === 'vertical' ? 'rotate-90' : 'rtl:-scale-x-100')} />}
      {...props}
    />
  );
}
