'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { MorphIcon as Morph, type IconInput } from 'morphicons/react';
import { svgToIcon } from 'morphicons/adapters';
import { cn } from '../../lib/utils';

/**
 * An icon that morphs into the next one when `icon` changes: the outline
 * flows from one shape into the other with spring physics (morphicons),
 * shapes that match under rotation turn instead of stretching. Use it for
 * one control's two states (menu ↔ close, play ↔ pause, sun ↔ moon); for
 * the ready-made animated set see AnimatedIcon.
 *
 * - `icon` takes an Iconoir component (`Menu`, `Xmark` from iconoir-react),
 *   or a path `d` on the 24 grid. Iconoir icons are read once from their own
 *   render and cached, so the first paint is the plain icon.
 * - prefers-reduced-motion: the icon swaps instantly.
 * - Decorative by default (aria-hidden); pass `label` when the icon is the
 *   only content that names something.
 */
export type MorphIconSpring = 'smooth' | 'snappy' | 'bouncy';
type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export interface MorphIconProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref' | 'from' | 'to'> {
  /** The icon to show. Changing it morphs from the previous one. */
  icon: IconComponent | string;
  /** Spring preset. Default `bouncy`. */
  spring?: MorphIconSpring;
  /** Accessible name; without it the icon is hidden from assistive tech. */
  label?: string;
}

const cache = new WeakMap<IconComponent, IconInput>();

export function MorphIcon({ icon, spring = 'bouncy', label, className, ...props }: MorphIconProps) {
  const holder = useRef<HTMLSpanElement>(null);
  const known = typeof icon === 'string' ? icon : cache.get(icon);
  const [input, setInput] = useState<IconInput | undefined>(known);

  // An Iconoir component is rendered once into a hidden holder and read back
  // as markup (it needs React context, so it can't be called directly).
  useLayoutEffect(() => {
    if (typeof icon === 'string') {
      setInput(icon);
      return;
    }
    let v = cache.get(icon);
    const svg = holder.current?.querySelector('svg');
    if (!v && svg) {
      v = svgToIcon(svg.outerHTML);
      cache.set(icon, v);
    }
    if (v) setInput(v);
  }, [icon]);

  const Static = typeof icon === 'string' ? null : icon;
  const shared = { 'data-slot': 'morph-icon', className: cn('shrink-0', className) };
  return (
    <>
      {Static && !cache.has(Static) && (
        <span ref={holder} hidden>
          <Static />
        </span>
      )}
      {input ? (
        <Morph icon={input} spring={spring} reducedMotion="user" size="1.5em" strokeWidth={1.5} label={label} {...shared} {...props} />
      ) : (
        // First paint before the shape is read: the plain icon, same size.
        Static && <Static aria-hidden={label ? undefined : true} aria-label={label} role={label ? 'img' : undefined} {...shared} {...props} />
      )}
    </>
  );
}
