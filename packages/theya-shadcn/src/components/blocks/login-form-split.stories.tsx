import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { LoginFormSplit } from './login-form-split';
import { loginFormSplitGuidelines } from './login-form-split.guidelines';

const SLIDES = [
  { src: '/asset-examples/login-carousel-01.jpg', alt: 'Abstract city of tall blue blocks' },
  { src: '/asset-examples/login-carousel-02.jpg', alt: 'Abstract stack of blocks with stairs' },
  { src: '/asset-examples/login-carousel-03.jpg', alt: 'Abstract archway made of blocks' },
];

const meta: Meta<typeof LoginFormSplit> = {
  title: 'Patterns/LoginFormSplit',
  component: LoginFormSplit,
  tags: ['autodocs'],
  parameters: {
    guidelines: loginFormSplitGuidelines,
    docs: {
      description: {
        component:
          "The wide sign-in page in two columns: images with a tagline on one side, the sign-in form on the other. On a phone only the form remains.",
      },
    },
    layout: 'padded',
  },
  argTypes: {
    slides: {
      control: false,
      description: 'Background images for the left panel. One slide renders as a static image (no carousel chrome); 2+ get a real, swipeable Carousel with dot indicators.',
      table: { category: 'Content' },
    },
    tagline: { control: 'text', description: 'Overlay caption above the dots, bottom-left of the image.', table: { category: 'Content' } },
    logo: { control: false, description: 'Top-left mark over the image. No default: renders nothing until you give it a logo.', table: { category: 'Content' } },
    backHref: { control: 'text', description: 'Top-right link over the image, e.g. back to the marketing site. Omit to hide it.', table: { category: 'Content' } },
    backLabel: { control: 'text', description: 'Label for the top-right back link.', table: { category: 'Content' } },
    autoplayInterval: { control: false, description: 'Auto-advance delay in ms. false disables autoplay.', table: { category: 'Behavior' } },
    onSubmit: { control: false, description: 'Fires on form submit.', table: { category: 'Events' } },
    appName: { control: 'text', description: 'Product name shown in the heading and on the brand mark.', table: { category: 'Content' } },
    forgotHref: { control: 'text', description: '"Forgot password" link target.', table: { category: 'Content' } },
    signupHref: { control: 'text', description: 'Sign-up link target.', table: { category: 'Content' } },
    showSso: { control: 'boolean', description: 'Show the "or continue with" single sign-on row.', table: { category: 'Appearance' } },
    card: { control: 'boolean', description: 'Wrap the fields in a bordered Card.', table: { category: 'Appearance' } },
  },
};

export default meta;
type Story = StoryObj<typeof LoginFormSplit>;

/** A carousel of three images with a tagline on one side, the sign-in form on the other; on a phone only the form remains. */
export const Default: Story = {
  render: () => (
    <div className="flex min-h-[640px] items-center justify-center p-6">
      <LoginFormSplit slides={SLIDES} tagline="Where Data Becomes Intelligence" onSubmit={(e) => e.preventDefault()} />
    </div>
  ),
};

/** One slide renders as a static image — no dots, no autoplay. */
export const SingleImageNoAutoplay: Story = {
  name: 'Single image (no carousel chrome)',
  render: () => (
    <div className="flex min-h-[640px] items-center justify-center p-6">
      <LoginFormSplit slides={[SLIDES[0]]} tagline="Where Data Becomes Intelligence" autoplayInterval={false} onSubmit={(e) => e.preventDefault()} />
    </div>
  ),
};

/** `logo` puts a mark top-left over the image, and `backHref` adds a “Back to website” link top-right. */
export const WithLogoAndBackLink: Story = {
  name: 'With logo and back link',
  render: () => (
    <div className="flex min-h-[640px] items-center justify-center p-6">
      <LoginFormSplit
        slides={SLIDES}
        tagline="Where Data Becomes Intelligence"
        logo={<span className="font-body text-body-l font-semibold text-[var(--color-text-text-on-dark)]">Theya Seashell</span>}
        backHref="#"
        onSubmit={(e) => e.preventDefault()}
      />
    </div>
  ),
};

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

/** Autoplay holds on hover and focus, and the Pause / Play button next to the dots stops and restarts it (WCAG 2.2.2). A short interval here so the test doesn't wait long. */
export const AutoplayPause: Story = {
  name: 'Autoplay with Pause / Play',
  render: () => (
    <div className="flex min-h-[640px] items-center justify-center p-6">
      <LoginFormSplit slides={SLIDES} tagline="Where Data Becomes Intelligence" autoplayInterval={700} onSubmit={(e) => e.preventDefault()} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Below md the image panel isn't shown at all.
    if (!window.matchMedia('(min-width: 768px)').matches) return;
    // prefers-reduced-motion: no autoplay, so no toggle either.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await expect(canvas.queryByRole('button', { name: 'Pause' })).not.toBeInTheDocument();
      return;
    }
    const dots = within(canvas.getByRole('group', { name: 'Slides' }));
    const current = () => dots.getAllByRole('button').findIndex((b) => b.getAttribute('aria-current') === 'true');
    const panel = canvas.getByRole('region', { name: 'Where Data Becomes Intelligence' }).parentElement as HTMLElement;
    // Leave the panel: no hover and no focus inside it, so only the toggle decides.
    const leave = async (el: HTMLElement) => {
      el.blur();
      await userEvent.unhover(panel);
    };

    // It runs on its own.
    const start = current();
    await waitFor(() => expect(current()).not.toBe(start), { timeout: 3000 });

    // Pause: named, and the slide stays put after the pointer and focus leave.
    const toggle = canvas.getByRole('button', { name: 'Pause' });
    await userEvent.click(toggle);
    await waitFor(() => expect(toggle).toHaveAccessibleName('Play'));
    await leave(toggle);
    const held = current();
    await wait(1600);
    await expect(current()).toBe(held);

    // Play: it moves again.
    await userEvent.click(toggle);
    await waitFor(() => expect(toggle).toHaveAccessibleName('Pause'));
    await leave(toggle);
    await waitFor(() => expect(current()).not.toBe(held), { timeout: 3000 });
  },
};
