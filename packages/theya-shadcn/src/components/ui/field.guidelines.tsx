import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Field, FieldDescription, FieldError } from './field';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

const PLANS = ['Starter', 'Pro', 'Business', 'Scale', 'Enterprise', 'Dedicated'];

export const fieldGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Stacking a Label, a control, a description and an error for controls that don’t draw them themselves (Select, Combobox, DatePicker, custom).'],
  whenNotToUse: [
    { text: 'TextField / TextArea — label, description and error are built in', instead: 'their own props' },
    { text: 'react-hook-form forms', instead: 'Form (FormItem wires ids for you)' },
  ],
  anatomy: [
    { part: 'Field', description: <>vertical stack, 8px gap; <C>invalid</C>, <C>required</C>, <C>disabled</C> as data attributes.</> },
    { part: 'Label', description: <>the shared Label, with <C>htmlFor</C>.</> },
    { part: 'Control', description: <>gets <C>id</C>, <C>aria-describedby</C>, <C>aria-invalid</C> from you.</> },
    { part: 'FieldDescription / FieldError', optional: true, description: 'help text, then the error (announced).' },
  ],
  doDont: [
    {
      do: {
        example: (
          <Field invalid className="w-64">
            <Label htmlFor="gl-fd-plan" required>Plan</Label>
            <Select>
              <SelectTrigger id="gl-fd-plan" error widthSize="full" aria-describedby="gl-fd-plan-err" aria-invalid>
                <SelectValue placeholder="Choose a plan" />
              </SelectTrigger>
              <SelectContent>
                {PLANS.map((p) => (
                  <SelectItem key={p} value={p.toLowerCase()}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError id="gl-fd-plan-err">Choose a plan to continue.</FieldError>
          </Field>
        ),
        caption: 'The error is text under the control and linked to it.',
      },
      dont: {
        example: (
          <Field className="w-64">
            <Label htmlFor="gl-fd-plan2" required>Plan</Label>
            <Select>
              <SelectTrigger id="gl-fd-plan2" error widthSize="full" aria-invalid>
                <SelectValue placeholder="Choose a plan" />
              </SelectTrigger>
              <SelectContent>
                {PLANS.map((p) => (
                  <SelectItem key={p} value={p.toLowerCase()}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>You can change it later.</FieldDescription>
          </Field>
        ),
        caption: 'Only a red border: nothing says what’s wrong, and screen readers hear nothing.',
      },
    },
  ],
  a11y: [
    <>Field doesn’t wire ids — pass <C>id</C>, <C>aria-describedby</C> (description + error ids) and <C>aria-invalid</C> to the control yourself.</>,
    <><C>FieldError</C> is <C>role="alert"</C>: render it only when there is an error.</>,
  ],
};
