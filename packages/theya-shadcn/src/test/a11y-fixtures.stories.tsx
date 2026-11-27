import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';

/**
 * Calibration fixtures for scripts/a11y-tree.mjs and scripts/a11y-auto.mjs:
 * small widgets with one known defect each, plus clean controls. The scripts'
 * `--fixtures` mode runs only these and fails unless every defect is caught
 * and the clean ones report nothing (pnpm a11y:calibrate, and in CI).
 *
 * 1.4.13 (content on hover or focus) and 2.4.11 (focus not obscured) fixtures
 * follow the corporate design system's coverage review (2026-11-16): both
 * were left to manual review before.
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

/* ---------- 1.4.13 Content on Hover or Focus ---------- */

interface FxHintProps {
  /** Defect when false: Escape doesn't close the hint. */
  escape?: boolean;
  /** Defect when > 0: the hint closes by itself after this many ms. */
  timeout?: number;
}

/** A hand-made hint: shows on hover or focus, the pointer can move onto it (one wrapper). */
function FxHint({ escape = true, timeout = 0 }: FxHintProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && escape && setOpen(false);
    document.addEventListener('keydown', onKey);
    const t = timeout ? window.setTimeout(() => setOpen(false), timeout) : 0;
    return () => {
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
    };
  }, [open, escape, timeout]);
  return (
    <span style={{ position: 'relative', display: 'inline-block' }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" data-state={open ? 'open' : 'closed'} aria-describedby={open ? id : undefined} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
        Shipping
      </button>
      {open && (
        <span id={id} role="tooltip" style={{ position: 'absolute', top: '100%', left: 0, width: 200, padding: 8, background: 'Canvas', border: '1px solid' }}>
          Free over 50 euros
        </span>
      )}
    </span>
  );
}

export const CleanTooltip: Story = {
  name: 'Clean: Radix tooltip (Escape, hoverable, persistent)',
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button">Shipping</button>
      </TooltipTrigger>
      <TooltipContent>Free over 50 euros</TooltipContent>
    </Tooltip>
  ),
  parameters: { a11y: { expect: { tree: [], auto: [], states: [] } } },
};

export const HintNotHoverable: Story = {
  name: 'Defect: tooltip that closes when the pointer moves onto it',
  render: () => (
    <Tooltip disableHoverableContent>
      <TooltipTrigger asChild>
        <button type="button">Shipping</button>
      </TooltipTrigger>
      <TooltipContent>Free over 50 euros</TooltipContent>
    </Tooltip>
  ),
  parameters: { a11y: { expect: { tree: [], auto: [], states: ['1.4.13: hover-hoverable: button "Shipping": its content closes when the pointer moves onto it'] } } },
};

export const HintNoEscape: Story = {
  name: "Defect: hint that Escape doesn't close",
  render: () => <FxHint escape={false} />,
  parameters: {
    a11y: {
      expect: {
        tree: [],
        auto: [],
        states: ['1.4.13: hover-dismiss: button "Shipping": Escape doesn\'t close the content it shows on focus', '1.4.13: hover-dismiss: button "Shipping": Escape doesn\'t close the content it shows on hover'],
      },
    },
  },
};

export const HintTimesOut: Story = {
  name: 'Defect: hint that closes by itself',
  render: () => <FxHint timeout={900} />,
  parameters: { a11y: { expect: { tree: [], auto: [], states: ['1.4.13: hover-persistent: button "Shipping": its content closes by itself while the pointer is on it'] } } },
};

/* ---------- 2.4.11 Focus Not Obscured ---------- */

function FxStickyBar({ padded }: { padded?: boolean }) {
  return (
    <div style={{ height: 220, overflow: 'auto', border: '1px solid', scrollPaddingBottom: padded ? 72 : undefined }}>
      <div style={{ display: 'grid', gap: 8, padding: 8 }}>
        {['Rice', 'Oats', 'Carrots', 'Pumpkin', 'Chicken', 'Salmon', 'Yoghurt', 'Banana', 'Bread', 'Eggs'].map((f) => (
          <button type="button" key={f}>
            Add {f}
          </button>
        ))}
      </div>
      <div style={{ position: 'sticky', bottom: 0, height: 64, background: 'Canvas', borderTop: '1px solid' }}>
        <p style={{ margin: 8 }}>3 items in your plan</p>
      </div>
    </div>
  );
}

