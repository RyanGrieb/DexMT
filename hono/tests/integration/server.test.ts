import { describe, expect, test } from "vitest";

// Simple integration tests that assume server is running
describe("Simple Server Integration Tests", () => {
  const baseUrl = "http://localhost:8788";

  test("should have health endpoint available", async () => {
    const response = await fetch(`${baseUrl}/health`);
    expect(response.status).toBe(200);
  });

  test("404 responses for non-existent endpoints", async () => {
    const response = await fetch(`${baseUrl}/api/nonexistent`);
    expect(response.status).toBe(404);
  });

  test("should return HTML for root endpoint", async () => {
    const response = await fetch(`${baseUrl}/`);
    expect(response.status).toBe(200);

    const contentType = response.headers.get("content-type");
    expect(contentType).toContain("text/html");
  });
});
