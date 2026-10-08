#!/usr/bin/env node
// Theya quality gate. Two modes:
//   (default)  Claude Code Stop hook: checks what changed in this session
//              (since the HEAD recorded by gate-start.mjs). Exit 2 sends the report
//              back to Claude as the next instruction.
//   --staged   git pre-commit hook (.githooks/pre-commit): checks what is being
//              committed (git diff --cached). Exit 1 blocks the commit. Works for every
//              committer: cloud agents, terminal, the desktop Code tab.
// Checks:
//   1. no forbidden names (from .claude/gate-names.local) in added lines
//   2. no hardcoded hex colors in added component code (use tokens)
//   3. TypeScript compiles (packages/theya-shadcn), if .ts/.tsx changed there
//   4. spec/ and llms*.txt are up to date, if components changed
// Escape hatches for a deliberate exception, on the same line:
//   gate-allow-hex   gate-allow-name
import { readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { join, extname } from 'node:path';
import { createHash } from 'node:crypto';

const STAGED = process.argv.includes('--staged');

// In pre-commit mode stdin is the terminal, not hook JSON: never read it there.
let input = {};
if (!STAGED) {
  try { input = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch {}
}
const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const sid = input.session_id || 'default';
const gateDir = join(root, '.claude', '.gate');
mkdirSync(gateDir, { recursive: true });

// Pre-commit runs leave a trace, so it's visible that commits really go through the gate.
const logCommit = (result) => {
  if (!STAGED) return;
  try {
    const line = `${new Date().toISOString()}  ${result}  ${process.env.GIT_AUTHOR_NAME || ''}\n`;
    writeFileSync(join(gateDir, 'commits.log'), line, { flag: 'a' });
  } catch {}
};

const git = (args) =>
  execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

// --- what changed in this session -------------------------------------------
let base = 'HEAD';
const baseFile = join(gateDir, `${sid}.base`);
if (existsSync(baseFile)) base = readFileSync(baseFile, 'utf8').trim() || 'HEAD';
try { git(['cat-file', '-e', `${base}^{commit}`]); } catch { base = 'HEAD'; }

let tracked = [], untracked = [];
try {
  if (STAGED) {
    tracked = git(['diff', '--cached', '--name-only', '--diff-filter=ACMR']).split('\n').filter(Boolean);
  } else {
    tracked = git(['diff', '--name-only', base]).split('\n').filter(Boolean);
    untracked = git(['ls-files', '--others', '--exclude-standard']).split('\n').filter(Boolean);
  }
} catch {
  process.exit(0); // not a git repo: nothing to gate
}

const TEXT_EXT = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.css', '.json', '.md', '.mdx', '.html', '.yml', '.yaml', '.txt']);
const SKIP = [
  /^\.claude\//, /(^|\/)node_modules\//, /(^|\/)build\//, /(^|\/)storybook-static\//,
  /^packages\/theya-shadcn\/(spec|api)\//, /\/public\/llms(-full)?\.txt$/,
  /CHANGELOG\.md$/, /THIRD-PARTY-NOTICES\.md$/, /pnpm-lock\.yaml$/,
];
const relevant = (f) => TEXT_EXT.has(extname(f)) && !SKIP.some((re) => re.test(f)) && existsSync(join(root, f));

const files = [...new Set([...tracked, ...untracked])].filter(relevant);
if (files.length === 0) { logCommit('pass (nothing to check)'); process.exit(0); }

// Added lines per file: [{ file, line, text }]
function addedLines(file) {
  if (untracked.includes(file)) {
    return readFileSync(join(root, file), 'utf8').split('\n').map((text, i) => ({ file, line: i + 1, text }));
  }
  const out = [];
  let line = 0;
  const diffArgs = STAGED ? ['diff', '--cached', '-U0', '--', file] : ['diff', '-U0', base, '--', file];
  for (const row of git(diffArgs).split('\n')) {
    const hunk = row.match(/^@@ -\d+(?:,\d+)? \+(\d+)/);
    if (hunk) { line = Number(hunk[1]); continue; }
    if (row.startsWith('+') && !row.startsWith('+++')) { out.push({ file, line, text: row.slice(1) }); line++; }
  }
  return out;
}

const problems = [];
const added = files.flatMap(addedLines);

// 1. Names that must never appear in the repo (Theya standing rule).
// The list lives in .claude/gate-names.local (one name per line, gitignored),
// so the forbidden names themselves never land in the public repo.
const namesFile = join(root, '.claude', 'gate-names.local');
const names = existsSync(namesFile)
  ? readFileSync(namesFile, 'utf8').split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#'))
  : [];
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const NAME_RE = names.length ? new RegExp(`\\b(${names.map(escapeRe).join('|')})\\b`, 'i') : null;
for (const a of added) {
  if (NAME_RE && NAME_RE.test(a.text) && !a.text.includes('gate-allow-name')) {
    problems.push(`[name] ${a.file}:${a.line} mentions "${a.text.match(NAME_RE)[0]}". Use a neutral name.`);
  }
}

// 2. Hardcoded hex colors in component code: use semantic tokens instead.
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/;
const HEX_SCOPE = /^packages\/theya-shadcn\/src\/.*\.(tsx?|css)$/;
const HEX_ALLOWED_FILE = /(\.stories\.tsx|\.guidelines\.tsx|\.test\.tsx?)$|\/(color-picker|color-field|swatch-picker)\./;
for (const a of added) {
  if (HEX_SCOPE.test(a.file) && !HEX_ALLOWED_FILE.test(a.file) && HEX_RE.test(a.text) && !a.text.includes('gate-allow-hex')) {
    problems.push(`[hex] ${a.file}:${a.line} hardcodes ${a.text.match(HEX_RE)[0]}. Use a token (var(--color-…)).`);
  }
}

// 3 + 4. Only when the component package changed.
const pkg = join(root, 'packages', 'theya-shadcn');
const tsChanged = files.some((f) => /^packages\/theya-shadcn\/.*\.tsx?$/.test(f));
const componentsChanged = files.some((f) => /^packages\/theya-shadcn\/src\/components\//.test(f));

const tail = (s, n) => s.trim().split('\n').slice(0, n).join('\n');

if (tsChanged && existsSync(join(pkg, 'node_modules', '.bin', 'tsc'))) {
  const r = spawnSync(join(pkg, 'node_modules', '.bin', 'tsc'), ['--noEmit', '-p', 'tsconfig.json'], { cwd: pkg, encoding: 'utf8' });
  if (r.status !== 0) {
    problems.push(`[tsc] TypeScript errors in packages/theya-shadcn (may include other changes in the working tree):\n${tail(r.stdout + r.stderr, 30)}`);
  }
}

if (componentsChanged && existsSync(join(pkg, 'scripts', 'build-spec.mjs'))) {
  const r = spawnSync(process.execPath, ['scripts/build-spec.mjs', '--check'], { cwd: pkg, encoding: 'utf8' });
  if (r.status !== 0) {
    problems.push(`[spec] spec/ or llms*.txt are stale. Run: pnpm --filter @theya/shadcn spec, and commit the result.\n${tail(r.stdout + r.stderr, 10)}`);
  }
}

// --- verdict -----------------------------------------------------------------
const lastFile = join(gateDir, `${sid}.last`);
if (problems.length === 0) {
  logCommit(`pass (${files.length} files)`);
  rmSync(lastFile, { force: true });
  process.exit(0);
}

const report = problems.slice(0, 40).join('\n') + (problems.length > 40 ? `\n…and ${problems.length - 40} more` : '');

if (STAGED) {
  logCommit(`BLOCKED (${problems.length} problems)`);
  // tsc and spec checks read the working tree, so a fix must also be re-staged.
  process.stderr.write(`Commit blocked by the Theya quality gate. Fix these, re-stage (git add) and commit again:\n${report}\n`);
  process.exit(1);
}
const hash = createHash('sha1').update(report).digest('hex');

// Same failures as the previous block, after Claude already tried again: let it stop
// instead of looping. The issues stay visible in the next turn's gate run.
if (input.stop_hook_active && existsSync(lastFile) && readFileSync(lastFile, 'utf8') === hash) {
  process.exit(0);
}
writeFileSync(lastFile, hash);
process.stderr.write(`Theya quality gate failed. Fix these before finishing (or tell the user why one is intentional):\n${report}\n`);
process.exit(2);
