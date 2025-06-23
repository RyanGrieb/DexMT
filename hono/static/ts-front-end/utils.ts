import { provider } from "./metamask";

// Define utility types in this file
export type ToastType = "info" | "error" | "success" | "warning";

// Number formatting utilities
function formatNumber(value: number | string, decimals: number = 2): string {
  const num = Number(value) || 0;
  return num.toFixed(decimals);
}

function formatCurrency(value: number | string, currency: string = "$"): string {
  const num = Number(value) || 0;
  return `${currency}${num.toLocaleString()}`;
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

// Helper function to update content with optional URL change
async function loadContent({
  apiUrl,
  browserUrl,
  title,
  walletAddr,
  content,
  updateUrl = true,
}: {
  apiUrl?: string;
  browserUrl?: string;
  title: string;
  walletAddr?: string;
  content?: string;
  updateUrl?: boolean;
}): Promise<void> {
  try {
    if (content) {
      // Use provided content directly
      const contentDiv = document.querySelector(".index-content");
      if (contentDiv) {
        contentDiv.innerHTML = content;
      }
      document.title = title;

      // Update URL if requested and browserUrl is provided
      if (updateUrl && browserUrl) {
        window.history.pushState({}, title, browserUrl);
      }
      return;
    }

    if (!apiUrl) {
      throw new Error("No API URL or content provided");
    }

    document.title = title;

    // Update browser URL if requested and browserUrl is provided
    if (updateUrl && browserUrl) {
      window.history.pushState({}, title, browserUrl);
    }

    showLoadingState();

    // Get the current wallet address if not provided
    const walletAddress = walletAddr || provider?.selectedAddress;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add wallet address to headers if available
    if (walletAddress) {
      headers["x-wallet-address"] = walletAddress;
    }

    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    // Update content
    const contentDiv = document.querySelector(".index-content");
    if (contentDiv) {
      contentDiv.innerHTML = html;
    }
  } catch (error) {
    console.error("Error loading content:", error);
    showNotification("Error loading content", "error");
  }
}

function showLoadingState(): void {
  const contentArea = document.querySelector(".index-content");
  if (contentArea) {
    contentArea.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading content, please wait...</p>
      </div>
    `;
  }
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

async function loadProfile(address: string | null, walletAddress: string | null | undefined): Promise<void> {
  if (address) {
    let apiUrl = `/api/html/traderprofile?address=${encodeURIComponent(address)}`;
    let browserUrl = `/traderprofile?address=${encodeURIComponent(address)}`;
    if (walletAddress) {
      apiUrl += `&userAddress=${encodeURIComponent(walletAddress)}`;
    }

    await loadContent({
      apiUrl,
      browserUrl,
      title: "Trader Profile",
      walletAddr: walletAddress || undefined,
      updateUrl: true, // ← now pushState into history
    });
  } else {
    await loadContent({
      title: "Trader Profile",
      content: '<div class="error-message">Trader address is required</div>',
      updateUrl: false,
    });
  }
}

// Function to load content based on current URL
async function loadContentForCurrentPage(): Promise<void> {
  const currentPath = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const walletAddress = provider?.selectedAddress;

  try {
    switch (currentPath) {
      case "/toptraders":
        await loadContent({
          apiUrl: "/api/html/toptraders",
          title: "Top Traders",
          updateUrl: false, // Don't update URL on initial page load
        });
        break;

      case "/mywatchlist":
        await loadContent({
          apiUrl: "/api/html/mywatchlist",
          title: "My Watchlist",
          walletAddr: walletAddress || undefined,
          updateUrl: false, // Don't update URL on initial page load
        });
        break;

      case "/traderprofile":
        const address = searchParams.get("address");
        loadProfile(address, walletAddress);
        break;

      default:
        // For root or unknown paths, don't load anything (let redirect handle it)
        break;
    }
  } catch (error) {
    console.error("Error loading initial content:", error);
  }
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
  loadContent,
  watchElementsOfQuery,
  showNotification,
  loadProfile,
  loadContentForCurrentPage,
};

export default utils;
