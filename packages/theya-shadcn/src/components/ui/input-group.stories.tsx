import type { Meta, StoryObj } from '@storybook/react';
import { Search, Globe, Key } from 'iconoir-react';
import { InputGroup, InputGroupAddon, InputGroupInput } from './input-group';
import { Label } from './label';
import { inputGroupGuidelines } from './input-group.guidelines';
import { expect, userEvent, within } from '@storybook/test';
import { resetFocus, tabTo } from '../../test/keyboard';

// Notes moved from the Docs description (the page now shows a reader-facing
// summary):
//   A borderless field wrapped with prefix/suffix addons (text or an icon)
//   inside one bordered container that owns the shared focus ring — focusing
//   the field lights up the whole group via focus-within.
const meta: Meta<typeof InputGroup> = {
  title: 'Text Input/InputGroup',
  component: InputGroup,
  tags: ['autodocs'],
  parameters: {
    guidelines: inputGroupGuidelines,
    docs: {
      description: {
        component:
          "A field with a fixed prefix or suffix that is part of the value’s format — https://, .aether.photo, /mo — or a button inside its border.",
      },
    },
  },
  argTypes: {
    className: { control: false, description: 'Class on the bordered container.', table: { category: 'Advanced' } },
    children: { control: false, description: 'InputGroupAddon(s) and the borderless field.', table: { category: 'Content' } },
  },
  decorators: [
    (Story) => (
      <div className="w-[280px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof InputGroup>;

/** A text suffix (".aether.photo") with a hairline divider toward the field. */
export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-1">
      <Label htmlFor="portal">Portal address</Label>
      <InputGroup>
        <InputGroupInput id="portal" className="font-mono" placeholder="selene-weddings" defaultValue="selene-weddings" />
        <InputGroupAddon position="end">.aether.photo</InputGroupAddon>
      </InputGroup>
    </div>
  ),
  // Keyboard: the field is the only tab stop; the ".aether.photo" addon is text, not a control.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Portal address' });
    resetFocus();
    await tabTo(input);
    await userEvent.keyboard('{Control>}a{/Control}eos-portraits');
    await expect(input).toHaveValue('eos-portraits');
    await userEvent.tab();
    await expect(canvasElement.contains(document.activeElement) && document.activeElement !== input).toBe(false);
  },
};

/** A "$" prefix plus a "per print" suffix bracket the editable price. */
export const PrefixAndSuffix: Story = {
  name: 'Prefix and suffix',
  render: () => (
    <div className="flex flex-col gap-1">
      <Label htmlFor="print-price">Print price</Label>
      <InputGroup>
        <InputGroupAddon position="start">$</InputGroupAddon>
        <InputGroupInput id="print-price" inputMode="decimal" placeholder="0.00" defaultValue="45.00" />
        <InputGroupAddon position="end">per print</InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

/** A leading magnifier sits flush (`divider={false}`) for a search field. */
export const LeadingIcon: Story = {
  name: 'Leading icon',
  render: () => (
    <div className="flex flex-col gap-1">
      <Label htmlFor="gallery-search">Search galleries</Label>
      <InputGroup>
        <InputGroupAddon position="start" divider={false}>
          <Search aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput id="gallery-search" type="search" placeholder="Filter by name or studio" />
      </InputGroup>
    </div>
  ),
};

/** The group's border/ring goes danger when the inner field is `aria-invalid`; wire `aria-describedby` to the message so the error is announced. */
export const Invalid: Story = {
  render: () => (
    <div className="flex flex-col gap-1">
      <Label htmlFor="studio">Studio</Label>
      <InputGroup>
        <InputGroupAddon position="start" divider={false}>
          <Globe aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput id="studio" defaultValue="Othrys Lodgee" aria-invalid="true" aria-describedby="studio-error" />
      </InputGroup>
      <p id="studio-error" className="font-body text-body-xs text-[var(--color-text-text-danger)]">
        Unknown studio. Try Othrys Lodge or Studio L4.
      </p>
    </div>
  ),
};

/** Disabled groups go muted and block input; the whole container reads muted. */
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-1">
      <Label htmlFor="api-key">API key</Label>
      <InputGroup>
        <InputGroupAddon position="start" divider={false}>
          <Key aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput id="api-key" className="font-mono" defaultValue="ae_live_8f3c1a7e" disabled />
      </InputGroup>
    </div>
  ),
};
