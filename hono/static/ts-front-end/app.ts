// Import only what you need from each module
import { connectWallet, disconnectWallet, provider } from "./metamask";
import { updateTradesUI } from "./trades";
import { updateUsersUI } from "./users";
import { showToast } from "./utils";

console.log("DEXMT JS file loaded");

// Main application initialization
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, setting up DEXMT...");

  // Setup wallet connection button
  const connectButton = document.getElementById(
    "connectButton"
  ) as HTMLButtonElement;
  if (connectButton) {
    connectButton.addEventListener("click", () => {
      if (provider?.isConnected()) {
        disconnectWallet();
      } else {
        connectWallet();
      }
    });
  }

  // Initialize users UI
  updateUsersUI();
  // Refresh users every 10 seconds
  setInterval(updateUsersUI, 10000);

  // Initialize trades UI
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
};
