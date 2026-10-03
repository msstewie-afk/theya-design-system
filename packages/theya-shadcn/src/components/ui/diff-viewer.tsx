import { useCallback, useMemo, useState } from 'react';
import { diffLines, diffWordsWithSpace } from 'diff';
import { ArrowSeparateVertical } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Chip } from './chip';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';

/**
 * DiffViewer — read-only comparison of two texts (config, code, a
 * template, a policy) in the same mono surface frame as CodeBlock.
 *
 * - `unified` view: one column, removals above additions (git style).
 * - `split` view: old on the left, new on the right; paired lines share a row.
 * - Changed words inside a paired line get a stronger highlight (`wordDiff`).
 * - Long unchanged runs collapse to an expander row, keeping `context`
 *   lines around every change.
 *
 * Diffing is done by the `diff` package (jsdiff): line diff first, then a
 * word diff only for removed/added lines that pair up 1:1 inside a block.
 */

export type DiffView = 'unified' | 'split';

export interface DiffViewerProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /** Original text. */
  oldValue: string;
  /** Changed text. */
  newValue: string;
  /** Controlled view. */
  view?: DiffView;
  /** Initial view when uncontrolled. */
  defaultView?: DiffView;
  onViewChange?: (view: DiffView) => void;
  /** Renders a Unified/Split switch in the header. */
  viewToggle?: boolean;
  /** New file name, shown mono in the header. */
  filename?: string;
  /** Previous file name — when it differs from `filename` the header shows a rename (old → new). */
  oldFilename?: string;
  /** Language hint shown as a tag in the header (no highlighting applied). */
  language?: string;
  /** Unchanged lines kept around each change; longer runs collapse. `Infinity` never collapses. */
  context?: number;
  /** Highlights changed words inside paired lines. */
  wordDiff?: boolean;
  lineNumbers?: boolean;
  /** Shows the +added −removed counter in the header. */
  stats?: boolean;
  /** Wraps long lines instead of scrolling horizontally. Defaults to true in split view. */
  wrap?: boolean;
  /** Extra header content (e.g. a copy or "apply" button), placed at the end. */
  actions?: React.ReactNode;
  /** Accessible name of the scrollable diff region. Defaults to the filename. */
  label?: string;
  /** Text of the expander row. */
  expandLabel?: (hiddenCount: number) => string;
  /** Shown when both texts are identical. */
  emptyMessage?: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/* Model                                                              */
/* ------------------------------------------------------------------ */

type LineType = 'context' | 'add' | 'del';
interface Part {
  value: string;
  changed: boolean;
}
interface DiffLine {
  type: LineType;
  oldNo?: number;
  newNo?: number;
  text: string;
  /** Word-level parts; only set on paired add/del lines. */
  parts?: Part[];
}
type UnifiedItem = { kind: 'line'; line: DiffLine } | { kind: 'gap'; id: string; lines: DiffLine[] };
interface SplitRow {
  left?: DiffLine;
  right?: DiffLine;
}
type SplitItem = { kind: 'row'; row: SplitRow } | { kind: 'gap'; id: string; lines: DiffLine[] };

function splitLines(value: string) {
  const lines = value.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  return lines;
}

/** Below this share of unchanged characters a word diff is noise — the line was rewritten. */
const MIN_COMMON_RATIO = 0.4;

function pairWords(del: DiffLine, add: DiffLine) {
  const changes = diffWordsWithSpace(del.text, add.text);
  const common = changes.filter((c) => !c.added && !c.removed).reduce((n, c) => n + c.value.length, 0);
  const longest = Math.max(del.text.length, add.text.length) || 1;
  if (common / longest < MIN_COMMON_RATIO) return;
  del.parts = changes.filter((c) => !c.added).map((c) => ({ value: c.value, changed: c.removed }));
  add.parts = changes.filter((c) => !c.removed).map((c) => ({ value: c.value, changed: c.added }));
}

