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
- **Tests**: Vitest + Testing Library, in a `__tests__` folder beside the code (`npm test`). The
  `testing` skill ([.claude/skills/testing/SKILL.md](.claude/skills/testing/SKILL.md)) has the
  rules.
- **ESM only.** Every package is `"type": "module"`, and relative imports are fully specified
  (`./button/index.js`): webpack, and so Next.js, rejects anything shorter in an ESM package.
  `moduleResolution: "NodeNext"` makes `tsc` enforce it.
- **`"use client";`** opens every component and hook file, for Next.js server components.
- **Every CSS class is `k-` prefixed**, and third-party markup (TipTap's `.tiptap`) is styled only
  under a `k-` class, so nothing leaks into or collides with an app's styles.
- **Zero app dependencies.** A package here never imports an app. App concerns —
  routing, auth, HTTP clients — come in as props (callbacks, an `AxiosInstance`, an `as` element).
- **Peers, not dependencies**, for anything the app must share a single copy of: `react`,
  `react-dom`, `@tanstack/react-query` (its `QueryClient` is read from context). `axios` is an
  optional peer — only the list hooks' types use it.
- **Published files**: `files: ["dist", "src"]` (`src` so source and declaration maps resolve),
  and `publishConfig.access` is `public` (a scoped package otherwise publishes private).
  Check a tarball with `npm pack --dry-run -w <package>`.
