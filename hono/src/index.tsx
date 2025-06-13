import { serve } from "@hono/node-server";
import { ethers } from "ethers";
import fs from "fs/promises";
import { Hono } from "hono";
import { Kysely, PostgresDialect, sql } from "kysely";
import path from "path";
import { Pool } from "pg";
import { Database } from "./dbtypes";
import gmxSdk from "./gmxsdk";
import scraper from "./scraper";

const UPDATE_USERS_ON_START = false;

const app = new Hono();

// Store server start time for live reload
const startTime = Date.now();

// PostgreSQL connection
const dialect = new PostgresDialect({
  pool: new Pool({
    database: "dexmt",
    host: process.env.DATABASE_URL?.includes("postgres")
      ? "postgres"
      : "localhost",
    user: "postgres",
    password: "password",
    port: 5432,
    max: 10,
  }),
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<Database>({
  dialect,
});

interface ConnectedWallet {
  address: string;
  chainId: string;
  timestamp: number;
}

// Store connected wallets (in production, use a database)
let connectedWallets: ConnectedWallet[] = [];

// Initialize database
async function initializeDatabase() {
  try {
    console.log("Initializing database...");

    // Create copy_trading table
    await db.schema
      .createTable("copy_trading")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("copier_address", "varchar(42)", (col) => col.notNull())
      .addColumn("trader_address", "varchar(42)", (col) => col.notNull())
      .addColumn("signature", "text", (col) => col.notNull())
      .addColumn("message", "text", (col) => col.notNull())
      .addColumn("timestamp", "bigint", (col) => col.notNull())
      .addColumn("is_active", "boolean", (col) => col.defaultTo(true))
      .addColumn("created_at", "timestamp", (col) =>
        col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
      )
      .addColumn("updated_at", "timestamp", (col) =>
        col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
      )
      .execute();
    console.log("Copy trading table created/verified");

    // Create users table with all User interface fields
    await db.schema
      .createTable("users")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("address", "varchar(42)", (col) => col.unique().notNull())
      .addColumn("balance", "varchar(50)", (col) => col.defaultTo("0"))
      .addColumn("chain_id", "varchar(10)", (col) => col.defaultTo("0xa4b1"))
      .addColumn("dexmt_user", "boolean", (col) => col.defaultTo(false))
      .addColumn("dex_platform", "varchar(20)", (col) => col.defaultTo(null))
      .addColumn("platform_ranking", "integer", (col) => col.defaultTo(null))
      // Add new columns for scraped trading data
      .addColumn("pnl", "numeric", (col) => col.defaultTo(null))
      .addColumn("pnl_percentage", "numeric", (col) => col.defaultTo(null))
      .addColumn("avg_size", "numeric", (col) => col.defaultTo(null))
      .addColumn("avg_leverage", "numeric", (col) => col.defaultTo(null))
      .addColumn("win_ratio", "numeric", (col) => col.defaultTo(null))
      .addColumn("created_at", "timestamp", (col) =>
        col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
      )
      .addColumn("updated_at", "timestamp", (col) =>
        col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
      )
      .execute();

    console.log("Users table created/verified");

    // Create trades table (unchanged)
    await db.schema
      .createTable("trades")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("user_address", "varchar(42)", (col) => col.notNull())
      .addColumn("token_in", "varchar(42)", (col) => col.notNull())
      .addColumn("token_out", "varchar(42)", (col) => col.notNull())
      .addColumn("amount_in", "varchar(50)", (col) => col.notNull())
      .addColumn("amount_out", "varchar(50)", (col) => col.notNull())
      .addColumn("price", "varchar(50)", (col) => col.notNull())
      .addColumn("transaction_hash", "varchar(66)", (col) =>
        col.unique().notNull()
      )
      .addColumn("block_number", "bigint", (col) => col.notNull())
      .addColumn("chain_id", "varchar(10)", (col) => col.notNull())
      .addColumn("status", "varchar(20)", (col) => col.defaultTo("pending"))
      .addColumn("created_at", "timestamp", (col) =>
        col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
      )
      .addColumn("updated_at", "timestamp", (col) =>
        col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
      )
      .execute();
    console.log("Trades table created/verified");

    // Create positions table (unchanged)
    await db.schema
      .createTable("positions")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("user_address", "varchar(42)", (col) => col.notNull())
      .addColumn("token", "varchar(42)", (col) => col.notNull())
      .addColumn("collateral", "numeric", (col) => col.notNull())
      .addColumn("leverage", "numeric", (col) => col.notNull())
      .addColumn("size", "numeric", (col) => col.notNull())
      .addColumn("entry_price", "numeric", (col) => col.notNull())
      .addColumn("created_at", "timestamp", (col) =>
        col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
      )
      .addColumn("updated_at", "timestamp", (col) =>
        col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
      )
      .execute();

    console.log("Positions table created/verified");

    // Add foreign key constraints if they don't exist (unchanged)
    try {
      await db.schema
        .alterTable("trades")
        .addForeignKeyConstraint(
          "trades_user_address_fkey",
          ["user_address"],
          "users",
          ["address"]
        )
        .execute();
    } catch (error) {
      console.log(
        "Foreign key constraint for trades table already exists or failed to create"
      );
    }

    try {
      await db.schema
        .alterTable("positions")
        .addForeignKeyConstraint(
          "positions_user_address_fkey",
          ["user_address"],
          "users",
          ["address"]
        )
        .execute();
    } catch (error) {
      console.log(
        "Foreign key constraint for positions table already exists or failed to create"
      );
    }

    // Add indexes for better performance
    try {
      await db.schema
        .createIndex("idx_trades_user_address")
        .ifNotExists()
        .on("trades")
        .column("user_address")
        .execute();

      await db.schema
        .createIndex("idx_trades_transaction_hash")
        .ifNotExists()
        .on("trades")
        .column("transaction_hash")
        .execute();

      await db.schema
        .createIndex("idx_positions_user_address")
        .ifNotExists()
        .on("positions")
        .column("user_address")
        .execute();

      // Add indexes for new columns
      await db.schema
        .createIndex("idx_users_platform_ranking")
        .ifNotExists()
        .on("users")
        .column("platform_ranking")
        .execute();

      await db.schema
        .createIndex("idx_users_dex_platform")
        .ifNotExists()
        .on("users")
        .column("dex_platform")
        .execute();

      console.log("Database indexes created/verified");
    } catch (error) {
      console.log("Some indexes might already exist:", error);
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// Add this helper function near the top of the file, after the imports
async function getEthBalance(address: string, rpcUrl: string): Promise<string> {
  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`RPC Error: ${data.error.message}`);
    }

    // Convert from hex wei to decimal
    const balanceWei = BigInt(data.result);

    // Convert wei to ETH (divide by 10^18)
    const balanceEth = Number(balanceWei) / Math.pow(10, 18);

    return balanceEth.toFixed(6); // Return with 6 decimal places
  } catch (error) {
    console.error(`Error fetching balance for ${address}:`, error);
    return "0"; // Return 0 on error
  }
}

async function updateUserData() {
  try {
    console.log("Started user and trade update task (every 5 minutes)");

    const users = await scraper.getTopUsers({ platform: "gmx", limit: 100 });
    console.log(`Fetched ${users.length} top users from GMX`);

    if (users.length === 0) {
      console.log("No users fetched, skipping balance updates");
      return;
    }

    for (const [index, user] of users.entries()) {
      try {
        const balance = await getEthBalance(
          user.address,
          "https://arb1.arbitrum.io/rpc"
        );

        // Insert/update user with all scraped data
        await db
          .insertInto("users")
          .values({
            address: user.address,
            balance: balance,
            chain_id: "0xa4b1",
            dexmt_user: false,
            platform_ranking: user.rank,
            dex_platform: "gmx",
            // Add all the scraped trading data
            pnl: user.pnl,
            pnl_percentage: user.pnlPercentage,
            avg_size: user.avgSize,
            avg_leverage: user.avgLeverage,
            win_ratio: user.winRatio,
          })
          .onConflict((oc) =>
            oc.column("address").doUpdateSet({
              balance: balance,
              chain_id: "0xa4b1",
              platform_ranking: user.rank,
              dex_platform: "gmx",
              // Update all trading data
              pnl: user.pnl,
              pnl_percentage: user.pnlPercentage,
              avg_size: user.avgSize,
              avg_leverage: user.avgLeverage,
              win_ratio: user.winRatio,
              updated_at: new Date().toISOString(),
            })
          )
          .execute();

        console.log(
          `Processed user ${index + 1}/${users.length}: ${JSON.stringify(user)}`
        );

        if (index < users.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error processing user ${user.address}:`, error);
      }
    }

    console.log("Finished updating users from GMX leaderboard");
  } catch (error) {
    console.error("Error in updateUsersAndTrades:", error);
  }
}

// Separate function to start the interval
function startUpdateUserDataTask() {
  setInterval(updateUserData, 300000); // 5 minutes

  if (UPDATE_USERS_ON_START) {
    updateUserData().catch(console.error); // Initial call
  }
}

app.get("/", async (c) => {
  const htmlResponse = await app.request("/html/index.html");
  let html = await htmlResponse.text();

  const liveReloadScript = `
        <script>
            let lastCheck = ${startTime};
            let retryCount = 0;
            const maxRetries = 10;
            
            async function checkForReload() {
                try {
                    const response = await fetch('/health');
                    const data = await response.json();
                    
                    if (data.startTime !== lastCheck) {
                        console.log('Server restarted, attempting reload...');
                        await waitForServerReady();
                    }
                    
                    // Reset retry count on successful check
                    retryCount = 0;
                } catch (e) {
                    console.log('Health check failed:', e.message);
                    retryCount++;
                    
                    if (retryCount >= maxRetries) {
                        console.log('Max retries reached, reloading anyway...');
                        window.location.reload();
                    }
                }
            }
            
            async function waitForServerReady() {
                const maxWaitTime = 2000; // 2 second max wait
                const startWait = Date.now();
                
                while (Date.now() - startWait < maxWaitTime) {
                    try {
                        const response = await fetch('/health');
                        if (response.ok) {
                            console.log('Server is ready, reloading page...');
                            window.location.reload();
                            return;
                        }
                    } catch (e) {
                        // Server not ready yet, wait a bit
                    }
                    
                    // Wait with exponential backoff
                    await new Promise(resolve => setTimeout(resolve, Math.min(100 * Math.pow(2, retryCount), 1000)));
                    retryCount++;
                }
                
                // If we get here, just reload anyway
                console.log('Timeout waiting for server, reloading anyway...');
                window.location.reload();
            }
            
            // Check every 1000ms
            setInterval(checkForReload, 1000);
        </script>
    `;
  html = html.replace("</body>", `${liveReloadScript}</body>`);

  return c.html(html);
});

// API endpoint to register wallet connection using Kysely
app.post("/api/wallet/connect", async (c) => {
  const { address, chainId } = await c.req.json();

  if (!address || !chainId) {
    return c.json({ error: "Missing address or chainId" }, 400);
  }

  // Store wallet connection
  const existingIndex = connectedWallets.findIndex(
    (w) => w.address === address
  );
  if (existingIndex >= 0) {
    connectedWallets[existingIndex] = {
      address,
      chainId,
      timestamp: Date.now(),
    };
  } else {
    connectedWallets.push({ address, chainId, timestamp: Date.now() });
  }

  // Add user to database using Kysely
  try {
    await db
      .insertInto("users")
      .values({
        address: address,
        chain_id: chainId,
        dexmt_user: true,
        balance: await getEthBalance(address, "https://arb1.arbitrum.io/rpc"),
      })
      .onConflict((oc) =>
        oc.column("address").doUpdateSet({
          chain_id: chainId,
          updated_at: new Date().toISOString(),
        })
      )
      .execute();

    console.log(`User added/updated in database: ${address}`);
  } catch (error) {
    console.error("Error adding user to database:", error);
  }

  console.log(`Wallet connected: ${address} on chain ${chainId}`);
  return c.json({ success: true, message: "Wallet registered" });
});

// API endpoint to disconnect wallet
app.post("/api/wallet/disconnect", async (c) => {
  const { address } = await c.req.json();

  connectedWallets = connectedWallets.filter((w) => w.address !== address);

  console.log(`Wallet disconnected: ${address}`);
  return c.json({ success: true, message: "Wallet disconnected" });
});

// Utility function to verify signature
function verifySignature(
  message: string,
  signature: string,
  expectedAddress: string
): boolean {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

// API endpoint to start copy trading
app.post("/api/copy-trading/start", async (c) => {
  try {
    const { traderAddress, copierAddress, message, signature, timestamp } =
      await c.req.json();

    // Validate required fields
    if (
      !traderAddress ||
      !copierAddress ||
      !message ||
      !signature ||
      !timestamp
    ) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Verify the signature
    if (!verifySignature(message, signature, copierAddress)) {
      return c.json({ error: "Invalid signature" }, 401);
    }

    // Check timestamp (should be within last 5 minutes)
    const now = Date.now();
    if (Math.abs(now - timestamp) > 5 * 60 * 1000) {
      return c.json({ error: "Request timestamp too old" }, 400);
    }

    // Verify the message contains the correct action and trader address
    if (
      !message.includes("START_COPY_TRADING") ||
      !message.includes(traderAddress)
    ) {
      return c.json({ error: "Invalid message content" }, 400);
    }

    // Check if already copying this trader
    const existingCopy = await db
      .selectFrom("copy_trading")
      .select(["id"])
      .where("copier_address", "=", copierAddress)
      .where("trader_address", "=", traderAddress)
      .where("is_active", "=", true)
      .executeTakeFirst();

    if (existingCopy) {
      return c.json({ error: "Already copying trades from this trader" }, 409);
    }

    // Create copy trading record
    await db
      .insertInto("copy_trading")
      .values({
        copier_address: copierAddress,
        trader_address: traderAddress,
        signature: signature,
        message: message,
        timestamp: timestamp,
        is_active: true,
      })
      .execute();

    console.log(
      `Copy trading started: ${copierAddress} copying ${traderAddress}`
    );
    return c.json({
      success: true,
      message: "Copy trading started successfully",
    });
  } catch (error) {
    console.error("Error starting copy trading:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// API endpoint to stop copy trading
app.post("/api/copy-trading/stop", async (c) => {
  try {
    const { traderAddress, copierAddress, message, signature, timestamp } =
      await c.req.json();

    // Validate required fields
    if (
      !traderAddress ||
      !copierAddress ||
      !message ||
      !signature ||
      !timestamp
    ) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Verify the signature
    if (!verifySignature(message, signature, copierAddress)) {
      return c.json({ error: "Invalid signature" }, 401);
    }

    // Check timestamp (should be within last 5 minutes)
    const now = Date.now();
    if (Math.abs(now - timestamp) > 5 * 60 * 1000) {
      return c.json({ error: "Request timestamp too old" }, 400);
    }

    // Verify the message contains the correct action and trader address
    if (
      !message.includes("STOP_COPY_TRADING") ||
      !message.includes(traderAddress)
    ) {
      return c.json({ error: "Invalid message content" }, 400);
    }

    // Find and deactivate copy trading record
    const result = await db
      .updateTable("copy_trading")
      .set({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .where("copier_address", "=", copierAddress)
      .where("trader_address", "=", traderAddress)
      .where("is_active", "=", true)
      .execute();

    if (result.length === 0) {
      return c.json(
        { error: "No active copy trading relationship found" },
        404
      );
    }

    console.log(
      `Copy trading stopped: ${copierAddress} stopped copying ${traderAddress}`
    );
    return c.json({
      success: true,
      message: "Copy trading stopped successfully",
    });
  } catch (error) {
    console.error("Error stopping copy trading:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// API endpoint to check copy trading status
app.get("/api/copy-trading/status", async (c) => {
  try {
    const traderAddress = c.req.query("traderAddress");
    const copierAddress = c.req.query("copierAddress");

    if (!traderAddress || !copierAddress) {
      return c.json({ error: "Missing required parameters" }, 400);
    }

    const copyRecord = await db
      .selectFrom("copy_trading")
      .select(["is_active", "created_at"])
      .where("copier_address", "=", copierAddress as string)
      .where("trader_address", "=", traderAddress as string)
      .where("is_active", "=", true)
      .executeTakeFirst();

    return c.json({
      isActive: !!copyRecord,
      startedAt: copyRecord?.created_at || null,
    });
  } catch (error) {
    console.error("Error checking copy trading status:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.get("/users/:address/positions", async (c) => {
  const { address } = c.req.param();

  // FIXME: Ensure this is a valid address
  const validAddress: `0x${string}` = address as `0x${string}`;

  if (!address) {
    return c.json({ error: "Missing address parameter" }, 400);
  }

  try {
    const positionsResponse = await gmxSdk.getUserPositions(validAddress);

    if (!positionsResponse) {
      return c.json({ error: "Failed to fetch user positions" }, 500);
    }
    const { serializedPositionsData } = positionsResponse;

    return c.json({ positions: serializedPositionsData });
  } catch (error) {
    console.error("Error fetching user positions:", error);
    return c.json({ error: "Failed to fetch user positions" }, 500);
  }
});

// API endpoint to get connected wallets
app.get("/api/wallets", (c) => {
  return c.json({ wallets: connectedWallets });
});

// API endpoint to get users from database with all trading data
app.get("/api/users", async (c) => {
  try {
    const users = await db
      .selectFrom("users")
      .select([
        "address",
        "balance",
        "chain_id",
        "platform_ranking",
        "dex_platform",
        "pnl",
        "pnl_percentage",
        "avg_size",
        "avg_leverage",
        "win_ratio",
        "updated_at",
      ])
      .where("dexmt_user", "=", false)
      .orderBy("platform_ranking", "asc")
      .execute();

    const formattedUsers = users.map((user) => ({
      address: user.address,
      balance: user.balance,
      chainId: user.chain_id,
      platform_ranking: user.platform_ranking,
      dex_platform: user.dex_platform,
      pnl: user.pnl,
      pnlPercentage: user.pnl_percentage,
      avgSize: user.avg_size,
      avgLeverage: user.avg_leverage,
      winRatio: user.win_ratio,
      updatedAt: user.updated_at,
    }));

    return c.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ error: "Failed to fetch users" }, 500);
  }
});

// Serve static files
app.get("/html/*", async (c) => {
  const filePath = path.join(__dirname, "../static", c.req.path);
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return c.html(content);
  } catch (error) {
    return c.text("Not Found", 404);
  }
});

app.get("/css/*", async (c) => {
  const filePath = path.join(__dirname, "../static", c.req.path);
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return c.text(content, 200, { "Content-Type": "text/css" });
  } catch (error) {
    return c.text("Not Found", 404);
  }
});

app.get("/js/*", async (c) => {
  // strip “/js/” prefix
  let rel = c.req.path.replace(/^\/js\//, "");
  // if no extension, assume .js
  if (!path.extname(rel)) {
    rel += ".js";
  }
  const filePath = path.join(__dirname, "../static/js-compiled", rel);

  //List all files in the js-compiled directory
  const files = await fs.readdir(path.join(__dirname, "../static/js-compiled"));
  console.log("Compiled JS files:", files);

  try {
    const content = await fs.readFile(filePath, "utf-8");
    return c.text(content, 200, {
      "Content-Type": "application/javascript; charset=utf-8",
    });
  } catch {
    return c.text("Not Found", 404);
  }
});

app.get("/img/*", async (c) => {
  const filePath = path.join(__dirname, "../static", c.req.path);
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeType =
      ext === ".png"
        ? "image/png"
        : ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : ext === ".gif"
            ? "image/gif"
            : ext === ".svg"
              ? "image/svg+xml"
              : ext === ".ico"
                ? "image/x-icon"
                : "application/octet-stream";

    return c.body(data, 200, {
      "Content-Type": mimeType,
    });
  } catch (err) {
    return c.text("Not Found", 404);
  }
});

app.get("/health", (c) => {
  return c.json({ startTime });
});

const port = Number(process.env.PORT);
console.log(`Server is running on port ${port}`);

// Initialize everything
async function startup() {
  await initializeDatabase();
  startUpdateUserDataTask();

  serve({
    fetch: app.fetch,
    port,
  });
}

startup().catch(console.error);
