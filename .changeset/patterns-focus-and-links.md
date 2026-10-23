---
'@theya/shadcn': patch
---

Accessibility fixes in patterns, found while writing their guidelines:
- Focus no longer drops to the page when the control people used disappears (WCAG 2.4.3): SavedItems, OrderHistory, SearchResults, Comparison, FacetedList, Reviews, Cart, Checkout and CancellationFlow move it to the next item, the new view or the result.
- CompletionScreen: new `focusOnMount` prop — the title takes focus when the screen appears. Checkout and CancellationFlow use it.
- Cart announces an applied or removed promo code (4.1.3). Reviews reads “★” as “star” and keeps “Show all” out of the live count.
- Links inside sentences are one weight step heavier (`font-semibold`) in SignUpForm, NoResults, SearchResults and LoginForm, so they don't rely on color alone (1.4.1). Link's docs now allow either `underline` or the heavier weight in running text.
- MegaMenu: the current section is marked by a fill as well as color; drawer column titles are headings that name their lists.
- LoginFormSplit: the carousel doesn't autoplay under reduced motion, holds on hover and focus, and has a Pause / Play button (2.2.2).
- PasswordStrengthMeter: strength bands scale with the number of rules, so “Good” is reachable with 2–4 rules. Five rules read as before.
- CancellationFlow no longer renders a stray “0” for `pauseMonths={0}`.
