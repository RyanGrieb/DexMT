import { Position } from "@gmx-io/sdk/types/positions";
import database from "../database";
import gmxSdk from "../gmxsdk";

export enum DEXOrderType {
  MarketSwap = 0,
  LimitSwap = 1,
  MarketIncrease = 2,
  LimitIncrease = 3,
  MarketDecrease = 4,
  LimitDecrease = 5,
  StopLossDecrease = 6,
  Liquidation = 7,
  StopIncrease = 8,
  Deposit = 9,
}

export type DEXTradeAction = {
  orderType: DEXOrderType;
  traderAddr: string;
  isLong: boolean;
  market: string;
  size: number;
  price: number;
  rpnl: number;
  timestamp: number;
};

export interface DEXPosition extends Position {
  traderAddr: string;
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
  watchingAmt: number | undefined | null;

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
    watchingAmt?: number | undefined | null;
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
      watchingAmt = undefined,
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
    this.watchingAmt = watchingAmt;
  }

  async getTrades(options?: { fromDb?: boolean; amount?: number }): Promise<DEXTradeAction[]> {
    const validAddress: `0x${string}` = this.address as `0x${string}`;

    if (!validAddress) {
      return [];
    }

    if (options?.fromDb) {
      //const dbTrades = await database.getTrades(this.address);
      // …map dbTrades to DEXTradeAction…
    }

    const rawTrades = await gmxSdk.getTradeHistory({
      address: validAddress,
      amount: (options?.amount ?? 5) * 2,
    });

    if (!rawTrades) {
      return [];
    }

    // only keep trades that have an executionPrice
    const requestedAmount = options?.amount || 10;
    const tradesWithPrice = rawTrades.filter((trade: any) => trade.executionPrice !== undefined);

    console.log(`Fetched ${rawTrades.length} trades, ` + `${tradesWithPrice.length} have executionPrice`);

    // take up to the requested amount
    const tradeActions = tradesWithPrice.slice(0, requestedAmount);

    if (tradeActions.length === 0) {
      return [];
    }

    console.log(`Returning ${tradeActions.length} valid trades for ${validAddress}`);

    //console.log(tradeActions[4]);
    //const filePath = path.resolve(__dirname, "tradeActions.json");
    //fs.writeFileSync(
    //  filePath,
    //  JSON.stringify(tradeActions[4], (_, value) => (typeof value === "bigint" ? value.toString() : value), 2)
    // );

    return tradeActions.map((trade: { [key: string]: any }) => {
      const market = "marketInfo" in trade ? trade.marketInfo.name.split(" ")[0] : "Unknown Market";

      const initialCollateralUsd =
        "initialCollateralDeltaAmount" in trade ? Number(trade.initialCollateralDeltaAmount) / 1e6 : 0;
      const sizeDeltaUsd = "sizeDeltaUsd" in trade ? Number(trade.sizeDeltaUsd) / 1e30 : 0;
      const size = sizeDeltaUsd > 0 ? sizeDeltaUsd : initialCollateralUsd;
      const price = Number(trade.executionPrice) / 1e30;
      const rpnl = "pnlUsd" in trade && trade.pnlUsd ? Number(trade.pnlUsd) / 1e30 : 0;
      const orderType = sizeDeltaUsd <= 0 && trade.orderType == 2 ? DEXOrderType.Deposit : trade.orderType;

      return {
        orderType: orderType,
        traderAddress: validAddress,
        isLong: trade.isLong,
        market: market,
        size: size,
        price: price,
        rpnl: rpnl,
        timestamp: "timestamp" in trade ? Number(trade.timestamp) : -1,
      };
    });
  }

  async getPositions(options?: { fromDb: boolean }): Promise<DEXPosition[]> {
    // FIXME: Ensure this is a valid address
    const validAddress: `0x${string}` = this.address as `0x${string}`;

    if (!validAddress) {
      return [];
    }

    if (options?.fromDb) {
      const dbPositions = await database.getPositions(this.address);
      const dexPositions: DEXPosition[] = dbPositions.map((position) => ({
        // Position fields
        key: position.key,
        contractKey: position.contract_key,
        account: position.trader_address,
        marketAddress: position.market_address,
        collateralTokenAddress: position.collateral_token_address,
        sizeInUsd: position.size_in_usd,
        sizeInTokens: position.size_in_tokens,
        collateralAmount: position.collateral_amount,
        pendingBorrowingFeesUsd: position.pending_borrowing_fees_usd,
        increasedAtTime: position.increased_at_time,
        decreasedAtTime: position.decreased_at_time,
        isLong: position.is_long,
        fundingFeeAmount: position.funding_fee_amount,
        claimableLongTokenAmount: position.claimable_long_token_amount,
        claimableShortTokenAmount: position.claimable_short_token_amount,
        isOpening: position.is_opening,
        pnl: position.pnl,
        positionFeeAmount: position.position_fee_amount,
        traderDiscountAmount: position.trader_discount_amount,
        uiFeeAmount: position.ui_fee_amount,
        data: position.data,

        // DEXPosition‐only fields
        traderAddr: position.trader_address,
        tokenName: position.token_name,
        collateralAmountUsd: position.collateral_amount_usd,
        liqPriceUsd: position.liq_price_usd,
        entryPriceUsd: position.entry_price_usd,
        markPriceUsd: position.mark_price_usd,
        sizeUsd: position.size_usd,
        pnlUsd: position.pnl_usd,
        leverage: position.leverage,
      }));
      return dexPositions;
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
          traderAddr: this.address,
          collateralAmountUsd: positionValues.collateralUsd,
          liqPriceUsd: positionValues.liquidationPrice,
          entryPriceUsd: positionValues.entryPrice,
          markPriceUsd: positionValues.markPrice,
          sizeUsd: positionValues.sizeUsd,
          pnlUsd: positionValues.pnlUsd,
          tokenName: tokenNames[position.marketAddress]?.split(" ")[0] || "Unknown",
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
    watchingAmt: number | undefined;
  }) {
    super(args);
    this.watching = args.watching;
  }
}
