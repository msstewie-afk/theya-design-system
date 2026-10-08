import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Cloud, Globe, ShieldCheck, Server, Network } from 'iconoir-react';
import { OptionCardGroup, OptionCard } from './option-card';
import { optionCardGuidelines } from './option-card.guidelines';

const meta: Meta<typeof OptionCardGroup> = {
  title: 'Selection/OptionCard',
  component: OptionCardGroup,
  tags: ['autodocs'],
  parameters: { guidelines: optionCardGuidelines },
  argTypes: {
    defaultValue: { control: 'text', description: 'Initially selected value (uncontrolled).', table: { category: 'Content' } },
    disabled: { control: 'boolean', description: 'Disables every card in the group.', table: { category: 'State' } },
    value: { control: false, description: 'Controlled selected value.', table: { category: 'Behavior' } },
    onValueChange: { control: false, description: 'Fires with the new selected value.', table: { category: 'Behavior' } },
    children: { control: false, description: 'OptionCardItem elements.', table: { category: 'Content' } },
    className: { control: false, description: 'Class on the root group element.', table: { category: 'Advanced' } },
  },
  args: { defaultValue: 'http-01', disabled: false },
};

export default meta;
type Story = StoryObj<typeof OptionCardGroup>;

/** The whole card is the tap target; the checked card fills its indicator dot and turns its border primary — status is never colour-alone. */
export const Default: Story = {
  render: (args) => (
    <OptionCardGroup {...args} aria-label="Validation method" className="max-w-2xl">
      <OptionCard value="http-01" title="HTTP-01" description="Serve a token file over port 80. Fastest for a single host." icon={<Globe />} />
      <OptionCard value="dns-01" title="DNS-01" description="Add a TXT record. Required for wildcard certificates." icon={<ShieldCheck />} />
    </OptionCardGroup>
  ),
  play: async ({ canvasElement }) => {
    const group = within(within(canvasElement).getByRole('radiogroup', { name: 'Validation method' }));
    // Named by the title, described by the description (not run together).
    const http = group.getByRole('radio', { name: 'HTTP-01' });
    await expect(http).toHaveAccessibleDescription('Serve a token file over port 80. Fastest for a single host.');
    await userEvent.click(http);
    await expect(http).toHaveAttribute('aria-checked', 'true');
    // Arrow keys move the selection.
    // Radix RadioGroup checks on arrow only while the key is held.
    await userEvent.keyboard('{ArrowRight>}{/ArrowRight}');
    await expect(group.getByRole('radio', { name: 'DNS-01' })).toHaveAttribute('aria-checked', 'true');
  },
};

/** Name the group with a heading via aria-labelledby instead of aria-label. */
export const WithGroupLabel: Story = {
  name: 'With group label',
  parameters: { controls: { exclude: ['defaultValue'] } },
  render: (args) => (
    <fieldset className="max-w-2xl">
      <legend id="coverage-label" className="mb-3 font-body text-body-s font-medium text-[var(--color-text-text)]">
        Certificate coverage
      </legend>
      <OptionCardGroup {...args} defaultValue="single" aria-labelledby="coverage-label">
        <OptionCard value="single" title="Single host" description="Covers shop.seashell.dev only." icon={<Globe />} />
        <OptionCard value="wildcard" title="Wildcard" description="Covers *.seashell.dev across every subdomain." icon={<Network />} />
      </OptionCardGroup>
    </fieldset>
  ),
};

/** A 3-up region picker with one option unavailable. Set `disabled` on a single OptionCard to block just that one, or on the group to disable all. */
export const RegionPicker: Story = {
  name: 'Region picker',
  parameters: { controls: { exclude: ['defaultValue', 'disabled'] } },
  render: () => (
    <OptionCardGroup defaultValue="eu-west-1" aria-label="Deployment region" className="max-w-3xl sm:grid-cols-3">
      <OptionCard value="eu-west-1" title="eu-west-1" description="Dublin. Lowest latency from the EU." icon={<Server />} />
      <OptionCard value="us-east-1" title="us-east-1" description="Virginia. Default North America edge." icon={<Server />} />
      <OptionCard value="ap-south-1" title="ap-south-1" description="Mumbai. Not available on this plan." icon={<Server />} disabled />
    </OptionCardGroup>
  ),
  play: async ({ canvasElement }) => {
    const group = within(within(canvasElement).getByRole('radiogroup', { name: 'Deployment region' }));
    await expect(group.getByRole('radio', { name: 'ap-south-1' })).toBeDisabled();
    // Arrow navigation skips the disabled option and wraps.
    group.getByRole('radio', { name: 'us-east-1' }).focus();
    // Radix RadioGroup checks on arrow only while the key is held.
    await userEvent.keyboard('{ArrowRight>}{/ArrowRight}');
    await expect(group.getByRole('radio', { name: 'eu-west-1' })).toHaveAttribute('aria-checked', 'true');
  },
};

/** Controlled — the parent owns `value` and updates it from `onValueChange`, mirroring the selection in a readout below. */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: function ControlledOptionCard() {
    const [method, setMethod] = useState('dns-01');
    return (
      <div className="flex max-w-2xl flex-col gap-3">
        <OptionCardGroup value={method} onValueChange={setMethod} aria-label="Validation method">
          <OptionCard value="http-01" title="HTTP-01" description="Serve a token file over port 80." icon={<Globe />} />
          <OptionCard value="dns-01" title="DNS-01" description="Add a TXT record. Supports wildcards." icon={<ShieldCheck />} />
        </OptionCardGroup>
        <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">
          Selected: <span className="font-mono text-[var(--color-text-text)]">{method}</span>
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'HTTP-01' }));
    await expect(canvas.getByText('http-01')).toBeInTheDocument();
  },
};

export const Disabled: Story = {
  render: () => (
    <OptionCardGroup defaultValue="http-01" aria-label="Validation method" className="w-full max-w-[480px]">
      <OptionCard value="http-01" title="HTTP-01" description="Validate via a file on your web server." icon={<Globe />} />
      <OptionCard value="dns-01" title="DNS-01" description="Validate via a DNS TXT record." icon={<Cloud />} disabled />
    </OptionCardGroup>
  ),
};
