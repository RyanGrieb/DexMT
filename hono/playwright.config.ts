import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false, // Run tests sequentially to avoid race conditions
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1, // Use single worker to avoid conflicts
  reporter: "list",
  timeout: 30000, // Increase timeout for slow loading
  use: {
    baseURL: "http://localhost:8788",
    trace: "on-first-retry",
    actionTimeout: 10000, // Increase action timeout
    navigationTimeout: 15000, // Increase navigation timeout
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Disabled other browsers due to system dependency issues
    // Uncomment after running: sudo npx playwright install-deps
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  webServer: {
    command: "docker compose -f ../docker-compose.test.yml up --build",
    url: "http://localhost:8788",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
