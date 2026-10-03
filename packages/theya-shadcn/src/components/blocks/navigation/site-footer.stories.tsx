import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { SiteFooter } from './site-footer';
import { DEMO_FOOTER_COLUMNS } from './demo-data';

const meta: Meta<typeof SiteFooter> = {
  title: 'Patterns: Navigation/SiteFooter',
  component: SiteFooter,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    tagline: 'Hosting with a panel people enjoy using.',
    columns: DEMO_FOOTER_COLUMNS,
    contact: [
      { label: 'Support, 24/7', value: 'support@theya.dev', href: 'mailto:support@theya.dev' },
      { label: 'Sales', value: '+359 2 400 1234', href: 'tel:+35924001234' },
    ],
    status: { label: 'All systems operational', href: '#status', tone: 'success' },
    social: [
      { network: 'github', href: '#github' },
      { network: 'x', href: '#x' },
      { network: 'linkedin', href: '#linkedin' },
    ],
    legal: [
      { label: 'Terms', href: '#terms' },
      { label: 'Privacy', href: '#privacy' },
      { label: 'Cookies', href: '#cookies' },
    ],
    year: 2026,
  },
};
export default meta;
type Story = StoryObj<typeof SiteFooter>;

/** Contact and status up front, every column visible, legal links last. */
export const Default: Story = {
  render: function Render(args) {
    const [lang, setLang] = useState('en');
    return (
      <SiteFooter
        {...args}
        languages={[
          { value: 'en', label: 'English', country: 'GB' },
          { value: 'de', label: 'Deutsch', country: 'DE' },
          { value: 'bg', label: 'Български', country: 'BG' },
        ]}
        language={lang}
        onLanguageChange={setLang}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'Footer' });
    await expect(within(nav).getByRole('list', { name: 'Support' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'All systems operational' })).toHaveAttribute('href', '#status');
    await expect(canvas.getByRole('combobox', { name: 'Language' })).toHaveTextContent('EN');
    await expect(canvas.getByRole('link', { name: 'Theya on GitHub' })).toBeVisible();
  },
};

export const Minimal: Story = {
  args: { contact: [], status: undefined, social: [], tagline: undefined },
};
