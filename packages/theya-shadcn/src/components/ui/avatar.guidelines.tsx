import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Avatar } from './avatar';

const NAME = 'font-body text-body-m text-[var(--color-text-text)]';

export const avatarGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Showing who: a person, a team or an account next to their name — in lists, comments, menus.', <>Photo when there is one, initials otherwise (<C>type</C> image / text / icon).</>],
  whenNotToUse: [
    { text: 'Several people in a small space', instead: 'AvatarGroup' },
    { text: 'Product or file images', instead: 'an image or Attachment' },
  ],
  anatomy: [
    { part: 'Content', description: <>image with <C>alt</C>, initials, or an icon; falls back to initials if the image fails.</> },
    { part: 'Size and shape', description: <><C>size</C> sm/md/lg (32/48/64), circle for people, square for teams and orgs.</> },
    { part: 'Outline', optional: true, description: <><C>outline</C> solid/gradient for emphasis (current user, status).</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex items-center gap-3">
            <Avatar type="text" initials="DS" />
            <span className={NAME}>Dana Stoyanova</span>
          </div>
        ),
        caption: 'Initials beside the full name — the name carries meaning, the avatar helps scanning.',
      },
      dont: {
        example: (
          <div className="flex items-center gap-2">
            <Avatar type="text" initials="DS" />
            <Avatar type="text" initials="DM" />
            <Avatar type="text" initials="DK" />
          </div>
        ),
        caption: 'Initials alone: DS, DM, DK — who is who?',
      },
    },
  ],
  a11y: [
    <>An image avatar needs <C>alt</C> with the person’s name — unless the name is right next to it, then <C>alt=""</C>.</>,
    'Initials are read letter by letter; give the name in visible text nearby.',
  ],
};
