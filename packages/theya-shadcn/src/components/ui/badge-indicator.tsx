import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * BadgeIndicator — a small counter/status indicator (16/20px), distinct from
 * the pill-shaped <Badge/>. Renders a qty value, a plain dot, or an icon,
 * with a filled or outlined treatment and a round or squared corner.
 *
 * Geometry (size/radius/dot/icon dimensions) is set via inline `style`
 * rather than Tailwind's `size-*` / `rounded-*` utilities — this project's
 * build was found to silently drop those utility classes when combined with
 * CSS vars (see Avatar). Colors stay as Tailwind arbitrary-value classes,
 * which are confirmed to work fine.
 */
export type BadgeIndicatorTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type BadgeIndicatorAppearance = 'filled' | 'outlined';
export type BadgeIndicatorShape = 'circle' | 'square';
export type BadgeIndicatorSize = 'sm' | 'md';

const SIZE_PX: Record<BadgeIndicatorSize, number> = { sm: 16, md: 20 };

// Square-shape corner radius. EXTRAPOLATED from Theya's radius scale
// (sm=4 / md=6) — the Figma MCP rate limit was hit before the Squared-border
// variant of this component could be fetched directly. Worth a Figma re-check.
const SQUARE_RADIUS_PX: Record<BadgeIndicatorSize, number> = { sm: 4, md: 6 };

// Dot-value diameter and icon-value box. Not present in the fetched Qty specs
// (those only covered the text/number treatment) — EXTRAPOLATED as roughly
// half the badge box, centered. Worth a Figma re-check against the real
// Dot Small / Dot Medium / Icon variants.
const DOT_PX: Record<BadgeIndicatorSize, number> = { sm: 8, md: 10 };
const ICON_PX: Record<BadgeIndicatorSize, number> = { sm: 10, md: 12 };

// Horizontal padding for the qty/value treatment. `sm` (4px) matches the
// fetched Figma spec (Inactive/Filled/Small/Round/Qty, padding-2xs); `md` is
// extrapolated up one step.
const PADDING_X_PX: Record<BadgeIndicatorSize, number> = { sm: 4, md: 5 };

interface ToneTokens {
  filledBg: string;
  filledText: string;
  outlinedBg: string;
  outlinedBorder: string;
  outlinedText: string;
}

/**
 * Filled treatment uses the same `bg-{tone}-bg-{tone}-status` family
 * StatusDot's Tones and Timeline's dots/icon-chips use — one ramp step
 * lighter than the plain solid `bg-{tone}-bg-{tone}` fill (see
 * status-dot.tsx for the full rationale/token values). Went through two
 * iterations this session: first from the wrong `icon-icon-{tone}` tokens
 * (meant for an icon glyph ON a surface, not for BEING one — read as an
 * oddly pale, washed-out blue) to the plain solid `bg-{tone}-bg-{tone}`
 * fill Button/Chip/Alert-stripe use — which Мария then flagged as too DARK
 * next to StatusDot's own (lighter) Tones, so it landed here instead, on
 * the same `-status` tokens for consistency across every small
 * tone-indicator component in the library. `neutral` first tried the real solid neutral fill
 * `bg-neutral-bg-neutral` (Мария: "надо bg-neutral какой-то") with
 * `--color-black` text (that alpha white composites light enough that white
 * text would wash out against it) — but Мария then asked for something less
 * flatly gray, so it's on Button's own filled-Secondary base color instead
 * (`#6a6c96`, a purple-leaning gray — not yet a semantic token, hardcoded
 * the same way Button itself hardcodes it, see button.tsx's own
 * `tone: 'secondary'` compound variant), with white `text-on-dark` (same
 * pairing Button uses, confirmed working contrast).
 * Outlined treatment (all subtle-bg + tone border/text) is unaffected by
 * this fix and still EXTRAPOLATED for Success/Warning/Danger — worth a
 * Figma re-check once the MCP rate limit resets.
 */
