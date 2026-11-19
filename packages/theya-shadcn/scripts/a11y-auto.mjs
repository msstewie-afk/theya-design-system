#!/usr/bin/env node
/**
 * Theya's auto accessibility check is a11y-kit's engine check
 * (packages/a11y-kit/src/engine/auto.mjs, documented there), run with this
 * package's a11y-kit.config.mjs. Same flags: --url, --only, --workers, --ci,
 * --shard, --fixtures, --group.
 */
import { fileURLToPath } from 'node:url';

// The kit reads its config and writes its results relative to the package.
process.chdir(fileURLToPath(new URL('..', import.meta.url)));
await import('../../a11y-kit/src/engine/auto.mjs');
