**English** · [Русский](LOCALIZATION.ru.md)

# Localizing built-in strings

Theya components write some of their own text: hidden labels for screen readers ("Close", "Clear date"), placeholders ("Pick a date"), utility words ("Copied", "Unlimited"), and screen reader announcements. This text comes from a dictionary. The library does not touch text that the app passes in.

## In the app

```tsx
import { TheyaLocaleProvider } from '@theya/shadcn/lib/i18n';
import { ruLocale } from '@theya/shadcn/lib/locale-ru';

<TheyaLocaleProvider {...ruLocale} syncDocument>
  <App />
</TheyaLocaleProvider>
```

- **Without a provider**, everything is in English.
- **`syncDocument`**: the provider sets `lang` (and `dir`, if the bundle has it) on `<html>` and restores the previous values on unmount. The screen reader picks a voice based on `lang`: without it, Russian labels are read with an English voice. Turn it on only for the root provider. A nested provider for a single widget should not rename the whole page.
- **Ready-made dictionaries:**

  | Language | Import |
  |---|---|
  | English | `locale-en` (`en`, `enLocale`) |
  | Русский | `locale-ru` |
  | Deutsch | `locale-de` |
  | العربية | `locale-ar` |
  | 中文 | `locale-zh` |

  Each bundle contains: `locale` (the tag for Intl), `messages`, `dateLocale` (date-fns, for calendars), and `dir`.
- **Text direction (RTL).** It is needed in two places (`syncDocument` covers both):
  - on the page: `<html dir={bundle.dir}>`. The layout mirrors based on it;
  - in the provider: `<TheyaLocaleProvider {...arLocale}>` (the bundle already carries `dir`). Radix components, Carousel, Drawer and ProductTour read the direction from it for keys and sides.
  See the "RTL" section below for details.
- **Partial override.** You can replace one string; the rest falls back to English:
  `<TheyaLocaleProvider locale="en-GB" messages={{ dialog: { close: 'Done' } }}>`.
- **Component props win over the dictionary:** `dismissLabel`, `placeholder`, `copyLabel`, etc.
- **Dates and numbers** (DatePicker, DateRangePicker, Scheduler, Meter, Price, countries in PhoneField) are formatted using the provider's `locale`. Without a provider, en-US is used.
- **Code outside React.** `undoToast()` and `toast.progress()` take strings from the last rendered provider (`getTheyaMessages()`).

## In Storybook

The toolbar has a **Language** switcher: English, Русский, Deutsch, العربية (RTL), 中文, Pseudo.

- **Pseudo** makes every built-in string about 40% longer and adds accents: `[Çlöšé ~~]`. A string that stays plain English is hardcoded in the component and bypasses the dictionary. A string that gets truncated will not survive translation.
- **Deutsch** shows long real words.
- **中文** shows short text and the system font: Geologica has no CJK characters.
- **العربية** turns on `dir="rtl"`.

## How to add a string

1. Add a key to `packages/theya-shadcn/src/lib/locale-en.ts`, in the component's namespace.
2. In the component, take the string from the dictionary:
   ```ts
   const { t } = useTheyaI18n();
   if (clearLabel === undefined) clearLabel = t.datePicker.clear;
   ```
   Do not put the default value in the parameters. Write it as in the example above. That way the prop can still override it.
3. Add a translation to every `locale-*.ts`. Without a translation, `tsc` will fail: the dictionaries are typed against the English one.
4. Run `pnpm api`. The default values go into the spec and the API report, marked `(localized: …)`.

The German, Arabic and Chinese translations were made without a native speaker. Review them before shipping a product in these languages.

## RTL

Theya mirrors for right-to-left scripts (Arabic, Hebrew, Persian).

What is done:

- **Logical spacing and sides.** Components use `ms/me`, `ps/pe`, `start/end`, `text-start/end`, `border-s/e`, `rounded-s/e` instead of `ml/mr`, `left/right`, etc. In RTL they swap automatically. `pnpm api:check` fails on physical ones (`node scripts/check-rtl.mjs --fix` converts them automatically). Exceptions: centering with `left-1/2` (it is symmetric) and `drawer.tsx` (vaul only knows physical sides).
- **Directional icons** (back/forward arrows, chevrons, undo/redo, external link) are flipped with `rtl:-scale-x-100`.
- **Toggles and scales:** the Switch thumb, the Progress fill and the Stepper labels start from the start of the line; Slider, Tabs, RadioGroup, menus and submenus use the Radix `DirectionProvider`, which `TheyaLocaleProvider` sets up.
- **Carousel:** the first slide is on the right, "forward" scrolls to the left, and the arrow keys follow the direction.
- **Drawer:** `direction="start" | "end"` is the side in reading direction (in RTL, `end` opens on the left). The Sidebar menu on phones, catalog filters and the mega menu use them.
- **ProductTour:** in RTL, ← goes to the next step.
- **What stays LTR:** code (CodeBlock, CodeEditor, DiffViewer, Terminal) and keyboard shortcuts (Kbd: `⌘K`, not `K⌘`).

Checked visually in Storybook (Language → العربية): Pagination, Breadcrumb, Switch, Progress, Tabs, Slider, Stepper, Calendar, DropdownMenu, Carousel, WorkspaceLayout, DataTable. There is no automated visual run in RTL: play tests find elements by their English labels.

Not done: review of the Arabic (and German, Chinese) dictionary by a native speaker; charts (Recharts) stay LTR.

