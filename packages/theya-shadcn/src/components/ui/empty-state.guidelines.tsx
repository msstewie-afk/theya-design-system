import { Globe, Search } from 'iconoir-react';
import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { EmptyState } from './empty-state';
import { Button } from './button';

export const emptyStateGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'A list, table or section with nothing in it yet — explain what will appear and how to start.',
    <>No results for a search or filter (<C>filtered</C>) — say so and offer to clear.</>,
  ],
  whenNotToUse: [
    { text: 'Data is still loading', instead: 'Skeleton or TableSkeleton' },
    { text: 'Loading failed', instead: 'Alert with a retry' },
    { text: 'A whole-page onboarding flow', instead: 'a dedicated page or Stepper' },
  ],
  anatomy: [
    { part: 'Icon', description: 'decorative, hints at the object type.', optional: true },
    { part: 'Title', description: <>what’s empty: “No sites yet”. Use <C>titleAs="h2"</C> when it’s the main content of the region.</> },
    { part: 'Description', description: 'why it matters or what will show up here.', optional: true },
    { part: 'Action', description: 'the one next step: create, import, clear filters.', optional: true },
  ],
  doDont: [
    {
      do: {
        example: (
          <EmptyState
            className="w-80"
            icon={<Globe />}
            title="No sites yet"
            description="Create a site to get a domain, SSL and backups."
            action={<Button>Create site</Button>}
          />
        ),
        caption: 'Says what will be here and gives the first step.',
      },
      dont: { example: <EmptyState className="w-80" title="No data" />, caption: '“No data” — is it broken, loading, or just empty?' },
    },
    {
      do: {
        example: (
          <EmptyState
            className="w-80"
            icon={<Search />}
            title="No results for “shp”"
            description="Check the spelling or clear the filters."
            action={<Button appearance="tonal" tone="secondary">Clear filters</Button>}
          />
        ),
        caption: 'For a search, show the query and a way out.',
      },
      dont: {
        example: <EmptyState className="w-80" icon={<Globe />} title="No sites yet" action={<Button>Create site</Button>} />,
        caption: 'The “first time” state shown for a filter with no matches.',
      },
    },
  ],
  a11y: [
    'The icon is decorative; the title carries the meaning.',
    'When results drop to zero after typing or filtering, announce the count in a live region — the empty state itself isn’t one.',
    'One primary action at most; a second option goes in as a link or tonal button.',
  ],
};
