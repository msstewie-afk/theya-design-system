import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Label } from './label';
import { Radio, RadioGroup } from './radio';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

export const selectGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['One choice from about 5–15 known options when space is tight.', 'Values people recognise rather than type: a region, a plan, a sort order.'],
  whenNotToUse: [
    { text: 'Two to four options — show them all', instead: 'RadioGroup or ToggleGroup' },
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
          <RadioGroup defaultValue="monthly" aria-label="Billing">
            <Radio value="monthly" label="Monthly" />
            <Radio value="yearly" label="Yearly" />
          </RadioGroup>
        ),
        caption: 'Two options: show both, one click.',
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
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ),
        caption: 'A select hides two options behind an extra click.',
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
                <SelectItem value="eu">EU (Frankfurt)</SelectItem>
                <SelectItem value="us">US (Virginia)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ),
        caption: 'No answer yet? The placeholder says what to pick.',
      },
      dont: {
        example: (
          <div className="flex flex-col gap-2">
            <Label htmlFor="gl-sel-region2">Data region</Label>
            <Select defaultValue="eu">
              <SelectTrigger id="gl-sel-region2" widthSize="md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eu">EU (Frankfurt)</SelectItem>
                <SelectItem value="us">US (Virginia)</SelectItem>
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
