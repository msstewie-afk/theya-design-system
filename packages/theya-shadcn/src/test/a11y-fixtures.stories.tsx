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
  /** Typing filters the list. */
  filterable?: boolean;
  /** Defect: with no match the list is removed but aria-expanded stays "true" (aria-controls then points to nothing). */
  dropListWhenEmpty?: boolean;
}

/** A plain APG combobox (list autocomplete) with switchable defects. */
function FxCombobox({ defaultOpen = false, nameListbox = true, closesOnEscape = true, linkPopup = true, loading = false, staleExpanded = false, srDismiss = false, filterable = false, dropListWhenEmpty = false }: FxComboboxProps) {
  const id = useId();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(defaultOpen);
  const [active, setActive] = useState(-1);
  const [query, setQuery] = useState('');
  const items = filterable ? ITEMS.filter((i) => i.toLowerCase().startsWith(query.toLowerCase())) : ITEMS;
  // A correct combobox closes when nothing matches; the defect keeps it "expanded".
  const listOpen = open && !(filterable && !items.length);
  const close = () => {
    setOpen(false);
    setActive(-1);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      else if (!loading) setActive((a) => Math.min(a + 1, items.length - 1));
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
        aria-expanded={staleExpanded || (dropListWhenEmpty ? open : listOpen)}
        aria-controls={linkPopup ? listId : undefined}
        aria-activedescendant={listOpen && active >= 0 ? `${listId}-${active}` : undefined}
        onKeyDown={onKeyDown}
        value={filterable ? query : undefined}
        onChange={
          filterable
            ? (e) => {
                setQuery(e.target.value);
                setOpen(true);
                setActive(-1);
              }
            : undefined
        }
      />
      {staleExpanded && <ul id={listId} role="listbox" aria-label="Fruit suggestions" hidden />}
      {listOpen && !staleExpanded && (
        <div>
          {loading ? (
            <div id={listId} role="status">
              Loading…
            </div>
          ) : (
            <ul id={listId} role="listbox" aria-label={nameListbox ? 'Fruit suggestions' : undefined} style={{ listStyle: 'none', padding: 0 }}>
              {items.map((item, i) => (
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
  render: () => <FxCombobox filterable />,
  parameters: { a11y: { expect: { tree: [], auto: [], states: [] } } },
};

export const CleanSrDismiss: Story = {
  name: 'Clean: visually hidden Dismiss button (Base UI)',
  render: () => <FxCombobox defaultOpen srDismiss />,
  parameters: { a11y: { expect: { tree: [], auto: [], states: [] } } },
};

export const UnnamedListbox: Story = {
  name: 'Defect: listbox without a name',
  render: () => <FxCombobox defaultOpen nameListbox={false} />,
  parameters: { a11y: { expect: { tree: ['4.1.2: unnamed listbox'], auto: [], states: ['4.1.2: unnamed-popup: as rendered: shown listbox has no name'] } } },
};

export const StaleExpanded: Story = {
  name: 'Defect: aria-expanded on a hidden popup',
  render: () => <FxCombobox staleExpanded />,
  parameters: { a11y: { expect: { tree: [], auto: [], states: ['4.1.2: expanded-but-hidden: as rendered: combobox "Fruit" is aria-expanded="true" but its listbox is hidden'] } } },
};

export const EscapeIgnored: Story = {
  name: "Defect: Escape doesn't close",
  render: () => <FxCombobox closesOnEscape={false} />,
  parameters: { a11y: { expect: { tree: [], auto: [], states: ['2.1.1: keyboard-escape: combobox "Fruit": Escape doesn\'t close the popup'] } } },
};

export const LoadingUnlinked: Story = {
  name: 'Defect: loading popup without aria-controls',
  render: () => <FxCombobox defaultOpen loading linkPopup={false} />,
  parameters: { a11y: { expect: { tree: [], auto: [], states: ['4.1.2: expanded-without-controls: as rendered: combobox "Fruit" is expanded but has no aria-controls'] } } },
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
  parameters: { a11y: { expect: { tree: [], auto: [], states: ['4.1.2: focusable-generic: as rendered: focusable span "Apple" handles keys but has no role (and 1 more like it)'] } } },
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
  parameters: { a11y: { expect: { tree: [], auto: [], states: ['4.1.2: collapsed-but-shown: as rendered: button "Filters" is aria-expanded="false" but its popup is shown', '2.1.1: keyboard-escape: dialog "Filters": Escape doesn\'t close it'] } } },
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
  parameters: { a11y: { expect: { tree: [], auto: [], states: ['2.1.1: keyboard-arrows: tablist "Product": ArrowRight doesn\'t move focus to another tab'] } } },
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
  parameters: { a11y: { expect: { tree: [], auto: [], states: ['2.4.3: focus-return: button "Actions": after Escape focus is on the page, not back on the trigger'] } } },
};

export const NoMatchStale: Story = {
  name: 'Defect: no match removes the list but stays expanded',
  render: () => <FxCombobox filterable dropListWhenEmpty />,
  parameters: { a11y: { expect: { tree: [], auto: [], states: ['4.1.2: idref: combobox "Fruit" after typing "zqxjv" (no match): combobox "Fruit": aria-controls='] } } },
};

export const NameOnGeneric: Story = {
  name: 'Defect: aria-label on a div without a role',
  render: () => (
    <div aria-label="Gallery stats">
      <p>12 galleries, 340 photos</p>
    </div>
  ),
  parameters: { a11y: { expect: { tree: [], auto: [], states: ['4.1.2: name-on-generic: as rendered: div "Gallery stats"'] } } },
};

export const NestedControl: Story = {
  name: 'Defect: a button inside a menu item',
  render: () => (
    <div role="menu" aria-label="Photo">
      <div role="menuitem" tabIndex={-1}>
        Watermark <button type="button">Remove</button>
      </div>
    </div>
  ),
  parameters: { a11y: { expect: { tree: [], auto: [], states: ['4.1.2: nested-control: as rendered: button "Remove" sits inside menuitem'] } } },
};

export const BrokenLabelledby: Story = {
  name: 'Defect: aria-labelledby points to nothing',
  render: () => (
    <ul role="listbox" aria-labelledby="fx-missing-label" style={{ listStyle: 'none', padding: 0 }}>
      <li role="option" aria-selected>
        Basic
      </li>
    </ul>
  ),
  parameters: {
    a11y: {
      expect: {
        tree: ['4.1.2: unnamed listbox'],
        auto: [],
        states: ['4.1.2: idref: as rendered: listbox "Basic": aria-labelledby="fx-missing-label" points to nothing', '4.1.2: unnamed-popup: as rendered: shown listbox has no name'],
      },
    },
  },
};

/** A menu button that opens its menu but leaves focus on the button. */
function FxFocusStays() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="fx-sort"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
      >
        Sort
      </button>
      {open && (
        <div id="fx-sort" role="menu" aria-label="Sort">
          <div role="menuitem" tabIndex={-1}>
            Newest
          </div>
        </div>
      )}
    </div>
  );
}

export const FocusStaysOnTrigger: Story = {
  name: "Defect: focus doesn't move into the menu",
  render: () => <FxFocusStays />,
  parameters: { a11y: { expect: { tree: [], auto: [], states: ['2.4.3: focus-into-popup: button "Sort": focus stays on button "Sort", not in the menu it opens'] } } },
};

/** Opens on pointer down only: Enter does nothing. */
function FxClickOnly() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) first.current?.focus();
  }, [open]);
  return (
    <div>
      <button ref={trigger} type="button" aria-haspopup="dialog" aria-expanded={open} aria-controls="fx-share" onPointerDown={() => setOpen(true)} onMouseDown={(e) => e.preventDefault()}>
        Share
      </button>
      {open && (
        <div
          id="fx-share"
          role="dialog"
          aria-label="Share"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false);
              trigger.current?.focus();
            }
          }}
        >
          <button ref={first} type="button">
            Copy link
          </button>
        </div>
      )}
    </div>
  );
}

