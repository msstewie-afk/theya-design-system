/**
 * The density spacing rule, shared by build-density.mjs (CSS) and
 * build-dtcg.mjs (DTCG / Tokens Studio), and mirrored by the Tailwind
 * utilities in theya-shadcn's src/styles/density-spacing.css:
 * up to 8px unchanged; the part above 8px grows or shrinks by `delta`
 * (−0.4 compact, +0.4 comfortable), rounded to 2px.
 */
export const spaced = (px, delta) => (px <= 8 ? px : px + Math.round(((px - 8) * delta) / 2) * 2);

/** Token paths the rule applies to (semantic padding / gap / margin). */
export const SPACING_PATH = /^size\.(padding|gap|margin)\./;
