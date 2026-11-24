import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const imageGroundGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'A picture as the ground of a section: SectionPanel `image` + `imageGround`, or Hero `backdrop={<ImageGround … />}`.',
    'The text on the picture does not pass contrast: tint it in the theme — `deep` (primary with black, tone in tone) with SectionPanel `contentTheme="dark"` for white text, `surface` under the regular text — before reaching for another picture.',
    "`opacity` below 100 lets the panel's fill show through: a light veil on the default tone, a darker one on inverse.",
    '`flip` mirrors the picture: one abstract background gives four compositions. Set `mirrorInRtl` when the calm side of the picture should follow the text side.',
  ],
  whenNotToUse: [
    { text: 'A picture with meaning (a product, a person someone should recognise)', instead: 'an img with alt text, e.g. Hero media or ProductCollage' },
    { text: 'Mirroring photos of people, text or products', instead: 'leave flip off: a mirrored face or label reads as wrong' },
    { text: 'The theme gradient', instead: 'SectionPanel tone="gradient" without image' },
  ],
  anatomy: [
    {
      part: 'Picture',
      description:
        '`size` cover (crops) or contain (the whole object on the fill), `position` (CSS background-position), `opacity` 0–100, `flip` x / y / both.',
    },
    {
      part: 'Field',
      description:
        'with `size="contain"` and `fill="edge"`: the picture at the ground\'s height (`objectSize` %), its outer column of pixels drawn out to the free side, the edge facing it faded. For an object shot on a plain field; push it past the edge with `position` (e.g. `right -15cqw center`) to clear the text. Pictures from the same site only.',
    },
    {
      part: 'Tint',
      description:
        'a layer of a theme color over the picture: primary, deep, surface or scrim, `tintOpacity` 0–90 in steps of 10, the scale of the alpha primitives (default 40).',
    },
  ],
  doDont: [],
  a11y: [
    'Decoration only: hidden from screen readers and from the pointer, behind the content.',
    'The contrast scan cannot read pixels and skips text over a picture: check the text on the final ground by eye or on a screenshot, in light and dark, at the narrowest width too.',
    'Tint colors come from the theme, so they change with the brand and the mode: check each theme you ship.',
  ],
};
