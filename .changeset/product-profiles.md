---
"@theya/tokens": minor
"@theya/shadcn": minor
---

Product profiles: `<html data-brand="<name>">` recolors the primary (blue) ramp for a product without touching components. Profiles are `src/profiles/<name>.json` (`{ hue, chroma? }`); the build re-hues every blue step in OKLCH keeping its lightness, so contrast stays where it was, and fails if a step drops under 4.5:1 / 3:1 or the hue sits within 20° of a status color. Generated into `build/css/profiles.css`, imported by `globals.css`. Two demo profiles: `violet`, `magenta`; Storybook has a Brand toolbar switch.
