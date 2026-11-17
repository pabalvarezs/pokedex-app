import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["./tests/**/*.test.ts"],
    globalSetup: ["./tests/global-setup.ts"],
    hookTimeout: 30000,
    fileParallelism: false,
  },
});
