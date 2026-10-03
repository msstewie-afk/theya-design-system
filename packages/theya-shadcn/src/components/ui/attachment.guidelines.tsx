import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Attachment } from './attachment';

export const attachmentGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Showing a file that’s already attached: in a message, a ticket, a list of uploads.', <>Staged files before sending, with <C>onRemove</C>; failed ones with <C>error</C>.</>],
  whenNotToUse: [
    { text: 'Picking or replacing a file', instead: 'File' },
    { text: 'Uploading several files by drag and drop', instead: 'Dropzone' },
  ],
  anatomy: [
    { part: 'Kind icon or preview', description: <>from <C>type</C> (MIME), or <C>previewUrl</C> for images.</> },
    { part: 'Name', description: 'truncated in the middle so the extension stays visible.' },
    { part: 'Meta', optional: true, description: <>size and kind, or <C>metaText</C>; replaced by <C>error</C>.</> },
    { part: 'Remove / actions', optional: true, description: <><C>onRemove</C>, <C>actions</C>.</> },
    { part: 'Variant', description: <><C>pill</C> inline, <C>line</C> in text, <C>row</C> in lists, <C>card</C> in grids.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex w-80 flex-col gap-2">
            <Attachment variant="row" name="quarterly-report.pdf" type="application/pdf" size={248000} onRemove={() => {}} />
            <Attachment variant="row" name="backup.tar.gz" size={5300000000} error="Exceeds the 2 GB upload limit" onRemove={() => {}} />
          </div>
        ),
        caption: 'Name, kind and size for each file; the failed one says why, in place.',
      },
      dont: {
        example: (
          <div className="flex w-80 flex-col gap-2 font-body text-body-m">
            <a href="#gl-att" className="text-[var(--color-text-text-link)] underline">Download attachment</a>
            <span className="text-[var(--color-text-text-danger)]">Upload failed</span>
          </div>
        ),
        caption: 'A bare link and a generic error: which file, how big, and what went wrong?',
      },
    },
  ],
  a11y: [
    'The name is the accessible name; size and kind are read as its description.',
    <>Remove buttons are named per file (“Remove quarterly-report.pdf”); localize with <C>removeLabel</C>.</>,
    'An error is part of the description, not only red text.',
  ],
};