export const StickyBarHidesFocus: Story = {
  name: 'Defect: sticky bar hides the focused button',
  render: () => <FxStickyBar />,
  parameters: { a11y: { expect: { tree: [], auto: ['2.4.11: button "Add Salmon": hidden under a sticky div', '2.4.11: button "Add Yoghurt": hidden under a sticky div', '2.4.11: button "Add Eggs": hidden under a sticky div'], states: [] } } },
};

export const CleanStickyBar: Story = {
  name: 'Clean: sticky bar with scroll-padding',
  render: () => <FxStickyBar padded />,
  parameters: { a11y: { expect: { tree: [], auto: [], states: [] } } },
};

/* ---------- 3.2.2 On Input ---------- */

export const CleanInputs: Story = {
  name: 'Clean: a field and a checkbox that change nothing else',
  render: () => (
    <div>
      <label htmlFor="fx-portion">Portion, g</label>
      <input id="fx-portion" />
      <label>
        <input type="checkbox" /> Low fibre only
      </label>
    </div>
  ),
  parameters: { a11y: { expect: { tree: [], auto: [], states: [] } } },
};

/** Defect: the code field jumps to the next one after two characters. */
function FxAutoAdvance() {
  const next = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label htmlFor="fx-code-a">Code, first part</label>
      <input id="fx-code-a" maxLength={2} onChange={(e) => e.target.value.length === 2 && next.current?.focus()} />
      <label htmlFor="fx-code-b">Code, second part</label>
      <input id="fx-code-b" ref={next} />
    </div>
  );
}

export const InputMovesFocus: Story = {
  name: 'Defect: typing moves focus to another field',
  render: () => <FxAutoAdvance />,
  parameters: { a11y: { expect: { tree: [], auto: [], states: ['3.2.2: input-change: textbox "Code, first part": typing in it moves focus to textbox "Code, second part"'] } } },
};

/** Defect: ticking the checkbox opens a dialog. */
function FxToggleDialog() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <label>
        <input type="checkbox" onChange={(e) => setOpen(e.target.checked)} /> Share my plan
      </label>
      {open && (
        <div role="dialog" aria-label="Share">
          <p>Who can see it?</p>
        </div>
      )}
    </div>
  );
}

export const ToggleOpensDialog: Story = {
  name: 'Defect: toggling a checkbox opens a dialog',
  render: () => <FxToggleDialog />,
  // The dialog it opens is the defect here, not the dialog keyboard pattern.
  parameters: { a11y: { expect: { tree: [], auto: [], states: ['3.2.2: input-change: checkbox "Share my plan": toggling it opens a dialog'] } } },
};

/* ---------- Advisory: experimental axe rules ---------- */

export const AdvisoryParagraphHeading: Story = {
  name: 'Advisory: a bold paragraph used as a heading',
  render: () => (
    <div>
      <p style={{ fontWeight: 700, fontSize: 22 }}>Breakfast</p>
      <p>Soft oats with banana, about 250 g.</p>
      <p>Plain yoghurt, 150 g.</p>
    </div>
  ),
  parameters: { a11y: { expect: { tree: [], auto: ['advisory: p-as-heading'], states: [] } } },
};

/* ---------- Forced colors (a11y-forced) ---------- */

