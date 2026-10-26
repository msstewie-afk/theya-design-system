---
"@theya/shadcn": patch
---

Non-text contrast and state cues (WCAG 1.4.11 / 1.4.1):
- Calendar (and DatePicker, DateRangePicker, DateTimePicker), Stepper, Scheduler: in dark theme the blue selected / current / today fill gets a 1px light primary edge, as Checkbox. Mid-range days in Calendar carry a primary line above and below.
- Scheduler: the "now" line uses icon-danger; the phone week list shows "· Today" next to the current day.
- Meter, ProgressRing, Sparkline (and DataTableCell kind="sparkline"): fills and strokes use icon-* tones. Meter's warning stays yellow in light theme (recorded deviation).
- ChartRangeSelection: the selected range is outlined with border-primary at full opacity.
- RangeField: histogram bars are border (out of range) and icon-primary (in range).
- UsageBar: segments are separated by a 2px gap; purple 500 -> 400.
- SwatchPicker: selection ring uses border-primary. ColorPicker / SwatchPicker: thumb and slash outline referenced a missing token (--black-a300), so it never rendered; now gray-400.
- ProductTour: 2px primary outline around the spotlight.
- UndoToast: drain bar at 60% of the text color (was 30%).
- Tabs chips: the active chip is semibold.
- RichTextEditor: a pressed format button looks like an on outlined Toggle (tonal fill, primary icon, primary outline).
- FeedbackWidget: a picked reason chip shows a check icon.
