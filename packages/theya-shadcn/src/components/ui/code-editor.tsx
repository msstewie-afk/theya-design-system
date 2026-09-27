import { useRef, useState, useEffect, useMemo } from 'react';
import { EditorState, Compartment, type Extension } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, dropCursor, placeholder as cmPlaceholder } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { syntaxHighlighting, HighlightStyle, indentOnInput, bracketMatching, StreamLanguage } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { tags as t } from '@lezer/highlight';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { CopyButton } from './copy-button';
import { Tooltip, TooltipTrigger, TooltipContent } from './tooltip';
import { Chip } from './chip';

/**
 * An editable code editor on CodeMirror 6, themed entirely from our
 * tokens. For editing config, snippets, templates, or rules
 * in-product. For read-only display use CodeBlock instead (lighter,
 * server-compatible).
 *
 * Controlled with value/onChange or uncontrolled with defaultValue.
 * Syntax color is on by default whenever `language` matches a known
 * grammar (see LANGUAGE_EXTENSIONS below) — no need to import/pass a
 * CodeMirror language package yourself for the common cases. Pass your
 * own grammar via `extensions` for anything else; it's added alongside
 * (not instead of) the auto one if both are present.
 *
 * `filename`/`language` grow a CodeBlock-style header bar; `copy`/
 * `clearable` add a Copy/Clear button on its right. `inverse` forces
 * the CODE AREA ONLY (not the header) onto a fixed dark surface
 * regardless of the page's own theme — same idea as Tooltip/Sonner's
 * dark-surface convention, using the Luna Pro Midnight palette.
 */

// Known language names → their CodeMirror grammar. Kept to the common
// web/config set (json/html/css/js/ts/bash) per Мария's call — add more
// here as they come up rather than widening speculatively.
const LANGUAGE_EXTENSIONS: Record<string, () => Extension> = {
  json: () => json(),
  html: () => html(),
  css: () => css(),
  javascript: () => javascript(),
  js: () => javascript(),
  jsx: () => javascript({ jsx: true }),
  typescript: () => javascript({ typescript: true }),
  ts: () => javascript({ typescript: true }),
  tsx: () => javascript({ typescript: true, jsx: true }),
  bash: () => StreamLanguage.define(shell),
  shell: () => StreamLanguage.define(shell),
  sh: () => StreamLanguage.define(shell),
};

function editorTheme(inverse: boolean) {
  const bg = inverse ? 'var(--color-code-bg-inverse)' : 'var(--color-code-bg)';
  const text = inverse ? 'var(--color-code-text-inverse)' : 'var(--color-code-text)';
  const comment = inverse ? 'var(--color-code-comment-inverse)' : 'var(--color-code-comment)';
  // Accent (cursor/selection/bracket-match) — regular uses Theya's
  // theme-reactive primary blue; inverse uses Luna's own light blue
  // (--color-code-selector-inverse, #61afef) instead of the page-theme
  // primary, which stayed light-theme blue even under `inverse` and, at
  // the same 22% mix, read too dark/low-contrast against the near-black
  // Luna background — barely visible, per Мария's report.
  const accent = inverse ? 'var(--color-code-selector-inverse)' : 'var(--color-bg-primary-bg-primary)';
  const selectionAlpha = inverse ? 35 : 22;
  return EditorView.theme({
    '&': { color: text, backgroundColor: bg, fontSize: '13px' },
    '&.cm-focused': { outline: 'none' },
    '.cm-scroller': { fontFamily: 'var(--font-code, ui-monospace, monospace)', fontSize: '13px', lineHeight: '20.8px', overflow: 'auto' },
    '.cm-content, .cm-gutters': { fontFamily: 'var(--font-code, ui-monospace, monospace)', fontSize: '13px', lineHeight: '20.8px' },
    '.cm-line, .cm-gutterElement': { lineHeight: '20.8px' },
    '.cm-content': { padding: '10px 0', caretColor: accent },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: accent },
    // Line numbers/gutter share the Comment color — no dedicated "line
    // number" role in the Luna table, and a muted tone matching comments
    // is the common convention (kept from the previous token-subtler choice).
    '.cm-gutters': { backgroundColor: 'transparent', color: comment, border: 'none' },
    '.cm-activeLine': { backgroundColor: `color-mix(in oklch, ${bg} 70%, transparent)` },
    '.cm-activeLineGutter': { backgroundColor: 'transparent', color: text },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': { backgroundColor: `color-mix(in oklch, ${accent} ${selectionAlpha}%, transparent)` },
    '.cm-matchingBracket, &.cm-focused .cm-matchingBracket': { backgroundColor: `color-mix(in oklch, ${accent} ${selectionAlpha}%, transparent)`, outline: inverse ? 'none' : '1px solid var(--color-border-border-subtle)' },
    // `drawSelection()` is meant to fully replace native text selection
    // with CodeMirror's own `.cm-selectionBackground` layer above, but the
    // browser's native ::selection still shows through WHILE FOCUSED,
    // blending with it (the "purple while typing, blue once blurred" bug
    // Мария caught — the purple was our unfixed native selection color
    // showing on top). Forcing it transparent here, scoped to this
    // editor's own generated class, wins over both the generic global
    // `::selection` rule (globals.css) and the browser default.
    '& ::selection': { backgroundColor: 'transparent' },
  });
}

