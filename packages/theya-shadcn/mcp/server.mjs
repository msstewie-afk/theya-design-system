#!/usr/bin/env node
/**
 * Theya MCP server — lets coding agents build UI from Theya instead of raw
 * shadcn/ui: find the right component, read its guidelines and props, and
 * look up design tokens.
 *
 * Zero dependencies: speaks MCP (JSON-RPC 2.0, newline-delimited) over
 * stdio directly, so it runs with plain `node` and nothing to install.
 *
 * Data comes from files generated from the sources, never written here:
 * - components: spec/index.json + spec/components/*.json (`pnpm spec`);
 * - tokens: @theya/tokens semantic sources (names, aliases) and its
 *   build/css output (resolved light/dark values, `pnpm build:tokens`).
 *
 * Wire-up for Claude Code: `.mcp.json` at the repo root. Any other MCP
 * client: command `node packages/theya-shadcn/mcp/server.mjs`.
 */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SPEC = path.join(PKG_ROOT, 'spec');
const TOKENS = path.resolve(PKG_ROOT, '../tokens');
const SERVER = { name: 'theya', version: JSON.parse(fs.readFileSync(path.join(PKG_ROOT, 'package.json'), 'utf8')).version };
const PROTOCOLS = ['2025-06-18', '2025-03-26', '2024-11-05'];

/* ------------------------------------------------------------------ */
/* Data (read lazily, re-read when the files change)                   */
/* ------------------------------------------------------------------ */

const cache = new Map();
function readJson(file) {
  const mtime = fs.statSync(file).mtimeMs;
  const hit = cache.get(file);
  if (hit && hit.mtime === mtime) return hit.value;
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  cache.set(file, { mtime, value });
  return value;
}

function index() {
  const file = path.join(SPEC, 'index.json');
  if (!fs.existsSync(file)) throw new Error('spec/index.json is missing — run `pnpm spec` in packages/theya-shadcn.');
  return readJson(file);
}

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

function findComponent(name) {
  const key = norm(name);
  const list = index().components;
  return list.find((c) => norm(c.name) === key) ?? list.find((c) => norm(c.file.replace(/^ui\//, '')) === key);
}

function record(entry) {
  const { $comment, ...rest } = readJson(path.join(PKG_ROOT, entry.spec));
  return rest;
}

/** Semantic tokens: name, alias and resolved light/dark values. */
function tokens() {
  const files = ['color.default.json', 'size.json', 'typography.json'].map((f) => path.join(TOKENS, 'src/semantic', f));
  const dark = path.join(TOKENS, 'src/semantic/color.dark.json');
  const out = new Map();
  const walk = (node, trail, theme) => {
    if (node && typeof node === 'object' && 'value' in node && typeof node.value !== 'object') {
      const name = `--${trail.join('-')}`;
      const t = out.get(name) ?? { name, group: trail[0] };
      t[theme === 'dark' ? 'darkAlias' : 'alias'] = String(node.value);
      if (node.description || node.comment) t.description = node.description ?? node.comment;
      out.set(name, t);
      return;
    }
    if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) walk(v, [...trail, k], theme);
  };
  for (const f of files) if (fs.existsSync(f)) walk(readJson(f), [], 'light');
  if (fs.existsSync(dark)) walk(readJson(dark), [], 'dark');

  // Resolved values from the built CSS, when the tokens package was built.
  const css = (f) => {
    const map = new Map();
    if (!fs.existsSync(f)) return map;
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/^\s*(--[\w-]+):\s*([^;]+);/gm)) map.set(m[1], m[2].trim());
    return map;
  };
  const light = css(path.join(TOKENS, 'build/css/variables.css'));
  const darkCss = css(path.join(TOKENS, 'build/css/variables-dark.css'));
  for (const t of out.values()) {
    if (light.has(t.name)) t.light = light.get(t.name);
    if (darkCss.has(t.name) && darkCss.get(t.name) !== light.get(t.name)) t.dark = darkCss.get(t.name);
    if (t.darkAlias === t.alias) delete t.darkAlias;
  }
  return { list: [...out.values()], built: light.size > 0 };
}

/* ------------------------------------------------------------------ */
/* Tools                                                               */
/* ------------------------------------------------------------------ */

const text = (value) => ({ content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }] });

// Word-level matching with a crude stem, so "plans" finds "plan" and
// "pick" doesn't match inside "DatePicker".
const STOP = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'show', 'some', 'want', 'need', 'use', 'make', 'how', 'can']);
const stem = (w) => w.replace(/(ies)$/, 'y').replace(/(ing|ed|es|s)$/, '');
const wordsOf = (s) =>
  s
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map(stem);

function score(c, rec, query) {
  const fields = [
    [wordsOf(c.name), 6],
    [wordsOf(c.category ?? ''), 2],
    [wordsOf(rec.whenToUse.join(' ')), 3],
    [wordsOf(rec.description ?? ''), 2],
    [wordsOf(rec.anatomy.map((a) => a.part + ' ' + a.description).join(' ')), 1],
    [wordsOf(rec.whenNotToUse.map((w) => w.text).join(' ')), -2], // a match here argues *against* this one
  ].map(([w, weight]) => [new Set(w), weight]);
  let s = 0;
  for (const w of query) for (const [set, weight] of fields) if (set.has(w)) s += weight;
  return s;
}

