import { GmxSdk } from "@gmx-io/sdk";
import { PositionsData } from "@gmx-io/sdk/types/positions";

export interface SerializedPosition {
  key: string;
  contractKey: string;
  account: string;
  marketAddress: string;
  collateralTokenAddress: string;
  sizeInUsd: string;
  sizeInTokens: string;
  collateralAmount: string;
  pendingBorrowingFeesUsd: string;
  increasedAtTime: string;
  decreasedAtTime: string;
  isLong: boolean;
  fundingFeeAmount: string;
  claimableLongTokenAmount: string;
  claimableShortTokenAmount: string;
  isOpening?: boolean;
  pnl: string;
  positionFeeAmount: string;
  traderDiscountAmount: string;
  uiFeeAmount: string;
  data: string;
}

export interface SerializedPositionsData {
  [positionKey: string]: SerializedPosition;
}

let gmxSdkInstance: GmxSdk | undefined;

function getGmxSdk(): GmxSdk {
  if (!gmxSdkInstance) {
    gmxSdkInstance = new GmxSdk({
      chainId: 42161,
      rpcUrl: "https://arb1.arbitrum.io/rpc",
      oracleUrl: "https://arbitrum-api.gmxinfra.io",
      subsquidUrl:
        "https://gmx.squids.live/gmx-synthetics-arbitrum:prod/api/graphql",
    });
  }
  return gmxSdkInstance;
}

/**
 * Converts all bigints in the position data to strings.
 * This is necessary because JSON does not support bigint serialization.
 * @param data PositionsData
 */
function serializePositionData(data: PositionsData) {
  const serializedData: SerializedPositionsData = {};
  for (const key in data) {
    const position = data[key];
    serializedData[key] = {
      ...position, // Add the existing properties inside the position object
      sizeInUsd: position.sizeInUsd.toString(),
      sizeInTokens: position.sizeInTokens.toString(),
      collateralAmount: position.collateralAmount.toString(),
      pendingBorrowingFeesUsd: position.pendingBorrowingFeesUsd.toString(),
      increasedAtTime: position.increasedAtTime.toString(),
      decreasedAtTime: position.decreasedAtTime.toString(),
      fundingFeeAmount: position.fundingFeeAmount.toString(),
      claimableLongTokenAmount: position.claimableLongTokenAmount.toString(),
      claimableShortTokenAmount: position.claimableShortTokenAmount.toString(),
      pnl: position.pnl.toString(),
      positionFeeAmount: position.positionFeeAmount.toString(),
      traderDiscountAmount: position.traderDiscountAmount.toString(),
      uiFeeAmount: position.uiFeeAmount.toString(),
    };
  }
  return serializedData;
}

async function getUserPositions(user_address: `0x${string}`): Promise<
  | {
      serializedPositionsData: SerializedPositionsData;
      positionsData: PositionsData;
    }
  | undefined
> {
  const sdk = getGmxSdk();
  const { marketsInfoData, tokensData } = await sdk.markets.getMarketsInfo();

  //console.log(marketsInfoData);

  sdk.setAccount(user_address);

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

    //console.log("User Positions:", positionsResult.positionsData);

    return {
      serializedPositionsData: serializePositionData(
        positionsResult.positionsData
      ),
      positionsData: positionsResult.positionsData,
    };
  } catch (error) {
    console.error("Error fetching user positions:", error);
    return;
  }
}

async function updateUserTrades(user_address: `0x${string}`) {}

const gmxSdk = {
  getGmxSdk,
  getUserPositions,
  updateUserTrades,
};

export default gmxSdk;
