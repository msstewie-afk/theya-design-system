import type { ReactNode } from 'react';
import { NavArrowDown } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from './button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from './dropdown-menu';

/**
 * Not in the reference repo — built from scratch by composing our own
 * Button (main action) + a slim icon-only caret Button that opens a
 * DropdownMenu of secondary actions. Both halves share type/intent/size
 * so they read as one control; only the divider and independent hover/
 * focus states reveal the seam.
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
}

export function SplitButton({
  children,
  onMainClick,
  menuContent,
  type = 'filled',
  tone = 'primary',
  size = 'lg',
  disabled,
  className,
  ...props
}: SplitButtonProps) {
  return (
    <div className={cn('inline-flex', className)}>
      <Button
        type={type}
        tone={tone}
        size={size}
        disabled={disabled}
        onClick={onMainClick}
        className="rounded-r-none"
        {...props}
      >
        {children}
      </Button>
      <div className="w-px bg-white/20" aria-hidden="true" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type={type}
            tone={tone}
            size={size}
            disabled={disabled}
            iconOnly
            leftIcon={<NavArrowDown />}
            aria-label="More actions"
            className="rounded-l-none"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" size={size === '2xl' ? 'l' : (size ?? 'lg')}>
          {menuContent}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
