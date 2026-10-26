#!/usr/bin/env node
/**
 * One working copy per agent, so parallel agents never share a working tree
 * (and one agent's uncommitted files never end up in another's commit).
 *
 *   node scripts/agents.mjs new <name>     copy ../theya-agents/<name> on branch agent/<name>, from main
 *   node scripts/agents.mjs land <name>    rebase agent/<name> on main, regenerate spec, fast-forward main
 *   node scripts/agents.mjs list           the copies and how far each branch is from main
 *   node scripts/agents.mjs relink <name>  re-create node_modules links (after `pnpm install` in the main checkout)
 *   node scripts/agents.mjs remove <name>  delete a copy whose branch is landed
 *
 * Run it from the main checkout or from any copy. The main checkout stays on
 * main and nobody edits files in it: it is where agent branches land and
 * where the push to GitHub starts.
 *
 * Why clones and not `git worktree`: a worktree stores absolute paths in
 * .git, and every agent session mounts this folder at a different absolute
 * path (and the Mac at yet another), so a worktree made in one session is
 * broken in the next. A clone only knows its main checkout by the relative
 * path ../../theya-design-system (remote "local"). The repository is ~20 MB.
 *
 * node_modules are not installed again per copy. The root node_modules is a
 * relative symlink to the main checkout's; each package gets its own
 * node_modules folder that re-creates the main checkout's links with the same
 * relative targets, so the workspace links (@theya/tokens -> ../../../tokens)
 * point at the copy's own packages and everything else at the shared .pnpm
 * store. Gitignored files the quality gate needs (.claude/gate-names.local,
 * .claude/settings.local.json) are symlinked the same way.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const git = (args, cwd) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: 'inherit' });
const die = (msg) => {
  console.error(`agents: ${msg}`);
  process.exit(1);
};

const MAIN_NAME = 'theya-design-system';
const AGENTS_DIR = 'theya-agents';
const PACKAGES = ['packages/tokens', 'packages/theya-shadcn', 'apps/sandbox'];
const LOCAL_FILES = ['.claude/gate-names.local', '.claude/settings.local.json'];

// Find the main checkout from wherever the script runs.
const top = git(['rev-parse', '--show-toplevel'], process.cwd());
const MAIN = path.basename(top) === MAIN_NAME ? top : path.resolve(top, '../..', MAIN_NAME);
if (!fs.existsSync(path.join(MAIN, '.git'))) die(`main checkout not found at ${MAIN}`);
const ROOT = path.join(path.dirname(MAIN), AGENTS_DIR);
const REL_MAIN = path.join('..', '..', MAIN_NAME); // from a copy to the main checkout

const [cmd, name] = process.argv.slice(2);
const target = () => {
  if (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name)) die('give a name: lowercase letters, digits and hyphens (e.g. kbd-tests)');
  return { dir: path.join(ROOT, name), branch: `agent/${name}`, rel: path.join('..', AGENTS_DIR, name) };
};

/** Plain recursive copy (fs.cpSync trips over permissions on the shared folder). */
function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isSymbolicLink()) fs.symlinkSync(fs.readlinkSync(src), dst);
    else if (entry.isDirectory()) copyDir(src, dst);
    else {
      fs.copyFileSync(src, dst);
      fs.chmodSync(dst, fs.statSync(src).mode & 0o777);
    }
  }
}

/** Re-create `from`'s node_modules links inside `to`, keeping each link's relative target. */
function mirrorNodeModules(from, to) {
  if (!fs.existsSync(from)) return;
  fs.rmSync(to, { recursive: true, force: true });
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.name === '.cache') continue; // per-checkout build caches
    if (entry.isSymbolicLink()) fs.symlinkSync(fs.readlinkSync(src), dst);
    else if (entry.isDirectory() && entry.name.startsWith('@')) mirrorNodeModules(src, dst);
    else if (entry.isDirectory()) copyDir(src, dst); // .bin
    else fs.copyFileSync(src, dst); // .modules.yaml
  }
}

function relink(dir) {
  const rootNm = path.join(dir, 'node_modules');
  fs.rmSync(rootNm, { recursive: true, force: true });
  fs.symlinkSync(path.join(REL_MAIN, 'node_modules'), rootNm);
  for (const pkg of PACKAGES) mirrorNodeModules(path.join(MAIN, pkg, 'node_modules'), path.join(dir, pkg, 'node_modules'));
  for (const f of LOCAL_FILES) {
    const dst = path.join(dir, f);
    if (!fs.existsSync(path.join(MAIN, f)) || fs.existsSync(dst)) continue;
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.symlinkSync(path.relative(path.dirname(dst), path.join(dir, REL_MAIN, f)), dst);
  }
}

