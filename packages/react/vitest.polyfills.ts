import {
  ReadableStream,
  TransformStream,
  WritableStream,
} from "node:stream/web";

// msw needs the web streams, which Node has but the jsdom environment does
// not expose. Runs before vitest.setup.ts, which loads msw.
for (const [name, value] of Object.entries({
  ReadableStream,
  TransformStream,
  WritableStream,
})) {
  if (!(name in globalThis)) Object.assign(globalThis, { [name]: value });
}
