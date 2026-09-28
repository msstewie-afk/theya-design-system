import { forwardRef, cloneElement, isValidElement } from 'react';
import type { ButtonHTMLAttributes, MouseEvent, ReactElement, ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Rebuilt on shadcn's pattern (Radix Slot + cva + Tailwind) instead of
 * CSS modules. The prop API is unchanged from the old Theya Button —
 * appearance/tone/size/fullWidth/iconOnly/leftIcon/rightIcon all mean
 * exactly what they meant before. Every color/spacing value below is
 * copied 1:1 from the old Button.module.css (same CSS custom properties,
 * just referenced as Tailwind arbitrary values instead of a .module.css
 * class), so this should render pixel-identical to the old component.
 *
 * New: `asChild` (shadcn convention) — renders the button's styles onto
 * its child element via Radix Slot instead of a <button>, e.g. to make a
 * Next.js <Link> look like a Button.
 *
 * Requires: npm i class-variance-authority @radix-ui/react-slot
 */

export const buttonVariants = cva(
  // base — structure shared by every button
  [
    // select-none removed (2026-09-27) — same fix as Label: it blocked
    // selecting/copying a button's own visible text (Мария), with no real
    // upside once double-click-drag text smear is handled by whitespace-nowrap.
    // relative: anchors the loading spinner overlay (see Button render).
    'relative inline-flex items-center justify-center whitespace-nowrap cursor-pointer',
    // Rounder than inputs on purpose (Мария, 2026-09-27): TextField/Select
    // stay at lg (6px), Button steps up to xl (8px) — a deliberate visual
    // difference between "you type into this" and "you press this", even
    // though a button-anchored dropdown can't always match both.
    'rounded-xl',
    'disabled:cursor-not-allowed disabled:opacity-50',
    // Soft-disable (softDisabled prop): same look as native disabled, but
    // driven by aria-disabled so the button stays focusable/hoverable (can
    // carry a tooltip explaining why). Every hover/active rule below is also
    // gated with not-aria-disabled so a soft-disabled button doesn't react.
    'aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
    // Focus ring: Theya's own token (--color-focus-focus-ring, blue-a400,
    // rgba(55,149,255,0.4)), single soft ring, no override.
    // ACCEPTED DEVIATION (Мария, 2026-09-27): composites to 1.53:1 on white,
    // 1.87:1 on dark bg-surface, 1.95:1 on dark bg-surface-overlay — under
    // WCAG 1.4.11's 3:1 for a focus indicator. Kept on purpose for the soft
    // visual style; applies system-wide (~35 components where the ring is the
    // only focus change). Documented in the project's WCAG audit doc
    // (claude/wcag-aa-audit-2026-09-27.md, "Accepted deviations"). Do not
    // "fix" locally in one component — change the token if this is revisited.
    'focus-visible:outline-none',
    'focus-visible:shadow-[0_0_0_3px_var(--color-focus-focus-ring)]',
    // Color/border/shadow transitions use a plain ease-out — no overshoot.
    // Transform (the press scale) uses Material's "standard" easing
    // (cubic-bezier(0.4,0,0.2,1)) on both press and release.
    '[transition:background-color_150ms_ease-out,border-color_150ms_ease-out,box-shadow_150ms_ease-out,transform_220ms_cubic-bezier(0.34,1.56,0.64,1)]',
    'active:not-disabled:not-aria-disabled:[transition:background-color_150ms_ease-out,border-color_150ms_ease-out,box-shadow_150ms_ease-out,transform_150ms_cubic-bezier(0.4,0,0.2,1)]',
    // motion-safe: scale only applies if the user hasn't asked for
    // reduced motion (WCAG 2.3.3) — color/border/shadow transitions stay
    // either way since they're not the kind of motion that triggers
    // vestibular issues.
    'motion-safe:active:not-disabled:not-aria-disabled:scale-[0.96]',
  ],
  {
    variants: {
      appearance: {
        filled: '',
        tonal: '',
        outlined: [
          'bg-transparent border border-solid text-[var(--color-text-text-subtle)]',
          // Figma quirk carried over as-is: pressed radius bumps up a step from
          // the resting state (was 6->8px; base moved to xl/8px on 2026-09-27,
          // so this now bumps 8->10px to keep the same "grows when pressed" feel).
          'active:not-disabled:not-aria-disabled:rounded-[var(--size-border-radius-border-radius-2xl)]',
        ],
        ghost: 'bg-transparent border-none text-[var(--color-text-text-subtle)]',
      },
      tone: {
        primary: '',
        secondary: '',
        success: '',
        warning: '',
        danger: '',
        info: '',
        neutral: '',
      },
      size: {
        sm: [
          'h-[var(--size-size-control-size-control-md)]', // 28px
          'px-[var(--size-padding-padding-xs)] gap-[var(--size-size4)]',
          '[font-family:var(--typography-button-s-font)] font-normal',
          '[font-size:var(--typography-button-s-size)]',
          '[line-height:var(--typography-button-s-line-height)]',
          '[letter-spacing:var(--typography-button-s-letter-spacing)]',
          '[&_svg]:size-[var(--size-icon-icon-xs)]', // 12px icons
        ],
        md: [
          'h-[var(--size-size-control-size-control-lg)]', // 32px
          'px-[var(--size-padding-padding-md)] gap-[var(--size-size4)]',
          '[font-family:var(--typography-button-m-font)] font-normal',
          '[font-size:var(--typography-button-m-size)]',
          '[line-height:var(--typography-button-m-line-height)]',
          '[letter-spacing:var(--typography-button-m-letter-spacing)]',
          '[&_svg]:size-[var(--size-icon-icon-sm)]', // 16px icons
        ],
        lg: [
          'h-[var(--size-size-control-size-control-xl)]', // 36px — now a real control-size token (was raw --size-size36)
          'px-[var(--size-padding-padding-md)] gap-[var(--size-size6)]',
          '[font-family:var(--typography-button-m-font)] font-normal',
          '[font-size:var(--typography-button-m-size)]',
          '[line-height:var(--typography-button-m-line-height)]',
          '[letter-spacing:var(--typography-button-m-letter-spacing)]',
          '[&_svg]:size-[var(--size-icon-icon-sm)]', // 16px icons
        ],
        xl: [
          'h-[var(--size-size-control-size-control-2xl)]', // 40px — matches TextField/Select/Filter's default row height
          'px-[calc((var(--size-padding-padding-md)_+_var(--size-padding-padding-lg))_/_2)] gap-[var(--size-size6)]', // 14px — no token sits exactly between md(12)/lg(16)
          '[font-family:var(--typography-button-m-font)] font-normal',
          '[font-size:var(--typography-button-m-size)]',
          '[line-height:var(--typography-button-m-line-height)]',
          '[letter-spacing:var(--typography-button-m-letter-spacing)]',
          '[&_svg]:size-[var(--size-icon-icon-sm)]', // 16px icons
        ],
        '2xl': [
          'h-[var(--size-size-control-size-control-4xl)]', // 48px — now a real control-size token (was hardcoded 44px)
          'px-[var(--size-padding-padding-lg)] gap-[var(--size-size6)]',
          '[font-family:var(--typography-button-l-font)] font-normal',
          '[font-size:var(--typography-button-l-size)]',
          '[line-height:var(--typography-button-l-line-height)]',
          '[letter-spacing:var(--typography-button-l-letter-spacing)]',
          '[&_svg]:size-[var(--size-icon-icon-md)]', // 24px icons — scaled up to match the bigger control
        ],
      },
      fullWidth: {
        true: 'w-full',
      },
      iconOnly: {
        true: 'px-0! aspect-square',
      },
    },
    compoundVariants: [
      // ---------- ICON-ONLY × size ----------
      // sm icon-only buttons default to a bigger 16px icon than a labeled sm
      // button's 12px (--size-icon-icon-xs) — a bare icon at 12px inside a
      // 28px square target reads too small on its own with no text to anchor
      // it. Overrides the base `size: 'sm'` icon-size class below.
      {
        size: 'sm',
        iconOnly: true,
        class: '[&_svg]:size-[var(--size-icon-icon-sm)]', // 16px
      },

      // ---------- FILLED × tone ----------
      {
        appearance: 'filled',
        tone: 'primary',
        class: [
          'bg-[var(--color-bg-primary-bg-primary)] text-[var(--color-text-text-on-dark)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-bg-primary-bg-primary-hover)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-bg-primary-bg-primary-pressed)]',
        ],
      },
      {
        appearance: 'filled',
        tone: 'info',
        class: [
          'bg-[var(--color-bg-info-bg-info)] text-[var(--color-cyan-cyan-900)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-bg-info-bg-info-hover)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-bg-info-bg-info-pressed)]',
        ],
      },
      {
        // Was hardcoded to #448018/#336112/#1f3b0b — a hand-picked darkening
        // of the raw bg-success token to clear WCAG AA (old raw value was
        // 4.37:1 with white text, under the 4.5:1 minimum), bypassing the
        // token entirely so the primitive recalibration (2026-09-26) had no
        // effect on this button. Now that green's primitive ramp is fixed,
        // the real token clears AA on its own (light theme 4.87:1, dark
        // theme 11.8:1) — wired to it directly, no override needed.
        appearance: 'filled',
        tone: 'success',
        class: [
          'bg-[var(--color-bg-success-bg-success)] text-[var(--color-text-text-on-dark)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-bg-success-bg-success-hover)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-bg-success-bg-success-pressed)]',
        ],
      },
      {
        // CORRECTED 2026-09-26 (Мария, audit pass): the claim below that
        // text-on-dark "clears 5.85:1+ at every state" was only checked for
        // dark theme — in LIGHT theme, warning's bg is a bright, near-white
        // yellow (#ffd52e) and white text on it measures ~1.42:1, practically
        // unreadable (confirmed live). Mария's rule: solid/filled warning text
        // must read the same as tonal warning's text — same ink color, not a
        // separate on-dark treatment.
        //
        // Can't just swap to the theme-flipping `text-text-warning` token
        // everywhere though: its DARK-theme value (#ff9f2e, bright orange) is
        // too close in hue to warning's own dark-theme bg (orange-700,
        // #A54A11) — only 2.86:1, a real regression from the white text's
        // working 5.85:1 there. So this is intentionally theme-split, unlike
        // every other filled/tonal compound variant in this file: light theme
        // gets the real ink token (matches Tonal exactly, fixes the 1.42:1
        // fail); dark theme keeps text-on-dark (the only thing that clears AA
        // against that particular dark-orange bg).
        appearance: 'filled',
        tone: 'warning',
        class: [
          'bg-[var(--color-bg-warning-bg-warning)] text-[var(--color-text-text-warning)]',
          '[[data-theme=dark]_&]:text-[var(--color-text-text-on-dark)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-bg-warning-bg-warning-hover)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-bg-warning-bg-warning-pressed)]',
        ],
      },
      {
        appearance: 'filled',
        tone: 'danger',
        class: [
          'bg-[var(--color-bg-danger-bg-danger)] text-[var(--color-text-text-on-dark)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-bg-danger-bg-danger-hover)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-bg-danger-bg-danger-pressed)]',
        ],
      },
      {
        // "Neutral" tone — dark neutral gray, hand-tuned to 3%
        // saturation (down from bg-neutral's original ~7.7%) for a
        // flatter, more neutral gray. Hover/pressed derived with the
        // same lightness-drop ratio as Primary's own default→hover→
        // pressed steps (-7.25% / -16.08%), same as Secondary below.
        appearance: 'filled',
        tone: 'neutral',
        class: [
          'bg-[#65656b] text-[var(--color-text-text-on-dark)]',
          'hover:not-disabled:not-aria-disabled:bg-[#535358]',
          'active:not-disabled:not-aria-disabled:bg-[#3d3d41]',
        ],
      },
      {
        // Secondary — new base color (#6a6c96), not yet in the Style
        // Dictionary token set, so hardcoded here as an arbitrary value
        // for now. Hover/pressed derived by applying the same lightness
        // drop Primary uses between its own default→hover→pressed
        // (-7.25% / -16.08% lightness), not hand-picked.
        appearance: 'filled',
        tone: 'secondary',
        class: [
          'bg-[#6a6c96] text-[var(--color-text-text-on-dark)]',
          'hover:not-disabled:not-aria-disabled:bg-[#5b5c80]',
          'active:not-disabled:not-aria-disabled:bg-[#484966]',
        ],
      },

      // ---------- TONAL × tone ----------
      // Same idea as Filled, but always uses the "-subtle" background
      // tier instead of the solid one — softer fill, same interaction
      // pattern. (This is what Secondary Filled used to look like,
      // generalized to every tone.)
      {
        appearance: 'tonal',
        tone: 'primary',
        class: [
          // Dark: text-link-on-tonal (#bddcff) fell to 3.86/3.31:1 on the
          // hover/pressed tints over bg-surface; white clears 4.68:1+ in
          // every state on both surface and surface-overlay (2026-09-27).
          'bg-[var(--color-bg-primary-bg-primary-subtle)] text-[var(--color-text-text-link-on-tonal)] [[data-theme=dark]_&]:text-[var(--color-text-text-on-dark)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-bg-primary-bg-primary-subtle-hover)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-bg-primary-bg-primary-subtle-pressed)]',
        ],
      },
      {
        appearance: 'tonal',
        tone: 'info',
        class: [
          'bg-[var(--color-cyan-cyan-050)] text-[var(--color-cyan-cyan-900)] [[data-theme=dark]_&]:bg-[var(--color-cyan-cyan-800)] [[data-theme=dark]_&]:text-[var(--color-cyan-cyan-100)]', // dark text cyan-200 -> cyan-100: hover (cyan-700) was 4.38:1, now 4.89:1,
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-cyan-cyan-100)] [[data-theme=dark]_&]:hover:not-disabled:not-aria-disabled:bg-[var(--color-cyan-cyan-700)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-cyan-cyan-200)] [[data-theme=dark]_&]:active:not-disabled:not-aria-disabled:bg-[var(--color-cyan-cyan-900)]',
        ],
      },
      {
        // Tonal x success/warning/danger text (2026-09-27, WCAG AA pass):
        // dark theme's -subtle bgs are light alpha tints, so each hover/
        // pressed step gets LIGHTER and the mid-tone status text (-200 step)
        // lost contrast: success 3.59/3.09/2.67, warning 3.74/3.02/2.45,
        // danger 3.14/2.82/2.51 (rest/hover/pressed on bg-surface). Dark now
        // uses the palest step that clears 4.5:1 in all three states on both
        // bg-surface and bg-surface-overlay - the same "on-container" idea as
        // M3 (tone-90 text on a tone-30 container). Light success also failed
        // on hover/pressed (green-600: 4.39/3.87), bumped to green-700.
        appearance: 'tonal',
        tone: 'success',
        class: [
          'bg-[var(--color-bg-success-bg-success-subtle)] text-[var(--color-green-green-700)] [[data-theme=dark]_&]:text-[var(--color-green-green-010)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-bg-success-bg-success-subtle-hover)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-bg-success-bg-success-subtle-pressed)]',
        ],
      },
      {
        appearance: 'tonal',
        tone: 'warning',
        class: [
          'bg-[var(--color-bg-warning-bg-warning-subtle)] text-[var(--color-text-text-warning)] [[data-theme=dark]_&]:text-[var(--color-orange-orange-005)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-bg-warning-bg-warning-subtle-hover)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-bg-warning-bg-warning-subtle-pressed)]',
        ],
      },
      {
        appearance: 'tonal',
        tone: 'danger',
        class: [
          'bg-[var(--color-bg-danger-bg-danger-subtle)] text-[var(--color-text-text-danger)] [[data-theme=dark]_&]:text-[var(--color-red-red-050)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-bg-danger-bg-danger-subtle-hover)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-bg-danger-bg-danger-subtle-pressed)]',
        ],
      },
      {
        // Secondary Tonal — this is the old default Secondary look,
        // unchanged, just renamed conceptually to Tonal.
        appearance: 'tonal',
        tone: 'secondary',
        class: [
          'bg-[var(--color-bg-secondary-bg-secondary-subtle)] text-[var(--color-text-text)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-bg-secondary-bg-secondary-subtle-hover)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-bg-secondary-bg-secondary-subtle-pressed)]',
        ],
      },
      {
        // Default Tonal — subtle version of the Neutral gray.
        appearance: 'tonal',
        tone: 'neutral',
        class: [
          'bg-[var(--color-bg-neutral-bg-neutral-subtle)] text-[var(--color-text-text)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-bg-neutral-bg-neutral-subtle-hover)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-bg-neutral-bg-neutral-subtle-pressed)]',
        ],
      },

      // ---------- OUTLINED × tone ----------
      {
        appearance: 'outlined',
        tone: 'primary',
        class: [
          'border-[var(--color-border-border-primary)]',
          '[&_svg]:text-[var(--color-icon-icon-primary)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-bg-primary-bg-primary-subtler-hover)]',
          'focus-visible:bg-[var(--color-bg-primary-bg-primary-subtler-hover)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-bg-primary-bg-primary-subtler-pressed)]',
        ],
      },
      {
        appearance: 'outlined',
        tone: 'info',
        class: [
          'border-[var(--color-border-border-info)]',
          '[&_svg]:text-[var(--color-icon-icon-info)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-bg-info-bg-info-subtler-hover)]',
          'focus-visible:bg-[var(--color-bg-info-bg-info-subtler-hover)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-bg-info-bg-info-subtler-pressed)]',
        ],
      },
      {
        appearance: 'outlined',
        tone: 'success',
        class: [
          'border-[var(--color-border-border-success)]',
          '[&_svg]:text-[var(--color-icon-icon-success)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-bg-success-bg-success-subtler-hover)]',
          'focus-visible:bg-[var(--color-bg-success-bg-success-subtler-hover)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-bg-success-bg-success-subtler-pressed)]',
        ],
      },
      {
        appearance: 'outlined',
        tone: 'warning',
        class: [
          'border-[var(--color-border-border-warning)]',
          '[&_svg]:text-[var(--color-icon-icon-warning)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-bg-warning-bg-warning-subtler-hover)]',
          'focus-visible:bg-[var(--color-bg-warning-bg-warning-subtler-hover)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-bg-warning-bg-warning-subtler-pressed)]',
        ],
      },
      {
        appearance: 'outlined',
        tone: 'danger',
        class: [
          'border-[var(--color-border-border-danger)]',
          '[&_svg]:text-[var(--color-icon-icon-danger)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-bg-danger-bg-danger-subtler-hover)]',
          'focus-visible:bg-[var(--color-bg-danger-bg-danger-subtler-hover)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-bg-danger-bg-danger-subtler-pressed)]',
        ],
      },
      {
        // Border was --color-border-border-subtle (#bec0e9, 1.76:1 vs
        // white — fails WCAG 1.4.11's 3:1 minimum for UI components,
        // the border was nearly invisible). Swapped to Secondary's own
        // base color (#6a6c96, 5.0:1) — happens to already clear the
        // bar with no extra color work needed.
        //
        // Hover/press: fixed from the "-subtle" tier (Tonal's solid-fill
        // strength) to "-subtler" — every other Outlined tone uses the
        // lighter "-subtler" wash for its hover/press fill; Secondary had
        // been copy-pasted from Tonal's own compound variant above and
        // read noticeably darker than every sibling button as a result.
        appearance: 'outlined',
        tone: 'secondary',
        class: [
          // Dark: #6a6c96 is only 2.82:1 on bg-surface (#282944), under
          // 1.4.11's 3:1 - dark theme uses border-subtle (#6e709f, 3.01:1),
          // same lavender family (2026-09-27).
          'border-[#6a6c96] [[data-theme=dark]_&]:border-[var(--color-border-border-subtle)]',
          '[&_svg]:text-[var(--color-icon-icon)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-bg-secondary-bg-secondary-subtler-hover)]',
          'focus-visible:bg-[var(--color-bg-secondary-bg-secondary-subtler-hover)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-bg-secondary-bg-secondary-subtler-pressed)]',
        ],
      },

      // ---------- GHOST × tone ----------
      {
        appearance: 'ghost',
        tone: 'primary',
        class: [
          // Dark: text-link (#63acff) dropped to 4.41/3.75:1 on hover/pressed
          // tints over bg-surface; text-link-on-tonal (#bddcff) holds 6.28:1+.
          'text-[var(--color-text-text-link)] [[data-theme=dark]_&]:text-[var(--color-text-text-link-on-tonal)] [&_svg]:text-[var(--color-icon-icon-primary)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-bg-primary-bg-primary-subtler-hover)]',
          'focus-visible:bg-[var(--color-bg-primary-bg-primary-subtler-hover)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-bg-primary-bg-primary-subtler-pressed)]',
        ],
      },
      {
        appearance: 'ghost',
        tone: 'info',
        class: [
          // Icon follows the label color: icon-info (#0091ae) was 2.64:1 on
          // the light pressed bg (cyan-100), under the 3:1 non-text minimum.
          'text-[var(--color-text-text-info)] [&_svg]:text-[var(--color-text-text-info)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-cyan-cyan-050)] [[data-theme=dark]_&]:hover:not-disabled:not-aria-disabled:bg-[var(--color-cyan-cyan-800)]',
          'focus-visible:bg-[var(--color-cyan-cyan-050)] [[data-theme=dark]_&]:focus-visible:bg-[var(--color-cyan-cyan-800)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-cyan-cyan-100)] [[data-theme=dark]_&]:active:not-disabled:not-aria-disabled:bg-[var(--color-cyan-cyan-900)]',
        ],
      },
      {
        appearance: 'ghost',
        tone: 'success',
        class: [
          // green-600 -> green-700 (light pressed was 4.39:1); dark green-200
          // -> green-100 (dark pressed was 4.17:1).
          'text-[var(--color-green-green-700)] [[data-theme=dark]_&]:text-[var(--color-green-green-100)] [&_svg]:text-[var(--color-icon-icon-success)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-bg-success-bg-success-subtler-hover)]',
          'focus-visible:bg-[var(--color-bg-success-bg-success-subtler-hover)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-bg-success-bg-success-subtler-pressed)]',
        ],
      },
      {
        appearance: 'ghost',
        tone: 'warning',
        class: [
          'text-[var(--color-text-text-warning)] [&_svg]:text-[var(--color-icon-icon-warning)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-bg-warning-bg-warning-subtler-hover)]',
          'focus-visible:bg-[var(--color-bg-warning-bg-warning-subtler-hover)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-bg-warning-bg-warning-subtler-pressed)]',
        ],
      },
      {
        appearance: 'ghost',
        tone: 'danger',
        class: [
          'text-[var(--color-text-text-danger)] [&_svg]:text-[var(--color-icon-icon-danger)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-bg-danger-bg-danger-subtler-hover)]',
          'focus-visible:bg-[var(--color-bg-danger-bg-danger-subtler-hover)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-bg-danger-bg-danger-subtler-pressed)]',
        ],
      },
      {
        // Same fix as Outlined Secondary above: "-subtle" → "-subtler".
        appearance: 'ghost',
        tone: 'secondary',
        class: [
          '[&_svg]:text-[var(--color-icon-icon)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-bg-secondary-bg-secondary-subtler-hover)]',
          'focus-visible:bg-[var(--color-bg-secondary-bg-secondary-subtler-hover)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-bg-secondary-bg-secondary-subtler-pressed)]',
        ],
      },

      // ---------- OUTLINED/GHOST × default ----------
      // Was missing entirely: with no compound variant for tone="neutral"
      // on these two types, the button fell through to the bare type-level
      // base classes only (a border with no color, an icon with no color,
      // and no hover/press fill at all) — the "no color anywhere" bug.
      // Border stays the same fixed hardcoded gray Filled+default's own BG
      // uses (#65656b) — deliberate, a border color that should look the
      // same regardless of theme, same idea as Secondary's own hardcoded
      // border. The ICON, though, was ALSO pinned to that same fixed hex —
      // wrong, since the button's own label text right next to it already
      // uses the theme-reactive `text-text-subtle` (from the base `ghost`/
      // `outlined` type classes) and looks correct in both themes; the icon
      // just didn't match it. In dark theme this read as a washed-out/too
      // -light icon next to normal-weight quiet text (Мария, on CodeBlock's
      // copy-button icon: "слишком светлый цвет у иконки-кнопки ghost
      // справа"). Fixed by pointing the icon at the same token as the text
      // instead of the fixed hex — CopyButton (used by CodeBlock/CodeEditor/
      // SecretField, all `tone="neutral"` by default) picks this up too.
      {
        appearance: 'outlined',
        tone: 'neutral',
        class: [
          // Dark: #65656b is 2.43:1 on bg-surface (1.4.11 needs 3:1) -> gray-300
          // (#9696ac, 4.87:1). Hover/press moved from the "-subtle" tier to
          // "-subtler" like every other Outlined/Ghost tone: in dark, the
          // -subtle tier washed text-subtle down to 3.51/2.61:1 (2026-09-27).
          'border-[#65656b] [[data-theme=dark]_&]:border-[var(--color-gray-gray-300)]',
          '[&_svg]:text-[var(--color-text-text-subtle)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-bg-neutral-bg-neutral-subtler-hover)]',
          'focus-visible:bg-[var(--color-bg-neutral-bg-neutral-subtler-hover)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-bg-neutral-bg-neutral-subtler-pressed)]',
        ],
      },
      {
        appearance: 'ghost',
        tone: 'neutral',
        class: [
          '[&_svg]:text-[var(--color-text-text-subtle)]',
          'hover:not-disabled:not-aria-disabled:bg-[var(--color-bg-neutral-bg-neutral-subtler-hover)]',
          'focus-visible:bg-[var(--color-bg-neutral-bg-neutral-subtler-hover)]',
          'active:not-disabled:not-aria-disabled:bg-[var(--color-bg-neutral-bg-neutral-subtler-pressed)]',
        ],
      },

    ],
    defaultVariants: {
      appearance: 'filled',
      tone: 'primary',
      size: 'xl',
    },
  },
);