const MASK_ICON = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M2 8h12M8 2v12" stroke="black" stroke-width="3"/></svg>')}")`;

export const CleanForcedColors: Story = {
  name: 'Clean: native controls, bordered fields, currentColor icon (forced colors)',
  render: () => (
    <div>
      <label>
        <input type="checkbox" defaultChecked /> Soft foods
      </label>
      <label>
        <input type="checkbox" /> Spicy
      </label>
      <label htmlFor="fx-fc-note">Note</label>
      <input id="fx-fc-note" />
      <label htmlFor="fx-fc-tags">Tags</label>
      {/* A borderless field inside a bordered box: the box is its edge. */}
      <style>{'.fx-box:focus-within { outline: 2px solid; outline-offset: 2px; }'}</style>
      <div className="fx-box" style={{ border: '1px solid', padding: 4 }}>
        <input id="fx-fc-tags" style={{ border: 0, outline: 'none' }} />
      </div>
      <button type="button" aria-label="Add">
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M2 8h12M8 2v12" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
    </div>
  ),
  parameters: { a11y: { expect: { tree: [], auto: [], states: [], forced: [] } } },
};

export const FillOnlyControls: Story = {
  name: 'Defect: controls and an icon drawn only with fills (forced colors)',
  render: () => (
    <div>
      <style>{`
        .fx-fill-check { width: 20px; height: 20px; border: 0; border-radius: 4px; background: #2743e8; padding: 0; }
        .fx-fill-check[aria-checked=false] { background: #c9cede; }
        .fx-fill-check:focus-visible { outline: none !important; box-shadow: 0 0 0 3px #2743e8; }
        @media (forced-colors: active) { .fx-fill-check { outline: none !important; } }
        .fx-mask { display: inline-block; width: 16px; height: 16px; background-color: currentColor; mask: ${MASK_ICON} center / contain no-repeat; }
      `}</style>
      <span>
        <button type="button" role="checkbox" aria-checked="true" aria-label="Soft foods" className="fx-fill-check" />
        <button type="button" role="checkbox" aria-checked="false" aria-label="Spicy" className="fx-fill-check" />
      </span>
      <p>
        <span className="fx-mask" /> Added to your plan
      </p>
    </div>
  ),
  parameters: {
    a11y: {
      // Unnamed fills on purpose: the forced-colors defects are the point here.
      expect: {
        tree: [],
        auto: [],
        states: [],
        forced: [
          'invisible-control: checkbox "Soft foods"',
          'invisible-control: checkbox "Spicy"',
          'icon-lost: mask icon span',
          'checked-same: checkbox "Soft foods"',
          'focus-invisible: checkbox "Soft foods"',
          'focus-invisible: checkbox "Spicy"',
        ],
      },
    },
  },
};

/* ---------- 1.4.10 Reflow (a11y-auto, 320px viewport) ---------- */

/** Defect: a fixed-width box wider than the 320px viewport forces horizontal scrolling. */
export const FixedWidthOverflows: Story = {
  name: 'Defect: fixed-width box scrolls sideways at 320px',
  render: () => (
    <div style={{ width: 600, border: '1px solid', padding: 8 }}>
      This box is 600px wide at every viewport, so at 320px the page scrolls sideways.
    </div>
  ),
  parameters: { a11y: { expect: { tree: [], auto: ['1.4.10: page scrolls horizontally at 320px'], states: [] } } },
};

/** A data table may scroll horizontally: two-dimensional content is the criterion's own exception. */
export const CleanWideTable: Story = {
  name: 'Clean: data table scrolls inside its own box',
  render: () => (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: 600 }}>
        <caption>Monthly totals</caption>
        <thead>
          <tr>
            <th>Month</th>
            <th>Orders</th>
            <th>Revenue</th>
            <th>Refunds</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>January</td>
            <td>120</td>
            <td>4 180</td>
            <td>6</td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
  parameters: { a11y: { expect: { tree: [], auto: [], states: [] } } },
};

/* ---------- 3.2.1 On Focus (a11y-auto, Tab pass) ---------- */

/** Defect: merely focusing the field navigates (here: a hash change stands in for it). */
export const FocusNavigates: Story = {
  name: 'Defect: focusing a field changes the URL',
  render: () => (
    <div>
      {/* Visible text naming the field, so the 3.3.2 pass stays quiet: this fixture is about 3.2.1. */}
      <span>Promo code</span>
      <input
        aria-label="Promo code"
        onFocus={() => {
          location.hash = '#promo-opened';
        }}
      />
      <button type="button">Apply</button>
    </div>
  ),
  parameters: { a11y: { expect: { tree: [], auto: ['3.2.1: focusing input "Promo code" changes the URL'], states: [] } } },
};

/** Clean: a combobox that shows its own popup on focus changes content, not context. */
function FxOpensOwnPopup() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <span>City</span>
      <input
        role="combobox"
        aria-label="City"
        aria-expanded={open}
        aria-controls="fx-city-popup"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
      />
      {open && (
        <div id="fx-city-popup" role="dialog" aria-label="Cities">
          Recent: Sofia, Plovdiv
        </div>
      )}
      <button type="button">Search</button>
    </div>
  );
}
/** Defect: focusing a field opens a modal dialog and takes focus into it. */
function FxFocusOpensModal() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <span>Coupon</span>
      <input aria-label="Coupon" onFocus={() => setOpen(true)} />
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Sign in first">
          <button type="button" autoFocus onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}
export const FocusOpensModal: Story = {
  name: 'Defect: focusing a field opens a modal dialog',
  render: () => <FxFocusOpensModal />,
  parameters: { a11y: { expect: { tree: [], auto: ['3.2.1: focusing button "Close" opens a dialog', '2.1.1: not reached by Tab: input "Coupon"'], states: [] } } },
};

export const OpensOwnPopup: Story = {
  name: 'Clean: a combobox shows its own popup on focus',
  render: () => <FxOpensOwnPopup />,
  parameters: { a11y: { expect: { tree: [], auto: [], states: [] } } },
};

/* 1.4.1 Use of Color: links inside a run of text (F73, G183). The paragraphs pin their colours
   on a white ground, so the dark theme does not read them as text-contrast failures. */
export const LinkColorOnly: Story = {
  name: 'Defect: a link in text told apart by colour only',
  render: () => (
    <p style={{ color: '#333333', background: '#ffffff' }}>
      Read the{' '}
      <a href="#terms" style={{ color: '#2a4d8f', textDecoration: 'none' }}>
        terms
      </a>{' '}
      before you sign.
    </p>
  ),
  parameters: { a11y: { expect: { tree: [], auto: ['1.4.1: link "terms"'], states: [] } } },
};
export const LinkNoHoverCue: Story = {
  name: 'Defect: a link at 3:1 against the text, nothing on hover',
  render: () => (
    <p style={{ color: '#000000', background: '#ffffff' }}>
      Read the{' '}
      <a href="#terms" style={{ color: '#0b6bcb', textDecoration: 'none' }}>
        terms
      </a>{' '}
      before you sign.
    </p>
  ),
  parameters: { a11y: { expect: { tree: [], auto: ['1.4.1: link "terms"', 'nothing changes on hover'], states: [] } } },
};
export const LinkCues: Story = {
  name: 'Clean: underlined, bold, and 3:1 with an underline on hover',
  render: () => (
    <>
      <style>{'.fx-hover-link { color: #0b6bcb; text-decoration: none; } .fx-hover-link:hover { text-decoration: underline; }'}</style>
      <p style={{ color: '#333333', background: '#ffffff' }}>
        Read the{' '}
        <a href="#terms" style={{ textDecoration: 'underline' }}>
          terms
        </a>{' '}
        before you sign.
      </p>
      <p style={{ color: '#333333', background: '#ffffff' }}>
        Read the{' '}
        <a href="#privacy" style={{ color: '#2a4d8f', textDecoration: 'none', fontWeight: 700 }}>
          privacy notice
        </a>{' '}
        too.
      </p>
      <p style={{ color: '#000000', background: '#ffffff' }}>
        Or ask{' '}
        <a href="#support" className="fx-hover-link">
          support
        </a>{' '}
        for help.
      </p>
    </>
  ),
  parameters: { a11y: { expect: { tree: [], auto: [], states: [] } } },
};

/** Defect (Theya rule): a whole sentence as the link, underlined. */
export const LinkTooLong: Story = {
  name: 'Defect: a link in a sentence longer than three words',
  render: () => (
    <p style={{ color: '#333333', background: '#ffffff' }}>
      Before you sign,{' '}
      <a href="#terms" style={{ textDecoration: 'underline' }}>
        read the full terms of the service
      </a>
      .
    </p>
  ),
  parameters: { a11y: { expect: { tree: [], auto: ['1.4.1: link "read the full terms of the service" in a sentence is 7 words'], states: [] } } },
};

/* 3.3.2 Labels or Instructions: something on screen says what goes in each field. */
export const PlaceholderOnly: Story = {
  name: 'Defect: a field labelled only by its placeholder',
  render: () => <input aria-label="Email" placeholder="you@example.com" />,
  parameters: { a11y: { expect: { tree: [], auto: ['3.3.2: input placeholder "you@example.com"'], states: [] } } },
};
export const AriaLabelOnly: Story = {
  name: 'Defect: a field named only by aria-label',
  render: () => <input aria-label="Promo code" />,
  parameters: { a11y: { expect: { tree: [], auto: ['3.3.2: input "promo code": named only by aria-label'], states: [] } } },
};
export const VisibleLabels: Story = {
  name: 'Clean: a label element, a search field beside its button, a search field with a magnifier',
  render: () => (
    <>
      <label htmlFor="fx-name">Full name</label>
      <input id="fx-name" />
      <div role="search">
        <input aria-label="Search" type="search" />
        <button type="button">Search</button>
      </div>
      {/* Accepted deviation (Мария, 2026-11-26): a magnifier icon and a placeholder. */}
      <div data-slot="fx-search">
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">
          <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" />
        </svg>
        <input aria-label="Search galleries" placeholder="Search galleries" />
      </div>
    </>
  ),
  parameters: { a11y: { expect: { tree: [], auto: [], states: [] } } },
};
