---
"@theya/tokens": minor
"@theya/shadcn": minor
---

Full product themes: a profile in `src/profiles/<name>.json` can now set the primary fill and the text on it (`primary`, `onPrimary`), re-hue the neutral ramps (`neutral`), pin any semantic token per mode (`light.tokens`, `dark.tokens`), swap the typeface (`font`) and reshape radii (`radius`: ramp scale, one radius for all buttons / fields), with contrast and status-hue checks and an `accept` list for deliberate deviations. Two themes: `iris` (violet, Onest, tighter radii) and `lime` (lime with dark text, Manrope, pill buttons), light and dark. Manrope and Onest are self-hosted in `@theya/tokens/fonts` (loaded only where a theme uses them). Text and icons on the primary fill (Button, Chip, Avatar, Checkbox, Timeline, Sidebar mark, shadcn `--primary-foreground`) now use the on-primary token, and Button / TextField / Select read `--theme-radius-button` / `--theme-radius-field`; Theya's own look is unchanged.
