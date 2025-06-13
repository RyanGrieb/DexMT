// Import only what you need from each module
import { connectWallet, disconnectWallet, provider } from "./metamask";
import { updateTradesUI } from "./trades";
import { updateUsersUI } from "./users";
import { showToast } from "./utils";

console.log("DEXMT JS file loaded");

// Main application initialization
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM loaded, setting up DEXMT...");

  try {
    // Load top traders HTML first and wait for it to complete
    const response = await fetch("/html/top-traders.html");
    const html = await response.text();

    const indexContent = document.querySelector(".index-content");
    if (indexContent) {
      indexContent.innerHTML = html;
    }

    // Now that the HTML is loaded, initialize users UI
    updateUsersUI();
    // Refresh users every 60 seconds
    setInterval(updateUsersUI, 60000);
  } catch (error) {
    console.error("Error loading top traders HTML:", error);
    showToast("Failed to load traders data", "error");
  }

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
