#!/usr/bin/env node
// SessionStart hook: remember HEAD at the start of the session, so the Stop gate
// checks everything changed in this session, including work committed mid-session.
import { readFileSync, mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

let input = {};
try { input = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch {}
const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const dir = join(root, '.claude', '.gate');
mkdirSync(dir, { recursive: true });
const file = join(dir, `${input.session_id || 'default'}.base`);

// Keep the first base on resume/compact: the session's starting point doesn't move.
if (!existsSync(file)) {
  try {
    const head = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    writeFileSync(file, head);
  } catch {
    // Not a git repo or no commits yet: the Stop gate falls back to HEAD.
  }
}
process.exit(0);
