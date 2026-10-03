import { useState } from 'react';
import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Lightbox } from './lightbox';

const IMAGES = [
  { src: '/asset-examples/login-carousel-01.jpg', alt: 'Dashboard overview', caption: 'Overview' },
  { src: '/asset-examples/login-carousel-02.jpg', alt: 'Site settings', caption: 'Settings' },
  { src: '/asset-examples/login-carousel-03.jpg', alt: 'Backups list', caption: 'Backups' },
];

const THUMB = 'overflow-hidden rounded-[var(--size-border-radius-border-radius-md)] focus-visible:outline-none focus-visible:focus-ring';

function Gallery() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  return (
    <>
      <div className="flex gap-2">
        {IMAGES.map((img, i) => (
          <button key={img.src} type="button" aria-label={`Open ${img.alt}`} className={THUMB} onClick={() => { setIndex(i); setOpen(true); }}>
            <img src={img.src} alt="" className="h-16 w-24 object-cover" />
          </button>
        ))}
      </div>
      <Lightbox images={IMAGES} open={open} onOpenChange={setOpen} index={index} onIndexChange={setIndex} thumbnails />
    </>
  );
}

function Avatar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" aria-label="Open team avatar" className="rounded-full focus-visible:outline-none focus-visible:focus-ring" onClick={() => setOpen(true)}>
        <img src="/asset-examples/panda-avatar.png" alt="" className="size-8 rounded-full" />
      </button>
      <Lightbox images={[{ src: '/asset-examples/panda-avatar.png', alt: 'Team avatar' }]} open={open} onOpenChange={setOpen} />
    </>
  );
}

export const lightboxGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['Looking closely at images — screenshots, product photos, attachments — and moving through a set.'],
  whenNotToUse: [
    { text: 'Small images that are already readable', instead: 'show them inline' },
    { text: 'Non-image content', instead: 'Dialog' },
  ],
  anatomy: [
    { part: 'Image', description: 'fit to screen; click or +/− to zoom, drag to pan.' },
    { part: 'Controls', description: 'previous/next, counter, close; caption under the image.' },
    { part: 'Thumbnails', optional: true, description: <><C>thumbnails</C> strip for a set.</> },
  ],
  doDont: [
    {
      do: { example: <Gallery />, caption: 'Screenshots worth a closer look, browsed as a set.' },
      dont: { example: <Avatar />, caption: 'A full-screen viewer for a 32px avatar with nothing more to see.' },
    },
  ],
  a11y: [
    'Built on Dialog: focus is trapped, Escape closes, focus returns to the thumbnail that opened it.',
    <>Every image needs real <C>alt</C>; the counter (“2 of 3”) is announced as you move.</>,
    '←/→ move, +/− zoom, 0 resets.',
  ],
};
