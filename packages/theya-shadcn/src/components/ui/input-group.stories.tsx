import type { Meta, StoryObj } from '@storybook/react';
import { Search, Globe, Key } from 'iconoir-react';
import { InputGroup, InputGroupAddon, InputGroupInput } from './input-group';
import { Label } from './label';

const meta: Meta<typeof InputGroup> = {
  title: 'Text Input/InputGroup',
  component: InputGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A borderless field wrapped with prefix/suffix addons (text or an icon) inside one bordered container that owns the shared focus ring — focusing the field lights up the whole group via focus-within.',
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

/** A text suffix (".zone") with a hairline divider toward the field. */
export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="zone">Zone name</Label>
      <InputGroup>
        <InputGroupInput id="zone" className="font-mono" placeholder="shop.acme" defaultValue="shop.acme" />
        <InputGroupAddon position="end">.zone</InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

/** A "https://" prefix plus a ".io" suffix bracket the editable hostname. */
export const PrefixAndSuffix: Story = {
  name: 'Prefix and suffix',
  render: () => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="endpoint">Site endpoint</Label>
      <InputGroup>
        <InputGroupAddon position="start">https://</InputGroupAddon>
        <InputGroupInput id="endpoint" className="font-mono" placeholder="api.acme" defaultValue="api.acme" />
        <InputGroupAddon position="end">.io</InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

/** A leading magnifier sits flush (`divider={false}`) for a search field. */
export const LeadingIcon: Story = {
  name: 'Leading icon',
  render: () => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="site-search">Search sites</Label>
      <InputGroup>
        <InputGroupAddon position="start" divider={false}>
          <Search aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput id="site-search" type="search" placeholder="Filter by domain or region" />
      </InputGroup>
    </div>
  ),
};

/** The group's border/ring goes danger when the inner field is `aria-invalid`; wire `aria-describedby` to the message so the error is announced. */
export const Invalid: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="region">Region</Label>
      <InputGroup>
        <InputGroupAddon position="start" divider={false}>
          <Globe aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput id="region" className="font-mono" defaultValue="eu-west-9" aria-invalid="true" aria-describedby="region-error" />
      </InputGroup>
      <p id="region-error" className="font-body text-body-xs text-[var(--color-text-text-danger)]">
        Unknown region. Try eu-west-1 or us-east-2.
      </p>
    </div>
  ),
};

/** Disabled groups go muted and block input; the whole container reads muted. */
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="api-key">API key</Label>
      <InputGroup>
        <InputGroupAddon position="start" divider={false}>
          <Key aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput id="api-key" className="font-mono" defaultValue="wp_live_8f3c1a7e" disabled />
      </InputGroup>
    </div>
  ),
};
