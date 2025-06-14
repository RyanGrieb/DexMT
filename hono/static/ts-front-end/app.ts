// Import only what you need from each module
import {
  autoReconnectWallet,
  connectWallet,
  disconnectWallet,
  isWalletConnected,
  updateWalletUI,
} from "./metamask";
import { router } from "./router";
import { updateTradesUI } from "./trades";
import { showToast } from "./utils";

console.log("DEXMT JS file loaded");

// Main application initialization
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM loaded, setting up DEXMT...");

  try {
    // Auto-reconnect wallet if previously connected
    await autoReconnectWallet();
    // sync the Connect/Disconnect button to real wallet state
    await updateWalletUI();

    // Initialize router and load the appropriate view based on URL
    await router.init();
  } catch (error) {
    console.error("Error during initialization:", error);
    showToast("Failed to initialize application", "error");
  }

  // Setup navigation buttons with router
  const topTradersBtn = document.getElementById("topTradersBtn");
  const myWatchListBtn = document.getElementById("myWatchListBtn");

  if (topTradersBtn) {
    topTradersBtn.addEventListener("click", () => {
      router.navigateTo("top-traders");
    });
  }

  if (myWatchListBtn) {
    myWatchListBtn.addEventListener("click", () => {
      router.navigateTo("watch-list");
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

  updateTradesUI();

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
  router: router,
};
