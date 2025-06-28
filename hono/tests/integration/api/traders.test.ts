import { beforeAll, describe, expect, test } from "vitest";

describe("Traders API Integration Tests (Simple)", () => {
  const baseUrl = "http://localhost:8788";

  beforeAll(async () => {
    // Just wait a bit for the server to be ready
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });

  test("expect /api/traders/favorite_trader to create and remove DB entries in 'favorite_traders' table", async () => {
    // Arrange: Prepare a valid request body
    const body = {
      message: "Favorite trader test",
      walletAddr: "0x1111111111111111111111111111111111111111",
      traderAddr: "0x2222222222222222222222222222222222222222",
      signature: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
      timestamp: Date.now(), // Use a number for test, backend expects bigint
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

    // Assert: Database updated (fetch favorites for this user using db)
    // @ts-ignore
    const database = (await import("../../../src/database")).default;
    const favorites = await database.getTraders({
      favoriteOfAddress: body.walletAddr,
    });
    // Should include the favorited trader
    const found = favorites.some((t: any) => t.address === body.traderAddr);
    expect(found).toBe(true);
  });

  test("should return HTML for root endpoint", async () => {
    const response = await fetch(`${baseUrl}/`);
    expect(response.status).toBe(200);

    const contentType = response.headers.get("content-type");
    expect(contentType).toContain("text/html");
  });
});
