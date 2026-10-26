'use client';

/**
 * Announce a status message to screen readers without moving focus
 * (WCAG 4.1.3), for messages whose own element can't be a reliable live
 * region: one that mounts with its text already inside (most screen
 * readers skip it), or one that sits outside an open modal dialog (the
 * dialog hides the rest of the page from assistive tech).
 *
 * The region is created empty once per host, inside the top-most open
 * dialog when there is one (Radix modals hide everything outside them from
 * assistive tech), otherwise on <body>; each call clears it and
 * sets the text a moment later, so the same message twice is read twice.
 */
const ATTR = 'data-theya-announcer';

function region(politeness: 'polite' | 'assertive') {
  const dialogs = document.querySelectorAll<HTMLElement>('[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"], [role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"]');
  const host = dialogs[dialogs.length - 1] ?? document.body;
  let el = host.querySelector<HTMLElement>(`:scope > [${ATTR}="${politeness}"]`);
  if (!el) {
    el = document.createElement('div');
    el.setAttribute(ATTR, politeness);
    el.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status');
    el.setAttribute('aria-live', politeness);
    el.setAttribute('aria-atomic', 'true');
    // Visually hidden (the sr-only recipe), inline so it needs no stylesheet.
    Object.assign(el.style, { position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: '0' });
    host.appendChild(el);
  }
  return el;
}

export function announce(message: string | null | undefined, politeness: 'polite' | 'assertive' = 'polite') {
  if (typeof document === 'undefined' || !message?.trim()) return;
  const el = region(politeness);
  el.textContent = '';
  window.setTimeout(() => {
    el.textContent = message.trim();
  }, 100);
}
