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
new versions in each `package.json` and a `CHANGELOG.md` per package. Merging that PR runs
`publish.yml`, which publishes every version npm doesn't have yet and tags it `<package>@<version>`.
The same workflow can be started by hand (Actions → Publish to npm → Run workflow), which is how
the first release goes out.

## Logos

`assets/` holds the banner, the mark (SVG, plus PNG at 256 and 512 px for npm and GitHub avatars)
and a favicon SVG drawn with heavier lines for 16–32 px. They're generated, not drawn, so edit the
generator rather than the files.

## License

[Apache-2.0](LICENSE)