export const ClickOnly: Story = {
  name: 'Defect: opens on click but not on Enter',
  render: () => <FxClickOnly />,
  parameters: { a11y: { expect: { tree: [], auto: [], states: ['2.1.1: keyboard-open: button "Share": opens on click but not on Enter'] } } },
};

export const FocusableInHidden: Story = {
  name: 'Defect: a button inside aria-hidden',
  render: () => (
    <div>
      <p>Visible text</p>
      <div aria-hidden="true">
        <button type="button">Hidden action</button>
      </div>
    </div>
  ),
  parameters: { a11y: { expect: { tree: [], auto: [], states: ['4.1.2: focusable-in-hidden: as rendered: button "Hidden action" is focusable inside aria-hidden'] } } },
};

export const HaspopupMismatch: Story = {
  name: 'Defect: aria-haspopup="menu" opens a listbox',
  render: () => (
    <div>
      <button type="button" aria-haspopup="menu" aria-expanded aria-controls="fx-view">
        View
      </button>
      <ul id="fx-view" role="listbox" aria-label="View" style={{ listStyle: 'none', padding: 0 }}>
        <li role="option" aria-selected>
          Grid
        </li>
      </ul>
    </div>
  ),
  parameters: { a11y: { expect: { tree: [], auto: [], states: ['4.1.2: haspopup-role: as rendered: button "View" has aria-haspopup="menu" but its popup is a listbox'] } } },
};

