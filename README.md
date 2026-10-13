<p align="center">
  <img src="assets/kosmeo-banner.svg" alt="Kosmeo — React UI components" width="720">
</p>

# kosmeo-ui

UI packages for React apps.
κοσμέω — "I arrange, I adorn".

| Package | What it is |
|---------|-----------|
| [`@kosmeo-ui/react`](packages/react) | React 19 component library, themed with CSS variables (light/dark via `data-theme` on `<html>`) |

## Development

```sh
npm install
npm run build                 # every package, through Nx
npm run check                 # type-check
```

Before committing:

```sh
npm run format && npm run sort-imports && npm run lint
```

CI checks all three, then type-checks and builds.

## Releasing

Packages are versioned with Nx version plans. Every PR that changes a released package needs one:

```sh
npm run version-plan          # writes .nx/version-plans/<name>.md — commit it
```

After a PR with plans merges, CI opens (or updates) a `release/version-bump` PR that applies them:
new versions in each `package.json` and a `CHANGELOG.md` per package. Publishing is manual for now:

```sh
npm run build
npm publish -w @kosmeo-ui/react      # scoped packages publish public via publishConfig
```

## Logos

`assets/` holds the banner, the mark (SVG, plus PNG at 256 and 512 px for npm and GitHub avatars)
and a favicon SVG drawn with heavier lines for 16–32 px. They're generated, not drawn, so edit the
generator rather than the files.
