import { JSONStringify } from "json-with-bigint";
import { sql } from "kysely";
import wallet from "../api/wallet";
import { Trader } from "../types/trader";
import log from "../utils/logs";
import database from "./database";

export async function updateTraders(traders: Trader[]): Promise<void> {
  try {
    // Use a transaction for better performance and consistency
    await database
      .get()
      .transaction()
      .execute(async (trx) => {
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

export async function addTrader(trader: Trader) {
  try {
    await database
      .get()
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

export async function favoriteTrader(args: {
  followerAddr: string;
  favoriteAddr: string;
  signature: string;
  message: string;
  timestamp: bigint;
}) {
  const { followerAddr, favoriteAddr, signature, message, timestamp } = args;

  try {
    await database
      .get()
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

export async function unfavoriteTrader(args: {
  followerAddr: string;
  favoriteAddr: string;
  signature: string;
  message: string;
  timestamp: bigint;
}) {
  const { followerAddr, favoriteAddr, signature, message, timestamp } = args;

  try {
    // Delete the favorite relationship
    await database
      .get()
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

export async function selectTraders(args: {
  followerAddr: string;
  traderAddresses: string[];
  signature: string;
  message: string;
  timestamp: bigint;
  selected: boolean;
}) {
  const { followerAddr, traderAddresses, signature, message, timestamp, selected } = args;

  try {
    // Use a transaction to ensure all traders are selected together
    await database
      .get()
      .transaction()
      .execute(async (trx) => {
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
}

export async function mirrorTrades(args: { address: `0x${string}`; enable: boolean }) {
  const { address, enable } = args;

  try {
    await database
      .get()
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

export async function getTraders(selection_args?: {
  favoriteOfAddress?: string;
  selected?: boolean;
  isMirroring?: boolean;
}): Promise<Trader[]> {
  try {
    let query = database
      .get()
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
export async function getSelectedTraders(followerAddress: string): Promise<string[]> {
  try {
    const selectedTraders = await database
      .get()
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

export async function resetTraders() {
  return database
    .get()
    .transaction()
    .execute(async (trx) => {
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