function buildLines(oldValue: string, newValue: string, wordDiff: boolean) {
  const chunks = diffLines(oldValue, newValue);
  const lines: DiffLine[] = [];
  let oldNo = 1;
  let newNo = 1;
  let added = 0;
  let removed = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    if (chunk.removed) {
      const dels = splitLines(chunk.value).map<DiffLine>((text) => ({ type: 'del', oldNo: oldNo++, text }));
      removed += dels.length;
      const next = chunks[i + 1];
      let adds: DiffLine[] = [];
      if (next?.added) {
        adds = splitLines(next.value).map<DiffLine>((text) => ({ type: 'add', newNo: newNo++, text }));
        added += adds.length;
        i++;
        if (wordDiff) {
          const pairs = Math.min(dels.length, adds.length);
          for (let p = 0; p < pairs; p++) pairWords(dels[p], adds[p]);
        }
      }
      lines.push(...dels, ...adds);
    } else if (chunk.added) {
      const adds = splitLines(chunk.value).map<DiffLine>((text) => ({ type: 'add', newNo: newNo++, text }));
      added += adds.length;
      lines.push(...adds);
    } else {
      for (const text of splitLines(chunk.value)) lines.push({ type: 'context', oldNo: oldNo++, newNo: newNo++, text });
    }
  }
  return { lines, added, removed };
}

/** Collapses unchanged runs longer than 2×context (+1, so a gap never hides a single line). */
function collapse(lines: DiffLine[], context: number, expanded: Set<string>): UnifiedItem[] {
  const items: UnifiedItem[] = [];
  let i = 0;
  while (i < lines.length) {
    if (lines[i].type !== 'context') {
      items.push({ kind: 'line', line: lines[i++] });
      continue;
    }
    let end = i;
    while (end < lines.length && lines[end].type === 'context') end++;
    const run = lines.slice(i, end);
    const atStart = i === 0;
    const atEnd = end === lines.length;
    const keepHead = atStart ? 0 : context;
    const keepTail = atEnd ? 0 : context;
    const hidden = run.length - keepHead - keepTail;
    const id = `gap-${i}`;
    // An all-context diff (no changes) is shown in full.
    const noChanges = atStart && atEnd;
    if (!noChanges && Number.isFinite(context) && hidden >= 2 && !expanded.has(id)) {
      run.slice(0, keepHead).forEach((line) => items.push({ kind: 'line', line }));
      items.push({ kind: 'gap', id, lines: run.slice(keepHead, run.length - keepTail) });
      run.slice(run.length - keepTail).forEach((line) => items.push({ kind: 'line', line }));
    } else {
      run.forEach((line) => items.push({ kind: 'line', line }));
    }
    i = end;
  }
  return items;
}

