import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ColorPicker as EyedropperIcon } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Label } from './label';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { SwatchPicker } from './swatch-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { textFieldVariants } from './text-field-variants';

/**
 * ColorPicker — pick any color: brand/theme colors, label colors, chart
 * series, white-label customization.
 *
 * Panel with up to three sources, as tabs: Palette (preset swatches,
 * optional "No color"), From photo (click the image or take one of its
 * dominant colors; the user can upload a photo) and Custom
 * (saturation/brightness area, hue and optional opacity sliders, EyeDropper
 * where the browser supports it). Every view ends with the same input row:
 * format select (HEX/RGB/HSL) + channel fields + opacity %. ColorField wraps the panel in a popover behind
 * a text field with a swatch button — the form-field variant.
 *
 * Value is a hex string: `#rrggbb`, or `#rrggbbaa` when `alpha` is on and
 * the color isn't opaque. Internally the picker keeps HSV so hue doesn't
 * jump to 0 while dragging through greys.
 */

/* ------------------------------------------------------------------ */
/* Color math                                                         */
/* ------------------------------------------------------------------ */

export interface Hsva {
  h: number; // 0–360
  s: number; // 0–1
  v: number; // 0–1
  a: number; // 0–1
}
interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));
const round = (n: number, d = 0) => Math.round(n * 10 ** d) / 10 ** d;

function hsvToRgb({ h, s, v, a }: Hsva): Rgba {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return { r: Math.round(f(5) * 255), g: Math.round(f(3) * 255), b: Math.round(f(1) * 255), a };
}

function rgbToHsv({ r, g, b, a }: Rgba, prevHue = 0): Hsva {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const d = max - Math.min(R, G, B);
  let h = prevHue;
  if (d) {
    if (max === R) h = 60 * (((G - B) / d) % 6);
    else if (max === G) h = 60 * ((B - R) / d + 2);
    else h = 60 * ((R - G) / d + 4);
    if (h < 0) h += 360;
  }
  return { h, s: max ? d / max : 0, v: max, a };
}

function rgbToHsl({ r, g, b }: Rgba) {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
  const h = rgbToHsv({ r, g, b, a: 1 }).h;
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number, a: number): Rgba {
  const S = s / 100;
  const L = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const c = S * Math.min(L, 1 - L);
  const f = (n: number) => L - c * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255), a };
}

const hex2 = (n: number) => Math.round(n).toString(16).padStart(2, '0');

function toHex(hsva: Hsva, withAlpha: boolean) {
  const { r, g, b, a } = hsvToRgb(hsva);
  const base = `#${hex2(r)}${hex2(g)}${hex2(b)}`;
  return withAlpha && a < 1 ? base + hex2(a * 255) : base;
}

/** Parses #rgb, #rgba, #rrggbb, #rrggbbaa (the # is optional). */
export function parseHex(input: string): Rgba | null {
  let hex = input.trim().replace(/^#/, '');
  if (!/^([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(hex)) return null;
  if (hex.length <= 4) hex = [...hex].map((c) => c + c).join('');
  const n = (i: number) => parseInt(hex.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: hex.length === 8 ? round(n(6) / 255, 2) : 1 };
}

const CHECKER = 'repeating-conic-gradient(#c8c8c8 0 25%, #ffffff 0 50%) 0 0 / 8px 8px';

/* ------------------------------------------------------------------ */
/* Parts                                                              */
/* ------------------------------------------------------------------ */

const THUMB =
  'pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-solid border-[var(--color-white)] shadow-[0_0_0_1px_var(--black-a300),0_1px_3px_var(--black-a300)]';

/** Pointer drag helper: calls back with the pointer position relative to the element, 0–1 on each axis. */
function useDrag(onMove: (x: number, y: number) => void, onEnd?: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    onMove(clamp((e.clientX - rect.left) / rect.width), clamp((e.clientY - rect.top) / rect.height));
  };
  return {
    ref,
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      // Pointer interaction moves focus to the thumb so the keyboard continues from there.
      e.currentTarget.querySelector<HTMLElement>('[role="slider"]')?.focus({ preventScroll: true });
      move(e);
    },
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) move(e);
    },
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) onEnd?.();
    },
  };
}

