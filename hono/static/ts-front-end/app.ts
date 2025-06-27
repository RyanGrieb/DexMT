// Import only what you need from each module
import { autoReconnectWallet, connectWallet, disconnectWallet, isWalletConnected, updateWalletUI } from "./metamask";
import profile from "./profile";
import router from "./router";
import utils from "./utils";
import favorites from "./watchlist/favorites";
import openPositions from "./watchlist/open-positions";

console.log("DEXMT JS file loaded");

window.addEventListener("popstate", async () => {
  console.log("Popstate, loading content…");
  await router.loadContentForCurrentPage();
});

// Main application initialization
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM loaded, setting up DEXMT...");

  profile.init();
  favorites.init();
  openPositions.init();

  try {
    // Auto-reconnect wallet if previously connected
    await autoReconnectWallet();
    // sync the Connect/Disconnect button to real wallet state
    await updateWalletUI();
  } catch (error) {
    console.error("Error during initialization:", error);
    utils.showToast("Initialization error", "error");
  }

  // initial load
  await router.loadContentForCurrentPage();

  const topTradersBtn = document.getElementById("topTradersBtn");
  const myWatchListBtn = document.getElementById("myWatchListBtn");

  if (topTradersBtn) {
    topTradersBtn.addEventListener("click", async () => {
      await router.loadContent({
        apiUrl: "/api/html/toptraders",
        browserUrl: "/toptraders",
        title: "Top Traders",
      });
    });
  }

  if (myWatchListBtn) {
    //FIXME: Authenticate user selected address before loading watchlist
    myWatchListBtn.addEventListener("click", async () => {
      await router.loadContent({
        apiUrl: "/api/html/mywatchlist",
        browserUrl: "/mywatchlist",
        title: "My Watchlist",
      });
    });
  }

  // Add click listeners to trader rows
  document.addEventListener("click", async (event) => {
    const traderRow = (event.target as Element).closest("tr");

    if (!traderRow) return;

    const profileAddr = traderRow.getAttribute("address");

    if (!profileAddr) return;

    await router.loadProfile(profileAddr);
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
