// Import only what you need from each module
import {
  autoReconnectWallet,
  connectWallet,
  disconnectWallet,
  isWalletConnected,
  provider,
  updateWalletUI,
} from "./metamask";
import profile from "./profile";
import utils from "./utils";
import watchlist from "./watchlist";

console.log("DEXMT JS file loaded");

// Main application initialization
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM loaded, setting up DEXMT...");

  profile.init();
  watchlist.init();

  try {
    // Auto-reconnect wallet if previously connected
    await autoReconnectWallet();
    // sync the Connect/Disconnect button to real wallet state
    await updateWalletUI();
  } catch (error) {
    console.error("Error during initialization:", error);
    utils.showToast("Initialization error", "error");
  }

  // Load content based on current URL
  await loadContentForCurrentPage();

  const topTradersBtn = document.getElementById("topTradersBtn");
  const myWatchListBtn = document.getElementById("myWatchListBtn");

  if (topTradersBtn) {
    topTradersBtn.addEventListener("click", async () => {
      await utils.loadContent({
        apiUrl: "/api/html/toptraders",
        browserUrl: "/toptraders",
        title: "Top Traders",
      });
    });
  }

  if (myWatchListBtn) {
    //FIXME: Authenticate user selected address before loading watchlist
    myWatchListBtn.addEventListener("click", async () => {
      const walletAddress = provider?.selectedAddress;
      await utils.loadContent({
        apiUrl: "/api/html/mywatchlist",
        browserUrl: "/mywatchlist",
        title: "My Watchlist",
        walletAddr: walletAddress || undefined,
      });
    });
  }

  // Add click listeners to trader rows
  document.addEventListener("click", async (event) => {
    const traderRow = (event.target as Element).closest("tr");

    if (!traderRow) return;

    const address = traderRow.getAttribute("address");

    if (!address) return;

    // Get current wallet address for the header (if available)
    const walletAddress = provider?.selectedAddress;

    // Build API URL with userAddress parameter if wallet is connected
    let apiUrl = `/api/html/traderprofile?address=${encodeURIComponent(address)}`;
    if (walletAddress) {
      apiUrl += `&userAddress=${encodeURIComponent(walletAddress)}`;
    }

    await utils.loadContent({
      apiUrl,
      browserUrl: "/traderprofile?address=" + encodeURIComponent(address),
      title: "Trader Profile",
      walletAddr: walletAddress || undefined,
    });
  });

  // Setup wallet connection button
  const connectButton = document.getElementById("connectButton") as HTMLButtonElement;
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

// Function to load content based on current URL
async function loadContentForCurrentPage(): Promise<void> {
  const currentPath = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const walletAddress = provider?.selectedAddress;

  try {
    switch (currentPath) {
      case "/toptraders":
        await utils.loadContent({
          apiUrl: "/api/html/toptraders",
          title: "Top Traders",
          updateUrl: false, // Don't update URL on initial page load
        });
        break;

      case "/mywatchlist":
        await utils.loadContent({
          apiUrl: "/api/html/mywatchlist",
          title: "My Watchlist",
          walletAddr: walletAddress || undefined,
          updateUrl: false, // Don't update URL on initial page load
        });
        break;

      case "/traderprofile":
        const address = searchParams.get("address");
        if (address) {
          let apiUrl = `/api/html/traderprofile?address=${encodeURIComponent(address)}`;
          if (walletAddress) {
            apiUrl += `&userAddress=${encodeURIComponent(walletAddress)}`;
          }

          await utils.loadContent({
            apiUrl,
            title: "Trader Profile",
            walletAddr: walletAddress || undefined,
            updateUrl: false, // Don't update URL on initial page load
          });
        } else {
          await utils.loadContent({
            title: "Trader Profile",
            content: '<div class="error-message">Trader address is required</div>',
            updateUrl: false,
          });
        }
        break;

      default:
        // For root or unknown paths, don't load anything (let redirect handle it)
        break;
    }
  } catch (error) {
    console.error("Error loading initial content:", error);
  }
}

// Global error handler
window.addEventListener("error", (event: ErrorEvent) => {
  console.error("Global error:", event.error);
  utils.showToast("An error occurred. Please refresh the page.", "error");
});

// Export for debugging/compatibility
(window as any).DEXMT = {
  version: "1.0.0",
  initialized: true,
};
