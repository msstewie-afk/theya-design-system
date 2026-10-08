'use client';

import { useMemo, type ReactNode } from 'react';
import { encode } from 'uqr';
import { cn } from '../../lib/utils';
import { Skeleton } from './skeleton';
import { useTheyaI18n } from '../../lib/i18n';

/**
 * QR code rendered as a single crisp SVG path (no canvas, no images), so it
 * scales without blur, prints sharp and costs one DOM node.
 *
 * Always dark modules on a white plate, in BOTH themes: many scanners and
 * phone cameras don't read inverted (light-on-dark) codes, so the plate is
 * deliberately not theme-aware. The 4-module quiet zone is part of the
 * plate — scanners need it to find the code.
 *
 * A QR code is never the only way in: pair it with the same value as text
 * (e.g. the 2FA secret in a SecretField, or the link itself) for people who
 * can't scan — screen-reader users, a desktop without a phone at hand.
 */
export type QrCodeSize = 'sm' | 'md' | 'lg';
export type QrCodeLevel = 'L' | 'M' | 'Q' | 'H';

const SIZE_PX: Record<QrCodeSize, number> = { sm: 128, md: 160, lg: 200 };

// Quiet zone in modules. The spec asks for 4; anything less makes some
// readers fail on busy backgrounds.
const QUIET_ZONE = 4;

export interface QrCodeProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /** The text or URL to encode (e.g. an `otpauth://` URI for 2FA setup). */
  value?: string;
  /** Rendered edge length including the quiet zone: sm 128px, md 160px (default), lg 200px. */
  size?: QrCodeSize;
  /**
   * Error correction: how much of the code can be damaged or covered and
   * still scan — L 7%, M 15% (default), Q 25%, H 30%. Higher levels make a
   * denser code. Forced to H when `icon` is set, since the icon covers modules.
   */
  level?: QrCodeLevel;
  /** Optional mark in the center (a logo or icon, ~20% of the code). Raises `level` to H. */
  icon?: ReactNode;
  /** Accessible name. Describe what scanning does, not what it is: "Scan to add Seashell to your authenticator app". */
  label?: string;
  /** Shows a placeholder of the same size while the value is being fetched. */
  loading?: boolean;
}

export function QrCode({ value, size = 'md', level = 'M', icon, label, loading = false, className, style, ...props }: QrCodeProps) {
  const { t } = useTheyaI18n();
  if (label === undefined) label = t.qrCode.label;
  const px = SIZE_PX[size];
  const ecc: QrCodeLevel = icon ? 'H' : level;

  const qr = useMemo(() => {
    if (!value) return null;
    try {
      const { data, size: n } = encode(value, { ecc, border: QUIET_ZONE });
      // One path for every dark module: "M x y h1 v1 h-1 z" per cell,
      // horizontal runs merged so long rows don't become hundreds of squares.
      let d = '';
      for (let y = 0; y < n; y++) {
        let x = 0;
        while (x < n) {
          if (!data[y][x]) {
            x++;
            continue;
          }
          const start = x;
          while (x < n && data[y][x]) x++;
          d += `M${start} ${y}h${x - start}v1h${start - x}z`;
        }
      }
      return { d, n };
    } catch (error) {
      // Too much data for the largest QR version at this level.
      if (process.env.NODE_ENV !== 'production') console.error('[QrCode] value could not be encoded:', error);
      return 'error' as const;
    }
  }, [value, ecc]);

  const box = { width: px, height: px, ...style };

  if (loading || !value) {
    return <Skeleton data-slot="qr-code" aria-label={loading ? t.qrCode.loading : undefined} className={cn('shrink-0 rounded-[var(--size-border-radius-border-radius-xl)]', className)} style={box} {...props} />;
  }

  if (qr === 'error' || !qr) {
    return (
      <div
        data-slot="qr-code"
        role="img"
        aria-label={t.qrCode.tooMuchLabel}
        className={cn(
          'flex shrink-0 items-center justify-center rounded-[var(--size-border-radius-border-radius-xl)] border border-dashed border-[var(--color-border-border)] p-3 text-center font-body text-body-s text-[var(--color-text-text-subtler)]',
          className,
        )}
        style={box}
        {...props}
      >
        {t.qrCode.tooMuch}
      </div>
    );
  }

  return (
    <div
      data-slot="qr-code"
      className={cn(
        'relative shrink-0 overflow-hidden rounded-[var(--size-border-radius-border-radius-xl)] border border-solid border-[var(--color-border-border-subtler)] bg-[var(--color-white)]',
        className,
      )}
      style={box}
      {...props}
    >
      <svg role="img" aria-label={label} viewBox={`0 0 ${qr.n} ${qr.n}`} width="100%" height="100%" shapeRendering="crispEdges" className="block">
        <title>{label}</title>
        <path d={qr.d} fill="var(--color-black)" />
      </svg>
      {icon && (
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 flex size-[22%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-white)] p-[3%] text-[var(--color-black)] [&_img]:size-full [&_svg]:size-full"
        >
          {icon}
        </span>
      )}
    </div>
  );
}
