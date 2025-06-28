import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import database from "../database";
import scheduler from "../scheduler";
import schemas from "../schemas";
import utils from "../utils";

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

      utils.logOutput(`Fetching favorite traders for wallet: ${walletAddr}`);
      try {
        const favorites = await database.getTraders({ favoriteOfAddress: walletAddr });
        return c.json({ success: true, favorites }, 200);
      } catch (error) {
        console.error("Error fetching favorite traders:", error);
        return c.json({ error: "Failed to fetch favorite traders" }, 500);
      }
    }
  );

  // FIXME: Check for the testing environment variable, this is only for testing purposes
  app.post("/api/traders/reset", async (c) => {
    try {
      await database.resetTraders();
      utils.logOutput("Traders reset successfully");
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
    await database.mirrorTrades({ address: walletAddr, enable: enable });

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
