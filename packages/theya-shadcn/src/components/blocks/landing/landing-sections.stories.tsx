import type { Meta, StoryObj } from '@storybook/react';
import { resetFocus } from '../../../test/keyboard';
import { testOnly } from '../../../lib/test-only';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { ArrowRight } from 'iconoir-react';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Button } from '../../ui/button';
import { HeroAccent } from './hero';
import { CtaBand, FaqSection, TestimonialCase } from './landing-sections';
import { landingSectionsGuidelines } from './landing-sections.guidelines';
import { SectionPanel } from './section-panel';

const meta: Meta<typeof FaqSection> = {
  title: 'Patterns: Landing/Sections',
  component: FaqSection,
  tags: ['autodocs'],
  parameters: { guidelines: landingSectionsGuidelines, layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof FaqSection>;

const FAQ = [
  { question: 'Can I bring my bookmarks from Chrome?', answer: 'Yes. Import from Chrome, Safari, Firefox, Pocket or a CSV; folders become folders and tags stay tags. It takes about a minute for a few thousand links.' },
  { question: 'What happens to a page that disappears?', answer: 'Bookmarks keeps a readable copy of every page you save, so a link that goes dead still opens — text, images and all.' },
  { question: 'Who can see my library?', answer: 'Only you. Shared folders are visible to the people you invite, and you can stop sharing at any time.' },
  { question: 'Is there a free plan?', answer: 'Free for one person, with unlimited links. Teams pay per member and get shared folders and rules.' },
  { question: 'Does it work offline?', answer: 'Saved copies open without a connection on the desktop and phone apps; new links sync when you are back online.' },
];

/** A customer case: the quote in the display serif with the person under it; a photo with two results beside it (Wispr). */
export const Testimonial: Story = {
  render: () => (
    <section data-scale="display" className="section-display">
      <div className="container-display">
        <TestimonialCase
          surface="tonal"
          hue="secondary"
          quote="I used to lose an afternoon a week hunting for sources. Now I type a word I remember from the page and it is there."
          name="Lea Brandt"
          role="Head of research, Northwind"
          avatar={
            <Avatar>
              <AvatarFallback>LB</AvatarFallback>
            </Avatar>
          }
          media={<img src="/asset-examples/silk/2.webp" alt="" />}
          results={[
            { value: '90%', label: 'less time finding a source' },
            { value: '3,400', label: 'links moved over in a day' },
          ]}
        />
      </div>
    </section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const figure = canvas.getByRole('figure');
    await expect(within(figure).getByText(/hunting for sources/)).toBeInTheDocument();
    await expect(canvas.getAllByRole('term')).toHaveLength(2);
    // Leave no focus ring behind: the story opens at rest, as a reader would see it.
    resetFocus();
  },
};

/** The FAQ as an accordion: the heading stays on the start side while the questions open on the end side. */
export const FaqAccordion: Story = {
  name: 'FAQ, accordion',
  render: () => <FaqSection title="Questions, answered" description="Anything else: write to us from the app, a person answers." items={FAQ} />,
  // Clicks a question: automated runs only, so the story opens at rest.
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const section = canvas.getByRole('region', { name: 'Questions, answered' });
    const q = within(section).getByRole('button', { name: 'Is there a free plan?' });
    await userEvent.click(q);
    await expect(q).toHaveAttribute('aria-expanded', 'true');
    await expect(within(section).getByText(/Free for one person/)).toBeVisible();
    // Leave no focus ring behind: the story opens at rest, as a reader would see it.
    resetFocus();
  }),
};

/** The FAQ as a chat (wide screens): pick a question and it is asked and answered as messages (Wispr). Below 1024px it is the accordion. */
export const FaqChat: Story = {
  name: 'FAQ, chat',
  render: () => (
    <FaqSection
      variant="chat"
      title="Questions, answered"
      items={FAQ}
      author="Bookmarks"
      avatar={
        <Avatar size="sm">
          <AvatarFallback>B</AvatarFallback>
        </Avatar>
      }
    />
  ),
  // Clicks a question: automated runs only, so the story opens at rest.
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const section = canvas.getByRole('region', { name: 'Questions, answered' });
    if (section.dataset.variant !== 'chat') return; // narrow viewport: the accordion, tested above
    const tabs = within(section).getAllByRole('tab');
    await expect(tabs).toHaveLength(5);
    await userEvent.click(tabs[2]);
    await expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
    await waitFor(() => expect(within(section).getByRole('tabpanel')).toHaveTextContent(/Only you/), { timeout: 2000 });
    // Leave no focus ring behind: the story opens at rest, as a reader would see it.
    resetFocus();
  }),
};

/** The last section: one big line and the main action (Wispr, Linear). */
export const Cta: Story = {
  name: 'CTA band',
  render: () => (
    <CtaBand
      title={
        <>
          Every page you saved, <HeroAccent>one search away.</HeroAccent>
        </>
      }
      actions={
        <>
          <Button size="lg">Start free</Button>
          <Button size="lg" appearance="ghost" tone="neutral" rightIcon={<ArrowRight className="rtl:-scale-x-100" />}>
            See pricing
          </Button>
        </>
      }
      note="Free for one person. Mac, Windows, iPhone and Android."
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: /one search away/ })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Start free' })).toBeInTheDocument();
    // Leave no focus ring behind: the story opens at rest, as a reader would see it.
    resetFocus();
  },
};

/** The CTA in a primary band, the line in the display serif. */
export const CtaInABand: Story = {
  name: 'CTA in a band',
  render: () => (
    <SectionPanel tone="primary">
      <CtaBand titleFont="serif" title="You have a library now. Use it." actions={<Button size="lg" tone="neutral">Start free</Button>} note="No card needed." className="py-0" />
    </SectionPanel>
  ),
};
