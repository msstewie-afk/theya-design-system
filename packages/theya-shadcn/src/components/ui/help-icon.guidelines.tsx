import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { HelpIcon } from './help-icon';
import { Label } from './label';
import { TextField } from './text-field';

export const helpIconGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['One line of optional background next to a label, a column header or a stat: what a term means, why a setting exists.'],
  whenNotToUse: [
    { text: 'Instructions needed to fill a field', instead: 'the field’s description' },
    { text: 'Long explanations or links', instead: 'a description, Popover or docs link' },
  ],
  anatomy: [
    { part: 'Button', description: <>a “?” glyph; <C>size</C> sm (inline, one line tall) or md (30px standalone); <C>label</C> names it.</> },
    { part: 'Tooltip', description: 'children — one short line.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex w-72 flex-col gap-2">
            <Label htmlFor="gl-hi-renew">
              Auto-renew window
              <HelpIcon label="About the renew window">Renewal runs this many days before expiry.</HelpIcon>
            </Label>
            <TextField id="gl-hi-renew" defaultValue="30" widthSize="sm" />
          </div>
        ),
        caption: 'Background people may want, not need.',
      },
      dont: {
        example: (
          <div className="flex w-72 flex-col gap-2">
            <Label htmlFor="gl-hi-pass">
              Password
              <HelpIcon label="Password rules">At least 12 characters, one number, one symbol, not one of your last 5.</HelpIcon>
            </Label>
            <TextField id="gl-hi-pass" type="password" widthSize="full" />
          </div>
        ),
        caption: 'Rules people must follow, hidden behind “?” — they belong under the field.',
      },
    },
  ],
  a11y: [
    'It’s a button named by label; the hint opens on focus too and is linked as its description.',
    'Doesn’t open on touch — never the only place for required information.',
  ],
};
