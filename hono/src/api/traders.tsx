import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import database from "../database";
import scheduler from "../scheduler";
import schemas from "../schemas";
import { Trader } from "../types/trader";
import log from "../utils/logs";

async function init(app: Hono) {
  // API endpoint to get users from database with all trading data

  app.get("/api/traders", async (c) => {
    try {
      const traders = await database.getTraders();
      return c.json(traders);
    } catch (error) {
      console.error("Error fetching traders:", error);
      return c.json({ error: "Failed to fetch traders" }, 500);
    }
  });

  app.get(
    "/api/traders/favorites",
    zValidator("query", schemas.FavoritesOfWallet, (result, c) => {
      if (!result.success) {
        return c.json({ error: result.error.message }, 400);
      }
    }),
    async (c) => {
      const { walletAddr } = c.req.valid("query");

      //utils.logOutput(`Fetching favorite traders for wallet: ${walletAddr}`);
      try {
        const favorites = await database.getTraders({ favoriteOfAddress: walletAddr });
        return c.json({ success: true, favorites }, 200);
      } catch (error) {
        console.error("Error fetching favorite traders:", error);
        return c.json({ error: "Failed to fetch favorite traders" }, 500);
      }
    }
  );

  app.get(
    "/api/traders/positions",
    zValidator("query", schemas.FavoritesOfWallet, (result, c) => {
      if (!result.success) {
        return c.json({ error: result.error.message }, 400);
      }
    }),
    async (c) => {
      const { walletAddr } = c.req.valid("query");
      try {
        const trader = await Trader.fromAddress({ address: walletAddr, fromDb: true });

        if (!trader) {
          return c.json({ success: false, positions: [] }, 200);
        }

        const positions = await trader.getPositions();

        return c.json({ success: true, positions: positions }, 200);
      } catch (error) {
        console.error("Error fetching open positions:", error);
        return c.json({ error: "Failed to fetch open positions" }, 500);
      }
    }
  );

  app.get(
    "/api/traders/trades",
    zValidator("query", schemas.FavoritesOfWallet, (result, c) => {
      if (!result.success) {
        return c.json({ error: result.error.message }, 400);
      }
    }),
    async (c) => {
      const { walletAddr } = c.req.valid("query");
      try {
        const trader = await Trader.fromAddress({ address: walletAddr, fromDb: true });

        if (!trader) {
          return c.json({ success: false, trades: [] }, 200);
        }

        const trades = await trader.getTrades({ amount: 10 });

        return c.json({ success: true, trades: trades }, 200);
      } catch (error) {
        console.error("Error fetching open positions:", error);
        return c.json({ error: "Failed to fetch open positions" }, 500);
      }
    }
  );

  // FIXME: Check for the testing environment variable, this is only for testing purposes
  app.post("/api/traders/reset", async (c) => {
    try {
      log.output("Resetting traders...");
      await database.resetTraders();
      log.resetTraderLogs();
      log.output("Traders reset successfully");
      return c.json({ success: true }, 200);
    } catch (error) {
      console.error("Error resetting traders:", error);
      return c.json({ error: "Failed to reset traders" }, 500);
    }
  });

  app.post(
    "/api/traders/favorite_trader",
    zValidator("json", schemas.favoriteTrader, (result, c) => {
      if (!result.success) {
        return c.json({ error: result.error.message }, 400);
      }
    }),
    async (c) => {
      const args = c.req.valid("json");
      return handleFavoriteTrader(c, args);
    }
  );

  app.post(
    "/api/traders/select_trader",
    zValidator("json", schemas.selectTrader, (result, c) => {
      if (!result.success) {
        return c.json({ error: result.error.message }, 400);
      }
    }),
    async (c) => {
      const args = c.req.valid("json");
      return handleTraderSelection(c, args);
    }
  );

  app.post(
    "/api/traders/toggle_auto_copy",
    zValidator("json", schemas.autoCopy, (result, c) => {
      if (!result.success) {
        return c.json({ error: result.error.message }, 400);
      }
    }),
    async (c) => {
      const args = c.req.valid("json");
      return handleToggleAutoCopy(c, args);
    }
  );

  // FIXME: Check for the testing environment variable, this is only for testing purposes
  app.post("/api/traders/trigger_mirror_trades", async (c) => {
    try {
      log.output("Manually triggering mirror trades for testing...");

      // Trigger both functions that the scheduler normally calls
      await scheduler.updateOpenPositions();
      await scheduler.updateTradeHistory();

      log.output("Mirror trades triggered successfully");
      return c.json(
        {
          success: true,
          message: "Mirror trades processing triggered successfully",
        },
        200
      );
    } catch (error) {
      console.error("Error triggering mirror trades:", error);
      return c.json({ error: "Failed to trigger mirror trades" }, 500);
    }
  });

  // FIXME: Check for the testing environment variable, this is only for testing purposes
  app.post(
    "/api/traders/inject_fake_trade",
    zValidator("json", schemas.injectFakeTrade, (result, c) => {
      if (!result.success) {
        return c.json({ error: result.error.message }, 400);
      }
    }),
    async (c) => {
      try {
        const trade = c.req.valid("json");
        await database.insertTrades([trade]);

        log.output(`Injected fake trade: ${trade.id} for ${trade.traderAddr}`);
        return c.json(
          {
            success: true,
            message: "Fake trade injected successfully",
            trade: trade,
          },
          200
        );
      } catch (error) {
        log.error(error);
        return c.json({ error: "Failed to inject fake trade" }, 500);
      }
    }
  );

  // FIXME: Check for the testing environment variable, this is only for testing purposes
  app.post(
    "/api/traders/inject_fake_position",
    zValidator("json", schemas.injectFakePosition, (result, c) => {
      if (!result.success) {
        log.output(`Position validation failed: ${result.error.message}`, "error");
        return c.json({ error: result.error.message }, 400);
      }
    }),
    async (c) => {
      try {
        const position = c.req.valid("json");
        log.output(`Attempting to inject position with key: ${position.key} for trader: ${position.traderAddr}`);

        await database.createPositions([position]);

        log.output(`Injected fake position: ${position.key} for ${position.traderAddr}`);

        return c.json(
          {
            success: true,
            message: "Fake position injected successfully",
            position: {
              key: position.key,
              account: position.account,
              traderAddr: position.traderAddr,
              marketAddress: position.marketAddress,
              sizeUsd: position.sizeUsd,
              collateralAmountUsd: position.collateralAmountUsd,
            },
          },
          200
        );
      } catch (error) {
        log.error(error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : String(error);

        return c.json(
          {
            error: "Failed to inject fake position",
            details: `${errorMessage}${errorStack ? `\nStack trace:\n${errorStack}` : ""}`,
          },
          500
        );
      }
    }
  );
}

async function handleToggleAutoCopy(
  c: any,
  args: {
    walletAddr: string;
    enable: boolean;
  }
) {
  const { walletAddr, enable } = args;

  try {
    await database.mirrorTrades({ address: walletAddr as `0x${string}`, enable });

    console.log(`Copy trading ${enable ? "enabled" : "disabled"} for: ${walletAddr}`);

    return c.json({
      success: true,
      message: `Auto-copy trading ${enable ? "enabled" : "disabled"} successfully`,
      address: walletAddr,
    });
  } catch (error) {
    console.error("Error starting auto-copy trading:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
}

// Generic handler for favorite/unfavorite
async function handleFavoriteTrader(
  c: any,
  args: {
    message: string;
    walletAddr: string;
    traderAddr: string;
    signature: string;
    timestamp: bigint;
    favorite: boolean;
  }
) {
  const { message, walletAddr, traderAddr, signature, timestamp, favorite } = args;

  try {
    // Perform DB action
    const dbMethod = favorite ? database.favoriteTrader : database.unfavoriteTrader;
    await dbMethod({
      followerAddr: walletAddr,
      favoriteAddr: traderAddr,
      signature,
      message,
      timestamp: timestamp,
    });

    // Build response
    const respKey = favorite ? "favorite_trader" : "unfavorite_trader";
    return c.json(
      {
        success: true,
        follower_address: walletAddr,
        [respKey]: traderAddr,
      },
      200
    );
  } catch (error) {
    console.error(`Error ${favorite ? "favoriting" : "unfavoriting"} trader:`, error);
    return c.json({ error: `Failed to ${favorite ? "favorite" : "unfavorite"} trader` }, 500);
  }
}

async function handleTraderSelection(
  c: any,
  args: {
    message: string;
    walletAddr: string;
    traderAddr: string;
    signature: string;
    timestamp: bigint;
    selected: boolean;
  }
) {
  try {
    const { message, walletAddr, traderAddr, signature, timestamp, selected } = args;

    await database.selectTraders({
      followerAddr: walletAddr,
      traderAddresses: [traderAddr],
      signature: signature,
      message: message,
      timestamp: timestamp,
      selected: selected,
    });

    // FIXME: This updates the entire open positions table (Just update the positions associated with the selected traders)
    await scheduler.updateOpenPositions();

    return c.json(
      {
        success: true,
        follower_address: walletAddr,
        selected_trader: traderAddr,
      },
      200
    );
  } catch (error) {
    console.error("Error selecting traders:", error);
    return c.json({ error: "Failed to select traders" }, 500);
  }
}

const traders = {
  init,
};

export default traders;
