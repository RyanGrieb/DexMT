import { Kysely, PostgresDialect, sql } from "kysely";
import { Pool } from "pg";
import { Database } from "../types/dbtypes";
import log from "../utils/logs";
import { closePositions, createPositions, getPositions, updatePositions } from "./positions-table";
import {
  addTrader,
  favoriteTrader,
  getSelectedTraders,
  getTraders,
  mirrorTrades,
  resetTraders,
  selectTraders,
  unfavoriteTrader,
  updateTraders,
} from "./traders-table";
import { getTradeById, getTrades, insertTrades, markTradesAsDisplayed } from "./trades-table";

// PostgreSQL connection
const getDbHost = () => {
  if (process.env.DATABASE_URL?.includes("postgres-test")) return "postgres-test";
  if (process.env.DATABASE_URL?.includes("postgres")) return "postgres";
  return "localhost";
};

const dialect = new PostgresDialect({
  pool: new Pool({
    database: process.env.NODE_ENV === "test" ? "dexmt_test" : "dexmt",
    host: getDbHost(),
    user: "postgres",
    password: "password",
    port: 5432,
    max: 10,
  }),
});

let db: Kysely<Database>;

// Initialize database
async function initializeDatabase() {
  db = new Kysely<Database>({
    dialect,
  });

  try {
    console.log("Initializing database...");

    // Create copy_trading table
    await db.schema
      .createTable("favorited_traders")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("follower_address", "varchar(42)", (col) => col.notNull())
      .addColumn("favorited_address", "varchar(42)", (col) => col.notNull())
      .addColumn("signature", "text", (col) => col.notNull())
      .addColumn("message", "text", (col) => col.notNull())
      .addColumn("timestamp", "bigint", (col) => col.notNull())
      .addColumn("selected", "boolean", (col) => col.defaultTo(false))
      .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
      .addColumn("updated_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
      .execute();
    console.log("Copy trading table created/verified");

    // Create traders table with all trader interface fields
    await db.schema
      .createTable("traders")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("address", "varchar(42)", (col) => col.unique().notNull())
      .addColumn("balance", "varchar(50)", (col) => col.defaultTo("0"))
      .addColumn("chain_id", "varchar(10)", (col) => col.defaultTo("0xa4b1"))
      .addColumn("dexmt_trader", "boolean", (col) => col.defaultTo(false))
      .addColumn("dex_platform", "varchar(20)", (col) => col.defaultTo(null))
      .addColumn("platform_ranking", "integer", (col) => col.defaultTo(null))
      // Add new columns for scraped trading data
      .addColumn("pnl", "numeric", (col) => col.defaultTo(null))
      .addColumn("pnl_percentage", "numeric", (col) => col.defaultTo(null))
      .addColumn("avg_size", "numeric", (col) => col.defaultTo(null))
      .addColumn("avg_leverage", "numeric", (col) => col.defaultTo(null))
      .addColumn("win_ratio", "numeric", (col) => col.defaultTo(null))
      .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
      .addColumn("updated_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
      .addColumn("mirroring_trades", "boolean", (col) => col.defaultTo(false))
      .execute();

    console.log("traders table created/verified");

    // Create trades table
    await db.schema
      .createTable("trades")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("is_fake", "boolean", (col) => col.defaultTo(false)) // Indicates position data sourced from SDK rather than real trading
      .addColumn("is_displayed", "boolean", (col) => col.defaultTo(false)) // Indicates if the trade is displayed in the UI
      .addColumn("trade_id", "varchar(255)", (col) => col.notNull().unique())
      .addColumn("order_type", "integer", (col) => col.notNull())
      .addColumn("trader_address", "varchar(42)", (col) => col.notNull())
      .addColumn("mirrored_trader_address", "varchar(42)", (col) => col.defaultTo(null))
      .addColumn("market_address", "varchar(42)", (col) => col.notNull())
      .addColumn("long_token_address", "varchar(42)", (col) => col.notNull())
      .addColumn("short_token_address", "varchar(42)", (col) => col.notNull())
      .addColumn("is_long", "boolean", (col) => col.notNull())
      .addColumn("market_name", "varchar(50)", (col) => col.notNull())
      .addColumn("token_name", "varchar(50)", (col) => col.notNull())
      .addColumn("size_usd", "numeric", (col) => col.notNull())
      .addColumn("price_usd", "numeric", (col) => col.notNull())
      .addColumn("initial_collateral_usd", "numeric", (col) => col.notNull())
      .addColumn("size_delta_usd", "numeric", (col) => col.notNull())
      .addColumn("rpnl", "numeric", (col) => col.notNull())
      .addColumn("timestamp", "bigint", (col) => col.notNull())
      .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
      .addColumn("updated_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
      .execute();
    console.log("Trades table created/verified");

    // Create positions table (now with all Position fields)
    // Create positions table to store open trading positions
    await db.schema
      .createTable("positions")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("is_fake", "boolean", (col) => col.defaultTo(false)) // Indicates position data sourced from SDK rather than real trading
      .addColumn("is_displayed", "boolean", (col) => col.defaultTo(false)) // Indicates if the position is displayed in the UI
      .addColumn("token_name", "varchar(50)", (col) => col.notNull())
      .addColumn("collateral_amount_usd", "numeric", (col) => col.notNull())
      .addColumn("leverage", "numeric", (col) => col.notNull())
      .addColumn("size_usd", "numeric", (col) => col.notNull())
      .addColumn("entry_price_usd", "numeric", (col) => col.notNull())
      .addColumn("pnl_usd", "numeric", (col) => col.notNull())
      .addColumn("mark_price_usd", "numeric", (col) => col.notNull())
      .addColumn("liq_price_usd", "numeric", (col) => col.notNull())
      .addColumn("key", "varchar(255)", (col) => col.unique().notNull())
      .addColumn("contract_key", "varchar(255)", (col) => col.notNull())
      .addColumn("trader_address", "varchar(42)", (col) => col.notNull())
      .addColumn("market_address", "varchar(42)", (col) => col.notNull())
      .addColumn("collateral_token_address", "varchar(42)", (col) => col.notNull())
      .addColumn("size_in_usd", "numeric", (col) => col.notNull())
      .addColumn("size_in_tokens", "numeric", (col) => col.notNull())
      .addColumn("collateral_amount", "numeric", (col) => col.notNull())
      .addColumn("pending_borrowing_fees_usd", "numeric", (col) => col.notNull())
      .addColumn("increased_at_time", "bigint", (col) => col.notNull())
      .addColumn("decreased_at_time", "bigint", (col) => col.defaultTo(null))
      .addColumn("is_long", "boolean", (col) => col.notNull())
      .addColumn("funding_fee_amount", "numeric", (col) => col.notNull())
      .addColumn("claimable_long_token_amount", "numeric", (col) => col.defaultTo(0))
      .addColumn("claimable_short_token_amount", "numeric", (col) => col.defaultTo(0))
      .addColumn("is_opening", "boolean", (col) => col.defaultTo(false))
      .addColumn("pnl", "numeric", (col) => col.defaultTo(0))
      .addColumn("position_fee_amount", "numeric", (col) => col.defaultTo(0))
      .addColumn("trader_discount_amount", "numeric", (col) => col.defaultTo(0))
      .addColumn("ui_fee_amount", "numeric", (col) => col.defaultTo(0))
      .addColumn("data", "text", (col) => col.defaultTo(null))
      .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
      .addColumn("updated_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
      .execute();

    // Create positions table (now with all Position fields)
    await db.schema
      .createTable("closed_positions")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("is_fake", "boolean", (col) => col.defaultTo(false)) // Indicates position data sourced from SDK rather than real trading
      .addColumn("is_displayed", "boolean", (col) => col.defaultTo(false)) // Indicates if the position is displayed in the UI
      .addColumn("token_name", "varchar(50)", (col) => col.notNull())
      .addColumn("collateral_amount_usd", "numeric", (col) => col.notNull())
      .addColumn("leverage", "numeric", (col) => col.notNull())
      .addColumn("size_usd", "numeric", (col) => col.notNull())
      .addColumn("entry_price_usd", "numeric", (col) => col.notNull())
      .addColumn("pnl_usd", "numeric", (col) => col.notNull())
      .addColumn("mark_price_usd", "numeric", (col) => col.notNull())
      .addColumn("liq_price_usd", "numeric", (col) => col.notNull())
      .addColumn("key", "varchar(255)", (col) => col.notNull())
      .addColumn("contract_key", "varchar(255)", (col) => col.unique().notNull())
      .addColumn("trader_address", "varchar(42)", (col) => col.notNull())
      .addColumn("market_address", "varchar(42)", (col) => col.notNull())
      .addColumn("collateral_token_address", "varchar(42)", (col) => col.notNull())
      .addColumn("size_in_usd", "numeric", (col) => col.notNull())
      .addColumn("size_in_tokens", "numeric", (col) => col.notNull())
      .addColumn("collateral_amount", "numeric", (col) => col.notNull())
      .addColumn("pending_borrowing_fees_usd", "numeric", (col) => col.notNull())
      .addColumn("increased_at_time", "bigint", (col) => col.notNull())
      .addColumn("decreased_at_time", "bigint", (col) => col.defaultTo(null))
      .addColumn("is_long", "boolean", (col) => col.notNull())
      .addColumn("funding_fee_amount", "numeric", (col) => col.notNull())
      .addColumn("claimable_long_token_amount", "numeric", (col) => col.defaultTo(0))
      .addColumn("claimable_short_token_amount", "numeric", (col) => col.defaultTo(0))
      .addColumn("is_opening", "boolean", (col) => col.defaultTo(false))
      .addColumn("pnl", "numeric", (col) => col.defaultTo(0))
      .addColumn("position_fee_amount", "numeric", (col) => col.defaultTo(0))
      .addColumn("trader_discount_amount", "numeric", (col) => col.defaultTo(0))
      .addColumn("ui_fee_amount", "numeric", (col) => col.defaultTo(0))
      .addColumn("data", "text", (col) => col.defaultTo(null))
      .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
      .addColumn("updated_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
      .execute();

    console.log("Positions table created/verified");

    // Add foreign key constraints if they don't exist (unchanged)
    try {
      await db.schema
        .alterTable("trades")
        .addForeignKeyConstraint("trades_trader_address_fkey", ["trader_address"], "traders", ["address"])
        .execute();
    } catch (error) {
      log.output("Foreign key constraint for trades table already exists or failed to create", "warn");
    }

    try {
      await db.schema
        .alterTable("positions")
        .addForeignKeyConstraint("positions_trader_address_fkey", ["trader_address"], "traders", ["address"])
        .execute();
    } catch (error) {
      log.output("Foreign key constraint for positions table already exists or failed to create", "warn");
    }

    // Add indexes for better performance (FIXME: Are we are missing some indexes? (trade_id))
    try {
      await db.schema
        .createIndex("idx_trades_trader_address")
        .ifNotExists()
        .on("trades")
        .column("trader_address")
        .execute();

      await db.schema
        .createIndex("idx_positions_trader_address")
        .ifNotExists()
        .on("positions")
        .column("trader_address")
        .execute();

      // Add indexes for new columns
      await db.schema
        .createIndex("idx_traders_platform_ranking")
        .ifNotExists()
        .on("traders")
        .column("platform_ranking")
        .execute();

      await db.schema
        .createIndex("idx_traders_dex_platform")
        .ifNotExists()
        .on("traders")
        .column("dex_platform")
        .execute();

      console.log("Database indexes created/verified");
    } catch (error) {
      log.output("Some indexes might already exist or failed to create", "warn");
    }

    log.output("Database initialized successfully");
  } catch (error) {
    log.throwError(error);
  }
}

function get(): Kysely<Database> {
  return db;
}

const database = {
  get,
  initializeDatabase,
  updateTraders,
  addTrader,
  favoriteTrader,
  unfavoriteTrader,
  selectTraders,
  mirrorTrades,
  getTraders,
  getSelectedTraders,
  getTrades,
  getTradeById,
  getPositions,
  closePositions,
  createPositions,
  updatePositions,
  insertTrades,
  markTradesAsDisplayed,
  resetTraders,
};

export default database;
