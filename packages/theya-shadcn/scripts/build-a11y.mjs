#!/usr/bin/env node
/**
 * Accessibility matrix: one row per component, shown on its Docs page and
 * on Design System/Accessibility. Target: WCAG 2.2 AA.
 *
 * Read from the code (so it can't drift):
 * - axe: every story runs axe-core in the light and the dark theme in CI
 *   (test-runner.ts; a violation fails the build). Listed: how many stories,
 *   and any rule a story or the meta switches off.
 * - keyboard: stories whose play test drives the keyboard
 *   (userEvent.keyboard / .tab — also via userEvent.setup() — a pressArrow or tabTo (src/test/keyboard.ts) helper, a dispatched
 *   KeyboardEvent), out of the stories with a play test.
 * - reducedMotion: whether the component's source moves things (animations,
 *   transform / size transitions) and guards them with motion-safe: /
 *   motion-reduce:; "none" if nothing moves. Color and opacity fades and the
 *   loading spinner don't count.
 * - forcedColors: component-level forced-colors: rules, or the global
 *   stylesheet (src/styles/forced-colors.css) only.
 *
 * Patterns (src/components/blocks, Storybook "Patterns…") get the same rows in
 * a separate list, read the same way; their code-read notes from
 * a11y/patterns-notes.json count as manual reviews.
 *
 * Kept by hand in a11y/manual.json: screen-reader passes (VoiceOver, NVDA…),
 * component-specific accepted deviations, and the components where the
 * soft focus ring is the only visible focus change (WCAG 1.4.11, accepted).
 *
 * Criteria matrix: every WCAG 2.2 A/AA criterion (a11y/criteria.json) is
 * crossed with every component. Applicability comes from traits read from
 * the component source (TRAITS below; a11y/manual.json traits can add or
 * remove one); a cell is verified when all the evidence the criterion asks
 * for exists, partial when some does, untested when none does. "axe"
 * evidence only counts for criteria an enabled, non-experimental axe-core
 * rule actually maps to (read from axe-core itself, so a rule switched off
 * by default — target-size — doesn't count).
 *
 *   node scripts/build-a11y.mjs          write spec/a11y.json
 *   node scripts/build-a11y.mjs --check  fail if spec/a11y.json is stale
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const OUT = path.join(ROOT, 'spec/a11y.json');

const index = JSON.parse(fs.readFileSync(path.join(ROOT, 'spec/index.json'), 'utf8'));
const manual = JSON.parse(fs.readFileSync(path.join(ROOT, 'a11y/manual.json'), 'utf8'));
const { criteria } = JSON.parse(fs.readFileSync(path.join(ROOT, 'a11y/criteria.json'), 'utf8'));
// Browser checks from scripts/a11y-auto.mjs (label in name, focus visible, text spacing, resize text).
const AUTO_FILE = path.join(ROOT, 'a11y/auto.json');
const AUTO_KEYS = ['2.5.3', '2.4.7', '1.4.12', '1.4.4', '2.1.1', '2.1.2', '2.4.3'];
const auto = fs.existsSync(AUTO_FILE) ? JSON.parse(fs.readFileSync(AUTO_FILE, 'utf8')) : { components: {} };

// Patterns: every blocks/**/<name>.stories.tsx next to its <name>.tsx. Name and
// title come from the story meta ("Patterns: Account/AccountMenu" -> AccountMenu).
const BLOCKS_DIR = path.join(ROOT, 'src/components/blocks');
const patterns = fs
  .readdirSync(BLOCKS_DIR, { recursive: true })
  .filter((f) => f.endsWith('.stories.tsx'))
  .sort()
  .map((f) => {
    const base = path.join(BLOCKS_DIR, f.slice(0, -'.stories.tsx'.length));
    const title = /\btitle:\s*'([^']+)'/.exec(fs.readFileSync(`${base}.stories.tsx`, 'utf8'))?.[1] ?? null;
    return { name: title?.split('/').pop() ?? path.basename(base), base, title };
  })
  .filter((p) => fs.existsSync(`${p.base}.tsx`));
