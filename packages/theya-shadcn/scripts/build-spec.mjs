#!/usr/bin/env node
/**
 * Builds the machine-readable component spec and llms.txt from the
 * library's own sources — nothing here is written by hand:
 *
 * - use-guidelines: `src/components/ui/<name>.guidelines.tsx` (parsed as
 *   TypeScript, not executed — so no DOM, CSS or bundler is needed);
 * - props: the component's TypeScript types via react-docgen-typescript
 *   (defaults come from destructuring defaults in the component);
 * - Storybook location: the `title` and story exports of `<name>.stories.tsx`.
 *
 * Output (generated, committed, don't edit by hand — run `pnpm spec`):
 * - spec/index.json            — one line per component, for search/routing;
 * - spec/components/<name>.json — the full record for one component;
 * - public/llms.txt            — llmstxt.org index, served by Storybook at /llms.txt;
 * - public/llms-full.txt       — every component in one Markdown file.
 *
 * `--check` builds in memory and exits 1 if any output file is stale
 * (for CI).
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const docgen = require('react-docgen-typescript');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UI = path.join(ROOT, 'src/components/ui');
const PKG = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const CHECK = process.argv.includes('--check');

const pascal = (kebab) => kebab.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
// Storybook's id sanitizer: lower case, every run of other characters → "-".
const sbId = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
// Story ids come from the export name split into words (lodash startCase in
// Storybook): case changes and letter/digit boundaries start a new word.
const storyId = (exportName) =>
  sbId(
    exportName
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
      .replace(/([A-Za-z])([0-9])/g, '$1-$2')
      .replace(/([0-9])([A-Za-z])/g, '$1-$2'),
  );

/* ------------------------------------------------------------------ */
/* Guidelines: TS AST → plain data                                     */
/* ------------------------------------------------------------------ */

function parseFile(file) {
  return ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

/** Top-level `const X = …` initializers, to resolve identifiers used in guidelines. */
function localConsts(sf) {
  const map = new Map();
  for (const st of sf.statements) {
    if (!ts.isVariableStatement(st)) continue;
    for (const d of st.declarationList.declarations) {
      if (ts.isIdentifier(d.name) && d.initializer) map.set(d.name.text, d.initializer);
    }
  }
  return map;
}

const unwrap = (n) => {
  while (n && (ts.isParenthesizedExpression(n) || ts.isAsExpression(n) || ts.isSatisfiesExpression?.(n))) n = n.expression;
  return n;
};

function jsxTagName(n) {
  const el = ts.isJsxElement(n) ? n.openingElement : n;
  return el.tagName.getText();
}

/** JSX text the way React renders it: lines trimmed, blank lines dropped. */
function jsxText(raw) {
  if (!raw.includes('\n')) return raw;
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join(' ');
}

/** A ReactNode written in a guideline → Markdown-ish plain text (`<C>` → backticks). */
function toText(node, ctx, depth = 0) {
  node = unwrap(node);
  if (!node || depth > 8) return '';
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isJsxText(node)) return jsxText(node.text);
  if (ts.isJsxExpression(node)) return node.expression ? toText(node.expression, ctx, depth + 1) : '';
  if (ts.isJsxFragment(node)) return node.children.map((c) => toText(c, ctx, depth + 1)).join('');
  if (ts.isJsxElement(node)) {
    const inner = node.children.map((c) => toText(c, ctx, depth + 1)).join('');
    const tag = jsxTagName(node);
    if (tag === 'C' || tag === 'code') return '`' + inner + '`';
    if (tag === 'strong' || tag === 'b') return '**' + inner + '**';
    if (tag === 'em' || tag === 'i') return '_' + inner + '_';
    return inner;
  }
  if (ts.isJsxSelfClosingElement(node)) return '';
  if (ts.isIdentifier(node) && ctx.consts.has(node.text)) return toText(ctx.consts.get(node.text), ctx, depth + 1);
  if (ts.isNumericLiteral(node)) return node.text;
  return node.getText(ctx.sf);
}

