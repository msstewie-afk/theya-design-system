import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { WarningCircle } from 'iconoir-react';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { TextField } from './text-field';

export const formGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Forms with validation on react-hook-form: FormField per control, FormItem with FormLabel, FormDescription and FormMessage.', 'Any form where errors must be tied to fields automatically.'],
  whenNotToUse: [
    { text: 'One or two fields with no validation logic', instead: 'TextField / Field directly' },
    { text: 'Editing an object’s properties in a side panel', instead: 'PropertyGrid' },
  ],
  anatomy: [
    { part: 'Form', description: 'RHF’s FormProvider around a native form.' },
    { part: 'FormField', description: 'a typed Controller for one value.' },
    { part: 'FormItem', description: <>gives <C>FormLabel</C>, <C>FormControl</C>, <C>FormDescription</C>, <C>FormMessage</C> shared ids.</> },
    { part: 'FormMessage', description: 'the field’s error, linked and announced.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex w-72 flex-col gap-4">
            <TextField label="Domain" defaultValue="seashell" error="Add the ending, like .dev or .com." widthSize="full" />
            <TextField label="Admin email" defaultValue="dana@seashell.dev" widthSize="full" />
          </div>
        ),
        caption: 'The error sits under the field it’s about and says how to fix it.',
      },
      dont: {
        example: (
          <div className="flex w-72 flex-col gap-4">
            <Alert tone="danger">
              <WarningCircle />
              <div className="flex flex-col gap-1">
                <AlertTitle>Form has errors</AlertTitle>
                <AlertDescription>Please check the fields below.</AlertDescription>
              </div>
            </Alert>
            <TextField label="Domain" defaultValue="seashell" widthSize="full" />
            <TextField label="Admin email" defaultValue="dana@seashell.dev" widthSize="full" />
          </div>
        ),
        caption: 'Only a banner on top: which field, and what’s wrong with it?',
      },
    },
  ],
  a11y: [
    <><C>FormControl</C> sets <C>id</C>, <C>aria-describedby</C> and <C>aria-invalid</C> on the control for you.</>,
    <>Switch, Checkbox and Radio render buttons — <C>FormLabel</C>’s htmlFor may not name them; add <C>aria-label</C>.</>,
    'On submit with errors, move focus to the first invalid field.',
  ],
};
