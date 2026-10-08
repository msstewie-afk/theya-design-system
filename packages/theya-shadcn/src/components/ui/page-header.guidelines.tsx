import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Plus } from 'iconoir-react';
import { Button } from './button';
import { PageHeader } from './page-header';

const FRAME = 'w-full rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border)] p-4';

export const pageHeaderGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['The top of a page or major section: title, a line of description, and the page’s main action on the right.'],
  whenNotToUse: [
    { text: 'Global app actions (account, notifications)', instead: 'Topbar' },
    { text: 'Sub-sections inside a page', instead: 'a heading, or PageHeader with as="h2"' },
  ],
  anatomy: [
    { part: 'Title', description: <>h1 by default (<C>as</C> h2/h3 for sections); optional <C>icon</C> and <C>tags</C>.</> },
    { part: 'Description', optional: true, description: 'one or two lines.' },
    { part: 'Actions', optional: true, description: 'right-aligned on the top row: one primary, maybe one secondary.' },
    { part: 'Breadcrumb / meta', optional: true, description: <><C>breadcrumb</C>, <C>children</C> for meta rows.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className={FRAME}>
            <PageHeader as="h2" title="Sites" description="Websites hosted in this workspace." actions={<Button leftIcon={<Plus />} size="md">New site</Button>} />
          </div>
        ),
        caption: 'One primary action that matches the page.',
      },
      dont: {
        example: (
          <div className={FRAME}>
            <PageHeader
              as="h2"
              title="Sites"
              actions={
                <div className="flex gap-2">
                  <Button appearance="filled" tone="primary" size="md">New site</Button>
                  <Button appearance="filled" tone="primary" size="md">Import</Button>
                  <Button appearance="filled" tone="primary" size="md">Export</Button>
                </div>
              }
            />
          </div>
        ),
        caption: 'Three primary buttons: nothing stands out — keep one primary, move the rest to a menu.',
      },
    },
  ],
  a11y: ['One h1 per page; use as="h2" for section headers so the outline stays correct.'],
};