/** Source of a JSX example, dedented, for do/don't pairs. */
function toCode(node, ctx) {
  node = unwrap(node);
  if (!node) return undefined;
  const text = node.getText(ctx.sf);
  const lines = text.split('\n');
  const indent = Math.min(...lines.slice(1).filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length), Infinity);
  return [lines[0], ...lines.slice(1).map((l) => (Number.isFinite(indent) ? l.slice(indent) : l))].join('\n');
}

function props(obj) {
  const out = {};
  if (!obj || !ts.isObjectLiteralExpression(obj)) return out;
  for (const p of obj.properties) {
    if (ts.isPropertyAssignment(p)) out[p.name.getText().replace(/^['"]|['"]$/g, '')] = p.initializer;
    else if (ts.isShorthandPropertyAssignment(p)) out[p.name.text] = p.name;
  }
  return out;
}

const arr = (n, ctx) => {
  n = unwrap(n);
  if (n && ts.isIdentifier(n) && ctx.consts.has(n.text)) n = unwrap(ctx.consts.get(n.text));
  return n && ts.isArrayLiteralExpression(n) ? n.elements : [];
};

function readGuidelines(file) {
  const sf = parseFile(file);
  const ctx = { sf, consts: localConsts(sf) };
  const found = [];
  for (const st of sf.statements) {
    if (!ts.isVariableStatement(st) || !st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const d of st.declarationList.declarations) {
      if (!d.type || d.type.getText(sf) !== 'ComponentGuidelines') continue;
      const g = props(unwrap(d.initializer));
      found.push({
        exportName: d.name.getText(sf),
        status: g.status ? toText(g.status, ctx) : 'stable',
        replacement: g.replacement ? toText(g.replacement, ctx) : undefined,
        whenToUse: arr(g.whenToUse, ctx).map((n) => toText(n, ctx)),
        whenNotToUse: arr(g.whenNotToUse, ctx).map((n) => {
          const o = props(unwrap(n));
          return { text: toText(o.text, ctx), ...(o.instead ? { instead: toText(o.instead, ctx) } : {}) };
        }),
        anatomy: arr(g.anatomy, ctx).map((n) => {
          const o = props(unwrap(n));
          return {
            part: toText(o.part, ctx),
            description: toText(o.description, ctx),
            ...(o.optional && o.optional.kind === ts.SyntaxKind.TrueKeyword ? { optional: true } : {}),
          };
        }),
        doDont: arr(g.doDont, ctx).map((n) => {
          const pair = props(unwrap(n));
          const side = (s) => {
            const o = props(unwrap(s));
            return { caption: toText(o.caption, ctx), example: toCode(o.example, ctx) };
          };
          return { do: side(pair.do), dont: side(pair.dont) };
        }),
        a11y: arr(g.a11y, ctx).map((n) => toText(n, ctx)),
      });
    }
  }
  return found;
}

/* ------------------------------------------------------------------ */
/* Stories: title + story names                                        */
/* ------------------------------------------------------------------ */

function readStories(file) {
  if (!fs.existsSync(file)) return null;
  const sf = parseFile(file);
  let metaObj;
  const stories = [];
  for (const st of sf.statements) {
    if (ts.isVariableStatement(st)) {
      const exported = st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      for (const d of st.declarationList.declarations) {
        if (!ts.isIdentifier(d.name)) continue;
        if (d.name.text === 'meta') metaObj = unwrap(d.initializer);
        else if (exported) stories.push(d.name.text);
      }
    } else if (ts.isExportAssignment(st) && !metaObj) {
      const e = unwrap(st.expression);
      if (ts.isObjectLiteralExpression(e)) metaObj = e;
    }
  }
  const title = metaObj && props(metaObj).title;
  if (!title) return null;
  const t = unwrap(title).text;
  const id = sbId(t);
  return {
    title: t,
    category: t.split('/')[0],
    docs: `?path=/docs/${id}--docs`,
    stories: stories.map((s) => ({ name: s, id: `${id}--${storyId(s)}` })),
  };
}

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

const fromNodeModules = (f) => f.includes('/node_modules/');

const parser = docgen.withCustomConfig(path.join(ROOT, 'tsconfig.json'), {
  savePropValueAsString: true,
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  shouldIncludePropTagMap: true,
  // No propFilter: inherited DOM/Radix props are needed to name what a
  // component extends; shapeComponent() keeps only the library's own.
});

function readProps(files) {
  const byFile = new Map();
  for (const doc of parser.parse(files)) {
    const list = byFile.get(doc.filePath) ?? [];
    list.push(doc);
    byFile.set(doc.filePath, list);
  }
  return byFile;
}

// React's own building blocks of every DOM props type — they say nothing
// a reader needs once the element-level type (HTMLAttributes…) is listed.
const INHERIT_NOISE = new Set(['Attributes', 'RefAttributes', 'AriaAttributes', 'DOMAttributes', 'TypeLiteral', 'ClassAttributes']);

/** Names of the third-party/DOM types a component's props come from. */
function inheritedFrom(doc) {
  const seen = new Set();
  for (const p of Object.values(doc.props)) {
    for (const d of p.declarations ?? []) if (fromNodeModules(d.fileName) && !INHERIT_NOISE.has(d.name)) seen.add(d.name);
  }
  return [...seen];
}

/** Exported value names of a module (components, helpers), from its AST. */
function exportedNames(file) {
  const sf = parseFile(file);
  const names = [];
  const isExported = (n) => n.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
  for (const st of sf.statements) {
    // Braces matter: without them the `else` below bound to the inner `if`
    // of the variable loop, and `export { A, B }` lists were never read.
    if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st)) && st.name && isExported(st)) {
      names.push(st.name.text);
    } else if (ts.isVariableStatement(st) && isExported(st)) {
      for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name)) names.push(d.name.text);
    } else if (ts.isExportDeclaration(st) && st.exportClause && ts.isNamedExports(st.exportClause) && !st.isTypeOnly) {
      for (const e of st.exportClause.elements) if (!e.isTypeOnly) names.push(e.name.text);
    }
  }
  return { sf, names };
}

