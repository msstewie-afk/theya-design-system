import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { createContext, useContext } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { BadgeIndicator } from './badge-indicator';
import type { BadgeIndicatorProps } from './badge-indicator';

export type AvatarSize = 'sm' | 'md' | 'lg'; // 32 / 48 / 64 — Figma Small/Medium/Large
export type AvatarShape = 'circle' | 'square';
/** Fallback fill treatment — independent of `outline`. */
export type AvatarAppearance = 'tonal' | 'filled';
/** Ring treatment, independent of `appearance`. 'none' draws no ring at all. */
export type AvatarOutline = 'none' | 'solid' | 'gradient';
/** Figma's Type variant — which content the avatar shows. */
export type AvatarContentType = 'icon' | 'image' | 'text';

// All geometry (size, radius, padding) is set via inline `style`, not
// Tailwind classes — after two rounds of `size-*`/arbitrary-value classes
// silently failing to apply, this is the one path with no build/JIT
// dependency at all. Tailwind classes are only used below for things
// already proven reliable elsewhere in this codebase (colors via
// `bg-[var(...)]`, text/flex utilities).
const SIZE_PX: Record<AvatarSize, number> = { sm: 32, md: 48, lg: 64 };

// `AvatarFallback` is composed as a child (`<Avatar size="lg"><AvatarFallback>
// AL</AvatarFallback></Avatar>`), so it has no direct access to the parent's
// own `size` prop — shared via context instead. Defaults to 'sm' to match
// Avatar's own default.
const AvatarSizeContext = createContext<AvatarSize>('sm');

// Initials/icon fallback text size, scaled to the avatar itself — was a flat
// `text-body-xs` (11px) at every size, unreadably small once the avatar grew
// past 32px. sm keeps its original size; md/lg step up with the avatar
// (Мария: md size 14, lg size 20).
const FALLBACK_TEXT_CLASS: Record<AvatarSize, string> = {
  sm: 'text-body-xs', // 11px — unchanged
  md: 'text-body-m', // 14px
  lg: 'text-heading-s', // 20px
};

// Three nested radii, one per DOM layer (outer ring → gap ring → content),
// each 2px tighter than the one outside it so the corners stay visually
// concentric instead of the inner layer reading rounder than the ring
// around it.
//
// Figma only confirms border-radius-xl (8px) at the Small size for the
// square shape; the -6px/-4px steps assume that stays 8px at every size —
// revisit if Medium/Large turn out to use a different token.
const SHAPE_RADIUS: Record<AvatarShape, { outer: string; gap: string; content: string }> = {
  circle: { outer: '9999px', gap: '9999px', content: '9999px' },
  square: { outer: 'var(--size-border-radius-border-radius-xl)', gap: '6px', content: '4px' },
};

// Figma's "Avatar gradient" style — an angular (conic) sweep through
// blue-200 (#63acff), purple-200 (#cc75eb), teal-200 (#18bbb6), per node
// 32031:22869 confirmed by Мария. No semantic Theya token covers a
// raw-palette gradient like this yet, so the hex stops are used directly —
// swap in real tokens if/when they exist. Rotation start angle is a visual
// approximation, not pulled from an exact Figma angle value.
const AVATAR_GRADIENT = 'conic-gradient(from 0deg, #63acff, #cc75eb, #18bbb6, #63acff)';

const FULL_SIZE_STYLE: CSSProperties = { width: '100%', height: '100%', boxSizing: 'border-box' };

export interface AvatarProps extends React.ComponentProps<typeof AvatarPrimitive.Root> {
  size?: AvatarSize;
  shape?: AvatarShape;
  /**
   * Ring around the avatar, drawn as two nested rings per Figma: an outer
   * colored ring (`'solid'` = flat `--color-border-border-primary`,
   * `'gradient'` = the conic sweep above) and, inside it, a background-color
   * separator ring so the colored ring doesn't sit flush against the photo.
   * `'none'` (not in Figma's variant set, added for flexibility) skips both
   * and lets `AvatarImage`/`AvatarFallback` fill the full shape.
   */
  outline?: AvatarOutline;
  /**
   * The background-color separator ring between the colored `outline` ring
   * and the content (Figma's `innerOutline`). On by default; set `false` to
   * let the colored ring sit flush against the photo/fallback instead. No
   * effect when `outline="none"`.
   */
  separator?: boolean;
  /**
   * Shorthand for Figma's Type variant — renders the matching content
   * (`icon`/`src`+`alt`/`initials` below) without composing
   * `AvatarImage`/`AvatarFallback` by hand. Omit `type` and pass
   * `AvatarImage`/`AvatarFallback`/`AvatarBadge` as `children` directly for
   * full control (e.g. a custom fallback delay, or a badge).
   */
  type?: AvatarContentType;
  /** `type="text"`: the initials/short text to show. */
  initials?: ReactNode;
  /** `type="icon"`: the icon element to show. */
  icon?: ReactNode;
  /** `type="image"`: the image source. */
  src?: string;
  /** `type="image"`: required alt text — announced in place of the photo. */
  alt?: string;
  /** `type="image"`: shown while the image loads or if it fails to load. Falls back to `initials`, then `icon`. */
  fallback?: ReactNode;
  /** Fill for `AvatarFallback` when using the `type` shorthand (`text`/`icon`/an image's fallback). Independent of `outline`. */
  appearance?: AvatarAppearance;
}

/**
 * Avatar — circular (or squircle) identity marker on @radix-ui/react-avatar,
 * per Figma node 29283:3907. Shows an image and falls back to initials or an
 * icon when the image is missing or still loading. Compose with
 * `AvatarImage`, `AvatarFallback`, and optionally `AvatarBadge`.
 */
