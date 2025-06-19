// Import only what you need from each module
import {
  autoReconnectWallet,
  connectWallet,
  disconnectWallet,
  isWalletConnected,
  provider,
  updateWalletUI,
} from "./metamask";
import { showToast } from "./utils";

console.log("DEXMT JS file loaded");

// Helper function to update content without page refresh
async function loadContent(
  endpoint: string,
  title: string,
  userAddress?: string
): Promise<void> {
  try {
    showLoadingState();

    let url = endpoint;
    const headers: Record<string, string> = {};

    // Add wallet address to request if available
    if (userAddress) {
      url += `?address=${encodeURIComponent(userAddress)}`;
      headers["x-wallet-address"] = userAddress;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    // Update the content area
    const contentArea = document.querySelector(".index-content");
    if (contentArea) {
      contentArea.innerHTML = html;

      // Update page title and URL
      document.title = `DEXMT - ${title}`;
      window.history.pushState({}, title, endpoint.replace("/api", ""));

      showToast(`${title} loaded successfully`, "success");
    } else {
      throw new Error("Content area not found");
    }
  } catch (error) {
    console.error(`Error loading ${title}:`, error);
    showToast(`Error loading ${title}. Please try again.`, "error");
  } finally {
    //hideLoadingState();
  }
}

// Show loading state
function showLoadingState(): void {
  const contentArea = document.querySelector(".index-content");
  if (contentArea) {
    contentArea.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    `;
  }
}

// Main application initialization
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM loaded, setting up DEXMT...");

  try {
    // Auto-reconnect wallet if previously connected
    await autoReconnectWallet();
    // sync the Connect/Disconnect button to real wallet state
    await updateWalletUI();
  } catch (error) {
    console.error("Error during initialization:", error);
    showToast("Initialization error", "error");
  }

  const topTradersBtn = document.getElementById("topTradersBtn");
  const myWatchListBtn = document.getElementById("myWatchListBtn");

  if (topTradersBtn) {
    topTradersBtn.addEventListener("click", async () => {
      await loadContent("/api/html/toptraders", "Top Traders");
    });
  }

  if (myWatchListBtn) {
    //FIXME: Authenticate user selected address before loading watchlist
    myWatchListBtn.addEventListener("click", async () => {
      const walletAddress = provider?.selectedAddress;
      await loadContent(
        "/api/html/mywatchlist",
        "My Watchlist",
        walletAddress || undefined
      );
    });

    // Add click listeners to trader rows
    document.addEventListener("click", async (event) => {
      const traderRow = (event.target as Element).closest("tr");

      if (!traderRow) return;

      const address = traderRow.getAttribute("address");

      if (!address) return;

      await loadContent(
        `/api/html/traderprofile?address=${encodeURIComponent(address)}`,
        "Trader Profile"
      );
    });
  }

  // Setup wallet connection button
  const connectButton = document.getElementById(
    "connectButton"
  ) as HTMLButtonElement;
  if (connectButton) {
    connectButton.addEventListener("click", async () => {
      const currentlyConnected = await isWalletConnected();
      if (currentlyConnected) {
        await disconnectWallet();
      } else {
        await connectWallet();
      }
    });
  }

  console.log("DEXMT setup complete");
});

// Global error handler
window.addEventListener("error", (event: ErrorEvent) => {
  console.error("Global error:", event.error);
  showToast("An error occurred. Please refresh the page.", "error");
});

// Export for debugging/compatibility
(window as any).DEXMT = {
  version: "1.0.0",
  initialized: true,
};
