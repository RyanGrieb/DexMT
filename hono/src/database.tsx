import { Kysely, PostgresDialect, sql } from "kysely";
import { Pool } from "pg";
import wallet from "./api/wallet";
import { Database } from "./types/dbtypes";
import { Trader } from "./types/trader";

// PostgreSQL connection
const dialect = new PostgresDialect({
  pool: new Pool({
    database: "dexmt",
    host: process.env.DATABASE_URL?.includes("postgres") ? "postgres" : "localhost",
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

    // Create trades table (unchanged)
    await db.schema
      .createTable("trades")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("trader_address", "varchar(42)", (col) => col.notNull())
      .addColumn("token_in", "varchar(42)", (col) => col.notNull())
      .addColumn("token_out", "varchar(42)", (col) => col.notNull())
      .addColumn("amount_in", "varchar(50)", (col) => col.notNull())
      .addColumn("amount_out", "varchar(50)", (col) => col.notNull())
      .addColumn("price", "varchar(50)", (col) => col.notNull())
      .addColumn("transaction_hash", "varchar(66)", (col) => col.unique().notNull())
      .addColumn("block_number", "bigint", (col) => col.notNull())
      .addColumn("chain_id", "varchar(10)", (col) => col.notNull())
      .addColumn("status", "varchar(20)", (col) => col.defaultTo("pending"))
      .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
      .addColumn("updated_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
      .execute();
    console.log("Trades table created/verified");

    // Create positions table (unchanged)
    await db.schema
      .createTable("positions")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("trader_address", "varchar(42)", (col) => col.notNull())
      .addColumn("token", "varchar(42)", (col) => col.notNull())
      .addColumn("collateral", "numeric", (col) => col.notNull())
      .addColumn("leverage", "numeric", (col) => col.notNull())
      .addColumn("size", "numeric", (col) => col.notNull())
      .addColumn("entry_price", "numeric", (col) => col.notNull())
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

    // Add indexes for better performance
    try {
      await db.schema
        .createIndex("idx_trades_trader_address")
        .ifNotExists()
        .on("trades")
        .column("trader_address")
        .execute();

      await db.schema
        .createIndex("idx_trades_transaction_hash")
        .ifNotExists()
        .on("trades")
        .column("transaction_hash")
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

    console.log(`User added/updated in database: ${trader.address}`);
  } catch (error) {
    console.error("Error adding user to database:", error);
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

    console.log(`Traders selected: ${traderAddresses.join(", ")} by ${followerAddr}`);
  } catch (error) {
    console.error("Error selecting traders:", error);
    throw error;
  }
  return db;
}

async function mirrorTrades(args: { address: string; enable: boolean }) {
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
    console.error("Error updating trader mirroring status:", error);
    throw error;
  }
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
    let query = db
      .selectFrom("traders")
      .select([
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

/*
async function getPositions(address: string) {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase first.");
  }

  try {
    const positions = await db
      .selectFrom("positions")
      .selectAll()
      .where("trader_address", "=", address)
      .execute();

    return positions;
  } catch (error) {
    console.error("Error fetching positions:", error);
    throw error;
  }
}

*/

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
};

export default database;
