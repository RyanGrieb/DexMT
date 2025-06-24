import { html } from "hono/html";
import database from "../database";
import { DEXPosition, Trader } from "../types/trader";
import utils from "../utils";

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

export async function renderWatchlist(userAddress?: string) {
  // If no user address provided, show empty state
  if (!userAddress) {
    return html`
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

    // Check if user has copy trading enabled (FIXME: This is slow, optimize later)
    const userTraders = await database.getTraders({ isMirroring: true });
    const isUserMirroring = userTraders.some((trader) => trader.address.toLowerCase() === userAddress.toLowerCase());

    // Get the total open positions from the favorited and selected traders
    let totalOpenPositions = 0;
    await Promise.all(
      selectedTraders.map(async (selectedTrader) => {
        const positions = await selectedTrader.getPositions({ fromDb: true });
        totalOpenPositions += positions.length;
      })
    );

    return html`
      <div class="watchlist-container">
        <div class="watchlist-header">
          <h2>My Watch List</h2>
          <div class="watchlist-controls">
            <button id="copySettingsBtn" class="btn btn-secondary">Copy Settings</button>
            <div class="mirror-toggle">
              <label class="switch">
                <input type="checkbox" id="mirrorToggle" ${isUserMirroring ? "checked" : ""} />
                <span class="slider round"></span>
              </label>
              <span>${isUserMirroring ? "Disable Auto-Copy" : "Enable Auto-Copy"}</span>
            </div>
          </div>
        </div>

        <div class="watchlist-tabs">
          <button class="tab-button active" data-tab="favorited">Favorited Traders (${favoritedTraders.length})</button>
          <button class="tab-button" data-tab="selected">Active Copying (${selectedTraders.length})</button>
          <button class="tab-button" data-tab="positions">
            Open Positions<br />(Copying: 0 Total: ${totalOpenPositions})
          </button>
        </div>

        <div class="tab-content">
          <div id="favorited-tab" class="tab-pane active">
            ${renderFavoritedTraders(favoritedTraders, userAddress, selectedAddresses)}
          </div>

          <div id="selected-tab" class="tab-pane">${renderSelectedTraders(selectedTraders)}</div>

          <div id="positions-tab" class="tab-pane">${await renderOpenPositions(selectedTraders)}</div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error rendering watchlist:", error);
    return html`
      <div class="watchlist-container">
        <div class="error-message">
          <h3>Error loading watchlist</h3>
          <p>Please try refreshing the page</p>
        </div>
      </div>
    `;
  }
}

function renderFavoritedTraders(traders: any[], userAddress: string, selectedAddresses: Set<string>) {
  if (traders.length === 0) {
    return html`
      <div class="empty-state">
        <h3>No traders in your watchlist</h3>
        <p>Start by adding some top performers to track their trades</p>
        <button class="btn btn-primary" onclick="window.location.href='/toptraders'">Browse Top Traders</button>
      </div>
    `;
  }

  return html`
    <div class="traders-grid">
      ${traders.map((trader) => {
        const isSelected = selectedAddresses.has(trader.address);
        const addressHash = trader.address.slice(2, 4).toUpperCase();
        const iconColor = utils.generateIconColor(trader.address);
        //const profileUrl = `/traderprofile?address=${trader.address}`;

        return html`
          <div class="trader-card" data-address="${trader.address}">
            <div class="trader-info">
              <div class="trader-address">
                <a href="" class="trader-identity">
                  <div class="trader-icon" style="background: ${iconColor}">${addressHash}</div>
                  <strong>${trader.address.slice(0, 6)}...${trader.address.slice(-4)}</strong>
                </a>
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
              ${isSelected
                ? html`<button class="btn btn-small btn-success selected" data-address="${trader.address}">
                    ✓ Selected for Copying
                  </button>`
                : html`<button class="btn btn-small btn-primary select-trader" data-address="${trader.address}">
                    Select for Copying
                  </button>`}
              <button class="btn btn-small btn-danger remove-trader" data-address="${trader.address}">Remove</button>
            </div>
          </div>
        `;
      })}
    </div>
  `;
}

