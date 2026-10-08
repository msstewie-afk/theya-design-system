import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Tree } from './tree';

export const treeGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['Real hierarchy people expand and pick from: files and folders, DNS zones, nested categories.'],
  whenNotToUse: [
    { text: 'A flat list', instead: 'ListItem or a menu' },
    { text: 'Site navigation', instead: 'Sidebar' },
    { text: 'Rows with several columns', instead: 'DataTable' },
    { text: 'Showing / hiding sections of content', instead: 'Accordion' },
  ],
  anatomy: [
    { part: 'Item', description: 'chevron for parents, optional icon, label.' },
    { part: 'Group', description: 'children, indented one level.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <Tree
            aria-label="Site files"
            className="w-64"
            defaultExpandedIds={['public']}
            items={[
              { id: 'public', label: 'public', children: [{ id: 'index', label: 'index.html' }, { id: 'robots', label: 'robots.txt' }] },
              { id: 'logs', label: 'logs', children: [{ id: 'access', label: 'access.log' }] },
            ]}
          />
        ),
        caption: 'Folders that really nest.',
      },
      dont: {
        example: (
          <Tree aria-label="Plans" className="w-64" items={[{ id: 's', label: 'Starter' }, { id: 'p', label: 'Pro' }, { id: 'x', label: 'Scale' }]} />
        ),
        caption: 'One level is just a list — a tree adds keyboard rules for nothing.',
      },
    },
  ],
  a11y: [
    <>Name it with <C>aria-label</C> or <C>aria-labelledby</C> (it warns in dev otherwise).</>,
    'One tab stop; ↑/↓ move, → expands or steps in, ← collapses or steps out, Home/End, Enter/Space select, typing jumps.',
    'Expanded and selected state are announced, so is the position (“2 of 5”).',
  ],
};
