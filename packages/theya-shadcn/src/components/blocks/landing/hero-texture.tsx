'use client';

import { useEffect, useRef, type ComponentProps } from 'react';
import { cn } from '../../../lib/utils';
import { useInView, useReducedMotion } from '../../ui/use-in-view';

export type HeroTextureVariant = 'dither' | 'halftone' | 'particles';

export interface HeroTextureProps extends ComponentProps<'div'> {
  /**
   * `dither`: an ordered (Bayer) dither of a soft light, in square pixels,
   * like the atlas's Aspen and Lama Lama. `halftone`: a dot screen that
   * fades out from a corner. `particles`: a slow field of points drifting
   * upward (DeepBook, Why Zero); it stands still under reduced motion and
   * stops while off screen.
   */
  variant?: HeroTextureVariant;
  /** Where the light (dither, halftone) is brightest, as CSS positions in %. Default top end. */
  focus?: { x: number; y: number };
  /** Cell size in px: a dither pixel, a halftone pitch, a particle's size step. Default 4. */
  cell?: number;
}

// 8×8 Bayer matrix, values 0..63.
const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51,
  19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
];

/**
 * A generative texture for the back of a hero (ld-02): pass it to Hero's
 * `backdrop`. Decorative and hidden from assistive tech. It draws in the
 * current text color: set a color with a class, such as
 * `text-[var(--color-icon-icon-primary)]`, and keep it faint under text
 * (the default opacity is 0.35).
 */
export function HeroTexture({ variant = 'dither', focus = { x: 85, y: 10 }, cell = 4, className, style, ...props }: HeroTextureProps) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const visible = useInView(box, { threshold: 0, once: false });

  useEffect(() => {
    if (variant === 'halftone') return;
    const el = box.current;
    const cv = canvas.current;
    const ctx = cv?.getContext('2d');
    if (!el || !cv || !ctx) return;
    let raf = 0;
    let w = 0;
    let h = 0;
    let color = '#000';
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    type P = { x: number; y: number; r: number; v: number; a: number };
    let pts: P[] = [];

    const size = () => {
      w = el.clientWidth;
      h = el.clientHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      color = getComputedStyle(el).color;
    };

    const dither = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      const fx = (focus.x / 100) * w;
      const fy = (focus.y / 100) * h;
      // The light reaches about half way across, so the copy stays on a clean ground.
      const reach = 0.55 * Math.hypot(Math.max(fx, w - fx), Math.max(fy, h - fy));
      for (let y = 0, j = 0; y < h; y += cell, j++) {
        for (let x = 0, i = 0; x < w; x += cell, i++) {
          // Light falls off with distance from the focus, squared for a soft core.
          const l = Math.max(0, 1 - Math.hypot(x - fx, y - fy) / reach) ** 2;
          if (l * 64 > BAYER[(j % 8) * 8 + (i % 8)]) ctx.fillRect(x, y, cell - 1, cell - 1);
        }
      }
    };

    const seed = () => {
      const n = Math.round((w * h) / 9000);
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: cell * (0.25 + Math.random() * 0.4),
        v: 0.1 + Math.random() * 0.35,
        a: 0.3 + Math.random() * 0.7,
      }));
    };
    const particles = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      for (const p of pts) {
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    const tick = () => {
      for (const p of pts) {
        p.y -= p.v;
        if (p.y < -4) {
          p.y = h + 4;
          p.x = Math.random() * w;
        }
      }
      particles();
      raf = requestAnimationFrame(tick);
    };

    const draw = () => {
      size();
      if (variant === 'dither') dither();
      else {
        seed();
        particles();
      }
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    if (variant === 'particles' && !reduced && visible) raf = requestAnimationFrame(tick);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [variant, focus.x, focus.y, cell, reduced, visible]);

  return (
    <div
      ref={box}
      aria-hidden
      data-slot="hero-texture"
      data-variant={variant}
      className={cn('pointer-events-none absolute inset-0 overflow-hidden text-[var(--color-icon-icon-primary)] opacity-35', className)}
      style={
        variant === 'halftone'
          ? {
              backgroundImage: `radial-gradient(currentColor ${cell * 0.45}px, transparent ${cell * 0.45 + 0.6}px)`,
              backgroundSize: `${cell * 2}px ${cell * 2}px`,
              maskImage: `radial-gradient(circle at ${focus.x}% ${focus.y}%, #000, transparent 55%)`,
              WebkitMaskImage: `radial-gradient(circle at ${focus.x}% ${focus.y}%, #000, transparent 55%)`,
              ...style,
            }
          : style
      }
      {...props}
    >
      {variant !== 'halftone' && <canvas ref={canvas} className="block size-full" />}
    </div>
  );
}
