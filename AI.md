**English** · [Русский](AI.ru.md)

# Theya for AI agents

Three ways to give an agent knowledge about Theya. Everything is generated from the source files. Nothing is written by hand.

## 1. Component specification (`packages/theya-shadcn/spec/`)

- `spec/index.json` — a list of all components: category, status, the first "when to use" item, and "use instead" hints.
- `spec/components/<name>.json` — the full record for one component:
  - the import line;
  - guidelines: when to use and when not to (with an alternative), anatomy, accessibility;
  - props with types, allowed values and default values;
  - do/don't pairs as TSX;
  - links to stories.
- `spec/a11y.json` — the accessibility matrix (WCAG 2.2 AA) for each component: how many stories axe checks in the light and dark theme and which rules are disabled where, whether there are keyboard tests, whether reduced motion is respected, high contrast rules, screen reader checks, accepted deviations. Built by `pnpm a11y` from tests and code, plus `a11y/manual.json` (what is checked by hand). Shown in the Accessibility section of the component's Docs page, and in full on the Design System / Accessibility page.

Where the data comes from:

| Data | Source |
|---|---|
| guidelines | `<name>.guidelines.tsx` (the file is read as TypeScript, not executed) |
| props | the component's types, via react-docgen-typescript |
| links to stories | `title` and exports of `<name>.stories.tsx` |

```
cd packages/theya-shadcn
pnpm spec          # rebuild after editing components or guidelines
pnpm spec:check    # fails if spec/ or llms*.txt are out of date (for CI)
```

Changed a component, its props or guidelines? Run `pnpm spec` and commit the result together with the change.

## 2. llms.txt

`public/llms.txt` — an index in the llmstxt.org format: the rules for working with Theya and all components by category. `public/llms-full.txt` — all components in full, in one Markdown file.

Storybook serves both files:
- `http://localhost:6008/llms.txt`
- `http://localhost:6008/llms-full.txt`

## 3. MCP server (`packages/theya-shadcn/mcp/server.mjs`)

The server has no dependencies: it runs on plain `node`, nothing needs to be installed. Tools:

| Tool | What it does |
|---|---|
| `list_components` | all components; filter by category and status |
| `search_components` | find a component by describing the task in words ("confirm a destructive action") |
| `get_component` | the full specification of one component; you can request only the parts you need |
| `get_tokens` | semantic tokens with aliases and values for the light and dark theme (values appear after `pnpm build:tokens`) |

Claude Code connects the server on its own through `.mcp.json` in the repo root (it asks for permission on first run). For other clients, configure the command `node packages/theya-shadcn/mcp/server.mjs` with the repo root as the working directory.

Check the server manually:

```
printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search_components","arguments":{"query":"pick one of three plans"}}}' | node packages/theya-shadcn/mcp/server.mjs
```
