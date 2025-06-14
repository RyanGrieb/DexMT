// Define utility types in this file
export type ToastType = "info" | "error" | "success" | "warning";

// Number formatting utilities
export function formatNumber(
  value: number | string,
  decimals: number = 2
): string {
  const num = Number(value) || 0;
  return num.toFixed(decimals);
}

export function formatCurrency(
  value: number | string,
  currency: string = "$"
): string {
  const num = Number(value) || 0;
  return `${currency}${num.toLocaleString()}`;
}

export function formatPercentage(value: number | string): string {
  const num = Number(value) || 0;
  const sign = num >= 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
}

export function truncateAddress(
  address: string,
  startLength: number = 6,
  endLength: number = 4
): string {
  if (!address || address.length < startLength + endLength) {
    return address;
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function formatTimestamp(timestamp: string | number | Date): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

export function timeAgo(timestamp: string | number | Date): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export function createElement(
  tag: string,
  className?: string,
  innerHTML?: string
): HTMLElement {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (innerHTML) element.innerHTML = innerHTML;
  return element;
}

export function showToast(message: string, type: ToastType = "info"): void {
  // TODO: Implement toast notification system
  console.log(`[${type.toUpperCase()}] ${message}`);
}

function getPlatformIcon(platform: string | null): string {
  if (!platform) {
    return '<span style="color:#666;">-</span>';
  }

  const platformLower = platform.toLowerCase();

  switch (platformLower) {
    case "gmx":
      return `
        <svg width="24" height="24" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gmx-gradient-watched" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
            </linearGradient>
          </defs>
          <path fill="url(#gmx-gradient-watched)" transform="translate(-525.667 -696) scale(1)" d="m555.182 717.462-14.735-21.462-14.78 21.462h20.592l-5.812-8.191-2.883 4.256h-3.064l5.949-8.557 8.6 12.493z"/>
        </svg>
      `;
    case "dydx":
      return `<span style="font-size:0.75rem;color:#888;">DYDX</span>`;
    case "hyperliquid":
      return `<span style="font-size:0.75rem;color:#888;">HL</span>`;
    default:
      return `<span style="font-size:0.75rem;color:#888;">${platform.toUpperCase()}</span>`;
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
  formatNumber,
  formatCurrency,
  formatPercentage,
  truncateAddress,
  isValidAddress,
  formatTimestamp,
  timeAgo,
  createElement,
  showToast,
  getPlatformIcon,
  generateIconColor,
};

export default utils;
