import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './resizable';

const BOX = 'h-40 w-full rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border)]';
const PANE = 'flex size-full items-center justify-center p-3 font-body text-body-s text-[var(--color-text-text-subtle)]';

export const resizableGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Work views where people balance two or three panes themselves: file tree + editor, list + details, editor + preview.'],
  whenNotToUse: [
    { text: 'Page layout that should just adapt', instead: 'responsive CSS' },
    { text: 'A details panel that opens and closes', instead: 'PushSheet' },
  ],
  anatomy: [
    { part: 'Group', description: <><C>orientation</C> horizontal/vertical.</> },
    { part: 'Panels', description: <><C>defaultSize</C>, <C>minSize</C> so no pane collapses to nothing.</> },
    { part: 'Handle', description: <><C>withHandle</C> grip; named per pane (“Resize file tree”).</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <ResizablePanelGroup orientation="horizontal" className={BOX}>
            <ResizablePanel defaultSize="35%" minSize="25%"><div className={PANE}>Files</div></ResizablePanel>
            <ResizableHandle withHandle aria-label="Resize file list" />
            <ResizablePanel defaultSize="65%" minSize="40%"><div className={PANE}>Editor</div></ResizablePanel>
          </ResizablePanelGroup>
        ),
        caption: 'Sensible minimums and a named, visible grip.',
      },
      dont: {
        example: (
          <ResizablePanelGroup orientation="horizontal" className={BOX}>
            <ResizablePanel defaultSize="35%" minSize="0%"><div className={PANE}>Files</div></ResizablePanel>
            <ResizableHandle aria-label="Resize panel" />
            <ResizablePanel defaultSize="65%" minSize="0%"><div className={PANE}>Editor</div></ResizablePanel>
          </ResizablePanelGroup>
        ),
        caption: 'No minimums and a hairline handle: panes can vanish, and the handle is hard to find.',
      },
    },
  ],
  a11y: [
    'The handle is role="separator": arrow keys resize, Home/End jump, double-click resets.',
    <>Give each handle an <C>aria-label</C> that names what it resizes.</>,
  ],
};
