import { Position } from "@gmx-io/sdk/types/positions";
import database from "../database";
import gmxSdk from "../gmxsdk";
import utils from "../utils";

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
  id: string;
  orderType: DEXOrderType;
  traderAddr: string;
  marketAddr: string;
  longTokenAddress: string;
  shortTokenAddress: string;
  isLong: boolean;
  marketName: string;
  tokenName: string;
  sizeUsd: number;
  priceUsd: number;
  initialCollateralUsd: number;
  sizeDeltaUsd: number;
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

  async modifyPosition(position: DEXPosition, trade: DEXTradeAction): Promise<DEXPosition | undefined> {
    const updatedPosition: DEXPosition | undefined = undefined; //FIXME: Implement position modification logic
    if (updatedPosition) {
      //await database.savePosition(updatedPosition);
    }
    return updatedPosition;
  }

  async closePosition(position: DEXPosition): Promise<void> {
    //await gmxSdk.closePosition(position);
    await database.closePositions(position);
  }

  async createPosition(trade: DEXTradeAction): Promise<DEXPosition | undefined> {
    // Create a new position based on the trade details
    const newPosition: DEXPosition | undefined = await gmxSdk.createPosition(this, trade);

    if (!newPosition) {
      utils.logOutput(`Failed to create position for ${this.address} on market ${trade.marketName}`);
      return;
    }

    await database.createPositions(newPosition);

    return newPosition;
  }

  async getPositionFromTrade(trade: DEXTradeAction): Promise<DEXPosition | undefined> {
    // Fetch all open positions from the DB
    const positions = await this.getPositions({ fromDb: true });
    // Find a position with the same market address & side (long/short)
    return positions.find((pos) => pos.marketAddress === trade.marketAddr && pos.isLong === trade.isLong);
  }

  async getTradesFromPosition(position: DEXPosition): Promise<DEXTradeAction[]> {
    // Fetch all trades from the DB for this trader
    const allTrades = await this.getTrades({ fromDb: true });
    // Filter trades that match the position's market address and side
    return allTrades.filter((trade) => 
      trade.marketAddr === position.marketAddress && 
      trade.isLong === position.isLong
    );
  }

  async mirrorTrades(newTrades: DEXTradeAction[]) {
    if (!this.isMirroringTrades || newTrades.length === 0) {
      return;
    }

    // Sort the new trades by timestamp in descending order
    newTrades.sort((a, b) => b.timestamp - a.timestamp);

    utils.logOutput(`Mirroring trades for ${this.address} (${newTrades.length} new trade(s))`);

    //1. Determine if we are to market increase/decrease our order, or we deposit (collateral adjustment)
    for (const trade of newTrades) {
      const associatedPosition: DEXPosition | undefined = await this.getPositionFromTrade(trade);

      utils.logOutput("================================================================================");
      utils.logOutput(
        `Processing [${trade.isLong ? "long" : "short"}] trade - copying ${trade.traderAddr} for ${this.address}`
      );
      utils.logOutput(`Order Type: ${DEXOrderType[trade.orderType]}`);
      utils.logOutput(`Trade ID: ${trade.id}`);
      utils.logOutput(`Size USD: ${trade.sizeUsd}`);
      utils.logOutput(`Price USD: ${trade.priceUsd}`);
      utils.logOutput(`Initial Collateral: ${trade.initialCollateralUsd}`);
      utils.logOutput(`Market Name : ${trade.marketName}`);
      utils.logOutput(`Market Address: ${trade.marketAddr}`);
      utils.logOutput(`Associated Position: ${associatedPosition ? "Found" : "Not Found"}\n`);

      switch (trade.orderType) {
        case DEXOrderType.MarketIncrease:
          if (trade.sizeUsd > 0 && !associatedPosition) {
            utils.logOutput(`NO ACTION: Increasing position`);
          }

          // Market increase means we are opening a new position or increasing an existing one
          if (trade.sizeUsd > 0 && associatedPosition) {
            // We are increasing an existing position
            utils.logOutput(`ACTION: Increasing position`);
            this.modifyPosition(associatedPosition, trade);
          } else if (trade.sizeUsd <= 0) {
            // We are opening a new position
            utils.logOutput(`ACTION: Opening new position`);
            await this.createPosition(trade);
          }
          break;
        case DEXOrderType.MarketDecrease:
          // Market decrease means we are closing a position or decreasing an existing one

          if (trade.sizeUsd > 0 && !associatedPosition) {
            utils.logOutput(`NO ACTION: Decreasing position`);
          }

          if (trade.sizeUsd <= 0 && !associatedPosition) {
            utils.logOutput(`NO ACTION: Closing position`);
          }

          if (trade.sizeUsd > 0 && associatedPosition) {
            utils.logOutput(`ACTION: Decreasing position`);
            this.modifyPosition(associatedPosition, trade);
          } else if (associatedPosition) {
            utils.logOutput(`ACTION: Closing position`);
            this.closePosition(associatedPosition);
          }
          break;
        case DEXOrderType.Deposit:
          // Deposit means we are adjusting collateral, either increasing or decreasing, without changing the position size

          if (trade.sizeUsd > 0 && !associatedPosition) {
            utils.logOutput(`NO ACTION: Deposit without an existing position`);
          }

          if (trade.sizeUsd > 0 && associatedPosition) {
            utils.logOutput(`ACTION: Adjusting collateral for position`);
            this.modifyPosition(associatedPosition, trade);
          }
          break;
      }

      utils.logOutput("================================================================================\n");
    }
  }

  async getTrades(options?: { fromDb?: boolean; amount?: number }): Promise<DEXTradeAction[]> {
    const validAddress: `0x${string}` = this.address as `0x${string}`;

    if (!validAddress) {
      return [];
    }

    if (options?.fromDb) {
      const dbTrades = await database.getTrades(this.address);
      // Map dbTrades to DEXTradeAction
      const dexTrades: DEXTradeAction[] = dbTrades.map(
        (dbTrade) =>
          ({
            id: dbTrade.trade_id,
            orderType: dbTrade.order_type,
            traderAddr: dbTrade.trader_address,
            marketAddr: dbTrade.market_address,
            isLong: dbTrade.is_long,
            marketName: dbTrade.market_name,
            tokenName: dbTrade.token_name,
            sizeUsd: dbTrade.size_usd,
            priceUsd: dbTrade.price_usd,
            initialCollateralUsd: dbTrade.initial_collateral_usd,
            sizeDeltaUsd: dbTrade.size_delta_usd,
            rpnl: dbTrade.rpnl,
            timestamp: dbTrade.timestamp,
          }) as DEXTradeAction
      );
      return dexTrades;
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

    //console.log(`Fetched ${rawTrades.length} trades, ` + `${tradesWithPrice.length} have executionPrice`);

    // take up to the requested amount
    const tradeActions = tradesWithPrice.slice(0, requestedAmount);

    if (tradeActions.length === 0) {
      return [];
    }

    //console.log(`Returning ${tradeActions.length} valid trades for ${validAddress}`);

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
        id: trade.id,
        orderType: orderType,
        traderAddr: validAddress,
        marketAddr: trade.marketAddress,
        longTokenAddress: trade.marketInfo.longTokenAddress,
        shortTokenAddress: trade.marketInfo.shortTokenAddress,
        isLong: trade.isLong,
        marketName: market,
        tokenName: trade.indexToken.symbol,
        sizeUsd: size,
        priceUsd: price,
        initialCollateralUsd: initialCollateralUsd,
        sizeDeltaUsd: sizeDeltaUsd,
        rpnl: rpnl,
        timestamp: "timestamp" in trade ? Number(trade.timestamp) : -1,
      } as DEXTradeAction;
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
