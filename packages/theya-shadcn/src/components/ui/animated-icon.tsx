'use client';

import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

/**
 * Animated icons — iconoir 7.12.1 geometry (the same paths as `iconoir-react`,
 * so they sit next to static icons without a style break), animated in CSS
 * only (keyframes in styles/motion.css, durations and easings from the motion
 * tokens). No animation library.
 *
 * trigger:
 * - `hover` (default) — plays when the icon or an interactive ancestor
 *   (button, link, [role=button], label, [data-icon-trigger]) is hovered or
 *   keyboard-focused. Purely decorative motion.
 * - `active` — shows the icon's second state while `active` is true
 *   (Copy → Check, Plus → ×, Menu → ×, Eye → closed, Heart → filled).
 *   The state change itself always happens; only the transition is motion.
 * - `loop` — repeats while mounted (Refresh as a spinner). Use only for
 *   short-lived busy states.
 *
 * prefers-reduced-motion: no keyframes and no transitions; `active` states
 * still switch, instantly.
 *
 * Decorative by default (aria-hidden). Name the control, not the icon.
 */
export type AnimatedIconTrigger = 'hover' | 'active' | 'loop';

export interface AnimatedIconProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref'> {
  /** When the motion plays. Default `hover`. */
  trigger?: AnimatedIconTrigger;
  /** Second state for icons that have one (Copy, Plus, Menu, Eye, Heart). */
  active?: boolean;
}

type BaseProps = AnimatedIconProps & { motion: string; children: React.ReactNode };

const Base = forwardRef<SVGSVGElement, BaseProps>(function Base(
  { motion, trigger = 'hover', active = false, className, children, ...props },
  ref,
) {
  return (
    <svg
      ref={ref}
      width="1.5em"
      height="1.5em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-slot="animated-icon"
      data-motion={motion}
      data-trigger={trigger}
      data-active={active || undefined}
      className={cn('theya-anim-icon', className)}
      {...props}
    >
      {children}
    </svg>
  );
});

function make(motion: string, displayName: string, body: React.ReactNode) {
  const C = forwardRef<SVGSVGElement, AnimatedIconProps>(function AnimatedIcon(props, ref) {
    return (
      <Base ref={ref} motion={motion} {...props}>
        {body}
      </Base>
    );
  });
  C.displayName = displayName;
  return C;
}

/** Tick draws itself along its stroke. */
export const CheckAnimated = make('draw', 'CheckAnimated', <path data-part="draw" pathLength={1} d="M5 13L9 17L19 7" />);

/** Hover: the back sheet slides out. Active: the sheets give way to a drawn tick. */
export const CopyAnimated = make(
  'copy',
  'CopyAnimated',
  <>
    <g data-part="off">
      <path d="M19.4 20H9.6C9.26863 20 9 19.7314 9 19.4V9.6C9 9.26863 9.26863 9 9.6 9H19.4C19.7314 9 20 9.26863 20 9.6V19.4C20 19.7314 19.7314 20 19.4 20Z" />
      <path data-part="back" d="M15 9V4.6C15 4.26863 14.7314 4 14.4 4H4.6C4.26863 4 4 4.26863 4 4.6V14.4C4 14.7314 4.26863 15 4.6 15H9" />
    </g>
    <path data-part="on" pathLength={1} d="M5 13L9 17L19 7" />
  </>,
);

/** Swings from the top, the clapper a beat behind. */
export const BellAnimated = make(
  'ring',
  'BellAnimated',
  <>
    <path data-part="body" d="M18 8.4C18 6.70261 17.3679 5.07475 16.2426 3.87452C15.1174 2.67428 13.5913 2 12 2C10.4087 2 8.88258 2.67428 7.75736 3.87452C6.63214 5.07475 6 6.70261 6 8.4C6 15.8667 3 18 3 18H21C21 18 18 15.8667 18 8.4Z" />
    <path data-part="clapper" d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" />
  </>,
);

/** The gear turns a quarter. */
export const SettingsAnimated = make(
  'turn',
  'SettingsAnimated',
  <g data-part="turn">
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
    <path d="M19.6224 10.3954L18.5247 7.7448L20 6L18 4L16.2647 5.48295L13.5578 4.36974L12.9353 2H10.981L10.3491 4.40113L7.70441 5.51596L6 4L4 6L5.45337 7.78885L4.3725 10.4463L2 11V13L4.40111 13.6555L5.51575 16.2997L4 18L6 20L7.79116 18.5403L10.397 19.6123L11 22H13L13.6045 19.6132L16.2551 18.5155C16.6969 18.8313 18 20 18 20L20 18L18.5159 16.2494L19.6139 13.598L21.9999 12.9772L22 11L19.6224 10.3954Z" />
  </g>,
);

/** One full turn on hover; with trigger="loop" it spins (busy). */
export const RefreshAnimated = make(
  'spin',
  'RefreshAnimated',
  <g data-part="spin">
    <path d="M21.8883 13.5C21.1645 18.3113 17.013 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C16.1006 2 19.6248 4.46819 21.1679 8" />
    <path d="M17 8H21.4C21.7314 8 22 7.73137 22 7.4V3" />
  </g>,
);

