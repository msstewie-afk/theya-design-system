import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Avatar } from './avatar';
import { AvatarGroup } from './avatar-group';

const people = (names: string[]) => names.map((n) => <Avatar key={n} type="text" initials={n} />);

export const avatarGroupGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Showing that several people are involved — collaborators, assignees, viewers — when the exact list is secondary.'],
  whenNotToUse: [
    { text: 'When people need to know exactly who', instead: 'a list with names' },
    { text: 'One person', instead: 'Avatar' },
  ],
  anatomy: [
    { part: 'Stack', description: <>overlapping avatars; <C>size</C> forced on every child.</> },
    { part: 'Overflow', optional: true, description: <><C>max</C> collapses the rest into “+N”.</> },
  ],
  doDont: [
    {
      do: {
        example: <AvatarGroup max={4} aria-label="7 collaborators">{people(['DS', 'MK', 'IP', 'TR', 'AL', 'GB', 'NV'])}</AvatarGroup>,
        caption: 'Four faces and “+3”: the size of the team at a glance.',
      },
      dont: {
        example: <AvatarGroup aria-label="7 collaborators">{people(['DS', 'MK', 'IP', 'TR', 'AL', 'GB', 'NV'])}</AvatarGroup>,
        caption: 'Every avatar, no max: the stack grows with the team and stops being scannable.',
      },
    },
  ],
  a11y: [
    <>Name the group with <C>aria-label</C>, including the count (“7 collaborators”).</>,
    'The “+N” is a count, not a button — if people can see the rest, add a real button or a popover.',
  ],
};
