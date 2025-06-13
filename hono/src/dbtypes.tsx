import {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from "kysely";

export interface Database {
  users: UserTable;
  trades: TradeTable;
  positions: PositionTable;
}

// Users table interface
export interface UserTable {
  id: Generated<number>;
  address: string;
  balance: string;
  chain_id: string;
  dexmt_user: boolean;
  dex_platform: string | null;
  platform_ranking: number | null;
  // Add new columns for scraped data
  pnl: number | null;
  pnl_percentage: number | null;
  avg_size: number | null;
  avg_leverage: number | null;
  win_ratio: number | null;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, string | undefined>;
}

// Trades table interface
export interface TradeTable {
  id: Generated<number>;
  user_address: string;
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

// Positions table interface
export interface PositionTable {
  id: Generated<number>;
  user_address: string;
  token: string;
  collateral: number;
  leverage: number;
  size: number;
  entry_price: number;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, string | undefined>;
}

// Type helpers for Users
export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

// Type helpers for Trades
export type Trade = Selectable<TradeTable>;
export type NewTrade = Insertable<TradeTable>;
export type TradeUpdate = Updateable<TradeTable>;

// Type helpers for Positions
export type Position = Selectable<PositionTable>;
export type NewPosition = Insertable<PositionTable>;
export type PositionUpdate = Updateable<PositionTable>;
