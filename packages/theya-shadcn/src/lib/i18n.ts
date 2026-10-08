'use client';

/**
 * Localization of the strings Theya renders by itself: accessible names
 * ("Close", "Clear date"), placeholders ("Pick a date"), status words
 * ("Copied", "Unlimited"), screen-reader announcements. Content the app
 * passes in is never touched.
 *
 *   import { TheyaLocaleProvider } from '@theya/shadcn/lib/i18n';
 *   import { ruLocale } from '@theya/shadcn/lib/locale-ru';
 *
 *   <TheyaLocaleProvider {...ruLocale} syncDocument>
 *     <App />
 *   </TheyaLocaleProvider>
 *
 * - Without a provider everything is English, exactly as before.
 * - `messages` may be partial: missing keys fall back to English, so a
 *   product can also override a single string:
 *   `<TheyaLocaleProvider locale="en-GB" messages={{ dialog: { close: 'Done' } }}>`.
 * - Per-instance props (`dismissLabel`, `placeholder`, …) still win over the
 *   dictionary.
 * - `locale` (BCP 47) is for Intl number/date formatting; `dateLocale` is
 *   the date-fns locale used by calendars and date pickers.
 * - `syncDocument`: the provider also writes `lang` (and `dir`, when given)
 *   on <html>, and restores the previous values when it unmounts. Screen
 *   readers pick the voice from `lang`, so without it Russian labels are
 *   read with an English voice. Off by default: a nested provider for one
 *   widget must not relabel the whole page.
 * - Text direction: set `dir` on the page yourself (`<html dir="rtl">`), or use `syncDocument` —
 *   layout and icons mirror from it (logical CSS, `rtl:` variants). Pass
 *   `dir` here too (the bundles carry it) so Radix-based components get it
 *   as well: arrow keys in Slider, Tabs, RadioGroup, menus and their
 *   submenu side follow the reading direction. Without `dir` nothing is
 *   wrapped and Radix stays left-to-right, as before.
 */
import { createContext, createElement, Fragment, useContext, useEffect, useLayoutEffect, useMemo, type ReactNode } from 'react';
import { DirectionProvider } from '@radix-ui/react-direction';
import type { Locale as DateFnsLocale } from 'date-fns';
import { en, type TheyaMessages } from './locale-en';

export type { TheyaMessages };
export { en };

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (...args: never[]) => unknown ? T[K] : T[K] extends object ? DeepPartial<T[K]> : T[K];
};
export type TheyaMessagesOverride = DeepPartial<TheyaMessages>;

export interface TheyaI18n {
  /** BCP 47 tag for Intl formatting, e.g. "en-US", "ru-RU". */
  locale: string;
  /** date-fns locale for calendars and date labels; English when absent. */
  dateLocale?: DateFnsLocale;
  t: TheyaMessages;
}

/** A complete locale: what the provider needs, plus the text direction. */
export interface TheyaLocaleBundle {
  locale: string;
  messages: TheyaMessagesOverride;
  dateLocale?: DateFnsLocale;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<TheyaI18n>({ locale: 'en-US', t: en });

// For imperative APIs that run outside React (undoToast): the strings of the
// provider rendered last. Apps have one provider at the root, so this is it.
let current: TheyaMessages = en;
/** Strings for code that can't call a hook; English without a provider. */
export function getTheyaMessages(): TheyaMessages {
  return current;
}

function merge<T>(base: T, over: DeepPartial<T> | undefined): T {
  if (!over) return base;
  const out = { ...base } as Record<string, unknown>;
  for (const [k, v] of Object.entries(over as Record<string, unknown>)) {
    if (v === undefined) continue;
    const b = (base as Record<string, unknown>)[k];
    out[k] = b && typeof b === 'object' && v && typeof v === 'object' ? merge(b, v as never) : v;
  }
  return out as T;
}

export interface TheyaLocaleProviderProps {
  locale: string;
  /** Strings for this locale; anything missing falls back to English. */
  messages?: TheyaMessagesOverride;
  dateLocale?: DateFnsLocale;
  /** Reading direction for Radix-based components (see above). Put the same `dir` on <html>. */
  dir?: 'ltr' | 'rtl';
  /** Also set `lang` (and `dir`, if given) on <html>; restored on unmount. Use it on the app's root provider only. */
  syncDocument?: boolean;
  children?: ReactNode;
}

// Layout effect in the browser so `dir` applies before paint; plain effect
// on the server, where useLayoutEffect only warns.
const useBrowserLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function TheyaLocaleProvider({ locale, messages, dateLocale, dir, syncDocument = false, children }: TheyaLocaleProviderProps) {
  useBrowserLayoutEffect(() => {
    if (!syncDocument) return;
    const html = document.documentElement;
    const prev = { lang: html.getAttribute('lang'), dir: html.getAttribute('dir') };
    html.setAttribute('lang', locale);
    if (dir) html.setAttribute('dir', dir);
    return () => {
      if (prev.lang == null) html.removeAttribute('lang');
      else html.setAttribute('lang', prev.lang);
      if (dir) {
        if (prev.dir == null) html.removeAttribute('dir');
        else html.setAttribute('dir', prev.dir);
      }
    };
  }, [syncDocument, locale, dir]);
  const value = useMemo(() => ({ locale, dateLocale, t: merge(en, messages) }), [locale, dateLocale, messages]);
  current = value.t;
  const inner = dir ? createElement(DirectionProvider, { dir }, children) : children;
  return createElement(I18nContext.Provider, { value }, inner);
}

/** The active locale and strings; English defaults outside a provider. */
export function useTheyaI18n(): TheyaI18n {
  return useContext(I18nContext);
}

/**
 * Pseudo-locale for checking layouts: every string ~40% longer, accented
 * and bracketed, so truncation, overflow and strings still hard-coded in
 * English (they stay plain) are easy to spot. Values a message function
 * inserts (a file name, a count) get accented too.
 */
export function pseudoLocalize<T>(messages: T): T {
  const MAP: Record<string, string> = { a: 'á', e: 'é', i: 'î', o: 'ö', u: 'ü', c: 'ç', n: 'ñ', s: 'š', y: 'ý', A: 'Å', E: 'É', I: 'Î', O: 'Ö', U: 'Û', C: 'Ç', N: 'Ñ', S: 'Š' };
  const pseudo = (s: string) => `[${s.replace(/[a-zA-Z]/g, (ch) => MAP[ch] ?? ch)} ${'~'.repeat(Math.max(1, Math.round(s.length * 0.4)))}]`;
  const walk = (v: unknown): unknown => {
    if (typeof v === 'string') return pseudo(v);
    if (typeof v === 'function') {
      return (...args: unknown[]) => {
        const out = (v as (...a: unknown[]) => unknown)(...args);
        return typeof out === 'string' ? pseudo(out) : createElement(Fragment, null, '[', out as ReactNode, ' ~~~]');
      };
    }
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
    return v;
  };
  return walk(messages) as T;
}
