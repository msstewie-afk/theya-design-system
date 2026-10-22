'use client';

/**
 * Hotkey strings for components that bind a document-level shortcut
 * (KeyboardShortcuts `hotkey`, the SearchBox block `shortcut`).
 *
 * A hotkey is one key, optionally with modifiers joined by "+":
 * "?", "/", "Mod+/", "Alt+K", "Ctrl+Shift+P". "Mod" is ⌘ on Apple
 * platforms and Ctrl elsewhere. Modifiers you don't list must not be
 * held, except Shift, which is ignored unless listed (it's how "?" is typed).
 *
 * WCAG 2.1.4: a bare character ("?", "/") is a character-key shortcut —
 * the app must let users turn it off or remap it (pass `undefined` or a
 * chord from a user setting), or scope it to focus. A chord with
 * Ctrl / ⌘ / Alt is out of the criterion's scope.
 */

export const isApplePlatform = () =>
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

export interface ParsedHotkey {
  key: string;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  /** null = Shift not listed, so it isn't checked. */
  shift: boolean | null;
}

export function parseHotkey(hotkey: string): ParsedHotkey {
  // "Mod++" or "+" alone: the last "+" is the key itself.
  const parts = hotkey.endsWith('+') ? [...hotkey.slice(0, -1).split('+').filter(Boolean), '+'] : hotkey.split('+');
  const key = parts.pop() ?? '';
  const mods = parts.map((p) => p.trim().toLowerCase());
  const mod = mods.includes('mod');
  const apple = isApplePlatform();
  return {
    key,
    ctrl: mods.includes('ctrl') || mods.includes('control') || (mod && !apple),
    meta: mods.includes('meta') || mods.includes('cmd') || (mod && apple),
    alt: mods.includes('alt') || mods.includes('option'),
    shift: mods.includes('shift') ? true : null,
  };
}

/** True when the hotkey has no Ctrl / ⌘ / Alt — a WCAG 2.1.4 character-key shortcut. */
export function isCharacterHotkey(hotkey: string) {
  const p = parseHotkey(hotkey);
  return !p.ctrl && !p.meta && !p.alt;
}

export function matchesHotkey(event: KeyboardEvent, hotkey: string) {
  const p = parseHotkey(hotkey);
  if (event.ctrlKey !== p.ctrl || event.metaKey !== p.meta || event.altKey !== p.alt) return false;
  if (p.shift !== null && event.shiftKey !== p.shift) return false;
  // Alt changes event.key on macOS (Alt+K → "˚"), so compare the physical key for letters and digits.
  const k = p.key.toLowerCase();
  if (p.alt && /^[a-z0-9]$/.test(k)) return event.code === (/\d/.test(k) ? `Digit${k}` : `Key${k.toUpperCase()}`);
  return event.key.toLowerCase() === k;
}

/** Keys typed into a field are text, not shortcuts. */
export function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return /^(input|textarea|select)$/i.test(target.tagName);
}