/**
 * Loading spinner used by Button's `loading` state. Plain SVG circle,
 * one arc drawn via stroke-dasharray, spun with Tailwind's animate-spin.
 * Sized automatically by the same `[&_svg]:size-[...]` rule the size
 * variants already apply to leftIcon/rightIcon — no separate sizing logic.
 */
function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Marks a consumer-provided icon as decorative for assistive tech
 * (aria-hidden="true"), unless the consumer already set their own
 * aria-hidden/aria-label on it — the button's own accessible name (its
 * text, or the aria-label callers must supply for iconOnly) already
 * covers it, so the icon shouldn't be separately announced.
 */
function decorativeIcon(node: ReactNode): ReactNode {
  if (!isValidElement(node)) return node;
  const props = node.props as Record<string, unknown>;
  if ('aria-hidden' in props || 'aria-label' in props) return node;
  return cloneElement(node as ReactElement<Record<string, unknown>>, { 'aria-hidden': 'true' });
}

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    VariantProps<typeof buttonVariants> {
  /** Renders as a square icon-only button (no label). Provide the icon via leftIcon. */
  iconOnly?: boolean;
  /** Icon rendered before the label (or the sole icon when iconOnly is set). */
  leftIcon?: ReactNode;
  /** Icon rendered after the label. */
  rightIcon?: ReactNode;
  /** Render onto the child element instead of a <button> (shadcn/Radix Slot convention). */
  asChild?: boolean;
  /** Shows a spinner in place of leftIcon and disables the button. Not supported with asChild. */
  loading?: boolean;
  /**
   * Soft-disable: looks disabled and ignores clicks/Enter/Space, but stays
   * in the tab order and keeps receiving hover/focus (uses aria-disabled
   * instead of the native `disabled` attribute). Use it when the user needs
   * to find the button and learn WHY it's unavailable — wrap it in a
   * Tooltip with the reason. `disabled` stays the hard version (removed
   * from the tab order, no events at all).
   */
  softDisabled?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      appearance = 'filled',
      tone = 'primary',
      size = 'xl',
      fullWidth = false,
      iconOnly = false,
      leftIcon,
      rightIcon,
      asChild = false,
      loading = false,
      softDisabled = false,
      disabled,
      className,
      children,
      onClick,
      ...rest
    },
    ref,
  ) {
    const isDisabled = disabled || loading;
    // Soft-disabled buttons still receive the click event (they're focusable
    // and not natively disabled), so swallow it here. Enter/Space on a
    // <button> fire the same click event, so keyboard is covered too.
    const handleClick = softDisabled
      ? (event: MouseEvent<HTMLButtonElement>) => {
          event.preventDefault();
          event.stopPropagation();
        }
      : onClick;
    // Data attributes for parent-side styling hooks (e.g. CardAction
    // compensating its padding per button size). Mirrors the cva axes.
    const dataAttributes = {
      'data-slot': 'button',
      'data-appearance': appearance ?? undefined,
      'data-tone': tone ?? undefined,
      'data-size': size ?? undefined,
      'data-icon-only': iconOnly ? '' : undefined,
    };
    const sharedClassName = cn(
      buttonVariants({
        appearance,
        tone,
        size,
        fullWidth,
        iconOnly,
      }),
      className,
    );

    if (process.env.NODE_ENV !== 'production' && iconOnly) {
      const hasAccessibleName =
        (rest as Record<string, unknown>)['aria-label'] ||
        (rest as Record<string, unknown>)['aria-labelledby'];
      if (!hasAccessibleName) {
        console.warn(
          '[Button] iconOnly buttons need an accessible name — pass aria-label ' +
            '(or aria-labelledby). Without it, screen reader users get no label ' +
            'at all for this button.',
        );
      }
    }

    // Radix Slot requires exactly one React element child to clone props
    // onto — it can't merge leftIcon/children/rightIcon as three separate
    // nodes the way a plain <button> can. With asChild, the consumer's
    // child *is* the whole content (e.g. <Button asChild><Link>...icon
    // included...</Link></Button>), so we pass children straight through
    // and skip the icon wrapping entirely. (loading is also skipped here
    // for the same reason — nowhere to insert a spinner into a single
    // opaque child.)
    if (asChild) {
      return (
        <Slot
          ref={ref}
          {...dataAttributes}
          className={sharedClassName}
          aria-disabled={softDisabled || undefined}
          onClick={handleClick}
          {...rest}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        {...dataAttributes}
        data-loading={loading ? '' : undefined}
        disabled={isDisabled}
        aria-disabled={isDisabled || softDisabled || undefined}
        aria-busy={loading || undefined}
        className={sharedClassName}
        onClick={handleClick}
        {...rest}
      >
        {/* Loading keeps the button's width: the normal content (icons +
            label) stays in the layout at opacity 0 and the spinner is laid
            over it, centered. Previously the spinner was inserted as an
            extra flex child (or replaced leftIcon, and rightIcon was
            dropped), so a button without leftIcon grew from 75.6px to
            97.6px on loading. opacity-0 rather than invisible on purpose:
            visibility:hidden would drop the label from the accessibility
            tree and leave the busy button with no accessible name. */}
        <span
          className={cn(
            'inline-flex items-center justify-center gap-[inherit]',
            loading && 'opacity-0',
          )}
        >
          {decorativeIcon(leftIcon)}
          {/* aria-live: announces label changes (e.g. "Save changes" →
              "Saving…" → "Saved") to screen readers — without it those
              transitions are silent to anyone not looking at the screen.
              Harmless for buttons whose text never changes, since
              aria-live only speaks up on actual changes. */}
          {!iconOnly && (
            <span aria-live="polite" aria-atomic="true">
              {children}
            </span>
          )}
          {!iconOnly && decorativeIcon(rightIcon)}
        </span>
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Spinner />
          </span>
        )}
      </button>
    );
  },
);
