import type { Meta, StoryObj } from '@storybook/react';
import { ChangelogPage } from '../docs/changelog';

const meta: Meta = {
  title: 'Design System/Changelog',
  // The page column (DocsPage) owns the spacing, like a Docs page.
  // No visual snapshot: the page changes with every changeset.
  parameters: { layout: 'fullscreen', visual: { disable: true } },
};

export default meta;
type Story = StoryObj;

/** Unreleased changesets and released versions of both packages (CHANGELOG.md). */
export const Changelog: Story = {
  name: 'Changelog',
  render: () => <ChangelogPage />,
};
