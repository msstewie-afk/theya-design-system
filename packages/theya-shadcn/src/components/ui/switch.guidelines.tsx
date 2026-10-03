import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Checkbox } from './checkbox';
import { Switch } from './switch';

export const switchGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A setting that takes effect the moment it’s flipped — no Save button.', 'Turning a feature, service or notification on and off.'],
  whenNotToUse: [
    { text: 'A choice that applies when a form is submitted', instead: 'Checkbox' },
    { text: 'Two named options that aren’t on/off (Monthly / Yearly)', instead: 'RadioGroup or ToggleGroup' },
    { text: 'A button that starts an action', instead: 'Button' },
  ],
  anatomy: [
    { part: 'Track and thumb', description: <>on/off; <C>tone</C> warning or danger for risky settings.</> },
    { part: 'Label', description: 'names the setting, not the action (“Auto-renew”, not “Turn on auto-renew”).' },
    { part: 'Description', optional: true, description: 'what changes when it’s on.' },
    { part: 'Check icon', optional: true, description: <><C>checkIcon</C> marks “on” with a shape, not only color.</> },
  ],
  doDont: [
    {
      do: { example: <Switch defaultChecked label="Auto-renew" description="Renews 14 days before expiry." />, caption: 'Applies at once and says what “on” does.' },
      dont: {
        example: (
          <div className="flex flex-col items-start gap-3">
            <Switch label="Auto-renew" />
            <Checkbox label="Accept the terms" />
          </div>
        ),
        caption: 'A switch inside a form that still needs Save — use a checkbox for both.',
      },
    },
  ],
  a11y: [
    <>It’s a <C>role="switch"</C>: announced as “on/off”, toggled with Space.</>,
    <>Without a visible label pass <C>aria-label</C> — in a table row, name the row (“Auto-renew for seashell.shop”).</>,
    'If flipping it fails, set it back and say why next to it — don’t leave a switch showing a state the server didn’t accept.',
  ],
};
