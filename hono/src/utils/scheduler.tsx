import database from "../database/database";
import log from "./logs";
import scraper from "./scraper";

const UPDATE_USERS_ON_START = false;

async function updateTraderLeaderboard() {
  try {
    console.log("Starting trader leaderboard update...");

    const traders = await scraper.getTopTraders({
      platform: "gmx",
      limit: 100,
    });
    console.log(`Fetched ${traders.length} top traders from GMX`);

    if (traders.length === 0) {
      console.log("No traders fetched, skipping balance updates");
      return;
    }

    database.updateTraders(traders);

    console.log("Finished updating users from GMX leaderboard");
  } catch (error) {
    console.error("Error in updateUsersAndTrades:", error);
  }
}

async function updateOpenPositions() {
  // A list of traders who are mirroring trades
  const traders = await database.getTraders({ isMirroring: true });

  for (const trader of traders) {
    for (const selectedTrader of await database.getTraders({
      favoriteOfAddress: trader.address,
      selected: true,
    })) {
      // Update the positions table in the DB such that it reflects the SDK. (We also keep track of the positions that closed)
      const sdkPositions = await selectedTrader.getPositions();
      const dbPositions = await selectedTrader.getPositions({ fromDb: true });

      // For testing, we treat isFake positions as SDK positions (so we don't close them by default)
      const closedPositions = dbPositions.filter(
        (dbPosition) => !sdkPositions.some((sdkPosition) => sdkPosition.key === dbPosition.key) && !dbPosition.isFake
      );

      // created = new in SDK
      const createdPositions = sdkPositions.filter(
        (sdkPosition) => !dbPositions.some((dbPosition) => dbPosition.key === sdkPosition.key)
      );

      // updated = still there but values changed
      const updatedPositions = sdkPositions.filter((sdkPosition) => {
        const dbPosition = dbPositions.find((d) => d.key === sdkPosition.key);
        return (
          !!dbPosition &&
          (dbPosition.sizeUsd !== sdkPosition.sizeUsd ||
            dbPosition.collateralAmountUsd !== sdkPosition.collateralAmountUsd ||
            dbPosition.entryPriceUsd !== sdkPosition.entryPriceUsd ||
            dbPosition.markPriceUsd !== sdkPosition.markPriceUsd ||
            dbPosition.leverage !== sdkPosition.leverage)
        );
      });

      database.closePositions(closedPositions);
      database.createPositions(createdPositions);
      database.updatePositions(updatedPositions);

      //const trades = await gmxSdk.getTradeHistory(selectedTrader.address);
    }
  }
}

async function updateTradeHistory() {
  const traders = await database.getTraders({ isMirroring: true });

  log.output(`~~~ Updating trade history for ${traders.length} traders ~~~`);

  for (const trader of traders) {
    for (const selectedTrader of await database.getTraders({
      favoriteOfAddress: trader.address,
      selected: true,
    })) {
      // Skip if the trader is trying to mirror themselves
      if (selectedTrader.address === trader.address) {
        continue;
      }

      // FIXME: We might be inserting duplicate trades when fetching from the SDK,
      // This is because when we insertTrades, by default is_displayed is false for trades.
      const trades = await selectedTrader.getNewTrades();
      log.output(`Found ${trades.length} new trades for trader: ${selectedTrader.address}`);

      if (trades.length) {
        // Insert the original trades from the selected trader
        await database.insertTrades(trades);

        // Create mirrored trades with the mirroring trader's address
        const mirroredTrades = trades.map((trade) => ({
          ...trade,
          id: `${trade.id}-mirror`, // Ensure unique ID for mirrored trades
          traderAddr: trader.address, // Change the trader address to the mirroring trader
          mirroredTraderAddr: selectedTrader.address, // Keep the original trader as the mirrored trader
        }));

        // Insert the mirrored trades as separate entries
        await database.insertTrades(mirroredTrades);
      }
    }
  }
}

// Separate function to start the interval
function startUpdateLeaderboardTask() {
  setInterval(updateTraderLeaderboard, 300000); // 5 minutes

  if (UPDATE_USERS_ON_START) {
    updateTraderLeaderboard().catch(console.error);
  }
}

function startMirrorTradesTask() {
  setInterval(updateOpenPositions, 60000); // 1 minute
  setInterval(updateTradeHistory, 60000); // 1 minute

  //updateOpenPositions();
  updateTradeHistory();
}

function init() {
  startUpdateLeaderboardTask();
  startMirrorTradesTask();
}

const scheduler = {
  init,
  updateOpenPositions,
  updateTradeHistory,
};

export default scheduler;
