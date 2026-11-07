import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'iconoir-react';
import { Button } from './button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from './form';
import { TextField } from './text-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Switch } from './switch';
import { formGuidelines } from './form.guidelines';

type Args = Record<string, never>;

// Notes moved from the Docs description (the page now shows a reader-facing
// summary):
//   react-hook-form binding layer —
//   FormField/FormItem/FormLabel/FormControl/FormMessage. `Form` is a bare
//   re-export of RHF's FormProvider, so it has no props of its own to document
//   here; the real API surface is react-hook-form's `useForm` plus each
//   `FormField`'s `name`/`control`/`render`.
const meta: Meta<Args> = {
  title: 'Form Structure/Form',
  tags: ['autodocs'],
  parameters: {
    guidelines: formGuidelines,
    docs: {
      description: {
        component:
          "Forms with validation on react-hook-form: each control gets its label, help text and error, and errors are tied to their fields automatically.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<Args>;

// Portal address: the subdomain part of <address>.aether.photo.
const PORTAL_PATTERN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
const PORTAL_MESSAGE = 'Use lowercase letters, numbers and hyphens, e.g. selene-weddings.';

const portalSchema = z.object({
  portal: z
    .string()
    .trim()
    .min(1, 'Enter a portal address.')
    .regex(PORTAL_PATTERN, PORTAL_MESSAGE),
  plan: z.string().min(1, 'Choose a plan.'),
});
type PortalValues = z.infer<typeof portalSchema>;

/** The canonical pattern: useForm + zodResolver, one FormField per schema key. Type an invalid portal address (or submit empty) to see the inline FormMessage errors and the label turn danger. Submit stays disabled until the form is valid. */
function CreatePortalForm() {
  const form = useForm<PortalValues>({
    resolver: zodResolver(portalSchema),
    mode: 'onChange',
    defaultValues: { portal: '', plan: '' },
  });

  const onSubmit = (values: PortalValues) => {
    alert(`Validated: ${values.portal} · ${values.plan}`);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full max-w-[360px] flex-col gap-5">
        <FormField
          control={form.control}
          name="portal"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Portal address</FormLabel>
              <FormControl>
                <TextField className="font-mono" placeholder="selene-weddings" widthSize="full" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} error={fieldState.error?.message} {...field} />
              </FormControl>
              <FormDescription>Lowercase identifiers use the mono face.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="plan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a plan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button appearance="filled" tone="primary" disabled={!form.formState.isValid} leftIcon={<Plus />}>
            Create portal
          </Button>
        </div>
      </form>
    </Form>
  );
}

/** A create-portal form validated with a zod schema as people type: errors appear under each field, and Create portal stays disabled until everything is valid. */
export const Default: Story = {
  render: () => <CreatePortalForm />,
};

const invalidSchema = z.object({
  portal: z.string().min(1, 'Enter a portal address.').regex(PORTAL_PATTERN, PORTAL_MESSAGE),
});
type InvalidValues = z.infer<typeof invalidSchema>;

/** Pre-populated with a bad value and validated on mount, so the error wiring (aria-invalid, the danger-colored label, and FormMessage) is visible without interaction. */
function InvalidForm() {
  const form = useForm<InvalidValues>({
    resolver: zodResolver(invalidSchema),
    mode: 'onChange',
    defaultValues: { portal: 'Selene Weddings' },
  });

  useEffect(() => {
    void form.trigger();
  }, [form]);

  return (
    <Form {...form}>
      <form className="flex w-full max-w-[360px] flex-col gap-5">
        <FormField
          control={form.control}
          name="portal"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Portal address</FormLabel>
              <FormControl>
                <TextField className="font-mono" placeholder="selene-weddings" widthSize="full" error={fieldState.error?.message} {...field} />
              </FormControl>
              <FormDescription>Clients open their galleries at this address on aether.photo.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

/** A field that fails validation: the label and input turn danger-colored and the message under the help text says what to fix. */
export const Invalid: Story = {
  render: () => <InvalidForm />,
};

const renewSchema = z.object({ autoRenew: z.boolean() });
type RenewValues = z.infer<typeof renewSchema>;

/** A non-native control (Switch) inside a FormField. Because Switch renders as a button, a <label htmlFor> won't reliably name it — pass an explicit aria-label. */
function SwitchForm() {
  const form = useForm<RenewValues>({
    resolver: zodResolver(renewSchema),
    defaultValues: { autoRenew: true },
  });

  return (
    <Form {...form}>
      <form className="flex w-full max-w-[360px] flex-col gap-5">
        <FormField
          control={form.control}
          name="autoRenew"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start justify-between gap-4">
              <div className="grid gap-1">
                <FormLabel>Auto-renew license</FormLabel>
                <FormDescription>Renew 30 days before the license expires.</FormDescription>
              </div>
              {/* On the label's line, not centred on label + description. */}
              <div className="flex h-[var(--typography-body-m-line-height)] shrink-0 items-center">
                <FormControl>
                  <Switch aria-label="Auto-renew license" checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </div>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

/** A Switch bound to a form field, with its label and help text beside it — give the switch an `aria-label` too, since a label element can't reliably name it. */
export const WithSwitch: Story = {
  name: 'With switch',
  render: () => <SwitchForm />,
};
