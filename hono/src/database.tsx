import { JSONStringify } from "json-with-bigint";
import { Kysely, PostgresDialect, sql } from "kysely";
import { Pool } from "pg";
import wallet from "./api/wallet";
import { Database } from "./types/dbtypes";
import { DEXPosition, DEXTradeAction, Trader } from "./types/trader";
import log from "./utils/logs";

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

let db: Kysely<Database> | null = null;

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
      console.log("Foreign key constraint for trades table already exists or failed to create");
    }

    try {
      await db.schema
        .alterTable("positions")
        .addForeignKeyConstraint("positions_trader_address_fkey", ["trader_address"], "traders", ["address"])
        .execute();
    } catch (error) {
      console.log("Foreign key constraint for positions table already exists or failed to create");
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
      console.log("Some indexes might already exist:", error);
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

async function updateTraders(traders: Trader[]): Promise<void> {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase first.");
  }

  try {
    // Use a transaction for better performance and consistency
    await db.transaction().execute(async (trx) => {
      for (const trader of traders) {
        await trx
          .insertInto("traders")
          .values({
            address: trader.address,
            balance: trader.balance,
            chain_id: trader.chainId,
            platform_ranking: trader.platformRanking,
            dex_platform: trader.dexPlatform,
            pnl: trader.pnl,
            pnl_percentage: trader.pnlPercentage,
            avg_size: trader.avgSize,
            avg_leverage: trader.avgLeverage,
            win_ratio: trader.winRatio,
            dexmt_trader: trader.isDexmtTrader || false,
            mirroring_trades: trader.isMirroringTrades || false,
            updated_at: sql`CURRENT_TIMESTAMP`,
          })
          .onConflict((oc) =>
            oc.column("address").doUpdateSet({
              balance: trader.balance,
              chain_id: trader.chainId,
              platform_ranking: trader.platformRanking,
              dex_platform: trader.dexPlatform,
              pnl: trader.pnl,
              pnl_percentage: trader.pnlPercentage,
              avg_size: trader.avgSize,
              avg_leverage: trader.avgLeverage,
              win_ratio: trader.winRatio,
              updated_at: sql`CURRENT_TIMESTAMP`,
            })
          )
          .execute();
      }
    });

    console.log(`Updated/inserted ${traders.length} traders in database`);
  } catch (error) {
    console.error("Error updating traders in database:", error);
    throw error;
  }
}

async function addTrader(trader: Trader) {
  if (!db) {
    log.output("Database not initialized. Call initializeDatabase first.");
    throw new Error("Database not initialized. Call initializeDatabase first.");
  }

  try {
    await db
      .insertInto("traders")
      .values({
        address: trader.address,
        chain_id: trader.chainId,
        dexmt_trader: trader.isDexmtTrader,
        mirroring_trades: false,
        balance: await wallet.getEthBalance(trader.address, "https://arb1.arbitrum.io/rpc"),
      })
      .onConflict((oc) =>
        oc.column("address").doUpdateSet({
          chain_id: trader.chainId,
          updated_at: new Date().toISOString(),
        })
      )
      .execute();

    //log.output(`User added/updated in database: ${trader.address}`);
  } catch (error) {
    console.error("Error adding user to database:", error);
    log.output(`Error adding user to database: ${error}`);
  }
}

async function favoriteTrader(args: {
  followerAddr: string;
  favoriteAddr: string;
  signature: string;
  message: string;
  timestamp: bigint;
}) {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase first.");
  }

  const { followerAddr, favoriteAddr, signature, message, timestamp } = args;

  try {
    await db
      .insertInto("favorited_traders")
      .values({
        follower_address: followerAddr,
        favorited_address: favoriteAddr,
        signature,
        message,
        timestamp,
        selected: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute();

    console.log(`Trader favorited: ${favoriteAddr} by copier: ${followerAddr}`);
    log.address(followerAddr, `Favorited trader: ${favoriteAddr}`);
    log.output(`Trader favorited: ${favoriteAddr} by copier: ${followerAddr}`);
  } catch (error) {
    console.error("Error favoriting trader:", error);
  }
}

// Add this function to your database object

async function unfavoriteTrader(args: {
  followerAddr: string;
  favoriteAddr: string;
  signature: string;
  message: string;
  timestamp: bigint;
}) {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase first.");
  }

  const { followerAddr, favoriteAddr, signature, message, timestamp } = args;

  try {
    // Delete the favorite relationship
    await db
      .deleteFrom("favorited_traders")
      .where("follower_address", "=", followerAddr)
      .where("favorited_address", "=", favoriteAddr)
      .execute();

    console.log(`Trader unfavorited: ${favoriteAddr} by user: ${followerAddr}`);
    log.address(followerAddr, `Unfavorited trader: ${favoriteAddr}`);
    log.output(`Trader unfavorited: ${favoriteAddr} by user: ${followerAddr}`);
  } catch (error) {
    console.error("Error unfavoriting trader:", error);
    throw error;
  }
}

