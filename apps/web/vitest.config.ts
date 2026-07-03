import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic"
  },
  test: {
    environment: "jsdom",
    maxWorkers: 1,
    setupFiles: ["./vitest.setup.ts"]
  }
});
