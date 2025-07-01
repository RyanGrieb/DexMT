import { Wallet } from "ethers";
import test from "playwright/test";
import { connectWallet, createFakePosition, injectFakePosition, resetTraders } from "../helpers/test-utils";

test.describe("Profile Page", () => {
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
    await page.waitForSelector("#open-positions-tab .positions-list .position-row");
    // exactly one row rendered
    const rowCount = await page.$$eval("#open-positions-tab .positions-list .position-row", (rows) => rows.length);
    test.expect(rowCount).toBe(1);

    // verify market name cell
    const marketName = await page.textContent("#open-positions-tab .position-row .market-name");
    test.expect(marketName).toBe("ETH");

    // verify side cell
    const sideText = await page.textContent("#open-positions-tab .position-row .position-side");
    test.expect(sideText).toBe(existingPosition.isLong ? "LONG" : "SHORT");

    // verify size cell contains the USD amount
    const sizeCell = await page.textContent("#open-positions-tab .position-row .size-cell");
    test.expect(sizeCell).toContain("$1K");

    //await page.pause();
  });
});
