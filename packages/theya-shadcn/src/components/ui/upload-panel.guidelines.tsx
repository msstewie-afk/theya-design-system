import { C, type ComponentGuidelines } from '../../docs/guidelines';

export const uploadPanelGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'Several files uploading in the background while people keep working: a media library, a drive, a bulk import.',
    'Uploads that take long enough to pause, cancel or retry one by one.',
  ],
  whenNotToUse: [
    { text: 'One file in a form', instead: 'File with upload and progress' },
    { text: 'Short feedback that goes away by itself', instead: 'Toaster' },
    { text: 'Choosing files to upload', instead: 'Dropzone' },
  ],
  anatomy: [
    { part: 'Summary', description: '“Uploading 3 files”, then “62% · 4 seconds left”; pause all / resume all, cancel all, show or hide the files.' },
    { part: 'Batch bar', description: 'along the bottom edge while collapsed; grey when everything is paused.' },
    { part: 'Files', description: 'name, “66% · 4 seconds left” or the error, its own bar; pause / resume, retry, cancel.', optional: true },
    { part: 'Done', description: '“Uploaded 3 files” with a check (or how many failed) and a close button.' },
  ],
  doDont: [],
  a11y: [
    'A named region (“Uploads”), not a toast: it never takes focus and stays until it is closed.',
    'A polite live region says when the batch starts, pauses, finishes and when a file fails — never each percent or second.',
    <>Every bar is a progressbar named by its file (or the batch) with the same text as a value (<C>aria-valuetext</C>).</>,
    <>The show / hide button carries <C>aria-expanded</C>; Escape inside the panel collapses it and leaves focus on that button.</>,
    'Every icon button is named with the file: “Pause Nature.mp4”, “Retry assets.zip”.',
  ],
};
