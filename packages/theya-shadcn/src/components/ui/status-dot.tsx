import { cn } from '@/lib/utils';

/**
 * 7px semantic dot. Use beside text for live status ("● Running"),
 * never as its own children — always pair with a text label as a
 * sibling (status is never color-only).
 *
 * `inverse` swaps to the --color-*-on-dark palette, for a dot placed
 * on a surface that's forced dark regardless of the page's own theme
 * (e.g. Terminal's `inverse` header) — same convention as Terminal/
 * CodeEditor's own `inverse` prop.
 */
export type StatusTone = 'success' | 'warning' | 'destructive' | 'neutral' | 'primary' | 'info';

// success/warning/destructive/primary/info originally all used the same
// `bg-{tone}-bg-{tone}-status` token in both themes — a dedicated, solid
// (non-alpha) fill one ramp step lighter than the plain `bg-{tone}` used
// for filled-button surfaces, since `bg-{tone}` alone read as too dark/
// muted for a small 7px accent dot in DARK theme (Мария: "все же сейчас
// они очень темные"). The `-subtle` tokens were considered as an
// alternative but are alpha (`{tone}-a300`–`a500`, 30-50% opacity, e.g.
// `bg-warning-subtle: rgba(255,160,77,0.3)`), so a dot would look
// different depending on what's behind it — ruled out. Dark-theme
// -status values (non-monotonic ramp, hand-picked): primary blue-300,
// info blue-500, success green-400, warning orange-400, danger red-300.
//
// Мария caught a bug (2026-09-26): in LIGHT theme the `-status` token is
// unnecessary and wrong for warning specifically — the plain solid
// `bg-{tone}-bg-{tone}` fill already reads fine on a light dot for
// success/destructive/primary/info, so those now use the plain fill in
// light theme, keeping `-status` only for dark theme (via the
// `[data-theme=dark]` arbitrary-ancestor-variant, same mechanism as
// button.tsx's filled×warning fix). Warning is the one exception in
// BOTH themes: `bg-warning-bg-warning` is yellow-400 (too pale at 7px)
// and light-theme `-status` is even paler (yellow-100) — landed on the
// primitive `--color-yellow-yellow-300` directly for light theme
// (Мария's call), dark theme unchanged (orange-400 `-status`). `neutral`
// is the one tone with no `-status` counterpart in either theme:
// `bg-neutral-bg-neutral` is alpha (gray-a500, meant for a surface fill
// over a known background), wrong for a dot needing a background-
// independent solid fill either way, so it keeps borrowing the solid
// `icon-icon-subtle` token, same as ToneIcon's own neutral glyph color.
const TONE_CLASS: Record<StatusTone, string> = {
  success: 'bg-[var(--color-bg-success-bg-success)] [[data-theme=dark]_&]:bg-[var(--color-bg-success-bg-success-status)]',
  warning: 'bg-[var(--color-yellow-yellow-300)] [[data-theme=dark]_&]:bg-[var(--color-bg-warning-bg-warning-status)]',
  destructive: 'bg-[var(--color-bg-danger-bg-danger)] [[data-theme=dark]_&]:bg-[var(--color-bg-danger-bg-danger-status)]',
  neutral: 'bg-[var(--color-icon-icon-subtle)]',
  primary: 'bg-[var(--color-bg-primary-bg-primary)] [[data-theme=dark]_&]:bg-[var(--color-bg-primary-bg-primary-status)]',
  info: 'bg-[var(--color-bg-info-bg-info)] [[data-theme=dark]_&]:bg-[var(--color-bg-info-bg-info-status)]',
};

const TONE_CLASS_INVERSE: Record<StatusTone, string> = {
  success: 'bg-[var(--color-bg-success-bg-success-on-dark)]',
  warning: 'bg-[var(--color-bg-warning-bg-warning-on-dark)]',
  destructive: 'bg-[var(--color-bg-danger-bg-danger-on-dark)]',
  neutral: 'bg-[var(--color-icon-icon-subtler-on-dark)]',
  primary: 'bg-[var(--color-bg-primary-bg-primary-on-dark)]',
  info: 'bg-[var(--color-bg-info-bg-info-on-dark)]',
};

export interface StatusDotProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  tone?: StatusTone;
  inverse?: boolean;
}

export function StatusDot({ className, tone = 'neutral', inverse = false, ...props }: StatusDotProps) {
  return <span data-slot="status-dot" role="presentation" className={cn('inline-block size-[0.4375rem] shrink-0 rounded-full', inverse ? TONE_CLASS_INVERSE[tone] : TONE_CLASS[tone], className)} {...props} />;
}
