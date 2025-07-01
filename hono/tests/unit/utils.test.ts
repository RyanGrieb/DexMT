import { describe, expect, test } from "vitest";
import utils from "../../src/utils/utils";

// Test utility functions that don't require external dependencies
describe("Utility Functions", () => {
  test("should abbreviate numbers correctly", () => {
    expect(utils.abbreviateNumber(1000)).toBe("1K");
    expect(utils.abbreviateNumber(1500)).toBe("1.5K");
    expect(utils.abbreviateNumber(1000000)).toBe("1M");
    expect(utils.abbreviateNumber(1500000)).toBe("1.5M");
    expect(utils.abbreviateNumber(1000000000)).toBe("1B");
    expect(utils.abbreviateNumber(999)).toBe("999");
  });

  test("should generate icon colors consistently", () => {
    // Mock icon color generation
    const address1 = "0x1234567890123456789012345678901234567890";
    const address2 = "0x0987654321098765432109876543210987654321";

    // Same address should always generate same color
    expect(utils.generateIconColor(address1)).toBe(utils.generateIconColor(address1));

    // Different addresses might generate different colors
    const color1 = utils.generateIconColor(address1);
    const color2 = utils.generateIconColor(address2);

    // Both should be valid colors
    expect(color1).toMatch("rgb(18, 52, 86)");
    expect(color2).toMatch("rgb(9, 135, 101)");
  });

  test("should validate ethereum addresses", () => {
    expect(utils.isValidAddress("0x1234567890123456789012345678901234567890")).toBe(true);
    expect(utils.isValidAddress("0x0987654321098765432109876543210987654321")).toBe(true);
    expect(utils.isValidAddress("invalid")).toBe(false);
    expect(utils.isValidAddress("0x123")).toBe(false);
    expect(utils.isValidAddress("")).toBe(false);
  });

  test("should calculate percentage correctly", () => {
    const calculatePercentage = (value: number, total: number): number => {
      if (total === 0) return 0;
      return (value / total) * 100;
    };

    expect(calculatePercentage(25, 100)).toBe(25);
    expect(calculatePercentage(1, 3)).toBeCloseTo(33.33, 2);
    expect(calculatePercentage(0, 100)).toBe(0);
    expect(calculatePercentage(100, 0)).toBe(0);
  });
});
