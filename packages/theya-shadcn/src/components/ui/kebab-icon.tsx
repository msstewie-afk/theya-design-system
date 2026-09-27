import { cn } from '@/lib/utils';

// Custom kebab glyphs — replaces iconoir's MoreVert/MoreHoriz, which read as
// too thin/small even at the darkest available text token
// (--color-text-text). Paths supplied by Мария; fill switched to
// currentColor (was hardcoded #4B4D77) so color is driven by the className
// passed at the call site, same as every other icon in Theya.
//
// Use these ONLY where the icon is a kebab/overflow-menu trigger (a real
// interactive button). Non-interactive ellipsis indicators (pagination,
// breadcrumb truncation) are unaffected by this exception.
//
// `size` was added 2026-09-27 (Мария: "тоже наверное как компонент
// оформить, сделать несколько размеров") — every real call site actually
// sizes the glyph via its wrapping Button's own `[&_svg]:size-*` rule, not
// this prop, so it defaults to `md` (12px viewBox path scaled to the
// original fixed 16×16) to change nothing for existing usage. It exists so
// the glyph can be demoed/used standalone at a few standard sizes without
// every caller having to know the right Tailwind size-* utility. Renamed
// `m` -> `md` on 2026-09-27 to match Button/CopyButton/SplitButton's own
// sm/md/lg naming convention (Мария: size scales should read as identical
// across these), even though this scale still measures the icon glyph's
// own px, not a shared control height.
export type KebabIconSize = 'sm' | 'md' | 'lg';

const SIZE_CLASS: Record<KebabIconSize, string> = { sm: 'size-3', md: 'size-4', lg: 'size-5' };

export interface KebabIconProps {
  className?: string;
  /** Icon size: sm (12px) / md (16px, default — matches the previous fixed 16×16) / lg (20px). */
  size?: KebabIconSize;
}

export function KebabIconVertical({ className, size = 'md' }: KebabIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={cn(SIZE_CLASS[size], className)}
      aria-hidden="true"
    >
      <path
        d="M9 3C9 3.55228 8.55228 4 8 4C7.44772 4 7 3.55228 7 3C7 2.44772 7.44772 2 8 2C8.55228 2 9 2.44772 9 3Z"
        fill="currentColor"
      />
      <path
        d="M9 8C9 8.55228 8.55228 9 8 9C7.44772 9 7 8.55228 7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8Z"
        fill="currentColor"
      />
      <path
        d="M9 13C9 13.5523 8.55228 14 8 14C7.44772 14 7 13.5523 7 13C7 12.4477 7.44772 12 8 12C8.55228 12 9 12.4477 9 13Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function KebabIconHorizontal({ className, size = 'md' }: KebabIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={cn(SIZE_CLASS[size], className)}
      aria-hidden="true"
    >
      <path
        d="M14 8C14 8.55228 13.5523 9 13 9C12.4477 9 12 8.55228 12 8C12 7.44772 12.4477 7 13 7C13.5523 7 14 7.44772 14 8Z"
        fill="currentColor"
      />
      <path
        d="M9 8C9 8.55228 8.55228 9 8 9C7.44772 9 7 8.55228 7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8Z"
        fill="currentColor"
      />
      <path
        d="M4 8C4 8.55228 3.55228 9 3 9C2.44772 9 2 8.55228 2 8C2 7.44772 2.44772 7 3 7C3.55228 7 4 7.44772 4 8Z"
        fill="currentColor"
      />
    </svg>
  );
}
