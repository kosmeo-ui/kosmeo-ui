import checkFile from "eslint-plugin-check-file";
import importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";
import eslint from "@eslint/js";
import { readdirSync } from "fs";

const demoFeatures = readdirSync("apps/demo/src/features");

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: [
      "**/dist/",
      "**/node_modules/",
      "apps/demo/public/mockServiceWorker.js",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-empty-object-type": [
        "error",
        { allowInterfaces: "always" },
      ],
      "@typescript-eslint/no-namespace": "off",
    },
  },
  // The demo app follows bulletproof-react's architecture rules.
  {
    files: ["apps/demo/src/**/*.{ts,tsx}"],
    plugins: { import: importPlugin, "check-file": checkFile },
    settings: {
      "import/resolver": {
        typescript: { project: "apps/demo/tsconfig.json" },
      },
    },
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          basePath: "apps/demo/src",
          zones: [
            // A feature imports only from itself, never another feature.
            ...demoFeatures.map((feature) => ({
              target: `./features/${feature}`,
              from: "./features",
              except: [`./${feature}`],
            })),
            // Unidirectional: shared code → features → app.
            { target: "./features", from: "./app" },
            {
              target: [
                "./components",
                "./config",
                "./hooks",
                "./lib",
                "./types",
                "./utils",
              ],
              from: ["./features", "./app"],
            },
          ],
        },
      ],
      "import/no-cycle": "error",
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.{ts,tsx}": "KEBAB_CASE" },
        { ignoreMiddleExtensions: true },
      ],
      "check-file/folder-naming-convention": [
        "error",
        { "apps/demo/src/**/": "KEBAB_CASE" },
      ],
    },
  }
);
