import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    environment: "happy-dom",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    exclude: ["tests/e2e/**/*", "node_modules/**/*"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "tests/", "webpack.config.js", "static/js-compiled/", "**/*.d.ts"],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    reporters: ["verbose"],
  },
  resolve: {
    alias: {
      "@": "/src",
      "@tests": "/tests",
    },
  },
});
