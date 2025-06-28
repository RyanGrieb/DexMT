import { zValidator } from "@hono/zod-validator";
import { ethers } from "ethers";
import { Hono } from "hono";
import db from "../database";
import schemas from "../schemas";
import { Trader } from "../types/trader";
import utils from "../utils";

interface ConnectedWallet {
  address: string;
  chainId: string;
  timestamp: number;
}

let connectedWallets: ConnectedWallet[] = [];

async function init(app: Hono) {
  app.post("api/wallet/connect", zValidator("json", schemas.connectWallet), async (c) => {
    const { walletAddr, chainId } = c.req.valid("json");

    // Store wallet connection
    const existingIndex = connectedWallets.findIndex((w) => w.address === walletAddr);
    if (existingIndex !== -1) {
      connectedWallets[existingIndex] = {
        address: walletAddr,
        chainId,
        timestamp: Date.now(),
      };
    } else {
      connectedWallets.push({ address: walletAddr, chainId, timestamp: Date.now() });
    }

    // Add user to database
    const trader: Trader = new Trader({
      address: walletAddr,
      balance: await getEthBalance(walletAddr, "https://arb1.arbitrum.io/rpc"),
      chainId: chainId,
      updatedAt: new Date().toISOString(),
      isDexmtTrader: true,
    });
    await db.addTrader(trader);

    utils.logOutput(`Wallet connected: ${walletAddr} on chain ${chainId}`);

    return c.json({ success: true, message: "Wallet registered" });
  });

  // API endpoint to disconnect wallet
  app.post("/api/wallet/disconnect", zValidator("json", schemas.disconnectWallet), async (c) => {
    const { walletAddr } = c.req.valid("json");

    connectedWallets = connectedWallets.filter((w) => w.address !== walletAddr);

    utils.logOutput(`Wallet disconnected: ${walletAddr}`);
    return c.json({ success: true, message: "Wallet disconnected" });
  });

  // API endpoint to get connected wallets
  app.get("/api/wallets", (c) => {
    return c.json({ wallets: connectedWallets });
  });
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

function verifySignature(message: string, signature: string, expectedAddress: string): boolean {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

const dexmt_wallet = {
  init,
  verifySignature,
  getEthBalance,
};

export default dexmt_wallet;
