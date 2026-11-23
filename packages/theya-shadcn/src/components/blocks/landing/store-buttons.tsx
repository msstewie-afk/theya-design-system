'use client';

import { useEffect, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { Apple, PlaySolid } from 'iconoir-react';
import { cn } from '../../../lib/utils';

export type Store = 'app-store' | 'google-play';
export type StoreDevice = 'ios' | 'android' | 'other';

export interface StoreButtonsProps extends ComponentProps<'div'> {
  /** The App Store page. Leave out when the app is not on iOS. */
  appStore?: string;
  /** The Google Play page. Leave out when the app is not on Android. */
  googlePlay?: string;
  /**
   * `device` (default): one button on a phone or tablet — App Store on
   * iPhone and iPad, Google Play on Android — and both on a computer.
   * `both`: always both.
   */
  show?: 'device' | 'both';
  /** Pretend to be this device (stories, tests). Default: read the browser. */
  device?: StoreDevice;
  /**
   * The official badges, when you have them (needed at launch: the stores
   * ask for their own artwork). Each replaces the drawn button's content;
   * the link and the device choice stay.
   */
  badges?: Partial<Record<Store, ReactNode>>;
  /** Default 'lg' (48px). */
  size?: 'md' | 'lg';
}

/** Which store this browser belongs to. iPadOS reports itself as a Mac with touch. */
export function detectStoreDevice(): StoreDevice {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  return 'other';
}

const LABEL: Record<Store, { top: string; name: string }> = {
  'app-store': { top: 'Download on the', name: 'App Store' },
  'google-play': { top: 'Get it on', name: 'Google Play' },
};

/**
 * App store buttons for a landing page: black, two lines, like the stores'
 * own badges, and one per device. The page renders both first (also on the
 * server) and narrows to the visitor's store after it loads, so nothing
 * shifts for a computer and a phone sees its own store.
 *
 * The drawn buttons are for building and previews; swap in the official
 * badges through `badges` before launch.
 */
export function StoreButtons({ appStore, googlePlay, show = 'device', device, badges, size = 'lg', className, ...props }: StoreButtonsProps) {
  const [detected, setDetected] = useState<StoreDevice>(device ?? 'other');
  useEffect(() => {
    if (!device) setDetected(detectStoreDevice());
  }, [device]);
  const current = device ?? detected;

  const stores: [Store, string][] = [];
  if (appStore && (show === 'both' || current !== 'android')) stores.push(['app-store', appStore]);
  if (googlePlay && (show === 'both' || current !== 'ios')) stores.push(['google-play', googlePlay]);

  return (
    <div data-slot="store-buttons" className={cn('flex flex-wrap items-center gap-3', className)} {...props}>
      {stores.map(([store, href]) => (
        <a
          key={store}
          href={href}
          data-store={store}
          // The visible text reads "Download on the App Store": the name says the same.
          aria-label={`${LABEL[store].top} ${LABEL[store].name}`}
          className={cn(
            // raw-ok: the stores' badges are black with white type and a gray hairline in every theme; not a theme color.
            'inline-flex items-center gap-2.5 rounded-[var(--size-border-radius-border-radius-xl)] border border-solid border-[#a6a6a6] bg-[#000000] text-[#ffffff] no-underline',
            'outline-none ring-offset-2 ring-offset-[var(--color-bg-surface-bg-surface-base)] transition-[opacity] duration-fast ease-standard focus-visible:ring-2 focus-visible:ring-[var(--color-focus-focus-ring)] hover:opacity-85',
            // Forced colors: the black fill is dropped; the edge shows as a link.
            'forced-colors:border-[LinkText]',
            badges?.[store] ? 'p-0' : size === 'lg' ? 'h-12 ps-3.5 pe-5' : 'h-10 ps-3 pe-4',
          )}
        >
          {badges?.[store] ?? (
            <>
              {store === 'app-store' ? (
                <Apple aria-hidden className={cn('shrink-0', size === 'lg' ? 'size-6' : 'size-5')} />
              ) : (
                <PlaySolid aria-hidden className={cn('shrink-0', size === 'lg' ? 'size-6' : 'size-5')} />
              )}
              <span className="flex flex-col items-start leading-none">
                <span className="font-body text-[0.625rem] font-medium tracking-[0.02em]">{LABEL[store].top}</span>
                <span className={cn('font-body font-semibold tracking-[-0.01em]', size === 'lg' ? 'text-body-l' : 'text-body-m')}>{LABEL[store].name}</span>
              </span>
            </>
          )}
        </a>
      ))}
    </div>
  );
}
