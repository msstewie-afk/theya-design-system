import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Button } from './button';
import { KebabIconHorizontal, KebabIconVertical } from './kebab-icon';

export const kebabIconGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['The trigger of an overflow menu: “more actions” for a row, a card or a toolbar.', <>Vertical in rows and cards, horizontal in toolbars and headers — keep one per context.</>],
  whenNotToUse: [
    { text: 'Hiding the one or two actions people use most — show them as buttons' },
    { text: 'A truncated path or pagination gap', instead: 'BreadcrumbEllipsis / PaginationEllipsis' },
  ],
  anatomy: [
    { part: 'Glyph', description: <><C>KebabIconVertical</C> or <C>KebabIconHorizontal</C>, <C>size</C> sm/md/lg; inherits the text color.</> },
    { part: 'Button', description: <>always inside an icon-only Button that opens the menu.</> },
  ],
  doDont: [
    {
      do: { example: <Button appearance="ghost" tone="secondary" size="md" iconOnly leftIcon={<KebabIconVertical />} aria-label="More actions for seashell.shop" />, caption: 'Inside a real button, named for what it’s about.' },
      dont: { example: <span className="text-[var(--color-icon-icon-subtle)]"><KebabIconHorizontal /></span>, caption: 'A bare icon isn’t a control — no focus, no name, no keyboard.' },
    },
  ],
  a11y: [
    'The icon is decorative; the button carries the name: “More actions for seashell.shop”.',
    'The menu it opens is a DropdownMenu, so arrow keys and Escape work.',
  ],
};
