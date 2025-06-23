import database from "../database";
import { Trader } from "../types/trader";

function abbreviateNumber(value: number | string): string {
  const num = Number(value) || 0;
  if (Math.abs(num) >= 1e6) {
    return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (Math.abs(num) >= 1e3) {
    return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

function getPlatformIcon(platform: string | null): string {
  if (!platform) {
    return '<span style="color:#666;">-</span>';
  }

  const platformLower = platform.toLowerCase();

  switch (platformLower) {
    case "gmx":
      return `
        <svg width="24" height="24" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gmx-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
            </linearGradient>
          </defs>
          <path fill="url(#gmx-gradient)" transform="translate(-525.667 -696) scale(1)" d="m555.182 717.462-14.735-21.462-14.78 21.462h20.592l-5.812-8.191-2.883 4.256h-3.064l5.949-8.557 8.6 12.493z"/>
        </svg>
      `;
    case "dydx":
      return `<span style="font-size:0.75rem;color:#888;">DYDX</span>`;
    case "hyperliquid":
      return `<span style="font-size:0.75rem;color:#888;">HL</span>`;
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

export async function renderLeaderboard(): Promise<string> {
  try {
    // Fetch users from database
    const traders = await database.getTraders();

    let tradersHTML = "";

    if (traders.length <= 0) {
      tradersHTML = `      <tr class="user-item">
        <td colspan="8" style="text-align:center;color:#666;padding:20px">
          No users found
        </td>
      </tr>`;
      return tradersHTML;
    }

    tradersHTML = traders
      .map((trader: Trader) => {
        const pnlValue = Number(trader.pnlPercentage) || 0;
        const pnlClass = pnlValue >= 0 ? "positive" : "negative";
        const pnlText = pnlValue.toFixed(2);

        const sizeText = abbreviateNumber(trader.avgSize ?? 0);

        const leverageValue = Number(trader.avgLeverage) || 0;
        const leverageText = leverageValue.toFixed(1);

        const winRatioValue = Number(trader.winRatio) || 0;
        const winRatioText = winRatioValue.toFixed(2);

        const watchingCount = trader.watchingAmt || 0;
        const platformIcon = getPlatformIcon(trader.dexPlatform ?? null);
        const addressHash = trader.address.slice(2, 4).toUpperCase();
        const iconColor = generateIconColor(trader.address);

        return `
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
      })
      .join("");

    return `
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
    return `
      <div class="error-container">
        <h2>Error Loading Leaderboard</h2>
        <p>Failed to load trader data. Please try again later.</p>
      </div>
    `;
  }
}