async function selectTraders(args: {
  followerAddr: string;
  traderAddresses: string[];
  signature: string;
  message: string;
  timestamp: bigint;
  selected: boolean;
}) {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase first.");
  }

  const { followerAddr, traderAddresses, signature, message, timestamp, selected } = args;

  try {
    // Use a transaction to ensure all traders are selected together
    await db.transaction().execute(async (trx) => {
      for (const traderAddr of traderAddresses) {
        await trx
          .updateTable("favorited_traders")
          .set({
            selected: selected,
            updated_at: new Date().toISOString(),
          })
          .where("follower_address", "=", followerAddr)
          .where("favorited_address", "=", traderAddr)
          .execute();
      }
    });

    console.log(`Trader ${selected ? "selected" : "deselected"}: ${traderAddresses.join(", ")} by ${followerAddr}`);
    log.address(followerAddr, `Trader ${selected ? "selected" : "deselected"}: ${traderAddresses.join(", ")}`);
    log.output(`Trader ${selected ? "selected" : "deselected"}: ${traderAddresses.join(", ")} by ${followerAddr}`);
  } catch (error) {
    console.error("Error selecting traders:", error);
    throw error;
  }
  return db;
}

async function mirrorTrades(args: { address: `0x${string}`; enable: boolean }) {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase first.");
  }

  const { address, enable } = args;

  try {
    await db
      .updateTable("traders")
      .set({
        mirroring_trades: enable,
        updated_at: new Date().toISOString(),
      })
      .where("address", "=", address)
      .execute();
  } catch (error) {
    log.error(error);
    throw error;
  }

  log.address(address, `Mirroring trades ${enable ? "enabled" : "disabled"}`);
}

async function getTraders(selection_args?: {
  favoriteOfAddress?: string;
  selected?: boolean;
  isMirroring?: boolean;
}): Promise<Trader[]> {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase first.");
  }

  try {
    let query = db.selectFrom("traders").select([
      "address",
      "balance",
      "chain_id",
      "platform_ranking",
      "dexmt_trader",
      "mirroring_trades",
      "dex_platform",
      "pnl",
      "pnl_percentage",
      "avg_size",
      "avg_leverage",
      "win_ratio",
      "updated_at",
      // FIXME: This is inefficient, create a new column in the traders table that tracks the amount of (favorited + selected) traders.
      (eb) =>
        eb
          .selectFrom("favorited_traders")
          .select((eb) => eb.fn.count("follower_address").distinct().as("count"))
          .whereRef("favorited_traders.favorited_address", "=", "traders.address")
          .where("favorited_traders.selected", "=", true)
          .as("watching_amt"),
    ]);

    // If favoriteOfAddress is specified, use EXISTS subquery approach
    if (selection_args?.favoriteOfAddress) {
      if (selection_args.selected !== undefined) {
        // Use EXISTS with subquery to filter by both 'favorited AND selected' status
        query = query.where(({ exists, selectFrom }) =>
          exists(
            selectFrom("favorited_traders")
              .select("id")
              .where("favorited_traders.follower_address", "=", selection_args.favoriteOfAddress!)
              .whereRef("favorited_traders.favorited_address", "=", "traders.address")
              .where("favorited_traders.selected", "=", selection_args.selected!)
          )
        );
      } else {
        // Use EXISTS with subquery to filter by favorites only
        query = query.where(({ exists, selectFrom }) =>
          exists(
            selectFrom("favorited_traders")
              .select("id")
              .where("favorited_traders.follower_address", "=", selection_args.favoriteOfAddress!)
              .whereRef("favorited_traders.favorited_address", "=", "traders.address")
          )
        );
      }
    }

    // If selection_args specifies isMirroring, filter for traders with mirroring_trades enabled
    if (selection_args?.isMirroring !== undefined) {
      query = query.where("mirroring_trades", "=", selection_args.isMirroring);
    }

    const db_traders = await query.orderBy("platform_ranking", "asc").execute();

    const traders: Trader[] = db_traders.map(
      (trader) =>
        new Trader({
          address: trader.address,
          balance: trader.balance,
          chainId: trader.chain_id,
          isDexmtTrader: trader.dexmt_trader,
          isMirroringTrades: trader.mirroring_trades,
          platformRanking: trader.platform_ranking,
          dexPlatform: trader.dex_platform,
          pnl: trader.pnl,
          pnlPercentage: trader.pnl_percentage,
          avgSize: trader.avg_size,
          avgLeverage: trader.avg_leverage,
          winRatio: trader.win_ratio,
          watchingAmt: Number(trader.watching_amt) || 0, // Use the subquery result
          updatedAt: trader.updated_at.toISOString(),
        })
    );

    return traders;
  } catch (error) {
    console.error("Error fetching traders from database:", error);
    throw error;
  }
}

