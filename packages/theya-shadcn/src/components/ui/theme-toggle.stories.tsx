import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from './theme-toggle';
import { themeToggleGuidelines } from './theme-toggle.guidelines';

const meta: Meta<typeof ThemeToggle> = {
  title: 'Actions/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
  parameters: {
    guidelines: themeToggleGuidelines,
    docs: {
      description: {
        component: 'Toggles data-theme="dark" on <html>, matching Theya\u2019s existing dark-theme convention.',
      },
    },
  },
  argTypes: {
    className: { control: false, description: 'Icon-only button that flips light/dark theme on <html>.' },
  },
};

export default meta;
type Story = StoryObj<typeof ThemeToggle>;

export const Playground: Story = {};
