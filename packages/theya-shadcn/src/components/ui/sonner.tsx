import type { ReactNode } from 'react';
import { Toaster as SonnerToaster, toast as sonnerToast, type ExternalToast, type ToasterProps } from 'sonner';
import { Progress } from './progress';
import { useTheme } from './use-theme';
import { cn } from '@/lib/utils';

/**
 * Mount once near the app root. Trigger toasts with the `toast` this
 * module re-exports (not sonner's own): `import { toast } from
 * '@/components/ui/sonner'`. Wires our token system into sonner's CSS
 * variable theming API rather than reskinning its DOM.
 *
 * `dark` forces the fixed dark-overlay surface (the same `-overlay-dark`/
 * `-on-dark` token family Tooltip's dark surface uses) regardless of the
 * page's own light/dark theme — the toast always reads the same, like a
 * floating notification rather than a themed page element. Default `false`
 * keeps the current theme-reactive surface (light tokens in light mode).
 *
 * `position` defaults to `"bottom-right"` (matches sonner's own library
 * default — set explicitly here so it's a documented choice, not an
 * implicit one).
 *
 * `closeButton` defaults to `true` (every toast gets one) — pass `false`
 * to turn it off globally, same sonner prop as before, just a different
 * default.
 */
export interface DsToasterProps extends ToasterProps {
  dark?: boolean;
}

export function Toaster({ closeButton = true, dark = false, position = 'bottom-right', toastOptions, ...props }: DsToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <SonnerToaster
      theme={dark ? 'dark' : resolvedTheme}
      position={position}
      className="toaster group"
      closeButton={closeButton}
      style={
        {
          // 400px per the Figma spec (width/width-notification) — applies to
          // both surfaces, not just dark.
          '--width': 'var(--size-width-width-notification)',
          ...(dark
            ? {
                '--normal-bg': 'var(--color-bg-surface-bg-surface-overlay-dark)',
                '--normal-text': 'var(--color-text-text-on-dark)',
                // No border on the dark surface — same call as Tooltip's dark
                // surface (shadow carries the edge, not a border color).
                '--normal-border': 'transparent',
              }
            : {
                '--normal-bg': 'var(--color-bg-surface-bg-surface-overlay)',
                '--normal-text': 'var(--color-text-text)',
                '--normal-border': 'var(--color-border-border-subtle)',
              }),
          '--border-radius': 'var(--size-border-radius-border-radius-2xl)',
          '--toast-close-button-transform': 'translateY(-50%)',
        } as React.CSSProperties
      }
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast:
            'group toast has-[[data-description]]:items-start! has-[[data-description]]:[&_[data-icon]]:mt-1 ' +
            (dark ? 'border-0 shadow-xl' : 'border border-solid shadow-lg') +
            ' has-[[data-close-button]]:pr-12!',
          content: 'flex-1 min-w-0',
          // 14px, not the Figma frame's raw Heading XS/16px value — Мария
          // confirmed 14px live in Storybook, overriding the Figma-derived
          // guess above.
          title: 'font-body text-body-m font-semibold',
          description: dark ? 'font-body text-body-s text-[var(--color-text-text-subtle-on-dark)]' : 'font-body text-body-s text-[var(--color-text-text-subtler)]',
          actionButton: 'bg-[var(--color-bg-primary-bg-primary)] text-[var(--color-icon-icon-on-dark)] rounded-[var(--size-border-radius-border-radius-sm)]',
          cancelButton: dark
            ? 'bg-white/10 text-[var(--color-text-text-subtle-on-dark)] rounded-[var(--size-border-radius-border-radius-sm)]'
            : 'bg-[var(--color-bg-neutral-bg-neutral-subtle)] text-[var(--color-text-text-subtler)] rounded-[var(--size-border-radius-border-radius-sm)]',
          closeButton:
            'size-7! rounded-[var(--size-border-radius-border-radius-sm)]! border-0! bg-transparent! opacity-80! ' +
            (dark ? 'text-[var(--color-icon-icon-subtler-on-dark)]! hover:bg-white/10!' : 'text-[var(--color-icon-icon-subtle)]! hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)]!') +
            ' left-auto! right-[13px]! top-1/2! transition-colors hover:opacity-100! ' +
            'focus-visible:outline-none! focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]! [&_svg]:size-4!',
          error: dark ? '[&_[data-icon]]:text-[var(--color-icon-icon-danger-on-dark)]' : '[&_[data-icon]]:text-[var(--color-icon-icon-danger)]',
          success: dark ? '[&_[data-icon]]:text-[var(--color-icon-icon-success-on-dark)]' : '[&_[data-icon]]:text-[var(--color-icon-icon-success)]',
          // Fixed 2026-09-26 (DS-wide token pass): '--color-icon-icon-warning-bright' was
          // never a real token — same invented-token bug already fixed on StatusDot
          // earlier this session, missed here. Swapped to the real
          // '--color-icon-icon-warning' token, matching the error/success/info
          // siblings' own light-theme pattern exactly.
          warning: dark ? '[&_[data-icon]]:text-[var(--color-icon-icon-warning-on-dark)]' : '[&_[data-icon]]:text-[var(--color-icon-icon-warning)]',
          info: dark ? '[&_[data-icon]]:text-[var(--color-icon-icon-info-on-dark)]' : '[&_[data-icon]]:text-[var(--color-icon-icon-info)]',
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  );
}

