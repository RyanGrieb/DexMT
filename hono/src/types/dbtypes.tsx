import {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from "kysely";

export interface Database {
  traders: TradersTable;
  trades: TradesTable;
  positions: OpenPositionsTable;
  favorited_traders: FavoritedTradersTable;
}

export interface TradersTable {
  id: Generated<number>;
  address: string;
  balance: string;
  chain_id: string;
  dexmt_trader: boolean;
  dex_platform: string | null;
  platform_ranking: number | null;
  pnl: number | null;
  pnl_percentage: number | null;
  avg_size: number | null;
  avg_leverage: number | null;
  win_ratio: number | null;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, string | undefined>;
  mirroring_trades: boolean;
}

export interface TradesTable {
  id: Generated<number>;
  trader_address: string;
  token_in: string;
  token_out: string;
  amount_in: string;
  amount_out: string;
  price: string;
  transaction_hash: string;
  block_number: bigint;
  chain_id: string;
  status: "pending" | "completed" | "failed";
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, string | undefined>;
}

export interface OpenPositionsTable {
  id: Generated<number>;
  trader_address: string;
  token: string;
  collateral: number;
  leverage: number;
  size: number;
  entry_price: number;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, string | undefined>;
}

export interface FavoritedTradersTable {
  id: Generated<number>;
  follower_address: string;
  favorited_address: string;
  signature: string;
  message: string;
  timestamp: bigint;
  selected: boolean;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, string | undefined>;
}

// Type helpers for Traders
//export type Trader = Selectable<TradersTable>;
export type NewTrader = Insertable<TradersTable>;
export type TraderUpdate = Updateable<TradersTable>;

export type Trade = Selectable<TradesTable>;
export type NewTrade = Insertable<TradesTable>;
export type TradeUpdate = Updateable<TradesTable>;

export type Position = Selectable<OpenPositionsTable>;
export type NewPosition = Insertable<OpenPositionsTable>;
export type PositionUpdate = Updateable<OpenPositionsTable>;

export type CopyTrading = Selectable<FavoritedTradersTable>;
export type NewCopyTrading = Insertable<FavoritedTradersTable>;
export type CopyTradingUpdate = Updateable<FavoritedTradersTable>;
