import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { TextArea } from './textarea';
import { TextField } from './text-field';

export const textareaGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Text that can run to several lines: a description, a message, notes, a list one per line.'],
  whenNotToUse: [
    { text: 'One short line', instead: 'TextField' },
    { text: 'Code or config', instead: 'CodeEditor' },
    { text: 'A chat-style prompt with send', instead: 'PromptArea' },
  ],
  anatomy: [
    { part: 'Label', description: <>with required * / <C>optional</C>.</> },
    { part: 'Field', description: 'resizable vertically; height shows the expected length.' },
    { part: 'Description / error', description: 'limits and format; error replaces the description.' },
  ],
  doDont: [
    {
      do: { example: <div className="w-72"><TextArea label="Message" description="Up to 500 characters." /></div>, caption: 'Room that matches the expected text, and the limit up front.' },
      dont: { example: <TextField label="Message" widthSize="lg" />, caption: 'A one-line field for a paragraph scrolls the text out of sight.' },
    },
  ],
  a11y: ['Label, description and error are linked like TextField’s.', 'If there’s a limit, show the count as text, not only by stopping input.'],
};
