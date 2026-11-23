# Проверки доступности

Генерируется `a11y-kit registry` из реестра набора и метаданных правил axe-core 4.12.1. Не править руками. Проверок: 110.

**Стадия**: code (код, без браузера), component (собранный Storybook), page (страницы продукта), manual (человек), pr (агент-ревьюер: мнение, сборку не роняет). **Глубина**: full — чистый результат подтверждает критерий для того, что отрисовано; part — одну его сторону; gate — находка делает ячейку красной, чистый результат сам ничего не доказывает; advisory — подсказка человеку, никогда не роняет. **Запуск**: для правил axe — запускается ли правило без явного включения по имени. **Калибровка**: на чём проверка доказана (axe: калибровка по правилу; свои проверки: калибровочные сториз, которые она должна поймать и пропустить). «—» — ещё не доказано.

## Проверки

| Проверка | Критерии | Стадия | Глубина | Запуск | Калибровка | Где | Как работает |
|---|---|---|---|---|---|---|---|
| `axe.aria-meter-name` | 1.1.1 | component | part | default | caught | ds | ARIA meter nodes must have an accessible name |
| `axe.aria-progressbar-name` | 1.1.1 | component | part | default | caught | ds | ARIA progressbar nodes must have an accessible name |
| `axe.image-alt` | 1.1.1 | component | part | default | caught | ds | Images must have alternative text |
| `axe.input-image-alt` | 1.1.1, 4.1.2 | component | part | default | caught | ds | Image buttons must have alternative text |
| `axe.object-alt` | 1.1.1 | component | part | default | caught | ds | <object> elements must have alternative text |
| `axe.role-img-alt` | 1.1.1 | component | part | default | caught | ds | [role="img"] elements must have alternative text |
| `axe.svg-img-alt` | 1.1.1 | component | part | default | caught | ds | <svg> elements with an img role must have alternative text |
| `forced.icons` | 1.1.1 | component | part | — | Defect: controls and an icon drawn only with fills | ds | With forced colors, CSS mask icons don't disappear. |
| `tree.image-name` | 1.1.1 | component | part | — | — | ds | No exposed image without a name, unless it sits inside a named control and is hidden in the DOM too (Safari exposes icons Chromium drops). |
| `axe.audio-caption` | 1.2.1 | component | part | deprecated | not run: not executed with this configuration | ds | <audio> elements must have a captions track |
| `manual.product` | 1.2.1, 1.2.2, 1.2.3, 1.2.4, 1.2.5, 2.4.1, 2.4.2, 2.4.5, 3.1.1, 3.1.2, 3.2.3, 3.2.4, 3.2.6, 3.3.4, 2.2.1, 2.2.2, 2.5.4, 1.3.4, 1.4.2 | manual | full | — | — | product | Product level: pages, content, media and flows (titles, language, skip link, captions, consistent navigation and help, error prevention). |
| `axe.video-caption` | 1.2.2 | component | part | default | review only | ds | <video> elements must have captions |
| `auto.experimental-axe` | 1.3.1, 1.3.4, 2.5.3 | component | advisory | — | Advisory: a bold paragraph used as a heading | ds | axe's experimental rules (p-as-heading, td-has-header, table-fake-caption, label-content-name-mismatch, css-orientation-lock), switched on by name; listed for a person, never failing. |
| `axe.aria-hidden-body` | 1.3.1, 4.1.2 | page | part | default | page level: looks at the whole page; the scan root is an element | product | aria-hidden="true" must not be present on the document body |
| `axe.aria-required-children` | 1.3.1 | component | part | default | caught | ds | Certain ARIA roles must contain particular children |
| `axe.aria-required-parent` | 1.3.1 | component | part | default | caught | ds | Certain ARIA roles must be contained by particular parents |
| `axe.definition-list` | 1.3.1 | component | part | default | caught | ds | <dl> elements must only directly contain properly-ordered <dt> and <dd> groups, <script>, <template> or <div> elements |
| `axe.dlitem` | 1.3.1 | component | part | default | caught | ds | <dt> and <dd> elements must be contained by a <dl> |
| `axe.list` | 1.3.1 | component | part | default | caught | ds | <ul> and <ol> must only directly contain <li>, <script> or <template> elements |
| `axe.listitem` | 1.3.1 | component | part | default | caught | ds | <li> elements must be contained in a <ul> or <ol> |
| `axe.p-as-heading` | 1.3.1 | component | part | experimental | not run: not executed with this configuration | ds | Styled <p> elements must not be used as headings |
| `axe.table-fake-caption` | 1.3.1 | component | part | experimental | not run: not executed with this configuration | ds | Data or header cells must not be used to give caption to a data table. |
| `axe.td-has-header` | 1.3.1 | component | part | experimental | not run: not executed with this configuration | ds | Non-empty <td> elements in larger <table> must have an associated table header |
| `axe.td-headers-attr` | 1.3.1 | component | part | default | caught | ds | Table cell headers attributes must refer to other <th> elements in the same table |
| `axe.th-has-data-cells` | 1.3.1 | component | part | default | review only | ds | Table headers in a data table must refer to data cells |
| `tree.field-label` | 1.3.1, 3.3.2 | component | part | — | — | ds | Every form field gets its name from an associated label. |
| `tree.radio-group` | 1.3.1 | component | part | — | — | ds | Every radio is inside a radio group. |
| `tree.table-headers` | 1.3.1 | component | part | — | — | ds | Every table has column or row headers. |
| `code.reordering` | 1.3.2 | code | part | — | — | ds | The source has no CSS reordering (order-*, *-reverse, col/row-start); reordering sends the component to review. |
| `tree.snapshot` | 1.3.2, 4.1.2 | component | part | — | — | ds | Records each story's accessibility tree in reading order; a change shows up as a diff in review, and a stale screen-reader pass is detected from it. |
| `manual.review` | 1.3.3, 1.4.5, 2.4.6, 2.5.7, 3.2.1, 3.3.3, 3.3.7, 3.3.8, 2.1.4, 2.3.1, 2.5.1, 2.5.2, 1.4.13, 2.4.11 | manual | full | — | — | ds | A person reads the component, its docs and examples against the criterion; the verdict goes to the manual register. |
| `axe.css-orientation-lock` | 1.3.4 | page | part | experimental | page level: looks at the whole page; the scan root is an element | product | CSS Media queries must not lock display orientation |
| `axe.autocomplete-valid` | 1.3.5 | component | part | default | caught | ds | autocomplete attribute must be used correctly |
| `axe.link-in-text-block` | 1.4.1 | component | part | default | caught | ds | Links must be distinguishable without relying on color |
| `forced.checked-state` | 1.4.1, 4.1.2 | component | part | — | Defect: controls and an icon drawn only with fills | ds | With forced colors, a checked checkbox, radio or switch doesn't look like an unchecked one (when it differs in normal colors). |
| `axe.no-autoplay-audio` | 1.4.2 | component | part | default | review only | ds | <video> or <audio> elements must not play automatically |
| `axe.color-contrast` | 1.4.3 | component | part | default | caught | ds | Elements must meet minimum color contrast ratio thresholds |
| `tokens.pairs` | 1.4.3, 1.4.11 | code | part | — | — | ds | Every configured token pair (text on surfaces, field and control borders, checked fills, icons) in every theme and product theme, from the design system's CSS: what each component inherits, before any story renders. |
| `auto.resize-text` | 1.4.4 | component | full | — | — | ds | At 200% text size, no text is clipped or overlaps. |
| `axe.meta-viewport` | 1.4.4 | page | part | default | page level: looks at the whole page; the scan root is an element | product | Zooming and scaling must not be disabled |
| `auto.reflow-320` | 1.4.10 | component | full | — | Defect: fixed-width box scrolls sideways at 320px; Clean: data table scrolls inside its own box | ds | A fresh load at the criterion's own 320 CSS px viewport doesn't scroll horizontally; two-dimensional content (table, grid, pre, data-reflow-exempt) is exempt. |
| `suite.reflow-360` | 1.4.10 | component | full | — | — | ds | Every story's play tests run again at a 360px viewport. |
| `forced.control-edge` | 1.4.11 | component | part | — | Clean: native controls, bordered fields; Defect: controls and an icon drawn only with fills | ds | With forced-colors: active, no control becomes one flat color that it isn't in normal colors (no edge, text or mark left). |
| `auto.text-spacing` | 1.4.12 | component | full | — | — | ds | With WCAG text spacing applied, no text is clipped or overlaps. |
| `axe.avoid-inline-spacing` | 1.4.12 | component | part | default | caught | ds | Inline text spacing must be adjustable with custom stylesheets |
| `states.hover-content` | 1.4.13 | component | full | — | Clean: Radix tooltip; Defect: tooltip that closes when the pointer moves onto it; Defect: hint that Escape doesn; Defect: hint that closes by itself | ds | Tooltip and hover-card content: Escape closes it (focus stays), the pointer can move onto it, it doesn't close by itself. |
| `auto.keyboard-reach` | 2.1.1 | component | part | — | Clean: visually hidden Dismiss button (Base UI) | ds | Every focusable control in the story is reached by Tab; nothing with a pointer handler is pointer-only. |
| `axe.frame-focusable-content` | 2.1.1 | component | part | default | not caught | ds | Frames with focusable content must not have tabindex=-1 |
| `axe.scrollable-region-focusable` | 2.1.1 | component | part | default | not caught | ds | Scrollable region must have keyboard access |
| `axe.server-side-image-map` | 2.1.1 | component | part | default | review only | ds | Server-side image maps must not be used |
| `states.keyboard` | 2.1.1 | component | part | — | Defect: Escape doesn; Defect: arrow keys don; Defect: no match removes the list but stays expanded; Defect: opens on click but not on Enter | ds | APG keyboard: comboboxes (ArrowDown, option, Escape twice, typing with no match), triggers open on Enter, tablists and radio groups move with arrows along their orientation, a dialog open on load closes on Escape. |
| `auto.no-trap` | 2.1.2 | component | full | — | ACT 80af7b | ds | Tab leaves every element; a cycle must be left by Escape or Shift+Tab. |
| `code.character-shortcuts` | 2.1.4 | code | part | — | code:2.1.4-fail.tsx; code:2.1.4-pass.tsx | ds | No document- or window-level key handler matching a single printable character without a modifier check (component onKeyDown is the criterion's own exception). |
| `axe.meta-refresh` | 2.2.1 | page | part | default | page level: looks at the whole page; the scan root is an element | product | Delayed refresh under 20 hours must not be used |
| `axe.blink` | 2.2.2 | component | part | default | caught | ds | <blink> elements are deprecated and must not be used |
| `axe.marquee` | 2.2.2 | component | part | default | caught | ds | <marquee> elements are deprecated and must not be used |
| `code.flashes` | 2.3.1 | code | part | — | code:2.3.1-fail.css; code:2.3.1-pass.css | library | No infinite animation cycling faster than 3 times a second that swings opacity, visibility or background (cannot measure flash area or red flashes). |
| `code.reduced-motion` | 2.3.3 | code | full | — | — | ds | Animations are behind motion-safe or a reduced-motion check (AAA, recorded for the library). |
| `axe.bypass` | 2.4.1 | page | part | default | page level: looks at the whole page; the scan root is an element | product | Page must have means to bypass repeated blocks |
| `axe.document-title` | 2.4.2 | page | part | default | page level: looks at the whole page; the scan root is an element | product | Documents must have <title> element to aid in navigation |
| `auto.focus-order` | 2.4.3 | component | part | — | ACT 80af7b Passed 2 | ds | No positive tabindex; Tab order follows the visual order. |
| `states.focus-management` | 2.4.3 | component | part | — | Defect: Escape drops focus instead of returning it; Defect: focus doesn | ds | Focus moves into an opened popup and returns to its trigger when it closes. |
| `axe.area-alt` | 2.4.4, 4.1.2 | component | part | default | caught | ds | Active <area> elements must have alternative text |
| `axe.link-name` | 2.4.4, 4.1.2 | component | part | default | caught | ds | Links must have discernible text |
| `auto.focus-visible` | 2.4.7 | component | full | — | ACT oj04fd | ds | Tab through the story: every stop looks different focused and blurred (outline, box-shadow, border, background). |
| `forced.focus` | 2.4.7 | component | part | — | Defect: controls and an icon drawn only with fills; ACT oj04fd Failed 1 | ds | With forced colors, every Tab stop looks different focused and blurred, from screenshots. |
| `auto.focus-not-obscured` | 2.4.11 | component | gate | — | Defect: sticky bar hides the focused button; Clean: sticky bar with scroll-padding | ds | In the Tab pass, the focused element isn't entirely under a sticky or fixed box (hit-test on five points). |
| `code.pointer-gestures` | 2.5.1 | code | part | — | code:2.5.1-fail.tsx; code:2.5.1-pass.tsx | ds | Multipoint or path-based gesture handling (touches.length > 1, gesture libraries, touchmove tracking) only in files that also have a click or keyboard path. |
| `code.pointer-cancellation` | 2.5.2 | code | part | — | code:2.5.2-fail.tsx; code:2.5.2-pass.tsx | library | No action fired on pointerdown, mousedown or touchstart (handlers that only prevent default, focus or set visual state pass). |
| `auto.label-in-name` | 2.5.3 | component | full | — | ACT 2ee8b8 | ds | A control's visible text is part of its accessible name. |
| `axe.label-content-name-mismatch` | 2.5.3 | component | part | experimental | not run: not executed with this configuration | ds | Elements must have their visible text as part of their accessible name |
| `code.dragging` | 2.5.7 | code | part | — | code:2.5.7-fail.tsx; code:2.5.7-pass.tsx | ds | Drag handling (dnd libraries, pointer capture with pointermove, draggable) only in files with a keyboard path or an input alternative. |
| `axe.target-size` | 2.5.8 | component | part | off by default | caught | ds | All touch targets must be 24px large, or leave sufficient space |
| `axe.html-has-lang` | 3.1.1 | page | part | default | page level: looks at the whole page; the scan root is an element | product | <html> element must have a lang attribute |
| `axe.html-lang-valid` | 3.1.1 | page | part | default | page level: looks at the whole page; the scan root is an element | product | <html> element must have a valid value for the lang attribute |
| `axe.html-xml-lang-mismatch` | 3.1.1 | page | part | default | page level: looks at the whole page; the scan root is an element | product | HTML elements with lang and xml:lang must have the same base language |
| `axe.valid-lang` | 3.1.2 | component | part | default | caught | ds | lang attribute must have a valid value |
| `auto.on-focus` | 3.2.1 | component | part | — | Defect: focusing a field changes the URL; Defect: focusing a field opens a modal dialog; Clean: a combobox shows its own popup on focus | ds | In the Tab pass, focus alone doesn't change the URL or open a modal dialog (a non-modal popup that leaves focus on the field, or one the focused control owns, is content, not context). |
| `states.on-input` | 3.2.2 | component | part | — | Clean: a field and a checkbox that change nothing else; Defect: typing moves focus to another field; Defect: toggling a checkbox opens a dialog | ds | Typing in a field and toggling a checkbox or switch doesn't navigate, open a dialog or move focus away (selects and radios: a person). |
| `tree.error-text` | 3.3.1 | component | full | — | — | ds | Every field marked aria-invalid points to a non-empty error text (aria-describedby or aria-errormessage on the field or its group). |
| `axe.form-field-multiple-labels` | 3.3.2 | component | part | default | review only | ds | Form field must not have multiple label elements |
| `code.authentication` | 3.3.8 | code | part | — | code:3.3.8-fail.tsx; code:3.3.8-pass.tsx | ds | Password inputs carry an autocomplete a password manager can use; no paste blocking in files with a password or login field. |
| `axe.aria-allowed-attr` | 4.1.2 | component | part | default | caught | ds | Elements must only use supported ARIA attributes |
| `axe.aria-braille-equivalent` | 4.1.2 | component | part | default | review only | ds | aria-braille attributes must have a non-braille equivalent |
| `axe.aria-command-name` | 4.1.2 | component | part | default | caught | ds | ARIA commands must have an accessible name |
| `axe.aria-conditional-attr` | 4.1.2 | component | part | default | caught | ds | ARIA attributes must be used as specified for the element's role |
| `axe.aria-deprecated-role` | 4.1.2 | component | part | default | caught | ds | Deprecated ARIA roles must not be used |
| `axe.aria-hidden-focus` | 4.1.2 | component | part | default | caught | ds | ARIA hidden element must not be focusable or contain focusable elements |
| `axe.aria-input-field-name` | 4.1.2 | component | part | default | caught | ds | ARIA input fields must have an accessible name |
| `axe.aria-prohibited-attr` | 4.1.2 | component | part | default | review only | ds | Elements must only use permitted ARIA attributes |
| `axe.aria-required-attr` | 4.1.2 | component | part | default | caught | ds | Required ARIA attributes must be provided |
| `axe.aria-roledescription` | 4.1.2 | component | part | deprecated | not run: not executed with this configuration | ds | aria-roledescription must be on elements with a semantic role |
| `axe.aria-roles` | 4.1.2 | component | part | default | caught | ds | ARIA roles used must conform to valid values |
| `axe.aria-tab-name` | 4.1.2 | component | part | default | caught | ds | ARIA tab nodes must have an accessible name |
| `axe.aria-toggle-field-name` | 4.1.2 | component | part | default | caught | ds | ARIA toggle fields must have an accessible name |
| `axe.aria-tooltip-name` | 4.1.2 | component | part | default | caught | ds | ARIA tooltip nodes must have an accessible name |
| `axe.aria-valid-attr` | 4.1.2 | component | part | default | caught | ds | ARIA attributes must conform to valid names |
| `axe.aria-valid-attr-value` | 4.1.2 | component | part | default | caught | ds | ARIA attributes must conform to valid values |
| `axe.button-name` | 4.1.2 | component | part | default | caught | ds | Buttons must have discernible text |
| `axe.duplicate-id-aria` | 4.1.2 | component | part | default | review only | ds | IDs used in ARIA and labels must be unique |
| `axe.frame-title` | 4.1.2 | component | part | default | caught | ds | Frames must have an accessible name |
| `axe.frame-title-unique` | 4.1.2 | component | part | default | review only | ds | Frames must have a unique title attribute |
| `axe.input-button-name` | 4.1.2 | component | part | default | caught | ds | Input buttons must have discernible text |
| `axe.label` | 4.1.2 | component | part | default | caught | ds | Form elements must have labels |
| `axe.nested-interactive` | 4.1.2 | component | part | default | caught | ds | Interactive controls must not be nested |
| `axe.select-name` | 4.1.2 | component | part | default | caught | ds | Select element must have an accessible name |
| `axe.summary-name` | 4.1.2 | component | part | default | caught | ds | Summary elements must have discernible text |
| `states.aria-states` | 4.1.2 | component | part | — | Defect: aria-expanded on a hidden popup; Defect: loading popup without aria-controls; Defect: chip without a role; Defect: aria-label on a div without a role; Defect: a button inside a menu item; Defect: aria-labelledby points to nothing; Defect: a button inside aria-hidden; Defect: aria-haspopup=; Clean: combobox; Clean: page aria-hidden behind a popup that holds focus (Radix); Clean: empty open list, display:contents popup, menu named by an icon button; Clean: nested tree items, a dialog that hides the page without focus in it; ACT 6cfa84 | ds | In every state a story can be driven to: aria-expanded matches what is shown, IDREFs resolve, popups have the role and name aria-haspopup promises, no aria-label on generic elements, no focusable generic with its own key handlers, nothing focusable inside aria-hidden, no nested controls. |
| `tree.control-name` | 4.1.2 | component | part | — | Defect: listbox without a name | ds | Every control in the accessibility tree (button, link, field, checkbox, radio, switch, combobox, slider, tab, menu item, option) has a name. |
| `manual.screen-reader` | 4.1.3, 4.1.2, 1.3.1, 1.3.2 | manual | full | — | — | ds | VoiceOver + Safari, each story's checklist (what should be heard as rendered, after ArrowDown, Enter, typing); the only check for status messages. |

## Критерии

| Критерий | Уровень | Где | Автоматизация | Откалиброванные проверки | Ещё не откалиброваны | Человек |
|---|---|---|---|---|---|---|
| 1.1.1 Non-text Content | A | ds | частично | `forced.icons`, `axe.aria-meter-name`, `axe.aria-progressbar-name`, `axe.image-alt`, `axe.input-image-alt`, `axe.object-alt`, `axe.role-img-alt`, `axe.svg-img-alt` | `tree.image-name` | — |
| 1.2.1 Audio-only and Video-only (Prerecorded) | A | product | вручную | — | — | manual.product |
| 1.2.2 Captions (Prerecorded) | A | product | частично | — | `axe.video-caption` | manual.product |
| 1.2.3 Audio Description or Media Alternative (Prerecorded) | A | product | вручную | — | — | manual.product |
| 1.2.4 Captions (Live) | AA | product | вручную | — | — | manual.product |
| 1.2.5 Audio Description (Prerecorded) | AA | product | вручную | — | — | manual.product |
| 1.3.1 Info and Relationships | A | ds | частично | `axe.aria-required-children`, `axe.aria-required-parent`, `axe.definition-list`, `axe.dlitem`, `axe.list`, `axe.listitem`, `axe.td-headers-attr` | `tree.table-headers`, `tree.radio-group`, `tree.field-label`, `axe.aria-hidden-body`, `axe.p-as-heading`, `axe.table-fake-caption`, `axe.td-has-header`, `axe.th-has-data-cells` | manual.screen-reader |
| 1.3.2 Meaningful Sequence | A | ds | частично | — | `tree.snapshot`, `code.reordering` | manual.screen-reader |
| 1.3.3 Sensory Characteristics | A | product | вручную | — | — | manual.review |
| 1.3.4 Orientation | AA | library | частично | — | `axe.css-orientation-lock` | manual.product |
| 1.3.5 Identify Input Purpose | AA | ds | частично | `axe.autocomplete-valid` | — | — |
| 1.4.1 Use of Color | A | ds | частично | `forced.checked-state`, `axe.link-in-text-block` | — | — |
| 1.4.2 Audio Control | A | product | частично | — | `axe.no-autoplay-audio` | manual.product |
| 1.4.3 Contrast (Minimum) | AA | ds | частично | `axe.color-contrast` | `tokens.pairs` | — |
| 1.4.4 Resize Text | AA | ds | автоматически | — | `auto.resize-text`, `axe.meta-viewport` | — |
| 1.4.5 Images of Text | AA | product | вручную | — | — | manual.review |
| 1.4.10 Reflow | AA | ds | автоматически | `auto.reflow-320` | `suite.reflow-360` | — |
| 1.4.11 Non-text Contrast | AA | ds | частично | `forced.control-edge` | `tokens.pairs` | — |
| 1.4.12 Text Spacing | AA | ds | автоматически | `axe.avoid-inline-spacing` | `auto.text-spacing` | — |
| 1.4.13 Content on Hover or Focus | AA | ds | автоматически | `states.hover-content` | — | manual.review |
| 2.1.1 Keyboard | A | ds | частично | `auto.keyboard-reach`, `states.keyboard` | `axe.frame-focusable-content`, `axe.scrollable-region-focusable`, `axe.server-side-image-map` | — |
| 2.1.2 No Keyboard Trap | A | ds | автоматически | `auto.no-trap` | — | — |
| 2.1.4 Character Key Shortcuts | A | ds | частично | `code.character-shortcuts` | — | manual.review |
| 2.2.1 Timing Adjustable | A | ds | частично | — | `axe.meta-refresh` | manual.product |
| 2.2.2 Pause, Stop, Hide | A | ds | частично | `axe.blink`, `axe.marquee` | — | manual.product |
| 2.3.1 Three Flashes or Below Threshold | A | library | частично | `code.flashes` | — | manual.review |
| 2.4.1 Bypass Blocks | A | product | частично | — | `axe.bypass` | manual.product |
| 2.4.2 Page Titled | A | product | частично | — | `axe.document-title` | manual.product |
| 2.4.3 Focus Order | A | ds | частично | `auto.focus-order`, `states.focus-management` | — | — |
| 2.4.4 Link Purpose (In Context) | A | ds | частично | `axe.area-alt`, `axe.link-name` | — | — |
| 2.4.5 Multiple Ways | AA | product | вручную | — | — | manual.product |
| 2.4.6 Headings and Labels | AA | ds | вручную | — | — | manual.review |
| 2.4.7 Focus Visible | AA | ds | автоматически | `auto.focus-visible`, `forced.focus` | — | — |
| 2.4.11 Focus Not Obscured (Minimum) | AA | ds | частично | `auto.focus-not-obscured` | — | manual.review |
| 2.5.1 Pointer Gestures | A | ds | частично | `code.pointer-gestures` | — | manual.review |
| 2.5.2 Pointer Cancellation | A | library | частично | `code.pointer-cancellation` | — | manual.review |
| 2.5.3 Label in Name | A | ds | автоматически | `auto.label-in-name` | `axe.label-content-name-mismatch` | — |
| 2.5.4 Motion Actuation | A | library | вручную | — | — | manual.product |
| 2.5.7 Dragging Movements | AA | ds | частично | `code.dragging` | — | manual.review |
| 2.5.8 Target Size (Minimum) | AA | ds | частично | `axe.target-size` | — | — |
| 3.1.1 Language of Page | A | product | частично | — | `axe.html-has-lang`, `axe.html-lang-valid`, `axe.html-xml-lang-mismatch` | manual.product |
| 3.1.2 Language of Parts | AA | product | частично | `axe.valid-lang` | — | manual.product |
| 3.2.1 On Focus | A | ds | частично | `auto.on-focus` | — | manual.review |
| 3.2.2 On Input | A | ds | частично | `states.on-input` | — | — |
| 3.2.3 Consistent Navigation | AA | product | вручную | — | — | manual.product |
| 3.2.4 Consistent Identification | AA | product | вручную | — | — | manual.product |
| 3.2.6 Consistent Help | A | product | вручную | — | — | manual.product |
| 3.3.1 Error Identification | A | ds | автоматически | — | `tree.error-text` | — |
| 3.3.2 Labels or Instructions | A | ds | частично | — | `tree.field-label`, `axe.form-field-multiple-labels` | — |
| 3.3.3 Error Suggestion | AA | product | вручную | — | — | manual.review |
| 3.3.4 Error Prevention (Legal, Financial, Data) | AA | product | вручную | — | — | manual.product |
| 3.3.7 Redundant Entry | A | product | вручную | — | — | manual.review |
| 3.3.8 Accessible Authentication (Minimum) | AA | ds | частично | `code.authentication` | — | manual.review |
| 4.1.2 Name, Role, Value | A | ds | частично | `tree.control-name`, `states.aria-states`, `forced.checked-state`, `axe.area-alt`, `axe.aria-allowed-attr`, `axe.aria-command-name`, `axe.aria-conditional-attr`, `axe.aria-deprecated-role`, `axe.aria-hidden-focus`, `axe.aria-input-field-name`, `axe.aria-required-attr`, `axe.aria-roles`, `axe.aria-tab-name`, `axe.aria-toggle-field-name`, `axe.aria-tooltip-name`, `axe.aria-valid-attr-value`, `axe.aria-valid-attr`, `axe.button-name`, `axe.frame-title`, `axe.input-button-name`, `axe.input-image-alt`, `axe.label`, `axe.link-name`, `axe.nested-interactive`, `axe.select-name`, `axe.summary-name` | `tree.snapshot`, `axe.aria-braille-equivalent`, `axe.aria-hidden-body`, `axe.aria-prohibited-attr`, `axe.duplicate-id-aria`, `axe.frame-title-unique` | manual.screen-reader |
| 4.1.3 Status Messages | AA | ds | вручную | — | — | manual.screen-reader |