const clean = (dir) => git(['status', '--porcelain', '--untracked-files=no'], dir) === '';
const count = (range, dir) => Number(git(['rev-list', '--count', range], dir));

switch (cmd) {
  case 'new': {
    const { dir, branch } = target();
    if (fs.existsSync(dir)) die(`${dir} already exists`);
    fs.mkdirSync(ROOT, { recursive: true });
    git(['clone', '-q', '--no-hardlinks', '--origin', 'local', '--branch', 'main', path.join('..', MAIN_NAME), name], ROOT);
    git(['remote', 'set-url', 'local', REL_MAIN], dir);
    git(['config', 'core.hooksPath', '.githooks'], dir);
    // Same author as the main checkout, so commits look the same wherever they were made.
    for (const key of ['user.name', 'user.email']) {
      try {
        git(['config', key, git(['config', key], MAIN)], dir);
      } catch {}
    }
    git(['switch', '-q', '-c', branch], dir);
    relink(dir);
    run('npm', ['run', '--silent', 'build'], path.join(dir, 'packages/tokens'));
    console.log(`\nReady: ${dir}\nBranch: ${branch}\nWork and commit there, then: node scripts/agents.mjs land ${name}`);
    break;
  }
  case 'relink': {
    const { dir } = target();
    relink(dir);
    console.log(`Relinked node_modules in ${dir}`);
    break;
  }
  case 'land': {
    const { dir, branch, rel } = target();
    if (!fs.existsSync(dir)) die(`no copy at ${dir}`);
    if (!clean(dir)) die(`${name} has uncommitted changes: commit them first`);
    if (!clean(MAIN)) die(`the main checkout has uncommitted changes (${MAIN}): nobody should edit there; commit or move them first`);
    if (git(['rev-parse', '--abbrev-ref', 'HEAD'], MAIN) !== 'main') die('the main checkout is not on main');
    if (git(['rev-parse', '--abbrev-ref', 'HEAD'], dir) !== branch) die(`${dir} is not on ${branch}`);
    git(['fetch', '-q', 'local', 'main'], dir);
    if (count('local/main..HEAD', dir) === 0) die(`${branch} has nothing to land`);
    try {
      git(['rebase', '-q', 'local/main'], dir);
    } catch (e) {
      die(`rebase on main stopped on a conflict. Resolve it in ${dir} (git status), git rebase --continue, then land again.\n${e.stderr ?? ''}`);
    }
    // Generated files (spec/, api/, llms*.txt, the a11y matrix) are rebuilt
    // from the rebased sources, so two agents' regenerations never need a
    // hand-merged conflict.
    run('npm', ['run', '--silent', 'build'], path.join(dir, 'packages/tokens'));
    for (const s of ['build-spec', 'build-api', 'build-a11y']) run('node', [`scripts/${s}.mjs`], path.join(dir, 'packages/theya-shadcn'));
    if (!clean(dir)) {
      git(['add', '-u'], dir);
      git(['commit', '-q', '-m', 'chore(spec): regenerate after rebase on main'], dir);
    }
    git(['fetch', '-q', rel, branch], MAIN);
    git(['merge', '--ff-only', '-q', 'FETCH_HEAD'], MAIN);
    git(['fetch', '-q', 'local', 'main'], dir);
    console.log(`Landed ${branch}: main is now ${git(['log', '--oneline', '-1', 'main'], MAIN)}`);
    try {
      console.log(`main is ${count('origin/main..main', MAIN)} commit(s) ahead of origin/main`);
    } catch {}
    break;
  }
  case 'list': {
    if (!fs.existsSync(ROOT)) {
      console.log('No agent copies yet.');
      break;
    }
    for (const n of fs.readdirSync(ROOT).sort()) {
      const dir = path.join(ROOT, n);
      if (!fs.existsSync(path.join(dir, '.git'))) continue;
      git(['fetch', '-q', 'local', 'main'], dir);
      const br = git(['rev-parse', '--abbrev-ref', 'HEAD'], dir);
      const state = `+${count('local/main..HEAD', dir)} / -${count('HEAD..local/main', dir)} vs main${clean(dir) ? '' : ', uncommitted changes'}`;
      console.log(`${n.padEnd(20)} ${br.padEnd(28)} ${state}`);
    }
    break;
  }
  case 'remove': {
    const { dir } = target();
    if (!fs.existsSync(dir)) die(`no copy at ${dir}`);
    if (!clean(dir)) die(`${name} has uncommitted changes`);
    git(['fetch', '-q', 'local', 'main'], dir);
    const left = count('local/main..HEAD', dir);
    if (left > 0) die(`${name} has ${left} commit(s) not on main: land it first`);
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`Removed ${dir}`);
    break;
  }
  default:
    die('usage: node scripts/agents.mjs new|land|list|relink|remove <name>');
}
