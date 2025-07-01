import { HDNodeWallet } from "ethers";
import { JSONStringify } from "json-with-bigint";
import { expect } from "vitest";

export const baseUrl = "http://localhost:8788";
export const chainId = "0xa4b1"; // Arbitrum One

export async function getPositions(wallet: HDNodeWallet) {
  const response = await fetch(`${baseUrl}/api/traders/positions?walletAddr=${wallet.address}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (response.status !== 200) {
    const errorText = await response.text();
    console.error(`Failed to fetch open positions for ${wallet.address}: ${errorText}`);
  }
  expect(response.status).toBe(200);

  return response.json();
}

export async function getTrades(wallet: HDNodeWallet) {
  const response = await fetch(`${baseUrl}/api/traders/trades?walletAddr=${wallet.address}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (response.status !== 200) {
    const errorText = await response.text();
    console.error(`Failed to fetch trades for ${wallet.address}: ${errorText}`);
  }
  expect(response.status).toBe(200);

  return response.json();
}

export async function resetTraders() {
  const resetResponse = await fetch(`${baseUrl}/api/traders/reset`, {
    method: "POST",
  });

  if (resetResponse.status !== 200) {
    const errorText = await resetResponse.text();
    console.error(`Reset failed with status ${resetResponse.status}: ${errorText}`);
  }
  expect(resetResponse.status).toBe(200);
}

export async function connectWallet(wallet: HDNodeWallet) {
  // Arrange: Prepare a valid request body
  const connectBody = {
    walletAddr: wallet.address,
    chainId: "0xa4b1",
  };

  const response = await fetch(`${baseUrl}/api/wallet/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSONStringify(connectBody),
  });

  expect(response.status).toBe(200);
}

export async function favoriteTrader(wallet: HDNodeWallet, targetWallet: HDNodeWallet, favorite: boolean) {
  const timestamp = Date.now();
  const message = `${favorite ? "Favorite" : "Unfavorite"} trader ${targetWallet.address} for ${wallet.address} at ${timestamp}`;
  const signature = await wallet.signMessage(message);

  const body = {
    message: message,
    walletAddr: wallet.address,
    traderAddr: targetWallet.address,
    signature: signature,
    timestamp: timestamp,
    favorite: favorite,
  };

  const response = await fetch(`${baseUrl}/api/traders/favorite_trader`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSONStringify(body),
  });

  expect(response.status).toBe(200);
  return response.json();
}

export async function selectTrader(wallet: HDNodeWallet, targetWallet: HDNodeWallet, selected: boolean) {
  const timestamp = Date.now();
  const message = `${selected ? "Select" : "Unselect"} trader ${targetWallet.address} for ${wallet.address} at ${timestamp}`;
  const signature = await wallet.signMessage(message);
  const body = {
    message: message,
    walletAddr: wallet.address,
    traderAddr: targetWallet.address,
    signature: signature,
    timestamp: timestamp,
    selected: selected,
  };
  const response = await fetch(`${baseUrl}/api/traders/select_trader`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSONStringify(body),
  });
  expect(response.status).toBe(200);
  return response.json();
}

export async function toggleMirrorTrades(wallet: HDNodeWallet, enable: boolean) {
  const timestamp = Date.now();
  const message = `${enable ? "Enable" : "Disable"} auto-copy trading for ${wallet.address} at ${timestamp}`;
  const signature = await wallet.signMessage(message);

  const body = {
    walletAddr: wallet.address,
    message: message,
    signature: signature,
    timestamp: timestamp,
    enable: enable,
  };

  const response = await fetch(`${baseUrl}/api/traders/toggle_auto_copy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSONStringify(body),
  });

  expect(response.status).toBe(200);
  return response.json();
}

export async function triggerMirrorTrades() {
  const response = await fetch(`${baseUrl}/api/traders/trigger_mirror_trades`, {
    method: "POST",
  });

  expect(response.status).toBe(200);
  return response.json();
}

