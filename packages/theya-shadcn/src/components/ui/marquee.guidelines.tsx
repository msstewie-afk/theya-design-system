import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Marquee } from './marquee';

export const marqueeGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['A strip of customer logos, short quotes or partner names on a landing page — “trusted by”.'],
  whenNotToUse: [
    { text: 'Content people need to read or act on', instead: 'a static row or Carousel' },
    { text: 'News, alerts, anything time-critical', instead: 'Alert or AnnouncementBar' },
    { text: 'Product UI', instead: 'a static list' },
  ],
  anatomy: [
    { part: 'Track', description: <>the items twice, moving by half its width; <C>duration</C> seconds per loop.</> },
    { part: 'Edge fade', description: <>soft fade at both ends (<C>fade</C>).</>, optional: true },
    { part: 'Pause button', description: <>stops and resumes the strip (<C>pauseButton</C>, on by default).</> },
  ],
  doDont: [
    {
      do: { example: <Marquee duration={20} className="w-72 text-body-m"><span>Northwind</span><span>Kestrel</span><span>Quartz</span><span>Lumen</span></Marquee>, caption: 'Short, uniform items; calm speed; pause button kept.' },
      dont: { example: <Marquee duration={4} pauseButton={false} className="w-72 text-body-m"><span>Read our full terms before the offer ends tonight</span></Marquee>, caption: 'Long sentences racing past with no way to stop them.' },
    },
  ],
  a11y: [
    'WCAG 2.2.2: the strip pauses on hover and keyboard focus, and the pause button stops it for good.',
    'The second copy of the items is aria-hidden and inert: screen readers and Tab meet each item once.',
    'prefers-reduced-motion: no movement — the items wrap into rows.',
  ],
};
