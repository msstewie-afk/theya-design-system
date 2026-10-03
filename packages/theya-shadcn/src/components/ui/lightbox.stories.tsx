import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Lightbox, type LightboxImage } from './lightbox';
import { lightboxGuidelines } from './lightbox.guidelines';

/**
 * Lightbox — full-screen image viewer on Radix Dialog: previous/next
 * (buttons, ←/→, swipe), counter, captions, click-to-zoom with drag to
 * pan, thumbnails. Always on a dark backdrop. Focus is trapped while open
 * and returns to the thumbnail that opened it.
 */
const meta = {
  title: 'Overlays/Lightbox',
  component: Lightbox,
  tags: ['autodocs'],
  parameters: { guidelines: lightboxGuidelines, layout: 'padded' },
  argTypes: {
    open: { control: false },
    onOpenChange: { control: false },
    images: { control: false },
    thumbnails: { control: 'boolean', table: { category: 'Appearance' } },
    title: { control: 'text', table: { category: 'Content' } },
  },
} satisfies Meta<typeof Lightbox>;

export default meta;
type Story = StoryObj<typeof meta>;

const IMAGES: LightboxImage[] = [
  { src: '/asset-examples/login-carousel-01.jpg', alt: 'Dashboard overview with traffic and uptime cards', caption: 'Overview — traffic, uptime and recent deploys at a glance.' },
  { src: '/asset-examples/login-carousel-02.jpg', alt: 'Deploy log streaming in a terminal panel', caption: 'Deploys stream their logs live; failures link straight to the line.' },
  { src: '/asset-examples/login-carousel-03.jpg', alt: 'Region picker on a world map', caption: 'Move a site between regions without downtime.' },
  { src: '/asset-examples/nova-web.jpg', alt: 'Storefront home page on a laptop', caption: 'A storefront running on Seashell Sites.' },
  { src: '/asset-examples/product-rack-server.svg', alt: 'Illustration of a rack server' },
];

/** A gallery grid: click any image to open the viewer at it. Try ←/→, click to zoom and drag, Esc to close. */
export const Gallery: Story = {
  args: { images: IMAGES, open: false, onOpenChange: () => {} },
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);
    return (
      <>
        <div className="grid w-full max-w-[640px] grid-cols-3 gap-2">
          {IMAGES.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => {
                setIndex(i);
                setOpen(true);
              }}
              aria-label={`Open image ${i + 1}: ${img.alt}`}
              className="aspect-video overflow-hidden rounded-[var(--size-border-radius-border-radius-xl)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] outline-none focus-visible:focus-ring"
            >
              <img src={img.src} alt="" className="size-full object-cover transition-transform duration-200 hover:scale-105 motion-reduce:transition-none" />
            </button>
          ))}
        </div>
        <Lightbox {...args} images={IMAGES} open={open} onOpenChange={setOpen} index={index} onIndexChange={setIndex} title="Seashell Sites screenshots" />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const opener = canvas.getByRole('button', { name: /^Open image 2:/ });
    const live = () => document.querySelector('[role="dialog"] [aria-live="polite"]')!;

    // Opens at the clicked image; the position is announced and the thumbnail marked.
    await userEvent.click(opener);
    const dialog = await body.findByRole('dialog', { name: 'Seashell Sites screenshots' });
    await expect(live()).toHaveTextContent('Image 2 of 5: Deploy log streaming in a terminal panel');
    await expect(within(dialog).getByRole('button', { name: /^Show image 2:/ })).toHaveAttribute('aria-current', 'true');

    // Arrow keys page, wrapping at both ends.
    await userEvent.keyboard('{ArrowRight}');
    await expect(live()).toHaveTextContent('Image 3 of 5');
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}');
    await expect(live()).toHaveTextContent('Image 5 of 5');

    // + zooms, 0 resets; the button label follows.
    await userEvent.keyboard('+');
    await expect(within(dialog).getByRole('button', { name: 'Zoom out' })).toBeInTheDocument();
    await userEvent.keyboard('0');
    await expect(within(dialog).getByRole('button', { name: 'Zoom in' })).toBeInTheDocument();
    // Paging resets the zoom.
    await userEvent.keyboard('+{ArrowRight}');
    await expect(within(dialog).getByRole('button', { name: 'Zoom in' })).toBeInTheDocument();

    // A thumbnail jumps straight to its image.
    await userEvent.click(within(dialog).getByRole('button', { name: /^Show image 4:/ }));
    await expect(live()).toHaveTextContent('Image 4 of 5: Storefront home page on a laptop');

    // Esc closes and focus returns to the image that opened the viewer.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(opener).toHaveFocus());
  },
};

/** A single image: no counter, arrows or thumbnails — just zoom and close. */
export const SingleImage: Story = {
  args: { images: IMAGES.slice(3, 4), open: false, onOpenChange: () => {} },
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open storefront screenshot" className="w-[320px] overflow-hidden rounded-[var(--size-border-radius-border-radius-xl)] outline-none focus-visible:focus-ring">
          <img src={IMAGES[3].src} alt="" className="w-full" />
        </button>
        <Lightbox {...args} open={open} onOpenChange={setOpen} title="Storefront screenshot" />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Open storefront screenshot' }));
    const dialog = await body.findByRole('dialog', { name: 'Storefront screenshot' });
    // One image: no paging controls or thumbnails, arrows do nothing.
    await expect(within(dialog).queryByRole('button', { name: 'Next image' })).not.toBeInTheDocument();
    await expect(within(dialog).queryByRole('group', { name: 'Thumbnails' })).not.toBeInTheDocument();
    await userEvent.keyboard('{ArrowRight}');
    await expect(dialog.querySelector('[aria-live="polite"]')).toHaveTextContent('Image 1 of 1');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  },
};
