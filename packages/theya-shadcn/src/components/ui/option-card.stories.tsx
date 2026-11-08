import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Building, Home, MediaImage, MediaImageList, Shop } from 'iconoir-react';
import { OptionCardGroup, OptionCard } from './option-card';
import { optionCardGuidelines } from './option-card.guidelines';
import { testOnly } from '../../lib/test-only';

const meta: Meta<typeof OptionCardGroup> = {
  title: 'Selection/OptionCard',
  component: OptionCardGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "A one-of choice where each option needs a title, a line of explanation and often a price: plans, license types, delivery.",
      },
    },
    guidelines: optionCardGuidelines,
  },
  argTypes: {
    defaultValue: { control: 'text', description: 'Initially selected value (uncontrolled).', table: { category: 'Content' } },
    disabled: { control: 'boolean', description: 'Disables every card in the group.', table: { category: 'State' } },
    value: { control: false, description: 'Controlled selected value.', table: { category: 'Behavior' } },
    onValueChange: { control: false, description: 'Fires with the new selected value.', table: { category: 'Behavior' } },
    children: { control: false, description: 'OptionCardItem elements.', table: { category: 'Content' } },
    className: { control: false, description: 'Class on the root group element.', table: { category: 'Advanced' } },
  },
  args: { defaultValue: 'personal', disabled: false },
};

export default meta;
type Story = StoryObj<typeof OptionCardGroup>;

/** The whole card is the tap target; the checked card fills its indicator dot and turns its border primary — status is never colour-alone. */
export const Default: Story = {
  render: (args) => (
    <OptionCardGroup {...args} aria-label="License type" className="max-w-2xl">
      <OptionCard value="personal" title="Personal" description="Prints and sharing at home. No resale." icon={<Home />} />
      <OptionCard value="commercial" title="Commercial" description="Ads, packaging and resale. Required for client brands." icon={<Shop />} />
    </OptionCardGroup>
  ),
};

/** Name the group with a heading via aria-labelledby instead of aria-label. */
export const WithGroupLabel: Story = {
  name: 'With group label',
  parameters: { controls: { exclude: ['defaultValue'] } },
  render: (args) => (
    <fieldset className="max-w-2xl">
      <legend id="coverage-label" className="mb-3 font-body text-body-s font-medium text-[var(--color-text-text)]">
        License coverage
      </legend>
      <OptionCardGroup {...args} defaultValue="single" aria-labelledby="coverage-label">
        <OptionCard value="single" title="Single photo" description="Covers GOLDEN_0907.tif only." icon={<MediaImage />} />
        <OptionCard value="album" title="Whole album" description="Covers every photo in Golden hour." icon={<MediaImageList />} />
      </OptionCardGroup>
    </fieldset>
  ),
};

/** A 3-up studio picker with one option unavailable. Set `disabled` on a single OptionCard to block just that one, or on the group to disable all. */
export const StudioPicker: Story = {
  name: 'Studio picker',
  parameters: { controls: { exclude: ['defaultValue', 'disabled'] } },
  render: () => (
    <OptionCardGroup defaultValue="helios" aria-label="Shoot studio" className="max-w-3xl sm:grid-cols-3">
      <OptionCard value="helios" title="Helios Studio" description="Commercial and product. Two cyclorama walls." icon={<Building />} />
      <OptionCard value="eos" title="Eos Portraits" description="Morning portraits. North-facing daylight." icon={<Building />} />
      <OptionCard value="l4" title="Studio L4" description="Satellite studio. Not available on this plan." icon={<Building />} disabled />
    </OptionCardGroup>
  ),
  play: testOnly(async ({ canvasElement }) => {
    const group = within(within(canvasElement).getByRole('radiogroup', { name: 'Shoot studio' }));
    await expect(group.getByRole('radio', { name: 'Studio L4' })).toBeDisabled();
    // Arrow navigation skips the disabled option and wraps.
    group.getByRole('radio', { name: 'Eos Portraits' }).focus();
    // Radix RadioGroup checks on arrow only while the key is held.
    await userEvent.keyboard('{ArrowRight>}{/ArrowRight}');
    await expect(group.getByRole('radio', { name: 'Helios Studio' })).toHaveAttribute('aria-checked', 'true');
  }),
};

/** Controlled — the parent owns `value` and updates it from `onValueChange`, mirroring the selection in a readout below. */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: function ControlledOptionCard() {
    const [license, setLicense] = useState('commercial');
    return (
      <div className="flex max-w-2xl flex-col gap-3">
        <OptionCardGroup value={license} onValueChange={setLicense} aria-label="License type">
          <OptionCard value="personal" title="Personal" description="Prints and sharing at home." icon={<Home />} />
          <OptionCard value="commercial" title="Commercial" description="Ads, packaging and resale." icon={<Shop />} />
        </OptionCardGroup>
        <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">
          Selected: <span className="font-mono text-[var(--color-text-text)]">{license}</span>
        </p>
      </div>
    );
  },
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Personal' }));
    await expect(canvas.getByText('personal')).toBeInTheDocument();
  }),
};

/** A `disabled` card stays visible but can't be selected — for an option that doesn't apply right now. */
export const Disabled: Story = {
  render: () => (
    <OptionCardGroup defaultValue="personal" aria-label="License type" className="w-full max-w-[480px]">
      <OptionCard value="personal" title="Personal" description="Prints and sharing at home." icon={<Home />} />
      <OptionCard value="commercial" title="Commercial" description="Available on the Business plan." icon={<Shop />} disabled />
    </OptionCardGroup>
  ),
};

/** Interaction test for Default, kept out of Default so Default opens untouched. */
export const TestInteractions: Story = {
  ...Default,
  name: 'Test: interactions',
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const group = within(within(canvasElement).getByRole('radiogroup', { name: 'License type' }));
    // Named by the title, described by the description (not run together).
    const personal = group.getByRole('radio', { name: 'Personal' });
    await expect(personal).toHaveAccessibleDescription('Prints and sharing at home. No resale.');
    await userEvent.click(personal);
    await expect(personal).toHaveAttribute('aria-checked', 'true');
    // Arrow keys move the selection.
    // Radix RadioGroup checks on arrow only while the key is held.
    await userEvent.keyboard('{ArrowRight>}{/ArrowRight}');
    await expect(group.getByRole('radio', { name: 'Commercial' })).toHaveAttribute('aria-checked', 'true');
  },
};
