import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Label } from './label';
import { Radio, RadioGroup } from './radio';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

// 8 options: inside the 6–15 range a Select is meant for.
const REGIONS = [
  ['eu-central', 'EU (Frankfurt)'],
  ['eu-west', 'EU (Ireland)'],
  ['eu-north', 'EU (Stockholm)'],
  ['us-east', 'US (Virginia)'],
  ['us-west', 'US (Oregon)'],
  ['ca', 'Canada (Montreal)'],
  ['ap-south', 'Asia Pacific (Mumbai)'],
  ['ap-se', 'Asia Pacific (Singapore)'],
] as const;

const regionItems = REGIONS.map(([value, label]) => (
  <SelectItem key={value} value={value}>
    {label}
  </SelectItem>
));

export const selectGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['One choice from 6–15 known options (up to 5 → RadioGroup, over 15 → Combobox).', 'Values people recognise rather than type: a region, a plan, a sort order.'],
  whenNotToUse: [
    { text: 'Up to 5 options — show them all', instead: 'RadioGroup or ToggleGroup' },
    { text: 'Long lists people search in', instead: 'Combobox' },
    { text: 'Several values at once', instead: 'CheckboxGroup or TagInput' },
    { text: 'Actions, not values', instead: 'DropdownMenu' },
  ],
  anatomy: [
    { part: 'Label', description: 'above the trigger.' },
    { part: 'Trigger', description: <>shows the value or a placeholder; <C>widthSize</C> / <C>heightSize</C> match TextField.</> },
    { part: 'Content', description: 'the list; can be grouped with labels and separators.' },
    { part: 'Item', description: 'one option; the selected one is checked.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex flex-col gap-2">
            <span id="gl-sel-billing-radio" className="font-body text-body-m font-medium text-[var(--color-text-text)]">
              Billing
            </span>
            <RadioGroup defaultValue="monthly" aria-labelledby="gl-sel-billing-radio">
              <Radio value="monthly" label="Monthly" />
              <Radio value="quarterly" label="Quarterly" />
              <Radio value="yearly" label="Yearly" />
            </RadioGroup>
          </div>
        ),
        caption: 'Up to 5 options: show them all as radios — compared at a glance, picked in one click.',
      },
      dont: {
        example: (
          <div className="flex flex-col gap-2">
            <Label htmlFor="gl-sel-billing">Billing</Label>
            <Select defaultValue="monthly">
              <SelectTrigger id="gl-sel-billing" widthSize="md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ),
        caption: 'Three options hidden in a select — an extra click to see what the choices even are.',
      },
    },
    {
      do: {
        example: (
          <div className="flex flex-col gap-2">
            <Label htmlFor="gl-sel-region">Data region</Label>
            <Select>
              <SelectTrigger id="gl-sel-region" widthSize="md">
                <SelectValue placeholder="Choose a region" />
              </SelectTrigger>
              <SelectContent>
                {regionItems}
              </SelectContent>
            </Select>
          </div>
        ),
        caption: '8 regions — in the 6–15 range a Select fits. No answer yet, so the placeholder says what to pick.',
      },
      dont: {
        example: (
          <div className="flex flex-col gap-2">
            <Label htmlFor="gl-sel-region2">Data region</Label>
            <Select defaultValue="eu-central">
              <SelectTrigger id="gl-sel-region2" widthSize="md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {regionItems}
              </SelectContent>
            </Select>
          </div>
        ),
        caption: 'A preselected answer to a question that matters gets accepted without being read.',
      },
    },
  ],
  a11y: [
    <>Label it: a <C>Label</C> with <C>htmlFor</C> on the trigger’s id, or <C>aria-label</C> on the trigger.</>,
    'Arrow keys move, typing jumps to a matching option, Escape closes without changing the value.',
    'Never navigate or submit on change — choosing an option should only choose it.',
  ],
};
