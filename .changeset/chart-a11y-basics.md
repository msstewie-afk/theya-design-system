---
'@theya/shadcn': minor
---

Charts: accessibility basics.

- LineChart and AreaChart without an `ariaLabel` now announce each series' first value, last value and peak (new locale key `chart.range`, in all five locales), not only the number of points.
- LineChart, AreaChart, BarChart and Sparkline no longer add an empty Tab stop: recharts' focusable `svg[role=application]` sat inside the chart's `role="img"`, where screen readers announce nothing. Same as DonutChart already did.
- In Windows High Contrast the legend and tooltip color keys of LineChart, AreaChart and DonutChart stay visible (`forced-color-adjust: none`); before, they were wiped while the lines kept their colors, so series couldn't be matched to names.
