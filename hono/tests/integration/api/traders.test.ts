import { Wallet } from "ethers";
import { beforeAll, describe, expect, test } from "vitest";
import { baseUrl, resetTraders, connectWallet, favoriteTrader, selectTrader } from "../../helpers/test-utils";

describe("Traders API Integration Tests (Simple)", () => {
  beforeAll(async () => {
    // Reset traders before running tests
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("expect /api/wallet/connect to register a wallet", async () => {
    await resetTraders();

    const testWallet = Wallet.createRandom();
    await connectWallet(testWallet);

    const tradersResponse = await fetch(`${baseUrl}/api/traders`);
    expect(tradersResponse.status).toBe(200);

    const tradersData = await tradersResponse.json();

    // Assert: Ensure targetWallet is inside the response
    const walletExists = tradersData.some((trader: any) => trader.address === testWallet.address);
    expect(walletExists).toBe(true);
  });

  test("expect /api/traders/favorite_trader to create entry in 'favorite_traders' table", async () => {
    await resetTraders();

    const testWallet = Wallet.createRandom();
    const targetWallet = Wallet.createRandom();

    // Connect both wallets
    await connectWallet(testWallet);
    await connectWallet(targetWallet);

    const data = await favoriteTrader(testWallet, targetWallet, true);

    expect(data.success).toBe(true);
    expect(data.follower_address).toBe(testWallet.address);
    expect(data.favorite_trader).toBe(targetWallet.address);

    // Get the favorited traders of testWallet.address
    const favoritesResponse = await fetch(`${baseUrl}/api/traders/favorites?walletAddr=${testWallet.address}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    expect(favoritesResponse.status).toBe(200);
    const favoritesData = await favoritesResponse.json();

    expect(favoritesData.success).toBe(true);

    expect(Array.isArray(favoritesData.favorites)).toBe(true);

    // Assert: targetWallet.address is in the favorites list
    const found = favoritesData.favorites.some((fav: any) => fav.address === targetWallet.address);
    expect(found).toBe(true);
  });

  test("expect /api/traders/favorite_trader to remove entry in 'favorite_traders' table", async () => {
    await resetTraders();

    // Arrange: Create test wallet and favorite a trader first
    const testWallet = Wallet.createRandom();
    const targetWallet = Wallet.createRandom();

    // Connect both wallets
    await connectWallet(testWallet);
    await connectWallet(targetWallet);

    // First, favorite the trader
    await favoriteTrader(testWallet, targetWallet, true);

    // Now unfavorite the trader
    const unfavoriteData = await favoriteTrader(testWallet, targetWallet, false);
    expect(unfavoriteData.success).toBe(true);
    expect(unfavoriteData.follower_address).toBe(testWallet.address);
    expect(unfavoriteData.unfavorite_trader).toBe(targetWallet.address);

    // Verify trader is no longer in favorites
    const favoritesResponse = await fetch(`${baseUrl}/api/traders/favorites?walletAddr=${testWallet.address}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    expect(favoritesResponse.status).toBe(200);
    const favoritesData = await favoritesResponse.json();
    expect(favoritesData.success).toBe(true);
    expect(Array.isArray(favoritesData.favorites)).toBe(true);

    // Assert: targetWallet.address is NOT in the favorites list
    const found = favoritesData.favorites.some((fav: any) => fav.address === targetWallet.address);
    expect(found).toBe(false);
  });

  test("expect /api/traders/select_trader to update 'selected' in 'favorite_traders' table", async () => {
    await resetTraders();
    const testWallet = Wallet.createRandom();
    const targetWallet = Wallet.createRandom();

    // Connect both wallets
    await connectWallet(testWallet);
    await connectWallet(targetWallet);

    // Favorite the target wallet first (required for selection)
    await favoriteTrader(testWallet, targetWallet, true);

    const selectData = await selectTrader(testWallet, targetWallet, true);

    console.log(selectData);

    expect(selectData.success).toBe(true);
    expect(selectData.follower_address).toBe(testWallet.address);
    expect(selectData.selected_trader).toBe(targetWallet.address);

    // TODO: Verify that the selected trader is marked as selected in the favorites list
  });

  test("expect HTML for root endpoint", async () => {
    const response = await fetch(`${baseUrl}/`);
    expect(response.status).toBe(200);

    const contentType = response.headers.get("content-type");
    expect(contentType).toContain("text/html");
  });
});
