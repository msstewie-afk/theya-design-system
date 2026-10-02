import type { Meta, StoryObj } from '@storybook/react';
import { Fieldset } from './fieldset';
import { TextField } from './text-field';
import { Field, FieldDescription } from './field';
import { Label } from './label';

const meta: Meta<typeof Fieldset> = {
  title: 'Form Structure/Fieldset',
  component: Fieldset,
  tags: ['autodocs'],
  argTypes: {
    legend: { control: 'text', description: 'Section heading.', table: { category: 'Content' } },
    description: { control: 'text', description: 'Supporting copy under the legend.', table: { category: 'Content' } },
    disabled: { control: 'boolean', description: 'Disables every field inside.', table: { category: 'State' } },
    children: { control: false, description: 'Field elements grouped under the legend.', table: { category: 'Content' } },
    className: { control: false, description: 'Class on the root element.', table: { category: 'Advanced' } },
  },
};

export default meta;
type Story = StoryObj<typeof Fieldset>;

export const Playground: Story = {
  render: () => (
    <Fieldset legend="Contact" description="How we'll reach you." className="w-[320px]">
      <TextField label="Name" placeholder="Jane Doe" />
      <TextField label="Email" placeholder="jane@example.com" />
    </Fieldset>
  ),
};

/** No legend or description — just the reset chrome + gap, grouping controls without a visible caption (assistive tech gets no group name either, so prefer a legend when the group needs to be announced). */
export const NoHeader: Story = {
  name: 'No legend',
  render: () => (
    <Fieldset className="w-[320px]">
      <TextField label="Street" placeholder="123 Main St" />
      <TextField label="City" placeholder="Springfield" />
    </Fieldset>
  ),
};

/** Legend without a description line. */
export const LegendOnly: Story = {
  name: 'Legend only',
  render: () => (
    <Fieldset legend="Billing address" className="w-[320px]">
      <TextField label="Street" placeholder="123 Main St" />
      <TextField label="City" placeholder="Springfield" />
    </Fieldset>
  ),
};

/** Composes with Field/FieldLabel/FieldDescription instead of TextField's own built-in label — same shape ResourceForm's own sections use. */
export const WithFieldComponents: Story = {
  name: 'With Field components',
  render: () => (
    <Fieldset legend="DNS records" description="Point your domain at this server." className="w-[320px]">
      <Field>
        <Label htmlFor="fieldset-host">Host</Label>
        <TextField id="fieldset-host" placeholder="@" widthSize="full" />
        <FieldDescription>Use @ for the root domain.</FieldDescription>
      </Field>
      <Field>
        <Label htmlFor="fieldset-value">Value</Label>
        <TextField id="fieldset-value" placeholder="203.0.113.10" widthSize="full" className="font-mono" />
      </Field>
    </Fieldset>
  ),
};

/** Several Fieldsets stacked with a divider — the same sectioning shape ResourceForm builds its own sections with. */
export const MultipleSections: Story = {
  name: 'Multiple sections',
  render: () => (
    // gap-8 (32px, double the 16px gap-4 between fields inside one
    // Fieldset) reads as "separate group" on its own — no divider line needed.
    <div className="flex w-[320px] flex-col gap-8">
      <Fieldset legend="Contact" description="How we'll reach you.">
        <TextField label="Name" placeholder="Jane Doe" />
        <TextField label="Email" placeholder="jane@example.com" />
      </Fieldset>
      <Fieldset legend="Billing address">
        <TextField label="Street" placeholder="123 Main St" />
        <TextField label="City" placeholder="Springfield" />
      </Fieldset>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Fieldset legend="Billing address" disabled className="w-[320px]">
      <TextField label="Street" placeholder="123 Main St" />
      <TextField label="City" placeholder="Springfield" />
    </Fieldset>
  ),
};