export function Avatar({
  className,
  style,
  size = 'sm',
  shape = 'circle',
  outline = 'gradient',
  separator = true,
  type,
  initials,
  icon,
  src,
  alt,
  fallback,
  appearance = 'tonal',
  children,
  ...props
}: AvatarProps) {
  const hasOutline = outline !== 'none';
  const px = SIZE_PX[size];
  const radii = SHAPE_RADIUS[shape];

  // `type` is a shorthand over the same Image/Fallback composition — when
  // it's set, build `children` from it instead of requiring the caller to
  // compose AvatarImage/AvatarFallback by hand. Explicit `children` (no
  // `type`) still works exactly as before.
  const resolvedChildren =
    type === 'text' ? (
      <AvatarFallback appearance={appearance}>{initials}</AvatarFallback>
    ) : type === 'icon' ? (
      <AvatarFallback appearance={appearance}>{icon}</AvatarFallback>
    ) : type === 'image' ? (
      <>
        <AvatarImage src={src} alt={alt ?? ''} />
        <AvatarFallback appearance={appearance}>{fallback ?? initials ?? icon}</AvatarFallback>
      </>
    ) : (
      children
    );

  // One fewer nesting level when the separator ring is off — the content
  // then sits directly at the ring's inner edge (`radii.gap`) instead of
  // one step further in (`radii.content`).
  const contentRadius = !hasOutline ? radii.outer : separator ? radii.content : radii.gap;
  const content = <div style={{ ...FULL_SIZE_STYLE, borderRadius: contentRadius }}>{resolvedChildren}</div>;

  return (
    <AvatarSizeContext.Provider value={size}>
      <AvatarPrimitive.Root
        data-slot="avatar"
        data-outline={outline}
        className={cn('relative block shrink-0', className)}
        style={{ width: px, height: px, borderRadius: radii.outer, flexShrink: 0, ...style }}
        {...props}
      >
        {hasOutline ? (
          <div
            style={{
              ...FULL_SIZE_STYLE,
              borderRadius: radii.outer,
              padding: 2,
              background: outline === 'gradient' ? AVATAR_GRADIENT : 'var(--color-border-border-primary)',
            }}
          >
            {separator ? (
              <div
                className="bg-[var(--color-bg-surface-bg-surface)]"
                style={{ ...FULL_SIZE_STYLE, borderRadius: radii.gap, padding: 2 }}
              >
                {content}
              </div>
            ) : (
              content
            )}
          </div>
        ) : (
          content
        )}
      </AvatarPrimitive.Root>
    </AvatarSizeContext.Provider>
  );
}

export function AvatarImage({ className, style, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      className={cn('block object-cover', className)}
      style={{ width: '100%', height: '100%', borderRadius: 'inherit', ...style }}
      {...props}
    />
  );
}

export interface AvatarFallbackProps extends React.ComponentProps<typeof AvatarPrimitive.Fallback> {
  appearance?: AvatarAppearance;
}

export function AvatarFallback({ className, style, appearance = 'tonal', delayMs, ...props }: AvatarFallbackProps) {
  const avatarSize = useContext(AvatarSizeContext);
  return (
    <AvatarPrimitive.Fallback
      delayMs={delayMs}
      className={cn(
        'flex items-center justify-center font-body font-semibold',
        FALLBACK_TEXT_CLASS[avatarSize],
        appearance === 'filled'
          ? 'bg-[var(--color-bg-primary-bg-primary)] text-[var(--color-text-text-on-dark)]'
          : 'bg-[var(--color-bg-primary-bg-primary-subtle)] text-[var(--color-text-text-link-on-tonal)]',
        className,
      )}
      style={{ width: '100%', height: '100%', borderRadius: 'inherit', ...style }}
      {...props}
    />
  );
}

export interface AvatarBadgeProps extends Omit<BadgeIndicatorProps, 'value'> {
  /** Shorthand for `value` — lets `<AvatarBadge>3</AvatarBadge>` keep working. */
  children?: ReactNode;
  value?: ReactNode;
  /**
   * Ring in the surface background color, separating the badge from the
   * avatar/photo underneath (Figma's separator ring, same idea as `Avatar`'s
   * own `separator` prop). On by default.
   */
  separator?: boolean;
}

/**
 * Counter/status badge pinned to the top-right corner — a positioned
 * `BadgeIndicator`. Pass as a sibling of `AvatarImage`/`AvatarFallback`
 * inside `Avatar`. Positions itself against `Avatar`'s own root (the only
 * positioned ancestor in the tree), so it isn't clipped by the ring nesting
 * even though it's DOM-nested inside it. Pass short content (a number,
 * "9+") via `value`/children, `dot` for a plain status dot, or `icon`.
 */
export function AvatarBadge({
  className,
  style,
  separator = true,
  size = 'sm',
  appearance = 'filled',
  shape = 'circle',
  tone = 'danger',
  children,
  value,
  ...props
}: AvatarBadgeProps) {
  return (
    <BadgeIndicator
      data-slot="avatar-badge"
      value={value ?? children}
      appearance={appearance}
      shape={shape}
      tone={tone}
      size={size}
      className={cn('absolute', className)}
      style={{
        top: -4,
        right: -4,
        zIndex: 10,
        boxShadow: separator ? '0 0 0 2px var(--color-bg-surface-bg-surface)' : undefined,
        ...style,
      }}
      {...props}
    />
  );
}
