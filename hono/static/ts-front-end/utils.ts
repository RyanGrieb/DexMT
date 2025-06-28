// Define utility types in this file
export type ToastType = "info" | "error" | "success" | "warning";

// Number formatting utilities
function formatNumber(value: number | string, decimals: number = 2): string {
  const num = Number(value) || 0;
  return num.toFixed(decimals);
}

function formatPercentage(value: number | string): string {
  const num = Number(value) || 0;
  const sign = num >= 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
}

function truncateAddress(address: string, startLength: number = 6, endLength: number = 4): string {
  if (!address || address.length < startLength + endLength) {
    return address;
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function formatTimestamp(timestamp: string | number | Date): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

function timeAgo(timestamp: string | number | Date): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

function createElement(tag: string, className?: string, innerHTML?: string): HTMLElement {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (innerHTML) element.innerHTML = innerHTML;
  return element;
}

function showToast(message: string, type: ToastType = "info"): void {
  // TODO: Implement toast notification system
  console.log(`[${type.toUpperCase()}] ${message}`);
}

function generateIconColor(address: string): string {
  const hash = address.slice(2, 8);
  const r = parseInt(hash.slice(0, 2), 16);
  const g = parseInt(hash.slice(2, 4), 16);
  const b = parseInt(hash.slice(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

function watchElementsOfQuery(query: string, onElementLoad: (element: Element) => void) {
  // Handle existing elements on initial load
  const existingElements = document.querySelectorAll(query);
  existingElements.forEach((el) => onElementLoad(el));

  // Set up a MutationObserver for newly added elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          // Check if the added node matches our query
          if (element.matches(query)) {
            onElementLoad(element);
          }
          // Check any child elements
          element.querySelectorAll(query).forEach((child) => {
            onElementLoad(child);
          });
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function showNotification(message: string, type: "success" | "error" | "info"): void {
  // Simple notification implementation
  // You can replace this with your preferred notification library
  console.log(`${type.toUpperCase()}: ${message}`);

  // Optional: Create a simple toast notification
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"};
    color: white;
    border-radius: 8px;
    z-index: 1000;
    transition: opacity 0.3s ease;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

const utils = {
  formatNumber,
  formatPercentage,
  truncateAddress,
  isValidAddress,
  formatTimestamp,
  timeAgo,
  createElement,
  showToast,
  generateIconColor,
  watchElementsOfQuery,
  showNotification,
};

export default utils;
