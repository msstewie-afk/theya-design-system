import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

/**
 * W3C ACT Rules test cases as calibration fixtures: the "golden set" the
 * WAI ACT Task Force publishes for each rule, for the rules our own scripts
 * implement (axe-core is calibrated against ACT by Deque). Each story is one
 * test case, transcribed to JSX as close to the original HTML as React
 * allows; its name gives the rule id and the case.
 *
 * - 2ee8b8 Visible label is part of accessible name → a11y-auto 2.5.3
 * - 6cfa84 Element with aria-hidden has no content in sequential focus
 *   navigation → a11y-states focusable-in-hidden (4.1.2)
 * - 80af7b Focusable element has no keyboard trap → a11y-auto 2.1.2
 * - oj04fd Element in sequential focus order has visible focus → a11y-auto 2.4.7
 *
 * A "Passed" or "Inapplicable" case must produce no finding for the rule; a
 * "Failed" case must be caught. Expectations for the other scripts are what
 * they correctly report on the same markup (a positive tabindex is a 2.4.3
 * finding even where 80af7b passes it).
 *
 * Source: https://www.w3.org/WAI/standards-guidelines/act/rules/ (fetched 2026-11-16).
 * Cases left out need assets or scripts we can't reproduce here (icon
 * fonts, the focus-sentinel and Ctrl+M keyboard.js cases).
 */
