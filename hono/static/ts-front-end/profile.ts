import { provider } from "./metamask";
import utils from "./utils";

function init() {
  utils.watchElementsOfClass("back-button", (button) => {
    button.addEventListener("click", () => {
      utils.loadContent({
        apiUrl: "/api/html/toptraders",
        browserUrl: "/toptraders",
        title: "Top Traders",
      });
    });
  });

  utils.watchElementsOfClass("favorite-button", (button) => {
    console.log("Found favorite button");
    button.addEventListener("click", async () => {
      const favoriteAddr = button.getAttribute("data-address");
      console.log("Favoriting trader:", favoriteAddr);

      if (!favoriteAddr) {
        console.error("No trader address found");
        return;
      }

      // Check if wallet is connected using MetaMask provider
      if (!provider || !provider.selectedAddress) {
        utils.showNotification("Please connect your wallet first", "error");
        return;
      }

      const walletAddress = provider.selectedAddress;

      // Disable button during request
      const originalText = button.textContent;
      button.textContent = "Processing...";

      try {
        // Check current favorite status
        const isFavorited = button.classList.contains("favorited");

        if (isFavorited) {
          // TODO: Implement unfavorite functionality
          utils.showNotification(
            "Unfavorite functionality not yet implemented",
            "info"
          );
          return;
        }

        // Send favorite request to server
        await favoriteTrader(walletAddress, favoriteAddr);

        // Toggle favorite state on success
        button.classList.add("favorited");
        const icon = button.querySelector("svg path:last-child");
        // Filled heart icon
        icon?.setAttribute(
          "d",
          "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        );
        utils.showNotification("Trader favorited successfully", "success");
      } catch (error) {
        console.error("Error favoriting trader:", error);
        utils.showNotification("Failed to favorite trader", "error");
      } finally {
        // Re-enable button
        button.textContent = originalText;
      }
    });
  });
}

async function favoriteTrader(
  followerAddr: string,
  favoriteAddr: string
): Promise<void> {
  try {
    // Create timestamp
    const timestamp = Date.now();

    // Create message to sign
    const message = `Favorite trader ${favoriteAddr} for ${followerAddr} at ${timestamp}`;

    // Request wallet signature using MetaMask provider
    if (!provider) {
      throw new Error("MetaMask provider not available");
    }

    const signature = (await provider.request({
      method: "personal_sign",
      params: [message, followerAddr],
    })) as string;

    if (!signature) {
      throw new Error("Failed to get wallet signature");
    }

    // Send request to backend
    const response = await fetch(
      `/api/traders/${followerAddr}/favorite_trader`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          favoriteAddr,
          signature,
          message,
          timestamp,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to favorite trader");
    }

    const result = await response.json();
    console.log("Favorite trader response:", result);
  } catch (error) {
    console.error("Error in favoriteTrader:", error);
    throw error;
  }
}

const profile = {
  init,
};

export default profile;
