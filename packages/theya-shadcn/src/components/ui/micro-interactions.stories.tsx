import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Bell, Bookmark, BookmarkSolid, Cart, Check, Copy, EditPencil, Heart, HeartSolid, Microphone, Page, Plus, Search, ShareAndroid, Sparks, Trash, Upload } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { Badge } from './badge';
import { BadgeIndicator } from './badge-indicator';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Chip } from './chip';
import { CopyButton } from './copy-button';
import { Countdown } from './countdown';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';
import { Fab, FabSpeedDial } from './fab';
import { HoldToTalk } from './hold-to-talk';
import { Link } from './link';
import { NumberField } from './number-field';
import { Progress } from './progress';
import { Rating } from './rating';
import { Skeleton } from './skeleton';
import { Spinner } from './spinner';
import { StatusDot } from './status-dot';
import { SuccessCheck } from './success-check';
import { Stepper as MiStepper } from './stepper';
import { SurfaceEffect } from './surface-effect';
import { SwatchPicker } from './swatch-picker';
import { Switch } from './switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { TagInput } from './tag-input';
import { TextField } from './text-field';
import { WheelPicker } from './wheel-picker';
import { ChatTyping } from './chat';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';
import { undoToast } from './undo-toast';

/**
 * A review board for micro-interactions on the atomic components: each
 * row puts what the component does today ("Now") next to a candidate
 * ("Variant"). Nothing here changes the components — the variants are
 * prototypes, built on Theya's tokens. A chosen variant later becomes the
 * component's default behaviour, not a prop.
 *
 * Sources (MIT): Kinetics (kinetics.colorion.co) and CSS Loaders
 * (cssloaders.colorion.co) — see THIRD-PARTY-NOTICES.md. The switch squish
 * is a common pattern (seen across uiverse.io); the code is our own.
 *
 * "Preview reduced motion" shows what a user with prefers-reduced-motion
 * gets: transitions and one-off animations are dropped (the end state
 * shows at once); loaders don't freeze — they turn into a slow fade.
 */
const meta = {
  title: 'Motion/Micro-interactions',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/* Keyframes for the prototypes only; they live in the story until a variant is adopted. */
const CSS = `
@keyframes mi-dot { 0%, 60%, 100% { transform: translateY(0); opacity: .4 } 30% { transform: translateY(-4px); opacity: 1 } }
@keyframes mi-pop { 0% { transform: scale(1) } 40% { transform: scale(1.35) } 100% { transform: scale(1) } }
@keyframes mi-ring { 0% { transform: scale(1); opacity: .6 } 100% { transform: scale(2.6); opacity: 0 } }
@keyframes mi-dashring {
  0% { stroke-dasharray: 1 150; stroke-dashoffset: 0 }
  50% { stroke-dasharray: 90 150; stroke-dashoffset: -35 }
  100% { stroke-dasharray: 90 150; stroke-dashoffset: -124 }
}
@keyframes mi-fade12 { 0% { opacity: 1 } 100% { opacity: .12 } }
@keyframes mi-bars { 0%, 100% { transform: scaleY(.3); opacity: .4 } 50% { transform: scaleY(1); opacity: 1 } }
@keyframes mi-seg {
  0%, 15% { background: var(--mi-track) }
  25%, 70% { background: currentColor }
  85%, 100% { background: var(--mi-track) }
}
@keyframes mi-indeterminate { 0% { translate: -100% 0 } 100% { translate: 260% 0 } }
@keyframes mi-sweep { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
@keyframes mi-breathe { 0%, 100% { opacity: 1 } 50% { opacity: .35 } }

.mi-draw { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset var(--motion-duration-slower) var(--ease-glide) }
.mi-draw[data-on] { stroke-dashoffset: 0 }
.mi-draw-late { transition-delay: 300ms }
.mi-cb[data-state=checked] .mi-draw { stroke-dashoffset: 0 }
.mi-cb[data-state=unchecked] .mi-draw { transition-duration: var(--motion-duration-fast) }

@keyframes mi-fly { to { translate: var(--tx) var(--ty); scale: 0; opacity: 0 } }
@keyframes mi-spark { 0% { opacity: 0 } 8% { opacity: 1; translate: 0 0; scale: 1 } 65% { opacity: 1; scale: .8 } 100% { opacity: 0; translate: var(--tx) var(--ty); scale: 0 } }
@keyframes mi-drop { 0% { transform: translateY(-9px) scale(.9) } 55% { transform: translateY(3px) scale(1.14) } 100% { transform: none } }
@keyframes mi-talk { from { transform: scaleY(.18) } to { transform: scaleY(1) } }
@keyframes mi-pop-in { from { scale: .4; opacity: 0 } }
@keyframes mi-chip { 0% { scale: 1 } 40% { scale: 1.12 } 100% { scale: 1 } }
/* The clip sits 24px outside the menu, so the menu's own rounded corners and shadow are
   drawn throughout the wipe instead of appearing at the end. */
@keyframes mi-bloom { from { clip-path: inset(-24px -24px 100% -24px) } to { clip-path: inset(-24px) } }
/* From above: an offset downwards overflowed the menu and flashed its scrollbar. */
@keyframes mi-rise { from { opacity: 0; translate: 0 -6px } }
@keyframes mi-drain { from { transform: scaleX(1) } to { transform: scaleX(0) } }
@keyframes mi-ping { 0% { transform: scale(.4); opacity: .9 } 100% { transform: scale(4.2); opacity: 0 } }
@keyframes mi-ring-strong { 0% { transform: scale(1); opacity: .85 } 100% { transform: scale(3.4); opacity: 0 } }
@keyframes mi-neon {
  0%, 100% { box-shadow: 0 0 6px -1px var(--mi-glow), inset 0 0 6px -2px var(--mi-glow); text-shadow: 0 0 4px var(--mi-glow) }
  50% { box-shadow: 0 0 18px 0 var(--mi-glow), inset 0 0 12px -2px var(--mi-glow); text-shadow: 0 0 12px var(--mi-glow) }
}
@keyframes mi-orb {
  0%, 100% { transform: scale(.9); box-shadow: 0 0 20px 0 color-mix(in oklab, var(--color-bg-primary-bg-primary) 35%, transparent) }
  50% { transform: scale(1.08); box-shadow: 0 0 48px 8px color-mix(in oklab, var(--color-bg-primary-bg-primary) 55%, transparent) }
}
@keyframes mi-bob { 0%, 100% { transform: translateY(0); box-shadow: var(--elevation-sm) } 50% { transform: translateY(-12px); box-shadow: var(--elevation-lg) } }
@keyframes mi-span { 0%, 8% { transform: scaleX(0) } 28%, 72% { transform: scaleX(1) } 88%, 100% { transform: scaleX(0) } }
@keyframes mi-eq { 0%, 100% { transform: scaleY(.25) } 50% { transform: scaleY(1) } }

/* Reduced motion — the real media query and the preview switch (set on <html>, so it also
   reaches menus rendered in a portal; those carry data-mi themselves). Loaders turn into a
   slow fade; a timer bar keeps running, because it tells the time left. */
@media (prefers-reduced-motion: reduce) {
  [data-mi], [data-mi] *, [data-mi] *::before, [data-mi] *::after { animation: none !important; transition: none !important }
  [data-mi] .mi-loader { animation: mi-breathe 2s ease-in-out infinite !important }
  [data-mi] .mi-timer { animation: mi-drain var(--mi-timer, 6s) linear forwards !important }
}
[data-preview-reduced] [data-mi], [data-preview-reduced] [data-mi] *, [data-preview-reduced] [data-mi] *::before, [data-preview-reduced] [data-mi] *::after { animation: none !important; transition: none !important }
[data-preview-reduced] [data-mi] .mi-loader { animation: mi-breathe 2s ease-in-out infinite !important }
[data-preview-reduced] [data-mi] .mi-timer { animation: mi-drain var(--mi-timer, 6s) linear forwards !important }
`;

const LOADING = 'Loading';
const TRACK = 'color-mix(in oklab, currentColor 18%, transparent)';

function Gallery({ intro, children }: { intro: ReactNode; children: ReactNode }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    document.documentElement.toggleAttribute('data-preview-reduced', reduced);
    return () => document.documentElement.removeAttribute('data-preview-reduced');
  }, [reduced]);
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col px-4 py-6 md:px-6">
      <style>{CSS}</style>
      <div className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <p className="max-w-prose text-body-m text-[var(--color-text-text-subtle)]">{intro}</p>
        <Switch label="Preview reduced motion" checked={reduced} onCheckedChange={setReduced} className="shrink-0" />
      </div>
      {children}
    </div>
  );
}

/**
 * `adopted`: the variant is now the component's own behaviour, so the left column shows
 * it live; the right column keeps the original prototype for reference.
 */
function Pair({ title, note, source, now, variant, adopted }: { title: string; note: ReactNode; source: string; now: ReactNode; variant: ReactNode; adopted?: boolean }) {
  return (
    <section className="grid gap-4 border-t border-solid border-[var(--color-border-border-subtler)] py-5 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,1fr)] sm:gap-6 sm:py-6">
      <div className="flex flex-col gap-1">
        <h3 className="font-body text-body-l font-semibold text-[var(--color-text-text)]">{title}</h3>
        <p className="text-body-s text-[var(--color-text-text-subtle)]">{note}</p>
        <p className="text-body-xs text-[var(--color-text-text-subtler)]">{source}</p>
      </div>
      <Cell label={adopted ? 'Now — built in' : 'Now'} done={adopted}>
        {now}
      </Cell>
      <Cell label={adopted ? 'Prototype' : 'Variant'} accent={!adopted}>
        <div data-mi className="contents">
          {variant}
        </div>
      </Cell>
    </section>
  );
}

