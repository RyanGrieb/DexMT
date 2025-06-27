import { getWalletAddr } from "./metamask";
import utils from "./utils";

async function loadProfile(address: string | null): Promise<void> {
  if (address) {
    let apiUrl = `/api/html/traderprofile?address=${encodeURIComponent(address)}`;
    let browserUrl = `/traderprofile?address=${encodeURIComponent(address)}`;

    const walletAddr = getWalletAddr();
    if (walletAddr) {
      apiUrl += `&userAddress=${encodeURIComponent(walletAddr)}`;
    }

    await loadContent({
      apiUrl,
      browserUrl,
      title: "Trader Profile",
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
          updateUrl: false, // Don't update URL on initial page load
        });
        break;

      case "/traderprofile":
        const address = searchParams.get("address");
        loadProfile(address);
        break;

      default:
        // For root or unknown paths, don't load anything (let redirect handle it)
        break;
    }
  } catch (error) {
    console.error("Error loading initial content:", error);
  }
}

// Helper function to update content with optional URL change
async function loadContent({
  apiUrl,
  browserUrl,
  title,
  content,
  updateUrl = true,
}: {
  apiUrl?: string;
  browserUrl?: string;
  title: string;
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
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-timezone": tz,
    };

    // Add wallet address to headers if available
    const walletAddr = getWalletAddr();
    if (walletAddr) {
      headers["x-wallet-address"] = walletAddr;
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
    utils.showNotification("Error loading content", "error");
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

const router = {
  loadProfile,
  loadContentForCurrentPage,
  loadContent,
  showLoadingState,
};

export default router;
