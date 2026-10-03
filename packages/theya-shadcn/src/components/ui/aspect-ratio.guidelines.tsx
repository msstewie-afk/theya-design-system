import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { AspectRatio } from './aspect-ratio';

const IMG = '/asset-examples/login-carousel-02.jpg';

export const aspectRatioGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Media whose box must keep its shape before it loads: previews, thumbnails, video, maps.', 'Grids of cards where images must line up.'],
  whenNotToUse: [
    { text: 'Text content', instead: 'normal layout — text needs to grow' },
    { text: 'Images that must be shown whole at their own ratio', instead: 'a plain img with width only' },
  ],
  anatomy: [
    { part: 'Box', description: <><C>ratio</C> (16/9 default); clips overflow.</> },
    { part: 'Child', description: 'one fill element (absolute inset-0), usually object-cover, with alt.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="grid w-full grid-cols-2 gap-2">
            {[0, 1].map((i) => (
              <AspectRatio key={i} ratio={16 / 9} className="overflow-hidden rounded-[var(--size-border-radius-border-radius-md)]">
                <img src={IMG} alt={`Site preview ${i + 1}`} className="absolute inset-0 size-full object-cover" />
              </AspectRatio>
            ))}
          </div>
        ),
        caption: 'Every preview the same shape; the grid doesn’t jump while images load.',
      },
      dont: {
        example: (
          <div className="grid w-full grid-cols-2 items-start gap-2">
            <img src={IMG} alt="Site preview 1" className="w-full rounded-[var(--size-border-radius-border-radius-md)]" />
            <img src="/asset-examples/panda-avatar.png" alt="Site preview 2" className="w-full rounded-[var(--size-border-radius-border-radius-md)]" />
          </div>
        ),
        caption: 'Natural ratios side by side: ragged rows and layout shift on load.',
      },
    },
  ],
  a11y: ['The child image still needs alt (or alt="" if decorative); the box itself adds nothing for screen readers.'],
};
