import database from "./database";
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

async function mirrorTrades() {
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
        (dbPosition) => !sdkPositions.some((sdkPosition) => sdkPosition.contractKey === dbPosition.contractKey)
      );
      // created = new in SDK
      const createdPositions = sdkPositions.filter(
        (sdkPosition) => !dbPositions.some((dbPosition) => dbPosition.contractKey === sdkPosition.contractKey)
      );

      // updated = still there but values changed
      const updatedPositions = sdkPositions.filter((sdkPosition) => {
        const dbPosition = dbPositions.find((d) => d.contractKey === sdkPosition.contractKey);
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

// Separate function to start the interval
function startUpdateLeaderboardTask() {
  setInterval(updateTraderLeaderboard, 300000); // 5 minutes

  if (UPDATE_USERS_ON_START) {
    updateTraderLeaderboard().catch(console.error);
  }
}

function startMirrorTradesTask() {
  setInterval(mirrorTrades, 60000); // 1 minute

  mirrorTrades();
}

function init() {
  startUpdateLeaderboardTask();
  startMirrorTradesTask();
}

const scheduler = {
  init,
};

export default scheduler;
