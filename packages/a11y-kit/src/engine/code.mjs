#!/usr/bin/env node
/**
 * Code-analysis checks for WCAG criteria that are visible in component
 * source, not in a rendered story. No browser: reads every component's source
 * (config `code.targets(root)` → [{ name, file }]) and the global stylesheets
 * (config `code.styles`, directories). Findings per component:
 *
 * - 2.1.4 Character Key Shortcuts: a document- or window-level key handler
 *   that compares event.key to a single printable character with no
 *   modifier (Ctrl/Alt/Meta) check in the same handler. A component-level
 *   onKeyDown fires only while the component has focus and is the
 *   criterion's own exception, so it is not flagged. src/lib/hotkey.ts is
 *   the sanctioned way to add shortcuts; direct listeners are what this
 *   check is after.
 * - 2.5.1 Pointer Gestures: multipoint or path-based gesture handling
 *   (touches.length > 1, a gesture library, touchmove coordinate tracking)
 *   in a file with no click or keyboard path at all.
 * - 2.5.2 Pointer Cancellation (library-level: findings keyed $library in
 *   the report, they don't fail a component cell): an action fired on
 *   pointerdown / mousedown / touchstart instead of on the up event, so the
 *   user cannot abort by moving away before release. Handlers that only
 *   call preventDefault / stopPropagation / focus / setState are visual and
 *   pass. Guards the library note in a11y/criteria.json.
 * - 2.5.7 Dragging Movements: drag handling (a dnd library, pointer capture
 *   plus pointermove, draggable) in a file with no keyboard path (no
 *   Arrow-key handling, no KeyboardSensor) and no input alternative.
 * - 3.3.8 Accessible Authentication (Minimum): a password input without an
 *   autocomplete a password manager can use (current-password /
 *   new-password), or an onPaste calling preventDefault in a file with a
 *   password or login field.
 * - 2.3.1 Three Flashes (library-level, like 2.5.2): an infinite animation
 *   with a cycle under 334 ms that swings opacity / visibility / background
 *   (CSS or a setInterval under 167 ms toggling them). The weakest check
 *   here — it cannot measure flash area or red-flash thresholds; it catches
 *   the plain "blinker" and guards the library note, nothing more.
 * - 2.2.1 Timing Adjustable (gate): a setTimeout of a second or more that
 *   closes, removes or navigates away from content, in a file with no pause,
 *   extend or hover/focus clearTimeout path. Delays under a second sequence
 *   transitions and are skipped; sonner toasts pause by themselves.
 * - 2.2.2 Pause, Stop, Hide (gate): a setInterval that moves content on (next
 *   slide, index, scroll position), or autoplay (embla autoplay, <video
 *   autoPlay>, autoPlay={true}), in a file with no pause or stop control.
 *   Clocks that only refresh a time value are not flagged.
 * - 1.3.5 Identify Input Purpose (gate): a field whose type (email, tel),
 *   name or id names a section 7 purpose (email, phone, given/family name,
 *   username, address, postal code, organization, birthday) with no
 *   autoComplete, or type email/tel with autoComplete="off". Dynamic
 *   attributes are not read: wrappers pass the caller's value through.
 *
 * Writes a11y/code.json (per component: files scanned, findings per
 * criterion; library-level findings under $library). build-a11y.mjs reads
 * it as "code" evidence for 2.1.4, 2.5.1, 2.5.7 and 3.3.8, and as gate findings
 * for 2.2.1, 2.2.2 and 1.3.5 (a finding fails the cell; a review still verifies).
 *
 * A file can opt a criterion out with a reason, in a comment:
 *   // a11y-code-skip: 2.5.7 keyboard path lives in use-slider.ts
 *
 *   a11y-kit code [--only <name-substring>]
 *   a11y-kit code --ci          (writes nothing, exits 1 on any component finding)
 *   a11y-kit code --fixtures    (calibration against the kit's calibration/code/: a fail and a pass file per criterion)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { context } from './context.mjs';

const { root: ROOT, config, outDir: OUT_DIR } = await context();
const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const ONLY = arg('only', '');
const CI = process.argv.includes('--ci');
const FIXTURES = process.argv.includes('--fixtures');
const OUT = path.join(OUT_DIR, 'code.json');
const KEYS = ['2.1.4', '2.5.1', '2.5.2', '2.5.7', '3.3.8', '2.3.1', '2.2.1', '2.2.2', '1.3.5'];
/** Findings that fail a component's matrix cell; 2.5.2 and 2.3.1 guard library notes. */
const COMPONENT_KEYS = ['2.1.4', '2.5.1', '2.5.7', '3.3.8', '2.2.1', '2.2.2', '1.3.5'];
const emptyRow = () => ({ files: 0, ...Object.fromEntries(KEYS.map((k) => [k, []])) });

