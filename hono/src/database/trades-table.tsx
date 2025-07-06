import { JSONStringify } from "json-with-bigint";
import { sql } from "kysely";
import { DEXTradeAction } from "../types/trader";
import log from "../utils/logs";
import database from "./database";

export async function getTrades(address: string) {
  try {
    const trades = await database
      .get()
      .selectFrom("trades")
      .selectAll()
      .where("trader_address", "=", address)
      .execute();

    if (trades.length === 0) {
      return [];
    }

    return trades;
  } catch (error) {
    log.error(error);
  }

  return [];
}

export async function getTradeById(tradeId: string) {
  try {
    const trade = await database
      .get()
      .selectFrom("trades")
      .selectAll()
      .where("trade_id", "=", tradeId)
      .executeTakeFirst();

    return trade;
  } catch (error) {
    log.throwError(error);
  }
}

export async function markTradesAsDisplayed(tradeIds: string[]) {
  if (tradeIds.length === 0) {
    return;
  }

  try {
    await database
      .get()
      .updateTable("trades")
      .set({
        is_displayed: true,
        updated_at: sql`CURRENT_TIMESTAMP`,
      })
      .where("trade_id", "in", tradeIds)
      .execute();

    console.log(`Marked ${tradeIds.length} trades as displayed`);
  } catch (error) {
    log.throwError(error);
  }
}

export async function insertTrades(trades: DEXTradeAction[]) {
  if (trades.length === 0) {
    log.output("DB: insertTrades() - Insert 0 trades", "warn");
    return;
  }

  try {
    await database
      .get()
      .transaction()
      .execute(async (trx) => {
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
    log.throwError(error);
  }
}