/**
 * Props for an imperative helper (e.g. `undoToast(options)`), which
 * react-docgen-typescript doesn't see: the members of `<Main>Options`
 * or `<Main>Props` declared in the same file.
 */
function optionsInterface(sf, main) {
  for (const st of sf.statements) {
    if (!ts.isInterfaceDeclaration(st) || ![`${main}Options`, `${main}Props`].includes(st.name.text)) continue;
    return st.members.filter(ts.isPropertySignature).map((m) => {
      const doc = ts.getJSDocCommentsAndTags(m).filter(ts.isJSDoc).map((d) => (typeof d.comment === 'string' ? d.comment : '')).join(' ').trim();
      return {
        name: m.name.getText(sf),
        type: m.type ? m.type.getText(sf).replace(/\s+/g, ' ') : 'unknown',
        required: !m.questionToken,
        ...(doc ? { description: doc } : {}),
      };
    });
  }
  return [];
}

const cleanType = (t) => (t ?? '').replace(/\s+/g, ' ').trim();

/* ------------------------------------------------------------------ */
/* Localized defaults                                                  */
/* ------------------------------------------------------------------ */

// Built-in strings default from the locale dictionary at render time
// (`if (dismissLabel === undefined) dismissLabel = t.alert.dismiss;`),
// which docgen can't see. Read those assignments from the source and show
// the English value, marked as localized.
const english = (() => {
  const src = fs.readFileSync(path.join(ROOT, 'src/lib/locale-en.ts'), 'utf8');
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', js)(require, mod, mod.exports);
  return mod.exports.en;
})();

function localizedDefaults(file) {
  if (!fs.existsSync(file)) return new Map();
  const src = fs.readFileSync(file, 'utf8');
  const map = new Map();
  for (const m of src.matchAll(/if \((\w+) === undefined\) \1 = t\.([\w.]+);/g)) map.set(m[1], m[2]);
  for (const m of src.matchAll(/^\s+(\w+) = t\.([\w.]+),$/gm)) map.set(m[1], m[2]);
  for (const m of src.matchAll(/const (\w+) = \1Prop \?\? t\.([\w.]+);/g)) map.set(m[1], m[2]);
  return map;
}