function renderSelectedTraders(traders: any[]) {
  if (traders.length === 0) {
    return html`
      <div class="empty-state">
        <h3>No traders selected for copying</h3>
        <p>Select traders from your favorites to start copying their trades</p>
      </div>
    `;
  }

  return html`
    <div class="selected-traders">
      ${traders.map(
        (trader) => html`
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
      )}
    </div>
  `;
}
async function renderOpenPositions(selectedTraders: Trader[]) {
  try {
    // Collect all positions from selected traders
    const copyingPositions: { trader: Trader; positions: DEXPosition[] }[] = [];
    const allPositions: { trader: Trader; positions: DEXPosition[] }[] = [];

    let totalCopyingPositions = 0;
    let totalAllPositions = 0;
    let totalCopyingPnL = 0;
    let totalAllPnL = 0;
    let totalCopyingSize = 0;
    let totalAllSize = 0;

    // Get positions for all selected traders
    for (const trader of selectedTraders) {
      const positions = await trader.getPositions({ fromDb: true });
      if (positions && positions.length > 0) {
        copyingPositions.push({ trader, positions });
        totalCopyingPositions += positions.length;
        totalCopyingPnL += positions.reduce((sum: number, pos: any) => sum + (pos.pnlUsd || 0), 0);
        totalCopyingSize += positions.reduce((sum: number, pos: any) => sum + Math.abs(pos.sizeUsd || 0), 0);
      }
    }

    // Get all traders and their positions for comparison
    const allTraders = await database.getTraders();
    for (const trader of allTraders) {
      const positions = await trader.getPositions({ fromDb: true });
      if (positions && positions.length > 0) {
        allPositions.push({ trader, positions });
        totalAllPositions += positions.length;
        totalAllPnL += positions.reduce((sum: number, pos: any) => sum + (pos.pnlUsd || 0), 0);
        totalAllSize += positions.reduce((sum: number, pos: any) => sum + Math.abs(pos.sizeUsd || 0), 0);
      }
    }

    return html`
      <div class="positions-container">
        <!-- Summary Stats -->
        <div class="positions-summary">
          <div class="summary-card">
            <div class="summary-label">Copying Positions</div>
            <div class="summary-value">${totalCopyingPositions}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Positions</div>
            <div class="summary-value">${totalAllPositions}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Copying PnL</div>
            <div class="summary-value ${totalCopyingPnL >= 0 ? "positive" : "negative"}">
              ${totalCopyingPnL >= 0 ? "+" : ""}$${utils.abbreviateNumber(Math.abs(totalCopyingPnL))}
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Size</div>
            <div class="summary-value">$${utils.abbreviateNumber(totalCopyingSize)}</div>
          </div>
        </div>

        <!-- Copying Positions Section -->
        <div class="positions-section">
          <div class="section-header">
            <h3 class="section-title">Positions Being Copied</h3>
            <p class="section-subtitle">${totalCopyingPositions} positions from ${copyingPositions.length} traders</p>
          </div>

          ${copyingPositions.length === 0
            ? renderNoCopyingPositions()
            : copyingPositions.map(({ trader, positions }) => renderTraderPositions(trader, positions, true)).join("")}
        </div>

        <!-- All Positions Section -->
        <div class="positions-section">
          <div class="section-header">
            <h3 class="section-title">All Open Positions</h3>
            <p class="section-subtitle">${totalAllPositions} positions from ${allPositions.length} traders</p>
          </div>

          ${allPositions.length === 0
            ? `<div class="empty-positions">
                 <h4>No open positions found</h4>
                 <p>No traders currently have open positions</p>
               </div>`
            : allPositions.map(({ trader, positions }) => renderTraderPositions(trader, positions, false)).join("")}
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error rendering open positions:", error);
    return html`
      <div class="positions-container">
        <div class="error-message">
          <h3>Error loading positions</h3>
          <p>Please try refreshing the page</p>
        </div>
      </div>
    `;
  }
}

