import { html } from "hono/html";

// Helper functions (reuse from leaderboard.tsx)
function abbreviateNumber(value: number | string): string {
  const num = Number(value) || 0;
  if (Math.abs(num) >= 1e9) {
    return (num / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  }
  if (Math.abs(num) >= 1e6) {
    return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (Math.abs(num) >= 1e3) {
    return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toLocaleString();
}

function getPlatformIcon(platform: string | null | undefined) {
  //console.log("getPlatformIcon called with platform:", platform);
  if (!platform) {
    return html`<span style="color:#666;">-</span>`;
  }

  const platformLower = platform.toLowerCase();

  switch (platformLower) {
    case "gmx":
      return html`
        <svg width="24" height="24" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gmx-gradient-watched" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
            </linearGradient>
          </defs>
          <path
            fill="url(#gmx-gradient-watched)"
            transform="translate(-525.667 -696) scale(1)"
            d="m555.182 717.462-14.735-21.462-14.78 21.462h20.592l-5.812-8.191-2.883 4.256h-3.064l5.949-8.557 8.6 12.493z"
          />
        </svg>
      `;
    case "dydx":
      return html`<span style="font-size:0.75rem;color:#888;">DYDX</span>`;
    case "hyperliquid":
      return html`<span style="font-size:0.75rem;color:#888;">HL</span>`;
    default:
      return html`<span style="font-size:0.75rem;color:#888;">${platform.toUpperCase()}</span>`;
  }
}

function generateIconColor(address: string): string {
  const hash = address.slice(2, 8);
  const r = parseInt(hash.slice(0, 2), 16);
  const g = parseInt(hash.slice(2, 4), 16);
  const b = parseInt(hash.slice(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

function isValidAddress(address: string): boolean {
  // Basic validation for Ethereum addresses (0x followed by 40 hex characters)
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Helper function to validate timestamp
function validateTimestamp(timestamp: string | number): {
  isValid: boolean;
  timestamp: bigint;
  error?: string;
} {
  const now = Date.now();
  const timestampMs = typeof timestamp === "string" ? parseInt(timestamp) : timestamp;

  if (isNaN(timestampMs)) {
    return {
      isValid: false,
      timestamp: BigInt(0),
      error: "Invalid timestamp format",
    };
  }

  // Check if timestamp is within last 5 minutes to prevent replay attacks
  if (Math.abs(now - timestampMs) > 5 * 60 * 1000) {
    return {
      isValid: false,
      timestamp: BigInt(timestampMs),
      error: "Request timestamp too old",
    };
  }

  return { isValid: true, timestamp: BigInt(timestampMs) };
}

function isValidChainId(chainId: string | number): boolean {
  const validChainIds = ["0xa4b1"]; // Only handling Arbitrum chain ID for now
  return validChainIds.includes(String(chainId));
}

const utils = {
  abbreviateNumber,
  getPlatformIcon,
  generateIconColor,
  validateTimestamp,
  isValidAddress,
  isValidChainId,
};

export default utils;
