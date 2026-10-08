import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { TabsContent, TabsList, TabsTrigger } from './tabs';

const panel = 'pt-3 font-body text-body-s text-[var(--color-text-text-subtle)]';
import { UrlTabs } from './url-tabs';

export const urlTabsGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Page-level tabs people link to, share, or return to after reload: a resource’s Settings or Billing tab.', <>Pass <C>values</C> so a stale <C>?tab=</C> falls back to the default.</>],
  whenNotToUse: [
    { text: 'Tabs inside a dialog, popover or card', instead: 'Tabs' },
    { text: 'Several tab groups on one page sharing a param', instead: 'separate param names, or Tabs' },
  ],
  anatomy: [
    { part: 'Tabs', description: 'the same Tabs, TabsList, TabsTrigger, TabsContent.' },
    { part: 'URL param', description: <><C>param</C> (default “tab”), written with replaceState — no history entry per arrow key.</> },
    { part: 'Router adapter', optional: true, description: <><C>navigate</C> for your router.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <UrlTabs param="gl-section" defaultValue="general" values={['general', 'billing', 'members']}>
            <TabsList aria-label="Settings sections">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>
            {['general', 'billing', 'members'].map((v) => (
              <TabsContent key={v} value={v} className={panel}>{v[0].toUpperCase() + v.slice(1)} settings.</TabsContent>
            ))}
          </UrlTabs>
        ),
        caption: 'A settings page: “Billing” can be bookmarked, shared, and survives reload.',
      },
      dont: {
        example: (
          <div className="w-72 rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border)] p-3">
            <p className="mb-2 font-body text-body-s font-medium text-[var(--color-text-text)]">Quick preview</p>
            <UrlTabs param="gl-preview" defaultValue="code" values={['code', 'result']}>
              <TabsList aria-label="Preview">
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="result">Result</TabsTrigger>
              </TabsList>
              <TabsContent value="code" className={panel}>{'<Button>Save</Button>'}</TabsContent>
              <TabsContent value="result" className={panel}>A Save button.</TabsContent>
            </UrlTabs>
          </div>
        ),
        caption: 'Tabs in a small preview card rewriting the page URL — plain Tabs are enough.',
      },
    },
  ],
  a11y: [
    'Same keyboard model as Tabs.',
    'Opening a shared URL lands on the right tab; focus stays at the top of the page, not on the tab.',
  ],
};
