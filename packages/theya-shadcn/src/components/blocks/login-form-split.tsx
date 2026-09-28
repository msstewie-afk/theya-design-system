import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowRight } from 'iconoir-react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselIndicators, type CarouselApi } from '@/components/ui/carousel';
import { LoginForm, type LoginFormProps } from './login-form';
import { cn } from '@/lib/utils';

export interface LoginFormSplitSlide {
  src: string;
  alt?: string;
}

export interface LoginFormSplitProps extends LoginFormProps {
  /** Background images for the left panel. One slide renders as a static image (no carousel chrome); 2+ get a real, swipeable Carousel with dot indicators. */
  slides: LoginFormSplitSlide[];
  /** Overlay caption above the dots, bottom-left of the image. */
  tagline?: ReactNode;
  /** Top-left mark over the image — pass an <img> (or any ReactNode) to brand it. No default: renders nothing until you give it a logo. */
  logo?: ReactNode;
  /** Top-right link over the image, e.g. back to the marketing site. Omit to hide it. */
  backHref?: string;
  backLabel?: string;
  /** Auto-advance delay in ms. `false` disables autoplay. */
  autoplayInterval?: number | false;
}

/**
 * The wide, two-column sign-in layout: a full-bleed image/carousel panel
 * on the left (logo + back link overlaid at the top, a tagline + dot
 * indicators overlaid at the bottom) and the existing `LoginForm` on the
 * right, unchanged. Use plain `LoginForm` for the narrow, centered
 * single-column page instead.
 *
 * The image panel collapses below `md`, since there's no room for it
 * next to a usable form on a phone-width screen.
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
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api || !autoplayInterval || slides.length < 2) return;
    const id = window.setInterval(() => {
      if (api.canScrollNext()) api.scrollNext();
      else api.scrollTo(0);
    }, autoplayInterval);
    return () => window.clearInterval(id);
  }, [api, autoplayInterval, slides.length]);

  return (
    <div className={cn('flex w-full max-w-[73.75rem] overflow-hidden rounded-[var(--size-border-radius-border-radius-3xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]', className)}>
      <div className="relative hidden w-1/2 shrink-0 overflow-hidden md:block">
        <Carousel setApi={setApi} opts={{ loop: true }} aria-label={typeof tagline === 'string' ? tagline : 'Product highlights'} className="h-full rounded-none outline-none">
          <CarouselContent className="ml-0 h-full">
            {slides.map((slide, i) => (
              <CarouselItem key={slide.src} className="h-full pl-0" aria-label={`Slide ${i + 1} of ${slides.length}`}>
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
                  className="border-white/30 bg-white/10 text-[var(--color-text-text-on-dark)] backdrop-blur-sm hover:bg-white/20"
                  rightIcon={<ArrowRight />}
                >
                  <a href={backHref}>{backLabel}</a>
                </Button>
              )}
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 p-8">
            {tagline && <p className="text-center font-body text-heading-m font-normal text-[var(--color-text-text-on-dark)]">{tagline}</p>}
            <CarouselIndicators variant="on-dark" />
          </div>
        </Carousel>
      </div>

      <div className="flex flex-1 items-center justify-center p-8 md:p-12">
        <LoginForm appName={appName} card={false} {...loginFormProps} />
      </div>
    </div>
  );
}
