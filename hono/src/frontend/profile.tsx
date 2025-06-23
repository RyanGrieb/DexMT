import database from "../database";
import { DEXPosition, Trader } from "../types/trader";

export async function renderTraderProfile(traderAddress: string, userAddress?: string): Promise<string> {
  try {
    // Fetch trader data from database
    const traders = await database.getTraders();
    const trader = traders.find((t) => t.address === traderAddress);

    if (!trader) {
      return renderTraderNotFound(traderAddress);
    }

    // Fetch positions for this trader
    const positions = await trader.getPositions();

    if (!positions) {
      console.error("Failed to fetch positions for trader:", trader.address);
      return renderErrorPage();
    }

    // Check if this trader is favorited by the current user
    let isFavorited = false;
    if (userAddress) {
      try {
        const favoritedTraders = await database.getTraders({
          favoriteOfAddress: userAddress,
        });
        isFavorited = favoritedTraders.some((fav) => fav.address === traderAddress);
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    }

    //console.log(`User address: ${userAddress} favorited trader ${traderAddress}: ${isFavorited}`);

    return renderProfileHTML(trader, positions, isFavorited);
  } catch (error) {
    console.error("Error rendering trader profile:", error);
    return renderErrorPage();
  }
}

function renderProfileHTML(trader: Trader, positions: DEXPosition[], isFavorited: boolean): string {
  const addressHash = trader.address.slice(2, 4).toUpperCase();
  const iconColor = generateIconColor(trader.address);
  const platformIcon = getPlatformIcon(trader.dexPlatform);

  // Format metrics using the Trader class properties
  const pnlValue = Number(trader.pnl) || 0;
  const pnlPercentageValue = Number(trader.pnlPercentage) || 0;
  const pnlClass = pnlValue >= 0 ? "positive" : "negative";
  const pnlSign = pnlValue >= 0 ? "+" : "";
  const pnlPercentageSign = pnlPercentageValue >= 0 ? "+" : "";

  // Note: volume and totalTrades are not in the Trader class, so we'll use placeholder values
  // You might need to add these to your Trader class or fetch them separately
  const volumeFormatted = abbreviateNumber("0"); // Placeholder - add volume to Trader class if needed
  const avgSizeFormatted = abbreviateNumber(trader.avgSize || 0);
  const winRateFormatted = ((Number(trader.winRatio) || 0) * 100).toFixed(1);
  const avgLeverageFormatted = Number(trader.avgLeverage || 0).toFixed(1);
  const totalTrades = 0; // Placeholder - add totalTrades to Trader class if needed

  // Set up favorite button state
  const favoriteClass = isFavorited ? "favorite-button favorited" : "favorite-button";
  const heartPath = !isFavorited
    ? "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
    : "M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zM12.1 18.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z";

  return `
    <div class="user-info-container">
      <!-- Back button and user header -->
      <div class="user-info-header">
        <button id="backToUsers" class="back-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 0 24 24"
            width="24"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path
              d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
            />
          </svg>
          Back
        </button>

        <div class="user-header">
          <div class="user-avatar">
            <div class="trader-icon" style="background: ${iconColor}">${addressHash}</div>
          </div>
          <div class="user-details">
            <h2 class="user-address">${trader.address}</h2>
            <div class="user-platform-info">
              <span class="user-platform">${platformIcon}</span>
              <span class="user-rank">#${trader.platformRanking || "N/A"}</span>
            </div>
          </div>
          <div class="user-actions">
            <button id="favoriteButton" class="${favoriteClass}" data-address="${trader.address}">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20"
                viewBox="0 0 24 24"
                width="20"
              >
                <path d="M0 0h24v24H0z" fill="none" />
                <path
                  d="${heartPath}"
                />
              </svg>
              ${isFavorited ? "Unfavorite" : "Favorite"}
            </button>
          </div>
        </div>
      </div>

      <!-- Performance metrics -->
      <div class="performance-card card">
        <div class="card-content">
          <h3 class="card-title">Trading Performance</h3>

          <div class="performance-tabs">
            <button class="time-tab active" data-period="today">Today</button>
            <button class="time-tab" data-period="yesterday">Yesterday</button>
            <button class="time-tab" data-period="7d">7 Days</button>
            <button class="time-tab" data-period="30d">30 Days</button>
            <button class="time-tab" data-period="year">Year</button>
            <button class="time-tab" data-period="all">All Time</button>
          </div>

          <div class="performance-metrics">
            <div class="metric-item">
              <span class="metric-label">PNL</span>
              <span class="metric-value pnl ${pnlClass}">${pnlSign}$${Math.abs(pnlValue).toLocaleString()}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">PNL %</span>
              <span class="metric-value pnl ${pnlClass}">${pnlPercentageSign}${Math.abs(pnlPercentageValue).toFixed(2)}%</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Volume</span>
              <span class="metric-value">$${volumeFormatted}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Avg Size</span>
              <span class="metric-value">$${avgSizeFormatted}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Win Rate</span>
              <span class="metric-value">${winRateFormatted}%</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Total Trades</span>
              <span class="metric-value">${totalTrades}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Avg Leverage</span>
              <span class="metric-value">${avgLeverageFormatted}x</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Open positions -->
      <div class="positions-card card">
        <div class="card-content">
          <h3 class="card-title">Open Positions</h3>

          <div class="table-container">
            <table class="positions-table">
              <thead>
                <tr class="positions-header">
                  <th class="header-cell position">Position</th>
                  <th class="header-cell leverage">Leverage</th>
                  <th class="header-cell size">Size</th>
                  <th class="header-cell net-value">Net Value</th>
                  <th class="header-cell collateral">Collateral</th>
                  <th class="header-cell entry-price">Entry Price</th>
                  <th class="header-cell mark-price">Mark Price</th>
                  <th class="header-cell liq-price">Liq Price</th>
                </tr>
              </thead>
              <tbody class="positions-list">
                ${renderPositions(positions)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPositions(positions: DEXPosition[]): string {
  if (!positions || positions.length === 0) {
    return `
      <tr>
        <td colspan="8" class="no-positions">
          <div class="empty-state">
            <h4>No Open Positions</h4>
            <p>This trader currently has no open positions</p>
          </div>
        </td>
      </tr>
    `;
  }

  return positions
    .map((position) => {
      // Use the properly calculated USD values from DEXPosition
      const pnlClass = position.pnlUsd >= 0 ? "positive" : "negative";

      // Determine side based on isLong
      const side = position.isLong ? "LONG" : "SHORT";
      const sideClass = position.isLong ? "long" : "short";

      return `
      <tr class="position-row">
        <td class="position-cell">
          <div class="position-info">
            <span class="market-name">${position.tokenName}</span>
            <span class="position-side ${sideClass}">${side}</span>
          </div>
        </td>
        <td class="leverage-cell">${position.leverage.toFixed(2)}x</td>
        <td class="size-cell">$${abbreviateNumber(Math.abs(position.sizeUsd))}</td>
        <td class="net-value-cell ${pnlClass}">$${abbreviateNumber(position.pnlUsd)}</td>
        <td class="collateral-cell">$${abbreviateNumber(position.collateralAmountUsd)}</td>
        <td class="entry-price-cell">$${position.entryPriceUsd > 0 ? position.entryPriceUsd.toFixed(2) : "N/A"}</td>
        <td class="mark-price-cell">$${position.markPriceUsd > 0 ? position.markPriceUsd.toFixed(2) : "N/A"}</td>
        <td class="liq-price-cell">$${position.liqPriceUsd > 0 ? position.liqPriceUsd.toFixed(4) : "N/A"}</td>
      </tr>
    `;
    })
    .join("");
}

function renderTraderNotFound(address: string): string {
  return `
    <div class="user-info-container">
      <div class="error-state">
        <h2>Trader Not Found</h2>
        <p>No trader found with address: ${address}</p>
        <button onclick="window.history.back()" class="btn btn-primary">Go Back</button>
      </div>
    </div>
  `;
}

function renderErrorPage(): string {
  return `
    <div class="user-info-container">
      <div class="error-state">
        <h2>Error Loading Profile</h2>
        <p>There was an error loading the trader profile. Please try again.</p>
        <button onclick="window.location.reload()" class="btn btn-primary">Retry</button>
      </div>
    </div>
  `;
}

// Helper functions (reuse from leaderboard.tsx)
function abbreviateNumber(value: number | string): string {
  const num = Number(value) || 0;
  if (Math.abs(num) >= 1e6) {
    return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (Math.abs(num) >= 1e3) {
    return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toLocaleString();
}

function getPlatformIcon(platform: string | null | undefined): string {
  if (!platform) {
    return '<span style="color:#666;">-</span>';
  }

  const platformLower = platform.toLowerCase();

  switch (platformLower) {
    case "gmx":
      return '<span style="color:#4f46e5; font-weight: bold;">GMX</span>';
    case "dydx":
      return '<span style="color:#6366f1; font-weight: bold;">dYdX</span>';
    case "hyperliquid":
      return '<span style="color:#8b5cf6; font-weight: bold;">HL</span>';
    default:
      return `<span style="font-size:0.75rem;color:#888;">${platform.toUpperCase()}</span>`;
  }
}

function generateIconColor(address: string): string {
  const hash = address.slice(2, 8);
  const r = parseInt(hash.slice(0, 2), 16);
  const g = parseInt(hash.slice(2, 4), 16);
  const b = parseInt(hash.slice(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}
