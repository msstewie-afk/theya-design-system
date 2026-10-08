import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './pagination';

export const paginationGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Long lists and tables split into pages people jump between: search results, logs, invoices.', 'When the position in the set matters (“page 3 of 10”).'],
  whenNotToUse: [
    { text: 'Feeds people scroll through', instead: 'a “Load more” button or infinite scroll' },
    { text: 'Fewer than about 25 items', instead: 'show them all' },
  ],
  anatomy: [
    { part: 'Previous / Next', description: <>disabled at the ends (<C>disabled</C> keeps them announced).</> },
    { part: 'Pages', description: <>first, last, and the current with neighbours; <C>isActive</C> marks the current.</> },
    { part: 'Ellipsis', description: 'for skipped ranges.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <Pagination aria-label="Results pages">
            <PaginationContent>
              <PaginationItem><PaginationPrevious href="#gl-pg" /></PaginationItem>
              <PaginationItem><PaginationLink href="#gl-pg">1</PaginationLink></PaginationItem>
              <PaginationItem><PaginationEllipsis /></PaginationItem>
              <PaginationItem><PaginationLink href="#gl-pg">4</PaginationLink></PaginationItem>
              <PaginationItem><PaginationLink href="#gl-pg" isActive>5</PaginationLink></PaginationItem>
              <PaginationItem><PaginationLink href="#gl-pg">6</PaginationLink></PaginationItem>
              <PaginationItem><PaginationEllipsis /></PaginationItem>
              <PaginationItem><PaginationLink href="#gl-pg">12</PaginationLink></PaginationItem>
              <PaginationItem><PaginationNext href="#gl-pg" /></PaginationItem>
            </PaginationContent>
          </Pagination>
        ),
        caption: 'First, last, and the pages around the current one.',
      },
      dont: {
        example: (
          <Pagination aria-label="Results pages, all numbers">
            <PaginationContent className="flex-wrap">
              {Array.from({ length: 12 }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink href="#gl-pg" isActive={i === 4}>{i + 1}</PaginationLink>
                </PaginationItem>
              ))}
            </PaginationContent>
          </Pagination>
        ),
        caption: 'Every page number, no Previous/Next: it wraps and keeps growing with the data.',
      },
    },
  ],
  a11y: [
    <>A <C>nav</C> named “Pagination”; give each one on a page its own name.</>,
    <>The current page has <C>aria-current="page"</C>; Previous/Next have text names, not just arrows.</>,
    'After changing page, move focus to the top of the results.',
  ],
};