/** Radix-style modal popup: the rest of the page is aria-hidden while focus is in the list. */
function FxModalPopup() {
  const option = useRef<HTMLDivElement>(null);
  useEffect(() => option.current?.focus(), []);
  return (
    <div>
      <div aria-hidden="true">
        <button type="button">Behind the popup</button>
      </div>
      <div role="listbox" aria-label="Plans">
        <div ref={option} role="option" tabIndex={0} aria-selected>
          Basic
        </div>
      </div>
    </div>
  );
}

export const CleanModalPopup: Story = {
  name: 'Clean: page aria-hidden behind a popup that holds focus (Radix)',
  render: () => <FxModalPopup />,
  parameters: { a11y: { expect: { tree: [], auto: [], states: [] } } },
};

export const CleanPopupShapes: Story = {
  name: 'Clean: empty open list, display:contents popup, menu named by an icon button',
  render: () => (
    <div>
      <label htmlFor="fx-empty">Search</label>
      <input id="fx-empty" role="combobox" aria-expanded aria-controls="fx-empty-list" readOnly />
      <ul id="fx-empty-list" role="listbox" aria-label="Results" style={{ margin: 0, padding: 0, height: 0 }} />
      <button type="button" aria-expanded aria-controls="fx-dial">
        Close actions
      </button>
      <div id="fx-dial" style={{ display: 'contents' }}>
        <div role="group" aria-label="Actions">
          <button type="button">Upload</button>
        </div>
      </div>
      <button type="button" id="fx-more" aria-label="More options" aria-haspopup="menu" aria-expanded aria-controls="fx-more-menu">
        ⋯
      </button>
      <div id="fx-more-menu" role="menu" aria-labelledby="fx-more">
        <div role="menuitem" tabIndex={-1}>
          Rename
        </div>
      </div>
    </div>
  ),
  parameters: { a11y: { expect: { tree: [], auto: [], states: [] } } },
};

export const CleanTreeAndModal: Story = {
  name: 'Clean: nested tree items, a dialog that hides the page without focus in it',
  render: () => (
    <div>
      <div aria-hidden="true">
        <button type="button">Behind the dialog</button>
      </div>
      <div role="dialog" aria-label="Rename">
        <ul role="tree" aria-label="Folders" style={{ listStyle: 'none', padding: 0 }}>
          <li role="treeitem" aria-expanded aria-selected={false} tabIndex={-1}>
            Clients
            <ul role="group" style={{ listStyle: 'none' }}>
              <li role="treeitem" aria-selected={false} tabIndex={-1}>
                Rhea &amp; Theo
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  ),
  // The dialog can't be closed here: Escape is the dialog fixtures' business.
  parameters: { a11y: { states: { skip: ['keyboard'], reason: 'Static dialog.' }, expect: { tree: [], auto: [], states: [] } } },
};
