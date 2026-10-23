import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { ThemeToggle } from './theme-toggle';
import { themeToggleGuidelines } from './theme-toggle.guidelines';

// Notes moved from the Docs description (the page now shows a reader-facing
// summary):
//   Toggles data-theme="dark" on <html>, matching Theya’s existing dark-theme
//   convention.
const meta: Meta<typeof ThemeToggle> = {
  title: 'Actions/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
  parameters: {
    guidelines: themeToggleGuidelines,
    docs: {
      description: {
        component: "A quick switch between the light and dark theme, for the top bar.",
      },
    },
  },
  argTypes: {
    className: { control: false, description: 'Icon-only button that flips light/dark theme on <html>.' },
  },
};

export default meta;
type Story = StoryObj<typeof ThemeToggle>;

/** An icon button that flips the whole page between light and dark; its label names the theme a press will switch to. */
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
