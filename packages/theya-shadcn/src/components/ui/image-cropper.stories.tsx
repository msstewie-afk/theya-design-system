import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { useEffect, useState } from 'react';
import { ImageCropper, getCroppedImage, type CropState } from './image-cropper';
import { Button } from './button';
import { Card } from './card';
import { imageCropperGuidelines } from './image-cropper.guidelines';

/**
 * ImageCropper — a fixed crop frame (by `aspect`, optionally round) with the
 * image moving under it. Drag / arrows pan, wheel / pinch / slider / +− zoom,
 * the rotate button turns by 90°. `getCroppedImage()` turns the reported crop
 * into a Blob for upload.
 */

const PHOTO = '/asset-examples/login-carousel-02.jpg';
const WIDE = '/asset-examples/nova-web.jpg';

const meta = {
  title: 'Files/ImageCropper',
  component: ImageCropper,
  tags: ['autodocs'],
  parameters: { guidelines: imageCropperGuidelines, layout: 'padded' },
  argTypes: {
    src: { control: 'text', description: 'Image URL (same-origin or CORS-enabled to export).' },
    aspect: { control: { type: 'number', step: 0.1 }, description: 'Width / height of the crop frame.' },
    shape: { control: 'inline-radio', options: ['rect', 'circle'], description: 'circle masks the frame round.' },
    minZoom: { control: 'number' },
    maxZoom: { control: 'number' },
    defaultZoom: { control: 'number' },
    controls: { control: 'boolean', description: 'Zoom slider and rotate button under the image.' },
    rotatable: { control: 'boolean', description: 'Shows the rotate button.' },
    grid: { control: 'inline-radio', options: ['always', 'interaction', 'never'], description: 'Rule-of-thirds lines.' },
    label: { control: 'text', description: 'Accessible name of the crop area.' },
    onCropChange: { control: false },
    className: { control: false },
  },
  args: { src: PHOTO },
  decorators: [
    (Story) => (
      <div className="w-[520px] max-w-[92vw]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ImageCropper>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Avatar: square output behind a round mask. */
export const Avatar: Story = {
  args: { shape: 'circle', label: 'Crop profile photo' },
};

/** Cover image, 16:9. */
export const Cover: Story = {
  args: { src: WIDE, aspect: 16 / 9, label: 'Crop cover image' },
};

/** Product photo, 4:3, grid always visible. */
export const Product: Story = {
  args: { aspect: 4 / 3, grid: 'always', label: 'Crop product photo' },
};

/** Without the controls row — wheel, pinch and keyboard only. */
export const Bare: Story = {
  args: { controls: false, label: 'Crop image' },
};

/** Full flow: crop, then export with getCroppedImage() and show the result. */
export const ExportFlow: Story = {
  name: 'Export flow',
  render: (args) => {
    const [crop, setCrop] = useState<CropState | null>(null);
    const [result, setResult] = useState<string | null>(null);
    useEffect(() => () => void (result && URL.revokeObjectURL(result)), [result]);
    return (
      <Card className="flex flex-col gap-4 p-4">
        <ImageCropper {...args} shape="circle" label="Crop profile photo" onCropChange={setCrop} />
        <div className="flex items-center gap-4">
          <Button
            disabled={!crop}
            onClick={async () => {
              if (!crop) return;
              const blob = await getCroppedImage(args.src, crop, { width: 256, type: 'image/jpeg' });
              setResult(URL.createObjectURL(blob));
            }}
          >
            Save photo
          </Button>
          {crop && (
            <span className="font-code text-body-s text-[var(--color-text-text-subtle)]">
              {crop.area.width}×{crop.area.height} at {crop.area.x},{crop.area.y} · {Math.round(crop.zoom * 100)}% · {crop.rotation}°
            </span>
          )}
          {result && <img src={result} alt="Cropped profile photo" className="ms-auto size-16 rounded-full" />}
        </div>
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const info = () => canvasElement.querySelector('.font-code')?.textContent ?? '';
    await waitFor(() => expect(info()).toMatch(/· 100% · 0°$/), { timeout: 3000 });
    const area = canvas.getByRole('group', { name: 'Crop profile photo' });
    // + zooms (10%), the slider follows; arrows pan the crop.
    area.focus();
    await userEvent.keyboard('+');
    await waitFor(() => expect(info()).toMatch(/· 110% ·/));
    await expect(canvas.getByRole('slider', { name: 'Zoom' })).toHaveAttribute('aria-valuetext', '110%');
    const at = info().match(/at (\d+),(\d+)/)!;
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(info().match(/at (\d+),/)![1]).not.toBe(at[1]));
    // Rotate, then export a real image.
    await userEvent.click(canvas.getByRole('button', { name: 'Rotate 90 degrees' }));
    await waitFor(() => expect(info()).toMatch(/· 90°$/));
    await userEvent.click(canvas.getByRole('button', { name: 'Save photo' }));
    const img = (await canvas.findByRole('img', { name: 'Cropped profile photo' }, { timeout: 3000 })) as HTMLImageElement;
    await waitFor(() => expect(img.naturalWidth).toBe(256));
  },
};
