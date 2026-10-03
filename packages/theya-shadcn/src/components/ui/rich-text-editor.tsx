import { useEffect, useId, useRef, useState } from 'react';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { CharacterCount, Placeholder } from '@tiptap/extensions';
import {
  Bold,
  Code,
  CodeBrackets,
  Italic,
  Link as LinkIcon,
  List,
  NavArrowDown,
  NumberedListLeft,
  Quote,
  Redo,
  Strikethrough,
  Underline,
  Undo,
} from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from './dropdown-menu';
import { Label } from './label';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { textFieldVariants } from './text-field-variants';
import { Toolbar, ToolbarButton, ToolbarSeparator } from './toolbar';

/**
 * RichTextEditor — formatted text input: descriptions, notes, ticket
 * replies, announcements, email templates. On Tiptap (ProseMirror).
 *
 * The value is HTML (`value` / `defaultValue` / `onValueChange`); content is
 * styled with the same `.prose` rules as <Prose>, so what the user types
 * looks like what gets rendered later.
 *
 * Toolbar: text style (Paragraph / Heading 2 / Heading 3), bold, italic,
 * underline, strike, inline code, link, bullet / numbered list, quote, code
 * block, undo / redo — pick a subset with `tools`. It's one tab stop
 * (arrow keys move inside); the usual shortcuts work (⌘B, ⌘I, ⌘U, ⌘K for
 * link, ⌘Z / ⇧⌘Z, Markdown-style "## ", "- ", "1. ", "> ").
 *
 * Field chrome follows TextField: label, description, error, disabled, and
 * `maxLength` with a counter.
 */

export type RichTextTool =
  | 'textStyle'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'link'
  | 'bulletList'
  | 'orderedList'
  | 'blockquote'
  | 'codeBlock'
  | 'history';

export const RICH_TEXT_TOOLS_FULL: RichTextTool[] = ['textStyle', 'bold', 'italic', 'underline', 'strike', 'code', 'link', 'bulletList', 'orderedList', 'blockquote', 'codeBlock', 'history'];
export const RICH_TEXT_TOOLS_BASIC: RichTextTool[] = ['bold', 'italic', 'link', 'bulletList', 'orderedList'];

export interface RichTextEditorProps {
  /** HTML. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (html: string) => void;
  /** Gives access to the Tiptap editor (e.g. to read JSON or text). */
  onEditorReady?: (editor: Editor) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** `true` for error styling only, or a message. */
  error?: boolean | React.ReactNode;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  /** Which toolbar controls to show, in order. `[]` hides the toolbar. */
  tools?: RichTextTool[];
  /** Character limit with a counter under the field (typing past it is blocked). */
  maxLength?: number;
  /** Editing area height. */
  minHeight?: number | string;
  maxHeight?: number | string;
  /** Hidden input with the HTML, for plain form posts. */
  name?: string;
  className?: string;
  'aria-label'?: string;
}

/* ------------------------------------------------------------------ */

function Tool({
  label,
  shortcut,
  icon,
  active,
  disabled,
  onClick,
}: {
  label: string;
  shortcut?: string;
  icon: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <ToolbarButton
      size="sm"
      iconOnly
      aria-label={label}
      aria-keyshortcuts={shortcut}
      aria-pressed={active}
      title={shortcut ? `${label} (${shortcut.replace('Meta', '⌘').replace(/\+/g, '')})` : label}
      disabled={disabled}
      // Keep the text selection: don't move focus out of the editor on mouse press.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="aria-pressed:bg-[var(--color-bg-neutral-bg-neutral-subtle)] aria-pressed:text-[var(--color-text-text)]"
    >
      {icon}
    </ToolbarButton>
  );
}