// Add a helper function to get selected trader addresses for easier use
async function getSelectedTraders(followerAddress: string): Promise<string[]> {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase first.");
  }

  try {
    const selectedTraders = await db
      .selectFrom("favorited_traders")
      .select("favorited_address")
      .where("follower_address", "=", followerAddress)
      .where("selected", "=", true)
      .execute();

    return selectedTraders.map((trader) => trader.favorited_address);
  } catch (error) {
    console.error("Error getting selected traders:", error);
    throw error;
  }
}

async function getTrades(address: string) {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase first.");
  }

  try {
    const trades = await db.selectFrom("trades").selectAll().where("trader_address", "=", address).execute();

    if (trades.length === 0) {
      return [];
    }

    return trades;
  } catch (error) {
    log.error(error);
    console.error("Error fetching trades:", error);
    throw error;
  }
}

async function getTradeById(tradeId: string) {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase first.");
  }

  try {
    const trade = await db.selectFrom("trades").selectAll().where("trade_id", "=", tradeId).executeTakeFirst();

    return trade;
  } catch (error) {
    log.error(error);
    console.error("Error fetching trade by id:", error);
    throw error;
  }
}

async function getPositions(address: string) {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase first.");
  }

  try {
    const positions = await db.selectFrom("positions").selectAll().where("trader_address", "=", address).execute();

    return positions;
  } catch (error) {
    log.error(error);
    console.error("Error fetching positions:", error);
    throw error;
  }
}

async function closePositions(positions: DEXPosition | DEXPosition[]) {
  if (!db) {
    log.output("Database not initialized. Call initializeDatabase first.");
    throw new Error("Database not initialized. Call initializeDatabase first.");
  }

  const positionsArr = Array.isArray(positions) ? positions : [positions];
  if (positionsArr.length === 0) {
    return;
  }

  log.output(
    `Closing positions: ${positionsArr
      .map((p) => `${p.contractKey}(${p.tokenName} ${p.isLong ? "LONG" : "SHORT"})`)
      .join(", ")}`
  );

  try {
    await db.transaction().execute(async (trx) => {
      for (const position of positionsArr) {
        // Move to closed_positions
        await trx
          .insertInto("closed_positions")
          .values({
            is_fake: position.isFake ?? false, // Use isFake if available, otherwise default to false
            token_name: position.tokenName,
            collateral_amount_usd: position.collateralAmountUsd,
            leverage: position.leverage,
            size_usd: position.sizeUsd,
            entry_price_usd: position.entryPriceUsd,
            pnl_usd: position.pnlUsd,
            mark_price_usd: position.markPriceUsd,
            liq_price_usd: position.liqPriceUsd,
            key: position.key,
            contract_key: position.contractKey,
            trader_address: position.traderAddr,
            market_address: position.marketAddress,
            collateral_token_address: position.collateralTokenAddress,
            size_in_usd: position.sizeInUsd,
            size_in_tokens: position.sizeInTokens,
            collateral_amount: position.collateralAmount,
            pending_borrowing_fees_usd: position.pendingBorrowingFeesUsd,
            increased_at_time: position.increasedAtTime,
            decreased_at_time: position.decreasedAtTime,
            is_long: position.isLong,
            funding_fee_amount: position.fundingFeeAmount,
            claimable_long_token_amount: position.claimableLongTokenAmount,
            claimable_short_token_amount: position.claimableShortTokenAmount,
            is_opening: position.isOpening ?? false,
            pnl: position.pnl,
            position_fee_amount: position.positionFeeAmount,
            trader_discount_amount: position.traderDiscountAmount,
            ui_fee_amount: position.uiFeeAmount,
            data: position.data,
          })
          .execute();

        // Remove from open positions
        await trx.deleteFrom("positions").where("contract_key", "=", position.contractKey).execute();

        log.address(position.traderAddr, `Position closed:\n ${JSONStringify(position)}`);
      }
    });

    log.output(`Closed and removed ${positionsArr.length} positions`);
  } catch (error) {
    console.error("Error closing positions:", error);
    log.output(`Error closing positions: ${error}`, "error");
    throw error;
  }
}

