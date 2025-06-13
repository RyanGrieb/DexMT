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

// Export to global window (for compatibility)
(window as any).Utils = {
  formatNumber,
  formatCurrency,
  formatPercentage,
  truncateAddress,
  isValidAddress,
  formatTimestamp,
  timeAgo,
  createElement,
  showToast,
};
