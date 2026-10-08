import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
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

export const Playground: Story = {
  // The name says what a press will do, and flips with the theme.
  // Clicks twice so the page ends in the theme it started in.
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: /^Switch to (dark|light) theme$/ });
    const before = button.getAttribute('aria-label');
    const after = before === 'Switch to dark theme' ? 'Switch to light theme' : 'Switch to dark theme';
    await userEvent.click(button);
    await waitFor(() => expect(button).toHaveAccessibleName(after));
    await userEvent.click(button);
    await waitFor(() => expect(button).toHaveAccessibleName(before!));
  },
};