function withLocalizedDefaults(component, localized) {
  for (const p of component.props) {
    if (p.default !== undefined || !localized.has(p.name)) continue;
    const key = localized.get(p.name);
    const value = key.split('.').reduce((o, k) => o?.[k], english);
    p.default = typeof value === 'string' ? `${value} (localized: ${key})` : `localized: ${key}`;
  }
  return component;
}

function shapeComponent(doc) {
  const propsOut = Object.values(doc.props)
    .filter((p) => !p.declarations?.length || p.declarations.some((d) => !fromNodeModules(d.fileName)))
    .sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name))
    .map((p) => {
      const tags = p.tags ?? {};
      return {
        name: p.name,
        type: cleanType(p.type?.raw && p.type.raw.length < 200 ? p.type.raw : p.type?.name),
        ...(p.type?.value && Array.isArray(p.type.value) ? { values: p.type.value.map((v) => v.value.replace(/^"|"$/g, '')) } : {}),
        required: !!p.required,
        ...(p.defaultValue?.value !== undefined && p.defaultValue?.value !== null ? { default: String(p.defaultValue.value) } : {}),
        ...(p.description ? { description: p.description.trim() } : {}),
        ...(tags.deprecated !== undefined ? { deprecated: tags.deprecated || true } : {}),
      };
    });
  return {
    name: doc.displayName,
    ...(doc.description ? { description: doc.description.trim() } : {}),
    props: propsOut,
  };
}

/* ------------------------------------------------------------------ */
/* Build                                                               */
/* ------------------------------------------------------------------ */

const importProblems = [];

function build() {
  const names = fs
    .readdirSync(UI)
    .filter((f) => f.endsWith('.guidelines.tsx'))
    .map((f) => f.replace(/\.guidelines\.tsx$/, ''))
    .sort();

  const componentFiles = names.map((n) => path.join(UI, `${n}.tsx`)).filter((f) => fs.existsSync(f));
  const propsByFile = readProps(componentFiles);

  const records = [];
  for (const name of names) {
    const file = path.join(UI, `${name}.tsx`);
    const guidelinesList = readGuidelines(path.join(UI, `${name}.guidelines.tsx`));
    const story = readStories(path.join(UI, `${name}.stories.tsx`));
    const docs = (propsByFile.get(file) ?? []).filter((d) => /^[A-Z]/.test(d.displayName));

    for (const g of guidelinesList) {
      // `badgeGuidelines` → Badge; `toasterGuidelines` in sonner.guidelines → Toaster.
      const derived = pascal(g.exportName.replace(/Guidelines$/, '').replace(/^./, (c) => c.toLowerCase()).replace(/([A-Z])/g, '-$1').toLowerCase());
      const { sf: componentSf, names: exported } = fs.existsSync(file) ? exportedNames(file) : { sf: null, names: [] };
      // The guidelines name only gives the casing it was written with
      // (`textareaGuidelines` → Textarea); the component may be TextArea.
      // Prefer the export that matches it ignoring case.
      const main = exported.includes(derived) ? derived : (exported.find((n) => /^[A-Z]/.test(n) && n.toLowerCase() === derived.toLowerCase()) ?? derived);
      const ordered = [...docs].sort((a, b) => Number(b.displayName === main) - Number(a.displayName === main));
      const mainDoc = ordered.find((d) => d.displayName === main);
      // The name to import: the component itself, or its camelCase helper (undoToast).
      const camel = main[0].toLowerCase() + main.slice(1);
      const entry = exported.includes(main) ? main : exported.includes(camel) ? camel : main;
      // A family with no component of its own name (KebabIcon → KebabIconVertical,
      // KebabIconHorizontal; Resizable → ResizablePanelGroup…) imports its members.
      const family = exported.includes(entry) ? [] : exported.filter((n) => n.startsWith(main));
      const importNames = family.length
        ? family
        : [entry, ...ordered.map((d) => d.displayName).filter((n) => n !== main && n.startsWith(main) && exported.includes(n))];
      // The spec's import line is copied into products (and read by AI tools):
      // it must name only what the file really exports.
      const missing = componentSf ? importNames.filter((n) => !exported.includes(n)) : [];
      if (missing.length) importProblems.push(`ui/${name}: spec imports { ${missing.join(', ')} }, but the file exports ${exported.join(', ') || 'nothing'}`);
      const localized = localizedDefaults(file);
      const components = ordered.map((doc) => withLocalizedDefaults(shapeComponent(doc), localized));
      if (!components.length && componentSf) {
        const opts = optionsInterface(componentSf, main);
        if (opts.length) components.push({ name: entry, kind: 'function', props: opts });
      }
      records.push({
        name: main,
        file: `ui/${name}`,
        import: `import { ${importNames.join(', ')} } from '${PKG.name}/ui/${name}';`,
        status: g.status,
        ...(g.replacement ? { replacement: g.replacement } : {}),
        ...(story ? { category: story.category } : {}),
        ...(mainDoc?.description ? { description: mainDoc.description.trim() } : {}),
        whenToUse: g.whenToUse,
        whenNotToUse: g.whenNotToUse,
        anatomy: g.anatomy,
        doDont: g.doDont,
        a11y: g.a11y,
        components,
        inherits: [...new Set(ordered.flatMap(inheritedFrom))],
        ...(story ? { storybook: { title: story.title, docs: story.docs, stories: story.stories } } : {}),
      });
    }
  }
  return records;
}

