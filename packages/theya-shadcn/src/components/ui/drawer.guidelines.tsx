import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Button } from './button';
import { Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from './drawer';

export const drawerGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Short, touch-first tasks from the bottom of a phone screen: sort, filters, share, a few actions.', 'Content people dismiss with a swipe.'],
  whenNotToUse: [
    { text: 'Long or multi-step forms', instead: 'a page or Dialog' },
    { text: 'Side panels on desktop', instead: 'PushSheet' },
    { text: 'Confirming a destructive action', instead: 'AlertDialog' },
  ],
  anatomy: [
    { part: 'Handle', description: 'drag to dismiss; the backdrop fades with it.' },
    { part: 'Header', description: <><C>DrawerTitle</C> (required) and description.</> },
    { part: 'Body and footer', description: 'short content; the main action in the footer.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <Drawer>
            <DrawerTrigger asChild><Button appearance="outlined" tone="secondary" size="md">Sort</Button></DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Sort sites</DrawerTitle>
                <DrawerDescription>Choose an order for the list.</DrawerDescription>
              </DrawerHeader>
              <DrawerBody>
                <div className="flex flex-col gap-2">
                  {['Newest first', 'Name A–Z', 'Most traffic'].map((o) => (
                    <DrawerClose key={o} asChild>
                      <Button appearance="ghost" tone="secondary" size="lg" className="justify-start">{o}</Button>
                    </DrawerClose>
                  ))}
                </div>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        ),
        caption: 'A few big tap targets; one tap and it’s gone.',
      },
      dont: {
        example: (
          <Drawer>
            <DrawerTrigger asChild><Button appearance="outlined" tone="secondary" size="md">Create site</Button></DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Create site — step 1 of 4</DrawerTitle>
                <DrawerDescription>Domain, plan, region, database, admin account…</DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <Button appearance="filled" tone="primary" size="lg">Next</Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ),
        caption: 'A four-step wizard in a sheet one swipe can throw away.',
      },
    },
  ],
  a11y: [
    'It’s a modal dialog: focus is trapped, Escape closes, focus returns to the trigger.',
    <><C>DrawerTitle</C> names it; the swipe always has a button alternative (Close or an action).</>,
  ],
};
