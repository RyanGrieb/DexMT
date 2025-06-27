import database from "./database";
import scraper from "./scraper";
import { DEXTradeAction } from "./types/trader";

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

      const closedPositions = dbPositions.filter(
        (dbPosition) => !sdkPositions.some((sdkPosition) => sdkPosition.key === dbPosition.key)
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

  console.log(`Found ${traders.length} traders to update trades for`);

  for (const trader of traders) {
    const newTrades: DEXTradeAction[] = [];
    console.log(`Updating trades for trader: ${trader.address}`);
    for (const selectedTrader of await database.getTraders({
      favoriteOfAddress: trader.address,
      selected: true,
    })) {
      const sdkTrades = await selectedTrader.getTrades({ fromDb: false, amount: 5 });
      const dbTrades = await selectedTrader.getTrades({ fromDb: true }); //FIXME: This is not efficient, we should only query trades from the current day?

      // find only brand‐new trades
      const freshTrades = sdkTrades.filter((t) => !dbTrades.some((dt) => dt.id === t.id));

      if (freshTrades.length) {
        await database.insertTrades(freshTrades);
        newTrades.push(...freshTrades);
      }
    }

    await trader.mirrorTrades(newTrades);
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
