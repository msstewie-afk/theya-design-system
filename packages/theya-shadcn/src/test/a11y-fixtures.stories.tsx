import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

/**
 * Calibration fixtures for scripts/a11y-tree.mjs and scripts/a11y-auto.mjs:
 * small widgets with one known defect each, plus clean controls. The scripts'
 * `--fixtures` mode runs only these and fails unless every defect is caught
 * and the clean ones report nothing (pnpm a11y:calibrate, and in CI).
 *
 * Defects are modelled on real ones found in another design system's
 * Combobox (2026-11-12): an unnamed listbox, a chip with no role,
 * aria-expanded on a hidden popup, Escape that doesn't close, a loading popup
 * not linked with aria-controls, and a visually hidden "Dismiss" button
 * (Base UI) that the pointer-only check took for a mouse-only control.
 *
 * parameters.a11y.expect = { tree: [...], auto: [...] }: substrings of the
 * findings each script must report ("<criterion>: <text>"); an empty list
 * means the script must report nothing for this story.
 *
 * Hidden from the sidebar (!dev) and skipped by the test-runner (a11y-fixture):
 * axe would rightly fail them.
 */
const meta: Meta = {
  title: 'Internal/A11y fixtures',
  tags: ['!dev', '!autodocs', 'a11y-fixture'],
  decorators: [
    (Story) => (
      <div className="fx">
        <style>{`
          .fx { font: 16px/1.5 system-ui, sans-serif; display: grid; gap: 12px; max-width: 360px; }
          .fx :focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
          .fx input { border: 1px solid; padding: 4px 8px; }
          .fx [role=option][aria-selected=true], .fx [data-active] { text-decoration: underline; }
          .fx [role=tab][aria-selected=true] { font-weight: 700; }
        `}</style>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj;

const ITEMS = ['Apple', 'Banana', 'Cherry'];
const SR_ONLY: CSSProperties = { position: 'absolute', width: 1, height: 1, margin: -1, padding: 0, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0 };

interface FxComboboxProps {
  defaultOpen?: boolean;
  /** Defect when false: the listbox has no accessible name. */
  nameListbox?: boolean;
  /** Defect when false: Escape leaves the popup open. */
  closesOnEscape?: boolean;
  /** Defect when false: no aria-controls from the input to its popup. */
  linkPopup?: boolean;
  /** The popup shows a loading status instead of options. */
  loading?: boolean;
  /** Defect: aria-expanded stays "true" while the popup is hidden. */
  staleExpanded?: boolean;
  /** A visually hidden Dismiss button in the popup, as Base UI renders it (not a defect). */
  srDismiss?: boolean;
}

/** A plain APG combobox (list autocomplete) with switchable defects. */
function FxCombobox({ defaultOpen = false, nameListbox = true, closesOnEscape = true, linkPopup = true, loading = false, staleExpanded = false, srDismiss = false }: FxComboboxProps) {
  const id = useId();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(defaultOpen);
  const [active, setActive] = useState(-1);
  const close = () => {
    setOpen(false);
    setActive(-1);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      else if (!loading) setActive((a) => Math.min(a + 1, ITEMS.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Escape' && closesOnEscape && open) {
      e.preventDefault();
      close();
    } else if (e.key === 'Enter' && open) {
      e.preventDefault();
      close();
    }
  };
  return (
    <div>
      <label htmlFor={`${id}-input`}>Fruit</label>
      <input
        id={`${id}-input`}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={staleExpanded || open}
        aria-controls={linkPopup ? listId : undefined}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        onKeyDown={onKeyDown}
      />
      {staleExpanded && <ul id={listId} role="listbox" aria-label="Fruit suggestions" hidden />}
      {open && !staleExpanded && (
        <div>
          {loading ? (
            <div id={listId} role="status">
              Loading…
            </div>
          ) : (
            <ul id={listId} role="listbox" aria-label={nameListbox ? 'Fruit suggestions' : undefined} style={{ listStyle: 'none', padding: 0 }}>
              {ITEMS.map((item, i) => (
                <li key={item} id={`${listId}-${i}`} role="option" aria-selected={i === active} onMouseDown={(e) => { e.preventDefault(); close(); }}>
                  {item}
                </li>
              ))}
            </ul>
          )}
          {srDismiss && (
            <span role="button" aria-label="Dismiss" style={{ ...SR_ONLY, cursor: 'pointer' }} onClick={close}>
              Dismiss
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export const CleanCombobox: Story = {
  name: 'Clean: combobox',
  render: () => <FxCombobox />,
  parameters: { a11y: { expect: { tree: [], auto: [] } } },
};

export const CleanSrDismiss: Story = {
  name: 'Clean: visually hidden Dismiss button (Base UI)',
  render: () => <FxCombobox defaultOpen srDismiss />,
  parameters: { a11y: { expect: { tree: [], auto: [] } } },
};

export const UnnamedListbox: Story = {
  name: 'Defect: listbox without a name',
  render: () => <FxCombobox defaultOpen nameListbox={false} />,
  parameters: { a11y: { expect: { tree: ['4.1.2: unnamed listbox'], auto: [] } } },
};

export const StaleExpanded: Story = {
  name: 'Defect: aria-expanded on a hidden popup',
  render: () => <FxCombobox staleExpanded />,
  parameters: { a11y: { expect: { tree: ['4.1.2: combobox "Fruit" is aria-expanded="true" but its popup'], auto: [] } } },
};

export const EscapeIgnored: Story = {
  name: "Defect: Escape doesn't close",
  render: () => <FxCombobox closesOnEscape={false} />,
  parameters: { a11y: { expect: { tree: [], auto: ['2.1.1: keys: combobox "Fruit": Escape'] } } },
};

export const LoadingUnlinked: Story = {
  name: 'Defect: loading popup without aria-controls',
  render: () => <FxCombobox defaultOpen loading linkPopup={false} />,
  parameters: { a11y: { expect: { tree: ['4.1.2: combobox "Fruit" is expanded but has no aria-controls'], auto: [] } } },
};

/** Chips of a multi-select: focusable from the input with ArrowLeft, removed with Backspace — but no role. */
function FxChips() {
  const [chips, setChips] = useState(['Apple', 'Banana']);
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const input = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label htmlFor="fx-chips">Fruit</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {chips.map((c, i) => (
          <span
            key={c}
            ref={(el) => {
              refs.current[i] = el;
            }}
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' || e.key === 'Delete') {
                setChips((all) => all.filter((x) => x !== c));
                input.current?.focus();
              }
            }}
          >
            {c}
          </span>
        ))}
        <input
          id="fx-chips"
          ref={input}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft' && !e.currentTarget.value) refs.current[chips.length - 1]?.focus();
          }}
        />
      </div>
    </div>
  );
}

export const ChipWithoutRole: Story = {
  name: 'Defect: chip without a role',
  render: () => <FxChips />,
  parameters: { a11y: { expect: { tree: ['4.1.2: focusable span "Apple" has no role', '4.1.2: focusable span "Banana" has no role'], auto: [] } } },
};

/** A filter button whose aria-expanded says closed while its dialog shows. */
function FxFilters() {
  return (
    <div>
      <button type="button" aria-haspopup="dialog" aria-expanded={false} aria-controls="fx-filters">
        Filters
      </button>
      <div id="fx-filters" role="dialog" aria-label="Filters">
        <label>
          <input type="checkbox" /> In stock
        </label>
      </div>
    </div>
  );
}

export const ExpandedFalseShown: Story = {
  name: 'Defect: aria-expanded="false" on a shown popup',
  render: () => <FxFilters />,
  parameters: { a11y: { expect: { tree: ['4.1.2: button "Filters" is aria-expanded="false" but its popup #fx-filters is shown'], auto: ['2.1.1: keys: button "Filters": Enter', '2.1.1: keys: dialog "Filters": Escape'] } } },
};

/** Tabs that are all tab stops and ignore the arrow keys. */
function FxTabs() {
  const [value, setValue] = useState(0);
  const tabs = ['Overview', 'Reviews', 'Specs'];
  return (
    <div>
      <div role="tablist" aria-label="Product">
        {tabs.map((t, i) => (
          <button key={t} type="button" role="tab" id={`fx-tab-${i}`} aria-selected={i === value} aria-controls={`fx-tabpanel-${i}`} onClick={() => setValue(i)}>
            {t}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t} role="tabpanel" id={`fx-tabpanel-${i}`} aria-labelledby={`fx-tab-${i}`} hidden={i !== value}>
          {t} content
        </div>
      ))}
    </div>
  );
}

export const TabsWithoutArrows: Story = {
  name: "Defect: arrow keys don't move between tabs",
  render: () => <FxTabs />,
  parameters: { a11y: { expect: { tree: [], auto: ['2.1.1: keys: tablist "Product": ArrowRight'] } } },
};

/** A menu button that closes on Escape but drops focus on <body>. */
function FxMenuButton() {
  const [open, setOpen] = useState(false);
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) first.current?.focus();
  }, [open]);
  return (
    <div>
      <button type="button" aria-haspopup="menu" aria-expanded={open} aria-controls="fx-menu" onClick={() => setOpen((o) => !o)}>
        Actions
      </button>
      {open && (
        <div
          id="fx-menu"
          role="menu"
          aria-label="Actions"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
        >
          <button ref={first} type="button" role="menuitem" onClick={() => setOpen(false)}>
            Rename
          </button>
          <button type="button" role="menuitem" tabIndex={-1} onClick={() => setOpen(false)}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export const MenuFocusLost: Story = {
  name: 'Defect: Escape drops focus instead of returning it',
  render: () => <FxMenuButton />,
  parameters: { a11y: { expect: { tree: [], auto: ['2.1.1: keys: button "Actions": focus is not back on the trigger after Escape'] } } },
};
