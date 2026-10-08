'use client';

import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';
import { useDensity, type Density } from './use-density';

export interface DensityToggleProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'defaultValue' | 'dir'> {
  /**
   * Controlled value. When set, the toggle only reports changes through
   * `onValueChange` and does not touch <html> — put `data-density={value}`
   * on the region it controls. Uncontrolled (default) it sets the page-wide
   * `data-density` on <html> via `useDensity`.
   */
  value?: Density;
  onValueChange?: (density: Density) => void;
  /** Toggle size. sm (32px) fits a toolbar, md (40px) a settings form. */
  size?: 'sm' | 'md';
}

const OPTIONS: readonly Density[] = ['compact', 'default', 'comfortable'];

/**
 * Segmented compact / default / comfortable switch. Exactly one option is
 * always on: Radix single ToggleGroup lets a press on the active item clear
 * the value, which is ignored here.
 */
export function DensityToggle({ value, onValueChange, size = 'sm', className, ...props }: DensityToggleProps) {
  const { t } = useTheyaI18n();
  const page = useDensity();
  const current = value ?? page.density;

  return (
    <ToggleGroup
      type="single"
      appearance="outlined"
      size={size}
      aria-label={t.densityToggle.label}
      value={current}
      onValueChange={(next) => {
        if (!next) return;
        const density = next as Density;
        if (value === undefined) page.setDensity(density);
        onValueChange?.(density);
      }}
      className={cn(className)}
      {...props}
    >
      {OPTIONS.map((option) => (
        <ToggleGroupItem key={option} value={option}>
          {t.densityToggle[option]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