// Luna palette mapped onto lezer's highlight tags by real-world role:
// tagName → Tag; className/propertyName (attribute position) → Attribute;
// keyword/function/typeName + link/url → Selector (closest to the old
// single "link-blue" bucket); string → Values; number/bool/null →
// Numbers; comment family → Comments; invalid → placeholder red (no Luna
// value given — see globals.css comment).
function highlightStyle(inverse: boolean) {
  const v = (name: string) => `var(--color-code-${name}${inverse ? '-inverse' : ''})`;
  return HighlightStyle.define([
    { tag: [t.keyword, t.moduleKeyword, t.operatorKeyword, t.function(t.variableName), t.function(t.propertyName), t.typeName], color: v('selector') },
    { tag: [t.tagName], color: v('tag') },
    { tag: [t.className, t.attributeName], color: v('attribute') },
    { tag: [t.string, t.special(t.string)], color: v('string') },
    { tag: [t.number, t.bool, t.null], color: v('number') },
    { tag: [t.comment, t.lineComment, t.blockComment], color: v('comment'), fontStyle: 'italic' },
    { tag: [t.invalid], color: v('invalid') },
    { tag: [t.link, t.url], color: v('selector'), textDecoration: 'underline' },
  ]);
}

function baseExtensions(placeholderText: string | undefined, ariaLabel: string) {
  return [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightActiveLine(),
    history(),
    drawSelection(),
    dropCursor(),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    EditorState.allowMultipleSelections.of(true),
    keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab]),
    EditorView.contentAttributes.of({ 'aria-label': ariaLabel }),
    placeholderText ? cmPlaceholder(placeholderText) : [],
  ];
}

export interface CodeEditorProps extends Omit<React.ComponentProps<'div'>, 'onChange' | 'defaultValue' | 'value'> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Extra CodeMirror extensions, added alongside whatever `language` auto-resolves (if anything). */
  extensions?: Extension[];
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  filename?: string;
  /** Also auto-selects syntax coloring when it matches a known grammar: json, html, css, javascript/js/jsx, typescript/ts/tsx, bash/shell/sh. Unrecognized values still just show as a header label. */
  language?: string;
  copy?: boolean;
  copyLabel?: string;
  clearable?: boolean;
  clearLabel?: string;
  /** Forces the code area (not the header) onto a fixed dark surface (Luna Pro Midnight) regardless of the page's own theme. */
  inverse?: boolean;
}

