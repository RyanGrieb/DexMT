import detectEthereumProvider from "@metamask/detect-provider";
import type { MetaMaskInpageProvider } from "@metamask/providers";

// Define MetaMask-specific interfaces in this file
export interface ArbitrumNetwork {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: 18;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

// MetaMask provider detection and handling
export let provider: MetaMaskInpageProvider | null = null;

// Track connection timestamp for expiry (this is just for our 7-day rule)
const CONNECTION_TIME_KEY = "metamask_connection_time";

// Arbitrum One network configuration
const ARBITRUM_NETWORK: ArbitrumNetwork = {
  chainId: "0xa4b1", // 42161 in hex
  chainName: "Arbitrum One",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://arb1.arbitrum.io/rpc"],
  blockExplorerUrls: ["https://arbiscan.io/"],
};

function updateNetworkStatus(chainId: string): void {
  const networkStatus = document.getElementById("networkStatus") as HTMLElement;
  if (!networkStatus) return;

  if (chainId === ARBITRUM_NETWORK.chainId) {
    networkStatus.textContent = "✅ Arbitrum One";
    networkStatus.style.color = "green";
  } else {
    networkStatus.textContent = "⚠️ Wrong Network";
    networkStatus.style.color = "orange";
  }
}

export async function updateWalletUI(): Promise<void> {
  const connectButton = document.getElementById("connectButton") as HTMLButtonElement;
  if (!connectButton) return;

  const connected = provider?.isConnected() && provider.selectedAddress;

  console.log(`Updating wallet UI, connected: ${connected}`);

  // Update button text - the button contains both SVG and text
  const buttonTextElement = connectButton.querySelector("p") || connectButton;
  if (buttonTextElement.tagName === "P") {
    buttonTextElement.textContent = connected ? "Disconnect Wallet" : "Connect Wallet";
  } else {
    // If no <p> element, update the button's text content while preserving the SVG
    const svgElement = connectButton.querySelector("svg");
    connectButton.innerHTML = "";
    if (svgElement) {
      connectButton.appendChild(svgElement);
    }
    const textNode = document.createTextNode(connected ? "Disconnect Wallet" : "Connect Wallet");
    connectButton.appendChild(textNode);
  }

  // Get wallet info elements - these have different IDs in your HTML
  const walletAddress = document.getElementById("walletAddress") as HTMLElement;
  const networkStatus = document.getElementById("networkStatus") as HTMLElement;

  if (!walletAddress || !networkStatus) {
    console.warn("Wallet info elements not found in DOM");
    return;
  }

  if (connected) {
    const address = provider!.selectedAddress!;

    // Update wallet address display
    walletAddress.textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
    walletAddress.classList.remove("hidden");

    // Update network status
    networkStatus.classList.remove("hidden");

    try {
      if (provider && provider.isMetaMask) {
        updateNetworkStatus(provider.chainId || "");
      }
    } catch (error) {
      console.error("Error getting chain ID:", error);
      networkStatus.textContent = "❌ Network Error";
      networkStatus.style.color = "red";
    }
  } else {
    // Hide wallet info when disconnected
    walletAddress.textContent = "";
    walletAddress.classList.add("hidden");

    networkStatus.textContent = "";
    networkStatus.classList.add("hidden");
  }
}

export async function connectWallet(): Promise<void> {
  console.log("Connect wallet called");

  try {
    // Always ensure we have a fresh provider reference
    await waitForMetaMaskProvider();

    if (!provider) {
      console.error("MetaMask not available after waiting");
      alert("MetaMask not detected. Please install MetaMask to continue.");
      return;
    }

    console.log("Provider found, requesting connection...");

    // Request wallet connection with permissions
    const result = await provider.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });

    console.log("Permission result:", result);

    // Store connection timestamp for our 7-day expiry rule
    localStorage.setItem(CONNECTION_TIME_KEY, Date.now().toString());

    // Post request to /api/wallet/connect to notify backend of connection
    await fetch("/api/wallet/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: provider.selectedAddress,
        chainId: provider.chainId,
      }),
    });

    // Update UI immediately after successful connection
    await updateWalletUI();

    console.log("Wallet connection successful, connected account:", provider.selectedAddress);
  } catch (error: any) {
    console.error("Full error object:", error);
    if (error.code === 4001) {
      console.log("User rejected wallet connection");
    } else if (error.code === -32002) {
      console.log("Connection request already pending");
      alert("Connection request already pending. Please check MetaMask.");
    } else {
      console.error("Error connecting wallet:", error);
      alert(`Failed to connect wallet: ${error.message || "Unknown error"}`);
    }

    // Ensure UI is updated even on error
    await updateWalletUI();
  }
}

