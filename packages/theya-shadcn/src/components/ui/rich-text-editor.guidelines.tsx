import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { RichTextEditor, RICH_TEXT_TOOLS_BASIC } from './rich-text-editor';
import { TextField } from './text-field';

export const richTextEditorGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'Text that is published or sent with formatting: announcements, product descriptions, email templates, ticket replies.',
    <>Short replies and comments with a reduced toolbar (<C>RICH_TEXT_TOOLS_BASIC</C>).</>,
  ],
  whenNotToUse: [
    { text: 'Plain multi-line text', instead: 'TextArea' },
    { text: 'One line (a title, a name)', instead: 'TextField' },
    { text: 'Code, config, Markdown source', instead: 'CodeEditor' },
    { text: 'Long documents with layout', instead: 'a dedicated editor or a doc tool' },
  ],
  anatomy: [
    { part: 'Label / description', description: 'as in TextField.' },
    { part: 'Toolbar', description: <>controls from <C>tools</C>, in order; <C>[]</C> hides it.</>, optional: true },
    { part: 'Editing area', description: <>styled like <C>Prose</C>; grows between <C>minHeight</C> and <C>maxHeight</C>, then scrolls.</> },
    { part: 'Counter', description: <>with <C>maxLength</C>; typing past it is blocked.</>, optional: true },
    { part: 'Error', description: 'message under the field.', optional: true },
  ],
  doDont: [
    {
      do: {
        example: <div className="w-96"><RichTextEditor label="Reply" tools={RICH_TEXT_TOOLS_BASIC} placeholder="Write a reply…" minHeight={72} /></div>,
        caption: 'A reply needs bold, links and lists — nothing more.',
      },
      dont: {
        example: <div className="w-96"><RichTextEditor label="Reply" placeholder="Write a reply…" minHeight={72} /></div>,
        caption: 'Headings, code blocks and quotes for a two-line reply: a wall of buttons.',
      },
    },
    {
      do: { example: <TextField label="Announcement title" defaultValue="Scheduled maintenance" widthSize="lg" />, caption: 'A title is one line — a text field.' },
      dont: {
        example: <div className="w-96"><RichTextEditor label="Announcement title" defaultValue="<p>Scheduled maintenance</p>" tools={['bold', 'italic']} minHeight={40} /></div>,
        caption: 'Formatting a title invites bold-italic headlines that break the page style.',
      },
    },
  ],
  a11y: [
    <>Always a label (<C>label</C> or <C>aria-label</C>); the area is a multi-line textbox with its description, error and required state.</>,
    'The toolbar is one tab stop with arrow keys inside; buttons show pressed state and their shortcuts (⌘B, ⌘I, ⌘K…).',
    'Tab leaves the editor (inside a list it nests the item) — focus isn’t trapped.',
    'Headings in the text style menu start at H2, so content never adds a second H1 to the page.',
  ],
};
