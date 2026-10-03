import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { CodeBlock } from './code-block';
import { TextField } from './text-field';

export const codeBlockGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'A command, snippet or config the user reads and copies: install steps, a DNS record, an API example.',
    'Generated output shown as-is, where exact characters matter.',
  ],
  whenNotToUse: [
    { text: 'The user edits the code', instead: 'CodeEditor' },
    { text: 'A streaming log or console output', instead: 'Terminal' },
    { text: 'Showing what changed between two versions', instead: 'DiffViewer' },
    { text: 'One short token inside a sentence (a path, a flag)', instead: 'inline <code> or Kbd for keys' },
    { text: 'A single secret or value to copy, like an API key', instead: 'TextField read-only with CopyButton' },
  ],
  anatomy: [
    { part: 'Header', description: <>filename or language label; appears only with <C>filename</C> / <C>language</C>.</>, optional: true },
    { part: 'Code', description: 'mono, keeps whitespace, scrolls horizontally instead of wrapping.' },
    { part: 'Copy button', description: <>copies the exact <C>code</C> string; in the header, or floating top-right without one.</>, optional: true },
  ],
  doDont: [
    {
      do: {
        example: <div className="w-80"><CodeBlock language="bash" code="wp cache flush" /></div>,
        caption: 'Only the command — Copy gives exactly what to paste.',
      },
      dont: {
        example: <div className="w-80"><CodeBlock language="bash" code={'$ wp cache flush\nSuccess: The cache was flushed.'} /></div>,
        caption: 'A prompt sign and sample output get copied along and break the paste.',
      },
    },
    {
      do: {
        example: <div className="w-80"><CodeBlock filename="nginx.conf" code={'location /static/ {\n  expires 30d;\n}'} /></div>,
        caption: 'Multi-line config in a block with its filename.',
      },
      dont: {
        example: <TextField label="nginx.conf" defaultValue="location /static/ { expires 30d; }" widthSize="lg" />,
        caption: 'Code squeezed into a text field loses line breaks and indentation.',
      },
    },
  ],
  a11y: [
    'The code area is a tab stop, so long lines can be scrolled with the keyboard.',
    <>The copy button is named (<C>copyLabel</C>) and confirms with a tooltip; name it after the content when there are several blocks (“Copy install command”).</>,
    'Introduce the block with text — what it is and where to run it; the code itself is not a description.',
  ],
};
