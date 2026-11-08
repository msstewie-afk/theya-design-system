#!/usr/bin/env node
/**
 * Turns package.json into the manifest published to GitHub Packages.
 *
 *   node scripts/github-package.mjs            rewrite package.json in place (CI only)
 *   node scripts/github-package.mjs --print    print the result, change nothing
 *
 * GitHub Packages takes an npm package only under its owner's scope, so the
 * published name is @msstewie-afk/theya-shadcn; in the monorepo the package
 * stays @theya/shadcn and stays "private" (nothing can reach the public npm
 * registry by accident). An app installs it under the old name with an alias:
 *
 *   "@theya/shadcn": "npm:@msstewie-afk/theya-shadcn@^0.2.0"
 *
 * so its imports (`@theya/shadcn/ui/button`) don't change.
 *
 * Run by .github/workflows/release.yml on a fresh checkout, right before
 * `pnpm publish`; never commit the rewritten file.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const OWNER = 'msstewie-afk';
export const PUBLISHED_NAME = `@${OWNER}/theya-shadcn`;
export const REGISTRY = 'https://npm.pkg.github.com';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(ROOT, 'package.json');
const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));

if (pkg.name !== '@theya/shadcn') throw new Error(`github-package: unexpected name ${pkg.name}`);

pkg.name = PUBLISHED_NAME;
delete pkg.private;
pkg.repository = { type: 'git', url: `https://github.com/${OWNER}/theya-design-system.git`, directory: 'packages/theya-shadcn' };
pkg.publishConfig = { ...pkg.publishConfig, registry: REGISTRY };
// Dev-only workspace links mean nothing outside the monorepo.
if (pkg.devDependencies) delete pkg.devDependencies['@theya/tokens'];

const out = JSON.stringify(pkg, null, 2) + '\n';
if (process.argv.includes('--print')) process.stdout.write(out);
else {
  fs.writeFileSync(file, out);
  console.log(`github-package: ${PUBLISHED_NAME}@${pkg.version} → ${REGISTRY}`);
}
