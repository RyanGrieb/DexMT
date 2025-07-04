// npx playwright test tests/e2e/profile.test.ts --headed

import { Wallet } from "ethers";
import test from "playwright/test";
import {
  connectWallet,
  createFakePosition,
  createFakeTrade,
  favoriteTrader,
  injectFakePosition,
  injectFakeTrade,
  resetTraders,
  selectTrader,
  toggleMirrorTrades,
  triggerMirrorTrades,
} from "../helpers/test-utils";

test.describe("Profile Page", () => {
  //npx playwright test --grep "should display trade history" --headed
  test("should display trade history", async ({ page }) => {
    await resetTraders();

    const wallet = Wallet.createRandom();
    await connectWallet(wallet);

    // Create and inject a fake trade for this trader
    const fakeTrade = {
      id: "test-trade-1",
      orderType: 0, // Assuming 0 corresponds to a basic order type
      traderAddr: wallet.address,
      marketAddr: "0x123",
      longTokenAddress: "0x456",
      shortTokenAddress: "0x789",
      isLong: true,
      marketName: "USDC/ETH",
      tokenName: "ETH",
      sizeUsd: 1500,
      priceUsd: 2000,
      initialCollateralUsd: 300,
      sizeDeltaUsd: 1500,
      rpnl: 50,
      timestamp: Math.floor(Date.now() / 1000), // Current timestamp in seconds
    };

    // Inject the fake trade (you'll need to implement this helper)
    await injectFakeTrade(fakeTrade);

    // Navigate to profile page
    await page.goto(`/traderprofile?address=${wallet.address}`);

    // Click on the Trade History tab
    await page.click('[data-tab="trade-history"]');

    // Wait for the trade history table to appear
    await page.waitForSelector(".trade-row");

    // Verify exactly one trade row is rendered
    const rowCount = await page.$$eval(".trade-row", (rows) => rows.length);
    test.expect(rowCount).toBe(1);

    // Verify trade action cell
    const actionText = await page.textContent(".trade-row .trade-action-cell");
    test.expect(actionText).toBeTruthy(); // Should contain some order type

    // Verify trade market cell contains "LONG - ETH"
    const marketText = await page.textContent(".trade-row .trade-market-cell");
    test.expect(marketText).toContain("LONG");
    test.expect(marketText).toContain("ETH");

    // Verify trade size cell contains the size
    const sizeText = await page.textContent(".trade-row .trade-size-cell");
    test.expect(sizeText).toContain("1.5K");

    // Verify trade price cell contains the price
    const priceText = await page.textContent(".trade-row .trade-price-cell");
    test.expect(priceText).toContain("2K");

    // Verify PNL cell shows positive value
    const pnlText = await page.textContent(".trade-row .trade-pnl-cell");
    test.expect(pnlText).toContain("50");
  });

  // npx playwright test --grep "should display open positions"
  test("should display open positions", async ({ page }) => {
    await resetTraders();

    const wallet = Wallet.createRandom();

    await connectWallet(wallet);

    const existingPosition = createFakePosition({
      tokenName: "ETH",
      traderAddr: wallet.address,
      isLong: true,
      sizeUsd: 1000,
    });

    await injectFakePosition(existingPosition);

    // navigate to profile page
    await page.goto(`/traderprofile?address=${wallet.address}`);

    // wait for the row to appear
    await page.waitForSelector(".position-row");
    // exactly one row rendered
    const rowCount = await page.$$eval(".position-row", (rows) => rows.length);
    test.expect(rowCount).toBe(1);

    // verify market name cell
    const marketName = await page.textContent(".position-row .market-name");
    test.expect(marketName).toBe("ETH");

    // verify side cell
    const sideText = await page.textContent(".position-row .position-side");
    test.expect(sideText).toBe(existingPosition.isLong ? "LONG" : "SHORT");

    // verify size cell contains the USD amount
    const sizeCell = await page.textContent(".position-row .size-cell");
    test.expect(sizeCell).toContain("$1K");

    await page.pause();
  });

  // npx playwright test --grep "should display copied trades" --headed
  test("should display copied trades", async ({ page }) => {
    await resetTraders();

    const wallet = Wallet.createRandom();
    const targetWallet = Wallet.createRandom();

    // Connect wallets and set up mirror trading
    await connectWallet(wallet);
    await connectWallet(targetWallet);
    await favoriteTrader(wallet, targetWallet, true);
    await selectTrader(wallet, targetWallet, true);
    await toggleMirrorTrades(wallet, true);

    // Inject a trade for the trader
    const openTrade = createFakeTrade({
      orderType: 2, // MarketIncrease
      traderAddr: targetWallet.address,
      sizeUsd: 0,
      sizeDeltaUsd: 1000,
      isLong: true,
      marketName: "BTC/USD",
      tokenName: "BTC",
      priceUsd: 50000,
      marketAddress: "0x123",
    });
    await injectFakeTrade(openTrade);

    const position = createFakePosition({
      tokenName: "BTC",
      traderAddr: targetWallet.address,
      isLong: true,
      sizeUsd: 1000,
      entryPriceUsd: 50000,
      markPriceUsd: 50000,
      marketAddress: "0x123",
      liqPriceUsd: 40000,
    });

    await injectFakePosition(position);

    // TODO: Navigate to the target Wallet profile and check if the position and trade are displayed properly and in conjunction.

    // Trigger mirror trades to copy the trade
    await triggerMirrorTrades();

    // Navigate to the follower's profile page
    await page.goto(`/traderprofile?address=${wallet.address}`);

    // Click on the Trade History tab
    await page.click('[data-tab="trade-history"]');

    // Wait for the trade history table to appear
    await page.waitForSelector(".trade-row");

    // Verify exactly one trade row is rendered
    const rowCount = await page.$$eval(".trade-row", (rows) => rows.length);
    test.expect(rowCount).toBe(1);

    // Verify trade market cell contains "LONG - BTC"
    const marketText = await page.textContent(".trade-row .trade-market-cell");
    test.expect(marketText).toContain("LONG");
    test.expect(marketText).toContain("BTC");
    /*
    // Verify trade size cell contains the size
    const sizeText = await page.textContent(".trade-row .trade-size-cell");
    test.expect(sizeText).toContain("1K");

    // Verify trade price cell contains the price
    const priceText = await page.textContent(".trade-row .trade-price-cell");
    test.expect(priceText).toContain("50K");

    // Verify the mirrored cell contains the trader's address
    const mirroredCell = await page.textContent(".trade-row .trade-is-mirrored-cell");
    test.expect(mirroredCell).toContain(wallet.address.slice(2, 6).toUpperCase());*/

    await page.pause();
  });
});
