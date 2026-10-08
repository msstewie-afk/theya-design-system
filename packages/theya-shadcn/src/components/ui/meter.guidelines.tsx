import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Meter } from './meter';
import { Progress } from './progress';

export const meterGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['How full something is within a known range: disk, memory, a quota, seats used.', <>A score or level, also as segments (<C>segments</C>).</>],
  whenNotToUse: [
    { text: 'How far along a running task is', instead: 'Progress' },
    { text: 'A total split into parts', instead: 'UsageBar' },
    { text: 'A value people set', instead: 'Slider' },
  ],
  anatomy: [
    { part: 'Label', description: 'what is measured.' },
    { part: 'Value', description: <>formatted with <C>format</C> (percent, GB…); hide with <C>showValue={'{false}'}</C> only if the label says it.</>, optional: true },
    { part: 'Bar', description: <>fill by <C>value</C> between <C>min</C> and <C>max</C>; <C>tone</C> from how critical the level is.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex w-72 flex-col gap-3">
            <Meter value={0.38} min={0} max={1} label="CPU" tone="success" format={{ style: 'percent' }} />
            <Meter value={0.96} min={0} max={1} label="Disk" tone="danger" format={{ style: 'percent' }} />
          </div>
        ),
        caption: 'Tone follows the level, and the number says it too.',
      },
      dont: {
        example: (
          <div className="flex w-72 flex-col gap-1">
            <span className="text-body-s">Disk</span>
            <Progress value={96} aria-label="Disk" />
          </div>
        ),
        caption: 'Progress for a fill level reads as “almost done”, not “almost full”.',
      },
    },
  ],
  a11y: [
    <>Native <C>role="meter"</C> with min / max / now. Use <C>getValueLabel</C> for words where they help (“Nearly full”).</>,
    <>Without a visible <C>label</C>, pass <C>aria-label</C>.</>,
    'The tone isn’t the only signal — the value or label must say the level.',
    <>For percent pass a fraction with <C>max={'{1}'}</C>; the component warns about 0.38 of 100.</>,
  ],
};
