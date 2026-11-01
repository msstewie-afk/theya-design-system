import type { Meta, StoryObj } from '@storybook/react';
import { Field, FieldDescription, FieldError } from './field';
import { Label } from './label';
import { TextField } from './text-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { NumberField } from './number-field';
import { Switch } from './switch';
import { fieldGuidelines } from './field.guidelines';

const meta: Meta<typeof Field> = {
  title: 'Form Structure/Field',
  component: Field,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Stacks a label, a control, a help line and an error for controls that don’t draw them themselves: Select, Combobox, DatePicker or a custom one.",
      },
    },
    guidelines: fieldGuidelines,
  },
  argTypes: {
    invalid: { control: 'boolean', description: 'Marks the field invalid; propagates data-invalid to its parts.', table: { category: 'State' } },
    required: { control: 'boolean', description: 'Marks the field required; propagates data-required to its parts.', table: { category: 'State' } },
    disabled: { control: 'boolean', description: 'Disables the field; propagates data-disabled to its parts.', table: { category: 'State' } },
    children: { control: false, description: 'FieldLabel/FieldControl/FieldMessage parts.', table: { category: 'Content' } },
    className: { control: false, description: 'Class on the root element.', table: { category: 'Advanced' } },
  },
  decorators: [
    (Story) => (
      <div className="w-[320px] max-w-full">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Field>;

/** A Label, a control and a FieldDescription stacked in one Field, with the help line under the control. */
export const Default: Story = {
  render: () => (
    <Field>
      <Label htmlFor="field-default">Gallery name</Label>
      <TextField id="field-default" placeholder="Golden hour" widthSize="full" />
      <FieldDescription>Shown to clients in the portal and in download emails.</FieldDescription>
    </Field>
  ),
};

/** `required` goes on both Field (for `data-required`) and Label (the visible asterisk) — Label is the single source for the mark, so pass it wherever a label needs one. */
export const Required: Story = {
  render: () => (
    <Field required>
      <Label htmlFor="field-required" required>
        Client portal address
      </Label>
      <TextField id="field-required" placeholder="selene-weddings.aether.photo" required widthSize="full" className="font-mono" />
      <FieldDescription>Clients open their galleries at this address.</FieldDescription>
    </Field>
  ),
};

/** `invalid` on Field, with a FieldError under the control saying how to fix the value. */
export const Invalid: Story = {
  render: () => (
    <Field invalid>
      <Label htmlFor="field-invalid" data-error>
        Client portal address
      </Label>
      <TextField id="field-invalid" defaultValue="selene weddings" error widthSize="full" className="font-mono" aria-describedby="field-invalid-error" />
      <FieldError id="field-invalid-error">Use lowercase letters, numbers and hyphens, like selene-weddings.aether.photo.</FieldError>
    </Field>
  ),
};

/** `disabled` on Field alongside a disabled control — use the help line to say why it can't be changed. */
export const Disabled: Story = {
  render: () => (
    <Field disabled>
      <Label htmlFor="field-disabled" className="opacity-50">
        Studio
      </Label>
      <TextField id="field-disabled" defaultValue="Helios Studio" disabled widthSize="full" />
      <FieldDescription>Contact support to move a gallery to another studio.</FieldDescription>
    </Field>
  ),
};

/** Field around controls that don't draw their own label and help text: a Select, a NumberField and an inline Switch. */
export const NonNativeControls: Story = {
  name: 'Non-native controls',
  render: () => (
    <div className="flex flex-col gap-6">
      <Field>
        <Label htmlFor="field-print-size">Print size</Label>
        <Select defaultValue="11x14">
          <SelectTrigger id="field-print-size">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="8x10">8 × 10 in</SelectItem>
            <SelectItem value="11x14">11 × 14 in</SelectItem>
            <SelectItem value="16x20">16 × 20 in</SelectItem>
          </SelectContent>
        </Select>
        <FieldDescription>Paper size for every print in this order.</FieldDescription>
      </Field>
      <Field>
        <Label htmlFor="field-copies">Copies</Label>
        <NumberField id="field-copies" defaultValue={2} min={1} max={50} step={1} className="w-36" />
        <FieldDescription>Prints of each selected photo.</FieldDescription>
      </Field>
      <Field className="flex-row items-center justify-between">
        <Label htmlFor="field-watermark">Watermark client previews</Label>
        <Switch id="field-watermark" />
      </Field>
    </div>
  ),
};
