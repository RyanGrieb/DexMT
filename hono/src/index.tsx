import { serve } from "@hono/node-server";
import fs from "fs/promises";
import { Hono } from "hono";
import path from "path";
import dexmtAPI from "./api/dexmt-api";
import database from "./database";
import { renderLeaderboard } from "./frontend/leaderboard";
import { renderTraderProfile } from "./frontend/profile";
import { renderWatchlist } from "./frontend/watchlist";
import gmxSdk from "./gmxsdk";
import scraper from "./scraper";

const UPDATE_USERS_ON_START = false;

const app = new Hono();
const startTime = Date.now();
const port = Number(process.env.PORT);

let sseClients: Array<{
  id: string;
  controller: ReadableStreamDefaultController;
}> = [];

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
      // Determine the differences in user positions
      const positions = await gmxSdk.getUserPositions(selectedTrader.address);
      //const trades = await gmxSdk.getTradeHistory(selectedTrader.address);
      const dbPositions = await database.getPositions(selectedTrader.address);
    }
  }
}

// Separate function to start the interval
function startUpdateUserDataTask() {
  setInterval(updateTraderLeaderboard, 300000); // 5 minutes

  if (UPDATE_USERS_ON_START) {
    updateTraderLeaderboard().catch(console.error);
  }
}

function startMirrorTradesTask() {
  setInterval(mirrorTrades, 300000); // 5 minutes
}

async function renderPageWithContent(contentRenderer: () => Promise<string>) {
  const htmlResponse = await app.request("/html/index.html");
  let html = await htmlResponse.text();
  const content = await contentRenderer();

  return html.replace(
    '<div class="index-content">\n        <!-- Content will be loaded by router -->\n      </div>',
    `<div class="index-content">\n        ${content}\n      </div>`
  );
}

app.get("/", (c) => {
  return c.redirect("/toptraders");
});

app.get("/api/html/traderprofile", async (c) => {
  try {
    const address = c.req.query("address");
    if (!address) {
      return c.html(
        '<div class="error-message">Trader address is required</div>',
        400
      );
    }
    const traderProfileHTML = await renderTraderProfile(address);
    return c.html(traderProfileHTML);
  } catch (error) {
    console.error("Error rendering trader profile:", error);
    return c.html(
      '<div class="error-message">Error loading trader profile</div>',
      500
    );
  }
});

app.get("/api/html/toptraders", async (c) => {
  try {
    const leaderboardHTML = await renderLeaderboard();
    return c.html(leaderboardHTML);
  } catch (error) {
    console.error("Error rendering leaderboard:", error);
    return c.html(
      '<div class="error-message">Error loading top traders</div>',
      500
    );
  }
});

app.get("/api/html/mywatchlist", async (c) => {
  try {
    const userAddress =
      c.req.query("address") || c.req.header("x-wallet-address");
    const watchlistHTML = await renderWatchlist(userAddress);
    return c.html(watchlistHTML);
  } catch (error) {
    console.error("Error rendering watchlist:", error);
    return c.html(
      '<div class="error-message">Error loading watchlist</div>',
      500
    );
  }
});

app.get("/toptraders", async (c) => {
  const html = await renderPageWithContent(() => renderLeaderboard());
  return c.html(html);
});

app.get("/mywatchlist", async (c) => {
  const userAddress = c.req.query("address");
  const html = await renderPageWithContent(() => renderWatchlist(userAddress));
  return c.html(html);
});

app.get("/traderprofile", async (c) => {
  const address = c.req.query("address");
  if (!address) {
    return c.html(
      await renderPageWithContent(() =>
        Promise.resolve(
          '<div class="error-message">Trader address is required</div>'
        )
      )
    );
  }

  const html = await renderPageWithContent(() => renderTraderProfile(address));
  return c.html(html);
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

// Add this endpoint before the existing routes
app.get("/api/live-reload", (c) => {
  let clientController: ReadableStreamDefaultController;
  let clientId: string;
  const stream = new ReadableStream({
    start(controller) {
      clientController = controller;
      clientId = Math.random().toString(36).substr(2, 9);
      sseClients.push({ id: clientId, controller });

      // Send initial connection message
      controller.enqueue(
        `data: {"type":"connected","startTime":${startTime}}\n\n`
      );

      console.log(`SSE client connected: ${clientId}`);
    },
    cancel() {
      // Remove client when connection closes
      const clientIndex = sseClients.findIndex(
        (client) => client.controller === clientController
      );
      if (clientIndex !== -1) {
        console.log(`SSE client disconnected: ${sseClients[clientIndex].id}`);
        sseClients.splice(clientIndex, 1);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
});

// Add function to notify all SSE clients of server restart
function notifySSEClients(message: any) {
  const data = `data: ${JSON.stringify(message)}\n\n`;

  // Create a copy of the array to avoid modification during iteration
  const clientsCopy = [...sseClients];

  clientsCopy.forEach((client, index) => {
    try {
      client.controller.enqueue(data);
    } catch (error) {
      console.log(`Failed to send SSE message to client ${client.id}:`, error);

      // Remove the client from the original array if the controller is closed
      const originalIndex = sseClients.findIndex((c) => c.id === client.id);
      if (originalIndex !== -1) {
        console.log(`Removing closed SSE client: ${client.id}`);
        sseClients.splice(originalIndex, 1);
      }
    }
  });

  console.log(`SSE message sent to ${sseClients.length} active clients`);
}

// Modify the startup function to notify on restart
async function startup() {
  await database.initializeDatabase();
  dexmtAPI.init(app);
  startUpdateUserDataTask();
  startMirrorTradesTask();

  // Notify any existing SSE clients that server restarted
  setTimeout(() => {
    notifySSEClients({ type: "reload", startTime });
  }, 1000);

  serve({
    fetch: app.fetch,
    port,
  });

  console.log(`Server is running on port ${port}`);
}

startup().catch(console.error);
