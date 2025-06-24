import { GmxSdk } from "@gmx-io/sdk";
import { MarketsInfoData } from "@gmx-io/sdk/types/markets";
import { Position, PositionsData } from "@gmx-io/sdk/types/positions";
import { TokensData } from "@gmx-io/sdk/types/tokens";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const USE_GMX_TESTNET = false; // Set to true to use Arbitrum Goerli testnet

let gmxSdkInstance: GmxSdk | undefined;
let marketsInfoCache: MarketsInfoData | undefined;
let tokensDataCache: TokensData | undefined;
let cacheTimestamp: number = 0;

function createGMXSDK(): GmxSdk {
  return new GmxSdk({
    chainId: 42161,
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    oracleUrl: "https://arbitrum-api.gmxinfra.io",
    subsquidUrl: "https://gmx.squids.live/gmx-synthetics-arbitrum:prod/api/graphql",
  });
}

function createGMXSDKTestNet(): GmxSdk {
  return new GmxSdk({
    chainId: 421613, // Arbitrum Goerli testnet
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    oracleUrl: "https://arbitrum-api.gmxinfra.io",
    subsquidUrl: "https://gmx.squids.live/gmx-synthetics-arbitrum:prod/api/graphql",
  });
}

function getGmxSdk(): GmxSdk {
  if (!gmxSdkInstance) {
    if (USE_GMX_TESTNET) {
      gmxSdkInstance = createGMXSDKTestNet();
    } else {
      gmxSdkInstance = createGMXSDK();
    }
  }
  return gmxSdkInstance;
}

async function getMarketsInfoCached(): Promise<{
  marketsInfoData: MarketsInfoData | undefined;
  tokensData: TokensData | undefined;
}> {
  const now = Date.now();

  // Check if cache is still valid
  if (marketsInfoCache && tokensDataCache && now - cacheTimestamp < CACHE_DURATION) {
    return {
      marketsInfoData: marketsInfoCache,
      tokensData: tokensDataCache,
    };
  }

  // Fetch fresh data
  const sdk = getGmxSdk();
  const { marketsInfoData, tokensData } = await sdk.markets.getMarketsInfo();

  // Update cache
  marketsInfoCache = marketsInfoData;
  tokensDataCache = tokensData;
  cacheTimestamp = now;

  return { marketsInfoData, tokensData };
}

async function getTokenName(marketAddress: string): Promise<string | undefined> {
  const { marketsInfoData } = await getMarketsInfoCached();

  if (!marketsInfoData) {
    return;
  }

  const marketInfo = marketsInfoData[marketAddress];

  if (!marketInfo) {
    return;
  }

  return marketInfo.name;
}

// Batch function to get multiple token names efficiently
async function getTokenNames(marketAddresses: string[]): Promise<{ [marketAddress: string]: string | undefined }> {
  const { marketsInfoData } = await getMarketsInfoCached();

  if (!marketsInfoData) {
    return {};
  }

  const result: { [marketAddress: string]: string | undefined } = {};

  for (const address of marketAddresses) {
    const marketInfo = marketsInfoData[address];
    result[address] = marketInfo?.name;
  }

  return result;
}

// Function to get full market info for a single market
async function getMarketInfo(marketAddress: string) {
  const { marketsInfoData } = await getMarketsInfoCached();

  if (!marketsInfoData) {
    return;
  }

  return marketsInfoData[marketAddress];
}

// Function to get market info for multiple markets
async function getMarketsInfo(marketAddresses: string[]) {
  const { marketsInfoData } = await getMarketsInfoCached();

  if (!marketsInfoData) {
    return {};
  }

  const result: { [marketAddress: string]: any } = {};

  for (const address of marketAddresses) {
    const marketInfo = marketsInfoData[address.toLowerCase()];
    if (marketInfo) {
      result[address] = marketInfo;
    }
  }

  return result;
}

