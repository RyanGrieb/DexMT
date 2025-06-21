import { Position } from "@gmx-io/sdk/types/positions";
import gmxSdk from "../gmxsdk";

export interface DEXPosition extends Position {
  tokenName: string;
  collateralAmountUsd: number;
  entryPriceUsd: number;
  liqPriceUsd: number;
  markPriceUsd: number;
  sizeUsd: number;
  pnlUsd: number;
  leverage: number;
}

export class Trader {
  address: string;
  balance: string;
  chainId: string;
  updatedAt: string;
  isDexmtTrader: boolean;
  isMirroringTrades: boolean;
  platformRanking: number | undefined | null;
  dexPlatform: string | undefined | null;
  pnl: number | undefined | null;
  pnlPercentage: number | undefined | null;
  avgSize: number | undefined | null;
  avgLeverage: number | undefined | null;
  winRatio: number | undefined | null;

  constructor(args: {
    address: string;
    balance: string;
    chainId: string;
    updatedAt: string;
    isDexmtTrader: boolean;
    isMirroringTrades?: boolean;
    platformRanking?: number | undefined | null;
    dexPlatform?: string | undefined | null;
    pnl?: number | undefined | null;
    pnlPercentage?: number | undefined | null;
    avgSize?: number | undefined | null;
    avgLeverage?: number | undefined | null;
    winRatio?: number | undefined | null;
  }) {
    const {
      address,
      balance,
      chainId,
      updatedAt,
      isDexmtTrader,
      isMirroringTrades = false,
      platformRanking = undefined,
      dexPlatform = undefined,
      pnl = undefined,
      pnlPercentage = undefined,
      avgSize = undefined,
      avgLeverage = undefined,
      winRatio = undefined,
    } = args;

    this.address = address;
    this.balance = balance;
    this.chainId = chainId;
    this.updatedAt = updatedAt;
    this.isDexmtTrader = isDexmtTrader;
    this.isMirroringTrades = isMirroringTrades;
    this.platformRanking = platformRanking;
    this.dexPlatform = dexPlatform;
    this.pnl = pnl;
    this.pnlPercentage = pnlPercentage;
    this.avgSize = avgSize;
    this.avgLeverage = avgLeverage;
    this.winRatio = winRatio;
  }

  async getPositions(): Promise<DEXPosition[]> {
    // FIXME: Ensure this is a valid address
    const validAddress: `0x${string}` = this.address as `0x${string}`;

    if (!validAddress) {
      return [];
    }

    const positionsResponse = await gmxSdk.getTraderPositions(validAddress);

    if (!positionsResponse) {
      return [];
    }

    const { positionsData } = positionsResponse;

    if (!positionsData) {
      return [];
    }

    const positions = Object.values(positionsData);

    // Extract all market addresses for batch token name lookup
    const marketAddresses = positions.map((position) => position.marketAddress);

    // Get all token names in one batch call
    const tokenNames = await gmxSdk.getTokenNames(marketAddresses);

    // Map positions with proper USD calculations
    const dexPositions: DEXPosition[] = await Promise.all(
      positions.map(async (position) => {
        const positionValues = await gmxSdk.getPositionValuesInUsd(position);

        return {
          ...position,
          collateralAmountUsd: positionValues.collateralUsd,
          liqPriceUsd: positionValues.liquidationPrice,
          entryPriceUsd: positionValues.entryPrice,
          markPriceUsd: positionValues.markPrice,
          sizeUsd: positionValues.sizeUsd,
          pnlUsd: positionValues.pnlUsd,
          tokenName:
            tokenNames[position.marketAddress]?.split(" ")[0] || "Unknown",
          leverage: positionValues.leverage,
        };
      })
    );

    return dexPositions;
  }
}

export class WatchedTrader extends Trader {
  watching: boolean;

  constructor(args: {
    address: string;
    balance: string;
    chainId: string;
    updatedAt: string;
    isDexmtTrader: boolean;
    isMirroringTrades: boolean;
    watching: boolean;
    platformRanking: number | undefined;
    dexPlatform: string | undefined;
    pnl: number | undefined;
    pnlPercentage: number | undefined;
    avgSize: number | undefined;
    avgLeverage: number | undefined;
    winRatio: number | undefined;
  }) {
    super(args);
    this.watching = args.watching;
  }
}
