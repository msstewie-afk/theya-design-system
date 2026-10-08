import { Bold } from 'iconoir-react';
import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Switch } from './switch';
import { Label } from './label';
import { Toggle } from './toggle';

export const toggleGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A button that stays pressed: bold in an editor, “Show archived”, pin.', 'In toolbars, where a switch would look out of place.'],
  whenNotToUse: [
    { text: 'A setting with a label and an immediate effect', instead: 'Switch' },
    { text: 'One of several options', instead: 'ToggleGroup type="single"' },
    { text: 'An action that runs once', instead: 'Button' },
  ],
  anatomy: [
    { part: 'Button', description: <><C>appearance</C> ghost / tonal / outlined, <C>size</C>; pressed state from <C>pressed</C>.</> },
    { part: 'Icon or label', description: 'icon-only needs aria-label.' },
  ],
  doDont: [
    {
      do: { example: <Toggle aria-label="Bold" defaultPressed><Bold /></Toggle>, caption: 'A toolbar control that stays on.' },
      dont: { example: <Toggle>Email alerts</Toggle>, caption: 'A setting dressed as a button — it reads like an action, not a state.' },
    },
    {
      do: {
        example: (
          <div className="flex items-center gap-2">
            <Switch id="gl-tg-sw" />
            <Label htmlFor="gl-tg-sw">Email alerts</Label>
          </div>
        ),
        caption: 'Settings use Switch with a label.',
      },
      dont: { example: <Toggle appearance="outlined">On</Toggle>, caption: '“On” on a button: on what? and does pressing it turn it off?' },
    },
  ],
  a11y: [<>Announced with <C>aria-pressed</C>; the name stays the same in both states.</>, 'Icon-only toggles need aria-label.'],
};
