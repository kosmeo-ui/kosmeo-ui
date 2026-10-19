import { defineConfig } from "vitest/config";

// A zone west of UTC, so date code that slips into UTC shows up as an
// off-by-one day here (and in CI, which runs in UTC) rather than only for
// users in the Americas. Workers inherit it.
process.env.TZ = "America/Los_Angeles";

export default defineConfig({
  test: {
    environment: "jsdom",
    pool: "vmThreads",
    include: ["src/**/__tests__/**/*.test.{ts,tsx}"],
    setupFiles: ["./vitest.polyfills.ts", "./vitest.setup.ts"],
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/__tests__/**", "src/**/index.ts", "src/css.d.ts"],
    },
  },
});
