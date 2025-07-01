import { ColumnType, Generated } from "kysely";

export interface Database {
  traders: TradersTable;
  trades: TradesTable;
  positions: OpenPositionsTable;
  closed_positions: ClosedPositionsTable;
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
  trade_id: string;
  order_type: number;
  trader_address: string;
  mirrored_trader_address: string | null;
  market_address: string;
  long_token_address: string;
  short_token_address: string;
  is_long: boolean;
  market_name: string;
  token_name: string;
  size_usd: number;
  price_usd: number;
  initial_collateral_usd: number;
  size_delta_usd: number;
  rpnl: number;
  timestamp: number;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, string | undefined>;
}

export interface ClosedPositionsTable {
  id: Generated<number>;
  token_name: string; // DEXPosition.tokenName
  collateral_amount_usd: number; // DEXPosition.collateralAmountUsd
  leverage: number; // DEXPosition.leverage
  size_usd: number; // DEXPosition.sizeUsd
  entry_price_usd: number; // DEXPosition.entryPriceUsd
  pnl_usd: number; // DEXPosition.pnlUsd
  mark_price_usd: number; // DEXPosition.markPriceUsd
  liq_price_usd: number; // DEXPosition.liqPriceUsd
  key: string; // Position.key
  contract_key: string; // Position.contractKey
  trader_address: string; // Position.account
  market_address: string; // Position.marketAddress
  collateral_token_address: string; // Position.collateralTokenAddress
  size_in_usd: bigint; // Position.sizeInUsd
  size_in_tokens: bigint; // Position.sizeInTokens
  collateral_amount: bigint; // Position.collateralAmount
  pending_borrowing_fees_usd: bigint; // Position.pendingBorrowingFeesUsd
  increased_at_time: bigint; // Position.increasedAtTime
  decreased_at_time: bigint; // Position.decreasedAtTime
  is_long: boolean; // Position.isLong
  funding_fee_amount: bigint; // Position.fundingFeeAmount
  claimable_long_token_amount: bigint; // Position.claimableLongTokenAmount
  claimable_short_token_amount: bigint; // Position.claimableShortTokenAmount
  is_opening: boolean; // Position.isOpening
  pnl: bigint; // Position.pnl
  position_fee_amount: bigint; // Position.positionFeeAmount
  trader_discount_amount: bigint; // Position.traderDiscountAmount
  ui_fee_amount: bigint; // Position.uiFeeAmount
  data: string; // Position.data

  // timestamps
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, string | undefined>;
}

export interface OpenPositionsTable {
  id: Generated<number>;
  token_name: string; // DEXPosition.tokenName
  collateral_amount_usd: number; // DEXPosition.collateralAmountUsd
  leverage: number; // DEXPosition.leverage
  size_usd: number; // DEXPosition.sizeUsd
  entry_price_usd: number; // DEXPosition.entryPriceUsd
  pnl_usd: number; // DEXPosition.pnlUsd
  mark_price_usd: number; // DEXPosition.markPriceUsd
  liq_price_usd: number; // DEXPosition.liqPriceUsd
  key: string; // Position.key
  contract_key: string; // Position.contractKey
  trader_address: string; // Position.account
  market_address: string; // Position.marketAddress
  collateral_token_address: string; // Position.collateralTokenAddress
  size_in_usd: bigint; // Position.sizeInUsd
  size_in_tokens: bigint; // Position.sizeInTokens
  collateral_amount: bigint; // Position.collateralAmount
  pending_borrowing_fees_usd: bigint; // Position.pendingBorrowingFeesUsd
  increased_at_time: bigint; // Position.increasedAtTime
  decreased_at_time: bigint; // Position.decreasedAtTime
  is_long: boolean; // Position.isLong
  funding_fee_amount: bigint; // Position.fundingFeeAmount
  claimable_long_token_amount: bigint; // Position.claimableLongTokenAmount
  claimable_short_token_amount: bigint; // Position.claimableShortTokenAmount
  is_opening: boolean; // Position.isOpening
  pnl: bigint; // Position.pnl
  position_fee_amount: bigint; // Position.positionFeeAmount
  trader_discount_amount: bigint; // Position.traderDiscountAmount
  ui_fee_amount: bigint; // Position.uiFeeAmount
  data: string; // Position.data

  // timestamps
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
