import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const src = fileURLToPath(new URL("./src", import.meta.url));
const librarySrc = fileURLToPath(
  new URL("../../packages/react/src", import.meta.url)
);

// `vite` (dev) reads the library's source so edits to packages/react hot-reload.
// `vite build` resolves the package normally, against its built dist/, the
// same way an app installing it from npm would.
const libraryAliases = [
  {
    find: /^@kosmeo-ui\/react\/styles\.css$/,
    replacement: `${librarySrc}/styles.css`,
  },
  { find: /^@kosmeo-ui\/react$/, replacement: `${librarySrc}/index.ts` },
];

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${src}/` },
      ...(command === "serve" ? libraryAliases : []),
    ],
  },
  // The rich text editor (TipTap) is most of the bundle; a demo needn't split it.
  build: { chunkSizeWarningLimit: 1500 },
}));
