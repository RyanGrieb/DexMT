import database from "../database";

interface WatchedPosition {
  id: string;
  traderAddress: string;
  traderName: string;
  market: string;
  side: "LONG" | "SHORT";
  size: string;
  pnl: string;
  entryPrice: string;
  currentPrice: string;
  leverage: string;
  timestamp: string;
}

export async function renderWatchlist(userAddress?: string): Promise<string> {
  // If no user address provided, show empty state
  if (!userAddress) {
    return `
      <div class="watchlist-container">
        <div class="watchlist-header">
          <h2>My Watch List</h2>
          <p class="connect-wallet-message">Connect your wallet to view your watch list</p>
        </div>
      </div>
    `;
  }

  try {
    // Get favorited traders for this user
    const favoritedTraders = await database.getTraders({
      favoriteOfAddress: userAddress,
    });

    // Get selected traders (the ones being actively watched/copied)
    const selectedTraders = await database.getTraders({
      favoriteOfAddress: userAddress,
      selected: true,
    });

    // Create a Set of selected trader addresses for quick lookup
    const selectedAddresses = new Set(selectedTraders.map((trader) => trader.address));

    // Check if user has copy trading enabled
    const userTraders = await database.getTraders({ isMirroring: true });
    const isUserMirroring = userTraders.some((trader) => trader.address.toLowerCase() === userAddress.toLowerCase());

    return `
      <div class="watchlist-container">
        <div class="watchlist-header">
          <h2>My Watch List</h2>
          <div class="watchlist-controls">
            <button id="addTraderBtn" class="btn btn-primary">Add Trader</button>
            <button id="copySettingsBtn" class="btn btn-secondary">Copy Settings</button>
            <div class="mirror-toggle">
              <label class="switch">
                <input type="checkbox" id="mirrorToggle" ${isUserMirroring ? "checked" : ""}>
                <span class="slider round"></span>
              </label>
              <span>${isUserMirroring ? "Disable Auto-Copy" : "Enable Auto-Copy"}</span>
            </div>
          </div>
        </div>

        <div class="watchlist-tabs">
          <button class="tab-button active" data-tab="favorited">Favorited Traders (${favoritedTraders.length})</button>
          <button class="tab-button" data-tab="selected">Active Copying (${selectedTraders.length})</button>
          <button class="tab-button" data-tab="positions">Open Positions<br>(Copying: 0 Total: 0)</button>
        </div>

        <div class="tab-content">
          <div id="favorited-tab" class="tab-pane active">
            ${renderFavoritedTraders(favoritedTraders, userAddress, selectedAddresses)}
          </div>
          
          <div id="selected-tab" class="tab-pane">
            ${renderSelectedTraders(selectedTraders)}
          </div>
          
          <div id="positions-tab" class="tab-pane">
            ${renderOpenPositions()}
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error rendering watchlist:", error);
    return `
      <div class="watchlist-container">
        <div class="error-message">
          <h3>Error loading watchlist</h3>
          <p>Please try refreshing the page</p>
        </div>
      </div>
    `;
  }
}

function renderFavoritedTraders(traders: any[], userAddress: string, selectedAddresses: Set<string>): string {
  if (traders.length === 0) {
    return `
      <div class="empty-state">
        <h3>No traders in your watchlist</h3>
        <p>Start by adding some top performers to track their trades</p>
        <button class="btn btn-primary" onclick="window.location.href='/toptraders'">Browse Top Traders</button>
      </div>
    `;
  }

  return `
    <div class="traders-grid">
      ${traders
        .map((trader) => {
          const isSelected = selectedAddresses.has(trader.address);
          // Generate trader icon color and text
          const addressHash = trader.address.slice(2, 4).toUpperCase();
          const iconColor = generateIconColor(trader.address);

          return `
        <div class="trader-card" data-address="${trader.address}">
          <div class="trader-info">
            <div class="trader-address">
              <div class="trader-identity">
                <div class="trader-icon" style="background: ${iconColor}">${addressHash}</div>
                <strong>${trader.address.slice(0, 6)}...${trader.address.slice(-4)}</strong>
              </div>
              <span class="rank">#${trader.platformRanking || "N/A"}</span>
            </div>
            <div class="trader-stats">
              <div class="stat">
                <label>PnL:</label>
                <span class="pnl ${(trader.pnl || 0) >= 0 ? "positive" : "negative"}">
                  ${trader.pnl ? `$${Number(trader.pnl).toLocaleString()}` : "N/A"}
                </span>
              </div>
              <div class="stat">
                <label>Win Rate:</label>
                <span>${trader.winRatio ? `${(Number(trader.winRatio) * 100).toFixed(1)}%` : "N/A"}</span>
              </div>
              <div class="stat">
                <label>Avg Size:</label>
                <span>${trader.avgSize ? `$${Number(trader.avgSize).toLocaleString()}` : "N/A"}</span>
              </div>
            </div>
          </div>
          <div class="trader-actions">
            ${
              isSelected
                ? `<button class="btn btn-small btn-success selected" data-address="${trader.address}">
                   ✓ Selected for Copying
                 </button>`
                : `<button class="btn btn-small btn-primary select-trader" data-address="${trader.address}">
                   Select for Copying
                 </button>`
            }
            <button class="btn btn-small btn-danger remove-trader" data-address="${trader.address}">
              Remove
            </button>
          </div>
        </div>
      `;
        })
        .join("")}
    </div>
  `;
}

// Add the color generation function from leaderboard.tsx
function generateIconColor(address: string): string {
  const hash = address.slice(2, 8);
  const r = parseInt(hash.slice(0, 2), 16);
  const g = parseInt(hash.slice(2, 4), 16);
  const b = parseInt(hash.slice(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

function renderSelectedTraders(traders: any[]): string {
  if (traders.length === 0) {
    return `
      <div class="empty-state">
        <h3>No traders selected for copying</h3>
        <p>Select traders from your favorites to start copying their trades</p>
      </div>
    `;
  }

  return `
    <div class="selected-traders">
      ${traders
        .map(
          (trader) => `
        <div class="selected-trader-card" data-address="${trader.address}">
          <div class="trader-header">
            <strong>${trader.address.slice(0, 6)}...${trader.address.slice(-4)}</strong>
            <span class="status active">Active</span>
          </div>
          <div class="trader-performance">
            <div class="perf-stat">
              <label>24h PnL:</label>
              <span class="pnl ${(trader.pnl || 0) >= 0 ? "positive" : "negative"}">
                ${trader.pnl ? `$${Number(trader.pnl).toLocaleString()}` : "N/A"}
              </span>
            </div>
            <div class="perf-stat">
              <label>Leverage:</label>
              <span>${trader.avgLeverage ? `${Number(trader.avgLeverage).toFixed(1)}x` : "N/A"}</span>
            </div>
          </div>
          <div class="copy-settings">
            <button class="btn btn-small btn-secondary" onclick="openCopySettings('${trader.address}')">
              Settings
            </button>
            <button class="btn btn-small btn-danger deselect-trader" data-address="${trader.address}">
              Stop Copying
            </button>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

function renderOpenPositions(): string {
  // For now, return placeholder - you can implement this when you have position data
  return `
    <div class="positions-container">
      <div class="empty-state">
        <h3>No open positions</h3>
        <p>Your copied positions will appear here</p>
      </div>
    </div>
  `;
}
