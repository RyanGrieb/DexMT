import { html } from "hono/html";
import database from "../../database";
import { renderCopiedPositions } from "./copied-positions";
import { renderFavoritedTraders } from "./favorited";
import { renderAllOpenPositions } from "./open-positions";

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

    let totalCopiedPositions = 0; //FIXME: Implement copied positions count

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
          <button class="tab-button" data-tab="all-open-positions">Open Positions (${totalOpenPositions})</button>
          <button class="tab-button" data-tab="copied-positions">Copied Positions (${totalCopiedPositions})</button>
        </div>

        <div class="tab-content">
          <div id="favorited-tab" class="tab-pane active">
            ${renderFavoritedTraders(favoritedTraders, userAddress, selectedAddresses)}
          </div>

          <div id="all-open-positions-tab" class="tab-pane">${await renderAllOpenPositions(selectedTraders)}</div>

          <div id="copied-positions-tab" class="tab-pane">${await renderCopiedPositions(selectedTraders)}</div>
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
