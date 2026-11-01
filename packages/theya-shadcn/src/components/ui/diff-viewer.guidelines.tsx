import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { DiffViewer } from './diff-viewer';
import { CodeBlock } from './code-block';

const OLD = 'long_edge: 2048\nquality: 82\nwatermark: on';
const NEW = 'long_edge: 4096\nquality: 82\nwatermark: on';

export const diffViewerGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'Reviewing a change before applying it: config, a template, a policy, a file restored from the archive.',
    'Showing what an automated change did (a bulk rename, an import) so people can trust it.',
  ],
  whenNotToUse: [
    { text: 'Only one version matters', instead: 'CodeBlock' },
    { text: 'Comparing structured records field by field', instead: 'DescriptionList or a table with old / new columns' },
    { text: 'Editing the result', instead: 'CodeEditor next to the diff' },
  ],
  anatomy: [
    { part: 'Header', description: <>filename (old → new when renamed), +/− stats, view switch and <C>actions</C>.</>, optional: true },
    { part: 'Lines', description: <>added / removed / unchanged with line numbers; changed words get a stronger highlight (<C>wordDiff</C>).</> },
    { part: 'Expander', description: <>a row standing in for hidden unchanged lines; <C>context</C> sets how many stay visible around each change.</> },
    { part: 'Empty message', description: 'shown when both texts are identical.', optional: true },
  ],
  doDont: [
    {
      do: {
        example: <div className="w-80"><DiffViewer oldValue={OLD} newValue={NEW} filename="export.yml" /></div>,
        caption: 'The change is visible at a glance, with the exact word highlighted.',
      },
      dont: {
        example: (
          <div className="flex w-80 flex-col gap-2">
            <CodeBlock filename="before" code={OLD} copy={false} />
            <CodeBlock filename="after" code={NEW} copy={false} />
          </div>
        ),
        caption: 'Two blocks side by side make people hunt for the difference.',
      },
    },
  ],
  a11y: [
    'Added and removed lines carry “Added:” / “Removed:” for screen readers; + and − signs back up the color.',
    <>The diff is a named, focusable region — set <C>label</C> when there are several on a page.</>,
    'Expanders are buttons that say how many lines they reveal.',
    'The view switch is a named toggle group. Unified is the default: split needs width and reads poorly on narrow screens.',
  ],
};
