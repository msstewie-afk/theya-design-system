import { type ComponentGuidelines } from '../../docs/guidelines';
import { TruncatedText } from './truncated-text';

const ROW = 'flex w-56 flex-col gap-0.5 rounded-[var(--size-border-radius-border-radius-md)] border border-solid border-[var(--color-border-border-subtle)] px-3 py-2 font-body text-body-m';

export const truncatedTextGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'Long user data on one line where wrapping would break the layout: file names, domains, list-row descriptions, a chosen value in a trigger.',
    'Your own cells and rows in a table or list that truncate.',
  ],
  whenNotToUse: [
    { text: 'Short interface labels: column headers, nav and tab labels, buttons, field labels', instead: 'let them wrap' },
    { text: 'Running text and descriptions the reader needs in full', instead: 'plain wrapping text' },
  ],
  anatomy: [
    { part: 'Text', description: 'one line, ellipsis when it doesn’t fit.' },
    { part: 'Tooltip', description: 'the whole text; appears only while the text is cut, on hover and on keyboard focus.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className={ROW}>
            <TruncatedText className="font-medium">golden-hour-ceremony-selects-final-v3.jpg</TruncatedText>
            <span className="text-body-s text-[var(--color-text-text-subtler)]">4.2 MB</span>
          </div>
        ),
        caption: 'A long file name: cut on one line, the whole name in the tooltip.',
      },
      dont: {
        example: (
          <div className={ROW}>
            <TruncatedText className="font-medium">Download license</TruncatedText>
          </div>
        ),
        caption: 'A label the interface owns. Make it wrap; at 200% text a cut label is lost content.',
      },
    },
  ],
  a11y: [
    'WCAG 1.4.4 / 1.4.12: with text at 200% or wider spacing, cut text must stay reachable. The tooltip shows it to sighted users; screen readers read the whole text from the DOM.',
    'The tooltip opens on keyboard focus of the control around the text (a row link, a trigger). Cut text with nothing focusable around it becomes a tab stop.',
    'The tooltip is visual only (aria-hidden), so the text isn’t read twice.',
  ],
};
