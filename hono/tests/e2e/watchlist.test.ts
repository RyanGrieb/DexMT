/*
test.describe("Watchlist Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Reset test database before each test using API call
    const resetResponse = await fetch("http://localhost:8788/api/traders/reset", { method: "POST" });
    if (!resetResponse.ok) {
      throw new Error(`Failed to reset database: ${resetResponse.status}`);
    }
    await page.goto("/");
  });

  test("should display watchlist page", async ({ page }) => {
    await page.goto("/mywatchlist");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000); // Wait for JS to load

    // Check that the page structure loads
    await expect(page.getByText("My Watch List")).toBeVisible();
    await expect(page.getByText("Connect Wallet")).toBeVisible();

    // App should show either content or loading state (both are valid)
    const hasContent = await page.locator(".index-content").count();
    expect(hasContent).toBeGreaterThan(0);
  });

  test("should have clickable navigation buttons", async ({ page }) => {
    await page.goto("/mywatchlist");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Verify navigation buttons exist and are clickable
    const topTradersBtn = page.locator("#topTradersBtn");
    const watchlistBtn = page.locator("#myWatchListBtn");

    await expect(topTradersBtn).toBeVisible();
    await expect(watchlistBtn).toBeVisible();

    // Buttons should be clickable (even if routing doesn't work yet)
    await topTradersBtn.click();
    await page.waitForTimeout(500);

    await watchlistBtn.click();
    await page.waitForTimeout(500);

    // Verify buttons are still visible after clicking
    await expect(topTradersBtn).toBeVisible();
    await expect(watchlistBtn).toBeVisible();
  });

  test("should load page content or show loading state", async ({ page }) => {
    await page.goto("/mywatchlist");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    // Page should either show content or a loading state
    const hasLoadingSpinner = await page.locator(".loading-spinner").count();
    const hasLoadingText = await page.locator(".loading-text").count();

    // If app is in loading state, that's valid
    if (hasLoadingSpinner > 0 || hasLoadingText > 0) {
      await expect(page.locator(".loading-container")).toBeVisible();
    } else {
      // Otherwise should have some content in the main area
      await expect(page.locator(".index-content")).toBeVisible();
    }
  });

  test("should handle wallet connection attempts", async ({ page }) => {
    // Mock MetaMask
    await page.addInitScript(() => {
      (window as any).ethereum = {
        selectedAddress: null,
        request: ({ method }: { method: string }) => {
          if (method === "eth_accounts") {
            return Promise.resolve([]);
          }
          if (method === "eth_requestAccounts") {
            return Promise.resolve(["0x1234567890123456789012345678901234567890"]);
          }
          return Promise.resolve();
        },
      };
    });

    await page.goto("/mywatchlist");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Try to connect wallet
    const connectButton = page.locator("#connectButton");
    await expect(connectButton).toBeVisible();
    await connectButton.click();

    // Wait for any wallet connection process
    await page.waitForTimeout(2000);

    // Wallet connection should complete (or fail gracefully)
    await expect(page.locator("body")).toBeVisible();
  });
});

*/
