#!/usr/bin/env node
/**
 * Theya's code accessibility check is a11y-kit's engine check
 * (packages/a11y-kit/src/engine/code.mjs, documented there), run with this
 * package's a11y-kit.config.mjs (code.targets, code.styles). Flags: --only,
 * --ci, --fixtures. No browser.
 */
import { fileURLToPath } from 'node:url';

// The kit reads its config and writes its results relative to the package.
process.chdir(fileURLToPath(new URL('..', import.meta.url)));
await import('../../a11y-kit/src/engine/code.mjs');
