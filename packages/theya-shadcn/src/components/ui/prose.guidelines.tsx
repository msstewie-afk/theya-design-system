import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Prose } from './prose';

export const proseGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Long-form content Theya doesn’t lay out itself: help articles, changelogs, legal pages, rendered Markdown or CMS HTML.'],
  whenNotToUse: [
    { text: 'App UI — forms, cards, tables you build', instead: 'components with their own typography' },
    { text: 'A single paragraph', instead: 'plain text classes' },
  ],
  anatomy: [
    { part: 'Wrapper', description: <><C>size</C> sm/md/lg; plain h1–h4, p, lists, code, tables, blockquote get the type scale and rhythm.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <Prose size="sm" className="w-full">
            <h3>Restore a backup</h3>
            <p>Backups run every night and are kept for <strong>14 days</strong>.</p>
            <ol>
              <li>Open <em>Backups</em>.</li>
              <li>Pick a date and choose <kbd>Restore</kbd>.</li>
            </ol>
          </Prose>
        ),
        caption: 'A help article: plain HTML, readable without a single class.',
      },
      dont: {
        example: (
          <Prose size="sm" className="w-full">
            <div className="flex items-center justify-between rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border)] p-3">
              <p>shop.seashell.dev</p>
              <p>Running</p>
            </div>
          </Prose>
        ),
        caption: 'App UI inside Prose: article margins and text styles leak into the component.',
      },
    },
  ],
  a11y: ['Keep the source semantic (real headings in order, lists, table headers) — Prose styles structure, it doesn’t create it.'],
};
