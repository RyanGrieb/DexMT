import { Wallet } from "ethers";
import { beforeAll, describe, expect, test } from "vitest";

describe("Traders API Integration Tests (Simple)", () => {
  const baseUrl = "http://localhost:8788";
  const targetWallet = Wallet.createRandom();

  beforeAll(async () => {
    // Reset traders before running  tests
    const resetResponse = await fetch(`${baseUrl}/api/traders/reset`, {
      method: "POST",
    });

    expect(resetResponse.status).toBe(200);

    // TODO: Test if the reset was successful (No traders in DB)

    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("expect /api/wallet/connect to register a wallet", async () => {
    // Arrange: Prepare a valid request body
    const connectBody = {
      walletAddr: targetWallet.address,
      chainId: "0xa4b1",
    };

    const response = await fetch(`${baseUrl}/api/wallet/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(connectBody),
    });

    expect(response.status).toBe(200);

    // Act: Fetch traders from the API
    const tradersResponse = await fetch(`${baseUrl}/api/traders`);
    expect(tradersResponse.status).toBe(200);

    // Print the response body
    const tradersData = await tradersResponse.json();

    // Assert: Ensure targetWallet is inside the response
    const walletExists = tradersData.some((trader: any) => trader.address === targetWallet.address);
    expect(walletExists).toBe(true);
  });

  test("expect /api/traders/favorite_trader to create entry in 'favorite_traders' table", async () => {
    // Arrange: Prepare a valid request body

    const testWallet = Wallet.createRandom();
    const timestamp = Date.now();
    const message = `Favorite trader ${targetWallet.address} for ${testWallet.address} at ${timestamp}`;
    const signature = await testWallet.signMessage(message);

    const body = {
      message: message,
      walletAddr: testWallet.address,
      traderAddr: targetWallet.address,
      signature: signature,
      timestamp: timestamp, // Use a number for test, backend expects bigint
      favorite: true,
    };

    // Act: Send POST request
    const response = await fetch(`${baseUrl}/api/traders/favorite_trader`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // Assert: Status and response
    if (response.status !== 200) {
      console.error("Unexpected response status:", response.status);
      const parsedError = await response.json();
      console.error("Response body:", parsedError);
      expect(response.status).toBe(200); // Fail the test explicitly
    }

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.follower_address).toBe(body.walletAddr);
    expect(data.favorite_trader).toBe(body.traderAddr);

    // Get the favorited traders of testWallet.address
    const favoritesResponse = await fetch(`${baseUrl}/api/traders/favorites?walletAddr=${testWallet.address}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    expect(favoritesResponse.status).toBe(200);
    const favoritesData = await favoritesResponse.json();

    expect(favoritesData.success).toBe(true);

    //console.log("Favorites response body:", favoritesData);
    //console.log(`Wallet address: ${testWallet.address} Target wallet address: ${targetWallet.address}`);

    expect(Array.isArray(favoritesData.favorites)).toBe(true);

    // Assert: targetWallet.address is in the favorites list
    const found = favoritesData.favorites.some((fav: any) => fav.address === targetWallet.address);
    expect(found).toBe(true);
  });

  test("expect /api/traders/favorite_trader to unfavorite trader (remove from favorites)", async () => {
    // Arrange: Create test wallet and favorite a trader first
    const testWallet = Wallet.createRandom();
    const timestamp = Date.now();
    const favoriteMessage = `Favorite trader ${targetWallet.address} for ${testWallet.address} at ${timestamp}`;
    const favoriteSignature = await testWallet.signMessage(favoriteMessage);

    // First, favorite the trader
    const favoriteBody = {
      message: favoriteMessage,
      walletAddr: testWallet.address,
      traderAddr: targetWallet.address,
      signature: favoriteSignature,
      timestamp: timestamp,
      favorite: true,
    };

    const favoriteResponse = await fetch(`${baseUrl}/api/traders/favorite_trader`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(favoriteBody),
    });

    expect(favoriteResponse.status).toBe(200);

    // Now unfavorite the trader
    const unfavoriteTimestamp = Date.now();
    const unfavoriteMessage = `Unfavorite trader ${targetWallet.address} for ${testWallet.address} at ${unfavoriteTimestamp}`;
    const unfavoriteSignature = await testWallet.signMessage(unfavoriteMessage);

    const unfavoriteBody = {
      message: unfavoriteMessage,
      walletAddr: testWallet.address,
      traderAddr: targetWallet.address,
      signature: unfavoriteSignature,
      timestamp: unfavoriteTimestamp,
      favorite: false,
    };

    // Act: Send unfavorite request
    const unfavoriteResponse = await fetch(`${baseUrl}/api/traders/favorite_trader`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(unfavoriteBody),
    });

    // Assert: Status and response
    if (unfavoriteResponse.status !== 200) {
      console.error("Unexpected response status:", unfavoriteResponse.status);
      const parsedError = await unfavoriteResponse.json();
      console.error("Response body:", parsedError);
      expect(unfavoriteResponse.status).toBe(200);
    }

    const unfavoriteData = await unfavoriteResponse.json();
    expect(unfavoriteData.success).toBe(true);
    expect(unfavoriteData.follower_address).toBe(unfavoriteBody.walletAddr);
    expect(unfavoriteData.unfavorite_trader).toBe(unfavoriteBody.traderAddr);

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

  test("should return HTML for root endpoint", async () => {
    const response = await fetch(`${baseUrl}/`);
    expect(response.status).toBe(200);

    const contentType = response.headers.get("content-type");
    expect(contentType).toContain("text/html");
  });
});