async function createPositions(positions: DEXPosition | DEXPosition[]) {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase first.");
  }

  const positionsArr = Array.isArray(positions) ? positions : [positions];

  if (positionsArr.length === 0) {
    return;
  }

  try {
    await db.transaction().execute(async (trx) => {
      for (const position of positionsArr) {
        await trx
          .insertInto("positions")
          .values({
            key: position.key,
            is_fake: position.isFake ?? false, // Use isFake if available, otherwise default to false
            is_displayed: false,
            contract_key: position.contractKey,
            trader_address: position.traderAddr,
            market_address: position.marketAddress,
            collateral_token_address: position.collateralTokenAddress,
            size_in_usd: position.sizeInUsd,
            size_in_tokens: position.sizeInTokens,
            collateral_amount: position.collateralAmount,
            pending_borrowing_fees_usd: position.pendingBorrowingFeesUsd,
            increased_at_time: position.increasedAtTime,
            decreased_at_time: position.decreasedAtTime,
            is_long: position.isLong,
            funding_fee_amount: position.fundingFeeAmount,
            claimable_long_token_amount: position.claimableLongTokenAmount,
            claimable_short_token_amount: position.claimableShortTokenAmount,
            is_opening: position.isOpening ?? false,
            pnl: position.pnl,
            position_fee_amount: position.positionFeeAmount,
            trader_discount_amount: position.traderDiscountAmount,
            ui_fee_amount: position.uiFeeAmount,
            data: position.data,
            // helper / legacy columns
            token_name: position.tokenName,
            collateral_amount_usd: position.collateralAmountUsd,
            leverage: position.leverage,
            size_usd: position.sizeUsd,
            entry_price_usd: position.entryPriceUsd,
            pnl_usd: position.pnlUsd,
            mark_price_usd: position.markPriceUsd,
            liq_price_usd: position.liqPriceUsd,
            updated_at: sql`CURRENT_TIMESTAMP`,
          })
          .execute();

        log.address(position.traderAddr, `Position created:\n ${JSONStringify(position)}`);
      }
    });

    log.output(`Created ${positionsArr.length} positions`);
  } catch (error) {
    console.error("Error creating positions:", error);
    throw error;
  }
}

