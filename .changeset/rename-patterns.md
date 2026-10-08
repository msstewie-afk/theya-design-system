---
"@theya/shadcn": minor
---

Five patterns renamed, together with their entry points (`@theya/shadcn/blocks/…`), prop types and Storybook ids:

- `AppShell` → `WorkspaceLayout` (`blocks/workspace-layout`; `AppShellNavItem`, `AppShellNavGroup`, `AppShellCrumb`, `AppShellProps` → `WorkspaceLayout…`)
- `DetailScreen` → `Details` (`blocks/details`)
- `SettingsScreen` → `Preferences` (`blocks/preferences`)
- `ApiKeys` → `AccessTokens` (`blocks/access-tokens`; `ApiKey` type → `AccessToken`)
- `ListScreen` → `ListView` (`blocks/list-view`)

Behaviour, props and on-screen text are unchanged; update imports and component names.