const meta: Meta = {
  title: 'Internal/ACT rules',
  tags: ['!dev', '!autodocs', 'a11y-fixture'],
  decorators: [
    (Story) => (
      <div style={{ font: '16px/1.5 system-ui, sans-serif', display: 'grid', gap: 12, maxWidth: 420 }}>
        <style>{`.act-no-focus:focus, .act-no-focus:focus-visible { outline: none !important; box-shadow: none !important; }`}</style>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj;

const clean: Record<string, string[]> = { tree: [], auto: [], states: [], forced: [] };
const expect = (e: Record<string, string[]>) => ({ a11y: { expect: { ...clean, ...e } } });

/* ---------- 2ee8b8 Visible label is part of accessible name (a11y-auto 2.5.3) ---------- */

export const LabelInNamePassed1: Story = {
  name: 'ACT 2ee8b8 Passed 1: link text matches its name',
  render: () => (
    <a href="https://act-rules.github.io/" aria-label="ACT rules">
      ACT rules
    </a>
  ),
  parameters: expect({}),
};
export const LabelInNamePassed2: Story = {
  name: 'ACT 2ee8b8 Passed 2: name with trailing whitespace',
  render: () => (
    <a href="https://act-rules.github.io/" aria-label="  ACT rules  ">
      ACT rules
    </a>
  ),
  parameters: expect({}),
};
export const LabelInNamePassed3: Story = {
  name: 'ACT 2ee8b8 Passed 3: name in another case',
  render: () => (
    <a href="https://act-rules.github.io/" aria-label="act rules">
      ACT rules
    </a>
  ),
  parameters: expect({}),
};
export const LabelInNamePassed4: Story = {
  name: 'ACT 2ee8b8 Passed 4: visible text contained in the name',
  render: () => <button aria-label="Next Page in the list">Next Page</button>,
  parameters: expect({}),
};
export const LabelInNamePassed5: Story = {
  name: 'ACT 2ee8b8 Passed 5: visible "X" is non-text content',
  render: () => <button aria-label="close">X</button>,
  parameters: expect({}),
};
export const LabelInNameFailed1: Story = {
  name: 'ACT 2ee8b8 Failed 1: link text differs from its name',
  render: () => (
    <a href="https://act-rules.github.io/" aria-label="WCAG">
      ACT rules
    </a>
  ),
  // axe's experimental label-content-name-mismatch agrees (advisory).
  parameters: expect({ auto: ['2.5.3: "ACT rules" not in name "WCAG"', 'advisory: label-content-name-mismatch'] }),
};
export const LabelInNameFailed2: Story = {
  name: 'ACT 2ee8b8 Failed 2: visible text only partly in the name',
  render: () => <button aria-label="the full">The full label</button>,
  parameters: expect({ auto: ['2.5.3: "The full label" not in name "the full"', 'advisory: label-content-name-mismatch'] }),
};
export const LabelInNameFailed3: Story = {
  name: 'ACT 2ee8b8 Failed 3: math symbols written out in the name',
  render: () => (
    <a href="/" aria-label="Proof of two multiplied by two is four">
      Proof of 2&times;2=4
    </a>
  ),
  parameters: expect({ auto: ['2.5.3: "Proof of 2×2=4" not in name', 'advisory: label-content-name-mismatch'] }),
};
export const LabelInNameInapplicable2: Story = {
  name: 'ACT 2ee8b8 Inapplicable 2: text field shows its value, not its label',
  render: () => (
    <div>
      <div>E-mail</div>
      <input type="email" aria-label="E-mail" defaultValue="Contact" />
    </div>
  ),
  parameters: expect({}),
};

/* ---------- 6cfa84 aria-hidden has no focusable content (a11y-states) ---------- */

export const AriaHiddenPassed1: Story = {
  name: 'ACT 6cfa84 Passed 1: non-focusable paragraph',
  render: () => <p aria-hidden="true">Some text</p>,
  parameters: expect({}),
};
export const AriaHiddenPassed2: Story = {
  name: 'ACT 6cfa84 Passed 2: link hidden with display:none',
  render: () => (
    <div aria-hidden="true">
      <a href="/" style={{ display: 'none' }}>
        Link
      </a>
    </div>
  ),
  parameters: expect({}),
};
export const AriaHiddenPassed3: Story = {
  name: 'ACT 6cfa84 Passed 3: disabled input',
  render: () => <input disabled aria-hidden="true" />,
  parameters: expect({}),
};
export const AriaHiddenPassed5: Story = {
  name: 'ACT 6cfa84 Passed 5: button out of the tab order',
  render: () => (
    <div aria-hidden="true">
      <button tabIndex={-1}>Some button</button>
    </div>
  ),
  parameters: expect({}),
};
export const AriaHiddenPassed6: Story = {
  name: 'ACT 6cfa84 Passed 6: hidden svg inside a link',
  render: () => (
    <a href="#">
      <svg width="16" height="16" aria-hidden="true">
        <circle cx="8" cy="11" r="4" stroke="black" strokeWidth="2" fill="transparent" />
      </svg>
      Hello ACT
    </a>
  ),
  parameters: expect({}),
};
export const AriaHiddenFailed1: Story = {
  name: 'ACT 6cfa84 Failed 1: link positioned off screen',
  render: () => (
    <div aria-hidden="true">
      <a href="/" style={{ position: 'absolute', top: '-999em' }}>
        Link
      </a>
    </div>
  ),
  parameters: expect({ states: ['4.1.2: focusable-in-hidden: as rendered: link "Link" is focusable inside aria-hidden'] }),
};
export const AriaHiddenFailed2: Story = {
  name: 'ACT 6cfa84 Failed 2: aria-disabled instead of disabled',
  render: () => (
    <div aria-hidden="true">
      <input aria-disabled="true" />
    </div>
  ),
  parameters: expect({ states: ['4.1.2: focusable-in-hidden: as rendered: textbox'] }),
};
export const AriaHiddenFailed3: Story = {
  name: 'ACT 6cfa84 Failed 3: aria-hidden="false" inside aria-hidden="true"',
  render: () => (
    <div aria-hidden="true">
      <div aria-hidden="false">
        <button>Some button</button>
      </div>
    </div>
  ),
  parameters: expect({ states: ['4.1.2: focusable-in-hidden: as rendered: button "Some button" is focusable inside aria-hidden'] }),
};
export const AriaHiddenFailed4: Story = {
  name: 'ACT 6cfa84 Failed 4: focusable paragraph with aria-hidden',
  render: () => (
    <p tabIndex={0} aria-hidden="true">
      Some text
    </p>
  ),
  parameters: expect({ states: ['4.1.2: focusable-in-hidden: as rendered: p "Some text" is focusable inside aria-hidden'] }),
};
export const AriaHiddenFailed5: Story = {
  name: 'ACT 6cfa84 Failed 5: summary inside a hidden details',
  render: () => (
    <details aria-hidden="true">
      <summary>Some button</summary>
      <p>Some details</p>
    </details>
  ),
  parameters: expect({ states: ['4.1.2: focusable-in-hidden: as rendered: button "Some button" is focusable inside aria-hidden'] }),
};

/* ---------- 80af7b Focusable element has no keyboard trap (a11y-auto 2.1.2) ---------- */

export const NoTrapPassed1: Story = {
  name: 'ACT 80af7b Passed 1: plain link and button',
  render: () => (
    <div>
      <a href="#">Link 1</a> <button>Button1</button>
    </div>
  ),
  parameters: expect({}),
};
export const NoTrapPassed2: Story = {
  name: 'ACT 80af7b Passed 2: div with tabindex="1"',
  render: () => <div tabIndex={1}>Text</div>,
  // No trap (the ACT verdict); the positive tabindex is our own 2.4.3 finding.
  parameters: expect({ auto: ['2.4.3: div "Text" has tabindex=1'] }),
};

/** Re-focuses itself on blur (ACT 80af7b Failed 1 and 3). */
function Sticky({ children }: { children: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button ref={ref} onBlur={() => setTimeout(() => ref.current?.focus(), 10)}>
      {children}
    </button>
  );
}

export const NoTrapFailed1: Story = {
  name: 'ACT 80af7b Failed 1: button takes focus back on blur',
  render: () => (
    <div>
      <a href="#">Link 1</a> <Sticky>Button1</Sticky>
    </div>
  ),
  parameters: expect({ auto: ['2.1.2: Tab cycles and neither Escape nor Shift+Tab leaves it'] }),
};
export const NoTrapFailed3: Story = {
  name: 'ACT 80af7b Failed 3: a trap between two buttons',
  render: () => (
    <div>
      <Sticky>Button 1</Sticky>
      <button>Button 2</button>
      <Sticky>Button 3</Sticky>
    </div>
  ),
  parameters: expect({ auto: ['2.1.2: Tab cycles and neither Escape nor Shift+Tab leaves it'] }),
};

/* ---------- oj04fd Element in sequential focus order has visible focus (a11y-auto 2.4.7) ---------- */

export const FocusVisiblePassed1: Story = {
  name: 'ACT oj04fd Passed 1: default focus outline',
  render: () => (
    <div>
      <a href="https://act-rules.github.io/">ACT rules</a> <button>Dummy button</button>
    </div>
  ),
  parameters: expect({}),
};
export const FocusVisiblePassed2: Story = {
  name: 'ACT oj04fd Passed 2: focusable span with the default outline',
  render: () => (
    <div>
      <span tabIndex={0}>Act rules</span> <button>Dummy button</button>
    </div>
  ),
  parameters: expect({}),
};

function ParentIndicator() {
  const [on, setOn] = useState(false);
  return (
    <div>
      <span style={{ border: `2px solid ${on ? 'black' : 'transparent'}`, padding: 2 }}>
        <a className="act-no-focus" href="https://act-rules.github.io/" onFocus={() => setOn(true)} onBlur={() => setOn(false)}>
          ACT rules
        </a>
      </span>{' '}
      <button>Dummy button</button>
    </div>
  );
}

export const FocusVisiblePassed3: Story = {
  name: "ACT oj04fd Passed 3: the link's parent shows a border",
  render: () => <ParentIndicator />,
  // Passes ACT in normal colors. In forced colors a transparent border is
  // painted like any other, so the indicator is there focused or not: our
  // forced-colors check rightly reports it.
  parameters: expect({ forced: ['focus-invisible: a "ACT rules" looks the same focused and blurred in forced colors'] }),
};
export const FocusVisibleFailed1: Story = {
  name: 'ACT oj04fd Failed 1: the outline is removed',
  render: () => (
    <div>
      <a className="act-no-focus" href="https://act-rules.github.io/">
        ACT rules
      </a>
      <button className="act-no-focus">Dummy button</button>
    </div>
  ),
  parameters: expect({
    auto: ['2.4.7: a "ACT rules"', '2.4.7: button "Dummy button"'],
    // In forced colors the button still changes on focus: Theya's forced-colors
    // edge (an outline) goes away. A change is visible focus; the link has none.
    forced: ['focus-invisible: a "ACT rules"'],
  }),
};