export function CodeEditor({
  value,
  defaultValue,
  onChange,
  extensions = [],
  readOnly = false,
  disabled = false,
  placeholder,
  minHeight = '8rem',
  maxHeight,
  id,
  filename,
  language,
  copy = false,
  copyLabel = 'Copy code',
  clearable = false,
  clearLabel = 'Clear',
  inverse = false,
  className,
  'aria-label': ariaLabel = 'Code editor',
  ...props
}: CodeEditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const langComp = useRef(new Compartment());
  const roComp = useRef(new Compartment());
  const themeComp = useRef(new Compartment());
  const isControlled = value !== undefined;
  const hasHeader = Boolean(filename || language || copy || clearable);
  const [liveText, setLiveText] = useState(() => (isControlled ? value : defaultValue) ?? '');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const copyResetTimer = useRef<ReturnType<typeof setTimeout>>();

  // Auto grammar from `language`, alongside any caller-supplied extensions
  // (not instead of them) — e.g. `language="json"` colors JSON out of the
  // box; pass `extensions` too for anything on top (a linter, folding, etc).
  const resolvedExtensions = useMemo(() => {
    const auto = language ? LANGUAGE_EXTENSIONS[language.toLowerCase()]?.() : undefined;
    return auto ? [auto, ...extensions] : extensions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, extensions]);

  useEffect(() => () => window.clearTimeout(copyResetTimer.current), []);

  useEffect(() => {
    if (!host.current) return;
    const startDoc = (isControlled ? value : defaultValue) ?? '';
    const sizeTheme = EditorView.theme({ '&': maxHeight ? { maxHeight } : {}, '.cm-content': { minHeight } });
    const state = EditorState.create({
      doc: startDoc,
      extensions: [
        baseExtensions(placeholder, ariaLabel),
        sizeTheme,
        themeComp.current.of([editorTheme(inverse), syntaxHighlighting(highlightStyle(inverse))]),
        langComp.current.of(resolvedExtensions),
        roComp.current.of(EditorState.readOnly.of(readOnly || disabled)),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) {
            const doc = u.state.doc.toString();
            onChangeRef.current?.(doc);
            setLiveText(doc);
          }
        }),
      ],
    });
    const v = new EditorView({ state, parent: host.current });
    view.current = v;
    return () => {
      v.destroy();
      view.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const v = view.current;
    if (!v || !isControlled) return;
    const cur = v.state.doc.toString();
    if (value !== cur) v.dispatch({ changes: { from: 0, to: cur.length, insert: value ?? '' } });
  }, [value, isControlled]);

  useEffect(() => {
    view.current?.dispatch({ effects: langComp.current.reconfigure(resolvedExtensions) });
  }, [resolvedExtensions]);

  useEffect(() => {
    view.current?.dispatch({ effects: roComp.current.reconfigure(EditorState.readOnly.of(readOnly || disabled)) });
  }, [readOnly, disabled]);

  useEffect(() => {
    view.current?.dispatch({ effects: themeComp.current.reconfigure([editorTheme(inverse), syntaxHighlighting(highlightStyle(inverse))]) });
  }, [inverse]);

  const handleClear = () => {
    const v = view.current;
    if (!v) return;
    const len = v.state.doc.length;
    if (len === 0) return;
    v.dispatch({ changes: { from: 0, to: len, insert: '' } });
    v.focus();
  };

  const flashCopyStatus = (next: 'copied' | 'error') => {
    window.clearTimeout(copyResetTimer.current);
    setCopyStatus(next);
    copyResetTimer.current = setTimeout(() => setCopyStatus('idle'), 1500);
  };
  const copyTooltipIntent = copyStatus === 'copied' ? 'success' : copyStatus === 'error' ? 'danger' : 'default';
  const copyTooltipText = copyStatus === 'copied' ? 'Copied!' : copyStatus === 'error' ? 'Failed to copy' : copyLabel;

  return (
    <div
      data-disabled={disabled || undefined}
      className={cn(
        'overflow-hidden rounded-[var(--size-border-radius-border-radius-xl)] border border-solid',
        // Same resting border in both surfaces — border-subtle already
        // reads fine against the dark Luna background too (it's what the
        // header's own border-b already uses there).
        'border-[var(--color-border-border-subtle)]',
        // Interaction states, same convention as TextField: primary-hover
        // on hover, solid primary while focused — in both surfaces.
        'hover:not-focus-within:border-[var(--color-border-border-primary-hover)]',
        'focus-within:border-[var(--color-border-border-primary)]',
        inverse ? 'bg-[var(--color-code-bg-inverse)]' : 'bg-[var(--color-code-bg)]',
        'font-body text-body-s shadow-xs transition-[border-color,box-shadow]',
        'focus-within:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
        disabled && 'pointer-events-none opacity-60',
        className,
      )}
      {...props}
    >
      {hasHeader && (
        // Header always stays on the regular (theme-reactive) surface —
        // `inverse` only forces the code area below it, per Мария's call.
        <div className="flex items-center gap-3 border-b border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] px-3 py-2">
          <div className="flex min-w-0 flex-1 items-baseline gap-2">
            {filename && <span className="truncate font-code text-body-m font-medium text-[var(--color-text-text)]">{filename}</span>}
            {language && (
              // size="sm" is a deliberate exception to the "external chip
              // = md" default (Мария's call) — this reads as a compact
              // inert tag beside the filename, not a standalone chip.
              <Chip tone="info" size="sm" interactive={false} className="shrink-0 uppercase">
                {language}
              </Chip>
            )}
          </div>
          {(clearable || copy) && (
            // xs-sized controls sit 4px apart (gap-1), not the outer
            // gap-3 that separates the label from this button group.
            <div className="flex items-center gap-1">
              {clearable && (
                <Button type="ghost" size="sm" onClick={handleClear} disabled={disabled || readOnly || liveText.length === 0}>
                  {clearLabel}
                </Button>
              )}
              {copy && (
                <Tooltip open={copyStatus !== 'idle' ? true : undefined}>
                  <TooltipTrigger asChild>
                    <CopyButton
                      value={liveText}
                      label={null}
                      aria-label={copyLabel}
                      size="sm"
                      type="ghost"
                      onCopied={() => flashCopyStatus('copied')}
                      onCopyError={() => flashCopyStatus('error')}
                    />
                  </TooltipTrigger>
                  <TooltipContent tone={copyTooltipIntent}>{copyTooltipText}</TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      )}
      <div ref={host} id={id} style={{ minHeight }} />
    </div>
  );
}