function renderNoCopyingPositions() {
  return html`
    <div class="no-copying-positions">
      <h4>No positions being copied</h4>
      <p>Your selected traders don't currently have any open positions, or copy trading is not enabled.</p>
    </div>
  `;
}

function renderTraderPositions(trader: any, positions: DEXPosition[], isCopying: boolean) {
  const addressHash = trader.address.slice(2, 4).toUpperCase();
  const iconColor = utils.generateIconColor(trader.address);
  const totalPnL = positions.reduce((sum, pos) => sum + (pos.pnlUsd || 0), 0);
  const totalSize = positions.reduce((sum, pos) => sum + Math.abs(pos.sizeUsd || 0), 0);

  return html`
    <div class="trader-positions-group">
      <div class="trader-group-header">
        <div class="trader-group-info">
          <div class="trader-icon" style="background: ${iconColor}">${addressHash}</div>
          <div>
            <div class="trader-name">${trader.address.slice(0, 6)}...${trader.address.slice(-4)}</div>
            ${isCopying ? '<span style="color: #10b981; font-size: 0.75rem;">● Copying</span>' : ""}
          </div>
        </div>
        <div class="trader-stats">
          <div class="trader-stat-item">
            <span class="trader-stat-label">Positions</span>
            <span class="trader-stat-value">${positions.length}</span>
          </div>
          <div class="trader-stat-item">
            <span class="trader-stat-label">Total PnL</span>
            <span class="trader-stat-value ${totalPnL >= 0 ? "positive" : "negative"}">
              ${totalPnL >= 0 ? "+" : ""}$${utils.abbreviateNumber(Math.abs(totalPnL))}
            </span>
          </div>
          <div class="trader-stat-item">
            <span class="trader-stat-label">Total Size</span>
            <span class="trader-stat-value">$${utils.abbreviateNumber(totalSize)}</span>
          </div>
        </div>
      </div>

      <div class="positions-table-container">
        <table class="positions-table">
          <thead>
            <tr>
              <th class="position-cell">Position</th>
              <th>Leverage</th>
              <th>Size</th>
              <th>Net Value</th>
              <th>Collateral</th>
              <th>Entry Price</th>
              <th>Mark Price</th>
              <th>Liq Price</th>
            </tr>
          </thead>
          <tbody>
            ${positions.map((position) => renderPositionRow(position)).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderPositionRow(position: DEXPosition) {
  const pnlClass = position.pnlUsd >= 0 ? "positive" : "negative";
  const side = position.isLong ? "LONG" : "SHORT";
  const sideClass = position.isLong ? "long" : "short";

  return html`
    <tr>
      <td class="position-cell">
        <span class="market-name">${position.tokenName}</span>
        <span class="position-side ${sideClass}">${side}</span>
      </td>
      <td class="leverage-cell">${Number(position.leverage).toFixed(2)}x</td>
      <td class="size-cell">$${utils.abbreviateNumber(Math.abs(position.sizeUsd))}</td>
      <td class="net-value-cell ${pnlClass}">$${utils.abbreviateNumber(position.pnlUsd)}</td>
      <td class="collateral-cell">$${utils.abbreviateNumber(position.collateralAmountUsd)}</td>
      <td class="entry-price-cell">
        $${position.entryPriceUsd > 0 ? Number(position.entryPriceUsd).toFixed(2) : "N/A"}
      </td>
      <td class="mark-price-cell">$${position.markPriceUsd > 0 ? Number(position.markPriceUsd).toFixed(2) : "N/A"}</td>
      <td class="liq-price-cell">$${position.liqPriceUsd > 0 ? Number(position.liqPriceUsd).toFixed(4) : "N/A"}</td>
    </tr>
  `;
}
