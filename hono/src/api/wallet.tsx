import { zValidator } from "@hono/zod-validator";
import { ethers } from "ethers";
import { Hono } from "hono";
import { JSONStringify } from "json-with-bigint";
import db from "../database/database";
import schemas from "../types/schemas";
import { Trader } from "../types/trader";
import log from "../utils/logs";

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
      address: walletAddr as `0x${string}`,
      balance: await getEthBalance(walletAddr, "https://arb1.arbitrum.io/rpc"),
      chainId: chainId,
      updatedAt: new Date().toISOString(),
      isDexmtTrader: true,
    });
    await db.addTrader(trader);

    log.output(`Wallet connected: ${walletAddr} on chain ${chainId}`);

    return c.json({ success: true, message: "Wallet registered" });
  });

  // API endpoint to disconnect wallet
  app.post("/api/wallet/disconnect", zValidator("json", schemas.disconnectWallet), async (c) => {
    const { walletAddr } = c.req.valid("json");

    connectedWallets = connectedWallets.filter((w) => w.address !== walletAddr);

    log.output(`Wallet disconnected: ${walletAddr}`);
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
      body: JSONStringify({
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
    log.output(`Error fetching ETH balance for ${address}`, "error");
    log.error(error);
    return "0"; // Return 0 on error
  }
}

function verifySignature(message: string, signature: string, expectedAddress: string): boolean {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    log.output(
      `Signature verification failed: msg: ${message}, sig: ${signature}, expected: ${expectedAddress}`,
      "error"
    );
    log.error(error);
    return false;
  }
}

const dexmt_wallet = {
  init,
  verifySignature,
  getEthBalance,
};

export default dexmt_wallet;
