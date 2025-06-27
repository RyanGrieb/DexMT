import { zValidator } from "@hono/zod-validator";
import { ethers } from "ethers";
import { Hono } from "hono";
import database from "../database";
import scheduler from "../scheduler";
import schemas from "../schemas";
import utils from "../utils";
import wallet from "./wallet";

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

  app.post(
    "/api/traders/:address/favorite_trader",
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

  app.post("/api/traders/:address/select_traders", async (c) => {
    return handleTraderSelection(c, true);
  });

  app.post("/api/traders/:address/unselect_traders", async (c) => {
    return handleTraderSelection(c, false);
  });

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

  app.post("/api/traders/:address/auto_copy", async (c) => {
    try {
      const { address } = c.req.param();
      const { message, signature, timestamp, enable } = await c.req.json();

      // Validate required fields
      if (!address || !message || !signature || !timestamp || enable === undefined) {
        return c.json({ error: "Missing required fields" }, 400);
      }

      // Ensure walletAddr has the proper uppercase format
      const walletAddr = ethers.getAddress(address);

      console.log(`Received request to '${enable ? "enable" : "disable"}' auto-copying trades:`);

      const tsValidation = utils.validateTimestamp(timestamp);

      if (!tsValidation.isValid) {
        return c.json({ error: tsValidation.error }, 400);
      }

      //TODO: Validate wallet message

      // Verify the signature
      if (!wallet.verifySignature(message, signature, walletAddr)) {
        return c.json({ error: "Invalid wallet signature" }, 401);
      }

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
  });
}

async function handleTraderSelection(c: any, selected: boolean) {
  try {
    let { walletAddr } = c.req.param();
    const { traderAddresses, signature, message, timestamp } = await c.req.json();

    // Validate required parameters
    if (!walletAddr || !traderAddresses || !signature || !message || !timestamp) {
      return c.json(
        {
          error: "Missing required parameters: walletAddr, traderAddresses, signature, message, timestamp",
        },
        400
      );
    }

    // Ensure walletAddr has the proper uppercase format
    walletAddr = ethers.getAddress(walletAddr);

    // Validate traderAddresses is an array
    if (!Array.isArray(traderAddresses) || traderAddresses.length === 0) {
      return c.json(
        {
          error: "traderAddresses must be a non-empty array",
        },
        400
      );
    }

    // Validate timestamp (should be within last 5 minutes to prevent replay attacks)
    const tsValidation = utils.validateTimestamp(timestamp);
    const timestampMs = tsValidation.timestamp;

    if (!tsValidation.isValid) {
      return c.json({ error: tsValidation.error }, 400);
    }

    // Verify the message contains the expected content
    const expectedMessage = selected
      ? `Select traders ${traderAddresses.join(",")} for ${walletAddr} at ${timestampMs}`
      : `Unselect traders ${traderAddresses.join(",")} for ${walletAddr} at ${timestampMs}`;
    if (message !== expectedMessage) {
      return c.json({ error: "Invalid message format" }, 400);
    }

    // Verify signature
    if (!wallet.verifySignature(message, signature, walletAddr)) {
      return c.json({ error: "Invalid wallet signature" }, 401);
    }

    await database.selectTraders({
      followerAddr: walletAddr,
      traderAddresses: traderAddresses,
      signature: signature,
      message: message,
      timestamp: timestampMs,
      selected: selected,
    });

    // FIXME: This updates the entire open positions table (Just update the positions associated with the selected traders)
    await scheduler.updateOpenPositions();

    return c.json(
      {
        success: true,
        follower_address: walletAddr,
        selected_traders: traderAddresses,
        count: traderAddresses.length,
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