/** Data for `toast.progress` — everything toast() takes except description, plus the required value. */
export type ProgressToastData = Omit<ExternalToast, 'description'> & {
  /** 0-100. Out-of-range values are clamped. */
  value: number;
  description?: ReactNode;
};

type ToastApi = typeof sonnerToast & {
  progress: (message: Parameters<typeof sonnerToast>[0], data: ProgressToastData) => ReturnType<typeof sonnerToast>;
  accent: (message: Parameters<typeof sonnerToast>[0], data?: ExternalToast) => ReturnType<typeof sonnerToast>;
};

/**
 * sonner's API with three additions:
 * - `toast.error` persists until dismissed (an error scrolled past is
 *   an error hit again) and always renders a close button.
 * - `toast.warning` always renders a close button.
 * - `toast.progress` composes our Progress bar into the description
 *   slot for a percentage-driven toast sonner has no primitive for.
 *   Keep the returned id and call it again to update in place; pass
 *   `description` explicitly on whatever toast ends the sequence
 *   (sonner MERGES a same-id update, it doesn't replace the toast).
 * - `toast.accent` is the sixth, odd-one-out kind from the Figma spec
 *   (Feedback/Toaster): a fixed light-blue surface, independent of the
 *   Toaster's own `dark` mode — it stays the same light-blue tint whether
 *   the rest of the toasts on the page are light or dark. For a message
 *   that should read as "worth noticing" rather than any of the five
 *   status kinds (a tip, a new-feature callout, not success/error/warning/
 *   info about an action just taken).
 */
export const toast: ToastApi = Object.assign(((...args: Parameters<ToastApi>) => sonnerToast(...args)) as ToastApi, sonnerToast, {
  error: ((message: Parameters<ToastApi['error']>[0], data?: Parameters<ToastApi['error']>[1]) =>
    sonnerToast.error(message, { duration: Number.POSITIVE_INFINITY, closeButton: true, ...data })) as ToastApi['error'],
  warning: ((message: Parameters<ToastApi['warning']>[0], data?: Parameters<ToastApi['warning']>[1]) =>
    sonnerToast.warning(message, { closeButton: true, ...data })) as ToastApi['warning'],
  progress: ((message: Parameters<ToastApi>[0], data: ProgressToastData) => {
    const { value, description, classNames, ...rest } = data;
    const pct = Math.min(100, Math.max(0, value));
    return sonnerToast(message, {
      duration: Number.POSITIVE_INFINITY,
      ...rest,
      classNames: {
        ...classNames,
        toast: cn('has-[[data-action]]:pr-13!', classNames?.toast),
        actionButton: cn(
          'absolute! right-[13px]! top-3! h-7! rounded-[var(--size-border-radius-border-radius-sm)]! border-0! bg-transparent! px-2! ' +
            'text-body-xs! font-medium! text-[var(--color-text-text)]! opacity-80! shadow-none! transition-colors ' +
            'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)]! hover:opacity-100! focus-visible:outline-none! ' +
            'focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]!',
          classNames?.actionButton,
        ),
      },
      description: (
        <div className="flex flex-col gap-1.5">
          {description}
          <div className="flex items-center gap-2">
            <span className="shrink-0 font-body text-body-xs text-[var(--color-text-text-subtler)] tabular-nums">{Math.round(pct)}%</span>
            {/* Named after the toast's own message: an unnamed progressbar
                is an axe aria-progressbar-name violation and is announced
                as just "progress bar". */}
            <Progress value={pct} aria-label={typeof message === 'string' ? message : 'Progress'} className="flex-1" />
          </div>
        </div>
      ),
    });
  }) as ToastApi['progress'],
  accent: ((message: Parameters<typeof sonnerToast>[0], data?: ExternalToast) => {
    const { classNames, ...rest } = data ?? {};
    return sonnerToast(message, {
      ...rest,
      classNames: {
        ...classNames,
        // Fixed light-blue surface (bg-primary-subtle, same value as
        // bg-info-subtle in the Figma file) — `!` because this overrides
        // the Toaster's own --normal-bg/-text/-border, on top of dark mode.
        toast: cn(
          'bg-[var(--color-bg-primary-bg-primary-subtle)]! border-transparent! text-[var(--color-text-text)]! shadow-lg',
          classNames?.toast,
        ),
        title: cn('font-body text-body-m font-semibold', classNames?.title),
        description: cn('font-body text-body-s text-[var(--color-text-text-subtler)]', classNames?.description),
        closeButton: cn(
          'size-7! rounded-[var(--size-border-radius-border-radius-sm)]! border-0! bg-transparent! text-[var(--color-icon-icon-subtle)]! opacity-80! ' +
            'left-auto! right-[13px]! top-1/2! transition-colors hover:bg-[var(--color-bg-primary-bg-primary-subtle-hover)]! hover:opacity-100! ' +
            'focus-visible:outline-none! focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]! [&_svg]:size-4!',
          classNames?.closeButton,
        ),
      },
    });
  }) as ToastApi['accent'],
});
