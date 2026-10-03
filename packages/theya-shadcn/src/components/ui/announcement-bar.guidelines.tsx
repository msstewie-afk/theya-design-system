import { InfoCircle, Sparks, WarningTriangle } from 'iconoir-react';
import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { AnnouncementBar } from './announcement-bar';

export const announcementBarGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'Something that concerns everyone on every page: planned maintenance, an ongoing incident, a policy change.',
    'A product announcement worth a strip above the header — rarely, one at a time.',
  ],
  whenNotToUse: [
    { text: 'A message about one page or section', instead: 'Alert' },
    { text: 'Feedback on an action just taken', instead: 'Toast' },
    { text: 'Something that needs a decision before going on', instead: 'AlertDialog' },
  ],
  anatomy: [
    { part: 'Bar', description: <>full width above the app header; <C>tone</C> × <C>appearance</C> (<C>filled</C> / <C>tonal</C>), optionally <C>sticky</C>.</> },
    { part: 'Icon', description: 'matches the tone; decorative.', optional: true },
    { part: 'Message', description: 'one sentence, one link at most.' },
    { part: 'Dismiss', description: <>remembered per browser with <C>dismissKey</C>; off for incidents.</>, optional: true },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="w-96">
            <AnnouncementBar tone="info" appearance="tonal" icon={<InfoCircle />} aria-label="Announcement, maintenance" dismissible={false}>
              Maintenance on Oct 12, 02:00–04:00 UTC. <a href="#">Details</a>
            </AnnouncementBar>
          </div>
        ),
        caption: 'What, when, and where to read more — in one line.',
      },
      dont: {
        example: (
          <div className="w-96">
            <AnnouncementBar tone="danger" icon={<WarningTriangle />} aria-label="Announcement, promo" dismissible={false}>
              New themes are here! Try them now!
            </AnnouncementBar>
          </div>
        ),
        caption: 'Danger for a promo — and nobody can close it.',
      },
    },
    {
      do: {
        example: (
          <div className="w-96">
            <AnnouncementBar tone="primary" icon={<Sparks />} aria-label="Announcement, feature">
              Certificates now renew 30 days early. <a href="#">Learn more</a>
            </AnnouncementBar>
          </div>
        ),
        caption: 'News can be dismissed; change dismissKey when the message changes.',
      },
      dont: {
        example: (
          <div className="flex w-96 flex-col gap-1">
            <AnnouncementBar tone="primary" aria-label="Announcement 1">New dashboard is live.</AnnouncementBar>
            <AnnouncementBar tone="warning" aria-label="Announcement 2">Billing update on Nov 1.</AnnouncementBar>
          </div>
        ),
        caption: 'Stacked bars push the app down and none of them gets read.',
      },
    },
  ],
  a11y: [
    'A named region landmark, not a live region: it’s there on page load and isn’t announced over what the user is doing.',
    <>Several bars on a page each need a unique <C>aria-label</C>.</>,
    'Links inside are underlined and inherit the bar’s color.',
    'After dismiss, focus moves to the next focusable element, not to the page body.',
  ],
};
