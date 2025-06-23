import { serve } from "@hono/node-server";
import fs from "fs/promises";
import { Hono } from "hono";
import path from "path";
import dexmtAPI from "./api/dexmt-api";
import database from "./database";
import { renderLeaderboard } from "./frontend/leaderboard";
import { renderTraderProfile } from "./frontend/profile";
import { renderWatchlist } from "./frontend/watchlist";
import scheduler from "./scheduler";

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

app.get("/api/html/traderprofile", async (c) => {
  try {
    const address = c.req.query("address");
    const userAddress = c.req.query("userAddress") || c.req.header("x-wallet-address");

    if (!address) {
      return c.html('<div class="error-message">Trader address is required</div>', 400);
    }
    const traderProfileHTML = await renderTraderProfile(address, userAddress);
    return c.html(traderProfileHTML);
  } catch (error) {
    console.error("Error rendering trader profile:", error);
    return c.html('<div class="error-message">Error loading trader profile</div>', 500);
  }
});

app.get("/api/html/toptraders", async (c) => {
  try {
    const leaderboardHTML = await renderLeaderboard();
    return c.html(leaderboardHTML);
  } catch (error) {
    console.error("Error rendering leaderboard:", error);
    return c.html('<div class="error-message">Error loading top traders</div>', 500);
  }
});

app.get("/api/html/mywatchlist", async (c) => {
  try {
    const userAddress = c.req.query("address") || c.req.header("x-wallet-address");
    const watchlistHTML = await renderWatchlist(userAddress);
    return c.html(watchlistHTML);
  } catch (error) {
    console.error("Error rendering watchlist:", error);
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

// Modify the startup function to notify on restart
async function startup() {
  await database.initializeDatabase();
  await dexmtAPI.init(app);
  scheduler.init();

  serve({
    fetch: app.fetch,
    port,
  });

  console.log(`Server is running on port ${port}`);
}

startup().catch(console.error);
