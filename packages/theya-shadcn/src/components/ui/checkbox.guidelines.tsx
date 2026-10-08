import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Checkbox } from './checkbox';
import { Label } from './label';
import { Switch } from './switch';

export const checkboxGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Independent yes/no choices that apply when the form is saved.', 'Choosing several items from a list, and selecting rows for bulk actions.'],
  whenNotToUse: [
    { text: 'A setting that takes effect immediately', instead: 'Switch' },
    { text: 'Exactly one of several options', instead: 'RadioGroup' },
    { text: 'Many options people search through', instead: 'Combobox or TagInput' },
  ],
  anatomy: [
    { part: 'Box', description: <>checked, unchecked or <C>indeterminate</C> (some children selected).</> },
    { part: 'Label', description: 'clickable, says what “on” means.' },
    { part: 'Description', optional: true, description: 'a line under the label for consequences.' },
    { part: 'Group legend', optional: true, description: <>for several related boxes — <C>CheckboxGroup</C> wraps them in a fieldset.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex items-center gap-2">
            <Checkbox id="gl-cb-news" />
            <Label htmlFor="gl-cb-news">Send me product news</Label>
          </div>
        ),
        caption: 'Worded positively: checked means yes.',
      },
      dont: {
        example: (
          <div className="flex items-center gap-2">
            <Checkbox id="gl-cb-news2" />
            <Label htmlFor="gl-cb-news2">Don’t send me product news</Label>
          </div>
        ),
        caption: 'A negative label turns “checked” into a double negative.',
      },
    },
    {
      do: {
        example: (
          <div className="flex items-center gap-2">
            <Switch id="gl-cb-sw" defaultChecked />
            <Label htmlFor="gl-cb-sw">Email alerts</Label>
          </div>
        ),
        caption: 'Takes effect at once (no Save) — a switch.',
      },
      dont: {
        example: (
          <div className="flex items-center gap-2">
            <Checkbox id="gl-cb-alerts" defaultChecked />
            <Label htmlFor="gl-cb-alerts">Email alerts</Label>
          </div>
        ),
        caption: 'A checkbox that applies instantly surprises people who expect a Save.',
      },
    },
  ],
  a11y: [
    <>Every box needs a label — a <C>Label</C> with <C>htmlFor</C>, or <C>aria-label</C> in a table row (“Select seashell.shop”).</>,
    <>Indeterminate is announced as “mixed”; use it only for a parent of partly selected children.</>,
    <>Group related boxes in <C>CheckboxGroup</C> so the legend is read with each option.</>,
    'Space toggles; the whole label is a click target.',
  ],
};
