import { html } from "hono/html";
import utils from "../../utils";

export function renderFavoritedTraders(traders: any[], userAddress: string, selectedAddresses: Set<string>) {
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