export async function checkExistingConnection(): Promise<boolean> {
  try {
    // Ensure we have the provider first
    if (!provider) {
      await waitForMetaMaskProvider();
    }

    if (!provider) {
      console.log("MetaMask not available for connection check");
      return false;
    }

    // Check if we have existing permissions
    const permissions = (await provider.request({
      method: "wallet_getPermissions",
    })) as any[];

    const accountsPermission = permissions.find((permission) => permission.parentCapability === "eth_accounts");

    if (accountsPermission) {
      // We have permissions, now get the accounts
      const accounts = (await provider.request({
        method: "eth_accounts",
      })) as string[];

      if (accounts.length > 0) {
        console.log("Existing connection found:", accounts[0]);
        await updateWalletUI();
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking existing connection:", error);
    return false;
  }
}

export async function disconnectWallet(): Promise<void> {
  console.log("Disconnecting wallet...");

  try {
    // Notify backend of disconnection
    if (provider?.isConnected()) {
      try {
        await fetch("/api/wallet/disconnect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: provider.selectedAddress,
          }),
        });
      } catch (fetchError) {
        console.warn("Failed to notify backend of wallet disconnection:", fetchError);
      }
    }

    // Clear connection timestamp
    localStorage.removeItem(CONNECTION_TIME_KEY);

    // Revoke permissions to properly disconnect
    if (provider) {
      try {
        await provider.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        });
        console.log("Wallet permissions revoked successfully");
      } catch (revokeError) {
        console.warn("Could not revoke permissions:", revokeError);
        // Some MetaMask versions may not support this method
        // In that case, we'll just clear our local state
      }
    }

    // Clear our local provider state
    provider = null;
    await updateWalletUI();

    console.log("Wallet disconnected successfully");
  } catch (error) {
    console.error("Error disconnecting wallet:", error);
    // Always clear local state even if there's an error
    localStorage.removeItem(CONNECTION_TIME_KEY);
    provider = null;
    await updateWalletUI();
  }
}

/** Wait until MetaMask injects the provider per EIP-6963 */
export async function waitForMetaMaskProvider(): Promise<void> {
  console.log("Waiting for MetaMask provider...");

  // Only set up provider if we don't already have one
  if (!provider) {
    provider = (await detectEthereumProvider({
      mustBeMetaMask: true,
      silent: false,
      timeout: 5000, // 5 second timeout
    })) as MetaMaskInpageProvider | null;

    if (!provider) {
      console.error("MetaMask not detected after waiting");
      return;
    }

    console.log("MetaMask provider detected, setting up listeners...");

    // Remove existing listeners to avoid duplicates
    if (provider.removeAllListeners) {
      provider.removeAllListeners();
    }

    // wire up listeners with proper args signature
    provider.on("accountsChanged", (...args: unknown[]) => {
      const accounts = args[0] as string[];
      console.log("accountsChanged event:", accounts);
      handleAccountsChanged(accounts);
    });

    provider.on("chainChanged", (...args: unknown[]) => {
      const chainId = args[0] as string;
      console.log("chainChanged event:", chainId);
      handleChainChanged(chainId);
    });

    provider.on("connect", (...args: unknown[]) => {
      console.log("MetaMask connected event", args[0]);
      updateWalletUI();
    });

    provider.on("disconnect", (...args: unknown[]) => {
      console.log("MetaMask disconnected event", args[0]);
      updateWalletUI();
    });
  } else {
    console.log("Provider already exists");
  }
}

function handleAccountsChanged(accounts: string[]): void {
  console.log("Accounts changed (detected):", accounts);

  if (accounts.length === 0) {
    // User disconnected their wallet from MetaMask interface
    // Clear connection timestamp since user disconnected
    localStorage.removeItem(CONNECTION_TIME_KEY);
    provider = null;
  }

  updateWalletUI();
}

function handleChainChanged(chainId: string): void {
  console.log("Chain changed (detected) to:", chainId);
  updateNetworkStatus(chainId);
}

// Auto-reconnect function to be called on page load
export async function autoReconnectWallet(): Promise<void> {
  // First check if our connection is expired (7 days)
  const connectionTime = localStorage.getItem(CONNECTION_TIME_KEY);
  if (connectionTime) {
    const timeDiff = Date.now() - parseInt(connectionTime);
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    if (timeDiff > sevenDaysInMs) {
      // Connection is older than 7 days, clear it and don't auto-reconnect
      localStorage.removeItem(CONNECTION_TIME_KEY);
      console.log("Connection expired (older than 7 days)");

      // Also revoke permissions since they're expired
      try {
        if (!provider) await waitForMetaMaskProvider();
        if (provider) {
          await provider.request({
            method: "wallet_revokePermissions",
            params: [{ eth_accounts: {} }],
          });
        }
      } catch (error) {
        console.warn("Could not revoke expired permissions:", error);
      }

      return;
    }
  }

  // Now check MetaMask's actual permission state
  const connected = await checkExistingConnection();
  if (!connected) {
    console.log("No existing wallet connection found");
    // Clear timestamp if no permissions exist
    localStorage.removeItem(CONNECTION_TIME_KEY);
  }
}

// Helper function to check if wallet is actually connected (permissions + accounts)
export async function isWalletConnected(): Promise<boolean> {
  if (!provider) {
    console.log("No provider available for connection check");
    return false;
  }

  try {
    // First check if provider thinks it's connected
    if (!provider.isConnected() || !provider.selectedAddress) {
      console.log("Provider not connected or no selected address");
      return false;
    }

    // Then check permissions
    const permissions = (await provider.request({
      method: "wallet_getPermissions",
    })) as any[];

    const accountsPermission = permissions.find((permission) => permission.parentCapability === "eth_accounts");

    if (!accountsPermission) {
      console.log("No eth_accounts permission found");
      return false;
    }

    // Finally check accounts
    const accounts = (await provider.request({
      method: "eth_accounts",
    })) as string[];

    const connected = accounts.length > 0;
    console.log("Wallet connection check result:", connected, "accounts:", accounts.length);
    return connected;
  } catch (error) {
    console.error("Error checking wallet connection:", error);
    return false;
  }
}
