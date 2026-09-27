import type { Meta, StoryObj } from '@storybook/react';
import { Field, FieldDescription, FieldError } from './field';
import { Label } from './label';
import { TextField } from './text-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { NumberField } from './number-field';
import { Switch } from './switch';

const meta: Meta<typeof Field> = {
  title: 'Forms/Field',
  component: Field,
  tags: ['autodocs'],
  argTypes: {
    invalid: { control: 'boolean', description: 'Marks the field invalid; propagates data-invalid to its parts.', table: { category: 'State' } },
    required: { control: 'boolean', description: 'Marks the field required; propagates data-required to its parts.', table: { category: 'State' } },
    disabled: { control: 'boolean', description: 'Disables the field; propagates data-disabled to its parts.', table: { category: 'State' } },
    children: { control: false, description: 'FieldLabel/FieldControl/FieldMessage parts.', table: { category: 'Content' } },
    className: { control: false, description: 'Class on the root element.', table: { category: 'Advanced' } },
  },
  decorators: [
    (Story) => (
      <div className="w-[320px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Field>;

export const Default: Story = {
  render: () => (
    <Field>
      <Label htmlFor="field-default">Site name</Label>
      <TextField id="field-default" placeholder="acme-production" widthSize="full" />
      <FieldDescription>Shown in the dashboard and in logs.</FieldDescription>
    </Field>
  ),
};

/** `required` goes on both Field (for `data-required`) and Label (the visible asterisk) — Label is the single source for the mark, so pass it wherever a label needs one. */
export const Required: Story = {
  render: () => (
    <Field required>
      <Label htmlFor="field-required" required>
        Domain
      </Label>
      <TextField id="field-required" placeholder="shop.seashell.dev" required widthSize="full" className="font-mono" />
      <FieldDescription>Point it at this server before you add it.</FieldDescription>
    </Field>
  ),
};

export const Invalid: Story = {
  render: () => (
    <Field invalid>
      <Label htmlFor="field-invalid" data-error>
        Domain
      </Label>
      <TextField id="field-invalid" defaultValue="not a domain" error widthSize="full" />
      <FieldError>Enter a valid domain, like shop.seashell.dev.</FieldError>
    </Field>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Field disabled>
      <Label htmlFor="field-disabled" className="opacity-50">
        Region
      </Label>
      <TextField id="field-disabled" defaultValue="eu-west-1" disabled widthSize="full" className="font-mono" />
      <FieldDescription>Contact support to move regions.</FieldDescription>
    </Field>
  ),
};

export const NonNativeControls: Story = {
  name: 'Non-native controls',
  render: () => (
    <div className="flex flex-col gap-6">
      <Field>
        <Label htmlFor="field-record-type">Record type</Label>
        <Select defaultValue="cname">
          <SelectTrigger id="field-record-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
            <SelectItem value="cname">CNAME</SelectItem>
            <SelectItem value="mx">MX</SelectItem>
          </SelectContent>
        </Select>
        <FieldDescription>The DNS record class to create.</FieldDescription>
      </Field>
      <Field>
        <Label htmlFor="field-ttl">TTL</Label>
        <NumberField id="field-ttl" defaultValue={3600} min={60} step={60} className="w-36" />
        <FieldDescription>Seconds before resolvers refetch.</FieldDescription>
      </Field>
      <Field className="flex-row items-center justify-between">
        <Label htmlFor="field-proxy">Proxy through CDN</Label>
        <Switch id="field-proxy" />
      </Field>
    </div>
  ),
};
