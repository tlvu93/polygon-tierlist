/// <reference types="vitest/config" />
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Mirror tsconfig.json's `"@/*": ["./*"]` path mapping. Without this,
  // any test file that transitively imports a module using the `@/` alias
  // (which is most of the app - stores, components, utils) fails to
  // resolve under Vite/Vitest, even though it type-checks and builds fine
  // under Next.js's own bundler.
  resolve: {
    alias: {
      "@": dirname,
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
  },
});
