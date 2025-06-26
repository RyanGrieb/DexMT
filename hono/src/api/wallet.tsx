import { ethers } from "ethers";
import { Hono } from "hono";
import db from "../database";
import { Trader } from "../types/trader";

interface ConnectedWallet {
  address: string;
  chainId: string;
  timestamp: number;
}

// Store connected wallets (in production, use a database)
let connectedWallets: ConnectedWallet[] = [];

async function init(app: Hono) {
  app.post("/api/wallet/connect", async (c) => {
    let { address, chainId } = await c.req.json();

    if (!address || !chainId) {
      return c.json({ error: "Missing address or chainId" }, 400);
    }

    // Ensure address has the proper uppercase format
    address = ethers.getAddress(address);

    // Store wallet connection
    const existingIndex = connectedWallets.findIndex((w) => w.address === address);
    if (existingIndex >= 0) {
      connectedWallets[existingIndex] = {
        address,
        chainId,
        timestamp: Date.now(),
      };
    } else {
      connectedWallets.push({ address, chainId, timestamp: Date.now() });
    }

    // Add user to database
    console.log("add user to db");
    const trader: Trader = new Trader({
      address: address,
      balance: await getEthBalance(address, "https://arb1.arbitrum.io/rpc"),
      chainId: chainId,
      updatedAt: new Date().toISOString(),
      isDexmtTrader: true,
    });
    db.addTrader(trader);

    console.log(`Wallet connected: ${address} on chain ${chainId}`);
    return c.json({ success: true, message: "Wallet registered" });
  });

  // API endpoint to disconnect wallet
  app.post("/api/wallet/disconnect", async (c) => {
    let { address } = await c.req.json();

    // Ensure address has the proper uppercase format
    address = ethers.getAddress(address);

    connectedWallets = connectedWallets.filter((w) => w.address !== address);

    console.log(`Wallet disconnected: ${address}`);
    return c.json({ success: true, message: "Wallet disconnected" });
  });

  // API endpoint to get connected wallets
  app.get("/api/wallets", (c) => {
    return c.json({ wallets: connectedWallets });
  });
}

// Utility function to verify signature
function verifySignature(message: string, signature: string, expectedAddress: string): boolean {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

async function getEthBalance(address: string, rpcUrl: string): Promise<string> {
  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`RPC Error: ${data.error.message}`);
    }

    // Convert from hex wei to decimal
    const balanceWei = BigInt(data.result);

    // Convert wei to ETH (divide by 10^18)
    const balanceEth = Number(balanceWei) / Math.pow(10, 18);

    return balanceEth.toFixed(6); // Return with 6 decimal places
  } catch (error) {
    console.error(`Error fetching balance for ${address}:`, error);
    return "0"; // Return 0 on error
  }
}

const dexmt_wallet = {
  init,
  connectedWallets,
  verifySignature,
  getEthBalance,
};

export default dexmt_wallet;
