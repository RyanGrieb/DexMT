import detectEthereumProvider from "@metamask/detect-provider";
import type { MetaMaskInpageProvider } from "@metamask/providers";

// Define MetaMask-specific interfaces in this file
export interface ArbitrumNetwork {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

// MetaMask provider detection and handling
export let provider: MetaMaskInpageProvider | null = null;

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
  const connectButton = document.getElementById("connectButton") as HTMLElement;
  const walletAddress = document.getElementById("walletAddress") as HTMLElement;
  const networkStatus = document.getElementById("networkStatus") as HTMLElement;

  console.log("1");
  if (!connectButton || !walletAddress || !networkStatus) return;

  if (provider?.isConnected) {
    connectButton.textContent = "Disconnect Wallet";
    const address = provider.selectedAddress ?? "";
    walletAddress.textContent = address
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : "";

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
    connectButton.textContent = "Connect Wallet";
    walletAddress.textContent = "";
    networkStatus.textContent = "";
  }
}

export async function connectWallet(): Promise<void> {
  if (!provider) await waitForMetaMaskProvider();
  if (!provider) return;

  // EIP-2255 / EIP-6963 style grant
  await provider.request({
    method: "wallet_requestPermissions",
    params: [{ eth_accounts: {} }],
  });

  // selectedAddress will now be set
  console.log("Connected account:", provider.selectedAddress);
  updateWalletUI();
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
        console.warn(
          "Failed to notify backend of wallet disconnection:",
          fetchError
        );
      }
    }

    provider = null;
    updateWalletUI();

    console.log("Wallet disconnected successfully");
  } catch (error) {
    console.error("Error disconnecting wallet:", error);
    provider = null;
    updateWalletUI();
  }
}

/** Wait until MetaMask injects the provider per EIP-6963 */
export async function waitForMetaMaskProvider(): Promise<void> {
  provider = (await detectEthereumProvider({
    mustBeMetaMask: true,
    silent: false,
  })) as MetaMaskInpageProvider | null;

  if (!provider) {
    console.error("MetaMask not detected");
    return;
  }

  // wire up listeners with proper args signature
  provider.on("accountsChanged", (...args: unknown[]) => {
    const accounts = args[0] as string[];
    handleAccountsChanged(accounts);
  });

  provider.on("chainChanged", (...args: unknown[]) => {
    const chainId = args[0] as string;
    handleChainChanged(chainId);
  });

  provider.on("connect", (...args: unknown[]) => {
    console.log("MetaMask connected", args[0]);
  });

  provider.on("disconnect", (...args: unknown[]) => {
    console.log("MetaMask disconnected", args[0]);
  });
}

function handleAccountsChanged(accounts: string[]): void {
  console.log("Accounts changed (detected):", accounts);

  updateWalletUI();
}

function handleChainChanged(chainId: string): void {
  console.log("Chain changed (detected) to:", chainId);
  updateNetworkStatus(chainId);
}
