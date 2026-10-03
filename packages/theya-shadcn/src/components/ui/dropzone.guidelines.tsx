import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Dropzone } from './dropzone';

export const dropzoneGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Uploading one or several files where dragging from the desktop is common: documents, media, imports.', <>Showing what’s staged (<C>files</C>), uploading (<C>loading</C>) and done (<C>successFile</C>) in one place.</>],
  whenNotToUse: [
    { text: 'A single file in a form', instead: 'File' },
    { text: 'Showing already attached files', instead: 'Attachment' },
  ],
  anatomy: [
    { part: 'Drop area', description: 'also a button — click or Enter opens the picker.' },
    { part: 'Hint', description: <><C>hint</C> — accepted formats and size limit.</> },
    { part: 'Staged list', optional: true, description: <><C>files</C> with <C>onRemove</C>; per-file errors.</> },
    { part: 'States', description: <><C>error</C>, <C>loading</C>, <C>successFile</C>, <C>disabled</C>.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="w-80">
            <Dropzone aria-label="Upload documents" hint="PDF or DOCX, up to 25 MB each" accept=".pdf,.docx" onFiles={() => {}} />
          </div>
        ),
        caption: 'Formats and size limit up front; the accept filter matches the hint.',
      },
      dont: {
        example: (
          <div className="w-80">
            <Dropzone aria-label="Upload documents" onFiles={() => {}} />
          </div>
        ),
        caption: 'No limits shown — people find them out from a failed upload.',
      },
    },
  ],
  a11y: [
    <>Name it with <C>aria-label</C> (“Upload documents”); it’s a button, so keyboard users never need to drag.</>,
    'Errors are announced and stay visible next to the area; per-file errors sit on the file.',
    <>Rejected files go to <C>onReject</C> — tell people which ones and why.</>,
  ],
};
