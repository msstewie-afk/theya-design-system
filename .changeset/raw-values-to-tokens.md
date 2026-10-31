---
'@theya/tokens': minor
'@theya/shadcn': patch
---

Motion and color from tokens instead of raw values.
- New tokens: `black-a600` and `bg-scrim-strong` (black 60%), used by ImageCropper around the crop frame (was a raw 55%).
- ProductTour dims the page with the shared scrim token (black 40%, was a raw 50%), like Dialog.
- Off-scale animation durations moved to the nearest motion step: Chip and BadgeIndicator pop 320 → 300ms, TagInput add 400 → 450ms and remove 180 → 200ms, Stepper pop 400 → 450ms after 300ms, NumberField pulse 350 → 300ms, Rating stars 420 → 450ms, Kanban drop 180 → 200ms (enter curve), menu Bloom 360 → 300ms, SuccessCheck tick delay = the slow step. Form's shake reads its duration from the token. Script animations read the tokens at run time, so a theme's motion reaches them.
- `pnpm api:check` now fails on a raw ms duration, cubic-bezier, rgb/rgba color or numeric `duration:` in a component (`scripts/check-raw-values.mjs`); a deliberate exception carries `raw-ok: <reason>`. Kept on purpose: Button and Fab's 220ms press spring, stagger steps (CardFan, FabSpeedDial), Rating's 700ms spark burst, WheelPicker's 580ms drum settle, SecretField's 6s toast.