async function getPositionValuesInUsd(position: Position): Promise<{
  sizeUsd: number;
  collateralUsd: number;
  pnlUsd: number;
  entryPrice: number;
  markPrice: number;
  liquidationPrice: number;
  leverage: number;
}> {
  const { marketsInfoData, tokensData } = await getMarketsInfoCached();
  if (!marketsInfoData || !tokensData) {
    return {
      sizeUsd: 0,
      collateralUsd: 0,
      pnlUsd: 0,
      entryPrice: 0,
      markPrice: 0,
      liquidationPrice: 0,
      leverage: 0,
    };
  }

  const marketInfo = marketsInfoData[position.marketAddress];
  if (!marketInfo) {
    return {
      sizeUsd: 0,
      collateralUsd: 0,
      pnlUsd: 0,
      entryPrice: 0,
      markPrice: 0,
      liquidationPrice: 0,
      leverage: 0,
    };
  }

  // ——————————————————————————————————
  // 1) size and PnL from on-chain
  // ——————————————————————————————————
  const sizeUsd = Number(position.sizeInUsd) / 1e30;
  const pnlUsd = Number(position.pnl) / 1e30;

  // ——————————————————————————————————
  // 2) current mark price & entry price
  // ——————————————————————————————————
  const indexToken = marketInfo.indexToken;
  const minMark = Number(indexToken.prices.minPrice) / 1e30;
  const maxMark = Number(indexToken.prices.maxPrice) / 1e30;
  const markPrice = (minMark + maxMark) / 2;

  const sizeTokens = Number(position.sizeInTokens) / 10 ** indexToken.decimals;
  const entryPrice = sizeTokens > 0 ? sizeUsd / sizeTokens : 0;

  // ——————————————————————————————————
  // 3) collateral in USD (use short price if long, else long price)
  // ——————————————————————————————————
  const collateralToken = tokensData[position.collateralTokenAddress]!;
  const minCollPrice = Number(collateralToken.prices.minPrice) / 1e30;
  const maxCollPrice = Number(collateralToken.prices.maxPrice) / 1e30;
  const collPrice = (minCollPrice + maxCollPrice) / 2;
  const collAmount = Number(position.collateralAmount) / 10 ** collateralToken.decimals;
  const collateralUsd = collAmount * collPrice;

  // ——————————————————————————————————
  // 4) fees (borrowing + funding + position fees)
  // ——————————————————————————————————
  const borrowFees = Number(position.pendingBorrowingFeesUsd) / 1e30;
  const fundingFee = Number(position.fundingFeeAmount) / 1e30;
  const posFee = Number(position.positionFeeAmount) / 1e30;
  const totalFees = borrowFees + fundingFee + posFee;

  // ——————————————————————————————————
  // 5) net equity & leverage
  // ——————————————————————————————————
  const netEquity = collateralUsd + pnlUsd - totalFees;
  const leverage = netEquity > 0 ? sizeUsd / netEquity : Infinity;

  // ——————————————————————————————————
  // 6) liquidation price (GMX V2 formula)
  // ——————————————————————————————————
  let liquidationPrice = 0;
  if (sizeTokens > 0) {
    if (position.isLong) {
      // (sizeUsd – collateralUsd) / sizeTokens
      liquidationPrice = (sizeUsd - collateralUsd) / sizeTokens;
    } else {
      // (sizeUsd + collateralUsd) / sizeTokens
      liquidationPrice = (sizeUsd + collateralUsd) / sizeTokens;
    }
  }

  return {
    sizeUsd,
    collateralUsd,
    pnlUsd,
    entryPrice,
    markPrice,
    liquidationPrice,
    leverage,
  };
}

async function getTradeHistory(options: {
  address: string;
  amount?: number;
}): Promise<{ [key: string]: any } | undefined> {
  const { address, amount = 10 } = options;
  const sdk = getGmxSdk();
  sdk.setAccount(address as `0x${string}`);

  try {
    const { marketsInfoData, tokensData } = await getMarketsInfoCached();
    const tradeActions = await sdk.trades.getTradeHistory({
      pageSize: amount,
      pageIndex: 0,
      marketsInfoData,
      tokensData,
    });

    if (!tradeActions) {
      console.error("Error: tradesResult is undefined.");
      return;
    }

    return tradeActions;
  } catch (error) {
    console.error("Error fetching trade history:", error);
  }
}

async function getTraderPositions(user_address: string): Promise<
  | {
      positionsData: PositionsData;
    }
  | undefined
> {
  const sdk = getGmxSdk();
  const { marketsInfoData, tokensData } = await getMarketsInfoCached();

  sdk.setAccount(user_address as `0x${string}`);

  if (!marketsInfoData) {
    console.error("Error: marketsInfoData is undefined.");
    return;
  }

  if (!tokensData) {
    console.error("Error: tokensData is undefined.");
    return;
  }

  try {
    const positionsResult = await sdk.positions.getPositions({
      marketsData: marketsInfoData,
      tokensData,
      start: 0,
      end: 1000,
    });

    if (!positionsResult) {
      console.error("Error: positionsResult is undefined.");
      return;
    }

    if (positionsResult.error) {
      console.error("Failed to fetch user positions:", positionsResult.error);
      return;
    }

    if (!positionsResult.positionsData) {
      console.error("Error: No positions data found for user.");
      return;
    }

    return {
      positionsData: positionsResult.positionsData,
    };
  } catch (error) {
    console.error("Error fetching user positions:", error);
    return;
  }
}

// Function to invalidate cache manually if needed
function invalidateCache() {
  marketsInfoCache = undefined;
  tokensDataCache = undefined;
  cacheTimestamp = 0;
}

const gmxSdk = {
  getGmxSdk,
  getTraderPositions,
  getTradeHistory,
  getTokenName,
  getTokenNames,
  getMarketInfo,
  getMarketsInfo,
  getMarketsInfoCached,
  invalidateCache,
  getPositionValuesInUsd,
};

export default gmxSdk;
