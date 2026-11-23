import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Pause, Play } from 'iconoir-react';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { ArcStage } from './arc-stage';
import { arcStageGuidelines } from './arc-stage.guidelines';

const meta: Meta<typeof ArcStage> = {
  title: 'Patterns: Landing/ArcStage',
  component: ArcStage,
  tags: ['autodocs'],
  parameters: { guidelines: arcStageGuidelines, layout: 'padded' },
  argTypes: { items: { control: false } },
};
export default meta;
type Story = StoryObj<typeof ArcStage>;

/** A drawn plate standing in for a cut-out photo: a white plate with a rim, food in the stage's colors. */
function Plate({ name, food }: { name: string; food: string[] }) {
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={name} className="size-full drop-shadow-[0_8px_12px_rgb(120_40_0_/_0.35)]">
      <circle cx="100" cy="100" r="96" fill="#ffffff" />
      <circle cx="100" cy="100" r="86" fill="none" stroke="#d9b36a" strokeWidth="2" />
      <circle cx="100" cy="100" r="64" fill="#f6f1ea" />
      {food.map((c, i) => (
        <ellipse key={i} cx={78 + (i % 2) * 40} cy={80 + Math.floor(i / 2) * 36} rx="26" ry="20" fill={c} transform={`rotate(${i * 35} 100 100)`} />
      ))}
    </svg>
  );
}

const STAGES = [
  { id: 'gentle', label: 'Gentle', note: 'Weeks 1–2: soft, low-fibre food in small portions.', plate: <Plate name="Oat porridge with banana" food={['#f3dcb2', '#f7e7a1']} /> },
  { id: 'expanding', label: 'Expanding', note: 'Weeks 3–6: new foods one at a time.', plate: <Plate name="White fish with mashed potato" food={['#f4efe4', '#efd9a6', '#cfe3b5']} /> },
  { id: 'normal', label: 'Back to normal', note: 'From week 7: everyday meals, fibre back step by step.', plate: <Plate name="Salmon, rice and greens" food={['#f29a76', '#f6f1e6', '#8fbf6a', '#b9d98f']} /> },
];

/**
 * The PlateCovery setup: stage chips drive the plate, the plate moves on
 * by itself every 7 s, and one round button pauses it. Each plate comes in
 * past the top, turns 120° as it travels and rests at −60°.
 */
export const WithStageChips: Story = {
  args: { label: 'Dishes by stage', autoplay: 7000 },
  render: function Render(args) {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    return (
      <div className="mx-auto flex max-w-[28rem] flex-col gap-4">
        <ArcStage {...args} items={STAGES.map((s) => s.plate)} index={index} onIndexChange={setIndex} paused={paused} />
        {/* Tabs need panels: each stage's panel is its one-line note. */}
        <Tabs value={STAGES[index].id} onValueChange={(v) => setIndex(STAGES.findIndex((s) => s.id === v))} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <TabsList variant="chips" aria-label="Stage" className="min-w-0 flex-1">
              {STAGES.map((s) => (
                <TabsTrigger key={s.id} value={s.id}>
                  {s.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <Button appearance="tonal" iconOnly aria-label="Pause the dishes" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
              {paused ? <Play aria-hidden /> : <Pause aria-hidden />}
            </Button>
          </div>
          {STAGES.map((s) => (
            <TabsContent key={s.id} value={s.id} className="m-0 font-body text-body-m text-[var(--color-text-text-subtle)]">
              {s.note}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('img', { name: 'Oat porridge with banana' })).toBeVisible();
    await userEvent.click(c.getByRole('tab', { name: 'Back to normal' }));
    // Only the shown plate is exposed.
    await waitFor(() => expect(c.getByRole('img', { name: 'Salmon, rice and greens' })).toBeInTheDocument());
    await expect(c.queryByRole('img', { name: 'Oat porridge with banana' })).toBeNull();
  },
};

/** The arc around the bottom start corner (a hero with its picture on the left). */
export const BottomStart: Story = {
  args: { label: 'Dishes by stage', corner: 'bottom-start', items: STAGES.map((s) => s.plate), defaultIndex: 1 },
};
