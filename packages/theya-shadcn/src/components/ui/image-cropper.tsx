import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { RotateCameraRight, ZoomIn, ZoomOut } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Slider } from './slider';

/**
 * ImageCropper — frame an uploaded image before saving it: an avatar, a
 * logo, a cover or product photo.
 *
 * The crop frame is fixed (by `aspect`, optionally a circle) and centered;
 * the image moves under it. Drag or arrow keys pan, the wheel / pinch /
 * slider / +− keys zoom, the rotate button turns it by 90°. The image
 * always covers the frame, so the crop never contains empty space.
 *
 * `onCropChange` reports the crop in the image's natural pixels (after
 * rotation); pass it to `getCroppedImage()` to get a Blob for upload.
 */

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropState {
  /** Crop rectangle in natural pixels of the (rotated) image. */
  area: CropArea;
  zoom: number;
  /** 0, 90, 180 or 270. */
  rotation: number;
}

export interface ImageCropperProps extends Omit<React.ComponentProps<'div'>, 'onChange'> {
  src: string;
  /** Width / height of the crop frame. 1 for avatars, 16 / 9 for covers. */
  aspect?: number;
  /** `circle` masks the frame round (the output is still the square). */
  shape?: 'rect' | 'circle';
  /** Zoom range, relative to "image just covers the frame". */
  minZoom?: number;
  maxZoom?: number;
  defaultZoom?: number;
  /** Shows the zoom slider and rotate button under the image. */
  controls?: boolean;
  /** Shows the rotate button. */
  rotatable?: boolean;
  /** Rule-of-thirds lines inside the frame: always, only while moving, or never. */
  grid?: 'always' | 'interaction' | 'never';
  /** Fires on every change (drag, zoom, rotate, resize). */
  onCropChange?: (crop: CropState) => void;
  /** Accessible name of the crop area. */
  label?: string;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
/** Inset of the frame from the container edges, so the dimmed surroundings stay visible. */
const FRAME_INSET = 24;

export function ImageCropper({
  src,
  aspect = 1,
  shape = 'rect',
  minZoom = 1,
  maxZoom = 4,
  defaultZoom = 1,
  controls = true,
  rotatable = true,
  grid = 'interaction',
  onCropChange,
  label = 'Crop area',
  className,
  ...props
}: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(defaultZoom);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [moving, setMoving] = useState(false);

  // Reset when the image changes.
  useEffect(() => {
    setNatural(null);
    setZoom(defaultZoom);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Frame: the largest `aspect` rectangle inside the container minus the inset.
  const availW = Math.max(0, box.w - FRAME_INSET * 2);
  const availH = Math.max(0, box.h - FRAME_INSET * 2);
  const frameW = Math.min(availW, availH * aspect);
  const frameH = frameW / aspect;

  // Image dimensions as seen after rotation.
  const sideways = rotation % 180 !== 0;
  const imgW = natural ? (sideways ? natural.h : natural.w) : 0;
  const imgH = natural ? (sideways ? natural.w : natural.h) : 0;
  const baseScale = natural ? Math.max(frameW / imgW, frameH / imgH) : 1;
  const scale = baseScale * zoom;
  const dispW = imgW * scale;
  const dispH = imgH * scale;

  const clampOffset = useCallback(
    (o: { x: number; y: number }, s = scale) => {
      const maxX = Math.max(0, (imgW * s - frameW) / 2);
      const maxY = Math.max(0, (imgH * s - frameH) / 2);
      return { x: clamp(o.x, -maxX, maxX), y: clamp(o.y, -maxY, maxY) };
    },
    [imgW, imgH, frameW, frameH, scale],
  );

  // Keep the image covering the frame after resize/rotate/zoom.
  useEffect(() => {
    setOffset((o) => {
      const c = clampOffset(o);
      return c.x === o.x && c.y === o.y ? o : c;
    });
  }, [clampOffset]);

  const setZoomAround = (nextZoom: number, focus = { x: 0, y: 0 }) => {
    const z = clamp(nextZoom, minZoom, maxZoom);
    // Keep the point under `focus` (relative to the frame center) in place.
    const ratio = z / zoom;
    setOffset((o) => clampOffset({ x: focus.x - (focus.x - o.x) * ratio, y: focus.y - (focus.y - o.y) * ratio }, baseScale * z));
    setZoom(z);
  };

  // Report the crop.
  const onCropChangeRef = useRef(onCropChange);
  onCropChangeRef.current = onCropChange;
  useEffect(() => {
    if (!natural || !frameW) return;
    const area = {
      x: Math.round((dispW / 2 - offset.x - frameW / 2) / scale),
      y: Math.round((dispH / 2 - offset.y - frameH / 2) / scale),
      width: Math.round(frameW / scale),
      height: Math.round(frameH / scale),
    };
    onCropChangeRef.current?.({ area, zoom, rotation });
  }, [natural, offset, zoom, rotation, frameW, frameH, dispW, dispH, scale]);

  /* Pointer: one pointer pans, two pinch-zoom. */
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);
  const centerOf = (clientX: number, clientY: number) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return { x: clientX - rect.left - rect.width / 2, y: clientY - rect.top - rect.height / 2 };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom };
    }
    setMoving(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const mid = centerOf((a.x + b.x) / 2, (a.y + b.y) / 2);
      setZoomAround(pinch.current.zoom * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.current.dist), mid);
      return;
    }
    setOffset((o) => clampOffset({ x: o.x + e.clientX - prev.x, y: o.y + e.clientY - prev.y }));
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) setMoving(false);
  };

  // Wheel zoom needs a non-passive listener to prevent page scroll.
  const wheelRef = useRef<(e: WheelEvent) => void>(() => {});
  wheelRef.current = (e: WheelEvent) => {
    e.preventDefault();
    setZoomAround(zoom * Math.exp(-e.deltaY * 0.0015), centerOf(e.clientX, e.clientY));
  };
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => wheelRef.current(e);
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 40 : 10;
    const pan: Record<string, [number, number]> = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    if (pan[e.key]) {
      e.preventDefault();
      // Arrow moves the crop frame over the image, i.e. the image the other way.
      setOffset((o) => clampOffset({ x: o.x + pan[e.key][0], y: o.y + pan[e.key][1] }));
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      setZoomAround(zoom * 1.1);
    } else if (e.key === '-') {
      e.preventDefault();
      setZoomAround(zoom / 1.1);
    }
  };

  const rotate = () => {
    setRotation((r) => (r + 90) % 360);
    setOffset({ x: 0, y: 0 });
  };

  const showGrid = grid === 'always' || (grid === 'interaction' && moving);
  const round = shape === 'circle';

  return (
    <div className={cn('flex flex-col gap-3', className)} {...props}>
      <div
        ref={containerRef}
        role="group"
        aria-roledescription="image cropper"
        aria-label={label}
        aria-description="Drag or use arrow keys to move the image, scroll or press plus and minus to zoom."
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={cn(
          'relative h-80 w-full touch-none select-none overflow-hidden rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-surface-bg-surface-overlay-dark)] outline-none focus-visible:focus-ring',
          moving ? 'cursor-grabbing' : 'cursor-grab',
        )}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          onLoad={(e) => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
          className={cn('pointer-events-none absolute left-1/2 top-1/2 max-w-none', !natural && 'invisible')}
          style={
            natural
              ? {
                  // The element keeps its natural orientation; the rotated bounding box is imgW × imgH.
                  width: natural.w * scale,
                  height: natural.h * scale,
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
                }
              : undefined
          }
        />
        {frameW > 0 && (
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-solid border-[var(--white-a700)]',
              // The huge spread shadow dims everything outside the frame.
              'shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]',
              round ? 'rounded-full' : 'rounded-[2px]',
            )}
            style={{ width: frameW, height: frameH }}
          >
            {showGrid && (
              <span className={cn('absolute inset-0 overflow-hidden', round && 'rounded-full')}>
                <span className="absolute inset-y-0 left-1/3 w-px bg-[var(--white-a500)]" />
                <span className="absolute inset-y-0 left-2/3 w-px bg-[var(--white-a500)]" />
                <span className="absolute inset-x-0 top-1/3 h-px bg-[var(--white-a500)]" />
                <span className="absolute inset-x-0 top-2/3 h-px bg-[var(--white-a500)]" />
              </span>
            )}
          </div>
        )}
      </div>

      {controls && (
        <div className="flex items-center gap-3">
          <Button appearance="ghost" size="sm" iconOnly leftIcon={<ZoomOut />} aria-label="Zoom out" onClick={() => setZoomAround(zoom / 1.25)} disabled={zoom <= minZoom} />
          <Slider
            aria-label="Zoom"
            min={minZoom}
            max={maxZoom}
            step={0.01}
            value={[zoom]}
            onValueChange={([z]) => setZoomAround(z)}
            formatValue={(z) => `${Math.round(z * 100)}%`}
            className="flex-1"
          />
          <Button appearance="ghost" size="sm" iconOnly leftIcon={<ZoomIn />} aria-label="Zoom in" onClick={() => setZoomAround(zoom * 1.25)} disabled={zoom >= maxZoom} />
          {rotatable && <Button appearance="ghost" size="sm" iconOnly leftIcon={<RotateCameraRight />} aria-label="Rotate 90 degrees" onClick={rotate} />}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export interface GetCroppedImageOptions {
  /** Output width in px (height follows the crop aspect). Defaults to the crop's own size. */
  width?: number;
  type?: 'image/png' | 'image/jpeg' | 'image/webp';
  /** 0–1, for jpeg/webp. */
  quality?: number;
}

/** Renders the crop to a Blob. The image must be same-origin or served with CORS headers. */
export async function getCroppedImage(src: string, { area, rotation }: Pick<CropState, 'area' | 'rotation'>, options: GetCroppedImageOptions = {}): Promise<Blob> {
  const { width = area.width, type = 'image/png', quality = 0.92 } = options;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = src;
  await img.decode();

  // 1. The full image, rotated.
  const sideways = rotation % 180 !== 0;
  const rotated = document.createElement('canvas');
  rotated.width = sideways ? img.naturalHeight : img.naturalWidth;
  rotated.height = sideways ? img.naturalWidth : img.naturalHeight;
  const rctx = rotated.getContext('2d')!;
  rctx.translate(rotated.width / 2, rotated.height / 2);
  rctx.rotate((rotation * Math.PI) / 180);
  rctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

  // 2. The crop, scaled to the requested width.
  const out = document.createElement('canvas');
  out.width = Math.round(width);
  out.height = Math.round((width * area.height) / area.width);
  const octx = out.getContext('2d')!;
  octx.imageSmoothingQuality = 'high';
  octx.drawImage(rotated, area.x, area.y, area.width, area.height, 0, 0, out.width, out.height);

  return new Promise((resolve, reject) => out.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not export the crop'))), type, quality));
}
