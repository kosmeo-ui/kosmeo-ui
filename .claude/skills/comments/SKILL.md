---
name: comments
description: How to write code comments in this repo. Use whenever writing or editing comments in any code — apply automatically, not just when invoked. Comments are local clarifications of non-obvious code, never process narratives, doc-block summaries, or records of changes made.
---

# Comments

A comment earns its place only by saying something the code at that spot cannot
say for itself. If a reader who knows the language could learn the same fact by
reading the adjacent lines, the comment is noise — delete it.

Apply this whenever you write or edit code. When you edit a file, also clean up
existing over-commenting throughout that file (see [Cleanup](#cleanup-when-editing)).

## The one rule

**A comment must be additive at the point where it sits.** It explains *why this
specific line is the way it is* — a non-obvious constraint, a counter-intuitive
choice, a gotcha, a reason the easy thing wasn't done. It does not narrate, it
does not summarize, it does not document the system.

## Never write these

1. **Process / flow narratives.** Comments that describe the overall sequence of
   what happens ("first we migrate, then we seed, then services boot..."). That
   belongs in `docs/`, not inline. The code already shows the flow.
2. **Doc-block summaries on functions.** Do not add a `/** ... */` block that
   restates what a function does or walks through its steps. Only write a doc
   block when the *contract* is genuinely non-obvious (a surprising precondition,
   an invariant the caller must uphold, units/ownership that aren't in the types).
   A short, readable function needs no block at all.
3. **Cross-system comparisons.** "the dev analogue of the Helm Job", "mirrors
   what X does" — architectural context lives in docs, not in the file.
4. **Asserted design facts.** "There are NO special-cased services",
   "This is the single source of truth" — these decay and aren't checkable.
5. **Records of changes made.** "Changed from X to Y", "Refactored to...",
   "Previously this used...". Git history is the changelog. **One exception:**
   a comment explaining a shim/quirk kept *for backwards compatibility* — that's
   additive, because it explains why dead-looking code must stay.
6. **Restating the obvious.** `// loop over services`, `// import helper`,
   `// set the port`.

## Do write these

- A non-obvious *why*: `// --no-deps so compose doesn't start peer services mid-bootstrap`
- A constraint that isn't visible locally: `// A block body: a function returned from beforeEach runs as cleanup.`
- A gotcha or footgun: `// isAxiosError, not instanceof: the app may bring its own copy of axios`
- A backwards-compat reason to keep something: `// kept for v1 clients that still send the legacy field`

Keep them short — usually one line. If you need a paragraph to explain a line,
the explanation probably belongs in `docs/` with a one-line pointer.

## Worked example

❌ **Before** — a narrative of how the code came to be, none of it local to the line below:

```js
// We used to look for a "." in the path to find CSS files, but that broke when
// the repo was checked out under a dotted directory, so now this copies every
// CSS file from src/ to dist/ and keeps the folder structure.
cpSync(`${root}/src`, `${root}/dist`, {
```

✅ **After** — only the part a reader couldn't infer survives, next to the line it explains:

```js
cpSync(`${root}/src`, `${root}/dist`, {
  recursive: true,
  // Checked with stat, not by looking for a "." — any dotted ancestor would match.
  filter: (src) => src.endsWith(".css") || statSync(src).isDirectory(),
});
```

## Cleanup when editing

When you touch a file, treat its existing comments by the same rule and strip the
ones that violate it, even in sections you didn't otherwise change. Don't preserve
a process narrative or a "// changed to..." note just because it was already there.
(This is intentionally aggressive — the goal is files trend toward clean over time.)
If removing comments would make a genuinely subtle section unclear, replace the
block with one local line rather than deleting outright.