/* ------------------------------------------------------------------ */
/* Renderers                                                           */
/* ------------------------------------------------------------------ */

/** One file per record; a second export of the same file (Toaster in sonner) gets its own name. */
const specPath = (r) => {
  const base = r.file.replace(/^ui\//, '');
  return `spec/components/${base}${r.name.toLowerCase() === pascal(base).toLowerCase() ? '' : '.' + r.name}.json`;
};

const GENERATED = 'Generated by scripts/build-spec.mjs from the component sources — do not edit by hand.';

function indexOf(records) {
  return {
    $comment: GENERATED,
    package: PKG.name,
    version: PKG.version,
    components: records.map((r) => ({
      name: r.name,
      file: r.file,
      category: r.category ?? null,
      status: r.status,
      summary: r.whenToUse[0] ?? '',
      instead: r.whenNotToUse.filter((w) => w.instead).map((w) => ({ when: w.text, use: w.instead })),
      spec: specPath(r),
    })),
  };
}

function propLine(p) {
  const bits = [`\`${p.name}${p.required ? '' : '?'}\`: \`${p.values ? p.values.map((v) => JSON.stringify(v)).join(' | ') : p.type}\``];
  if (p.default !== undefined) bits.push(`default \`${p.default}\``);
  if (p.deprecated) bits.push('**deprecated**');
  const desc = p.description ? ' — ' + p.description.split('\n')[0] : '';
  return `- ${bits.join(', ')}${desc}`;
}

function markdownOf(r) {
  const out = [`## ${r.name}`, '', `${r.import.replace(/^/, '`')}\``, ''];
  out.push(`Status: ${r.status}${r.replacement ? ` — use ${r.replacement} instead` : ''}${r.category ? ` · Category: ${r.category}` : ''}`);
  if (r.storybook) out.push(`Docs: ./${r.storybook.docs}`);
  out.push('');
  if (r.whenToUse.length) out.push('**When to use**', '', ...r.whenToUse.map((t) => `- ${t}`), '');
  if (r.whenNotToUse.length) out.push('**When not to use**', '', ...r.whenNotToUse.map((w) => `- ${w.text}${w.instead ? ` → use ${w.instead}` : ''}`), '');
  if (r.anatomy.length) out.push('**Anatomy**', '', ...r.anatomy.map((a) => `- ${a.part}${a.optional ? ' (optional)' : ''}: ${a.description}`), '');
  for (const c of r.components) {
    if (!c.props.length) continue;
    out.push(c.kind === 'function' ? `**${c.name}(options)**` : `**${c.name} props**`, '', ...c.props.map(propLine), '');
  }
  if (r.inherits.length) out.push(`Also accepts the props of: ${r.inherits.join(', ')}.`, '');
  if (r.doDont.length) {
    out.push('**Do / Don’t**', '');
    for (const p of r.doDont) {
      out.push(`- Do: ${p.do.caption}`);
      if (p.do.example) out.push('', '  ```tsx', ...p.do.example.split('\n').map((l) => '  ' + l), '  ```', '');
      out.push(`- Don’t: ${p.dont.caption}`);
      if (p.dont.example) out.push('', '  ```tsx', ...p.dont.example.split('\n').map((l) => '  ' + l), '  ```', '');
    }
    out.push('');
  }
  if (r.a11y.length) out.push('**Accessibility**', '', ...r.a11y.map((t) => `- ${t}`), '');
  return out.join('\n');
}

function llmsTxt(records) {
  const byCat = new Map();
  for (const r of records) {
    const k = r.category ?? 'Other';
    byCat.set(k, [...(byCat.get(k) ?? []), r]);
  }
  const out = [
    '# Theya',
    '',
    `> Theya is a React design system built on shadcn/ui (Radix + Tailwind v4). Package \`${PKG.name}\` v${PKG.version}, ${records.length} components, each with use-guidelines (when to use, when not and what instead, anatomy, do/don’t, accessibility) and typed props.`,
    '',
    'Rules for building UI with Theya:',
    '',
    `- Import each component from its own entry: \`import { Button } from '${PKG.name}/ui/button'\`. Use Theya components instead of raw shadcn/ui or hand-written equivalents.`,
    '- Before choosing a component, read its "When not to use" list: it names the component to use instead.',
    '- Colors, spacing, radii and type come from Theya tokens (CSS variables such as `var(--color-text-text)`); don’t hard-code hex values or Tailwind palette colors.',
    '- Status tones are `neutral | primary | success | warning | danger | info`; never carry meaning by color alone.',
    '- Icon-only controls need an `aria-label`; a tooltip doesn’t replace it.',
    '',
    `Full text of every component: [llms-full.txt](llms-full.txt). Machine-readable records live in the package: \`packages/theya-shadcn/spec/index.json\` and \`spec/components/<name>.json\`. Links below open each component’s Docs page in this Storybook.`,
    '',
  ];
  for (const [cat, list] of [...byCat].sort(([a], [b]) => a.localeCompare(b))) {
    out.push(`## ${cat}`, '');
    for (const r of list) out.push(`- [${r.name}](${r.storybook ? './' + r.storybook.docs : r.file})${r.status !== 'stable' ? ` (${r.status})` : ''}: ${r.whenToUse[0] ?? ''}`);
    out.push('');
  }
  return out.join('\n');
}

function llmsFull(records) {
  return [`# Theya — all components`, '', `> ${GENERATED} \`${PKG.name}\` v${PKG.version}.`, '', ...records.map(markdownOf)].join('\n');
}

/* ------------------------------------------------------------------ */
/* Write / check                                                       */
/* ------------------------------------------------------------------ */

const records = build();
const files = new Map();
const json = (v) => JSON.stringify(v, null, 2) + '\n';
files.set('spec/index.json', json(indexOf(records)));
for (const r of records) files.set(specPath(r), json({ $comment: GENERATED, ...r }));
files.set('public/llms.txt', llmsTxt(records));
files.set('public/llms-full.txt', llmsFull(records));

let stale = 0;
for (const [rel, content] of files) {
  const abs = path.join(ROOT, rel);
  const current = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null;
  if (current === content) continue;
  stale++;
  if (CHECK) console.error(`stale: ${rel}`);
  else {
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
  }
}
if (!CHECK) {
  // Remove records for components that no longer exist.
  const dir = path.join(ROOT, 'spec/components');
  for (const f of fs.readdirSync(dir)) if (!files.has(`spec/components/${f}`)) fs.rmSync(path.join(dir, f), { force: true });
}
console.log(`${records.length} components · ${stale} file(s) ${CHECK ? 'stale' : 'written'}`);
if (importProblems.length) {
  console.error(`Spec import names that the component files do not export:\n  ${importProblems.join('\n  ')}`);
  process.exit(1);
}
if (CHECK && stale) process.exit(1);
