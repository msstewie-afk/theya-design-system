import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Bell, HelpCircle, Mail, Settings, User } from 'iconoir-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './breadcrumb';
import { Topbar, TopbarAction, TopbarSpacer } from './topbar';

const Frame = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div aria-label={label} role="group" className="w-[28rem] max-w-full overflow-hidden rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border-subtle)]">
    {children}
  </div>
);

export const topbarGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['The app header above the content: breadcrumb or page context on the left, a few global actions on the right.', <><C>orientation="vertical"</C> for a slim icon rail.</>],
  whenNotToUse: [
    { text: 'Section navigation', instead: 'Sidebar' },
    { text: 'A marketing site header', instead: 'NavigationMenu' },
    { text: 'Page-level actions (Save, Create)', instead: 'PageHeader' },
  ],
  anatomy: [
    { part: 'Menu button', optional: true, description: <><C>TopbarMenu</C> opens the Sidebar on small screens.</> },
    { part: 'Context', description: 'Breadcrumb, or a page title.' },
    { part: 'Search', optional: true, description: <><C>TopbarSearch</C>.</> },
    { part: 'Spacer and actions', description: <><C>TopbarSpacer</C>, then 2–4 <C>TopbarAction</C>s (icon buttons with names).</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <Frame label="Topbar example">
            <Topbar className="!static">
              <Breadcrumb aria-label="Topbar breadcrumb">
                <BreadcrumbList>
                  <BreadcrumbItem><BreadcrumbLink href="#gl-tb">Sites</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbPage>Backups</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <TopbarSpacer />
              <TopbarAction aria-label="Notifications" badge><Bell /></TopbarAction>
              <TopbarAction aria-label="Account"><User /></TopbarAction>
            </Topbar>
          </Frame>
        ),
        caption: 'Where you are on the left, two global actions on the right.',
      },
      dont: {
        example: (
          <Frame label="Overloaded topbar example">
            <Topbar className="!static">
              <TopbarSpacer />
              <TopbarAction aria-label="Help"><HelpCircle /></TopbarAction>
              <TopbarAction aria-label="Messages"><Mail /></TopbarAction>
              <TopbarAction aria-label="Notifications" badge><Bell /></TopbarAction>
              <TopbarAction aria-label="Settings"><Settings /></TopbarAction>
              <TopbarAction aria-label="Account"><User /></TopbarAction>
            </Topbar>
          </Frame>
        ),
        caption: 'A row of unlabeled icons and no context: people guess which is which and where they are.',
      },
    },
  ],
  a11y: [
    <>It’s the page <C>header</C> (banner); keep one per page.</>,
    <>Every <C>TopbarAction</C> needs <C>aria-label</C>; the badge dot is announced only through the label (“Notifications, 3 new”).</>,
    'Keep the same order on every page so people find actions by position.',
  ],
};
