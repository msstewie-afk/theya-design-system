import type { Meta, StoryObj } from '@storybook/react';
import { A11yMatrixPage } from '../docs/a11y';

const meta: Meta = {
  title: 'Design System/Accessibility',
  // The page column (DocsPage) owns the spacing, like a Docs page.
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj;

/** Every component against WCAG 2.2 AA — generated from the tests and the code (spec/a11y.json). */
export const Matrix: Story = {
  name: 'Matrix',
  render: () => <A11yMatrixPage />,
};
