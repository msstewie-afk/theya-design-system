import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Lightbox, type LightboxImage } from './lightbox';

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
  parameters: { layout: 'padded' },
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
};