/** The lid lifts and settles. */
export const TrashAnimated = make(
  'lid',
  'TrashAnimated',
  <>
    <path d="M20 9L18.005 20.3463C17.8369 21.3026 17.0062 22 16.0353 22H7.96474C6.99379 22 6.1631 21.3026 5.99496 20.3463L4 9" />
    <path data-part="lid" d="M21 6L15.375 6M3 6L8.625 6M8.625 6V4C8.625 2.89543 9.52043 2 10.625 2H13.375C14.4796 2 15.375 2.89543 15.375 4V6M8.625 6L15.375 6" />
  </>,
);

/** Hover: blinks. Active: closed (iconoir EyeClosed). */
export const EyeAnimated = make(
  'eye',
  'EyeAnimated',
  <>
    <g data-part="off">
      <path d="M3 13C6.6 5 17.4 5 21 13" />
      <path d="M12 17C10.3431 17 9 15.6569 9 14C9 12.3431 10.3431 11 12 11C13.6569 11 15 12.3431 15 14C15 15.6569 13.6569 17 12 17Z" />
    </g>
    <g data-part="on">
      <path d="M19.5 16L17.0248 12.6038" />
      <path d="M12 17.5V14" />
      <path d="M4.5 16L6.96895 12.6124" />
      <path d="M3 8C6.6 16 17.4 16 21 8" />
    </g>
  </>,
);

/** A short nudge forward (mirrors in RTL). */
export const ArrowRightAnimated = make('nudge', 'ArrowRightAnimated', <path data-part="nudge" d="M3 12L21 12M21 12L12.5 3.5M21 12L12.5 20.5" />);

/** The arrow drops onto the tray. */
export const DownloadAnimated = make(
  'drop',
  'DownloadAnimated',
  <>
    <path d="M6 20L18 20" />
    <path data-part="arrow" d="M12 4V16M12 16L15.5 12.5M12 16L8.5 12.5" />
  </>,
);

/** The arrow lifts off the tray. */
export const UploadAnimated = make(
  'lift',
  'UploadAnimated',
  <>
    <path d="M6 20L18 20" />
    <path data-part="arrow" d="M12 16V4M12 4L15.5 7.5M12 4L8.5 7.5" />
  </>,
);

/** Active: turns into × (add → close). */
export const PlusAnimated = make('plus', 'PlusAnimated', <path data-part="turn" d="M6 12H12M18 12H12M12 12V6M12 12V18" />);

/** Hover: a heartbeat. Active: filled. */
export const HeartAnimated = make(
  'heart',
  'HeartAnimated',
  <path
    data-part="heart"
    d="M22 8.86222C22 10.4087 21.4062 11.8941 20.3458 12.9929C17.9049 15.523 15.5374 18.1613 13.0053 20.5997C12.4249 21.1505 11.5042 21.1304 10.9488 20.5547L3.65376 12.9929C1.44875 10.7072 1.44875 7.01723 3.65376 4.73157C5.88044 2.42345 9.50794 2.42345 11.7346 4.73157L11.9998 5.00642L12.2648 4.73173C13.3324 3.6245 14.7864 3 16.3053 3C17.8242 3 19.2781 3.62444 20.3458 4.73157C21.4063 5.83045 22 7.31577 22 8.86222Z"
  />,
);

/** Active: the three lines fold into ×. */
export const MenuAnimated = make(
  'menu',
  'MenuAnimated',
  <>
    <path data-part="top" d="M3 5H21" />
    <path data-part="mid" d="M3 12H21" />
    <path data-part="bottom" d="M3 19H21" />
  </>,
);

/** Every animated icon, for docs and pickers. */
export const ANIMATED_ICONS = {
  Check: CheckAnimated,
  Copy: CopyAnimated,
  Bell: BellAnimated,
  Settings: SettingsAnimated,
  Refresh: RefreshAnimated,
  Trash: TrashAnimated,
  Eye: EyeAnimated,
  ArrowRight: ArrowRightAnimated,
  Download: DownloadAnimated,
  Upload: UploadAnimated,
  Plus: PlusAnimated,
  Heart: HeartAnimated,
  Menu: MenuAnimated,
} as const;

export type AnimatedIconName = keyof typeof ANIMATED_ICONS;

export interface AnimatedIconByNameProps extends AnimatedIconProps {
  /** Which icon: Check, Copy, Bell, Settings, Refresh, Trash, Eye, ArrowRight, Download, Upload, Plus, Heart, Menu. */
  name: AnimatedIconName;
}

/** Any animated icon by name — handy when the icon comes from data. Import the named component (e.g. CopyAnimated) otherwise. */
export const AnimatedIcon = forwardRef<SVGSVGElement, AnimatedIconByNameProps>(function AnimatedIcon({ name, ...props }, ref) {
  const Icon = ANIMATED_ICONS[name];
  return <Icon ref={ref} {...props} />;
});
