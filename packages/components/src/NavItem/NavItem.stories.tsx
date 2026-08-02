import type { Meta, StoryObj } from '@storybook/react';
import { NavItem } from './NavItem';
import { Icon } from '@theya/icons';

const meta: Meta<typeof NavItem> = {
  title: 'Components/NavItem',
  component: NavItem,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NavItem>;

export const Default: Story = {
  args: {
    icon: <Icon name="apps" size={16} />,
    label: 'Overview',
  },
  render: (args) => (
    <div style={{ width: 220 }}>
      <NavItem {...args} />
    </div>
  ),
};

export const ActiveWithBadge: Story = {
  render: () => (
    <div style={{ width: 220 }}>
      <NavItem icon={<Icon name="globe" size={16} />} label="Travel" badge={22} active />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 220 }}>
      <NavItem icon={<Icon name="chart-pie" size={16} />} label="Analytics" disabled />
    </div>
  ),
};

export const NestedInGroup: Story = {
  name: 'Nested (inside a NavGroup)',
  render: () => (
    <div style={{ width: 220 }}>
      <NavItem icon={<Icon name="wallet" size={16} />} label="Balance" nested />
    </div>
  ),
};

export const CollapsedRail: Story = {
  name: 'Collapsed (icon-rail mode)',
  render: () => (
    <div style={{ width: 64 }}>
      <NavItem icon={<Icon name="apps" size={16} />} label="Overview" collapsed showCollapsedLabel />
    </div>
  ),
};
