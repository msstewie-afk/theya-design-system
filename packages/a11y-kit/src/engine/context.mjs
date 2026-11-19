/**
 * What every engine check needs to know about the design system it runs in,
 * from its a11y-kit.config.mjs (read from the current directory, the
 * design system's package):
 *
 * - root: the package (process.cwd()).
 * - require: resolution from the package, so the checks use its Playwright
 *   (the copy @storybook/test-runner ships with) and its axe-core.
 * - outDir: where results go (env A11Y_KIT_OUT, else config `outDir`, else `a11y`).
 * - componentTitles: Storybook title → component name (config
 *   `componentTitles(root)`, returning a Map). Without it, stories are grouped
 *   by the last segment of their title.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

let cached;
export async function context() {
  if (cached) return cached;
  const root = process.cwd();
  const file = path.join(root, 'a11y-kit.config.mjs');
  const config = fs.existsSync(file) ? (await import(pathToFileURL(file).href)).default : {};
  const req = createRequire(path.join(root, 'package.json'));
  // A11Y_KIT_OUT: write elsewhere (comparing two runs) without touching the committed results.
  const outDir = path.resolve(root, process.env.A11Y_KIT_OUT ?? config.outDir ?? 'a11y');
  fs.mkdirSync(outDir, { recursive: true });
  const componentTitles = config.componentTitles ? await config.componentTitles(root) : null;
  cached = { root, config, require: req, outDir, componentTitles };
  return cached;
}
