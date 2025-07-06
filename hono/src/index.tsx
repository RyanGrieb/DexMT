import { serve } from "@hono/node-server";
import { ethers } from "ethers";
import fs from "fs/promises";
import { Hono } from "hono";
import path from "path";
import dexmtAPI from "./api/dexmt-api";
import database from "./database/database";
import { renderLeaderboard } from "./frontend/leaderboard";
import { renderTraderProfile } from "./frontend/profile";
import { renderWatchlist } from "./frontend/watchlist/watchlist";
import log from "./utils/logs";

const app = new Hono();
const startTime = Date.now();
const port = Number(process.env.PORT);

async function renderIndexPage() {
  const htmlResponse = await app.request("/html/index.html");
  return htmlResponse.text();
}

app.get("/", (c) => {
  return c.redirect("/toptraders");
});

// Health check endpoint for tests
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    uptime: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/html/traderprofile", async (c) => {
  try {
    const traderAddress = c.req.query("address");
    const userAddress = c.req.query("userAddress") || c.req.header("x-wallet-address");
    const timeZone = c.req.header("x-timezone");

    if (!traderAddress) {
      return c.html('<div class="error-message">Trader address is required</div>', 400);
    }
    const traderProfileHTML = await renderTraderProfile({ traderAddress, timeZone, userAddress });
    return c.html(traderProfileHTML);
  } catch (error) {
    log.error(error);
    return c.html('<div class="error-message">Error loading trader profile</div>', 500);
  }
});

app.get("/api/html/toptraders", async (c) => {
  try {
    const props = {
      name: "World",
      siteData: {
        title: "Hello <> World",
        description: "This is a description",
        image: "https://example.com/image.png",
      },
    };

    const leaderboardHTML = await renderLeaderboard();
    return c.html(leaderboardHTML);
  } catch (error) {
    log.error(error);
    return c.html('<div class="error-message">Error loading top traders</div>', 500);
  }
});

app.get("/api/html/mywatchlist", async (c) => {
  try {
    let userAddr = c.req.query("address") || c.req.header("x-wallet-address");

    if (!userAddr) {
      return c.html('<div class="error-message">User address is required</div>', 400);
    }

    userAddr = ethers.getAddress(userAddr);

    const watchlistHTML = await renderWatchlist(userAddr);
    return c.html(watchlistHTML);
  } catch (error) {
    log.error(error);
    return c.html('<div class="error-message">Error loading watchlist</div>', 500);
  }
});

app.get("/toptraders", async (c) => {
  return c.html(await renderIndexPage());
});

app.get("/mywatchlist", async (c) => {
  return c.html(await renderIndexPage());
});

app.get("/traderprofile", async (c) => {
  return c.html(await renderIndexPage());
});

// Serve static files
app.get("/html/*", async (c) => {
  const filePath = path.join(__dirname, "../static", c.req.path);
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return c.html(content);
  } catch (error) {
    log.error(error);
    return c.text("Not Found", 404);
  }
});

app.get("/css/*", async (c) => {
  const filePath = path.join(__dirname, "../static", c.req.path);
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return c.text(content, 200, { "Content-Type": "text/css" });
  } catch (error) {
    log.error(error);
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

  try {
    const content = await fs.readFile(filePath, "utf-8");
    return c.text(content, 200, {
      "Content-Type": "application/javascript; charset=utf-8",
    });
  } catch (error) {
    log.error(error);
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
  } catch (error) {
    log.error(error);
    return c.text("Not Found", 404);
  }
});

// Modify the startup function to notify on restart
async function startup() {
  await database.initializeDatabase();
  await dexmtAPI.init(app);
  //scheduler.init();
  //await websockets.init();

  serve({
    fetch: app.fetch,
    port,
  });

  log.output(`Server started on port ${port}`);
  log.clearOldLogs(5);
}

startup().catch(console.error);
