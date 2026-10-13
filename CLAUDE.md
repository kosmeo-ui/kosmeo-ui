# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project Overview

**kosmeo-ui** is a monorepo of UI packages published under the `@kosmeo-ui` npm scope. Today it holds
one, `@kosmeo-ui/react` (`packages/react`): the React component library.

Read [README.md](README.md) first. Component patterns and the catalog are in the `ui` skill
([.claude/skills/ui/SKILL.md](.claude/skills/ui/SKILL.md)); `packages/react/CLAUDE.md` has the
source layout.

## Key conventions

- **Style is enforced by CI**: Prettier, import order (single-line imports longest first, then
  multi-line — `npm run sort-imports`), ESLint, `tsc`. Run
  `npm run format && npm run sort-imports && npm run lint` before committing.
- **Every change to a released package needs a version plan** (`npm run version-plan`).
- **ESM only.** Every package is `"type": "module"`. `packages/react` builds with
  `moduleResolution: "bundler"`, so its relative imports take no `.js` extension.
- **Zero app dependencies.** A package here never imports an app. App concerns —
  routing, auth, HTTP clients — come in as props (callbacks, an `AxiosInstance`, an `as` element).
- **Peers, not dependencies**, for anything the app must share a single copy of: `react`,
  `react-dom`, `@tanstack/react-query` (its `QueryClient` is read from context). `axios` is an
  optional peer — only the list hooks' types use it.
- **Published files**: `files: ["dist"]`, and `publishConfig.access` is `public` (a scoped package
  otherwise publishes private). Check a tarball with `npm pack --dry-run -w <package>`.
