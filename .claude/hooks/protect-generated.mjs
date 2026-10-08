#!/usr/bin/env node
// PreToolUse hook (Edit|Write|MultiEdit): block hand edits to generated files.
// They are rebuilt from sources, so a hand edit is silently lost on the next build.
import { readFileSync } from 'node:fs';
import { relative, isAbsolute } from 'node:path';

let input = {};
try { input = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { process.exit(0); }
const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const filePath = input.tool_input?.file_path;
if (!filePath) process.exit(0);

const rel = (isAbsolute(filePath) ? relative(root, filePath) : filePath).replace(/\\/g, '/');

// [path prefix or exact file, how to regenerate]
const GENERATED = [
  ['packages/tokens/build/', 'Edit packages/tokens/src/ and run: pnpm --filter @theya/tokens build'],
  ['packages/theya-shadcn/spec/', 'Edit the component / its .guidelines.tsx and run: pnpm --filter @theya/shadcn spec'],
  ['packages/theya-shadcn/api/', 'Edit the component and run: pnpm --filter @theya/shadcn api'],
  ['packages/theya-shadcn/public/llms.txt', 'Run: pnpm --filter @theya/shadcn spec'],
  ['packages/theya-shadcn/public/llms-full.txt', 'Run: pnpm --filter @theya/shadcn spec'],
  ['packages/theya-shadcn/build/', 'Run: pnpm --filter @theya/shadcn figma:docs'],
  ['storybook-static/', 'Build output: run build-storybook instead of editing it'],
  ['node_modules/', 'Dependencies are not edited by hand'],
  ['pnpm-lock.yaml', 'Change package.json and run: pnpm install'],
];

for (const [pattern, howTo] of GENERATED) {
  const hit = pattern.endsWith('/')
    ? rel.startsWith(pattern) || rel.includes('/' + pattern)
    : rel === pattern || rel.endsWith('/' + pattern);
  if (hit) {
    process.stderr.write(`Blocked: ${rel} is generated and must not be edited by hand. ${howTo}\n`);
    process.exit(2);
  }
}
process.exit(0);
