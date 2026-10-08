**English** · [Русский](TOKENS-EXPORT.ru.md)

# Token export (DTCG and Tokens Studio)

Together with the CSS, `pnpm build:tokens` builds the tokens in the W3C Design Tokens format — for Figma Variables, Tokens Studio and other platforms. There is one source: `packages/tokens/src`.

| Folder | Format | Used for |
|---|---|---|
| `packages/tokens/build/dtcg/` | DTCG 2025.10: color `{ colorSpace, components, alpha, hex }`, dimensions `{ value, unit }` | tools that read the current standard; `manifest.json` describes the sets |
| `packages/tokens/build/tokens-studio/` | the same sets, values as strings (`#0068de`, `16px`) + `$metadata.json`, `$themes.json` | Tokens Studio (and, through it, Figma Variables) |

## Sets

References stay references (`{color.blue.blue-500}`), so the primitive → semantic chain is preserved.

| Set | Contents |
|---|---|
| `primitive` | palette, size scale, fonts and weights |
| `base` | semantic sizes and typography, shadows, motion, layers |
| `color-shared` | colors that are the same in both themes (on the primary fill, charts) |
| `color-light`, `color-dark` | semantic theme colors |
| `brand-iris`, `brand-lime` | brand theme: recolored scales, font, weights, radii |
| `brand-iris-light`, `-dark`, etc. | brand theme colors that differ from what the references give (primary fill, text on it, surfaces, links…) |
| `density-default` | density tokens |
| `density-compact`, `density-comfortable` | controls, rows, menu items **and spacing** (padding, gap, margin) |

## Themes in Tokens Studio

`$themes.json` has three groups; in each group you pick one option:

- **foundation** — always;
- **theme** — `light`, `dark`, `iris-light`, `iris-dark`, `lime-light`, `lime-dark`;
- **density** — `default`, `compact`, `comfortable`.

In Figma these are three variable collections; "theme" has six modes, "density" has three.

How to connect: build the tokens (`pnpm build:tokens`) and load the `packages/tokens/build/tokens-studio` folder into Tokens Studio via Tools → Load from file/folder. Sets and themes are picked up from `$metadata.json` and `$themes.json`.

`build/` is not committed, so Tokens Studio's GitHub sync will not see this folder. If you need sync, publish the folder separately (for example, as a CI artifact or to a separate branch).

## Build checks

- every reference resolves in all 18 combinations (foundation × theme × density), the reference type matches, and there are no cycles;
- `check-dtcg.mjs` compares the export with the CSS: for each theme and density, the value of every token resolved through the sets matches what the CSS build gives. Any mismatch fails the build.

## What is not in the export

- italic styles (`typography.italic.*`) — these are Figma style names; DTCG has no such type;
- a single radius for all buttons and fields per theme (`--theme-radius-button`, `--theme-radius-field`; Lime uses pill buttons) — this is a component setting, not a token. The theme's radius scale is exported;
- density scaling of numeric Tailwind utilities (`p-4`, `gap-6`) — CSS only; the matching spacing tokens are exported.
