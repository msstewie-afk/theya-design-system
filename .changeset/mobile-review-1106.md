---
"@theya/shadcn": minor
---

Mobile review (Maria, 6.11):

- Stepper and OnboardingWizard: new default `orientation="auto"` — horizontal, but vertical on phones (under 640px) with more than two steps, or whenever the steps don't fit. Pass `horizontal` for the old behaviour.
- TabsList: when tabs don't fit, the list shows a chevron on the side that has more; it scrolls by most of a width.
- SecretField grows when a long key wraps, with the reveal / copy buttons on the first line.
- TagInput: danger text and placeholder color in the error state, like the other fields.
- DashboardOverview: the attention count sits on the title line, warning icons on the reason's first line, and the healthy state is an Alert.
- SearchNoResults / ResultList: titles centered on their icons; LoginForm: no hidden header above the fields; Comparison tray: one pick per row on phones.
