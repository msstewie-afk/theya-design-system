---
"@theya/shadcn": minor
---

Right-to-left layouts. Components use logical utilities (ms/me, ps/pe, start/end, text-start/end, border-s/e, rounded-s/e) so they mirror under `dir="rtl"`, and `pnpm api:check` now rejects physical ones (`scripts/check-rtl.mjs`, with `--fix`). Directional icons flip; Switch, Progress and Stepper mirror; `TheyaLocaleProvider` passes `dir` to Radix (`DirectionProvider`, new dependency `@radix-ui/react-direction`), so Slider, Tabs, menus and submenus follow it; Carousel and ProductTour arrows follow the reading direction; Drawer accepts `direction="start" | "end"`. Code surfaces and Kbd stay left-to-right. Also: ProductTour no longer loses arrow keys while focus passes through `<body>` between steps, and `useRef` calls are React 19 compatible.
