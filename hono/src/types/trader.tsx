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