function LinkTool({ editor, disabled }: { editor: Editor; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [href, setHref] = useState('');
  const inputId = useId();
  const active = useEditorState({ editor, selector: ({ editor: e }) => e.isActive('link') });

  const openWithCurrent = (next: boolean) => {
    if (next) setHref((editor.getAttributes('link').href as string | undefined) ?? '');
    setOpen(next);
  };

  // ⌘K opens the link popover from the editor.
  useEffect(() => {
    const dom = editor.view.dom;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openWithCurrent(true);
      }
    };
    dom.addEventListener('keydown', onKey);
    return () => dom.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const apply = () => {
    const url = href.trim();
    const chain = editor.chain().focus().extendMarkRange('link');
    if (!url) chain.unsetLink().run();
    else chain.setLink({ href: /^[a-z][a-z0-9+.-]*:|^\/|^#/i.test(url) ? url : `https://${url}` }).run();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={openWithCurrent}>
      <PopoverTrigger asChild>
        <ToolbarButton
          size="sm"
          iconOnly
          aria-label="Link"
          aria-keyshortcuts="Meta+K"
          aria-pressed={active}
          title="Link (⌘K)"
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          className="aria-pressed:bg-[var(--color-bg-neutral-bg-neutral-subtle)] aria-pressed:text-[var(--color-text-text)]"
        >
          <LinkIcon />
        </ToolbarButton>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80" aria-label="Link" onCloseAutoFocus={(e) => (e.preventDefault(), editor.commands.focus())}>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            apply();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={inputId}>URL</Label>
            <input
              id={inputId}
              autoFocus
              type="text"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              placeholder="https://example.com"
              value={href}
              onChange={(e) => setHref(e.target.value)}
              className={textFieldVariants({ heightSize: 'sm' })}
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            {active && (
              <Button
                type="button"
                size="sm"
                appearance="ghost"
                tone="danger"
                className="me-auto"
                onClick={() => {
                  editor.chain().focus().extendMarkRange('link').unsetLink().run();
                  setOpen(false);
                }}
              >
                Remove link
              </Button>
            )}
            <Button type="submit" size="sm">
              {active ? 'Update' : 'Add link'}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}

const TEXT_STYLES = [
  { value: 'p', label: 'Paragraph' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
] as const;

function TextStyleTool({ editor, disabled }: { editor: Editor; disabled?: boolean }) {
  const current = useEditorState({
    editor,
    selector: ({ editor: e }) => (e.isActive('heading', { level: 2 }) ? 'h2' : e.isActive('heading', { level: 3 }) ? 'h3' : 'p'),
  });
  const set = (v: string) => {
    const chain = editor.chain().focus();
    if (v === 'p') chain.setParagraph().run();
    else chain.setHeading({ level: v === 'h2' ? 2 : 3 }).run();
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ToolbarButton size="sm" disabled={disabled} aria-label={`Text style: ${TEXT_STYLES.find((s) => s.value === current)?.label}`} className="w-28 justify-between gap-1">
          {TEXT_STYLES.find((s) => s.value === current)?.label}
          <NavArrowDown aria-hidden />
        </ToolbarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" size="sm" onCloseAutoFocus={(e) => (e.preventDefault(), editor.commands.focus())}>
        <DropdownMenuRadioGroup value={current} onValueChange={set}>
          {TEXT_STYLES.map((s) => (
            <DropdownMenuRadioItem key={s.value} value={s.value}>
              {s.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EditorToolbar({ editor, tools, disabled }: { editor: Editor; tools: RichTextTool[]; disabled?: boolean }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      strike: e.isActive('strike'),
      code: e.isActive('code'),
      bulletList: e.isActive('bulletList'),
      orderedList: e.isActive('orderedList'),
      blockquote: e.isActive('blockquote'),
      codeBlock: e.isActive('codeBlock'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const run = (fn: (c: ReturnType<Editor['chain']>) => ReturnType<Editor['chain']>) => () => fn(editor.chain().focus()).run();

  const groups: React.ReactNode[][] = [[], [], [], []];
  for (const tool of tools) {
    switch (tool) {
      case 'textStyle':
        groups[0].push(<TextStyleTool key={tool} editor={editor} disabled={disabled} />);
        break;
      case 'bold':
        groups[1].push(<Tool key={tool} label="Bold" shortcut="Meta+B" icon={<Bold />} active={s.bold} disabled={disabled} onClick={run((c) => c.toggleBold())} />);
        break;
      case 'italic':
        groups[1].push(<Tool key={tool} label="Italic" shortcut="Meta+I" icon={<Italic />} active={s.italic} disabled={disabled} onClick={run((c) => c.toggleItalic())} />);
        break;
      case 'underline':
        groups[1].push(<Tool key={tool} label="Underline" shortcut="Meta+U" icon={<Underline />} active={s.underline} disabled={disabled} onClick={run((c) => c.toggleUnderline())} />);
        break;
      case 'strike':
        groups[1].push(<Tool key={tool} label="Strikethrough" shortcut="Meta+Shift+S" icon={<Strikethrough />} active={s.strike} disabled={disabled} onClick={run((c) => c.toggleStrike())} />);
        break;
      case 'code':
        groups[1].push(<Tool key={tool} label="Inline code" shortcut="Meta+E" icon={<Code />} active={s.code} disabled={disabled} onClick={run((c) => c.toggleCode())} />);
        break;
      case 'link':
        groups[1].push(<LinkTool key={tool} editor={editor} disabled={disabled} />);
        break;
      case 'bulletList':
        groups[2].push(<Tool key={tool} label="Bulleted list" shortcut="Meta+Shift+8" icon={<List />} active={s.bulletList} disabled={disabled} onClick={run((c) => c.toggleBulletList())} />);
        break;
      case 'orderedList':
        groups[2].push(<Tool key={tool} label="Numbered list" shortcut="Meta+Shift+7" icon={<NumberedListLeft />} active={s.orderedList} disabled={disabled} onClick={run((c) => c.toggleOrderedList())} />);
        break;
      case 'blockquote':
        groups[2].push(<Tool key={tool} label="Quote" shortcut="Meta+Shift+B" icon={<Quote />} active={s.blockquote} disabled={disabled} onClick={run((c) => c.toggleBlockquote())} />);
        break;
      case 'codeBlock':
        groups[2].push(<Tool key={tool} label="Code block" shortcut="Meta+Alt+C" icon={<CodeBrackets />} active={s.codeBlock} disabled={disabled} onClick={run((c) => c.toggleCodeBlock())} />);
        break;
      case 'history':
        groups[3].push(
          <Tool key="undo" label="Undo" shortcut="Meta+Z" icon={<Undo />} disabled={disabled || !s.canUndo} onClick={run((c) => c.undo())} />,
          <Tool key="redo" label="Redo" shortcut="Meta+Shift+Z" icon={<Redo />} disabled={disabled || !s.canRedo} onClick={run((c) => c.redo())} />,
        );
        break;
    }
  }
  const filled = groups.filter((g) => g.length);

  return (
    <Toolbar aria-label="Formatting" className="flex-wrap gap-0.5 border-b border-solid border-[var(--color-border-border-subtler)] p-1.5">
      {filled.map((group, i) => (
        <div key={i} className="contents">
          {i > 0 && <ToolbarSeparator orientation="vertical" />}
          {group}
        </div>
      ))}
    </Toolbar>
  );
}

/* ------------------------------------------------------------------ */

const size = (v: number | string | undefined) => (typeof v === 'number' ? `${v}px` : v);

export function RichTextEditor({
  value,
  defaultValue = '',
  onValueChange,
  onEditorReady,
  label,
  description,
  error,
  required,
  placeholder,
  disabled = false,
  tools = RICH_TEXT_TOOLS_FULL,
  maxLength,
  minHeight = 160,
  maxHeight,
  name,
  className,
  'aria-label': ariaLabel,
}: RichTextEditorProps) {
  const labelId = useId();
  const descId = useId();
  const errorId = useId();
  const hasError = Boolean(error);
  const errorMessage = typeof error === 'boolean' ? null : error;
  const [html, setHtml] = useState(value ?? defaultValue);
  const onChangeRef = useRef(onValueChange);
  onChangeRef.current = onValueChange;

  const describedBy = [description && !errorMessage ? descId : null, errorMessage ? errorId : null].filter(Boolean).join(' ') || undefined;

  const attributes: Record<string, string> = {
    role: 'textbox',
    'aria-multiline': 'true',
    ...(label ? { 'aria-labelledby': labelId } : ariaLabel ? { 'aria-label': ariaLabel } : {}),
    ...(describedBy ? { 'aria-describedby': describedBy } : {}),
    ...(hasError ? { 'aria-invalid': 'true' } : {}),
    ...(required ? { 'aria-required': 'true' } : {}),
    ...(disabled ? { 'aria-disabled': 'true' } : {}),
    class: 'prose max-w-none min-h-full px-3 py-2.5 outline-none',
    'data-size': 'sm',
  };
  const attributesKey = JSON.stringify(attributes);

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    content: value ?? defaultValue,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https', HTMLAttributes: { rel: 'noopener noreferrer nofollow' } },
      }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
      ...(maxLength ? [CharacterCount.configure({ limit: maxLength })] : []),
    ],
    editorProps: { attributes },
    onUpdate: ({ editor: e }) => {
      const next = e.isEmpty ? '' : e.getHTML();
      setHtml(next);
      onChangeRef.current?.(next);
    },
  });

  useEffect(() => {
    if (editor) onEditorReady?.(editor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  // ARIA (error, description) can change after mount; editorProps are read once otherwise.
  useEffect(() => {
    editor?.setOptions({ editorProps: { attributes } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, attributesKey]);

  // Follow an external value without resetting the cursor on our own updates.
  useEffect(() => {
    if (!editor || value === undefined) return;
    const currentHtml = editor.isEmpty ? '' : editor.getHTML();
    if (value !== currentHtml) editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  const count = useEditorState({
    editor,
    selector: ({ editor: e }) => (e && maxLength ? (e.storage.characterCount?.characters?.() ?? 0) : 0),
  }) ?? 0;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <Label id={labelId} onClick={() => editor?.commands.focus()}>
          {label}
          {required && (
            <span aria-hidden className="ms-0.5 text-[var(--color-text-text-danger)]">
              *
            </span>
          )}
        </Label>
      )}
      <div
        data-disabled={disabled || undefined}
        className={cn(
          'flex flex-col overflow-hidden rounded-[var(--size-border-radius-border-radius-lg)] border border-solid bg-[var(--color-bg-input-bg-input)]',
          'transition-[border-color,box-shadow] duration-standard ease-enter motion-reduce:transition-none',
          hasError
            ? 'border-[var(--color-border-border-danger)] has-[.ProseMirror:focus-visible]:focus-ring-error'
            : 'border-[var(--color-border-border-default)] hover:border-[var(--color-border-border-primary)] has-[.ProseMirror:focus]:border-[var(--color-border-border-primary)] has-[.ProseMirror:focus-visible]:focus-ring',
          disabled && 'pointer-events-none border-[var(--color-border-border-subtle)] bg-[var(--color-bg-neutral-bg-neutral-subtler)] opacity-70',
        )}
      >
        {editor && tools.length > 0 && <EditorToolbar editor={editor} tools={tools} disabled={disabled} />}
        <div
          className={cn(
            'overflow-y-auto scrollbar-thin text-[var(--color-text-text)]',
            // Placeholder on the first empty paragraph (Tiptap sets data-placeholder + is-editor-empty).
            '[&_.is-editor-empty:first-child]:before:pointer-events-none [&_.is-editor-empty:first-child]:before:float-left [&_.is-editor-empty:first-child]:before:h-0',
            '[&_.is-editor-empty:first-child]:before:text-[var(--color-text-text-subtler)] [&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]',
          )}
          style={{ minHeight: size(minHeight), maxHeight: size(maxHeight) }}
          onClick={(e) => {
            // Clicking the empty area under the text focuses the end of the document.
            if (e.target === e.currentTarget) editor?.commands.focus('end');
          }}
        >
          <EditorContent editor={editor} className="h-full [&>.ProseMirror]:min-h-[inherit]" />
        </div>
      </div>
      {(description || errorMessage || maxLength) && (
        <div className="flex items-start gap-3 text-body-s">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {errorMessage && (
              <p id={errorId} className="text-[var(--color-text-text-danger)]">
                {errorMessage}
              </p>
            )}
            {description && !errorMessage && (
              <p id={descId} className="text-[var(--color-text-text-subtle)]">
                {description}
              </p>
            )}
          </div>
          {maxLength && (
            <p className={cn('shrink-0 tabular-nums', count >= maxLength ? 'text-[var(--color-text-text-danger)]' : 'text-[var(--color-text-text-subtle)]')}>
              {count}/{maxLength}
              <span className="sr-only"> characters</span>
            </p>
          )}
        </div>
      )}
      {name && <input type="hidden" name={name} value={html} />}
    </div>
  );
}