export async function injectFakeTrade(trade: any) {
  const response = await fetch(`${baseUrl}/api/traders/inject_fake_trade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSONStringify(trade),
  });

  if (response.status !== 200) {
    const errorText = await response.text();
    console.error(`Inject fake trade failed with status ${response.status}: ${errorText}`);
    console.error("Trade data:", JSONStringify(trade, null, 2));
  }
  expect(response.status).toBe(200);
  return response.json();
}

export async function injectFakePosition(position: any) {
  const response = await fetch(`${baseUrl}/api/traders/inject_fake_position`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSONStringify(position),
  });

  if (response.status !== 200) {
    const errorText = await response.text();
    console.error(`Inject fake position failed with status ${response.status}: ${errorText}`);
    console.error("Position data:", JSONStringify(position));
  }
  expect(response.status).toBe(200);
  return response.json();
}

// Helper function to create a fake trade object
export function createFakeTrade({
  id = `trade_${Date.now()}`,
  orderType = 2, // MarketIncrease
  traderAddr,
  marketAddr = "0x70d95587d40A2caf56bd97485aB3Eec10Bee6336",
  longTokenAddress = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  shortTokenAddress = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  isLong = true,
  marketName = "ETH",
  tokenName = "ETH",
  sizeUsd = 1000,
  priceUsd = 2000,
  initialCollateralUsd = 200,
  sizeDeltaUsd = 1000,
  rpnl = 0,
  timestamp = Date.now(),
}: {
  id?: string;
  orderType?: number;
  traderAddr: string;
  marketAddr?: string;
  longTokenAddress?: string;
  shortTokenAddress?: string;
  isLong?: boolean;
  marketName?: string;
  tokenName?: string;
  sizeUsd?: number;
  priceUsd?: number;
  initialCollateralUsd?: number;
  sizeDeltaUsd?: number;
  rpnl?: number;
  timestamp?: number;
}) {
  return {
    id,
    orderType,
    traderAddr,
    marketAddr,
    longTokenAddress,
    shortTokenAddress,
    isLong,
    marketName,
    tokenName,
    sizeUsd,
    priceUsd,
    initialCollateralUsd,
    sizeDeltaUsd,
    rpnl,
    timestamp,
  };
}

// Helper function to create a fake position object
export function createFakePosition({
  key = `position_${Date.now()}`,
  contractKey,
  traderAddr,
  marketAddress = "0x70d95587d40A2caf56bd97485aB3Eec10Bee6336",
  collateralTokenAddress = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  isLong = true,
  tokenName = "ETH",
  sizeUsd = 1000,
  collateralAmountUsd = 200,
  entryPriceUsd = 2000,
  markPriceUsd = 2000,
  liqPriceUsd = 1500,
  pnlUsd = 0,
  leverage = 5,
}: {
  key?: string;
  contractKey?: string;
  traderAddr: string;
  marketAddress?: string;
  collateralTokenAddress?: string;
  isLong?: boolean;
  tokenName?: string;
  sizeUsd?: number;
  collateralAmountUsd?: number;
  entryPriceUsd?: number;
  markPriceUsd?: number;
  liqPriceUsd?: number;
  pnlUsd?: number;
  leverage?: number;
}) {
  return {
    key,
    contractKey: contractKey || key,
    account: traderAddr,
    traderAddr: traderAddr,
    marketAddress,
    collateralTokenAddress,
    // Core fields as bigint (as expected by Position interface)
    sizeInUsd: BigInt(sizeUsd) * BigInt(10 ** 30),
    sizeInTokens: BigInt(Math.floor(sizeUsd / entryPriceUsd)) * BigInt(10 ** 18),
    collateralAmount: BigInt(collateralAmountUsd) * BigInt(10 ** 6),
    pendingBorrowingFeesUsd: BigInt(0),
    increasedAtTime: BigInt(Date.now()),
    decreasedAtTime: BigInt(0),
    isLong,
    fundingFeeAmount: BigInt(0),
    claimableLongTokenAmount: BigInt(0),
    claimableShortTokenAmount: BigInt(0),
    isOpening: false,
    pnl: BigInt(pnlUsd) * BigInt(10 ** 30),
    positionFeeAmount: BigInt(0),
    traderDiscountAmount: BigInt(0),
    uiFeeAmount: BigInt(0),
    data: "",
    // DEXPosition-only fields as numbers
    tokenName,
    collateralAmountUsd,
    liqPriceUsd,
    entryPriceUsd,
    markPriceUsd,
    sizeUsd,
    pnlUsd,
    leverage,
  };
}
