import { html } from "hono/html";

// Helper functions (reuse from leaderboard.tsx)
function abbreviateNumber(value: number | string): string {
  const num = Number(value) || 0;
  if (Math.abs(num) >= 1e6) {
    return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (Math.abs(num) >= 1e3) {
    return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toLocaleString();
}

function getPlatformIcon(platform: string | null | undefined): ReturnType<typeof html> {
  if (!platform) {
    return html`<span style="color:#666;">-</span>`;
  }

  const platformLower = platform.toLowerCase();

  switch (platformLower) {
    case "gmx":
      return html`<span style="color:#4f46e5; font-weight: bold;">GMX</span>`;
    case "dydx":
      return html`<span style="color:#6366f1; font-weight: bold;">dYdX</span>`;
    case "hyperliquid":
      return html`<span style="color:#8b5cf6; font-weight: bold;">HL</span>`;
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

const utils = {
  abbreviateNumber,
  getPlatformIcon,
  generateIconColor,
};

export default utils;
