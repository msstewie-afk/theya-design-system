import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Fieldset } from './fieldset';
import { Switch } from './switch';
import { TextField } from './text-field';

export const fieldsetGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Grouping related controls under one name: an address, notification settings, a section of a long form.', <><C>disabled</C> on the fieldset to switch off a whole group at once.</>],
  whenNotToUse: [
    { text: 'A single field', instead: 'Label or the field’s own label' },
    { text: 'Visual grouping only, nothing to name', instead: 'spacing or Separator' },
    { text: 'A group of checkboxes as one value', instead: 'CheckboxGroup' },
  ],
  anatomy: [
    { part: 'Legend', description: <><C>legend</C> — section title style (body-l, semibold).</> },
    { part: 'Description', optional: true, description: 'one line under the legend.' },
    { part: 'Content', description: 'controls stacked with a 16px gap.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <Fieldset legend="Email notifications" description="Sent to dana@seashell.dev." className="w-72">
            <Switch label="Weekly report" defaultChecked />
            <Switch label="Billing alerts" defaultChecked />
            <Switch label="Product news" />
          </Fieldset>
        ),
        caption: 'One legend for related settings — read with each switch.',
      },
      dont: {
        example: (
          <Fieldset legend="Email" className="w-72">
            <TextField label="Email" widthSize="full" />
          </Fieldset>
        ),
        caption: 'A fieldset around one field: the name is said twice.',
      },
    },
  ],
  a11y: [
    'Screen readers announce the legend when focus enters the group.',
    <>Native <C>disabled</C> cascades to every control inside.</>,
    'Don’t nest fieldsets more than one level — legends pile up in announcements.',
  ],
};
