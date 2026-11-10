'use client';

import { useEffect } from 'react';

// Input modality (T7, 2026-11-10). Radix Tabs (and other Radix parts) call
// element.focus() from onMouseDown, and Chrome treats a script focus as
// :focus-visible whatever the element is, so a tab clicked or tapped showed
// the keyboard focus ring. We record how the user last interacted on <html>:
//   data-theya-input="pointer"  after pointerdown (mouse, touch, pen)
//   data-theya-input="keyboard" after a key that isn't a bare modifier
// and components that focus on pointer down draw their ring only when the
// last input wasn't a pointer: `[:root:not([data-theya-input=pointer])_&]:focus-visible:…`.
// Before any input the attribute is absent, so the ring shows (keyboard-safe).

export const INPUT_MODALITY_ATTR = 'data-theya-input';

const MODIFIERS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Fn']);
let installed = false;

function install() {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  const root = document.documentElement;
  const set = (mode: 'pointer' | 'keyboard') => {
    if (root.getAttribute(INPUT_MODALITY_ATTR) !== mode) root.setAttribute(INPUT_MODALITY_ATTR, mode);
  };
  // Capture phase on document: runs before React's handlers on the root, so
  // the attribute is set before Radix focuses the element.
  document.addEventListener('pointerdown', () => set('pointer'), true);
  document.addEventListener(
    'keydown',
    (event) => {
      if (MODIFIERS.has(event.key) || event.metaKey || event.ctrlKey) return;
      set('keyboard');
    },
    true,
  );
}

/** Starts tracking input modality on <html> (once per page; safe on the server). */
export function useInputModality() {
  useEffect(install, []);
}
