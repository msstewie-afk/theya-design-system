import type { Meta, StoryObj } from '@storybook/react';
import { LoginFormSplit } from './login-form-split';

const SLIDES = [
  { src: '/asset-examples/login-carousel-01.jpg', alt: 'Abstract city of tall blue blocks' },
  { src: '/asset-examples/login-carousel-02.jpg', alt: 'Abstract stack of blocks with stairs' },
  { src: '/asset-examples/login-carousel-03.jpg', alt: 'Abstract archway made of blocks' },
];

const meta: Meta<typeof LoginFormSplit> = {
  title: 'Patterns/LoginFormSplit',
  component: LoginFormSplit,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
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

export const Default: Story = {
  render: () => (
    <div className="flex min-h-[640px] items-center justify-center p-6">
      <LoginFormSplit slides={SLIDES} tagline="Where Data Becomes Intelligence" onSubmit={(e) => e.preventDefault()} />
    </div>
  ),
};

export const SingleImageNoAutoplay: Story = {
  name: 'Single image (no carousel chrome)',
  render: () => (
    <div className="flex min-h-[640px] items-center justify-center p-6">
      <LoginFormSplit slides={[SLIDES[0]]} tagline="Where Data Becomes Intelligence" autoplayInterval={false} onSubmit={(e) => e.preventDefault()} />
    </div>
  ),
};

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
