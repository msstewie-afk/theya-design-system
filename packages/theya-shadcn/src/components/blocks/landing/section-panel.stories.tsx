import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { Button } from '../../ui/button';
import { SectionPanel } from './section-panel';
import { sectionPanelGuidelines } from './section-panel.guidelines';

const meta: Meta<typeof SectionPanel> = {
  title: 'Patterns: Landing/SectionPanel',
  component: SectionPanel,
  tags: ['autodocs'],
  parameters: {
    guidelines: sectionPanelGuidelines,
    layout: 'fullscreen',
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['default', 'subtle', 'inverse', 'primary'] },
  },
};
export default meta;
type Story = StoryObj<typeof SectionPanel>;

function Content({ title, body }: { title: string; body: string }) {
  return (
    <div className="container-display-narrow flex flex-col items-start gap-4">
      <h2 className="m-0 font-heading text-heading-2xl text-[var(--color-text-text)]">{title}</h2>
      <p className="m-0 text-body-l text-[var(--color-text-text-subtle)]">{body}</p>
    </div>
  );
}

/** One panel; switch `tone` in the controls. */
export const Playground: Story = {
  args: { tone: 'subtle' },
  render: (args) => (
    <SectionPanel {...args} aria-labelledby="panel-title">
      <div className="container-display-narrow flex flex-col items-start gap-4">
        <h2 id="panel-title" className="m-0 font-heading text-heading-2xl text-[var(--color-text-text)]">
          Built for big collections
        </h2>
        <p className="m-0 text-body-l text-[var(--color-text-text-subtle)]">Drag links between folders, or let rules sort them.</p>
        <Button size="2xl">Get started</Button>
      </div>
    </SectionPanel>
  ),
};

/** Sheets laid over each other: page → dark band → brand → page again. */
export const Stacked: Story = {
  render: () => (
    <div className="bg-[var(--color-bg-surface-bg-surface)]">
      <section data-scale="display" className="section-display">
        <Content title="Every link, one place" body="Import from any browser and keep going where you left off." />
      </section>
      <SectionPanel tone="inverse" overlap aria-label="Why people switch">
        <Content title="Search that reads the page" body="Titles, notes and the text of every saved page, as you type." />
      </SectionPanel>
      <SectionPanel tone="primary" overlap aria-label="Get started">
        <div className="container-display-narrow flex flex-col items-start gap-6">
          <h2 className="m-0 font-heading text-heading-2xl">Start with your browser’s bookmarks</h2>
          <Button size="2xl">Import bookmarks</Button>
        </div>
      </SectionPanel>
      <SectionPanel overlap aria-label="Questions">
        <Content title="Good questions" body="Answers about import, sync and privacy." />
      </SectionPanel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dark = canvas.getByRole('region', { name: 'Why people switch' });
    await expect(dark).toHaveAttribute('data-theme', 'dark');
    await expect(canvas.getByRole('region', { name: 'Get started' })).toHaveAttribute('data-surface', 'primary');
  },
};
