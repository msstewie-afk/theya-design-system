**English** · [Русский](RELEASING.ru.md)

# Versions and changelog

Packages are versioned with semver using [Changesets](https://github.com/changesets/changesets). Each package has its own version and CHANGELOG:

| Package | What's inside |
|---|---|
| `@theya/shadcn` | components, patterns, styles |
| `@theya/tokens` | tokens (Style Dictionary) |

`@theya/sandbox` (the sandbox) is not versioned.

The packages are not published to npm yet: apps in `apps/*` consume them from source via `workspace:*`. Versions exist to show what changed and when, and to make publishing possible later without reworking the process.

## What counts as major, minor, patch

While versions are `0.x`, breaking changes bump minor, not major (this is the semver convention for zero versions). After `1.0.0`, follow the table.

| Change | After 1.0 | Now (0.x) |
|---|---|---|
| Removed or renamed a component, prop, prop value, token or export; changed behavior so that existing code works differently | major | minor |
| New component, prop, value or token; a new capability that does not break existing code | minor | minor |
| A fix for a bug, accessibility, or styling within the intended design; edits to documentation and stories | patch | patch |

Only tests, stories and documentation (with no changes to what the app receives): no changeset needed.

## How to add an entry

Together with the change, in the same commit:

```
pnpm changeset
```

The command asks which packages are affected and at what level. The description is one line for the person who is upgrading: what changed and what they need to do. For example: "Button: the `type` prop is renamed to `appearance`; update it in your code."

If a change affects several packages in different ways, make a separate entry for each package: the full text of an entry goes into the CHANGELOG of every package listed in it.

The file appears in `.changeset/`. You can also write it by hand:

```md
---
"@theya/shadcn": patch
---

QueryBuilder: in a narrow container, conditions wrap into a column instead of being cut off on the right.
```

## Public API report

The public API of `@theya/shadcn` is described in `packages/theya-shadcn/api/`. It has one declaration file per entry point from `exports`: `api/ui/button.d.ts`, `api/blocks/workspace-layout.d.ts`, `api/lib/utils.d.ts`. The end of each file lists the default prop values. The report is generated; do not edit it by hand:

```
cd packages/theya-shadcn
pnpm api          # rebuild the spec and the report
pnpm api:check    # fails if the report is out of date, and shows what changed
```

If a component, prop, prop value, default value or export changed, run `pnpm api` and commit `api/` together with the change and the changeset entry. How to read the diff in `api/`:

- **Lines were only added** (a new prop, value or export): minor.
- **A line was removed or changed**, including `// Component.prop = default`: whoever upgrades may break. While versions are 0.x, this is minor, and the changeset says what to do when upgrading. If the break can be postponed, go through deprecation first (below).

Comments and JSDoc do not go into the report: editing a description does not count as an API change.

## Deprecation: how to remove and rename

Nothing is removed or renamed in a single step. The order is:

1. **Announce.** The old name keeps working, and the new one appears next to it.
   - Add a JSDoc `@deprecated` tag with the replacement to the old prop or export. The tag goes into the spec and is highlighted in the editor.
   - In dev mode, print a warning once: `warnDeprecated('Button type', 'use \`appearance\` instead.')` from `@theya/shadcn/lib/deprecation`.
   - If a whole component is deprecated, set `status: 'deprecated'` and `replacement` in its guidelines.
   - The changeset is minor, with the line "Deprecated: …, replace with …".
2. **Wait** for at least one minor release, so that apps in `apps/*` have time to migrate.
3. **Remove.** Now (0.x) this is minor; after 1.0 it is major. The changeset says exactly what was removed.

**Codemod.** If the replacement is mechanical (renaming a prop, value or component) and occurs in app code more than a couple of times, attach a script `packages/theya-shadcn/codemods/<version>-<what>.mjs` to step 1. The script rewrites the usages itself, and the changeset includes the command to run it. The tool (jscodeshift or ts-morph) will be chosen when the first codemod is needed.

## How to release a version

```
pnpm version-packages
```

Changesets collects all entries, bumps the versions in `package.json`, appends to `CHANGELOG.md` in each package, and deletes the processed entries. Review the changes, commit them, then add git tags of the form `@theya/shadcn@0.2.0`:

```
git add -A && git commit -m "release: version packages" && pnpm tag-release && git push --follow-tags
```

## If publishing is needed

For projects outside the monorepo, the packages need a build into `dist` (right now they ship source). The decision is postponed until the first such project.