// Code-read notes per pattern: [{ criterion, result: pass | fail, finding }]. Any fail wins.
const PATTERN_NOTES_FILE = path.join(ROOT, 'a11y/patterns-notes.json');
const patternNotes = fs.existsSync(PATTERN_NOTES_FILE) ? JSON.parse(fs.readFileSync(PATTERN_NOTES_FILE, 'utf8')) : {};
const notesAsReviews = (name) => {
  const out = {};
  for (const n of Array.isArray(patternNotes[name]) ? patternNotes[name] : []) {
    if (out[n.criterion]?.result === 'fail') continue;
    out[n.criterion] = { result: n.result, note: n.finding };
  }
  return out;
};

// Criteria some enabled, non-experimental axe-core rule checks: tag wcag111 → 1.1.1.
const RULE_CRITERIA = new Map();
const AXE_CRITERIA = (() => {
  // The axe-core that test-runner.ts runs: axe-playwright's own copy.
  const axe = require(require.resolve('axe-core', { paths: [path.dirname(require.resolve('axe-playwright'))] }));
  const enabled = new Set(axe._audit.rules.filter((r) => r.enabled !== false).map((r) => r.id));
  // Rules the test runner switches on beyond axe's defaults (target-size).
  const runner = fs.readFileSync(path.join(ROOT, '.storybook/test-runner.ts'), 'utf8');
  for (const m of runner.matchAll(/id:\s*'([a-z0-9-]+)',\s*enabled:\s*true/g)) enabled.add(m[1]);
  const out = new Set();
  for (const rule of axe.getRules()) {
    if (!enabled.has(rule.ruleId) || rule.tags.includes('experimental')) continue;
    for (const tag of rule.tags) {
      const m = /^wcag(\d)(\d)(\d+)$/.exec(tag);
      if (!m) continue;
      const id = `${m[1]}.${m[2]}.${m[3]}`;
      out.add(id);
      RULE_CRITERIA.set(rule.ruleId, [...(RULE_CRITERIA.get(rule.ruleId) ?? []), id]);
    }
  }
  return out;
})();

const parse = (file) => ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const unwrap = (n) => {
  while (n && (ts.isAsExpression(n) || ts.isSatisfiesExpression?.(n) || ts.isParenthesizedExpression(n))) n = n.expression;
  return n;
};
const prop = (obj, name) => obj?.properties?.find((p) => (ts.isPropertyAssignment(p) || ts.isMethodDeclaration(p)) && p.name?.getText() === name);

/** Rule ids switched off in a parameters.a11y object (text search is enough: { id: 'x', enabled: false }). */
const disabledRules = (node) => (node ? [...node.getText().matchAll(/id:\s*'([a-z0-9-]+)',\s*enabled:\s*false/g)].map((m) => m[1]) : []);

