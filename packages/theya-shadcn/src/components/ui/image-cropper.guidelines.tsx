import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { ImageCropper } from './image-cropper';

export const imageCropperGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['Framing an uploaded image before saving: avatar, logo, cover, product photo.', <>The output has a fixed shape (<C>aspect</C>, <C>shape="circle"</C>).</>],
  whenNotToUse: [
    { text: 'Images shown at their own proportions', instead: 'upload as is (File)' },
    { text: 'Editing: filters, drawing, annotations', instead: 'a dedicated editor' },
  ],
  anatomy: [
    { part: 'Frame', description: 'fixed and centered; the image moves under it and always covers it.' },
    { part: 'Grid', optional: true, description: <><C>grid</C>: always, while interacting, or never.</> },
    { part: 'Controls', optional: true, description: <>zoom slider and rotate (<C>controls</C>, <C>rotatable</C>).</> },
    { part: 'Output', description: <><C>onCropChange</C> + <C>getCroppedImage()</C> → a Blob to upload.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="w-80">
            <ImageCropper src="/asset-examples/panda-avatar.png" aspect={16 / 9} label="Crop cover image" />
          </div>
        ),
        caption: 'A square photo for a 16:9 cover: people choose which part goes in the frame.',
      },
      dont: {
        example: (
          <div className="w-80">
            <img
              src="/asset-examples/panda-avatar.png"
              alt="Cover image, a square photo stretched to 16:9"
              className="aspect-video w-full rounded-[var(--size-border-radius-border-radius-lg)] object-fill"
            />
          </div>
        ),
        caption: 'Saved as uploaded and stretched to the cover’s shape.',
      },
    },
  ],
  a11y: [
    <>Name it with <C>label</C>; the frame is focusable — arrows pan, + / − zoom.</>,
    'The zoom slider and rotate button are real controls with names, for people who can’t drag or pinch.',
    'Give the result a meaningful alt where it’s shown.',
  ],
};
