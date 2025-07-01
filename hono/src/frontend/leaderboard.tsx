import { html } from "hono/html";
import database from "../database";
import { Trader } from "../types/trader";
import utils from "../utils/utils";

export async function renderLeaderboard(): Promise<string> {
  try {
    // Fetch users from database
    const traders = await database.getTraders();

    let tradersHTML;

    if (traders.length <= 0) {
      tradersHTML = html` <tr class="user-item">
        <td colspan="8" style="text-align:center;color:#666;padding:20px">No users found</td>
      </tr>`;
      return tradersHTML;
    }

    tradersHTML = traders.map((trader: Trader) => {
      const pnlValue = Number(trader.pnlPercentage) || 0;
      const pnlClass = pnlValue >= 0 ? "positive" : "negative";
      const pnlText = pnlValue.toFixed(2);

      const sizeText = utils.abbreviateNumber(trader.avgSize ?? 0);

      const leverageValue = Number(trader.avgLeverage) || 0;
      const leverageText = leverageValue.toFixed(1);

      const winRatioValue = Number(trader.winRatio) || 0;
      const winRatioText = winRatioValue.toFixed(2);

      const watchingCount = trader.watchingAmt || 0;
      const platformIcon = utils.getPlatformIcon(trader.dexPlatform ?? null);
      const addressHash = trader.address.slice(2, 4).toUpperCase();
      const iconColor = utils.generateIconColor(trader.address);

      return html`
        <tr class="user-item" address="${trader.address}">
          <td class="user-rank">#${trader.platformRanking || "?"}</td>
          <td class="user-platform">${platformIcon}</td>
          <td class="user-trader">
            <div class="trader-icon" style="background: ${iconColor}">${addressHash}</div>
            <div class="trader-address">${trader.address.slice(0, 6)}...${trader.address.slice(-4)}</div>
          </td>
          <td class="user-pnl ${pnlClass}">${pnlText}%</td>
          <td class="user-size">${sizeText}</td>
          <td class="user-leverage">${leverageText}x</td>
          <td class="user-winratio">${winRatioText}</td>
          <td class="user-watching">${watchingCount}</td>
        </tr>
      `;
    });

    return html`
      <div class="top-traders-view">
        <div class="view-header">
          <h2 class="view-title">Top Traders</h2>
          <p class="view-subtitle">
            <!-- Mirror trades from top performers across DEX platforms -->
            The top traders ranked by their performance across multiple DEX platforms.
          </p>
        </div>

        <div class="leaderboard-container">
          <div class="table-container">
            <table class="leaderboard-table">
              <thead>
                <tr>
                  <th class="rank-col">Rank</th>
                  <th class="platform-col">Platform</th>
                  <th class="trader-col">Trader</th>
                  <th class="pnl-col">PnL %</th>
                  <th class="size-col">Avg Size</th>
                  <th class="leverage-col">Leverage</th>
                  <th class="winratio-col">Win Rate</th>
                  <th class="watching-col">Watching</th>
                </tr>
              </thead>
              <tbody class="user-list">
                ${tradersHTML}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error rendering leaderboard:", error);
    return html`
      <div class="error-container">
        <h2>Error Loading Leaderboard</h2>
        <p>Failed to load trader data. Please try again later.</p>
      </div>
    `;
  }
}
