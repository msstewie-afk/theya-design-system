**English** · [Русский](RELEASING.ru.md)

# Versions and changelog

Packages are versioned with semver using [Changesets](https://github.com/changesets/changesets). Each package has its own version and CHANGELOG:

| Package | What's inside |
|---|---|
| `@theya/shadcn` | components, patterns, styles |
| `@theya/tokens` | tokens (Style Dictionary) |

`@theya/sandbox` (the sandbox) is not versioned.

Apps in `apps/*` consume the packages from source via `workspace:*`. Apps outside the monorepo install `@theya/shadcn` from GitHub Packages (below). Versions show what changed and when.

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

## Publishing to GitHub Packages

`@theya/shadcn` is published privately to GitHub Packages as **`@msstewie-afk/theya-shadcn`** (GitHub takes npm packages only under the repository owner's scope). In the monorepo the name stays `@theya/shadcn` and the package stays `"private"`, so nothing can reach the public npm registry. `@theya/tokens` is not published: its CSS and fonts are inlined into the package's `dist/styles`.

**Publishing** happens in `.github/workflows/release.yml`:

- on the release tag `@theya/shadcn@<version>`, which `pnpm tag-release && git push --follow-tags` pushes after `pnpm version-packages` (above);
- or by hand: Actions → Release → Run workflow (publishes the version that is on main).

The workflow rewrites the manifest (`scripts/github-package.mjs`: name, registry, repository), builds `dist/` with its check, and publishes with the workflow's own token. A version that is already in the registry is skipped. To see the manifest without publishing:

```
node packages/theya-shadcn/scripts/github-package.mjs --print
```

**Installing in an app** (outside the monorepo). Create a personal access token (classic) with the `read:packages` scope, put it in the environment as `GITHUB_PACKAGES_TOKEN`, and add `.npmrc` next to the app's `package.json`:

```
@msstewie-afk:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
```

pnpm 11 does not send the token from the project's `.npmrc` (npm does): the install fails with `ERR_PNPM_FETCH_401 … No authorization header was set`. Put the token in your user config once (`~/.npmrc`, outside the project); the project's `.npmrc` keeps the registry line:

```
npm config set "//npm.pkg.github.com/:_authToken" "$GITHUB_PACKAGES_TOKEN"
```

Install under the old name with an alias, so imports stay `@theya/shadcn/...`:

```
pnpm add @theya/shadcn@npm:@msstewie-afk/theya-shadcn
```

The app also needs `react`, `react-dom` (18.3 or 19) and `tailwindcss` 4: they are peer dependencies. Until the first release, or for an unreleased commit, `scripts/pack-theya.mjs` still packs a tarball (see `apps/pilot`).

## React versions

The package supports React 18.3 and 19 (`peerDependencies`). Development, Storybook and the main CI jobs run on React 19; the `react-18` CI job forces 18.3 across the workspace and runs types and play + axe. Dropping 18 (`forwardRef` → `ref`) is a breaking release and waits for a reason: React warnings, a feature only 19 has, or React 20.
