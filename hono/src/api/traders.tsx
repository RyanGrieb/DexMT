import { Hono } from "hono";
import database from "../database";
import scheduler from "../scheduler";
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

  app.post("/api/traders/:address/select_traders", async (c) => {
    return handleTraderSelection(c, true);
  });

  app.post("/api/traders/:address/unselect_traders", async (c) => {
    return handleTraderSelection(c, false);
  });

  // Generic handler for favorite/unfavorite
  async function handleFavoriteTrader(c: any, favorite: boolean) {
    try {
      const { address } = c.req.param();
      const { favoriteAddr, signature, message, timestamp } = await c.req.json();

      // Validate required parameters
      if (!address || !favoriteAddr || !signature || !message || !timestamp) {
        return c.json(
          { error: "Missing required parameters: address, favoriteAddr, signature, message, timestamp" },
          400
        );
      }

      // Validate timestamp
      const tsValidation = validateTimestamp(timestamp);
      const timestampMs = tsValidation.timestamp;
      if (!tsValidation.isValid) {
        return c.json({ error: tsValidation.error }, 400);
      }

      // Build and verify expected message
      const action = favorite ? "Favorite" : "Unfavorite";
      const expectedMessage = `${action} trader ${favoriteAddr} for ${address} at ${timestampMs}`;
      if (message !== expectedMessage) {
        return c.json({ error: "Invalid message format" }, 400);
      }
      if (!wallet.verifySignature(message, signature, address)) {
        return c.json({ error: "Invalid wallet signature" }, 401);
      }

      // Perform DB action
      const dbMethod = favorite ? database.favoriteTrader : database.unfavoriteTrader;
      await dbMethod({
        followerAddr: address,
        favoriteAddr,
        signature,
        message,
        timestamp: timestampMs,
      });

      // Build response
      const respKey = favorite ? "favorite_trader" : "unfavorited_trader";
      return c.json(
        {
          success: true,
          follower_address: address,
          [respKey]: favoriteAddr,
        },
        200
      );
    } catch (error) {
      console.error(`Error ${favorite ? "favoriting" : "unfavoriting"} trader:`, error);
      return c.json({ error: `Failed to ${favorite ? "favorite" : "unfavorite"} trader` }, 500);
    }
  }

  // Route registrations
  app.post("/api/traders/:address/favorite_trader", async (c) => await handleFavoriteTrader(c, true));
  app.post("/api/traders/:address/unfavorite_trader", async (c) => await handleFavoriteTrader(c, false));

  app.post("/api/traders/:address/auto_copy", async (c) => {
    try {
      const { address } = c.req.param();
      const { message, signature, timestamp, enable } = await c.req.json();

      // Validate required fields
      if (!address || !message || !signature || !timestamp || enable === undefined) {
        return c.json({ error: "Missing required fields" }, 400);
      }

      console.log(`Received request to '${enable ? "enable" : "disable"}' auto-copying trades:`);

      const tsValidation = validateTimestamp(timestamp);

      if (!tsValidation.isValid) {
        return c.json({ error: tsValidation.error }, 400);
      }

      //TODO: Validate wallet message

      // Verify the signature
      if (!wallet.verifySignature(message, signature, address)) {
        return c.json({ error: "Invalid wallet signature" }, 401);
      }

      await database.mirrorTrades({ address: address, enable: enable });

      console.log(`Copy trading ${enable ? "enabled" : "disabled"} for: ${address}`);

      return c.json({
        success: true,
        message: `Auto-copy trading ${enable ? "enabled" : "disabled"} successfully`,
        address,
      });
    } catch (error) {
      console.error("Error starting auto-copy trading:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  });
}

async function handleTraderSelection(c: any, selected: boolean) {
  try {
    const { address } = c.req.param();
    const { traderAddresses, signature, message, timestamp } = await c.req.json();

    // Validate required parameters
    if (!address || !traderAddresses || !signature || !message || !timestamp) {
      return c.json(
        {
          error: "Missing required parameters: address, traderAddresses, signature, message, timestamp",
        },
        400
      );
    }

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
    const tsValidation = validateTimestamp(timestamp);
    const timestampMs = tsValidation.timestamp;

    if (!tsValidation.isValid) {
      return c.json({ error: tsValidation.error }, 400);
    }

    // Verify the message contains the expected content
    const expectedMessage = selected
      ? `Select traders ${traderAddresses.join(",")} for ${address} at ${timestampMs}`
      : `Unselect traders ${traderAddresses.join(",")} for ${address} at ${timestampMs}`;
    if (message !== expectedMessage) {
      return c.json({ error: "Invalid message format" }, 400);
    }

    // Verify signature
    if (!wallet.verifySignature(message, signature, address)) {
      return c.json({ error: "Invalid wallet signature" }, 401);
    }

    await database.selectTraders({
      followerAddr: address,
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
        follower_address: address,
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

// Helper function to validate timestamp
function validateTimestamp(timestamp: string | number): {
  isValid: boolean;
  timestamp: bigint;
  error?: string;
} {
  const now = Date.now();
  const timestampMs = typeof timestamp === "string" ? parseInt(timestamp) : timestamp;

  if (isNaN(timestampMs)) {
    return {
      isValid: false,
      timestamp: BigInt(0),
      error: "Invalid timestamp format",
    };
  }

  // Check if timestamp is within last 5 minutes to prevent replay attacks
  if (Math.abs(now - timestampMs) > 5 * 60 * 1000) {
    return {
      isValid: false,
      timestamp: BigInt(timestampMs),
      error: "Request timestamp too old",
    };
  }

  return { isValid: true, timestamp: BigInt(timestampMs) };
}

const traders = {
  init,
};

export default traders;
