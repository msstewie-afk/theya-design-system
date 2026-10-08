import { Children, isValidElement } from 'react';

/**
 * True when the only content is one icon: an `<svg>` or a component element
 * (iconoir icons are components). Text, numbers and plain HTML elements such
 * as `<span>` count as a label. A component that renders text needs an
 * explicit `iconOnly={false}`.
 */
export function isIconOnlyContent(children: React.ReactNode): boolean {
  const items = Children.toArray(children);
  if (items.length !== 1) return false;
  const only = items[0];
  return isValidElement(only) && (only.type === 'svg' || typeof only.type !== 'string');
}
