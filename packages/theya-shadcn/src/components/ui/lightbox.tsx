'use client';

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { NavArrowLeft, NavArrowRight, Xmark, ZoomIn, ZoomOut } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';

/**
 * Full-screen image viewer: one image at a time over a dark backdrop, with
 * previous/next, a counter, captions, zoom and a thumbnail strip.
 *
 * Built on Radix Dialog, so focus is trapped inside, Escape closes, the
 * page behind is inert and focus returns to whatever opened it.
 *
 * - Keys: ←/→ previous/next, +/− zoom, 0 resets the zoom, Esc closes.
 * - Pointer: click the image to zoom in at that spot (2.5×) and drag to
 *   pan; click again to zoom out. A click on the dark area closes. Swipe
 *   left/right on touch to change image.
 * - The backdrop is always dark (both themes): photos and screenshots read
 *   best on a neutral dark ground, and the controls are white-on-dark.
 * - Neighbouring images are preloaded so next/previous is instant.
 * - Screen readers hear "Image 3 of 8: <alt>" on every change.
 */
export interface LightboxImage {
  src: string;
  alt: string;
  caption?: ReactNode;
}

export interface LightboxProps {
  images: LightboxImage[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Controlled current image. */
  index?: number;
  onIndexChange?: (index: number) => void;
  /** Uncontrolled starting image. */
  defaultIndex?: number;
  /** Thumbnail strip under the image. Default: shown when there's more than one image. */
  thumbnails?: boolean;
  /** Name of the dialog, e.g. "Seashell Sites screenshots". */
  title?: string;
}

const ZOOM = 2.5;
const SWIPE = 50;

function ControlButton({ label, className, children, ...props }: React.ComponentProps<'button'> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--color-white)] outline-none',
        'bg-[var(--white-a100)] hover:bg-[var(--white-a200)] active:bg-[var(--white-a300)] disabled:pointer-events-none disabled:opacity-40',
        'transition-colors duration-150 ease-enter motion-reduce:transition-none focus-visible:focus-ring-on-primary',
        '[&_svg]:size-[var(--size-icon-icon-md)]',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Lightbox({ images, open, onOpenChange, index: indexProp, onIndexChange, defaultIndex = 0, thumbnails, title }: LightboxProps) {
  const { t } = useTheyaI18n();
  if (title === undefined) title = t.lightbox.title;
  const [internal, setInternal] = useState(defaultIndex);
  const index = Math.min(Math.max(indexProp ?? internal, 0), Math.max(images.length - 1, 0));
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number; moved: boolean; onImage: boolean } | null>(null);
  // State twin of drag.current: the transform transition is off while panning so the image follows the pointer 1:1.
  const [dragging, setDragging] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const count = images.length;
  const image = images[index];
  const showThumbs = thumbnails ?? count > 1;

  const go = (next: number) => {
    if (count < 2) return;
    const i = (next + count) % count;
    if (indexProp === undefined) setInternal(i);
    onIndexChange?.(i);
  };

  // A new image (or reopening) always starts unzoomed.
  useEffect(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, [index, open]);

  // The viewer is usually opened from a gallery button, not a Dialog.Trigger, and
  // Radix only returns focus to its own trigger — so focus fell to <body> on close.
  // Remember what had focus when it opened and return there.
  const returnFocusTo = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (open) returnFocusTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }, [open]);

  // Preload neighbours so previous/next shows instantly.
  useEffect(() => {
    if (!open || count < 2) return;
    for (const i of [index - 1, index + 1]) {
      const img = new Image();
      img.src = images[(i + count) % count].src;
    }
  }, [open, index, count, images]);

  const zoomTo = (next: number, at?: { x: number; y: number }) => {
    if (next <= 1) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
      return;
    }
    const rect = stageRef.current?.getBoundingClientRect();
    // Keep the clicked point under the pointer: shift by its distance from the centre.
    if (at && rect) setOffset({ x: (rect.width / 2 - (at.x - rect.left)) * (next - 1), y: (rect.height / 2 - (at.y - rect.top)) * (next - 1) });
    setScale(next);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(index + 1);
    else if (e.key === 'ArrowLeft') go(index - 1);
    else if (e.key === '+' || e.key === '=') zoomTo(ZOOM);
    else if (e.key === '-' || e.key === '0') zoomTo(1);
    else return;
    e.preventDefault();
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    // Pointer capture retargets later events to the stage, so note now whether the press started on the image.
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y, moved: false, onImage: e.target instanceof HTMLImageElement };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    if (scale > 1) setOffset({ x: d.ox + dx, y: d.oy + dy });
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && !d.onImage && scale === 1) {
      // A click on the dark area around the image closes, like any overlay.
      onOpenChange(false);
    } else if (!d.moved) {
      // A plain click on the image toggles zoom at that point.
      zoomTo(scale > 1 ? 1 : ZOOM, { x: e.clientX, y: e.clientY });
    } else if (scale === 1 && Math.abs(dx) > SWIPE) {
      go(dx < 0 ? index + 1 : index - 1);
    }
  };

  if (!image) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-overlay bg-[var(--color-black)]/90 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 motion-reduce:animate-none!" />
        <DialogPrimitive.Content
          data-slot="lightbox"
          onKeyDown={onKeyDown}
          aria-describedby={undefined}
          onCloseAutoFocus={(e) => {
            const el = returnFocusTo.current;
            returnFocusTo.current = null;
            if (el?.isConnected) {
              e.preventDefault();
              el.focus({ preventScroll: true });
            }
          }}
          className="fixed inset-0 z-modal flex flex-col text-[var(--color-white)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 motion-reduce:animate-none!"
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          <p aria-live="polite" className="sr-only">{t.lightbox.position(index + 1, count, String(image.alt ?? ''))}</p>

          {/* Top bar: counter, zoom, close. */}
          <div className="flex items-center justify-between gap-2 p-3 sm:p-4">
            <span className="px-2 font-body text-body-m tabular-nums text-[var(--white-a800)]" aria-hidden="true">
              {count > 1 ? `${index + 1} / ${count}` : ''}
            </span>
            <div className="flex items-center gap-2">
              <ControlButton label={scale > 1 ? t.lightbox.zoomOut : t.lightbox.zoomIn} onClick={() => zoomTo(scale > 1 ? 1 : ZOOM)}>
                {scale > 1 ? <ZoomOut aria-hidden="true" /> : <ZoomIn aria-hidden="true" />}
              </ControlButton>
              <DialogPrimitive.Close asChild>
                <ControlButton label={t.common.close}>
                  <Xmark aria-hidden="true" />
                </ControlButton>
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Stage */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 sm:px-20">
            <div
              ref={stageRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={() => {
                drag.current = null;
                setDragging(false);
              }}
              className={cn('flex size-full touch-none items-center justify-center overflow-hidden select-none', scale > 1 ? 'cursor-grab active:cursor-grabbing' : '[&_img]:cursor-zoom-in')}
            >
              <img
                key={image.src}
                src={image.src}
                alt={image.alt}
                draggable={false}
                className={cn(
                  'max-h-full max-w-full rounded-[var(--size-border-radius-border-radius-lg)] object-contain',
                  !dragging && 'transition-transform duration-200 ease-enter motion-reduce:transition-none',
                )}
                style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
              />
            </div>
            {count > 1 && (
              <>
                <ControlButton label={t.lightbox.previous} onClick={() => go(index - 1)} className="absolute top-1/2 start-3 -translate-y-1/2 max-sm:hidden sm:start-4">
                  <NavArrowLeft aria-hidden="true" className="rtl:-scale-x-100" />
                </ControlButton>
                <ControlButton label={t.lightbox.next} onClick={() => go(index + 1)} className="absolute top-1/2 end-3 -translate-y-1/2 max-sm:hidden sm:end-4">
                  <NavArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
                </ControlButton>
              </>
            )}
          </div>

          {/* Caption + thumbnails */}
          <div className="flex flex-col items-center gap-3 p-3 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] sm:p-4">
            {image.caption && <p className="max-w-[60ch] text-center font-body text-body-m text-[var(--white-a800)]">{image.caption}</p>}
            {showThumbs && (
              <div className="relative flex max-w-full gap-2 overflow-x-auto p-1 scrollbar-thin" role="group" aria-label={t.lightbox.thumbnails}>
                {images.map((img, i) => (
                  <button
                    key={img.src + i}
                    type="button"
                    aria-label={t.lightbox.show(i + 1, String(img.alt ?? ''))}
                    aria-current={i === index ? 'true' : undefined}
                    onClick={() => go(i)}
                    className={cn(
                      'size-14 shrink-0 overflow-hidden rounded-[var(--size-border-radius-border-radius-lg)] outline-none',
                      'ring-2 ring-transparent transition-[opacity,box-shadow] duration-150 motion-reduce:transition-none focus-visible:focus-ring-on-primary',
                      i === index ? 'opacity-100 ring-[var(--color-white)]' : 'opacity-50 hover:opacity-80',
                    )}
                  >
                    <img src={img.src} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
