import { html, raw } from "hono/html";
import { DEXOrderType, DEXPosition, DEXTradeAction, Trader } from "../../types/trader";
import utils from "../../utils";

/*
 * Render all open positions from selected traders with their associated trades
 */
export async function renderAllOpenPositions(selectedTraders: Trader[]) {
  try {
    // Collect all positions from selected traders
    const openPositions: { trader: Trader; positions: DEXPosition[] }[] = [];

    let totalPositions = 0;
    let totalPnL = 0;
    let totalSize = 0;

    // Get positions for all selected traders
    for (const trader of selectedTraders) {
      const positions = await trader.getPositions({ fromDb: true });
      if (positions && positions.length > 0) {
        openPositions.push({ trader, positions });
        totalPositions += positions.length;
        totalPnL += positions.reduce((sum: number, pos: any) => sum + (pos.pnlUsd || 0), 0);
        totalSize += positions.reduce((sum: number, pos: any) => sum + Math.abs(pos.sizeUsd || 0), 0);
      }
    }

    // Pre-render all trader positions to avoid async inside template
    const renderedTraderPositions =
      openPositions.length === 0
        ? renderNoOpenPositions()
        : (
            await Promise.all(
              openPositions.map(async ({ trader, positions }) => await renderTraderPositions(trader, positions))
            )
          ).join("");

    return html`
      <div class="positions-container">
        <!-- Summary Stats -->
        <div class="positions-summary">
          <div class="summary-card">
            <div class="summary-label">Total Positions</div>
            <div class="summary-value">${totalPositions}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total PnL</div>
            <div class="summary-value ${totalPnL >= 0 ? "positive" : "negative"}">
              ${totalPnL >= 0 ? "+" : ""}$${utils.abbreviateNumber(Math.abs(totalPnL))}
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Size</div>
            <div class="summary-value">$${utils.abbreviateNumber(totalSize)}</div>
          </div>
        </div>

        <!-- Open Positions Section -->
        <div class="positions-section">
          <div class="section-header">
            <h3 class="section-title">Open Positions</h3>
            <p class="section-subtitle">${totalPositions} positions from ${openPositions.length} traders</p>
          </div>

          ${raw(renderedTraderPositions)}
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

async function renderTraderPositions(trader: Trader, positions: DEXPosition[]) {
  const addressHash = trader.address.slice(2, 4).toUpperCase();
  const iconColor = utils.generateIconColor(trader.address);
  const totalPnL = positions.reduce((sum, pos) => sum + (pos.pnlUsd || 0), 0);
  const totalSize = positions.reduce((sum, pos) => sum + Math.abs(pos.sizeUsd || 0), 0);

  // Pre-render all position cards to avoid async inside template
  const renderedPositions = (
    await Promise.all(positions.map(async (position) => await renderPositionWithTrades(trader, position)))
  ).join("");

  return html`
    <div class="trader-positions-group" data-trader="${trader.address}">
      <div class="trader-group-header" onclick="toggleTraderPositions('${trader.address}')">
        <div class="trader-group-info">
          <div class="trader-icon" style="background: ${iconColor}">${addressHash}</div>
          <div>
            <div class="trader-name">${trader.address.slice(0, 6)}...${trader.address.slice(-4)}</div>
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
        <div class="expand-toggle">
          <span class="expand-icon">▼</span>
        </div>
      </div>

      <div class="positions-list collapsed">${raw(renderedPositions)}</div>
    </div>
  `;
}

async function renderPositionWithTrades(trader: Trader, position: DEXPosition) {
  // Get trades associated with this position
  //const trades = await trader.getTradesFromPosition(position);

  const pnlClass = position.pnlUsd >= 0 ? "positive" : "negative";
  const side = position.isLong ? "LONG" : "SHORT";
  const sideClass = position.isLong ? "long" : "short";

  return html`
    <div class="position-card">
      <div class="position-header">
        <div class="position-info">
          <span class="market-name">${position.tokenName}</span>
          <span class="position-side ${sideClass}">${side}</span>
        </div>
        <div class="position-stats">
          <div class="position-stat">
            <span class="stat-label">Size:</span>
            <span class="stat-value">$${utils.abbreviateNumber(Math.abs(position.sizeUsd))}</span>
          </div>
          <div class="position-stat">
            <span class="stat-label">PnL:</span>
            <span class="stat-value ${pnlClass}">$${utils.abbreviateNumber(position.pnlUsd)}</span>
          </div>
          <div class="position-stat">
            <span class="stat-label">Leverage:</span>
            <span class="stat-value">${Number(position.leverage).toFixed(2)}x</span>
          </div>
        </div>
        <div class="position-actions">
          <button type="button" class="load-trades-btn" data-trader="${trader.address}" data-position="${position.key || position.marketAddress}">
            📊 Load Trades
          </button>
        </div>
      </div>

      <div class="position-details">
        <div class="detail-row">
          <span class="detail-label">Collateral:</span>
          <span class="detail-value">$${utils.abbreviateNumber(position.collateralAmountUsd)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Entry Price:</span>
          <span class="detail-value"
            >$${position.entryPriceUsd > 0 ? Number(position.entryPriceUsd).toFixed(2) : "N/A"}</span
          >
        </div>
        <div class="detail-row">
          <span class="detail-label">Mark Price:</span>
          <span class="detail-value"
            >$${position.markPriceUsd > 0 ? Number(position.markPriceUsd).toFixed(2) : "N/A"}</span
          >
        </div>
        <div class="detail-row">
          <span class="detail-label">Liq Price:</span>
          <span class="detail-value"
            >$${position.liqPriceUsd > 0 ? Number(position.liqPriceUsd).toFixed(4) : "N/A"}</span
          >
        </div>
      </div>
    </div>
  `;
}

function renderTradeRow(trade: DEXTradeAction) {
  const orderTypeName = DEXOrderType[trade.orderType];
  const timestamp = new Date(trade.timestamp * 1000).toLocaleDateString();

  return html`
    <div class="trade-row">
      <div class="trade-info">
        <span class="trade-type">${orderTypeName}</span>
        <span class="trade-date">${timestamp}</span>
      </div>
      <div class="trade-details">
        <span class="trade-size">$${utils.abbreviateNumber(Math.abs(trade.sizeUsd))}</span>
        <span class="trade-price">@$${Number(trade.priceUsd).toFixed(2)}</span>
        ${trade.rpnl !== 0
          ? html`<span class="trade-pnl ${trade.rpnl >= 0 ? "positive" : "negative"}">
              ${trade.rpnl >= 0 ? "+" : ""}$${utils.abbreviateNumber(Math.abs(trade.rpnl))}
            </span>`
          : ""}
      </div>
    </div>
  `;
}

function renderNoOpenPositions() {
  return html`
    <div class="empty-positions">
      <h4>No open positions found</h4>
      <p>No selected traders currently have open positions</p>
    </div>
  `;
}
