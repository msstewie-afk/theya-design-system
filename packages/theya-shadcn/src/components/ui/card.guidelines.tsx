import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Badge } from './badge';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

export const cardGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A self-contained unit people scan and compare: an item in a grid, the summary of one object, a settings section.', <>A whole-card link or filter via <C>action</C>.</>],
  whenNotToUse: [
    { text: 'Only to draw a border around a page section — use space and a heading' },
    { text: 'A message about the page', instead: 'Alert' },
    { text: 'Inside another card — use a divider or a list instead of nesting' },
  ],
  anatomy: [
    { part: 'Container', description: <><C>size</C> (padding) and <C>tone</C> (tinted border for a status).</> },
    { part: 'Header', optional: true, description: <><C>CardTitle</C>, <C>CardDescription</C>, <C>CardAction</C> on the right.</> },
    { part: 'Content', description: 'the body.' },
    { part: 'Footer', optional: true, description: <>actions — <C>md</C> buttons.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <Card action={{ type: 'link', href: '#golden-hour', ariaLabel: 'Golden hour' }} className="w-64">
            <CardHeader divider={false}>
              <CardTitle>Golden hour</CardTitle>
              <CardDescription>Shared · 48 photos</CardDescription>
            </CardHeader>
          </Card>
        ),
        caption: <>The whole card is the link (<C>action</C>) — one target, the biggest one.</>,
      },
      dont: {
        example: (
          <Card className="w-64">
            <CardHeader divider={false}>
              <CardTitle>Golden hour</CardTitle>
              <CardDescription>Shared · 48 photos</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button appearance="outlined" tone="secondary" size="md">View</Button>
            </CardContent>
          </Card>
        ),
        caption: 'A “View” button as the only way in makes people aim for a small target inside a big one.',
      },
    },
    {
      do: {
        example: (
          <Card className="w-64">
            <CardHeader divider={false}>
              <CardTitle>Archive</CardTitle>
              <CardDescription>Last run 2 hours ago</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2 pt-0">
              <Button size="md">Run now</Button>
            </CardContent>
          </Card>
        ),
        caption: <>Buttons inside cards are <C>md</C>.</>,
      },
      dont: {
        example: (
          <Card className="w-64">
            <CardHeader divider={false}>
              <CardTitle>Archive</CardTitle>
              <CardDescription>Last run 2 hours ago</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2 pt-0">
              <Button>Run now</Button>
              <Badge tone="success">OK</Badge>
            </CardContent>
          </Card>
        ),
        caption: 'Page-size buttons overpower the card they sit in.',
      },
    },
  ],
  a11y: [
    <>With <C>action</C>, give an <C>ariaLabel</C> that matches the card’s title — that’s the link’s name.</>,
    'Interactive children (checkbox, menu) sit above the stretched link and stay usable.',
    <>A toned card (<C>tone</C> other than <C>neutral</C>) states its status in text too; the tint alone isn’t enough.</>,
    <><C>effect</C> (tilt, spotlight, lift) reacts to the mouse only and is decoration: touch and keyboard users get the plain card, and prefers-reduced-motion turns tilt and lift off. Use it on showcase cards, not in dense product lists.</>,
  ],
};