function toSplit(items: UnifiedItem[]): SplitItem[] {
  const out: SplitItem[] = [];
  let i = 0;
  while (i < items.length) {
    const item = items[i];
    if (item.kind === 'gap') {
      out.push(item);
      i++;
      continue;
    }
    if (item.line.type === 'context') {
      out.push({ kind: 'row', row: { left: item.line, right: item.line } });
      i++;
      continue;
    }
    const dels: DiffLine[] = [];
    const adds: DiffLine[] = [];
    while (i < items.length) {
      const it = items[i];
      if (it.kind !== 'line' || it.line.type === 'context') break;
      // A new del after adds starts the next block.
      if (it.line.type === 'del' && adds.length) break;
      (it.line.type === 'del' ? dels : adds).push(it.line);
      i++;
    }
    const rows = Math.max(dels.length, adds.length);
    for (let r = 0; r < rows; r++) out.push({ kind: 'row', row: { left: dels[r], right: adds[r] } });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Rendering                                                          */
/* ------------------------------------------------------------------ */

const LINE_BG: Record<LineType, string> = {
  context: '',
  add: 'bg-[var(--color-bg-success-bg-success-subtler)]',
  del: 'bg-[var(--color-bg-danger-bg-danger-subtler)]',
};
const WORD_BG: Record<Exclude<LineType, 'context'>, string> = {
  add: 'bg-[var(--color-bg-success-bg-success-subtle)]',
  del: 'bg-[var(--color-bg-danger-bg-danger-subtle)]',
};
const SIGN: Record<LineType, { char: string; sr: string; className: string }> = {
  context: { char: '', sr: '', className: '' },
  add: { char: '+', sr: 'Added: ', className: 'text-[var(--color-text-text-success)]' },
  del: { char: '−', sr: 'Removed: ', className: 'text-[var(--color-text-text-danger)]' },
};

const CELL_NUM = 'shrink-0 select-none px-2 text-right tabular-nums text-[var(--color-text-text-subtle)]';
const CELL_SIGN = 'w-5 shrink-0 select-none text-center';

function LineContent({ line, wrap }: { line: DiffLine; wrap: boolean }) {
  const ws = wrap ? 'whitespace-pre-wrap break-words [overflow-wrap:anywhere]' : 'whitespace-pre';
  const sign = SIGN[line.type];
  const body = line.parts
    ? line.parts.map((part, i) => {
        if (!part.changed) return <span key={i}>{part.value}</span>;
        const Tag = line.type === 'add' ? 'ins' : 'del';
        return (
          <Tag key={i} className={cn('rounded-[2px] no-underline', WORD_BG[line.type as 'add' | 'del'])}>
            {part.value}
          </Tag>
        );
      })
    : line.text;
  return (
    <>
      <span aria-hidden className={cn(CELL_SIGN, sign.className)}>
        {sign.char}
      </span>
      <span className={cn('min-w-0 flex-1 pr-4', ws)}>
        {sign.sr && <span className="sr-only">{sign.sr}</span>}
        {/* Keep empty lines one row tall. */}
        {line.text === '' ? '​' : body}
      </span>
    </>
  );
}

function GapRow({ count, onExpand, label }: { count: number; onExpand: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onExpand}
      className={cn(
        'flex w-full items-center gap-2 px-3 py-1 font-sans text-body-s text-[var(--color-text-text-subtle)]',
        'bg-[var(--color-bg-neutral-bg-neutral-subtler)] hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] hover:text-[var(--color-text-text)]',
        'cursor-pointer outline-none focus-visible:focus-ring focus-visible:relative focus-visible:z-[1]',
      )}
    >
      <ArrowSeparateVertical className="size-4 shrink-0" aria-hidden />
      {label}
    </button>
  );
}

export function DiffViewer({
  oldValue,
  newValue,
  view: viewProp,
  defaultView = 'unified',
  onViewChange,
  viewToggle = false,
  filename,
  oldFilename,
  language,
  context = 3,
  wordDiff = true,
  lineNumbers = true,
  stats = true,
  wrap: wrapProp,
  actions,
  label,
  expandLabel = (n) => `Show ${n} unchanged ${n === 1 ? 'line' : 'lines'}`,
  emptyMessage = 'No changes',
  className,
  ...props
}: DiffViewerProps) {
  const [viewState, setViewState] = useState<DiffView>(defaultView);
  const view = viewProp ?? viewState;
  const setView = useCallback(
    (next: DiffView) => {
      if (viewProp === undefined) setViewState(next);
      onViewChange?.(next);
    },
    [viewProp, onViewChange],
  );
  const wrap = wrapProp ?? view === 'split';

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const expand = (id: string) => setExpanded((prev) => new Set(prev).add(id));

  const model = useMemo(() => buildLines(oldValue, newValue, wordDiff), [oldValue, newValue, wordDiff]);
  const items = useMemo(() => collapse(model.lines, context, expanded), [model, context, expanded]);
  const splitItems = useMemo(() => (view === 'split' ? toSplit(items) : []), [items, view]);

  const maxNo = model.lines.reduce((m, l) => Math.max(m, l.oldNo ?? 0, l.newNo ?? 0), 0);
  // Gutter width: digits + px-2 on both sides.
  const numStyle = { width: `calc(${String(maxNo).length}ch + 1rem)` };

  const isRename = Boolean(oldFilename && filename && oldFilename !== filename);
  const hasChanges = model.added + model.removed > 0;
  const hasHeader = Boolean(filename || oldFilename || language || viewToggle || actions || (stats && hasChanges));
  const regionLabel = label ?? (filename ? `Changes in ${filename}` : 'Changes');

  const num = (n: number | undefined) => (lineNumbers ? <span style={numStyle} className={CELL_NUM}>{n ?? ''}</span> : null);

  const renderUnified = () =>
    items.map((item) =>
      item.kind === 'gap' ? (
        <GapRow key={item.id} count={item.lines.length} label={expandLabel(item.lines.length)} onExpand={() => expand(item.id)} />
      ) : (
        <div key={`${item.line.type}-${item.line.oldNo ?? ''}-${item.line.newNo ?? ''}`} className={cn('flex', LINE_BG[item.line.type])}>
          {num(item.line.oldNo)}
          {num(item.line.newNo)}
          <LineContent line={item.line} wrap={wrap} />
        </div>
      ),
    );

  const half = (line: DiffLine | undefined, side: 'left' | 'right') => {
    const n = side === 'left' ? line?.oldNo : line?.newNo;
    return (
      <div
        className={cn(
          'flex min-w-0 flex-1 basis-0',
          line ? LINE_BG[line.type] : 'bg-[var(--color-bg-neutral-bg-neutral-subtler)]',
          side === 'right' && 'border-l border-solid border-[var(--color-border-border-subtler)]',
        )}
      >
        {num(line ? n : undefined)}
        {line ? <LineContent line={line} wrap={wrap} /> : <span className="flex-1" aria-hidden />}
      </div>
    );
  };

  const renderSplit = () =>
    splitItems.map((item, i) =>
      item.kind === 'gap' ? (
        <GapRow key={item.id} count={item.lines.length} label={expandLabel(item.lines.length)} onExpand={() => expand(item.id)} />
      ) : (
        <div key={i} className="flex">
          {half(item.row.left, 'left')}
          {half(item.row.right, 'right')}
        </div>
      ),
    );

  return (
    <div
      className={cn(
        'relative flex min-w-0 max-w-full flex-col overflow-hidden rounded-[var(--size-border-radius-border-radius-xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] shadow-elevation-xs',
        'has-[>[data-diff-body]:focus-visible]:focus-ring',
        className,
      )}
      {...props}
    >
      {hasHeader && (
        <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-solid border-[var(--color-border-border-subtler)] px-3 py-2">
          <div className="flex min-w-0 flex-1 items-baseline gap-2">
            {(filename || oldFilename) && (
              <span className="min-w-0 truncate font-code text-body-m font-medium text-[var(--color-text-text)]">
                {isRename ? (
                  <>
                    <span className="text-[var(--color-text-text-subtle)]">{oldFilename}</span>
                    <span aria-hidden> → </span>
                    <span className="sr-only"> renamed to </span>
                    {filename}
                  </>
                ) : (
                  (filename ?? oldFilename)
                )}
              </span>
            )}
            {language && (
              <Chip tone="info" size="sm" interactive={false} className="shrink-0 self-center uppercase">
                {language}
              </Chip>
            )}
            {stats && hasChanges && (
              <span className="shrink-0 font-code text-body-s tabular-nums">
                <span className="text-[var(--color-text-text-success)]">+{model.added}</span>{' '}
                <span className="text-[var(--color-text-text-danger)]">−{model.removed}</span>
                <span className="sr-only">
                  {' '}
                  ({model.added} {model.added === 1 ? 'line' : 'lines'} added, {model.removed} removed)
                </span>
              </span>
            )}
          </div>
          {viewToggle && (
            <ToggleGroup
              type="single"
              size="sm"
              appearance="outlined"
              value={view}
              onValueChange={(v) => v && setView(v as DiffView)}
              aria-label="Diff view"
            >
              <ToggleGroupItem value="unified">Unified</ToggleGroupItem>
              <ToggleGroupItem value="split">Split</ToggleGroupItem>
            </ToggleGroup>
          )}
          {actions}
        </div>
      )}
      <div
        data-diff-body=""
        role="region"
        aria-label={regionLabel}
        tabIndex={0}
        className="min-h-0 flex-1 overflow-auto scrollbar-thin py-2 font-code text-[13px] leading-[20.8px] text-[var(--color-text-text)] outline-none"
      >
        {hasChanges ? (
          // w-max + min-w-full: rows stretch to the longest line so tints span the full scroll width.
          <div className={cn('min-w-full', !wrap && 'w-max')}>{view === 'split' ? renderSplit() : renderUnified()}</div>
        ) : (
          <p className="px-4 py-2 font-sans text-body-m text-[var(--color-text-text-subtle)]">{emptyMessage}</p>
        )}
      </div>
    </div>
  );
}
