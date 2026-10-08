'use client';

import type { ReactNode } from 'react';
import { NavArrowDown } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { Button, type ButtonProps } from './button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, type DropdownMenuSize } from './dropdown-menu';
import { useTheyaI18n } from '../../lib/i18n';

// Button sizes -> DropdownMenu text sizes. DropdownMenu only has
// xs/sm/md/lg; "xl" was passed through and "2xl" mapped to a non-existent
// "l", so both menus rendered with no text-size class at all.
const MENU_SIZE: Record<NonNullable<ButtonProps['size']>, DropdownMenuSize> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'lg',
  '2xl': 'lg',
};

/**
 * Composes Theya's own Button (main action) + a slim icon-only caret
 * Button that opens a DropdownMenu of secondary actions. Both halves
 * share appearance/tone/size so they read as one control; only the 2px
 * gap (a 1px hairline for ghost) and independent hover/focus states
 * reveal the seam.
 *
 * The menu's item text size is synced to `size` too, via
 * DropdownMenuContent's own `size` prop. `leftIcon`/`rightIcon` pass
 * straight through to the main (left) Button via ButtonProps; a
 * rightIcon on the main segment sits awkwardly right next to the
 * divider + caret, so leftIcon is the natural placement here.
 */
export interface SplitButtonProps extends Omit<ButtonProps, 'children' | 'iconOnly' | 'asChild'> {
  /** Label + icon(s) for the primary (left) action. */
  children: ReactNode;
  /** Called when the primary action is clicked. */
  onMainClick?: () => void;
  /** Content rendered inside the DropdownMenu opened by the caret — typically DropdownMenuItem elements. */
  menuContent: ReactNode;
  /** Accessible name of the caret that opens the menu. Default "More actions" — make it specific when several split buttons share a screen, e.g. "More send options". */
  menuLabel?: string;
}

export function SplitButton({
  children,
  onMainClick,
  menuContent,
  menuLabel,
  appearance = 'filled',
  tone = 'primary',
  size = 'lg',
  disabled,
  className,
  ...props
}: SplitButtonProps) {
  const { t } = useTheyaI18n();
  if (menuLabel === undefined) menuLabel = t.splitButton.menu;
  return (
    // Filled/tonal/outlined halves are split by a real 2px gap, not a
    // painted line: the gap shows whatever background the button sits on,
    // so it never needs a color (a white/20 line vanished on light fills,
    // and a "surface"-colored line would clash on non-surface backgrounds).
    // Ghost has no fill, so a gap alone separates nothing — it gets a
    // hairline in the border token instead.
    <div
      data-slot="split-button"
      className={cn('inline-flex', appearance === 'ghost' ? 'items-stretch' : 'gap-[var(--size-size2)]', className)}
    >
      <Button
        appearance={appearance}
        tone={tone}
        size={size}
        disabled={disabled}
        onClick={onMainClick}
        className="rounded-e-none"
        {...props}
      >
        {children}
      </Button>
      {appearance === 'ghost' && (
        <div
          data-slot="split-button-divider"
          className="w-[var(--size-size1)] bg-[var(--color-border-border)]"
          aria-hidden="true"
        />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            appearance={appearance}
            tone={tone}
            size={size}
            disabled={disabled}
            iconOnly
            leftIcon={<NavArrowDown />}
            aria-label={menuLabel}
            className="rounded-s-none"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" size={MENU_SIZE[size ?? 'lg']}>
          {menuContent}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
