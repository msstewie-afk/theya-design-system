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

type Args = Record<string, never>;

const meta: Meta<Args> = {
  title: 'Forms/Form',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'react-hook-form binding layer — FormField/FormItem/FormLabel/FormControl/FormMessage. `Form` is a bare re-export of RHF\'s FormProvider, so it has no props of its own to document here; the real API surface is react-hook-form\'s `useForm` plus each `FormField`\'s `name`/`control`/`render`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<Args>;

const siteSchema = z.object({
  domain: z
    .string()
    .trim()
    .min(1, 'Enter a domain.')
    .regex(/^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,}$/, 'Enter a valid domain, e.g. shop.seashell.dev.'),
  plan: z.string().min(1, 'Choose a plan.'),
});
type SiteValues = z.infer<typeof siteSchema>;

/** The canonical pattern: useForm + zodResolver, one FormField per schema key. Type an invalid domain (or submit empty) to see the inline FormMessage errors and the label turn danger. Submit stays disabled until the form is valid. */
function CreateSiteForm() {
  const form = useForm<SiteValues>({
    resolver: zodResolver(siteSchema),
    mode: 'onChange',
    defaultValues: { domain: '', plan: '' },
  });

  const onSubmit = (values: SiteValues) => {
    alert(`Validated: ${values.domain} · ${values.plan}`);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-[360px] flex-col gap-5">
        <FormField
          control={form.control}
          name="domain"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Domain</FormLabel>
              <FormControl>
                <TextField className="font-mono" placeholder="shop.seashell.dev" widthSize="full" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} error={fieldState.error?.message} {...field} />
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
                  <SelectItem value="Starter">Starter</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="Scale">Scale</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="filled" tone="primary" disabled={!form.formState.isValid} leftIcon={<Plus />}>
            Create site
          </Button>
        </div>
      </form>
    </Form>
  );
}

export const Default: Story = {
  render: () => <CreateSiteForm />,
};

const invalidSchema = z.object({
  domain: z.string().min(1, 'Enter a domain.').regex(/\\./, 'Enter a valid domain, e.g. shop.seashell.dev.'),
});
type InvalidValues = z.infer<typeof invalidSchema>;

/** Pre-populated with a bad value and validated on mount, so the error wiring (aria-invalid, the danger-colored label, and FormMessage) is visible without interaction. */
function InvalidForm() {
  const form = useForm<InvalidValues>({
    resolver: zodResolver(invalidSchema),
    mode: 'onChange',
    defaultValues: { domain: 'not a domain' },
  });

  useEffect(() => {
    void form.trigger();
  }, [form]);

  return (
    <Form {...form}>
      <form className="flex w-[360px] flex-col gap-5">
        <FormField
          control={form.control}
          name="domain"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Domain</FormLabel>
              <FormControl>
                <TextField className="font-mono" placeholder="shop.seashell.dev" widthSize="full" error={fieldState.error?.message} {...field} />
              </FormControl>
              <FormDescription>The hostname this site responds to.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

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
      <form className="flex w-[360px] flex-col gap-5">
        <FormField
          control={form.control}
          name="autoRenew"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between gap-4">
              <div className="grid gap-1">
                <FormLabel>Auto-renew certificate</FormLabel>
                <FormDescription>Reissue 30 days before the certificate expires.</FormDescription>
              </div>
              <FormControl>
                <Switch aria-label="Auto-renew certificate" checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

export const WithSwitch: Story = {
  name: 'With switch',
  render: () => <SwitchForm />,
};
