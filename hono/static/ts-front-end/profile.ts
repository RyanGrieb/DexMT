import { provider } from "./metamask";
import utils from "./utils";

function init() {
  utils.watchElementsOfQuery(".back-button", (button) => {
    button.addEventListener("click", () => {
      utils.loadContent({
        apiUrl: "/api/html/toptraders",
        browserUrl: "/toptraders",
        title: "Top Traders",
      });
    });
  });

  utils.watchElementsOfQuery(".favorite-button", (button) => {
    console.log("Found favorite button");
    button.addEventListener("click", async () => {
      const favoriteAddr = button.getAttribute("data-address");

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
      const originalText = button.textContent?.trim() || "";
      button.textContent = "Processing...";

      try {
        // Check current favorite status
        const isFavorited = button.classList.contains("favorited");
        console.log("Favoriting trader:", !isFavorited);

        const heartPath = isFavorited
          ? "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          : "M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zM12.1 18.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z";

        if (isFavorited) {
          await unfavoriteTrader(walletAddress, favoriteAddr);
          button.classList.remove("favorited");
          button.textContent = "Favorite";
          utils.showNotification("Trader unfavorited successfully", "success");
        } else {
          // Send favorite request to server
          await favoriteTrader(walletAddress, favoriteAddr);
          // Toggle favorite state on success
          button.classList.add("favorited");
          button.textContent = "Unfavorite";
          utils.showNotification("Trader favorited successfully", "success");
        }

        // Add back the SVG icon
        const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svgElement.setAttribute("height", "20");
        svgElement.setAttribute("viewBox", "0 0 24 24");
        svgElement.setAttribute("width", "20");

        const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path1.setAttribute("d", "M0 0h24v24H0z");
        path1.setAttribute("fill", "none");

        const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path2.setAttribute("d", heartPath);

        svgElement.appendChild(path1);
        svgElement.appendChild(path2);

        button.insertBefore(svgElement, button.firstChild);
      } catch (error) {
        console.error("Error favoriting trader:", error);
        utils.showNotification("Failed to favorite trader", "error");
        // Restore original text and state in case of error
        if (originalText) {
          button.textContent = originalText;
        }
      }
    });
  });
}

async function unfavoriteTrader(followerAddr: string, favoriteAddr: string): Promise<void> {
  try {
    // Create timestamp
    const timestamp = Date.now();

    // Create message to sign
    const message = `Unfavorite trader ${favoriteAddr} for ${followerAddr} at ${timestamp}`;

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
    const response = await fetch(`/api/traders/${followerAddr}/unfavorite_trader`, {
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
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData || "Failed to unfavorite trader");
    }

    const result = await response.json();
    console.log("Unfavorite trader response:", result);
  } catch (error) {
    console.error("Error in unfavoriteTrader:", error);
    throw error;
  }
}

async function favoriteTrader(followerAddr: string, favoriteAddr: string): Promise<void> {
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
    const response = await fetch(`/api/traders/${followerAddr}/favorite_trader`, {
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
    });

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
  favoriteTrader,
  unfavoriteTrader,
};

export default profile;
