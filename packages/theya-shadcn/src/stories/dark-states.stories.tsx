import type { Meta, StoryObj } from '@storybook/react';
import { buttonVariants } from '../components/ui/button';

/*
 * Review page for the dark-theme state model of Button (Maria, 2026-11-03).
 * In light, every appearance darkens on hover and darkens more on press. In
 * dark, filled darkens but tonal / outlined / ghost lighten on both, so a
 * pressed tonal or ghost button never looks pressed in.
 *
 * "Current" reads the real classes from buttonVariants, so it shows exactly
 * what Button does today. "Proposal" keeps each rest color and adds a state
 * layer on top: white for hover (lighter than rest), black for pressed
 * (darker than rest), the same for every appearance and tone.
 */

const APPEARANCES = ['filled', 'tonal', 'outlined', 'ghost'] as const;
const TONES = ['primary', 'secondary', 'neutral', 'success', 'warning', 'danger', 'info'] as const;
type Appearance = (typeof APPEARANCES)[number];
type Tone = (typeof TONES)[number];
type State = 'rest' | 'hover' | 'pressed';

/** Pulls the rest / hover / pressed background, text and border tokens out of Button's classes. */
function tokens(appearance: Appearance, tone: Tone) {
  const cls = buttonVariants({ appearance, tone }).split(/\s+/);
  const find = (re: RegExp) => {
    for (const c of cls) {
      const m = c.match(re);
      if (m) return `var(${m[1]})`;
    }
    return undefined;
  };
  return {
    rest: find(/^bg-\[var\((--[\w-]+)\)\]$/),
    hover: find(/^hover:.*bg-\[var\((--[\w-]+)\)\]$/),
    pressed: find(/^active:.*bg-\[var\((--[\w-]+)\)\]$/),
    // Dark override first: tonal primary switches to white text in dark.
    text: find(/^\[\[data-theme=dark\]_&\]:text-\[var\((--[\w-]+)\)\]$/) ?? find(/^text-\[var\((--color-text[\w-]+)\)\]$/),
    border: appearance === 'outlined' ? find(/^border-\[var\((--color-border[\w-]+)\)\]$/) : undefined,
  };
}

function background(appearance: Appearance, tone: Tone, state: State, model: 'current' | 'proposal', lighten: number, darken: number, keepTone: boolean) {
  const t = tokens(appearance, tone);
  if (model === 'current') return { backgroundColor: state === 'rest' ? t.rest : state === 'hover' ? t.hover : t.pressed };
  const layer = (c: string) => `linear-gradient(${c}, ${c})`;
  const white = layer(`rgb(255 255 255 / ${lighten}%)`);
  const black = layer(`rgb(0 0 0 / ${darken}%)`);
  // Outlined and ghost have no fill at rest. With keepTone their hover keeps
  // today's tinted fill (already lighter than rest) and press darkens that
  // tint, so the tone stays visible; without it both use the neutral layers.
  const tinted = keepTone && (appearance === 'outlined' || appearance === 'ghost');
  if (state === 'rest') return { backgroundColor: t.rest };
  if (state === 'hover') return tinted ? { backgroundColor: t.hover } : { backgroundColor: t.rest, backgroundImage: white };
  return tinted ? { backgroundColor: t.hover, backgroundImage: black } : { backgroundColor: t.rest, backgroundImage: black };
}

function Tile({ appearance, tone, state, model, lighten, darken, keepTone }: { appearance: Appearance; tone: Tone; state: State; model: 'current' | 'proposal'; lighten: number; darken: number; keepTone: boolean }) {
  const t = tokens(appearance, tone);
  return (
    <span
      className="inline-flex h-8 w-[88px] items-center justify-center rounded-[var(--size-border-radius-border-radius-xl)] border border-solid font-body text-body-s font-medium"
      style={{ ...background(appearance, tone, state, model, lighten, darken, keepTone), color: t.text, borderColor: t.border ?? 'transparent' }}
    >
      {state}
    </span>
  );
}

function Model({ model, lighten, darken, keepTone }: { model: 'current' | 'proposal'; lighten: number; darken: number; keepTone: boolean }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="m-0 font-heading text-heading-xs text-[var(--color-text-text)]">
        {model === 'current' ? 'Current' : `Proposal: hover +${lighten}% white, pressed +${darken}% black${keepTone ? ', outlined / ghost keep the tone' : ''}`}
      </h2>
      {APPEARANCES.map((appearance) => (
        <div key={appearance} className="flex flex-col gap-2">
          <h3 className="m-0 font-body text-body-s font-medium text-[var(--color-text-text-subtle)]">{appearance}</h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(296px,1fr))] gap-x-6 gap-y-2">
            {TONES.map((tone) => (
              <div key={tone} className="flex items-center gap-2">
                <span className="w-16 font-body text-body-xs text-[var(--color-text-text-subtler)]">{tone}</span>
                {(['rest', 'hover', 'pressed'] as const).map((state) => (
                  <Tile key={state} appearance={appearance} tone={tone} state={state} model={model} lighten={lighten} darken={darken} keepTone={keepTone} />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

type Args = { lighten: number; darken: number; keepTone: boolean };

const meta: Meta<Args> = {
  title: 'Design System/Dark states',
  parameters: { layout: 'fullscreen', controls: { expanded: true } },
  args: { lighten: 8, darken: 16, keepTone: true },
  argTypes: {
    lighten: { control: { type: 'range', min: 0, max: 30, step: 2 }, description: 'Proposal: white layer on hover, % opacity.' },
    darken: { control: { type: 'range', min: 0, max: 40, step: 2 }, description: 'Proposal: black layer on press, % opacity.' },
    keepTone: { control: 'boolean', description: 'Proposal: outlined / ghost keep their tone tint on hover and press (off: neutral white / black layers).' },
  },
};

export default meta;
type Story = StoryObj<Args>;

/** Dark theme only, whatever the toolbar says: the current classes next to one state-layer rule for every appearance. */
export const Compare: Story = {
  render: ({ lighten, darken, keepTone }) => (
    <div data-theme="dark" className="min-h-screen bg-[var(--color-bg-surface-bg-surface)] p-6 md:p-10">
      <div className="grid gap-10 xl:grid-cols-2">
        <Model model="current" lighten={lighten} darken={darken} keepTone={keepTone} />
        <Model model="proposal" lighten={lighten} darken={darken} keepTone={keepTone} />
      </div>
    </div>
  ),
};
