import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { InlineEdit } from './inline-edit';
import { TextField } from './text-field';

export const inlineEditGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['Renaming one value where it’s shown: a site name, a page title, a note.', 'Values people change now and then, not every time they visit.'],
  whenNotToUse: [
    { text: 'Several related fields saved together', instead: 'a form with Save' },
    { text: 'Values that need confirmation or have consequences (a domain, an email)', instead: 'a dialog or a form' },
    { text: 'Something people edit all the time', instead: 'an always-visible TextField' },
  ],
  anatomy: [
    { part: 'Display', description: 'the value as text, in the exact place and size the field will take.' },
    { part: 'Field', description: <>TextField (or TextArea with <C>multiline</C>) while editing.</> },
    { part: 'Save / Cancel', description: 'small buttons next to the field.' },
    { part: 'Error', optional: true, description: <>from <C>validate</C> or a rejected <C>onSave</C>; the field stays open.</> },
  ],
  doDont: [
    {
      do: { example: <InlineEdit label="Site name" defaultValue="Seashell shop" />, caption: 'One value, edited where it’s read.' },
      dont: {
        example: (
          <div className="flex w-64 flex-col gap-2">
            <TextField label="Site name" defaultValue="Seashell shop" widthSize="full" />
            <TextField label="Domain" defaultValue="seashell.shop" widthSize="full" />
          </div>
        ),
        caption: 'A set of fields each saving on its own is a form in disguise — people won’t know what’s saved.',
      },
    },
  ],
  a11y: [
    <>The display is a button named “Edit {'{label}'}”; <C>label</C> is required.</>,
    'Enter saves (⌘/Ctrl+Enter in multiline), Escape cancels; focus returns to the text afterwards.',
    'A failed save keeps what was typed and shows why.',
  ],
};
