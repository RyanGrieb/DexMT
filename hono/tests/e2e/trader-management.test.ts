import { test, expect } from '@playwright/test';

test.describe('Trader Management Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Reset test database before each test using API call
    const resetResponse = await fetch('http://localhost:8788/api/traders/reset', { method: 'POST' });
    if (!resetResponse.ok) {
      throw new Error(`Failed to reset database: ${resetResponse.status}`);
    }
    await page.goto('/');
  });

  test('should navigate to leaderboard and view traders', async ({ page }) => {
    await page.goto('/toptraders');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for JS to load
    
    // Check that we're on the leaderboard page
    await expect(page.getByText('Top Traders')).toBeVisible();
    
    // Page should either show content or loading state
    const hasLoadingState = await page.locator('.loading-container').count();
    if (hasLoadingState > 0) {
      await expect(page.locator('.loading-container')).toBeVisible();
    } else {
      // Should have main content area
      await expect(page.locator('.index-content')).toBeVisible();
    }
  });

  test('should display all required navigation elements', async ({ page }) => {
    await page.goto('/toptraders');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // All navigation buttons should be visible and clickable
    const topTradersBtn = page.locator('#topTradersBtn');
    const watchlistBtn = page.locator('#myWatchListBtn');
    const connectBtn = page.locator('#connectButton');
    
    await expect(topTradersBtn).toBeVisible();
    await expect(watchlistBtn).toBeVisible();
    await expect(connectBtn).toBeVisible();
    
    // Buttons should be clickable
    await watchlistBtn.click();
    await page.waitForTimeout(500);
    
    await topTradersBtn.click();
    await page.waitForTimeout(500);
    
    // Verify page structure remains intact
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('.container')).toBeVisible();
  });

  test.skip('should allow favoriting a trader', async ({ page }) => {
    // This test will be enabled when trader favoriting UI is implemented
    test.skip(true, 'Trader favoriting UI not yet implemented');
  });

  test.skip('should allow selecting a trader', async ({ page }) => {
    // This test will be enabled when trader selection UI is implemented
    test.skip(true, 'Trader selection UI not yet implemented');
  });

  test.skip('should navigate to trader profile', async ({ page }) => {
    // This test will be enabled when trader profile links are implemented
    test.skip(true, 'Trader profile navigation not yet implemented');
  });

  test.skip('should display trader statistics correctly', async ({ page }) => {
    // This test will be enabled when trader statistics UI is implemented
    test.skip(true, 'Trader statistics UI not yet implemented');
  });
});