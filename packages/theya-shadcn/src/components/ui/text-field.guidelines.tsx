import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { TextField } from './text-field';

export const textFieldGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Short free text on one line: a name, an email, a domain, a URL, a code.', 'With a visible label above it, every time.'],
  whenNotToUse: [
    { text: 'More than a line of text', instead: 'TextArea' },
    { text: 'Picking from known values', instead: 'Select or Combobox' },
    { text: 'A number people step up and down', instead: 'NumberField' },
    { text: 'A password', instead: 'Password' },
    { text: 'A phone number', instead: 'PhoneField' },
    { text: 'Free text with suggestions', instead: 'Autocomplete' },
  ],
  anatomy: [
    { part: 'Label', description: <>always visible; required fields get *, optional ones “(optional)” via <C>optional</C>.</> },
    { part: 'Input', description: <>with optional <C>leftIcon</C> / <C>rightIcon</C>; a clear button appears when filled.</> },
    { part: 'Description', optional: true, description: 'help shown before typing: format, limits.' },
    { part: 'Message', optional: true, description: <><C>error</C> or <C>success</C> text; replaces the description while shown.</> },
  ],
  doDont: [
    {
      do: { example: <TextField label="Domain" placeholder="example.com" widthSize="md" />, caption: 'Label above; the placeholder only shows an example.' },
      dont: { example: <TextField aria-label="Domain" placeholder="Domain" widthSize="md" />, caption: 'Placeholder as the label disappears as soon as people type.' },
    },
    {
      do: { example: <TextField label="Email" defaultValue="dana@seashell" error="Add the domain ending, like .com." widthSize="md" />, caption: 'The error says what’s wrong and how to fix it.' },
      dont: { example: <TextField label="Email" defaultValue="dana@seashell" error="Invalid input." widthSize="md" />, caption: '“Invalid input” makes people guess.' },
    },
    {
      do: { example: <TextField label="Verification code" widthSize="sm" />, caption: <>Width hints at the expected length (<C>widthSize</C>).</> },
      dont: { example: <TextField label="Verification code" widthSize="full" />, caption: 'A 6-digit code in a full-width field reads like “type a paragraph here”.' },
    },
  ],
  a11y: [
    <>Pass <C>label</C> (or a <C>Label</C> with <C>htmlFor</C>); <C>aria-label</C> only where a visible label truly can’t exist.</>,
    <>Description and error are linked with <C>aria-describedby</C>; an error also sets <C>aria-invalid</C>.</>,
    <>Set <C>type</C>, <C>inputMode</C> and <C>autoComplete</C> — the right keyboard on phones and autofill everywhere.</>,
    'Validate on leaving the field, re-check live once an error shows; never while someone types into an empty field.',
  ],
};
