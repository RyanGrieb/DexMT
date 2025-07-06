import { JSONStringify } from "json-with-bigint";
import { sql } from "kysely";
import { DEXPosition } from "../types/trader";
import log from "../utils/logs";
import database from "./database";

export async function getPositions(address: string) {
  try {
    const positions = await database
      .get()
      .selectFrom("positions")
      .selectAll()
      .where("trader_address", "=", address)
      .execute();

    return positions;
  } catch (error) {
    log.throwError(error);
  }

  return [];
}

export async function closePositions(positions: DEXPosition | DEXPosition[]) {
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
    await database
      .get()
      .transaction()
      .execute(async (trx) => {
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
    log.throwError(error);
  }
}

export async function createPositions(positions: DEXPosition | DEXPosition[]) {
  const positionsArr = Array.isArray(positions) ? positions : [positions];

  if (positionsArr.length === 0) {
    return;
  }

  try {
    await database
      .get()
      .transaction()
      .execute(async (trx) => {
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
    log.throwError(error);
  }
}

export async function updatePositions(positions: DEXPosition[]) {
  if (positions.length === 0) {
    return;
  }

  try {
    await database
      .get()
      .transaction()
      .execute(async (trx) => {
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
    log.throwError(error);
  }
}