async function updatePositions(positions: DEXPosition[]) {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase first.");
  }
  if (positions.length === 0) {
    return;
  }

  try {
    await db.transaction().execute(async (trx) => {
      for (const position of positions) {
        await trx
          .updateTable("positions")
          .set({
            token_name: position.tokenName,
            collateral_amount_usd: position.collateralAmountUsd,
            leverage: position.leverage,
            size_usd: position.sizeUsd,
            entry_price_usd: position.entryPriceUsd,
            pnl_usd: position.pnlUsd,
            mark_price_usd: position.markPriceUsd,
            liq_price_usd: position.liqPriceUsd,
            contract_key: position.contractKey,
            trader_address: position.traderAddr,
            market_address: position.marketAddress,
            collateral_token_address: position.collateralTokenAddress,
            size_in_usd: position.sizeInUsd,
            size_in_tokens: position.sizeInTokens,
            collateral_amount: position.collateralAmount,
            pending_borrowing_fees_usd: position.pendingBorrowingFeesUsd,
            increased_at_time: position.increasedAtTime,
            decreased_at_time: position.decreasedAtTime,
            is_long: position.isLong,
            funding_fee_amount: position.fundingFeeAmount,
            claimable_long_token_amount: position.claimableLongTokenAmount,
            claimable_short_token_amount: position.claimableShortTokenAmount,
            is_opening: position.isOpening ?? false,
            pnl: position.pnl,
            position_fee_amount: position.positionFeeAmount,
            trader_discount_amount: position.traderDiscountAmount,
            ui_fee_amount: position.uiFeeAmount,
            data: position.data,
            updated_at: sql`CURRENT_TIMESTAMP`,
          })
          .where("key", "=", position.key)
          .execute();

        log.address(position.traderAddr, `Position updated:\n ${JSONStringify(position)}`);
      }
    });

    //console.log(`Updated ${positions.length} positions`);
  } catch (error) {
    console.error("Error updating positions:", error);
    throw error;
  }
}

async function markTradesAsDisplayed(tradeIds: string[]) {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase first.");
  }

  if (tradeIds.length === 0) {
    return;
  }

  try {
    await db
      .updateTable("trades")
      .set({
        is_displayed: true,
        updated_at: sql`CURRENT_TIMESTAMP`,
      })
      .where("trade_id", "in", tradeIds)
      .execute();

    console.log(`Marked ${tradeIds.length} trades as displayed`);
  } catch (error) {
    console.error("Error marking trades as displayed:", error);
    throw error;
  }
}

async function insertTrades(trades: DEXTradeAction[]) {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase first.");
  }
  if (trades.length === 0) {
    return;
  }

  try {
    await db.transaction().execute(async (trx) => {
      for (const trade of trades) {
        const result = await trx
          .insertInto("trades")
          .values({
            trade_id: trade.id,
            is_fake: trade.isFake ?? false, // Use isFake if available, otherwise default to false
            is_displayed: false,
            order_type: trade.orderType,
            trader_address: trade.traderAddr,
            mirrored_trader_address: trade.mirroredTraderAddr,
            market_address: trade.marketAddress,
            long_token_address: trade.longTokenAddress,
            short_token_address: trade.shortTokenAddress,
            is_long: trade.isLong,
            market_name: trade.marketName,
            token_name: trade.tokenName,
            size_usd: trade.sizeUsd,
            price_usd: trade.priceUsd,
            initial_collateral_usd: trade.initialCollateralUsd,
            size_delta_usd: trade.sizeDeltaUsd,
            rpnl: trade.rpnl,
            timestamp: trade.timestamp,
            updated_at: sql`CURRENT_TIMESTAMP`,
          })
          .onConflict((oc) => oc.column("trade_id").doNothing())
          .execute();

        // Only log if the trade was actually inserted (not a conflict)
        if (result.length > 0) {
          log.address(trade.traderAddr, `Trade created:\n ${JSONStringify(trade)}`);
        }
      }
    });

    //console.log(`Inserted ${trades.length} trades`);
  } catch (error) {
    console.error("Error inserting trades:", error);
    throw error;
  }
}

async function resetTraders() {
  if (!db) {
    console.log("Database not initialized, initializing now...");
    await initializeDatabase();
  }

  if (!db) {
    throw new Error("Failed to initialize database");
  }

  return db.transaction().execute(async (trx) => {
    try {
      // Delete in order to avoid any potential constraint issues
      // Delete child tables first, then parent tables
      await trx.deleteFrom("favorited_traders").execute();
      await trx.deleteFrom("trades").execute();
      await trx.deleteFrom("positions").execute();
      await trx.deleteFrom("closed_positions").execute();
      await trx.deleteFrom("traders").execute();

      console.log("All traders and related data reset successfully");
    } catch (error) {
      console.error("Error resetting traders:", error);
      console.error("Error details:", JSONStringify(error, null, 2));
      log.error(error);
      throw error;
    }
  });
}

const database = {
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
