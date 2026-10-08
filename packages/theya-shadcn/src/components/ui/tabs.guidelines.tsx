import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const panel = 'pt-3 font-body text-body-s text-[var(--color-text-text-subtle)]';

export const tabsGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Switching between views of the same object: Overview, Settings, Logs.', 'Two to about six sections people move between freely, in any order.'],
  whenNotToUse: [
    { text: 'Steps people go through in order', instead: 'Stepper' },
    { text: 'A tab state that should survive reload or be shared', instead: 'UrlTabs' },
    { text: 'Filtering one list (All / Unread)', instead: 'ToggleGroup' },
    { text: 'Navigating between pages', instead: 'links, Sidebar or NavigationMenu' },
  ],
  anatomy: [
    { part: 'List', description: <>underline (default) or <C>variant="chips"</C> — segmented, for a compact switch of views in a card or toolbar; scrolls when it doesn’t fit. The marker glides to the active tab.</> },
    { part: 'Trigger', description: <>label, optional <C>icon</C>, badge; <C>onClose</C> for closable tabs.</> },
    { part: 'Panel', description: <><C>TabsContent</C> for each value.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <Tabs defaultValue="overview">
            <TabsList aria-label="Site sections">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="domains">Domains</TabsTrigger>
              <TabsTrigger value="backups">Backups</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
            {['overview', 'domains', 'backups', 'logs'].map((v) => (
              <TabsContent key={v} value={v} className={panel}>The site’s {v}.</TabsContent>
            ))}
          </Tabs>
        ),
        caption: 'Parallel views of one site, visited in any order.',
      },
      dont: {
        example: (
          <Tabs defaultValue="1">
            <TabsList aria-label="Checkout">
              <TabsTrigger value="1">1. Account</TabsTrigger>
              <TabsTrigger value="2">2. Plan</TabsTrigger>
              <TabsTrigger value="3">3. Payment</TabsTrigger>
            </TabsList>
            {['1', '2', '3'].map((v) => (
              <TabsContent key={v} value={v} className={panel}>Step {v} form.</TabsContent>
            ))}
          </Tabs>
        ),
        caption: 'Numbered steps as tabs: people can skip to Payment with nothing filled in — use Stepper.',
      },
    },
  ],
  a11y: [
    <>Name the list (<C>aria-label</C>) when no heading does. Tab enters the list once; arrows switch tabs.</>,
    'Each panel is labelled by its tab; keep focusable content inside panels reachable with Tab.',
    <>Closable tabs: Delete or Backspace closes the focused tab; the × is for the pointer, with <C>closeLabel</C> as its tooltip.</>,
  ],
};
