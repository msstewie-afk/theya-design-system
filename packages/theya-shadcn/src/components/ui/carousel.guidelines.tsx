import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './carousel';

const TILE = 'flex h-28 items-center justify-center rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] px-12 text-center font-body text-body-s font-medium text-[var(--color-text-text)]';

function Slides({ label, items }: { label: string; items: string[] }) {
  return (
    <Carousel aria-label={label} className="mx-auto w-full max-w-xs">
      <CarouselContent>
        {items.map((name, i) => (
          <CarouselItem key={name} aria-label={`${i + 1} of ${items.length}`}><div className={TILE}>{name}</div></CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

export const carouselGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Browsing a set of similar, optional items one or a few at a time: templates, screenshots, product photos.'],
  whenNotToUse: [
    { text: 'Key messages or anything people must see', instead: 'show it on the page — later slides are rarely seen' },
    { text: 'A few items that fit', instead: 'a grid' },
  ],
  anatomy: [
    { part: 'Track', description: <>drag/swipe; <C>orientation</C>, <C>opts</C> (align, loop).</> },
    { part: 'Items', description: '“2 of 6” as each slide’s name.' },
    { part: 'Controls', description: <><C>CarouselPrevious</C>/<C>CarouselNext</C>, optional indicators.</> },
  ],
  doDont: [
    {
      do: { example: <Slides label="Site templates" items={['Blog', 'Shop', 'Portfolio', 'Docs', 'Landing', 'Wiki']} />, caption: 'Templates to browse — optional, alike, and many.' },
      dont: { example: <Slides label="Announcements" items={['Price change on May 1', 'Planned downtime Sat', 'New region: Mumbai']} />, caption: 'Important notices in slides: most people never see slide 2 or 3.' },
    },
  ],
  a11y: [
    <>A named region (<C>aria-label</C>) with role description “carousel”; each item says its position.</>,
    'Arrow keys move between slides; Previous/Next are named buttons. No autoplay — or a pause button if you must.',
  ],
};