const TONE_TOKENS: Record<BadgeIndicatorTone, ToneTokens> = {
  neutral: {
    filledBg: 'bg-[#6a6c96]',
    filledText: 'text-[var(--color-text-text-on-dark)]',
    outlinedBg: 'bg-[var(--color-bg-secondary-bg-secondary-subtle)]',
    outlinedBorder: 'border-[var(--color-border-border)]',
    outlinedText: 'text-[var(--color-text-text-subtler)]',
  },
  info: {
    filledBg: 'bg-[var(--color-bg-info-bg-info-status)] [[data-theme=dark]_&]:bg-[var(--color-cyan-cyan-700)]',
    filledText: 'text-[var(--color-text-text-on-dark)]',
    outlinedBg: 'bg-[var(--color-bg-info-bg-info-subtle)]',
    outlinedBorder: 'border-[var(--color-border-border-info)]',
    outlinedText: 'text-[var(--color-text-text-link-on-tonal)]',
  },
  success: {
    filledBg: 'bg-[var(--color-bg-success-bg-success-status)]',
    filledText: 'text-[var(--color-text-text-on-dark)]',
    // Outlined — extrapolated, not fetched
    outlinedBg: 'bg-[var(--color-bg-success-bg-success-subtle)]',
    outlinedBorder: 'border-[var(--color-border-border-success)]',
    outlinedText: 'text-[var(--color-text-text-success)]',
  },
  warning: {
    // Outlined — extrapolated, not fetched
    filledBg: 'bg-[var(--color-bg-warning-bg-warning-status)]',
    filledText: 'text-[var(--color-text-text-warning)] [[data-theme=dark]_&]:text-[var(--color-text-text-on-dark)]',
    outlinedBg: 'bg-[var(--color-bg-warning-bg-warning-subtle)]',
    outlinedBorder: 'border-[var(--color-border-border-warning)]',
    outlinedText: 'text-[var(--color-text-text-warning)]',
  },
  danger: {
    // Outlined — extrapolated, not fetched
    filledBg: 'bg-[var(--color-bg-danger-bg-danger-status)]',
    filledText: 'text-[var(--color-text-text-on-dark)]',
    outlinedBg: 'bg-[var(--color-bg-danger-bg-danger-subtle)]',
    outlinedBorder: 'border-[var(--color-border-border-danger)]',
    outlinedText: 'text-[var(--color-text-text-danger)]',
  },
};

const TEXT_SIZE: Record<BadgeIndicatorSize, string> = {
  sm: 'text-body-xs', // 11px/14 — matches fetched Figma spec (Body/XS Bold) at Small
  md: 'text-body-s', // extrapolated one step up Theya's type scale
};

export interface BadgeIndicatorProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Qty/text content, e.g. '5' or '99+'. Ignored when `dot` is set; if `icon` is also set, `icon` wins. */
  value?: ReactNode;
  /** Renders a plain dot instead of `value`/`icon` — takes priority over both. */
  dot?: boolean;
  /** Icon content (sized by BadgeIndicator, colored via currentColor). Ignored when `dot` is set. */
  icon?: ReactNode;
  appearance?: BadgeIndicatorAppearance;
  shape?: BadgeIndicatorShape;
  tone?: BadgeIndicatorTone;
  size?: BadgeIndicatorSize;
}

export function BadgeIndicator({
  value,
  dot = false,
  icon,
  appearance = 'filled',
  shape = 'circle',
  tone = 'neutral',
  size = 'sm',
  className,
  style,
  ...props
}: BadgeIndicatorProps) {
  const tokens = TONE_TOKENS[tone];
  const box = SIZE_PX[size];
  const isFilled = appearance === 'filled';

  const colorClass = isFilled
    ? cn(tokens.filledBg, tokens.filledText)
    : cn(tokens.outlinedBg, tokens.outlinedText, tokens.outlinedBorder, 'border border-solid');

  if (dot) {
    const dotPx = DOT_PX[size];
    const dotRadius = shape === 'circle' ? 9999 : SQUARE_RADIUS_PX[size];
    return (
      <span
        data-slot="badge-indicator"
        aria-hidden="true"
        className={cn('inline-block shrink-0', colorClass, className)}
        style={{ width: dotPx, height: dotPx, borderRadius: dotRadius, boxSizing: 'border-box', ...style }}
        {...props}
      />
    );
  }

  const hasIcon = icon != null;
  const content = hasIcon ? (
    <span
      className="flex items-center justify-center [&_svg]:h-full [&_svg]:w-full"
      style={{ width: ICON_PX[size], height: ICON_PX[size] }}
    >
      {icon}
    </span>
  ) : (
    value
  );

  const geometry: CSSProperties = {
    minWidth: box,
    height: box,
    borderRadius: shape === 'circle' ? 9999 : SQUARE_RADIUS_PX[size],
    paddingLeft: hasIcon ? 0 : PADDING_X_PX[size],
    paddingRight: hasIcon ? 0 : PADDING_X_PX[size],
    boxSizing: 'border-box',
    ...style,
  };

  return (
    <span
      data-slot="badge-indicator"
      className={cn(
        'inline-flex shrink-0 items-center justify-center whitespace-nowrap',
        'font-body font-bold leading-none',
        TEXT_SIZE[size],
        colorClass,
        className,
      )}
      style={geometry}
      {...props}
    >
      {content}
    </span>
  );
}