const TOOLS = [
  {
    name: 'list_components',
    description:
      'List Theya components with category, status and a one-line "when to use". Start here to see what exists before writing UI; prefer a Theya component over raw shadcn/ui or hand-written markup.',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Storybook category, e.g. "Actions", "Data", "Overlays".' },
        status: { type: 'string', enum: ['stable', 'beta', 'deprecated'] },
      },
    },
    run({ category, status } = {}) {
      const list = index().components.filter(
        (c) => (!category || norm(c.category ?? '') === norm(category)) && (!status || c.status === status),
      );
      return text(list.map(({ name, category: cat, status: st, summary, file }) => ({ name, category: cat, status: st, summary, import: `@theya/shadcn/${file}` })));
    },
  },
  {
    name: 'search_components',
    description:
      'Find the Theya component for a need, in plain words ("pick one of three plans", "show a long-running task", "confirm a destructive action"). Returns the best matches with their when-to-use lines and the components their guidelines say to use instead.',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string' }, limit: { type: 'number', default: 5 } },
      required: ['query'],
    },
    run({ query, limit = 5 }) {
      const words = wordsOf(query);
      const ranked = index()
        .components.map((c) => {
          const rec = record(c);
          return { c, rec, s: score(c, rec, words) };
        })
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, limit);
      if (!ranked.length) return text(`No component matches "${query}". Call list_components to browse by category.`);
      return text(
        ranked.map(({ c, rec }) => ({
          name: c.name,
          status: c.status,
          whenToUse: rec.whenToUse,
          whenNotToUse: rec.whenNotToUse,
          import: rec.import,
        })),
      );
    },
  },
  {
    name: 'get_component',
    description:
      'Full spec of one Theya component: import line, when to use / not (and what instead), anatomy, every prop with type, allowed values and default, do/don’t examples as TSX, accessibility rules and Storybook links. Read this before using a component.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Component name (Button, DataTable) or file name (data-table).' },
        sections: {
          type: 'array',
          items: { type: 'string', enum: ['guidelines', 'props', 'examples', 'a11y', 'storybook'] },
          description: 'Limit the answer to these parts; omit for everything.',
        },
      },
      required: ['name'],
    },
    run({ name, sections }) {
      const entry = findComponent(name);
      if (!entry) {
        const close = index().components.filter((c) => norm(c.name).includes(norm(name)) || norm(name).includes(norm(c.name))).map((c) => c.name);
        return { ...text(`Theya has no component "${name}".${close.length ? ` Did you mean: ${close.join(', ')}?` : ' Call search_components with what you need it for.'}`), isError: true };
      }
      const r = record(entry);
      if (!sections?.length) return text(r);
      const pick = { name: r.name, import: r.import, status: r.status };
      if (sections.includes('guidelines')) Object.assign(pick, { whenToUse: r.whenToUse, whenNotToUse: r.whenNotToUse, anatomy: r.anatomy });
      if (sections.includes('props')) Object.assign(pick, { components: r.components, inherits: r.inherits });
      if (sections.includes('examples')) pick.doDont = r.doDont;
      if (sections.includes('a11y')) pick.a11y = r.a11y;
      if (sections.includes('storybook')) pick.storybook = r.storybook;
      return text(pick);
    },
  },
  {
    name: 'get_tokens',
    description:
      'Theya semantic design tokens as CSS variables (use as var(--name) in Tailwind arbitrary values, e.g. text-[var(--color-text-text)]), with their alias and resolved light/dark values. Use these instead of hex colors, Tailwind palette colors or raw pixel sizes.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Substring of the token name, e.g. "text-danger", "border", "radius".' },
        group: { type: 'string', enum: ['color', 'size', 'typography'] },
        limit: { type: 'number', default: 60 },
      },
    },
    run({ query, group, limit = 60 } = {}) {
      const { list, built } = tokens();
      const q = query?.toLowerCase();
      const hits = list.filter((t) => (!group || t.group === group) && (!q || t.name.includes(q)));
      const note = built ? '' : ' (resolved values missing — run `pnpm build:tokens` at the repo root)';
      return text({ total: hits.length, shown: Math.min(hits.length, limit), note: note || undefined, tokens: hits.slice(0, limit) });
    },
  },
];

/* ------------------------------------------------------------------ */
/* JSON-RPC over stdio                                                 */
/* ------------------------------------------------------------------ */

const send = (msg) => process.stdout.write(JSON.stringify({ jsonrpc: '2.0', ...msg }) + '\n');

function handle(msg) {
  const { id, method, params } = msg;
  const reply = (result) => id !== undefined && send({ id, result });
  const fail = (code, message) => id !== undefined && send({ id, error: { code, message } });

  switch (method) {
    case 'initialize': {
      const asked = params?.protocolVersion;
      return reply({
        protocolVersion: PROTOCOLS.includes(asked) ? asked : PROTOCOLS[0],
        capabilities: { tools: {} },
        serverInfo: SERVER,
        instructions:
          'Theya is the design system for this repo. Before writing UI, find components with search_components or list_components, read get_component for the one you pick (its whenNotToUse names better alternatives), and style with get_tokens values — never hard-coded colors.',
      });
    }
    case 'notifications/initialized':
    case 'notifications/cancelled':
      return;
    case 'ping':
      return reply({});
    case 'tools/list':
      return reply({ tools: TOOLS.map(({ run, ...t }) => t) });
    case 'tools/call': {
      const tool = TOOLS.find((t) => t.name === params?.name);
      if (!tool) return fail(-32602, `Unknown tool: ${params?.name}`);
      try {
        return reply(tool.run(params.arguments ?? {}));
      } catch (err) {
        return reply({ ...text(String(err?.message ?? err)), isError: true });
      }
    }
    default:
      if (id !== undefined) return fail(-32601, `Method not found: ${method}`);
  }
}

readline.createInterface({ input: process.stdin }).on('line', (line) => {
  if (!line.trim()) return;
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    return send({ id: null, error: { code: -32700, message: 'Parse error' } });
  }
  for (const m of Array.isArray(msg) ? msg : [msg]) handle(m);
});