function readStories(file) {
  const sf = parse(file);
  let meta;
  const stories = [];
  for (const st of sf.statements) {
    if (!ts.isVariableStatement(st)) continue;
    const exported = st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    for (const d of st.declarationList.declarations) {
      if (!ts.isIdentifier(d.name)) continue;
      const init = unwrap(d.initializer);
      if (d.name.text === 'meta') meta = init;
      else if (exported) stories.push({ name: d.name.text, obj: init && ts.isObjectLiteralExpression(init) ? init : null });
    }
  }
  const metaParams = meta && ts.isObjectLiteralExpression(meta) ? unwrap(prop(meta, 'parameters')?.initializer) : null;
  const metaRules = disabledRules(metaParams && ts.isObjectLiteralExpression(metaParams) ? prop(metaParams, 'a11y') : null);

  const exclusions = [];
  if (metaRules.length) exclusions.push({ story: '*', rules: metaRules });
  let play = 0;
  let keyboard = 0;
  for (const s of stories) {
    const playProp = s.obj && prop(s.obj, 'play');
    if (playProp) {
      play += 1;
      // userEvent's keyboard / tab, a story helper that wraps it (pressArrow),
      // or a dispatched KeyboardEvent.
      if (/\b(?:userEvent|user)\.(keyboard|tab)\(|\b(?:pressArrow|tabTo)\(|new KeyboardEvent\(|fireEvent\.keyDown\(/.test(playProp.getText())) keyboard += 1;
    }
    const params = s.obj && unwrap(prop(s.obj, 'parameters')?.initializer);
    const rules = disabledRules(params && ts.isObjectLiteralExpression(params) ? prop(params, 'a11y') : null);
    if (rules.length) exclusions.push({ story: s.name, rules });
  }
  return { stories: stories.length, play, keyboard, exclusions };
}

/**
 * Movement (not color or opacity fades, which reduced motion doesn't cover):
 * animate-* classes except the loading spinner (essential), and transitions
 * of transform / size / position. A class prefixed motion-safe: is guarded;
 * any motion-reduce: rule in the file counts as handling it.
 */
const MOVING = /(?:^|\s)((?:[\w\-[\]=&>*.#()/,!@]+:)*)(animate-(?!none\b|spin\b)[a-z0-9-]+|transition(?:-(?:transform|all))?(?![-\w[])|transition-\[[^\]]*(?:width|height|transform|translate|inset|top|left)[^\]]*\])/g;

/** Text of every string literal / template part in a file (class names live there, not in comments or code). */
function stringsOf(file) {
  const out = [];
  const visit = (n) => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) out.push(n.text);
    else if (ts.isTemplateExpression(n)) out.push(n.head.text, ...n.templateSpans.map((t) => t.literal.text));
    ts.forEachChild(n, visit);
  };
  visit(parse(file));
  return out;
}

function readSource(file) {
  const strings = stringsOf(file);
  const moving = strings.flatMap((t) => [...t.matchAll(MOVING)]);
  const unguarded = moving.filter((m) => !m[1].includes('motion-safe:') && !m[1].includes('motion-reduce:')).map((m) => m[2]);
  const reduceRule = strings.some((t) => /motion-reduce:/.test(t));
  // motion-safe: anything (a press scale, a slide) is movement that is already guarded.
  const safeOnly = strings.some((t) => /(?:^|\s)(?:[\w\-[\]=&>*.#()/,!@]+:)*motion-safe:/.test(t));
  const reducedMotion = !moving.length && !safeOnly ? 'none' : !unguarded.length || reduceRule ? 'respected' : 'unguarded';
  return {
    reducedMotion,
    ...(reducedMotion === 'unguarded' ? { moving: [...new Set(unguarded)] } : {}),
    forcedColors: strings.some((t) => /forced-colors:/.test(t)) ? 'component' : 'global',
  };
}

/**
 * Component traits that decide which criteria apply, read from the source
 * text. Deliberately broad: a false "applies" shows up as an untested cell
 * to look at; a false "doesn't apply" would hide one.
 */
const TRAITS = {
  // Radix roots that render nothing focusable (Avatar, Label, Progress,
  // Separator, AspectRatio) don't make a component interactive; dnd-kit
  // handles and sonner's close / action buttons do.
  interactive: /<button\b|<input\b|<textarea\b|<select\b|<a\b|href=|onClick=|tabIndex=|role=['"](?:button|link|checkbox|radio|switch|tab|menuitem\w*|option|slider|combobox|textbox|gridcell|treeitem|spinbutton|scrollbar)['"]|(?<!Avatar|Label|Progress|Separator|AspectRatio)Primitive\.(?:Trigger|Root|Item|Thumb)|\bOTPInput\b|\? Slot : ['"](?:a|button)['"]|<(?:Button|Toggle|Checkbox|Radio|Switch|Slider|Input|TextField|Select|Link)\b|\buse(?:Sortable|Draggable)\(|\bcloseButton\b/,
  textInput: /<input\b(?![^>]*type=['"](?:checkbox|radio|range|file|hidden|button|submit)['"])|<textarea\b|contentEditable|<(?:Input|TextField|TextArea|OTPInput)\b/,
  choice: /type=['"](?:checkbox|radio)['"]|role=['"](?:checkbox|radio|switch|option|menuitemcheckbox|menuitemradio)['"]|(?:Checkbox|Radio|Switch|Select|ToggleGroup)Primitive|<(?:Checkbox|Radio|Switch|Select)\b/,
  validation: /aria-invalid|aria-errormessage/,
  labelled: /<label\b|<h[1-6]\b|<legend\b|Label\b|Title\b|Heading\b/,
  links: /<a\b|href=/,
  overlay: /Portal\b|DialogPrimitive|PopoverPrimitive|DropdownMenuPrimitive|ContextMenuPrimitive|MenubarPrimitive|TooltipPrimitive|HoverCardPrimitive|Drawer|vaul/,
  hoverContent: /TooltipPrimitive|HoverCardPrimitive|<Tooltip\b|<HoverCard\b|onMouseEnter=|onPointerEnter=/,
  sticky: /(?:^|[\s'"`])(?:sticky|fixed)(?=[\s'"`])/,
  timed: /\bduration\??\s*[:=]|autoPlay|autoplay|setInterval|\bcountdown\b|\bexpires\b/i,
  autoMoving: /\binfinite\b|autoPlay|autoplay|setInterval/,
  drag: /draggable|onDrag\w*=|@dnd-kit|onPointerMove=|setPointerCapture/,
  gestures: /swipe|pinch|onTouch\w*=|onPointerMove=|setPointerCapture/i,
  status: /aria-live|role=\{?[^}>]*['"](?:status|alert|log|progressbar|timer)['"]|toast|announce/i,
  shortcuts: /addEventListener\(\s*['"]keydown['"]|useHotkeys|\bshortcut/i,
  graphics: /recharts|<canvas\b|role=['"](?:img|meter|progressbar)['"]|<svg\b[^>]*viewBox/,
  colorMeaning: /\btone\b|\bseverity\b|success|danger|warning/,
  // Widgets with their own arrow-key model: Tab alone doesn't prove them.
  composite: /role=['"](?:grid|listbox|tree|treegrid|menu|menubar|tablist|radiogroup|toolbar|slider|spinbutton)['"]|(?:Tabs|RadioGroup|Toolbar|Slider|Menubar|NavigationMenu|ToggleGroup|DropdownMenu|ContextMenu|Select)Primitive|\bDayPicker\b|from ['"]cmdk['"]|EditorView|useEditor\b/,
  auth: /['"]password['"]|one-time-code|current-password|new-password|\bOTPInput\b/,
};

/** Source without comments, so a note like "fixed: …" doesn't read as a class. */
const code = (file) => fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');

/** Traits a component also has when it renders another component that has them. */
const INHERITED = ['interactive', 'textInput', 'choice', 'overlay', 'hoverContent', 'validation'];

/** Traits for every component file: own source first, then what it renders from ./siblings, to a fixpoint. */
function readAllTraits(files) {
  const own = new Map();
  const uses = new Map();
  for (const [name, file] of files) {
    const text = code(file);
    own.set(name, new Set(Object.keys(TRAITS).filter((t) => TRAITS[t].test(text))));
    // Relative imports, resolved to files: ./sibling for components,
    // ../ui/x or ../../ui/x for patterns.
    // Imports of components pass traits on; a shared constant (SOLID_TONE_CLASS
    // from ./chip), a helper (cn) or a type doesn't make Badge interactive.
    uses.set(
      name,
      [...text.matchAll(/import\s+(?!type\b)([^;]*?)\s+from\s+['"](\.{1,2}\/[\w./-]+)['"]/g)]
        .filter(([, names]) => names.replace(/\btype\s+\w+/g, '').match(/\b[A-Z][a-z]\w*/g))
        .map((m) => path.resolve(path.dirname(file), `${m[2]}.tsx`)),
    );
  }
  const byFile = new Map([...files].map(([name, file]) => [path.resolve(file), name]));
  for (let changed = true; changed; ) {
    changed = false;
    for (const [name, deps] of uses) {
      for (const dep of deps) {
        const other = own.get(byFile.get(dep));
        if (!other) continue;
        for (const t of INHERITED) if (other.has(t) && !own.get(name).has(t)) { own.get(name).add(t); changed = true; }
      }
    }
  }
  for (const [name, set] of own) {
    const fix = manual.traits?.[name];
    for (const t of fix?.add ?? []) set.add(t);
    for (const t of fix?.remove ?? []) set.delete(t);
  }
  return new Map([...own].map(([name, set]) => [name, [...set].sort()]));
}

/** Status of one criterion for one component. */
function criterionStatus(c, row, traits, evidence) {
  if (c.scope !== 'component') return c.scope;
  if (!c.appliesTo.some((t) => t === 'any' || traits.includes(t))) return 'n/a';
  // A manual review can confirm the trait was a false positive for this
  // criterion (e.g. a countdown that only displays time sets no time limit).
  if (row.review(c.id)?.result === 'n/a') return 'n/a';
  if (row.deviations.some((d) => d.criterion === c.id)) return 'deviation';
  if (row.autoFindings(c.id).length || row.review(c.id)?.result === 'fail') return 'fails';
  const needed = c.evidence.filter((e) => e !== 'axe' || AXE_CRITERIA.has(c.id));
  const have = needed.filter((e) => evidence(e, c.id));
  if (needed.length && have.length === needed.length) return 'verified';
  return have.length ? 'partial' : 'untested';
}

// Patterns are keyed "pattern:<Name>" here so a pattern never shadows a component of the same name.
const ALL_TRAITS = readAllTraits([
  ...index.components.map((c) => [c.name, path.join(ROOT, 'src/components', `${c.file}.tsx`)]).filter(([, file]) => fs.existsSync(file)),
  ...patterns.map((p) => [`pattern:${p.name}`, `${p.base}.tsx`]),
]);

/** One matrix row: a component, or a pattern (traitKey "pattern:<Name>", reviews from its notes). */
function buildRow({ name, base, title, traitKey = name, reviews: ownReviews = {} }) {
  const storiesFile = `${base}.stories.tsx`;
  const sourceFile = `${base}.tsx`;
  const s = fs.existsSync(storiesFile) ? readStories(storiesFile) : { stories: 0, play: 0, keyboard: 0, exclusions: [] };
  const deviations = [...(manual.deviations[name] ?? [])];
  if (manual.focusRingOnly.includes(name)) {
    deviations.push({ criterion: '1.4.11', note: 'The focus ring is the only visible focus change, and it is under 3:1 (1.53:1 light, ~1.9:1 dark). Library-wide accepted deviation, 2026-09-27; confirmed 2026-10-26 after comparing a solid 2px ring on live components.' });
  }
  const source = readSource(sourceFile);
  const traits = ALL_TRAITS.get(traitKey);
  const sr = manual.screenReader[name] ?? [];
  // manual.json reviews win over a pattern's code-read notes for the same criterion.
  const reviews = { ...ownReviews, ...(manual.reviews?.[name] ?? {}) };
  const evidence = (kind, id) =>
    // axe counts unless a rule for this criterion is off for the whole
    // component (meta level, or in every story).
    // A rule switched off with a reason in the stories counts again when a
    // manual review of that criterion passed (CardFan, Comparison: 2.5.8).
    kind === 'axe'
      ? s.stories > 0 &&
        (!s.exclusions.some((e) => e.rules.some((r) => RULE_CRITERIA.get(r)?.includes(id)) && (e.story === '*' || s.exclusions.filter((x) => x.rules.some((r) => RULE_CRITERIA.get(r)?.includes(id))).length >= s.stories)) ||
          reviews[id]?.result === 'pass')
    // A keyboard play test, or — for components without their own arrow-key
    // model — the Tab pass of a11y-auto with nothing found.
    : kind === 'keyboard'
      ? s.keyboard > 0 || (!traits.includes('composite') && !!autoRow && autoRow.stories > autoRow.errors && ['2.1.1', '2.1.2', '2.4.3'].every((k) => Array.isArray(autoRow[k]) && !autoRow[k].length))
    : kind === 'reflow360' ? s.stories > 0
    : kind === 'reducedMotion' ? source.reducedMotion !== 'unguarded'
    : kind === 'auto' ? !!autoRow && autoRow.stories > autoRow.errors && !autoRow[id]?.length
    : kind === 'screenReader' ? sr.some((p) => p.result === 'pass')
    : kind === 'review' ? reviews[id]?.result === 'pass'
    : false;
  const autoRow = auto.components[name];
  const partialRow = { deviations, autoFindings: (id) => autoRow?.[id] ?? [], review: (id) => reviews[id] };
  const wcag = Object.fromEntries(criteria.map((cr) => [cr.id, criterionStatus(cr, partialRow, traits, evidence)]));
  return {
    name,
    title,
    axe: { stories: s.stories, themes: ['light', 'dark'], exclusions: s.exclusions },
    keyboard: { tested: s.keyboard, playTests: s.play },
    ...source,
    screenReader: sr,
    deviations,
    traits,
    wcag,
    ...(autoRow && AUTO_KEYS.some((k) => autoRow[k]?.length)
      ? { autoFindings: Object.fromEntries(AUTO_KEYS.filter((k) => autoRow[k]?.length).map((k) => [k, autoRow[k]])) }
      : {}),
  };
}

const rows = [];
const problems = [];
for (const c of index.components) {
  const base = path.join(ROOT, 'src/components', c.file);
  if (!fs.existsSync(`${base}.tsx`)) continue;
  rows.push(buildRow({ name: c.name, base, title: JSON.parse(fs.readFileSync(path.join(ROOT, c.spec), 'utf8')).storybook?.title ?? null }));
}
const patternRows = patterns.map((p) => buildRow({ name: p.name, base: p.base, title: p.title, traitKey: `pattern:${p.name}`, reviews: notesAsReviews(p.name) }));
for (const name of Object.keys(patternNotes)) {
  if (!name.startsWith('$') && !patternRows.some((r) => r.name === name)) problems.push(`a11y/patterns-notes.json names "${name}", which is not a pattern in src/components/blocks`);
}
for (const name of [...Object.keys(manual.deviations), ...manual.focusRingOnly, ...Object.keys(manual.screenReader), ...Object.keys(manual.traits ?? {}), ...Object.keys(manual.reviews ?? {})]) {
  if (!rows.some((r) => r.name === name) && !patternRows.some((r) => r.name === name)) problems.push(`a11y/manual.json names "${name}", which is not a component in spec/index.json or a pattern`);
}

const out = JSON.stringify(
  {
    $comment: 'Generated by scripts/build-a11y.mjs from the code and a11y/manual.json. Do not edit.',
    target: 'WCAG 2.2 AA',
    autoChecked: auto.date ?? null,
    criteria: criteria.map((cr) => {
      const tally = (list) => {
        const out = {};
        for (const r of list) out[r.wcag[cr.id]] = (out[r.wcag[cr.id]] ?? 0) + 1;
        return out;
      };
      return { id: cr.id, level: cr.level, name: cr.name, scope: cr.scope, ...(cr.note ? { note: cr.note } : {}), ...(cr.evidence ? { evidence: cr.evidence.filter((e) => e !== 'axe' || AXE_CRITERIA.has(cr.id)) } : {}), counts: tally(rows), patternCounts: tally(patternRows) };
    }),
    components: rows,
    patterns: patternRows,
  },
  null,
  2,
) + '\n';

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
const unguarded = [...rows, ...patternRows].filter((r) => r.reducedMotion === 'unguarded').map((r) => r.name);
if (CHECK) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (current !== out) {
    console.error('spec/a11y.json is stale — run `pnpm a11y`');
    process.exit(1);
  }
  console.log(`a11y matrix: ${rows.length} components, ${patternRows.length} patterns, up to date`);
} else {
  fs.writeFileSync(OUT, out);
  console.log(`a11y matrix: ${rows.length} components, ${patternRows.length} patterns → spec/a11y.json${unguarded.length ? `\n  animates without motion-reduce: ${unguarded.join(', ')}` : ''}`);
}