/* ---------- matching helpers ---------- */

/** Blank out comments and long string contents, keeping line structure, so a
 * pattern in a comment or a user-facing string doesn't match. Strings keep
 * their quotes and short bodies (event.key === 'x' must still match). */
function stripForMatching(source) {
  let out = '';
  let i = 0;
  const n = source.length;
  while (i < n) {
    const c = source[i];
    const next = source[i + 1];
    if (c === '/' && next === '/') {
      while (i < n && source[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && next === '*') {
      const end = source.indexOf('*/', i + 2);
      const stop = end === -1 ? n : end + 2;
      for (; i < stop; i++) out += source[i] === '\n' ? '\n' : ' ';
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      const q = c;
      let body = '';
      let j = i + 1;
      for (; j < n; j++) {
        if (source[j] === '\\') { body += '\\' + (source[j + 1] ?? ''); j++; continue; }
        if (source[j] === q) break;
        body += source[j];
      }
      const kept = body.length <= 24 ? body : body.replace(/[^\n]/g, ' ');
      out += q + kept + q;
      i = j + 1;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

const lineOf = (source, index) => source.slice(0, index).split('\n').length;

/** The brace-balanced region starting at the first '{' at or after `from`. */
function region(source, from, maxLen = 4000) {
  const start = source.indexOf('{', from);
  if (start === -1) return source.slice(from, from + 400);
  let depth = 0;
  for (let i = start; i < Math.min(source.length, start + maxLen); i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}') depth--;
    if (depth === 0) return source.slice(start, i + 1);
  }
  return source.slice(start, start + maxLen);
}

/** Body of a JSX handler value: inline arrow after `onX={`, or the named
 * function's definition elsewhere in the file. */
function handlerBody(source, attrIndex) {
  const open = source.indexOf('{', attrIndex);
  if (open === -1) return '';
  let depth = 0;
  let value = '';
  for (let i = open; i < Math.min(source.length, open + 4000); i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}') depth--;
    value = source.slice(open + 1, i);
    if (depth === 0) break;
  }
  const name = /^\s*(?:props\.)?([A-Za-z_$][\w$]*)\s*$/.exec(value)?.[1];
  if (!name) return value;
  // A bare reference to a prop named like an action: the action fires here.
  if (/^on[A-Z]/.test(name)) return `${name}()`;
  const def = new RegExp(`(?:function\\s+${name}\\s*\\([^)]*\\)|(?:const|let)\\s+${name}\\s*=\\s*(?:async\\s*)?(?:\\([^)]*\\)|[\\w$]+)\\s*=>)`).exec(source);
  return def ? region(source, def.index + def[0].length) : value;
}

/** Body of an addEventListener handler: inline, or the named function's definition. */
function listenerBody(source, matchEnd) {
  const named = /^\s*,\s*([A-Za-z_$][\w$]*)\s*[,)]/.exec(source.slice(matchEnd, matchEnd + 200));
  if (named) {
    const def = new RegExp(`(?:function\\s+${named[1]}\\s*\\([^)]*\\)|(?:const|let)\\s+${named[1]}\\s*=\\s*(?:async\\s*)?(?:\\([^)]*\\)|[\\w$]+)\\s*=>)`).exec(source);
    return def ? region(source, def.index + def[0].length) : '';
  }
  return region(source, matchEnd);
}

const ACTION = /\b(?:on\w*(?:Change|Select|Click|Submit|Toggle|Open|Close|Delete|Remove|Clear|Confirm|Commit|Action)|navigate|router\.(?:push|replace)|location\.(?:href|assign)|\.submit)\s*\(/;
const VISUAL_ONLY = /^(?:\s*(?:\w+\.)?(?:preventDefault|stopPropagation|focus|blur|setPointerCapture|releasePointerCapture|set[A-Z]\w*)\s*\([^)]*\)[;,]?\s*|[\s{}()=>,;]|e(?:vent)?\b|\w+\s*=>\s*)*$/;

/* ---------- checks: (strippedSource, rawSource, file) -> findings ---------- */

export const CHECKS = {
  '2.1.4'(src, raw, file) {
    const out = [];
    for (const m of src.matchAll(/(?:document|window|globalThis)\s*\.\s*addEventListener\s*\(\s*['"]key(?:down|up|press)['"]/g)) {
      const body = listenerBody(src, m.index + m[0].length);
      for (const key of body.matchAll(/\.key\s*===?\s*['"]([^'"])['"]/g)) {
        const k = key[1];
        if (!/^[\p{L}\p{N}\p{P}\p{S}]$/u.test(k)) continue; // single printable character only
        if (/ctrlKey|metaKey|altKey/.test(body)) continue; // a modifier guard anywhere in the handler
        if (/isContentEditable|tagName\s*===?\s*['"](?:INPUT|TEXTAREA)|closest\(\s*['"](?:input|textarea)/i.test(body)) continue;
        out.push(`${file}:${lineOf(src, m.index)} single-key shortcut "${k}" on a document/window key listener with no modifier; it fires wherever focus is and cannot be turned off or remapped (2.1.4)`);
      }
    }
    for (const m of src.matchAll(/useHotkeys?\s*\(\s*['"]([^'"]+)['"]/g)) {
      if (m[1].length === 1) out.push(`${file}:${lineOf(src, m.index)} single-key shortcut "${m[1]}" with no modifier (2.1.4)`);
    }
    return out;
  },

  '2.5.1'(src, raw, file) {
    const out = [];
    const hasAlternative = /\bonClick\b|\bonKeyDown\b|\bonKeyUp\b|<button|role=['"]button/.test(src);
    for (const m of src.matchAll(/\btouches\s*\.\s*length\s*(?:>\s*1|===?\s*2)/g)) {
      if (!hasAlternative) out.push(`${file}:${lineOf(src, m.index)} multipoint gesture (touches.length > 1) with no click or keyboard path in this file (2.5.1)`);
    }
    for (const m of src.matchAll(/from\s+['"](?:hammerjs|@use-gesture\/\w+|react-swipeable)['"]/g)) {
      if (!hasAlternative) out.push(`${file}:${lineOf(src, m.index)} gesture library in a file with no click or keyboard path (2.5.1)`);
    }
    if (/\bonTouchMove\b/.test(src) && /\b(?:deltaX|deltaY|startX|startY|swipe)\b/i.test(src) && !hasAlternative) {
      const m = /\bonTouchMove\b/.exec(src);
      out.push(`${file}:${lineOf(src, m.index)} path-based touch tracking (onTouchMove with coordinate deltas) with no click or keyboard path in this file (2.5.1)`);
    }
    return out;
  },

  '2.5.2'(src, raw, file) {
    const out = [];
    for (const m of src.matchAll(/\bon(?:PointerDown|MouseDown|TouchStart)\s*=/g)) {
      const body = handlerBody(src, m.index + m[0].length - 1);
      if (!body) continue;
      if (VISUAL_ONLY.test(body)) continue; // focus management or visual state only
      if (!ACTION.test(body)) continue; // can't tell an action fires: bias toward under-flagging
      out.push(`${file}:${lineOf(src, m.index)} ${m[0].replace('=', '')} triggers an action on the down event; the user cannot abort by moving the pointer away before release (2.5.2)`);
    }
    for (const m of src.matchAll(/addEventListener\s*\(\s*['"](?:pointerdown|mousedown|touchstart)['"]/g)) {
      const body = listenerBody(src, m.index + m[0].length);
      if (ACTION.test(body) && !VISUAL_ONLY.test(body)) out.push(`${file}:${lineOf(src, m.index)} ${/['"](\w+)['"]/.exec(m[0])[1]} listener triggers an action on the down event (2.5.2)`);
    }
    return out;
  },

  '2.5.7'(src, raw, file) {
    const out = [];
    const keyboardPath = /ArrowLeft|ArrowRight|ArrowUp|ArrowDown|KeyboardSensor|\bonKeyDown\b/.test(src);
    const inputAlternative = /<(?:input|Input)\b/.test(src);
    const flag = (index, what) => {
      if (!keyboardPath && !inputAlternative) out.push(`${file}:${lineOf(src, index)} ${what} with no keyboard path (no Arrow-key handling or KeyboardSensor) and no input alternative in this file (2.5.7)`);
    };
    for (const m of src.matchAll(/from\s+['"](?:@dnd-kit\/\w[\w-]*|react-dnd|react-draggable|sortablejs|react-beautiful-dnd)['"]/g)) flag(m.index, 'drag-and-drop library');
    for (const m of src.matchAll(/setPointerCapture\s*\(/g)) {
      if (/\bpointermove\b|\bonPointerMove\b/i.test(src)) flag(m.index, 'pointer-capture dragging (setPointerCapture + pointermove)');
    }
    for (const m of src.matchAll(/\bdraggable(?:=\{?["']?true|=["']true)/g)) flag(m.index, 'a draggable element');
    return out;
  },

  '3.3.8'(src, raw, file) {
    const out = [];
    const passwordTags = [...src.matchAll(/<[\w.]+[^>]*?type\s*=\s*(?:["']password["']|\{\s*["']password["']\s*\})[^>]*?(?:\/?>|$)/gs)];
    const authy = passwordTags.length > 0 || /\b(?:login|signin|sign-in|auth)\b/i.test(path.basename(file));
    if (!authy) return out;
    for (const tag of passwordTags) {
      const text = src.slice(tag.index, Math.min(src.indexOf('>', tag.index) + 1 || tag.index + 600, tag.index + 600));
      const auto = /autocomplete\s*=\s*["']?\{?\s*["']?([\w-]+)/i.exec(text)?.[1] ?? (/autoComplete\s*=\s*\{/.test(text) ? 'dynamic' : null);
      if (!auto) out.push(`${file}:${lineOf(src, tag.index)} password input without autocomplete; password managers cannot fill it (needs current-password or new-password) (3.3.8)`);
      else if (!['current-password', 'new-password', 'off', 'dynamic'].includes(auto)) out.push(`${file}:${lineOf(src, tag.index)} password input with autocomplete="${auto}" instead of current-password / new-password (3.3.8)`);
    }
    for (const m of src.matchAll(/\bonPaste\s*=/g)) {
      const body = handlerBody(src, m.index + m[0].length - 1);
      if (/preventDefault\s*\(/.test(body)) out.push(`${file}:${lineOf(src, m.index)} onPaste calls preventDefault in an authentication file; blocking paste blocks password managers (3.3.8)`);
    }
    return out;
  },

  '2.3.1'(src, raw, file) {
    const out = [];
    // CSS: an infinite animation with a cycle under 334 ms is more than 3
    // cycles a second; if its keyframes swing opacity / visibility /
    // background, that's a blinker.
    const flashyFrames = new Set();
    for (const kf of raw.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
      const body = region(raw, kf.index + kf[0].length - 1, 2000);
      const opacities = [...body.matchAll(/opacity\s*:\s*([\d.]+)/g)].map((m) => Number(m[1]));
      const swings = (Math.max(...opacities, 0) - Math.min(...opacities, 1) >= 0.8) || /visibility\s*:\s*hidden/.test(body) || /background(?:-color)?\s*:/.test(body);
      if (opacities.length >= 2 ? swings : /visibility\s*:\s*hidden|background(?:-color)?\s*:/.test(body)) flashyFrames.add(kf[1]);
    }
    const ms = (v, unit) => (unit === 's' ? Number(v) * 1000 : Number(v));
    for (const m of raw.matchAll(/animation\s*:\s*([^;}{]+)/g)) {
      const decl = m[1];
      if (!/\binfinite\b/.test(decl)) continue;
      const name = decl.split(/\s+/).find((w) => flashyFrames.has(w));
      const dur = /(^|\s)([\d.]+)(m?s)\b/.exec(decl);
      if (name && dur && ms(dur[2], dur[3]) < 334) out.push(`${file}:${lineOf(raw, m.index)} infinite animation "${name}" cycles every ${dur[2]}${dur[3]} (more than 3 times a second) and swings opacity/visibility/background (2.3.1)`);
    }
    // JS: a setInterval under 167 ms toggling visibility-ish state flashes
    // faster than 3 a second (a full flash is two toggles).
    for (const m of src.matchAll(/setInterval\s*\(/g)) {
      const body = region(src, m.index + m[0].length - 1, 1500);
      const interval = /,\s*(\d+)\s*\)/.exec(src.slice(m.index, m.index + 1800))?.[1];
      if (interval && Number(interval) < 167 && /opacity|visibility|classList\.toggle|display\s*=|hidden\s*=/.test(body)) {
        out.push(`${file}:${lineOf(src, m.index)} setInterval(${interval}ms) toggles visibility-related state faster than 3 flashes a second (2.3.1)`);
      }
    }
    return out;
  },
};

/* ---------- depth checks: timing, moving content, input purpose ---------- */

/** A JSX opening tag from `<` to its closing `>`, skipping `>` inside {…}. */
function jsxTag(source, from) {
  let depth = 0;
  for (let i = from; i < Math.min(source.length, from + 3000); i++) {
    const c = source[i];
    if (c === '{') depth++;
    else if (c === '}') depth--;
    else if (c === '>' && depth === 0) return source.slice(from, i + 1);
  }
  return source.slice(from, from + 3000);
}

/** Literal value of a JSX attribute: name="x", name='x' or name={'x'}; null when absent or dynamic. */
const attrLiteral = (tag, name) => new RegExp(`\\b${name}\\s*=\\s*(?:["']([^"']*)["']|\\{\\s*["']([^"']*)["']\\s*\\})`).exec(tag)?.slice(1).find((v) => v != null) ?? null;
const hasAttr = (tag, name) => new RegExp(`\\b${name}\\s*=`).test(tag);

/** Everything between a call's parentheses. */
function callArgs(source, openParen) {
  let depth = 0;
  for (let i = openParen; i < Math.min(source.length, openParen + 3000); i++) {
    if ('({['.includes(source[i])) depth++;
    if (')}]'.includes(source[i])) depth--;
    if (depth === 0) return source.slice(openParen + 1, i);
  }
  return source.slice(openParen + 1, openParen + 3000);
}

/** Content leaves or the session moves on: what a time limit does when it runs out. */
const EXPIRES = /\bset\w*(?:Open|Visible|Shown|Show)\s*\(\s*false\b|\bonOpenChange\??\.?\s*\(\s*false\b|\b(?:dismiss|close|hide|remove|expire)\w*\s*\(|\bon(?:Close|Dismiss|Expire|Timeout|TimeUp)\w*\??\.?\s*\(|\b(?:signOut|logout|logOut)\s*\(|router\.(?:push|replace)|location\.(?:href|assign|replace)|\.submit\s*\(/;
/** A way for the user to stop, pause or extend the limit somewhere in the file. */
const TIME_CONTROL = /\b(?:pause\w*|paused|resume\w*|extend\w*|snooze\w*|keepAlive)\b/i;
/** Content that moves on by itself: the next slide, item, scroll position or frame. */
const ADVANCES = /\bset\w*(?:Index|Slide|Active|Current|Offset|Step|Frame|Position|Page|Item)\s*\(|\b(?:scrollNext|scrollTo|scrollBy|next|advance|rotate|goTo)\w*\s*\(|\.scroll(?:Left|Top)\s*[+-]?=/;
const MOTION_CONTROL = /\b(?:pause\w*|paused|stop(?!(?:Immediate)?Propagation)\w*|isPlaying|playing|setPlaying)\b/i;

/** Input purposes (WCAG 2.2 section 7) a field's type, name or id gives away, with the token it needs. */
const PURPOSES = [
  [/^e-?mail$|[-_]e-?mail$|Email$/, 'email'],
  [/^(?:tel|phone|mobile)$|[-_](?:phone|tel|mobile)$|Phone$/, 'tel'],
  [/^(?:first-?name|given-?name)$|firstName$|givenName$/i, 'given-name'],
  [/^(?:last-?name|family-?name|surname)$|lastName$|familyName$/i, 'family-name'],
  [/^(?:full-?name|your-?name)$|fullName$/i, 'name'],
  [/^(?:user-?name|login)$|userName$/i, 'username'],
  [/^(?:street|address(?:-?line)?\d?)$|streetAddress$|addressLine\d?$/i, 'street-address'],
  [/^(?:city|town|locality)$/i, 'address-level2'],
  [/^(?:zip|zip-?code|postal-?code|postcode)$|postalCode$|zipCode$/i, 'postal-code'],
  [/^country$/i, 'country-name'],
  [/^(?:company|organi[sz]ation)$/i, 'organization'],
  [/^(?:birthday|birth-?date|dob)$|birthDate$/i, 'bday'],
];
const FIELD_TAG = /<(?:input|Input|TextField|InputGroupInput|InlineEdit)\b/g;

Object.assign(CHECKS, {
  '2.2.1'(src, raw, file) {
    const out = [];
    if (/from\s+['"]sonner['"]/.test(src)) return out; // sonner pauses on hover, focus and a hidden page
    const controlled = TIME_CONTROL.test(src) || (/\bon(?:MouseEnter|PointerEnter|Focus)\b/.test(src) && /\bclearTimeout\b/.test(src));
    for (const m of src.matchAll(/\bsetTimeout\s*\(/g)) {
      const args = callArgs(src, m.index + m[0].length - 1);
      const delay = /,\s*([\w.$]+)\s*$/.exec(args)?.[1];
      if (delay && /^\d+$/.test(delay) && Number(delay) < 1000) continue; // sequencing a transition, not a limit
      const callback = delay ? args.slice(0, args.lastIndexOf(',')) : args;
      if (!EXPIRES.test(callback) || controlled) continue;
      out.push(`${file}:${lineOf(src, m.index)} setTimeout(${delay ?? '?'}) closes, removes or moves on from content with no way in this file to pause, extend or turn the limit off (2.2.1)`);
    }
    return out;
  },

  '2.2.2'(src, raw, file) {
    const out = [];
    const controlled = MOTION_CONTROL.test(src);
    for (const m of src.matchAll(/\bsetInterval\s*\(/g)) {
      if (!ADVANCES.test(callArgs(src, m.index + m[0].length - 1)) || controlled) continue;
      out.push(`${file}:${lineOf(src, m.index)} setInterval moves content on by itself (next slide, item or scroll position) with no pause or stop control in this file (2.2.2)`);
    }
    for (const m of src.matchAll(/from\s+['"]embla-carousel-auto(?:play|-scroll)['"]|<video\b[^>]*?\bautoPlay\b|\bautoPlay\s*=\s*(?:\{\s*)?true\b|\bautoplay\s*:\s*true\b/g)) {
      if (!controlled) out.push(`${file}:${lineOf(src, m.index)} autoplay with no pause or stop control in this file (2.2.2)`);
    }
    return out;
  },

  '1.3.5'(src, raw, file) {
    const out = [];
    for (const m of src.matchAll(FIELD_TAG)) {
      const tag = jsxTag(src, m.index);
      const type = attrLiteral(tag, 'type');
      if (type && /^(?:hidden|checkbox|radio|range|file|button|submit|reset|search|password)$/.test(type)) continue; // password: 3.3.8
      const keys = [type === 'email' || type === 'tel' ? type : null, attrLiteral(tag, 'name'), attrLiteral(tag, 'id')].filter(Boolean);
      const purpose = keys.map((k) => PURPOSES.find(([re]) => re.test(k))?.[1]).find(Boolean);
      if (!purpose) continue;
      const tagName = m[0].slice(1);
      if (!hasAttr(tag, 'autoComplete') && !hasAttr(tag, 'autocomplete')) {
        out.push(`${file}:${lineOf(src, m.index)} <${tagName}> collects the user's ${purpose} with no autoComplete; browsers and assistive tech can't tell its purpose (needs autoComplete="${purpose}") (1.3.5)`);
      } else if ((attrLiteral(tag, 'autoComplete') ?? attrLiteral(tag, 'autocomplete')) === 'off' && (type === 'email' || type === 'tel')) {
        out.push(`${file}:${lineOf(src, m.index)} <${tagName} type="${type}"> turns autoComplete off; if it asks for the user's own ${type === 'tel' ? 'phone' : 'email'}, it needs autoComplete="${purpose}" (1.3.5)`);
      }
    }
    return out;
  },
});

/** Criteria a file opts out of: "a11y-code-skip: 2.5.7 reason" in a comment. */
export function skipsIn(raw) {
  return [...raw.matchAll(/a11y-code-skip:\s*((?:\d\.\d\.\d+[\s,]*)+)/g)].flatMap((m) => m[1].match(/\d\.\d\.\d+/g) ?? []);
}

export function checkFile(file, raw) {
  const src = stripForMatching(raw);
  const skips = skipsIn(raw);
  const found = {};
  for (const k of KEYS) found[k] = skips.includes(k) ? [] : CHECKS[k](src, raw, file);
  return found;
}

/* ---------- calibration (--fixtures) ---------- */

if (FIXTURES) {
  const DIR = path.join(KIT, 'calibration/code');
  let bad = 0;
  for (const key of KEYS) {
    for (const kind of ['fail', 'pass']) {
      const file = fs.readdirSync(DIR).find((f) => f.startsWith(`${key}-${kind}.`));
      if (!file) {
        console.log(`FAIL ${key} ${kind}: no fixture`);
        bad++;
        continue;
      }
      const found = checkFile(file, fs.readFileSync(path.join(DIR, file), 'utf8'));
      const hits = found[key];
      const ok = kind === 'fail' ? hits.length > 0 : hits.length === 0;
      if (!ok) bad++;
      console.log(`${ok ? 'ok  ' : 'FAIL'} ${key} ${kind}-fixture: ${hits.length} finding(s) (expected ${kind === 'fail' ? '> 0' : '0'})`);
      for (const h of hits) console.log(`       ${h}`);
      for (const k of KEYS.filter((k) => k !== key && found[k].length)) console.log(`       note: also trips ${k}: ${found[k][0]}`);
    }
  }
  console.log(`a11y-code fixtures: ${KEYS.length * 2 - bad}/${KEYS.length * 2} as expected`);
  process.exit(bad ? 1 : 0);
}

/* ---------- full run ---------- */

if (!config.code?.targets) throw new Error('a11y-kit code: set code.targets(root) → [{ name, file }] in a11y-kit.config.mjs');
const targets = (await config.code.targets(ROOT)).filter((t) => fs.existsSync(t.file));

const byComponent = {};
for (const t of targets) {
  if (ONLY && !t.name.includes(ONLY)) continue;
  const rel = path.relative(ROOT, t.file);
  const found = checkFile(rel, fs.readFileSync(t.file, 'utf8'));
  const c = (byComponent[t.name] ??= emptyRow());
  c.files += 1;
  for (const k of KEYS) c[k].push(...found[k]);
}
// Library-level criteria also cover the global stylesheets.
const lib = (byComponent.$library ??= emptyRow());
for (const STYLES_DIR of (config.code.styles ?? []).map((d) => path.resolve(ROOT, d)).filter((d) => fs.existsSync(d))) {
  for (const f of fs.readdirSync(STYLES_DIR, { recursive: true }).filter((f) => /\.(css|scss)$/.test(f)).sort()) {
    const file = path.join(STYLES_DIR, f);
    const raw = fs.readFileSync(file, 'utf8');
    lib.files += 1;
    lib['2.3.1'].push(...(skipsIn(raw).includes('2.3.1') ? [] : CHECKS['2.3.1'](raw, raw, path.relative(ROOT, file))));
  }
}
// 2.5.2 and 2.3.1 are library-scope: move component findings to $library so
// they guard the library note without failing component cells.
for (const [name, c] of Object.entries(byComponent)) {
  if (name === '$library') continue;
  for (const k of ['2.5.2', '2.3.1']) {
    lib[k].push(...c[k].map((f) => `${name}: ${f}`));
    c[k] = [];
  }
}

const previous = ONLY && fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')).components : {};
const merged = Object.fromEntries(Object.entries({ ...previous, ...byComponent }).sort(([a], [b]) => a.localeCompare(b)));
if (!CI) {
  fs.writeFileSync(
    OUT,
    JSON.stringify({ $comment: 'Generated by a11y-kit code from component source. Do not edit.', date: new Date().toISOString().slice(0, 10), components: merged }, null, 2) + '\n',
  );
}
const fails = (k) => Object.entries(byComponent).filter(([n, c]) => n !== '$library' && c[k].length).length;
console.log(`a11y-code: ${targets.length} files, ${Object.keys(byComponent).length - 1} components${CI ? '' : ` → ${path.relative(ROOT, OUT)}`}`);
for (const k of COMPONENT_KEYS) console.log(`  ${k}: ${fails(k)} component(s) with findings`);
console.log(`  library (2.5.2, 2.3.1): ${lib['2.5.2'].length + lib['2.3.1'].length} finding(s)`);
if (CI) {
  const lines = Object.entries(byComponent).flatMap(([name, c]) =>
    (name === '$library' ? ['2.5.2', '2.3.1'] : COMPONENT_KEYS).flatMap((k) => c[k].map((f) => `- ${k} **${name}** — ${f}`)),
  );
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Code-analysis a11y checks\n\n${targets.length} files, ${lines.length} finding(s).\n\n${lines.join('\n')}\n`);
  }
  for (const l of lines) console.log(`::error title=a11y-code::${l.replace(/[\r\n]+/g, ' ')}`);
  if (lines.length) process.exitCode = 1;
}