function keyStep(e: React.KeyboardEvent) {
  return e.shiftKey ? 10 : 1;
}

function ColorArea({ hsva, onChange, onCommit }: { hsva: Hsva; onChange: (next: Partial<Hsva>) => void; onCommit: () => void }) {
  const drag = useDrag((x, y) => onChange({ s: x, v: 1 - y }), onCommit);
  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = keyStep(e) / 100;
    const map: Record<string, Partial<Hsva>> = {
      ArrowLeft: { s: clamp(hsva.s - step) },
      ArrowRight: { s: clamp(hsva.s + step) },
      ArrowUp: { v: clamp(hsva.v + step) },
      ArrowDown: { v: clamp(hsva.v - step) },
    };
    if (map[e.key]) {
      e.preventDefault();
      onChange(map[e.key]);
    }
  };
  const s = Math.round(hsva.s * 100);
  const v = Math.round(hsva.v * 100);
  return (
    <div
      {...drag}
      className="relative h-40 w-full cursor-crosshair touch-none rounded-[var(--size-border-radius-border-radius-lg)] shadow-[inset_0_0_0_1px_var(--black-a200)]"
      style={{
        background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), hsl(${hsva.h} 100% 50%)`,
      }}
    >
      <div
        role="slider"
        tabIndex={0}
        aria-label="Saturation and brightness"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={s}
        aria-valuetext={`Saturation ${s}%, brightness ${v}%`}
        onKeyDown={onKeyDown}
        onKeyUp={onCommit}
        className={cn(THUMB, 'outline-none focus-visible:focus-ring')}
        style={{ left: `${hsva.s * 100}%`, top: `${(1 - hsva.v) * 100}%`, background: toHex({ ...hsva, a: 1 }, false) }}
      />
    </div>
  );
}

function ChannelSlider({
  label,
  value,
  max,
  background,
  thumbColor,
  valueText,
  onChange,
  onCommit,
}: {
  label: string;
  value: number;
  max: number;
  background: string;
  thumbColor: string;
  valueText: string;
  onChange: (value: number) => void;
  onCommit: () => void;
}) {
  const drag = useDrag((x) => onChange(x * max), onCommit);
  const onKeyDown = (e: React.KeyboardEvent) => {
    // In the slider's own units (hue: degrees, opacity: percent) — 1, or 10 with Shift.
    // Was 1% of the range, so hue moved 3.6° per key and the docs' "by 1" was wrong.
    const step = keyStep(e);
    const next: Record<string, number> = {
      ArrowLeft: value - step,
      ArrowDown: value - step,
      ArrowRight: value + step,
      ArrowUp: value + step,
      Home: 0,
      End: max,
    };
    if (e.key in next) {
      e.preventDefault();
      onChange(clamp(next[e.key], 0, max));
    }
  };
  return (
    // py-1.5 widens the pointer target around the 12px track.
    <div {...drag} className="relative cursor-pointer touch-none py-1.5">
      <div className="relative h-3 rounded-full shadow-[inset_0_0_0_1px_var(--black-a200)]" style={{ background }}>
        <div
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={Math.round(value)}
          aria-valuetext={valueText}
          onKeyDown={onKeyDown}
          onKeyUp={onCommit}
          className={cn(THUMB, 'top-1/2 outline-none focus-visible:focus-ring')}
          // Keep the thumb inside the track at both ends.
          style={{ left: `calc(8px + (100% - 16px) * ${value / max})`, background: thumbColor }}
        />
      </div>
    </div>
  );
}

/** Input that edits a draft and commits on blur/Enter, reverting if invalid. */
function DraftInput({
  value,
  onCommit,
  label,
  className,
  inputMode = 'numeric',
}: {
  value: string;
  onCommit: (draft: string) => boolean;
  /** Accessible name ("Red") — the format select says which channels these are. */
  label: string;
  className?: string;
  inputMode?: 'numeric' | 'text';
}) {
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);
  const commit = () => {
    setEditing(false);
    if (!onCommit(draft)) setDraft(value);
  };
  return (
    <input
      aria-label={label}
      inputMode={inputMode}
      spellCheck={false}
      autoComplete="off"
      value={editing ? draft : value}
      onFocus={(e) => {
        setEditing(true);
        setDraft(value);
        e.currentTarget.select();
      }}
      onChange={(e) => {
        // Typing after an Enter commit (focus stays in the field) starts a new draft.
        setEditing(true);
        setDraft(e.target.value);
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          // Commit and show the resulting value (normalized, clamped or reverted) —
          // previously the raw typed text stayed on screen after Enter.
          commit();
          e.currentTarget.select();
        }
      }}
      // Fields are narrow: drop TextField's asymmetric side padding for an even px-2.
      className={cn(textFieldVariants({ heightSize: 'sm' }), 'min-w-0 px-2 tabular-nums', className)}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Photo palette                                                      */
/* ------------------------------------------------------------------ */

/** Dominant colors of an image: coarse 4-bit buckets, most populous first, near-duplicates skipped. */
function extractPalette(img: HTMLImageElement, count: number): string[] {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const key = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
    const bucket = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    bucket.n++;
    bucket.r += data[i];
    bucket.g += data[i + 1];
    bucket.b += data[i + 2];
    buckets.set(key, bucket);
  }
  const sorted = [...buckets.values()].sort((a, b) => b.n - a.n).map((c) => ({ r: c.r / c.n, g: c.g / c.n, b: c.b / c.n }));
  const picked: { r: number; g: number; b: number }[] = [];
  for (const c of sorted) {
    if (picked.every((p) => Math.hypot(p.r - c.r, p.g - c.g, p.b - c.b) > 48)) picked.push(c);
    if (picked.length === count) break;
  }
  return picked.map((c) => `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}`);
}

function PhotoSource({
  src,
  onPick,
  onPalette,
  uploadLabel,
}: {
  src?: string;
  onPick: (hex: string) => void;
  onPalette: (colors: string[]) => void;
  uploadLabel: string;
}) {
  const [url, setUrl] = useState(src);
  useEffect(() => setUrl(src), [src]);
  const imgRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onLoad = () => {
    try {
      onPalette(extractPalette(imgRef.current!, 8));
    } catch {
      // Cross-origin image without CORS headers — the canvas is tainted, no palette.
      onPalette([]);
    }
  };

  const pickAt = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // object-cover crops the image: map the click back to natural pixels.
    const scale = Math.max(rect.width / img.naturalWidth, rect.height / img.naturalHeight);
    const sx = (e.clientX - rect.left - (rect.width - img.naturalWidth * scale) / 2) / scale;
    const sy = (e.clientY - rect.top - (rect.height - img.naturalHeight * scale) / 2) / scale;
    try {
      ctx.drawImage(img, sx, sy, 1, 1, 0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      onPick(`#${hex2(r)}${hex2(g)}${hex2(b)}`);
    } catch {
      /* tainted canvas */
    }
  };

  const upload = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      className="sr-only"
      tabIndex={-1}
      aria-hidden
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) setUrl(URL.createObjectURL(file));
        e.target.value = '';
      }}
    />
  );

  if (!url) {
    return (
      <>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-[var(--size-border-radius-border-radius-md)] border border-dashed border-[var(--color-border-border-default)] text-body-s text-[var(--color-text-text-subtle)] outline-none hover:bg-[var(--color-bg-neutral-bg-neutral-subtler)] focus-visible:focus-ring"
        >
          {uploadLabel}
        </button>
        {upload}
      </>
    );
  }

  return (
    <div className="group/photo relative">
      <img
        ref={imgRef}
        src={url}
        alt=""
        crossOrigin={url.startsWith('blob:') || url.startsWith('data:') ? undefined : 'anonymous'}
        onLoad={onLoad}
        onClick={pickAt}
        className="h-32 w-full cursor-crosshair rounded-[var(--size-border-radius-border-radius-md)] object-cover"
      />
      <Button
        size="sm"
        appearance="tonal"
        onClick={() => inputRef.current?.click()}
        className="absolute right-2 top-2 opacity-0 transition-opacity group-hover/photo:opacity-100 focus-visible:opacity-100"
      >
        Change photo
      </Button>
      {upload}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Value state                                                        */
/* ------------------------------------------------------------------ */

function useColorState(value: string | undefined, defaultValue: string, alpha: boolean, onValueChange?: (hex: string) => void) {
  const fromHex = (hex: string, prevHue?: number) => {
    const rgba = parseHex(hex) ?? { r: 0, g: 0, b: 0, a: 1 };
    return rgbToHsv(alpha ? rgba : { ...rgba, a: 1 }, prevHue);
  };
  const [hsva, setHsva] = useState<Hsva>(() => fromHex(value ?? defaultValue));
  const hsvaRef = useRef(hsva);
  hsvaRef.current = hsva;

  // Follow an external value, but keep our hue/saturation when it maps to the same hex.
  useEffect(() => {
    if (value === undefined) return;
    if (parseHex(value) && toHex(hsvaRef.current, alpha).toLowerCase() !== toHex(fromHex(value), alpha).toLowerCase()) {
      setHsva(fromHex(value, hsvaRef.current.h));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, alpha]);

  const update = useCallback(
    (next: Hsva) => {
      setHsva(next);
      onValueChange?.(toHex(next, alpha));
    },
    [alpha, onValueChange],
  );
  return [hsva, update] as const;
}

/* ------------------------------------------------------------------ */
/* ColorPicker panel                                                  */
/* ------------------------------------------------------------------ */

export type ColorFormat = 'hex' | 'rgb' | 'hsl';
export type ColorPickerView = 'palette' | 'photo' | 'custom';

const NO_COLOR_FILL = 'linear-gradient(to top right, transparent calc(50% - 1px), #d64545 calc(50% - 1px) calc(50% + 1px), transparent calc(50% + 1px)), #ffffff';

export interface ColorPickerProps extends Omit<React.ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
  /** Hex color (#rrggbb or #rrggbbaa). An empty string means "no color" (see `clearable`). */
  value?: string;
  defaultValue?: string;
  /** Fires continuously while dragging and on every input commit. */
  onValueChange?: (hex: string) => void;
  /** Fires when a drag ends, a key is released or an input commits — for saving/undo history. */
  onValueCommit?: (hex: string) => void;
  /** Adds the alpha slider and a % field; the value becomes #rrggbbaa when not opaque. */
  alpha?: boolean;
  /** Formats offered in the input row. */
  formats?: ColorFormat[];
  defaultFormat?: ColorFormat;
  /**
   * Which sources to offer. More than one renders tabs (Palette / From photo / Custom).
   * Defaults to ['palette', 'custom'] when `swatches` are passed, otherwise ['custom'].
   */
  views?: ColorPickerView[];
  defaultView?: ColorPickerView;
  /** Preset colors for the Palette view. */
  swatches?: string[];
  /** Adds a "No color" swatch to the palette; picking it sets the value to ''. */
  clearable?: boolean;
  /** Initial image for the From photo view (the user can upload another). */
  photo?: string;
  /** Shows the EyeDropper button where the browser supports it. */
  eyeDropper?: boolean;
  /** Tab names. */
  viewLabels?: Partial<Record<ColorPickerView, string>>;
}

export function ColorPicker({
  value,
  defaultValue = '#3b6fd6',
  onValueChange,
  onValueCommit,
  alpha = false,
  formats = ['hex', 'rgb', 'hsl'],
  defaultFormat,
  views: viewsProp,
  defaultView,
  swatches,
  clearable = false,
  photo,
  eyeDropper = true,
  viewLabels,
  className,
  ...props
}: ColorPickerProps) {
  // "No color" ('') needs its own state when uncontrolled: the HSV state always holds a color.
  const [emptyState, setEmptyState] = useState(defaultValue === '');
  const isEmpty = value !== undefined ? value === '' : emptyState;
  const [hsva, setHsva] = useColorState(value, defaultValue || '#3b6fd6', alpha, onValueChange);
  const [format, setFormat] = useState<ColorFormat>(defaultFormat ?? formats[0] ?? 'hex');
  const views = viewsProp ?? (swatches?.length ? ['palette', 'custom'] : ['custom']);
  const [view, setView] = useState<ColorPickerView>(defaultView ?? views[0]);
  const [photoColors, setPhotoColors] = useState<string[]>([]);
  const labels = { palette: 'Palette', photo: 'From photo', custom: 'Custom', ...viewLabels };

  const hex = toHex(hsva, alpha);
  const rgba = hsvToRgb(hsva);
  const hsl = rgbToHsl(rgba);
  const opaque = toHex({ ...hsva, a: 1 }, false);

  const hsvaRef = useRef(hsva);
  hsvaRef.current = hsva;
  const commit = () => onValueCommit?.(toHex(hsvaRef.current, alpha));
  const set = (patch: Partial<Hsva>, andCommit = false) => {
    setEmptyState(false);
    const next = { ...hsvaRef.current, ...patch };
    hsvaRef.current = next;
    setHsva(next);
    if (andCommit) onValueCommit?.(toHex(next, alpha));
  };
  const setRgba = (next: Rgba) => set(rgbToHsv(next, hsvaRef.current.h), true);
  const setFromHex = (c: string) => {
    if (c === '') {
      setEmptyState(true);
      onValueChange?.('');
      onValueCommit?.('');
      return;
    }
    const parsed = parseHex(c);
    if (parsed) setRgba({ ...parsed, a: hsvaRef.current.a });
  };

  const [canPick, setCanPick] = useState(false);
  useEffect(() => setCanPick(typeof window !== 'undefined' && 'EyeDropper' in window), []);
  const pickFromScreen = async () => {
    try {
      // EyeDropper isn't in lib.dom yet everywhere.
      const dropper = new (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper();
      const { sRGBHex } = await dropper.open();
      setFromHex(sRGBHex);
    } catch {
      // Cancelled with Esc — nothing to do.
    }
  };

  const intIn = (min: number, max: number) => (draft: string) => {
    const n = Number(draft.replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) && draft.trim() !== '' ? clamp(Math.round(n), min, max) : null;
  };

  const channelFields =
    format === 'hex' ? (
      <DraftInput
        label="Hex"
        inputMode="text"
        className="col-span-3 font-code uppercase"
        value={isEmpty ? '' : opaque.toUpperCase()}
        onCommit={(d) => {
          const parsed = parseHex(d);
          if (!parsed) return false;
          setRgba({ ...parsed, a: alpha && d.replace('#', '').length > 6 ? parsed.a : hsvaRef.current.a });
          return true;
        }}
      />
    ) : format === 'rgb' ? (
      (['r', 'g', 'b'] as const).map((ch) => (
        <DraftInput
          key={ch}
          label={{ r: 'Red', g: 'Green', b: 'Blue' }[ch]}
          value={isEmpty ? '' : String(rgba[ch])}
          onCommit={(d) => {
            const n = intIn(0, 255)(d);
            if (n === null) return false;
            setRgba({ ...rgba, [ch]: n });
            return true;
          }}
        />
      ))
    ) : (
      (['h', 's', 'l'] as const).map((ch) => (
        <DraftInput
          key={ch}
          label={{ h: 'Hue, degrees', s: 'Saturation, percent', l: 'Lightness, percent' }[ch]}
          value={isEmpty ? '' : String(hsl[ch])}
          onCommit={(d) => {
            const n = intIn(0, ch === 'h' ? 360 : 100)(d);
            if (n === null) return false;
            const next = { ...hsl, [ch]: n };
            const rgb = hslToRgb(next.h, next.s, next.l, hsvaRef.current.a);
            // Keep the typed hue even for greys.
            set({ ...rgbToHsv(rgb, ch === 'h' ? n : hsvaRef.current.h) }, true);
            return true;
          }}
        />
      ))
    );

  // One row: format select + channels (+ alpha %). The format select already names the
  // channels, so there are no captions under the fields.
  const inputRow = (
    <div className="flex items-center gap-1.5">
      {formats.length > 1 && (
        <Select heightSize="sm" value={format} onValueChange={(f) => setFormat(f as ColorFormat)}>
          <SelectTrigger widthSize="sm" aria-label="Color format" className="w-[4.75rem] shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {formats.map((f) => (
              <SelectItem key={f} value={f}>
                {f.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <div className={cn('grid min-w-0 flex-1 gap-1.5', alpha ? 'grid-cols-4' : 'grid-cols-3')}>
        {channelFields}
        {alpha && (
          <DraftInput
            label="Opacity, percent"
            value={isEmpty ? '' : `${Math.round(hsva.a * 100)}%`}
            onCommit={(d) => {
              const n = intIn(0, 100)(d);
              if (n === null) return false;
              set({ a: n / 100 }, true);
              return true;
            }}
          />
        )}
      </div>
    </div>
  );

  const toOptions = (colors: string[]) => colors.map((c) => ({ value: c.toLowerCase(), label: c.toUpperCase(), color: c }));
  const swatchGrid = (colors: string[], label: string, withClear = false) => {
    const options = [...(withClear ? [{ value: 'none', label: 'No color', color: NO_COLOR_FILL }] : []), ...toOptions(colors)];
    const selected = isEmpty ? 'none' : (options.find((o) => o.value !== 'none' && o.value === opaque.toLowerCase())?.value ?? '');
    return (
      <SwatchPicker size="sm" shape="square" aria-label={label} options={options} value={selected} onValueChange={(c) => setFromHex(c === 'none' ? '' : c)} className="-mx-[3px]" />
    );
  };

  const custom = (
    // gap-1.5 + the sliders' own py-1.5 hit area = a visible 12px between area, tracks and inputs.
    <div className="flex flex-col gap-1.5">
      <ColorArea hsva={hsva} onChange={(p) => set(p)} onCommit={commit} />
      <div className="flex items-center gap-3">
        {eyeDropper && canPick && (
          <Button appearance="ghost" size="sm" iconOnly leftIcon={<EyedropperIcon />} aria-label="Pick a color from the screen" onClick={pickFromScreen} />
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <ChannelSlider
            label="Hue"
            value={hsva.h}
            max={360}
            background="linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)"
            thumbColor={`hsl(${hsva.h} 100% 50%)`}
            valueText={`${Math.round(hsva.h)} degrees`}
            onChange={(h) => set({ h })}
            onCommit={commit}
          />
          {alpha && (
            <ChannelSlider
              label="Opacity"
              value={hsva.a * 100}
              max={100}
              background={`linear-gradient(to right, transparent, ${opaque}), ${CHECKER}`}
              thumbColor={`linear-gradient(${hex}, ${hex}), ${CHECKER}`}
              valueText={`${Math.round(hsva.a * 100)}%`}
              onChange={(a) => set({ a: round(a / 100, 2) })}
              onCommit={commit}
            />
          )}
        </div>
        {/* Preview only with opacity: it's the one place the composited color shows over the checkerboard.
            Without opacity the area thumb already shows the color. */}
        {alpha && (
          <span
            aria-hidden
            className="size-11 shrink-0 rounded-[var(--size-border-radius-border-radius-md)] shadow-[inset_0_0_0_1px_var(--black-a200)]"
            style={{ background: isEmpty ? NO_COLOR_FILL : `linear-gradient(${hex}, ${hex}), ${CHECKER}` }}
          />
        )}
      </div>
      {inputRow}
    </div>
  );

  const content: Record<ColorPickerView, React.ReactNode> = {
    custom,
    palette: (
      <div className="flex flex-col gap-3">
        {inputRow}
        {swatchGrid(swatches ?? [], 'Palette colors', clearable)}
      </div>
    ),
    photo: (
      <div className="flex flex-col gap-3">
        <PhotoSource src={photo} onPick={setFromHex} onPalette={setPhotoColors} uploadLabel="Upload a photo to pick colors from" />
        {inputRow}
        {photoColors.length > 0 && swatchGrid(photoColors, 'Colors from the photo')}
      </div>
    ),
  };

  if (views.length === 1) {
    return (
      <div className={cn('w-[19rem]', className)} {...props}>
        {content[views[0]]}
      </div>
    );
  }

  return (
    <div className={cn('w-[19rem]', className)} {...props}>
    <Tabs value={view} onValueChange={(v) => setView(v as ColorPickerView)} className="flex flex-col gap-3">
      <TabsList>
        {views.map((v) => (
          <TabsTrigger key={v} value={v}>
            {labels[v]}
          </TabsTrigger>
        ))}
      </TabsList>
      {views.map((v) => (
        <TabsContent key={v} value={v}>
          {content[v]}
        </TabsContent>
      ))}
    </Tabs>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ColorField                                                         */
/* ------------------------------------------------------------------ */

export interface ColorFieldProps extends Omit<ColorPickerProps, 'className'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  heightSize?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  name?: string;
}

/** Text field with a swatch button that opens the ColorPicker in a popover. The hex can also be typed. */
export function ColorField({
  label,
  description,
  heightSize = 'md',
  className,
  disabled,
  name,
  value,
  defaultValue = '#3b6fd6',
  onValueChange,
  onValueCommit,
  alpha = false,
  ...pickerProps
}: ColorFieldProps) {
  const id = useId();
  const descId = useId();
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  const change = (hex: string) => {
    setInner(hex);
    onValueChange?.(hex);
  };
  const [draft, setDraft] = useState<string | null>(null);

  const commitDraft = () => {
    if (draft === null) return;
    const parsed = parseHex(draft);
    if (parsed) {
      const hex = toHex(rgbToHsv(alpha ? parsed : { ...parsed, a: 1 }), alpha);
      change(hex);
      onValueCommit?.(hex);
    }
    setDraft(null);
  };

  const swatchSize = heightSize === 'sm' ? 'size-5' : 'size-6';

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <Popover>
          <PopoverTrigger asChild disabled={disabled}>
            <button
              type="button"
              aria-label="Open color picker"
              className={cn(
                'absolute left-2 top-1/2 z-[1] -translate-y-1/2 cursor-pointer rounded-[var(--size-border-radius-border-radius-md)] outline-none focus-visible:focus-ring disabled:cursor-not-allowed',
                swatchSize,
              )}
              style={{ background: current ? `linear-gradient(${current}, ${current}), ${CHECKER}` : NO_COLOR_FILL }}
            >
              <span aria-hidden className="absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_var(--black-a200)]" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto" aria-label="Color picker">
            <ColorPicker value={current} onValueChange={change} onValueCommit={onValueCommit} alpha={alpha} {...pickerProps} />
          </PopoverContent>
        </Popover>
        <input
          id={id}
          name={name}
          disabled={disabled}
          spellCheck={false}
          autoComplete="off"
          aria-describedby={description ? descId : undefined}
          value={draft ?? current.toUpperCase()}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitDraft();
            }
            if (e.key === 'Escape') setDraft(null);
          }}
          className={cn(textFieldVariants({ heightSize }), 'font-code', heightSize === 'sm' ? 'pl-9' : 'pl-11')}
        />
      </div>
      {description && (
        <p id={descId} className="text-body-s text-[var(--color-text-text-subtle)]">
          {description}
        </p>
      )}
    </div>
  );
}
