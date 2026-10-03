import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { CodeEditor } from './code-editor';
import { TextArea } from './textarea';

export const codeEditorGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'Editing config, templates, rules or scripts in the product: JSON, HTML, CSS, JS/TS, shell.',
    <>Long code shown read-only where line numbers and selection help (<C>readOnly</C>).</>,
  ],
  whenNotToUse: [
    { text: 'A short snippet to read and copy', instead: 'CodeBlock' },
    { text: 'Prose with formatting', instead: 'RichTextEditor' },
    { text: 'Plain multi-line text', instead: 'TextArea' },
    { text: 'Comparing versions', instead: 'DiffViewer' },
  ],
  anatomy: [
    { part: 'Header', description: <>filename / language, with Copy and Clear on the right (<C>copy</C>, <C>clearable</C>).</>, optional: true },
    { part: 'Gutter', description: 'line numbers.' },
    { part: 'Editing area', description: <>syntax color from <C>language</C>; grows between <C>minHeight</C> and <C>maxHeight</C>, then scrolls.</> },
  ],
  doDont: [
    {
      do: {
        example: <div className="w-80"><CodeEditor aria-label="Redirect rules" filename="redirects.json" language="json" defaultValue={'{\n  "/old": "/new"\n}'} minHeight="5rem" /></div>,
        caption: 'Language set — brackets, indentation and color help avoid syntax errors.',
      },
      dont: {
        example: <div className="w-80"><TextArea aria-label="Redirect rules" defaultValue={'{\n  "/old": "/new"\n}'} rows={3} /></div>,
        caption: 'A plain textarea for JSON: no line numbers, Tab leaves the field.',
      },
    },
  ],
  a11y: [
    <>Always give an <C>aria-label</C> (or a visible label referenced by it) — it names the editing area.</>,
    'Tab indents inside the editor. To leave with the keyboard press Esc, then Tab — say so near editors in forms.',
    'Validate on save and point to the line in the error message; color alone doesn’t mark a syntax error.',
    <>Copy and Clear buttons are named (<C>copyLabel</C>, <C>clearLabel</C>).</>,
  ],
};
