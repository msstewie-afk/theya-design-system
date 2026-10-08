import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Dropzone } from './dropzone';
import { File } from './file';

export const fileGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['One file in a form: a logo, a certificate, a document to attach.', 'Showing the current file and letting people replace it.'],
  whenNotToUse: [
    { text: 'Several files at once, or drag and drop is the main way in', instead: 'Dropzone' },
    { text: 'Just displaying an attached file', instead: 'Attachment' },
    { text: 'An image that needs framing', instead: 'File + ImageCropper' },
  ],
  anatomy: [
    { part: 'Empty tile', description: <>dashed, with <C>pickLabel</C> and <C>pickHint</C> (formats, size).</> },
    { part: 'Filled slot', description: <>the file as an Attachment; clicking replaces it (<C>replaceLabel</C> on hover/focus).</> },
    { part: 'Native input', description: <>the file lives in a real input, so a plain form submits it (<C>inputProps.name</C>).</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="w-56">
            <File empty pickLabel="Add logo" pickHint="SVG or PNG, up to 2 MB" inputProps={{ name: 'gl-logo', accept: 'image/svg+xml,image/png' }} />
          </div>
        ),
        caption: 'One file, one compact slot that says what it accepts.',
      },
      dont: {
        example: (
          <div className="w-80">
            <Dropzone aria-label="Upload logo" multiple={false} hint="SVG or PNG, up to 2 MB" onFiles={() => {}} />
          </div>
        ),
        caption: 'A full dropzone for a single logo takes the space of the whole form.',
      },
    },
  ],
  a11y: [
    'The empty tile is a button named by pickLabel + pickHint; the filled slot is named by the file name.',
    'After picking, focus moves to the file; after removing, back to the tile.',
    <>Always say the limits in <C>pickHint</C> — the native picker won’t.</>,
  ],
};