function Cell({ label, accent, done, children }: { label: string; accent?: boolean; done?: boolean; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className={cn('text-body-xs font-medium uppercase tracking-wide', accent ? 'text-[var(--color-text-text-link)]' : done ? 'text-[var(--color-text-text-success)]' : 'text-[var(--color-text-text-subtler)]')}>{label}</span>
      <div className="flex min-h-20 flex-wrap items-center gap-4 rounded-[var(--size-border-radius-border-radius-xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-4">
        {children}
      </div>
    </div>
  );
}

/** setTimeout that is cleared on unmount. */
function useTimers() {
  const ids = useRef<number[]>([]);
  useEffect(() => () => ids.current.forEach((id) => window.clearTimeout(id)), []);
  return (fn: () => void, ms: number) => {
    ids.current.push(window.setTimeout(fn, ms));
  };
}

function isReduced(el: Element | null) {
  return document.documentElement.hasAttribute('data-preview-reduced') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ───────────────────────── Buttons ───────────────────────── */

function SubmitNow() {
  const [loading, setLoading] = useState(false);
  const later = useTimers();
  return (
    <Button
      loading={loading}
      onClick={() => {
        setLoading(true);
        later(() => setLoading(false), 1400);
      }}
    >
      Save changes
    </Button>
  );
}

function SubmitVariant() {
  const [phase, setPhase] = useState<'idle' | 'busy' | 'done'>('idle');
  const later = useTimers();
  const run = () => {
    if (phase !== 'idle') return;
    setPhase('busy');
    later(() => setPhase('done'), 1400);
    later(() => setPhase('idle'), 2800);
  };
  return (
    <>
      <Button onClick={run}>
        {/* All three states share one grid cell, so the button keeps the label's width. */}
        <span className="grid place-items-center [&>*]:col-start-1 [&>*]:row-start-1">
          <span className={cn('transition-[opacity,translate] duration-moderate ease-enter', phase !== 'idle' && '-translate-y-1 opacity-0')}>Save changes</span>
          <span aria-hidden="true" className={cn('flex gap-1 transition-opacity duration-moderate', phase !== 'busy' && 'opacity-0')}>
            {[0, 1, 2].map((i) => (
              <i key={i} className="mi-loader size-1.5 rounded-full bg-current animate-[mi-dot_900ms_ease-in-out_infinite]" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </span>
          <svg aria-hidden="true" viewBox="0 0 16 16" className={cn('size-4', phase !== 'done' && 'opacity-0')}>
            <path d="M3 8.5l3.2 3L13 4.5" pathLength={1} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mi-draw" data-on={phase === 'done' || undefined} />
          </svg>
        </span>
      </Button>
      <span role="status" className="sr-only">
        {phase === 'busy' ? 'Saving' : phase === 'done' ? 'Saved' : ''}
      </span>
    </>
  );
}

function CopyVariant() {
  const [copied, setCopied] = useState(false);
  const later = useTimers();
  return (
    <>
      <Button
        appearance="tonal"
        tone={copied ? 'success' : 'neutral'}
        leftIcon={
          <span className="relative inline-grid size-4 [&>svg]:col-start-1 [&>svg]:row-start-1 [&>svg]:transition-[opacity,scale] [&>svg]:duration-moderate [&>svg]:ease-spring">
            <Copy className={cn(copied && 'scale-50 opacity-0')} />
            <Check className={cn(!copied && 'scale-50 opacity-0')} />
          </span>
        }
        onClick={() => {
          navigator.clipboard?.writeText('ns1.example.net').catch(() => {});
          setCopied(true);
          later(() => setCopied(false), 1500);
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </Button>
      <span role="status" className="sr-only">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </>
  );
}

export const Buttons: Story = {
  render: () => (
    <Gallery intro="Buttons: what the press tells the user. Click each control in both columns.">
      <Pair
        title="Submit states"
        note="Label → bouncing dots → a drawn check, then back. The button keeps its width; screen readers hear “Saving”, then “Saved”."
        source="Kinetics · Submit States"
        now={<SubmitNow />}
        variant={<SubmitVariant />}
      />
      <Pair
        title="Copy morph" adopted
        note="The copy icon shrinks away as the check springs in, instead of swapping in one frame."
        source="Kinetics · Copy Button"
        now={<CopyButton value="ns1.example.net" appearance="tonal" />}
        variant={<CopyVariant />}
      />
      <Pair title="Like burst" note="The heart pops and throws a ring of eight sparks; unliking is quiet." source="Kinetics · Like Burst" now={<LikeButton />} variant={<LikeButton variant />} />
      <Pair title="Bookmark drop" note="The filled ribbon drops in with a small bounce when saved." source="Kinetics · Bookmark Toggle" now={<BookmarkButton />} variant={<BookmarkButton variant />} />
      <Pair
        title="Status pill"
        adopted
        note="One pill morphs idle → spinning → done: colour, icon and label change in place. Built in as Button `success` (left), next to `loading`."
        source="Kinetics · Status Pill"
        now={<StatusPillNow />}
        variant={<StatusPillVariant />}
      />
      <Pair
        title="Hold to talk"
        adopted
        note="For a prompt field: hold (pointer, Space or Enter) — the waveform blooms while you speak, release sends. Built in as HoldToTalk, for PromptArea's trailing slot."
        source="Kinetics · Hold to Talk"
        now={<HoldToTalk />}
        variant={<TalkVariant />}
      />
    </Gallery>
  ),
};

/* ───────────────────────── Selection ───────────────────────── */

function DrawCheckbox({ id, defaultChecked }: { id: string; defaultChecked?: boolean }) {
  return (
    <CheckboxPrimitive.Root
      id={id}
      defaultChecked={defaultChecked}
      className={cn(
        'mi-cb inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[var(--size-border-radius-border-radius-md)] border border-solid',
        'border-[var(--color-border-border)] bg-[var(--color-bg-input-bg-input)] text-[var(--color-text-text-on-primary)]',
        'transition-[background-color,border-color,scale] duration-standard ease-enter',
        'hover:data-[state=unchecked]:border-[var(--color-border-border-primary)] data-[state=checked]:border-transparent data-[state=checked]:bg-[var(--color-bg-primary-bg-primary)]',
        'active:scale-90 focus-visible:outline-none focus-visible:focus-ring',
      )}
    >
      <CheckboxPrimitive.Indicator forceMount>
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5">
          <path
            d="M3.5 8.5l3 3L12.5 5"
            pathLength={1}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mi-draw"
          />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

function CheckList({ variant }: { variant?: boolean }) {
  const p = variant ? 'v' : 'n';
  const items = ['Daily backups', 'Staging site'];
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div key={item} className="flex items-center gap-2">
          {variant ? <DrawCheckbox id={`${p}-cb-${i}`} defaultChecked={i === 0} /> : <Checkbox id={`${p}-cb-${i}`} defaultChecked={i === 0} />}
          <label htmlFor={`${p}-cb-${i}`} className="text-body-m text-[var(--color-text-text)]">
            {item}
          </label>
        </div>
      ))}
    </div>
  );
}

function GlideTabs() {
  const [value, setValue] = useState('overview');
  const box = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState<{ left: number; width: number } | null>(null);
  useLayoutEffect(() => {
    const tab = box.current?.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
    if (tab) setBar({ left: tab.offsetLeft, width: tab.offsetWidth });
  }, [value]);
  return (
    <div ref={box} className="w-full">
      <Tabs value={value} onValueChange={setValue}>
        <TabsList className="relative [&>[data-slot=tabs-indicator]]:hidden">
          {TABS.map(([v, label]) => (
            <TabsTrigger key={v} value={v} className="data-[state=active]:border-transparent">
              {label}
            </TabsTrigger>
          ))}
          {bar && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-[var(--color-border-border-primary)] transition-[left,width] duration-slow ease-glide"
              style={{ left: bar.left, width: bar.width }}
            />
          )}
        </TabsList>
        {TABS.map(([v, label]) => (
          <TabsContent key={v} value={v} className="pt-3 text-body-s text-[var(--color-text-text-subtle)]">
            {label} panel
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function NowTabs({ chips }: { chips?: boolean }) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList variant={chips ? 'chips' : 'underline'}>
        {TABS.map(([v, label]) => (
          <TabsTrigger key={v} value={v}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map(([v, label]) => (
        <TabsContent key={v} value={v} className="pt-3 text-body-s text-[var(--color-text-text-subtle)]">
          {label} panel
        </TabsContent>
      ))}
    </Tabs>
  );
}

function StarBurstRating() {
  const box = useRef<HTMLDivElement>(null);
  const [burst, setBurst] = useState<{ id: number; x: number; y: number; delay: number } | null>(null);
  return (
    <div ref={box} className="relative inline-flex">
      <Rating
        defaultValue={3}
        aria-label="Rate support (variant)"
        onValueChange={(v) => {
          const stars = box.current?.querySelectorAll<HTMLElement>('[role="radio"]');
          if (!stars || v === 0 || isReduced(box.current)) return;
          stars.forEach((star, i) => {
            if (i >= v) return;
            star.animate(
              [
                { transform: 'scale(.55) rotate(-25deg)', opacity: 0.5 },
                { transform: 'scale(1.25) rotate(6deg)', opacity: 1, offset: 0.6 },
                { transform: 'none', opacity: 1 },
              ],
              { duration: 420, delay: i * 70, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'backwards' },
            );
          });
          const picked = stars[v - 1];
          setBurst({ id: Date.now(), x: picked.offsetLeft + picked.offsetWidth / 2, y: picked.offsetTop + picked.offsetHeight / 2, delay: (v - 1) * 70 + 220 });
        }}
      />
      {burst && (
        <span key={burst.id} aria-hidden="true" className="pointer-events-none absolute size-0" style={{ left: burst.x, top: burst.y, '--d': `${burst.delay}ms` } as CSSProperties}>
          {Array.from({ length: 8 }, (_, i) => {
            const a = (Math.PI * 2 * i) / 8;
            return (
              <i
                key={i}
                className="absolute -ms-[3px] -mt-[3px] size-1.5 rounded-full bg-[var(--color-icon-icon-rating)] opacity-0 animate-[mi-spark_700ms_ease-out_var(--d)_both]"
                style={{ '--tx': `${Math.cos(a) * 22}px`, '--ty': `${Math.sin(a) * 22}px` } as CSSProperties}
              />
            );
          })}
        </span>
      )}
    </div>
  );
}

const TABS = [
  ['overview', 'Overview'],
  ['dns', 'DNS records'],
  ['security', 'Security'],
] as const;

function LikeButton({ variant }: { variant?: boolean }) {
  const [liked, setLiked] = useState(false);
  const [burst, setBurst] = useState(0);
  const count = 128 + (liked ? 1 : 0);
  return (
    <Button
      appearance="ghost"
      tone="neutral"
      aria-pressed={liked}
      aria-label={`Like, ${count}`}
      onClick={() => {
        setLiked((l) => !l);
        if (!liked) setBurst((b) => b + 1);
      }}
      leftIcon={
        <span className="relative inline-grid size-4">
          <span key={variant ? burst : 0} className={cn('inline-grid', variant && liked && burst > 0 && 'animate-[mi-pop_400ms_var(--ease-spring)]')}>
            {liked ? <HeartSolid style={{ color: 'var(--color-icon-icon-danger)' }} /> : <Heart />}
          </span>
          {variant &&
            liked &&
            Array.from({ length: 8 }, (_, i) => {
              const a = (Math.PI * 2 * i) / 8;
              return (
                <i
                  key={`${burst}-${i}`}
                  className="pointer-events-none absolute start-1/2 top-1/2 -ms-0.5 -mt-0.5 size-1 rounded-full bg-[var(--color-icon-icon-danger)] animate-[mi-fly_600ms_var(--ease-glide)_forwards]"
                  style={{ '--tx': `${Math.cos(a) * 16}px`, '--ty': `${Math.sin(a) * 16}px` } as CSSProperties}
                />
              );
            })}
        </span>
      }
    >
      {count}
    </Button>
  );
}

function BookmarkButton({ variant }: { variant?: boolean }) {
  const [saved, setSaved] = useState(false);
  return (
    <Button
      appearance="ghost"
      tone="neutral"
      iconOnly
      aria-label="Save to favourites"
      aria-pressed={saved}
      onClick={() => setSaved((v) => !v)}
      leftIcon={
        saved ? (
          <BookmarkSolid style={{ color: 'var(--color-icon-icon-primary)' }} className={cn(variant && 'animate-[mi-drop_550ms_var(--ease-spring)]')} />
        ) : (
          <Bookmark />
        )
      }
    />
  );
}

const DEPLOY_LABEL = { idle: 'Deploy', busy: 'Deploying', done: 'Deployed' } as const;

function StatusPillNow() {
  const [state, setState] = useState<keyof typeof DEPLOY_LABEL>('idle');
  const later = useTimers();
  return (
    <Button
      loading={state === 'busy'}
      success={state === 'done'}
      tone={state === 'done' ? 'success' : 'primary'}
      appearance="tonal"
      onClick={() => {
        if (state === 'done') return setState('idle');
        setState('busy');
        later(() => setState('done'), 1500);
      }}
    >
      {DEPLOY_LABEL[state]}
    </Button>
  );
}

function StatusPillVariant() {
  const [state, setState] = useState<keyof typeof DEPLOY_LABEL>('idle');
  const later = useTimers();
  return (
    <>
      <button
        type="button"
        data-state={state}
        onClick={() => {
          if (state === 'busy') return;
          if (state === 'done') return setState('idle');
          setState('busy');
          later(() => setState('done'), 1500);
        }}
        className={cn(
          'inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-solid px-4 font-body text-body-m font-medium',
          'transition-[background-color,border-color,color] duration-slow ease-enter focus-visible:outline-none focus-visible:focus-ring',
          'data-[state=idle]:border-[var(--color-border-border)] data-[state=idle]:bg-[var(--color-bg-surface-bg-surface)] data-[state=idle]:text-[var(--color-text-text)]',
          'data-[state=busy]:border-[var(--color-border-border-primary)] data-[state=busy]:bg-[var(--color-bg-primary-bg-primary-subtler)] data-[state=busy]:text-[var(--color-text-text-link)]',
          'data-[state=done]:border-transparent data-[state=done]:bg-[var(--color-bg-success-bg-success-subtle)] data-[state=done]:text-[var(--color-text-text-success-on-tonal)]',
        )}
      >
        <span aria-hidden="true" className="grid size-3.5 place-items-center [&>*]:col-start-1 [&>*]:row-start-1">
          <span className={cn('size-1.5 rounded-full bg-current transition-[opacity,scale] duration-moderate', state !== 'idle' && 'scale-0 opacity-0')} />
          <span className={cn('size-3.5 rounded-full border-2 border-solid border-t-current animate-[theya-spin_700ms_linear_infinite] transition-opacity', state !== 'busy' && 'opacity-0')} style={{ borderRightColor: TRACK, borderBottomColor: TRACK, borderLeftColor: TRACK }} />
          <Check className={cn('size-3.5 transition-[opacity,scale] duration-moderate ease-spring', state !== 'done' && 'scale-50 opacity-0')} />
        </span>
        {DEPLOY_LABEL[state]}
      </button>
      <span role="status" className="sr-only">
        {state === 'busy' ? 'Deploying' : state === 'done' ? 'Deployed' : ''}
      </span>
    </>
  );
}

function TalkVariant() {
  const [live, setLive] = useState(false);
  const [sent, setSent] = useState(false);
  const later = useTimers();
  const start = () => {
    setSent(false);
    setLive(true);
  };
  const stop = () => {
    if (!live) return;
    setLive(false);
    setSent(true);
    later(() => setSent(false), 1600);
  };
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-pressed={live}
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            start();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') stop();
        }}
        className={cn(
          'inline-flex h-10 cursor-pointer touch-none select-none items-center gap-2.5 rounded-full px-4 font-body text-body-m font-medium',
          'transition-[background-color,color,scale] duration-moderate ease-spring focus-visible:outline-none focus-visible:focus-ring',
          live ? 'scale-105 bg-[var(--color-bg-primary-bg-primary)] text-[var(--color-text-text-on-primary)]' : 'bg-[var(--color-bg-neutral-bg-neutral-subtle)] text-[var(--color-text-text)]',
        )}
      >
        <Microphone aria-hidden="true" className="size-4" />
        <span aria-hidden="true" className="flex h-4 items-center gap-[3px]">
          {[0.42, 0.3, 0.5, 0.28, 0.46, 0.34, 0.4].map((d, i) => (
            <i
              key={i}
              className={cn('h-full w-[3px] rounded-full bg-current transition-transform duration-slow ease-spring', live ? 'animate-[mi-talk_ease-in-out_infinite_alternate]' : 'scale-y-[0.15]')}
              style={{ animationDuration: `${d}s` }}
            />
          ))}
        </span>
        Hold to talk
      </button>
      <span role="status" className={cn('text-body-s text-[var(--color-text-text-success)] transition-opacity duration-slow', !sent && 'opacity-0')}>
        {sent ? 'Sent' : ''}
      </span>
    </div>
  );
}

/* ───── Selection additions ───── */

const FILTERS = ['Next.js', 'Node.js', 'Static', 'Docker'];

function ChoiceChips({ variant }: { variant?: boolean }) {
  return (
    <div role="group" aria-label={variant ? 'Stack filters (variant)' : 'Stack filters (now)'} className="flex flex-wrap gap-2">
      {FILTERS.map((f, i) => (
        <Chip
          key={f}
          defaultPressed={i === 0}
          className={cn(variant && 'transition-[background-color,color,scale] duration-moderate data-[pressed]:animate-[mi-chip_320ms_var(--ease-spring)]')}
        >
          {f}
        </Chip>
      ))}
    </div>
  );
}

function TogglePills({ variant }: { variant?: boolean }) {
  return (
    <ToggleGroup type="single" defaultValue="month" appearance="tonal" aria-label={variant ? 'Billing period (variant)' : 'Billing period (now)'} className="gap-1.5">
      {[
        ['month', 'Monthly'],
        ['year', 'Yearly'],
        ['two', '2 years'],
      ].map(([v, label]) => (
        <ToggleGroupItem key={v} value={v} className={cn(variant && 'transition-[background-color,color,scale] duration-slower ease-spring data-[state=on]:scale-[1.06]')}>
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function SnapRail() {
  const [value, setValue] = useState('overview');
  const [hover, setHover] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  useLayoutEffect(() => {
    const target = hover ?? value;
    const tab = box.current?.querySelector<HTMLElement>(`[role="tab"][data-value="${target}"]`);
    if (tab) setPill({ left: tab.offsetLeft, width: tab.offsetWidth });
  }, [value, hover]);
  return (
    <div ref={box} className="w-full" onPointerLeave={() => setHover(null)}>
      <Tabs value={value} onValueChange={setValue}>
        <TabsList className="relative w-fit max-w-full gap-0 [&>[data-slot=tabs-indicator]]:hidden rounded-full border-0 bg-[var(--color-bg-neutral-bg-neutral-subtle)] p-1">
          {pill && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-[var(--color-bg-surface-bg-surface)] shadow-elevation-sm transition-[left,width] duration-slower ease-spring"
              style={{ left: pill.left, width: pill.width }}
            />
          )}
          {TABS.map(([v, label]) => (
            <TabsTrigger
              key={v}
              value={v}
              data-value={v}
              onPointerEnter={() => setHover(v)}
              className="relative mb-0 shrink-0 rounded-full border-b-0 px-3 py-1.5 data-[state=active]:text-[var(--color-text-text)] data-[state=inactive]:hover:bg-transparent"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map(([v, label]) => (
          <TabsContent key={v} value={v} className="pt-3 text-body-s text-[var(--color-text-text-subtle)]">
            {label} panel
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

const SWATCHES = [
  { value: 'iris', label: 'Iris', color: 'var(--color-bg-primary-bg-primary)' },
  { value: 'mint', label: 'Mint', color: 'var(--color-bg-success-bg-success)' },
  { value: 'sky', label: 'Sky', color: 'var(--color-bg-info-bg-info)' },
  { value: 'amber', label: 'Amber', color: 'var(--color-bg-warning-bg-warning)' },
  { value: 'coral', label: 'Coral', color: 'var(--color-bg-danger-bg-danger)' },
];

export const Selection: Story = {
  render: () => (
    <Gallery intro="Selection controls: the moment a value changes. Toggle each control in both columns.">
      <Pair
        title="Checkbox draw" adopted
        note="The tick is drawn along its stroke instead of popping in; unticking erases it quickly."
        source="Kinetics · Checkbox Draw"
        now={<CheckList />}
        variant={<CheckList variant />}
      />
      <Pair
        title="Switch squish" adopted
        note="While pressed, the thumb stretches toward where it's going; on release it springs across. Same Switch, one extra class."
        source="Common pattern (uiverse.io); own code"
        now={<Switch aria-label="Auto-renew (now)" defaultChecked />}
        variant={
          <Switch
            aria-label="Auto-renew (variant)"
            defaultChecked
            className="[&>span]:transition-[translate,width] active:[&>span]:w-[20px] data-[state=checked]:active:[&>span]:translate-x-[13px] rtl:data-[state=checked]:active:[&>span]:-translate-x-[13px]"
          />
        }
      />
      <Pair
        title="Tab glide" adopted
        note="One underline slides to the new tab and takes its width, instead of jumping."
        source="Kinetics · Tab Pill Glide"
        now={<NowTabs />}
        variant={<GlideTabs />}
      />
      <Pair
        title="Rating pop" adopted
        note="The stars light up one after another up to your pick, each with a little spin and bounce; the picked star throws a ring of sparks."
        source="Kinetics · Star Rating; after a LottieFiles 5-star idea, own code"
        now={<Rating defaultValue={3} aria-label="Rate support (now)" />}
        variant={<StarBurstRating />}
      />
      <Pair
        title="Tab chips"
        adopted
        note="Segmented tabs: a soft pill springs to the tab under the pointer and settles on the selected one."
        source="Kinetics · Snap Rail"
        now={<NowTabs chips />}
        variant={<SnapRail />}
      />
      <Pair title="Choice chips" adopted note="A filter chip pops as it switches on." source="Kinetics · Choice Chips" now={<ChoiceChips />} variant={<ChoiceChips variant />} />
      <Pair title="Toggle pills" note="The selected pill grows slightly on the spring curve and stays a touch larger." source="Kinetics · Toggle Pills" now={<TogglePills />} variant={<TogglePills variant />} />
      <Pair
        title="Swatch spring" adopted
        note="The selected colour springs up a size."
        source="Kinetics · Swatch Picker"
        now={<SwatchPicker options={SWATCHES} defaultValue="iris" aria-label="Accent colour (now)" />}
        variant={
          <SwatchPicker
            options={SWATCHES}
            defaultValue="iris"
            aria-label="Accent colour (variant)"
            className="[&_[role=radio]]:transition-[scale,box-shadow] [&_[role=radio]]:duration-slower [&_[role=radio]]:ease-spring [&_[role=radio][aria-checked=true]]:scale-115"
          />
        }
      />
      <Pair
        title="Underline draw"
        note="Hover or focus a link: the underline draws from the start of the line instead of appearing."
        source="Kinetics · Underline Draw"
        now={<Link href="#billing" onClick={(e) => e.preventDefault()}>Billing settings</Link>}
        variant={
          <Link
            href="#billing"
            onClick={(e) => e.preventDefault()}
            className="relative no-underline! after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-slower after:ease-[cubic-bezier(0.65,0,0.35,1)] after:content-[''] hover:no-underline! hover:after:scale-x-100 focus-visible:after:scale-x-100 rtl:after:origin-right"
          >
            Billing settings
          </Link>
        }
      />
    </Gallery>
  ),
};

/* ───────────────────────── Inputs ───────────────────────── */

function QuantityStepper({ variant }: { variant?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  return (
    <div ref={box}>
      <NumberField
        defaultValue={1}
        min={0}
        max={20}
        aria-label={variant ? 'Quantity (variant)' : 'Quantity (now)'}
        onValueChange={() => {
          const input = box.current?.querySelector('input');
          if (!variant || !input || isReduced(input)) return;
          input.animate([{ scale: 1 }, { scale: 1.3 }, { scale: 1 }], { duration: 350, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
        }}
      />
    </div>
  );
}

function Tags({ variant }: { variant?: boolean }) {
  return (
    <TagInput
      defaultValue={['staging', 'eu-west']}
      placeholder="Add a tag, press Enter"
      aria-label={variant ? 'Site tags (variant)' : 'Site tags (now)'}
      // The chips are the TagInput's only `max-w-full` children; a pop-out on remove needs the component itself.
      className={cn(variant && '[&_.max-w-full]:animate-[mi-pop-in_400ms_var(--ease-spring)]')}
    />
  );
}

const INTERVALS = ['15 minutes', '30 minutes', '1 hour', '2 hours', '6 hours', '12 hours', 'Daily'];

function MomentumPicker() {
  const [i, setI] = useState(2);
  const box = useRef<HTMLDivElement>(null);
  const last = useRef(0);
  const move = (d: number) => setI((n) => Math.min(INTERVALS.length - 1, Math.max(0, n + d)));
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = performance.now();
      if (now - last.current < 160 || Math.abs(e.deltaY) < 4) return;
      last.current = now;
      move(e.deltaY > 0 ? 1 : -1);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);
  return (
    <div className="flex items-center gap-4">
      <div
        ref={box}
        role="listbox"
        tabIndex={0}
        aria-label="Backup interval"
        aria-activedescendant={`mi-int-${i}`}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') move(1);
          else if (e.key === 'ArrowUp') move(-1);
          else if (e.key === 'Home') setI(0);
          else if (e.key === 'End') setI(INTERVALS.length - 1);
          else return;
          e.preventDefault();
        }}
        className="relative h-[108px] w-40 cursor-ns-resize overflow-hidden rounded-[var(--size-border-radius-border-radius-xl)] bg-[var(--color-bg-neutral-bg-neutral-subtler)] focus-visible:outline-none focus-visible:focus-ring [mask-image:linear-gradient(transparent,black_30%,black_70%,transparent)]"
      >
        <span aria-hidden="true" className="absolute inset-x-2 top-9 h-9 rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-surface-bg-surface)] shadow-elevation-sm" />
        <div className="relative transition-transform duration-[580ms] ease-spring" style={{ transform: `translateY(${36 - i * 36}px)` }}>
          {INTERVALS.map((label, n) => (
            <div
              key={label}
              id={`mi-int-${n}`}
              role="option"
              aria-selected={n === i}
              onClick={() => setI(n)}
              className={cn(
                'flex h-9 items-center justify-center font-body text-body-m tabular-nums transition-[opacity,scale] duration-slow ease-enter',
                n === i ? 'font-medium text-[var(--color-text-text)]' : 'scale-[.88] text-[var(--color-text-text-subtle)] opacity-50',
              )}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
      <span className="text-body-s text-[var(--color-text-text-subtle)]">Scroll over it, click an option, or use ↑ ↓</span>
    </div>
  );
}

/* ───────────────────────── Menus ───────────────────────── */

const ACTIONS = [
  { label: 'Upload files', icon: <Upload /> },
  { label: 'New page', icon: <Page /> },
  { label: 'Share', icon: <ShareAndroid /> },
];

function MenuNow({ label = 'Create' }: { label?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Fab position="none" size="md" icon={<Plus />} aria-label={label} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {ACTIONS.map((a) => (
          <DropdownMenuItem key={a.label}>{a.label}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const FAN = [
  [-60, -52],
  [0, -76],
  [60, -52],
];

function SpeedDial() {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative flex h-44 w-full items-end justify-center pb-2"
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false);
      }}
    >
      <div id="mi-dial" className="contents">
        {ACTIONS.map((a, i) => (
          <Fab
            key={a.label}
            position="none"
            size="sm"
            appearance="tonal"
            tone="primary"
            icon={a.icon}
            aria-label={a.label}
            tabIndex={open ? 0 : -1}
            className={cn(
              'absolute bottom-[18px] transition-[translate,scale,opacity,visibility] duration-slower ease-spring',
              open ? 'visible opacity-100' : 'invisible scale-[.4] opacity-0',
            )}
            style={{ translate: open ? `${FAN[i][0]}px ${FAN[i][1]}px` : '0 0', transitionDelay: open ? `${i * 50}ms` : '0ms' }}
          />
        ))}
      </div>
      <Fab
        position="none"
        icon={<Plus className={cn('transition-transform duration-slow ease-spring', open && 'rotate-45')} />}
        aria-label={open ? 'Close create menu' : 'Create'}
        aria-expanded={open}
        aria-controls="mi-dial"
        onClick={() => setOpen((v) => !v)}
      />
    </div>
  );
}

const ORBIT = [
  { label: 'Edit', icon: <EditPencil />, at: '-translate-y-[52px]' },
  { label: 'Share', icon: <ShareAndroid />, at: 'translate-x-[52px]' },
  { label: 'Duplicate', icon: <Copy />, at: 'translate-y-[52px]' },
  { label: 'Delete', icon: <Trash />, at: '-translate-x-[52px]' },
];

function OrbitalMenu() {
  const [open, setOpen] = useState(false);
  // A mouse opens it by hovering; its click must not toggle it shut again.
  const viaMouse = useRef(false);
  return (
    <div
      className="group/orbit relative flex size-44 items-center justify-center"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(false)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false);
      }}
    >
      {ORBIT.map((a, i) => (
        <Button
          key={a.label}
          appearance="tonal"
          tone="neutral"
          size="sm"
          iconOnly
          aria-label={a.label}
          leftIcon={a.icon}
          tabIndex={open ? 0 : -1}
          className={cn('absolute rounded-full transition-[translate,opacity,visibility,scale] duration-slower ease-spring', open ? cn('visible opacity-100', a.at) : 'invisible scale-50 opacity-0')}
          style={{ transitionDelay: open ? `${i * 35}ms` : '0ms' }}
        />
      ))}
      <Fab position="none" size="sm" icon={<Plus className={cn('transition-transform duration-slow ease-spring', open && 'rotate-45')} />} aria-label="Page actions" aria-expanded={open} onPointerDown={(e) => (viaMouse.current = e.pointerType === 'mouse')} onClick={() => {
          if (viaMouse.current) return void (viaMouse.current = false);
          setOpen((v) => !v);
        }} />
    </div>
  );
}

function CommandMenu({ variant }: { variant?: boolean }) {
  const items = ['New site', 'Add domain', 'Invite member', 'Open billing'];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button appearance="tonal" tone="neutral" leftIcon={<Search />}>
          Open actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        data-mi={variant ? '' : undefined}
        className={cn(
          variant && [
            'data-[state=open]:animate-[mi-bloom_480ms_var(--ease-glide)]!',
            '[&_[role=menuitem]]:animate-[mi-rise_360ms_var(--ease-glide)_both]',
            '[&_[role=menuitem]:nth-child(2)]:[animation-delay:40ms] [&_[role=menuitem]:nth-child(3)]:[animation-delay:80ms] [&_[role=menuitem]:nth-child(4)]:[animation-delay:120ms]',
          ],
        )}
      >
        {items.map((label) => (
          <DropdownMenuItem key={label}>{label}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const Inputs: Story = {
  render: () => (
    <Gallery intro="Inputs: values that change step by step. Use the controls in both columns.">
      <Pair title="Quantity pop" adopted note="The number pops on every step (buttons, arrows or typing)." source="Kinetics · Quantity Stepper" now={<QuantityStepper />} variant={<QuantityStepper variant />} />
      <Pair
        title="Tag pop-in" adopted
        note="A new tag pops into the field; a removed one pops out before it leaves. Built into TagInput (left); the prototype shows only the pop-in."
        source="Kinetics · Tag Input"
        now={<Tags />}
        variant={<Tags variant />}
      />
      <Pair
        title="Momentum picker"
        adopted
        note="A wheel for a short ordered list: scrolling rolls it to the next detent with a spring; the rest fade back. A listbox for assistive tech."
        source="Kinetics · Momentum Picker"
        now={<WheelPicker aria-label="Backup interval (built in)" options={INTERVALS.map((label) => ({ value: label, label }))} defaultValue="1 hour" />}
        variant={<MomentumPicker />}
      />
    </Gallery>
  ),
};

export const Menus: Story = {
  render: () => (
    <Gallery intro="Menus and floating actions: how a set of actions appears. Open each one in both columns.">
      <Pair
        title="Speed dial"
        adopted
        note="The FAB's actions fan out on a staggered spring and the plus turns into a close. Escape closes it. Built in as FabSpeedDial."
        source="Kinetics · Speed-Dial FAB"
        now={
          <div className="flex h-44 w-full items-end justify-center pb-2">
            <FabSpeedDial position="none" actions={ACTIONS.map((a) => ({ label: a.label, icon: a.icon }))} />
          </div>
        }
        variant={<SpeedDial />}
      />
      <Pair
        title="Orbital menu"
        note="Four actions leave the centre on hover (mouse) or click (touch, keyboard). For a canvas or an image, not for forms."
        source="Kinetics · Orbital Action Menu"
        now={<MenuNow label="Page actions" />}
        variant={<OrbitalMenu />}
      />
      <Pair
        title="Menu bloom"
        adopted
        note="Menus, selects and popovers unfold from the edge next to their trigger and their items slide in one after another. Built in for DropdownMenu, ContextMenu, Menubar, Select and Popover."
        source="Kinetics · Command Palette Bloom"
        now={<CommandMenu />}
        variant={<CommandMenu variant />}
      />
      <Pair
        title="FAB lift" adopted
        note="On hover the FAB rises and its shadow grows, on the spring curve."
        source="Kinetics · Hover Lift"
        now={<Fab position="none" icon={<Plus />} label="New site" />}
        variant={<Fab position="none" icon={<Plus />} label="New site" className="transition-[translate,box-shadow,background-color] duration-slower ease-spring hover:-translate-y-1 hover:shadow-elevation-lg" />}
      />
    </Gallery>
  ),
};

/* ───────────────────────── Feedback ───────────────────────── */

function DrawnSuccess({ run }: { run: number }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(false);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true)));
    return () => cancelAnimationFrame(id);
  }, [run]);
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 shrink-0 text-[var(--color-icon-icon-success)]">
      <circle cx="12" cy="12" r="10" pathLength={1} fill="none" stroke="currentColor" strokeWidth="2" className="mi-draw -rotate-90 origin-center" data-on={on || undefined} />
      <path d="M7.5 12.3l3 3 6-6.3" pathLength={1} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mi-draw mi-draw-late" data-on={on || undefined} />
    </svg>
  );
}

function SuccessRow({ variant }: { variant?: boolean }) {
  const [run, setRun] = useState(0);
  return (
    <div className="flex w-full flex-col items-start gap-3">
      <div key={variant ? undefined : run} className="flex items-center gap-3">
        {variant ? <DrawnSuccess run={run} /> : <SuccessCheck className="size-6 text-[var(--color-icon-icon-success)]" />}
        <span className="text-body-m text-[var(--color-text-text)]">Backup restored</span>
      </div>
      <Button size="sm" appearance="ghost" tone="neutral" onClick={() => setRun((r) => r + 1)}>
        Replay
      </Button>
    </div>
  );
}

function DomainForm({ variant }: { variant?: boolean }) {
  const [error, setError] = useState<string | undefined>();
  const shake = useRef<HTMLDivElement>(null);
  return (
    <form
      noValidate
      className="flex w-full flex-col items-start gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const value = new FormData(event.currentTarget).get('domain');
        if (value) return setError(undefined);
        setError('Enter a domain, e.g. shop.example.com');
        if (variant && shake.current && !isReduced(shake.current)) {
          shake.current.animate(
            [
              { translate: '0' },
              { translate: '-1px', offset: 0.1 },
              { translate: '2px', offset: 0.2 },
              { translate: '-4px', offset: 0.3 },
              { translate: '4px', offset: 0.4 },
              { translate: '-4px', offset: 0.5 },
              { translate: '4px', offset: 0.6 },
              { translate: '-4px', offset: 0.7 },
              { translate: '2px', offset: 0.8 },
              { translate: '-1px', offset: 0.9 },
              { translate: '0' },
            ],
            { duration: 450, easing: 'cubic-bezier(.36,.07,.19,.97)' },
          );
        }
      }}
    >
      <div ref={shake} className="w-full">
        <TextField name="domain" label="Domain" error={error} />
      </div>
      <Button type="submit" size="sm">
        Add domain
      </Button>
    </form>
  );
}

function CartCounter({ variant }: { variant?: boolean }) {
  const [count, setCount] = useState(2);
  return (
    <div className="flex items-center gap-4">
      <span className="relative inline-flex">
        <Cart aria-hidden="true" className="size-6 text-[var(--color-icon-icon)]" />
        <span key={variant ? count : undefined} className={cn('absolute -end-2 -top-2 inline-flex', variant && count > 2 && 'animate-[mi-pop_320ms_var(--ease-spring)]')}>
          <BadgeIndicator value={String(count)} tone="danger" aria-hidden="true" />
        </span>
      </span>
      <Button size="sm" appearance="tonal" onClick={() => setCount((c) => c + 1)}>
        Add to cart
      </Button>
      <span role="status" className="sr-only">
        {count} items in cart
      </span>
    </div>
  );
}

function Pulse({ variant, run }: { variant?: boolean; run: number }) {
  return (
    <span key={run} className="relative inline-flex">
      {variant &&
        [0, 0.6].map((d) => (
          <span key={d} aria-hidden="true" className="absolute inset-0 rounded-full bg-[var(--color-bg-danger-bg-danger)] animate-[mi-ring-strong_1.6s_ease-out_3_both]" style={{ animationDelay: `${d}s` }} />
        ))}
      <BadgeIndicator dot tone="danger" aria-hidden="true" pulse={!variant && run > 0} pulseKey={run} />
    </span>
  );
}

function NewDot({ variant }: { variant?: boolean }) {
  const [run, setRun] = useState(0);
  return (
    <div className="flex flex-wrap items-center gap-4">
      <span className="inline-flex items-center gap-2 text-body-m text-[var(--color-text-text)]">
        Inbox
        <Pulse variant={variant} run={run} />
      </span>
      <span className="relative inline-flex">
        <Button appearance="ghost" tone="neutral" iconOnly leftIcon={<Bell />} aria-label="Notifications, 1 new" />
        <span className="pointer-events-none absolute end-2 top-2">
          <Pulse variant={variant} run={run} />
        </span>
      </span>
      <Button size="sm" appearance="ghost" tone="neutral" onClick={() => setRun((r) => r + 1)}>
        New message
      </Button>
    </div>
  );
}

export const Feedback: Story = {
  render: () => (
    <Gallery intro="Feedback: success, errors and counts. Use the buttons in both columns to trigger them again.">
      <Pair title="Success check" adopted note="Ring, then tick, drawn on. Built in as SuccessCheck — the Toaster uses it for toast.success; put it in a success Alert." source="Kinetics · Success Check" now={<SuccessRow />} variant={<SuccessRow variant />} />
      <Pair
        title="Error shake"
        note="Submit the empty field: the field shakes once (450ms, decaying). The message is the real signal; the shake only draws the eye, and is skipped with reduced motion. Built into Form: on a failed submit each invalid FormItem shakes."
        source="Kinetics · Error Shake"
        now={<DomainForm />}
        variant={<DomainForm variant />}
      />
      <Pair title="Counter pop" adopted note="The count springs each time it changes." source="Kinetics · Badge Counter" now={<CartCounter />} variant={<CartCounter variant />} />
      <Pair
        title="Pulse dot"
        adopted
        note="A new-item dot sends out two strong rings, three times, then rests — moving content stops on its own under 5 seconds (WCAG 2.2.2). Works on an icon button too."
        source="Kinetics · Pulse Badge"
        now={<NewDot />}
        variant={<NewDot variant />}
      />
      <Pair
        title="Undo snackbar" adopted
        note="A bar drains over the grace window and pauses while the toasts are hovered. Built into undoToast (left, a 10-second toast); the prototype also slides up on a spring. With reduced motion the bar still runs: it tells the time left."
        source="Kinetics · Undo Snackbar"
        now={<UndoNow />}
        variant={<UndoVariant />}
      />
    </Gallery>
  ),
};

/* ───────────────────────── Loaders ───────────────────────── */

function Loader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span role="status" aria-label={LOADING} className={cn('mi-loader inline-flex items-center justify-center text-[var(--color-icon-icon-primary)]', className)}>
      {children}
    </span>
  );
}

function Labeled({ name, children }: { name: string; children: ReactNode }) {
  return (
    <span className="flex flex-col items-center gap-2">
      <span className="flex h-8 items-center">{children}</span>
      <span className="text-body-xs text-[var(--color-text-text-subtler)]">{name}</span>
    </span>
  );
}

const Orbit = () => (
  <Loader>
    <span className="size-6 rounded-full border-[3px] border-solid border-t-current border-r-current animate-[theya-spin_800ms_linear_infinite]" style={{ borderBottomColor: TRACK, borderLeftColor: TRACK }} />
  </Loader>
);

const Meridian = () => (
  <Loader>
    <svg viewBox="0 0 48 48" aria-hidden="true" className="size-6 animate-[theya-spin_1.6s_linear_infinite]">
      <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" className="animate-[mi-dashring_1.4s_ease-in-out_infinite]" />
    </svg>
  </Loader>
);

const Ticks = () => (
  <Loader className="relative size-6">
    {Array.from({ length: 12 }, (_, i) => (
      <i
        key={i}
        aria-hidden="true"
        className="absolute start-[11px] top-0 h-1.5 w-0.5 origin-[1px_12px] rounded-full bg-current animate-[mi-fade12_1.2s_linear_infinite]"
        style={{ rotate: `${i * 30}deg`, animationDelay: `${(i - 12) * 0.1}s` }}
      />
    ))}
  </Loader>
);

const Dots = () => (
  <Loader className="gap-1">
    {[0, 1, 2].map((i) => (
      <i key={i} aria-hidden="true" className="size-2 rounded-full bg-current animate-[mi-dot_1.1s_ease-in-out_infinite]" style={{ animationDelay: `${i * 150}ms` }} />
    ))}
  </Loader>
);

const Equalizer = () => (
  <Loader className="h-6 items-end gap-[3px]">
    {[0, -0.8, -0.4, -0.6, -0.2].map((d) => (
      <i key={d} aria-hidden="true" className="h-full w-1 origin-bottom rounded-full bg-current animate-[mi-eq_1s_ease-in-out_infinite]" style={{ animationDelay: `${d}s` }} />
    ))}
  </Loader>
);

const Typing = () => (
  <span
    role="status"
    aria-label="Support is typing"
    className="mi-loader inline-flex gap-1 rounded-[var(--size-border-radius-border-radius-xl)] rounded-es-[var(--size-border-radius-border-radius-sm)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] px-3 py-2.5 text-[var(--color-icon-icon-subtle)]"
  >
    {[0, 1, 2].map((i) => (
      <i key={i} aria-hidden="true" className="size-1.5 rounded-full bg-current animate-[mi-dot_1.2s_ease-in-out_infinite]" style={{ animationDelay: `${i * 160}ms` }} />
    ))}
  </span>
);

const Indeterminate = () => (
  <span role="progressbar" aria-label="Deploying" className="mi-loader relative block h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--color-bg-neutral-bg-neutral-subtle)' }}>
    <span className="absolute inset-y-0 start-0 w-2/5 rounded-full bg-[var(--color-bg-primary-bg-primary)] animate-[mi-indeterminate_1.4s_var(--ease-glide)_infinite] rtl:[animation-direction:reverse]" />
  </span>
);

const Segments = () => (
  <Loader className="gap-1 [--mi-track:color-mix(in_oklab,currentColor_15%,transparent)]">
    {[0, 1, 2, 3, 4].map((i) => (
      <i key={i} aria-hidden="true" className="h-2 w-3.5 rounded-[2px] animate-[mi-seg_2s_ease-in-out_infinite]" style={{ background: 'var(--mi-track)', animationDelay: `${i * 200}ms` }} />
    ))}
  </Loader>
);

function RingProgress() {
  const steps = [25, 60, 100];
  const [i, setI] = useState(0);
  const value = steps[i];
  return (
    <div className="flex items-center gap-4">
      <span role="progressbar" aria-label="Upload" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} className="relative inline-flex size-12 items-center justify-center">
        <svg viewBox="0 0 48 48" aria-hidden="true" className="absolute inset-0 -rotate-90">
          <circle cx="24" cy="24" r="20" fill="none" strokeWidth="4" style={{ stroke: 'var(--color-bg-neutral-bg-neutral-subtle)' }} />
          <circle
            cx="24"
            cy="24"
            r="20"
            pathLength={100}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="100"
            strokeDashoffset={100 - value}
            className="stroke-[var(--color-icon-icon-primary)] transition-[stroke-dashoffset] duration-[900ms] ease-glide"
          />
        </svg>
        <span className="text-body-xs font-medium tabular-nums text-[var(--color-text-text)]">{value}%</span>
      </span>
      <Button size="sm" appearance="ghost" tone="neutral" onClick={() => setI((n) => (n + 1) % steps.length)}>
        Next value
      </Button>
    </div>
  );
}

function SkeletonSwap({ variant }: { variant?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const sweep = cn(
    'rounded-[var(--size-border-radius-border-radius-max)] bg-[length:200%_100%] animate-[mi-sweep_1.4s_ease-in-out_infinite]',
    'bg-[linear-gradient(90deg,var(--color-bg-neutral-bg-neutral-subtle)_25%,color-mix(in_oklab,var(--color-bg-neutral-bg-neutral-subtle),var(--color-bg-surface-bg-surface)_65%)_50%,var(--color-bg-neutral-bg-neutral-subtle)_75%)]',
  );
  const lines = ['h-4 w-3/5', 'h-3 w-full', 'h-3 w-4/5'];
  return (
    <div className="flex w-full flex-col items-start gap-3">
      <div aria-busy={!loaded} className="grid w-full [&>*]:col-start-1 [&>*]:row-start-1">
        <div aria-hidden="true" className={cn('flex flex-col gap-2', variant && 'transition-opacity duration-slow ease-enter', loaded && 'opacity-0', loaded && !variant && 'hidden')}>
          {lines.map((l) => (variant ? <div key={l} className={cn(sweep, l)} /> : <Skeleton key={l} className={l} />))}
        </div>
        <div className={cn('flex flex-col gap-1', variant && 'transition-[opacity,translate] duration-slow ease-enter', !loaded && 'pointer-events-none translate-y-1 opacity-0', !loaded && !variant && 'hidden')}>
          <p className="text-body-m font-semibold text-[var(--color-text-text)]">shop.example.com</p>
          <p className="text-body-s text-[var(--color-text-text-subtle)]">SSL active · renews on 14 Nov</p>
        </div>
      </div>
      <Button size="sm" appearance="ghost" tone="neutral" onClick={() => setLoaded((l) => !l)}>
        {loaded ? 'Show loading' : 'Show content'}
      </Button>
    </div>
  );
}

function UndoNow() {
  return (
    <Button
      appearance="tonal"
      tone="danger"
      leftIcon={<Trash />}
      onClick={() => undoToast({ title: 'Backup deleted', onUndo: () => {}, onCommit: () => {} })}
    >
      Delete backup
    </Button>
  );
}

function UndoVariant() {
  const [open, setOpen] = useState(false);
  const [run, setRun] = useState(0);
  const [note, setNote] = useState('');
  return (
    <div className="relative flex h-36 w-full flex-col items-start overflow-hidden">
      <Button
        appearance="tonal"
        tone="danger"
        leftIcon={<Trash />}
        onClick={() => {
          setNote('');
          setOpen(true);
          setRun((r) => r + 1);
        }}
      >
        Delete backup
      </Button>
      <span role="status" className="sr-only">
        {open ? 'Backup deleted. Undo is available.' : note}
      </span>
      <div
        aria-hidden={!open}
        className={cn(
          'group/snack absolute inset-x-0 bottom-0 flex items-center gap-3 overflow-hidden rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-surface-bg-surface-overlay-dark)] py-2 ps-4 pe-2 text-body-m text-[var(--color-text-text-on-dark)] shadow-elevation-lg',
          'transition-[translate,opacity,visibility] duration-slow ease-spring',
          open ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-[120%] opacity-0',
        )}
      >
        <span className="flex-1">Backup deleted</span>
        <Button
          size="sm"
          appearance="ghost"
          tabIndex={open ? 0 : -1}
          className="text-[var(--color-text-text-link-on-dark)]"
          onClick={() => {
            setOpen(false);
            setNote('Restored');
          }}
        >
          Undo
        </Button>
        {open && (
          <span
            key={run}
            aria-hidden="true"
            onAnimationEnd={() => setOpen(false)}
            className="mi-timer absolute inset-x-0 bottom-0 h-0.5 origin-left bg-[var(--color-text-text-link-on-dark)] animate-[mi-drain_6s_linear_forwards] group-hover/snack:[animation-play-state:paused] group-focus-within/snack:[animation-play-state:paused] rtl:origin-right"
          />
        )}
      </div>
    </div>
  );
}

function SegmentFill({ variant }: { variant?: boolean }) {
  const [filled, setFilled] = useState(0);
  const later = useTimers();
  const run = () => {
    setFilled(0);
    for (let n = 1; n <= 5; n++) later(() => setFilled(n), n * (variant ? 120 : 400));
  };
  return (
    <div className="flex w-full flex-col items-start gap-3">
      {variant ? (
        <div role="progressbar" aria-label="Migration" aria-valuemin={0} aria-valuemax={5} aria-valuenow={filled} className="flex w-full gap-1.5">
          {[0, 1, 2, 3, 4].map((n) => (
            <span key={n} className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-bg-neutral-bg-neutral-subtle)]">
              <span className={cn('block h-full origin-left rounded-full bg-[var(--color-bg-primary-bg-primary)] transition-transform duration-slow ease-glide rtl:origin-right', n < filled ? 'scale-x-100' : 'scale-x-0')} />
            </span>
          ))}
        </div>
      ) : (
        <Progress segments={5} value={filled * 20} aria-label="Migration" className="w-full" />
      )}
      <Button size="sm" appearance="ghost" tone="neutral" onClick={run}>
        Run
      </Button>
    </div>
  );
}

const STEPS = ['Plan', 'Domain', 'Payment', 'Done'];

function StepProgress() {
  const [step, setStep] = useState(1);
  return (
    <div className="flex w-full flex-col items-start gap-3">
      <ol className="relative flex w-full items-start justify-between" aria-label="Checkout progress">
        <span aria-hidden="true" className="absolute inset-x-3 top-3 h-0.5 rounded-full bg-[var(--color-bg-neutral-bg-neutral-subtle)]">
          <span className="block h-full origin-left rounded-full bg-[var(--color-bg-success-bg-success)] transition-transform duration-slower ease-spring rtl:origin-right" style={{ transform: `scaleX(${(step - 1) / (STEPS.length - 1)})` }} />
        </span>
        {STEPS.map((label, n) => {
          const done = n + 1 < step;
          const current = n + 1 === step;
          return (
            <li key={label} aria-current={current ? 'step' : undefined} className="relative flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full font-body text-body-xs font-medium transition-[background-color,color,scale] duration-slow ease-spring',
                  // Same colours as Stepper: done steps and the track behind them are success, the current step primary.
                  done
                    ? 'bg-[var(--color-bg-success-bg-success)] text-[var(--color-text-text-on-dark)]'
                    : current
                      ? 'bg-[var(--color-bg-primary-bg-primary)] text-[var(--color-text-text-on-primary)]'
                      : 'bg-[var(--color-bg-neutral-bg-neutral-subtle)] text-[var(--color-text-text-subtle)]',
                  current && 'scale-[1.18]',
                )}
              >
                {done ? <Check aria-hidden="true" className="size-3.5" /> : n + 1}
              </span>
              <span className={cn('text-body-xs', current ? 'text-[var(--color-text-text)]' : 'text-[var(--color-text-text-subtle)]')}>
                {label}
                {done && <span className="sr-only"> (done)</span>}
              </span>
            </li>
          );
        })}
      </ol>
      <Button size="sm" appearance="ghost" tone="neutral" onClick={() => setStep((s) => (s % STEPS.length) + 1)}>
        Next step
      </Button>
    </div>
  );
}

function StepperNow() {
  const [step, setStep] = useState(0);
  return (
    <div className="flex w-full flex-col items-start gap-3">
      <MiStepper steps={STEPS.map((label) => ({ label }))} current={step} className="w-full" />
      <Button size="sm" appearance="ghost" tone="neutral" onClick={() => setStep((s) => (s + 1) % STEPS.length)}>
        Next step
      </Button>
    </div>
  );
}

function CountdownNow() {
  const [to, setTo] = useState(() => Date.now() + 10_000);
  return (
    <div className="flex items-center gap-4">
      <Countdown key={to} to={to} appearance="ring" />
      <Button size="sm" appearance="ghost" tone="neutral" onClick={() => setTo(Date.now() + 10_000)}>
        Restart
      </Button>
    </div>
  );
}

function CountdownRing() {
  const total = 10;
  const [left, setLeft] = useState(total);
  const [run, setRun] = useState(0);
  useEffect(() => {
    setLeft(total);
    const id = window.setInterval(() => setLeft((n) => (n > 0 ? n - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [run]);
  const done = left === 0;
  return (
    <div className="flex items-center gap-4">
      <span role="timer" aria-label={`${left} seconds left`} className="relative inline-flex size-14 items-center justify-center">
        <svg viewBox="0 0 48 48" aria-hidden="true" className="absolute inset-0 -rotate-90">
          <circle cx="24" cy="24" r="20" fill="none" strokeWidth="4" style={{ stroke: 'var(--color-bg-neutral-bg-neutral-subtle)' }} />
          <circle
            cx="24"
            cy="24"
            r="20"
            pathLength={100}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="100"
            strokeDashoffset={100 - (left / total) * 100}
            className={cn('transition-[stroke-dashoffset,stroke] duration-1000 ease-linear', done ? 'stroke-[var(--color-icon-icon-success)]' : 'stroke-[var(--color-icon-icon-primary)]')}
          />
        </svg>
        {done ? <Check aria-hidden="true" className="size-5 text-[var(--color-icon-icon-success)]" /> : <span className="font-body text-body-m font-semibold tabular-nums text-[var(--color-text-text)]">{left}</span>}
      </span>
      <Button size="sm" appearance="ghost" tone="neutral" onClick={() => setRun((r) => r + 1)}>
        Restart
      </Button>
    </div>
  );
}

const TRACE = [
  ['gateway', '100%'],
  ['worker', '72%'],
  ['db', '38%'],
] as const;

const TraceFlame = () => (
  <span role="status" aria-label="Loading trace" className="mi-loader flex w-full flex-col gap-1.5">
    {TRACE.map(([name, w], i) => (
      <span key={name} aria-hidden="true" className="relative flex h-5 items-center overflow-hidden rounded-[var(--size-border-radius-border-radius-sm)]" style={{ width: w }}>
        <i className="absolute inset-0 origin-left rounded-[inherit] bg-[var(--color-bg-primary-bg-primary-subtle)] animate-[mi-span_5.4s_var(--ease-glide)_infinite] rtl:origin-right" style={{ animationDelay: `${i * 280}ms` }} />
        <span className="relative ps-2 font-mono text-body-xs text-[var(--color-text-text)]">{name}</span>
      </span>
    ))}
  </span>
);

/* ───────────────────────── Ambient ───────────────────────── */

const PANEL = 'flex flex-col gap-1 p-4';

function PanelText({ title, text }: { title: string; text: string }) {
  return (
    <div className={PANEL}>
      <p className="text-body-m font-semibold text-[var(--color-text-text)]">{title}</p>
      <p className="text-body-s text-[var(--color-text-text-subtle)]">{text}</p>
    </div>
  );
}

const StrongBeam = ({ children }: { children: ReactNode }) => (
  <div className="relative isolate w-full overflow-hidden rounded-[var(--size-border-radius-border-radius-2xl)] bg-[var(--color-border-border-subtle)] p-0.5 shadow-[0_0_24px_-6px_color-mix(in_oklab,var(--color-bg-primary-bg-primary)_45%,transparent)]">
    <span
      aria-hidden="true"
      className="absolute top-1/2 left-1/2 -z-10 aspect-square w-[250%] -translate-x-1/2 -translate-y-1/2 animate-[theya-spin_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_28%,var(--color-bg-primary-bg-primary)_40%,var(--color-bg-info-bg-info)_46%,transparent_52%,transparent_78%,var(--color-bg-primary-bg-primary)_90%,var(--color-bg-info-bg-info)_96%,transparent_100%)]"
    />
    <div className="relative rounded-[calc(var(--size-border-radius-border-radius-2xl)-2px)] bg-[var(--color-bg-surface-bg-surface)]">{children}</div>
  </div>
);

const GradientBorder = ({ children }: { children: ReactNode }) => (
  <div className="relative isolate w-full overflow-hidden rounded-[var(--size-border-radius-border-radius-2xl)] p-0.5">
    <span
      aria-hidden="true"
      className="absolute top-1/2 left-1/2 -z-10 aspect-square w-[250%] -translate-x-1/2 -translate-y-1/2 animate-[theya-spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,var(--color-bg-primary-bg-primary),var(--color-bg-info-bg-info),var(--color-bg-success-bg-success),var(--color-bg-warning-bg-warning),var(--color-bg-primary-bg-primary))]"
    />
    <div className="relative rounded-[calc(var(--size-border-radius-border-radius-2xl)-2px)] bg-[var(--color-bg-surface-bg-surface)]">{children}</div>
  </div>
);

const NeonPill = () => (
  <span className="inline-flex items-center gap-2 rounded-full border border-solid border-[var(--color-border-border-primary)] px-3 py-1 text-body-s font-medium text-[var(--color-text-text-link)] [--mi-glow:color-mix(in_oklab,var(--color-bg-primary-bg-primary)_70%,transparent)] animate-[mi-neon_2s_ease-in-out_infinite]">
    <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
    Live preview
  </span>
);

const BreathingOrb = () => (
  <span className="flex items-center gap-3">
    <span
      aria-hidden="true"
      className="size-10 shrink-0 rounded-full animate-[mi-orb_5s_ease-in-out_infinite]"
      style={{ background: 'radial-gradient(circle at 50% 40%, var(--color-bg-info-bg-info), var(--color-bg-primary-bg-primary) 70%)' }}
    />
    <span className="text-body-m text-[var(--color-text-text)]">Assistant is listening</span>
  </span>
);

const FloatCard = () => (
  <div className="w-full max-w-60 rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] animate-[mi-bob_4s_ease-in-out_infinite]">
    <PanelText title="Try staging" text="Copy your site in one click." />
  </div>
);

const RadarDot = () => (
  <span className="flex items-center gap-3">
    <span aria-hidden="true" className="relative flex size-12 items-center justify-center">
      {[0, 0.8, 1.6].map((d) => (
        <span key={d} className="absolute size-3 rounded-full border-2 border-solid border-[var(--color-icon-icon-success)] animate-[mi-ping_2.4s_cubic-bezier(0,0.4,0.2,1)_infinite]" style={{ animationDelay: `${d}s` }} />
      ))}
      <span className="size-2.5 rounded-full bg-[var(--color-icon-icon-success)]" />
    </span>
    <span className="text-body-m text-[var(--color-text-text)]">Monitoring 12 sites</span>
  </span>
);

const LiveNow = () => (
  <span className="flex items-center gap-2 text-body-m text-[var(--color-text-text)]">
    <StatusDot tone="success" aria-hidden="true" />
    Monitoring 12 sites
  </span>
);

export const Loaders: Story = {
  render: () => (
    <Gallery intro="Loaders: all use the primary icon colour and a role=status label. With reduced motion they don't freeze — they fade slowly.">
      <Pair
        title="Spinner"
        adopted
        note="Meridian is now the system Spinner (left): Button loading, Combobox, Autocomplete, Command, Dropzone. Orbit and Ticks stay in the library."
        source="Kinetics · Orbit Spinner; CSS Loaders · 20 Meridian, 99 Omega-12"
        now={<span role="status" aria-label="Loading" className="inline-flex text-[var(--color-icon-icon-primary)]"><Spinner className="size-6" /></span>}
        variant={
          <>
            <Labeled name="Orbit">
              <Orbit />
            </Labeled>
            <Labeled name="Meridian">
              <Meridian />
            </Labeled>
            <Labeled name="Ticks">
              <Ticks />
            </Labeled>
          </>
        }
      />
      <Pair
        title="Dots and bars"
        adopted
        note="Chat typing is built in as ChatTyping (left). Dots and Equalizer stay in the library for inline “working” states and live data."
        source="Kinetics · Typing Indicator, Equalizer Bars; CSS Loaders · 03 V-Grade, 43 Chat-Sys"
        now={<ChatTyping className="w-auto" />}
        variant={
          <>
            <Labeled name="Typing">
              <Typing />
            </Labeled>
            <Labeled name="Dots">
              <Dots />
            </Labeled>
            <Labeled name="Equalizer">
              <Equalizer />
            </Labeled>
          </>
        }
      />
      <Pair
        title="Progress"
        adopted
        note="Built into Progress: indeterminate (left) and segments. The ring that eases to each new value stays in the library."
        source="Kinetics · Indeterminate Bar, Progress Ring; CSS Loaders · 28 Segmenta"
        now={<Progress indeterminate aria-label="Deploy" className="w-full" />}
        variant={
          <div className="flex w-full flex-col gap-4">
            <Indeterminate />
            <Labeled name="Segments">
              <Segments />
            </Labeled>
            <RingProgress />
          </div>
        }
      />
      <Pair
        title="Skeleton" adopted
        note="Skeleton is now fully rounded with a light sweep (left). The prototype also fades the content up as the skeleton fades out — that part is up to the screen that swaps them."
        source="Kinetics · Skeleton Sweep, Skeleton to Content"
        now={<SkeletonSwap />}
        variant={<SkeletonSwap variant />}
      />
      <Pair
        title="Trace"
        note="For a request trace or a timeline: the spans fill left to right, hold, and clear."
        source="Kinetics · Trace Flame"
        now={<span className="text-body-s text-[var(--color-text-text-subtler)]">—</span>}
        variant={<TraceFlame />}
      />
    </Gallery>
  ),
};

export const ProgressSteps: Story = {
  name: 'Progress',
  render: () => (
    <Gallery intro="Progress you can count: segments, steps and a countdown. Use the buttons in both columns.">
      <Pair title="Segment fill" adopted note="Five segments fill one after another on a short stagger." source="Kinetics · Segment Loader" now={<SegmentFill />} variant={<SegmentFill variant />} />
      <Pair title="Step progress" adopted note="The connector fills with a spring and the current step pops a size up." source="Kinetics · Step Progress" now={<StepperNow />} variant={<StepProgress />} />
      <Pair title="Countdown ring" adopted note="A ring drains second by second and turns into a success check at zero." source="Kinetics · Countdown Ring" now={<CountdownNow />} variant={<CountdownRing />} />
    </Gallery>
  ),
};

export const Ambient: Story = {
  render: () => (
    <Gallery intro="Ambient highlights: endless, decorative motion. One per screen at most, on the thing that matters; all of it stops with reduced motion.">
      <Pair
        title="Border beam"
        note="Stronger than today's beam: a 2px ring, two lights running round, a soft glow."
        source="Kinetics · Border Beam"
        now={
          <SurfaceEffect effect="beam" className="w-full rounded-[var(--size-border-radius-border-radius-2xl)]">
            <PanelText title="Pro — recommended" text="Five sites, hourly backups." />
          </SurfaceEffect>
        }
        variant={
          <StrongBeam>
            <PanelText title="Pro — recommended" text="Five sites, hourly backups." />
          </StrongBeam>
        }
      />
      <Pair
        title="Gradient border"
        note="The border slowly cycles through the brand and status colours."
        source="Kinetics · Gradient Border Morph"
        now={
          <div className="w-full rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-primary)]">
            <PanelText title="New: AI site builder" text="Describe a site, get a draft." />
          </div>
        }
        variant={
          <GradientBorder>
            <PanelText title="New: AI site builder" text="Describe a site, get a draft." />
          </GradientBorder>
        }
      />
      <Pair title="Neon glow" note="A live tag breathes a soft halo." source="Kinetics · Neon Glow Pulse" now={<Badge tone="primary">Live preview</Badge>} variant={<NeonPill />} />
      <Pair title="Breathing orb" note="Presence for an assistant or voice input: the orb slowly grows and glows." source="Kinetics · Breathing Orb" now={<span className="flex items-center gap-3"><Sparks aria-hidden="true" className="size-6 text-[var(--color-icon-icon-primary)]" /><span className="text-body-m text-[var(--color-text-text)]">Assistant is listening</span></span>} variant={<BreathingOrb />} />
      <Pair
        title="Float bob"
        note="A promo card hovers and bobs, its shadow breathing below."
        source="Kinetics · Float Bob"
        now={
          <div className="w-full max-w-60 rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] shadow-elevation-sm">
            <PanelText title="Try staging" text="Copy your site in one click." />
          </div>
        }
        variant={<FloatCard />}
      />
      <Pair title="Radar pulse" note="Live monitoring: rings spread from the status dot like sonar." source="Kinetics · Radar Pulse" now={<LiveNow />} variant={<RadarDot />} />
    </Gallery>
  ),
};
