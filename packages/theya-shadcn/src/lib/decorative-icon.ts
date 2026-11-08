'use client';

import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';

/**
 * Marks a consumer-provided icon as decorative for assistive tech
 * (aria-hidden="true"), unless the consumer already set their own
 * aria-hidden/aria-label on it. The control's own accessible name (its text,
 * or the aria-label icon-only controls must carry) already covers it.
 *
 * Why it matters even though a button's children are presentational per
 * ARIA: Safari exposes an unhidden svg inside a button as an image, the
 * button becomes a group (text + image), VoiceOver steps into it and
 * VO + Space no longer presses the control or speaks its state.
 */
export function decorativeIcon(node: ReactNode): ReactNode {
  if (!isValidElement(node)) return node;
  const props = node.props as Record<string, unknown>;
  if ('aria-hidden' in props || 'aria-label' in props || 'aria-labelledby' in props) return node;
  return cloneElement(node as ReactElement<Record<string, unknown>>, { 'aria-hidden': 'true' });
}

/**
 * decorativeIcon over a control's children: hides every direct child element
 * that has no children of its own (an icon component or a bare <svg>), and
 * leaves text and wrapping elements (<span>Bold</span>) alone. Pass the
 * control's asChild: its child is then the control, never hidden.
 */
export function decorativeChildren(children: ReactNode, asChild?: boolean): ReactNode {
  // asChild: the child is the control itself (Radix Slot), not its content.
  if (asChild) return children;
  // A single element stays a single element (not a one-item array): asChild
  // controls hand their child to Radix Slot, which needs exactly one.
  if (isValidElement(children)) return decorateChild(children);
  return Children.map(children, decorateChild);
}

function decorateChild(child: ReactNode): ReactNode {
  if (!isValidElement(child)) return child;
  const props = child.props as Record<string, unknown>;
  if (props.children != null && child.type !== 'svg') return child;
  return decorativeIcon(child);
}
