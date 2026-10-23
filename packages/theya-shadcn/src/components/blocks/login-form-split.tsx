'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowRight, Pause, Play } from 'iconoir-react';
import { Button } from '../ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselIndicators, type CarouselApi } from '../ui/carousel';
import { useMediaQuery } from '../ui/use-media-query';
import { LoginForm, type LoginFormProps } from './login-form';
import { useTheyaI18n } from '../../lib/i18n';
import { cn } from '../../lib/utils';

export interface LoginFormSplitSlide {
  src: string;
  alt?: string;
}

export interface LoginFormSplitProps extends LoginFormProps {
  /** Background images for the left panel. One slide renders as a static image (no carousel chrome); 2+ get a real, swipeable Carousel with dot indicators. */
  slides: LoginFormSplitSlide[];
  /** Overlay caption above the dots, bottom-left of the image. */
  tagline?: ReactNode;
  /** Top-left mark over the image — pass an `<img>` (or any ReactNode) to brand it. No default: renders nothing until you give it a logo. */
  logo?: ReactNode;
  /** Top-right link over the image, e.g. back to the marketing site. Omit to hide it. */
  backHref?: string;
  backLabel?: string;
  /**
   * Auto-advance delay in ms. `false` disables autoplay. Autoplay never runs
   * under prefers-reduced-motion, holds while the image panel is hovered or
   * has focus, and comes with a Pause / Play button (WCAG 2.2.2).
   */
  autoplayInterval?: number | false;
}

// Glass button over the image: white label, icon and focus ring, same
// treatment for the back link and the Pause / Play toggle.
const onDarkButton =
  'border-[var(--color-border-border-on-dark)] bg-[var(--color-bg-secondary-bg-secondary-subtler-on-dark-hover)] text-[var(--color-text-text-on-dark)] backdrop-blur-sm hover:bg-[var(--color-bg-secondary-bg-secondary-subtler-on-dark-pressed)] [&_svg]:text-[var(--color-icon-icon-on-dark)]! focus-visible:focus-ring-on-primary!';

/**
 * The wide, two-column sign-in layout: a full-bleed image/carousel panel
 * on the left (logo + back link overlaid at the top, a tagline + dot
 * indicators overlaid at the bottom) and the existing `LoginForm` on the
 * right, unchanged. Use plain `LoginForm` for the narrow, centered
 * single-column page instead.
 *
 * The image panel collapses below `md`, since there's no room for it
 * next to a usable form on a phone-width screen.
 *
 * Autoplay (WCAG 2.2.2): off under prefers-reduced-motion; otherwise it
 * holds while the panel is hovered or focused, and a Pause / Play button
 * next to the dots stops it for good.
 */
export function LoginFormSplit({
  slides,
  tagline,
  logo,
  backHref,
  backLabel = 'Back to website',
  autoplayInterval = 6000,
  appName = 'Theya',
  className,
  ...loginFormProps
}: LoginFormSplitProps) {
  const { t } = useTheyaI18n();
  const [api, setApi] = useState<CarouselApi>();
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  // `paused`: the user pressed Pause. `hovered` / `focused`: a temporary hold
  // while someone is looking at or working in the panel.
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  // Whether this panel autoplays at all; the toggle only exists when it does.
  const autoplays = !!autoplayInterval && slides.length > 1 && !reduced;
  const running = autoplays && !paused && !hovered && !focused;

  useEffect(() => {
    if (!api || !running || !autoplayInterval) return;
    const id = window.setInterval(() => {
      if (api.canScrollNext()) api.scrollNext();
      else api.scrollTo(0);
    }, autoplayInterval);
    return () => window.clearInterval(id);
  }, [api, running, autoplayInterval]);

  return (
    <div className={cn('flex w-full max-w-[73.75rem] overflow-hidden rounded-[var(--size-border-radius-border-radius-3xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]', className)}>
      <div
        className="relative hidden w-1/2 shrink-0 overflow-hidden md:block"
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setFocused(false)}
      >
        <Carousel setApi={setApi} opts={{ loop: true }} aria-label={typeof tagline === 'string' ? tagline : 'Product highlights'} className="h-full rounded-none outline-none">
          <CarouselContent className="ms-0 h-full">
            {slides.map((slide, i) => (
              <CarouselItem key={slide.src} className="h-full ps-0" aria-label={`Slide ${i + 1} of ${slides.length}`}>
                <img src={slide.src} alt={slide.alt ?? ''} className="h-full w-full object-cover" />
              </CarouselItem>
            ))}
          </CarouselContent>

          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/10" />

          {(logo || backHref) && (
            <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-6">
              {logo}
              {backHref && (
                <Button
                  appearance="outlined"
                  tone="secondary"
                  size="md"
                  asChild
                  className={onDarkButton}
                  rightIcon={<ArrowRight className="rtl:-scale-x-100" />}
                >
                  <a href={backHref}>{backLabel}</a>
                </Button>
              )}
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 p-8">
            {tagline && <p className="text-center font-body text-heading-m font-normal text-[var(--color-text-text-on-dark)]">{tagline}</p>}
            <div className="flex items-center gap-3">
              <CarouselIndicators variant="on-dark" />
              {autoplays && (
                // Name changes with the state (no aria-pressed on top, which would
                // read as "Play, pressed"); the icon shows the action, not the state.
                <Button
                  appearance="outlined"
                  tone="secondary"
                  size="md"
                  iconOnly
                  aria-label={paused ? t.cardDeck.play : t.cardDeck.pause}
                  leftIcon={paused ? <Play /> : <Pause />}
                  onClick={() => setPaused((p) => !p)}
                  className={onDarkButton}
                />
              )}
            </div>
          </div>
        </Carousel>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center p-4 sm:p-8 md:p-12">
        <LoginForm appName={appName} card={false} {...loginFormProps} />
      </div>
    </div>
  );
}
