import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../../lib/utils';

export type DeviceFrameType = 'phone' | 'browser';

export interface DeviceFrameProps extends ComponentProps<'div'> {
  /** Default 'phone'. */
  type?: DeviceFrameType;
  /** Browser: the address shown in the bar ("theya.app/plans"). Decorative. */
  url?: string;
  /**
   * The screen: an image (give it alt text), or live Theya components.
   * The frame only clips it; the content sets its own padding.
   */
  children?: ReactNode;
  /** Phone: the screen's surface. 'page' (default) or 'canvas' (the theme's gradient, see Gradient canvas). */
  screen?: 'page' | 'canvas';
}

/**
 * A phone or browser frame for product shots on landing pages. The frame
 * is decoration: screen readers meet only what is inside. The phone keeps
 * a 9 : 19.5 screen at any width (set the width with className, 280–360px
 * reads best); the browser takes the width it gets and the height of its
 * content.
 */
export function DeviceFrame({ type = 'phone', url, screen = 'page', className, children, ...props }: DeviceFrameProps) {
  if (type === 'browser') {
    return (
      <div
        data-slot="device-frame"
        data-type="browser"
        className={cn(
          'flex min-w-0 flex-col overflow-hidden rounded-[var(--size-border-radius-border-radius-3xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] shadow-elevation-lg',
          className,
        )}
        {...props}
      >
        <div
          aria-hidden
          className="flex items-center gap-3 border-0 border-b border-solid border-[var(--color-border-border-subtler)] bg-[var(--color-bg-surface-bg-surface-sunken)] px-4 py-2.5"
        >
          <span className="flex shrink-0 gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-2.5 rounded-full bg-[var(--color-border-border-subtle)]" />
            ))}
          </span>
          {url && (
            <span className="mx-auto min-w-0 max-w-[60%] truncate rounded-full bg-[var(--color-bg-surface-bg-surface)] px-4 py-1 text-center font-body text-body-xs text-[var(--color-text-text-subtle)]">
              {url}
            </span>
          )}
          {/* Balances the dots so the address sits in the middle. */}
          {url && <span className="w-[42px] shrink-0" />}
        </div>
        <div className="min-h-0 [&>img]:block [&>img]:w-full">{children}</div>
      </div>
    );
  }

  return (
    // The outer box is the size container: the bezel's radius and width,
    // and the island, scale with the phone's width (cqw), so a small phone
    // keeps the same proportions.
    <div data-slot="device-frame" data-type="phone" className={cn('@container w-[320px] max-w-full shrink-0', className)} {...props}>
      {/* The bezel: near-black in both themes, as a real device. */}
      <div className="relative rounded-[13cqw] bg-[#121214] p-[3cqw] shadow-elevation-lg ring-1 ring-black/10">
        <div
          data-canvas={screen === 'canvas' ? 'gradient' : undefined}
          // A page screen is the theme's own surface, also when the phone lies
          // on a gradient canvas: data-surface="card" brings the theme's ink back.
          data-surface={screen === 'page' ? 'card' : undefined}
          className={cn(
            'relative aspect-[9/19.5] w-full overflow-hidden rounded-[10cqw] [&>img]:block [&>img]:size-full [&>img]:object-cover',
            screen === 'page' && 'bg-[var(--color-bg-surface-bg-surface-base)] text-[var(--color-text-text)]',
          )}
        >
          {children}
          {/* The camera island, over the content like the real one. Physical left: it is centred either way. */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[2.6cqw] z-10 h-[7.5cqw] w-[30cqw] -translate-x-1/2 rounded-full bg-[#121214]"
          />
        </div>
      </div>
    </div>
  );
}
