import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './breadcrumb';

export const breadcrumbGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Showing where a page sits in a hierarchy of three or more levels, and letting people go up.', <>Long trails: collapse the middle with <C>BreadcrumbEllipsis</C> (a menu of the hidden levels).</>],
  whenNotToUse: [
    { text: 'Steps of a process', instead: 'Stepper' },
    { text: 'Flat sites with one or two levels', instead: 'the page title alone' },
    { text: 'Browsing history (“back”)', instead: 'a Back link' },
  ],
  anatomy: [
    { part: 'Links', description: <><C>BreadcrumbLink</C> for each ancestor, in sentence case.</> },
    { part: 'Separator', description: 'hairline chevron.' },
    { part: 'Current page', description: <><C>BreadcrumbPage</C> — text, not a link.</> },
    { part: 'Ellipsis', optional: true, description: 'hidden middle levels in a menu.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <Breadcrumb aria-label="Breadcrumb example">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="#gl-bc">Sites</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href="#gl-bc">shop.seashell.dev</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Backups</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        ),
        caption: 'Ancestors are links; the current page is plain text at the end.',
      },
      dont: {
        example: (
          <Breadcrumb aria-label="Wizard as breadcrumb">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="#gl-bc">Account</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href="#gl-bc">Plan</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Payment</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        ),
        caption: 'Wizard steps as a breadcrumb: they’re a sequence, not a hierarchy — use Stepper.',
      },
    },
  ],
  a11y: [
    <>It’s a <C>nav</C> named “Breadcrumb”; the current page has <C>aria-current="page"</C>.</>,
    'Separators are hidden from screen readers.',
    'The ellipsis is a button named “Show N more levels”.',
  ],
};
