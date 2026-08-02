import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NavGroup } from './NavGroup';
import { NavItem } from '../NavItem/NavItem';
import { Icon } from '@theya/icons';

const meta: Meta<typeof NavGroup> = {
  title: 'Components/NavGroup',
  component: NavGroup,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NavGroup>;

export const Default: Story = {
  render: () => {
    const [active, setActive] = useState('overview');
    return (
      <div style={{ width: 260 }}>
        <NavGroup label="My Profile">
          <NavItem
            icon={<Icon name="apps" size={16} />}
            label="Overview"
            active={active === 'overview'}
            onClick={() => setActive('overview')}
          />
          <NavItem
            icon={<Icon name="wallet" size={16} />}
            label="Balance"
            active={active === 'balance'}
            onClick={() => setActive('balance')}
          />
          <NavItem
            icon={<Icon name="globe" size={16} />}
            label="Travel"
            badge={22}
            active={active === 'travel'}
            onClick={() => setActive('travel')}
          />
        </NavGroup>
      </div>
    );
  },
};

export const CollapsedByDefault: Story = {
  render: () => (
    <div style={{ width: 260 }}>
      <NavGroup label="My Profile" defaultOpen={false}>
        <NavItem icon={<Icon name="apps" size={16} />} label="Overview" />
        <NavItem icon={<Icon name="wallet" size={16} />} label="Balance" />
      </NavGroup>
    </div>
  ),
};

export const IconRailMode: Story = {
  name: 'Icon-rail (collapsed) mode',
  render: () => (
    <div style={{ width: 64 }}>
      <NavGroup label="My Profile" collapsed>
        <NavItem icon={<Icon name="apps" size={16} />} label="Overview" collapsed />
        <NavItem icon={<Icon name="wallet" size={16} />} label="Balance" collapsed />
        <NavItem icon={<Icon name="globe" size={16} />} label="Travel" collapsed />
      </NavGroup>
    </div>
  ),
};
