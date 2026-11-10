---
'@theya/shadcn': patch
---

OptionCard: multiple choice. `<OptionCardGroup type="multiple">` takes `value` / `defaultValue` / `onValueChange` as `string[]`; the group is a `role="group"` and each card a `role="checkbox"` button with `aria-checked` and a square check indicator (same card look otherwise). Tab moves between cards, Space toggles. On an OptionCard, `exclusive` makes a "None of these" that clears the others and is cleared by them, and `excludes={['less-protein']}` makes two cards mutually exclusive (from either side). `disabled` works per card or on the group. The single-choice mode is unchanged.
