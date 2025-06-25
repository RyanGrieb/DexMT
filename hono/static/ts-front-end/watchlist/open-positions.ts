import utils from "../utils";

// Global function for onclick in HTML
(window as any).toggleTraderPositions = toggleTraderPositions;

async function init() {
  // Handle clicks within open positions tab
  document.body.addEventListener("click", async (e) => {
    const btn = (e.target as HTMLElement).closest("button");
    if (btn) {
      // LOAD TRADES
      if (btn.classList.contains("load-trades-btn")) {
        await handleLoadTrades(btn as HTMLButtonElement);
      }
    }
  });

  // Initialize collapsed state when tab becomes active
  utils.watchElementsOfQuery(".tab-button[data-tab='all-open-positions']", (element) => {
    const tabBtn = element as HTMLElement;
    tabBtn.addEventListener("click", () => {
      // Small delay to ensure tab content is loaded
      setTimeout(() => {
        initializeCollapsedState();
      }, 100);
    });
  });
}

function initializeCollapsedState() {
  const traderGroups = document.querySelectorAll(".trader-positions-group");
  traderGroups.forEach((group) => {
    // Ensure all positions start collapsed
    const positionsList = group.querySelector(".positions-list");
    if (positionsList) {
      positionsList.classList.add("collapsed");
      positionsList.classList.remove("expanded");
    }

    // Ensure trader group is not marked as expanded
    group.classList.remove("expanded");
  });
}

function toggleTraderPositions(traderAddress: string) {
  const traderGroup = document.querySelector(`.trader-positions-group[data-trader="${traderAddress}"]`);
  if (!traderGroup) return;

  const positionsList = traderGroup.querySelector(".positions-list");
  if (!positionsList) return;

  const isCurrentlyCollapsed = positionsList.classList.contains("collapsed");

  if (isCurrentlyCollapsed) {
    // Expand
    positionsList.classList.remove("collapsed");
    positionsList.classList.add("expanded");
    traderGroup.classList.add("expanded");
  } else {
    // Collapse
    positionsList.classList.remove("expanded");
    positionsList.classList.add("collapsed");
    traderGroup.classList.remove("expanded");
  }
}

async function handleLoadTrades(button: HTMLButtonElement) {
  const traderAddress = button.dataset.trader;
  const positionId = button.dataset.position;

  if (!traderAddress || !positionId) {
    console.error("Missing trader address or position ID");
    return;
  }

  const originalText = button.textContent;

  // Set loading state
  button.classList.add("loading");
  button.textContent = "Loading...";
  button.disabled = true;

  try {
    // Call API to get trades for this position
    const response = await fetch(`/api/traders/${traderAddress}/positions/${positionId}/trades`);

    if (!response.ok) {
      throw new Error(`Failed to load trades: ${response.statusText}`);
    }

    const trades = await response.json();

    // Find the position card and add trades section
    const positionCard = button.closest(".position-card") as HTMLElement | null;
    if (positionCard) {
      await renderTradesInPosition(positionCard, trades);
    }

    // Update button to show success
    button.textContent = " Trades Loaded";
    button.classList.remove("loading");

    // Hide the button after successful load
    setTimeout(() => {
      button.style.display = "none";
    }, 1500);
  } catch (error: any) {
    console.error("Error loading trades:", error);
    utils.showNotification(error.message || "Failed to load trades", "error");

    // Reset button state
    button.textContent = originalText;
    button.classList.remove("loading");
    button.disabled = false;
  }
}

async function renderTradesInPosition(positionCard: HTMLElement, trades: any[]) {
  // Check if trades section already exists
  let tradesSection = positionCard.querySelector(".associated-trades") as HTMLElement | null;

  if (!tradesSection) {
    // Create new trades section
    tradesSection = document.createElement("div") as HTMLElement;
    tradesSection.className = "associated-trades";
    positionCard.appendChild(tradesSection);
  }

  // Render trades HTML
  const tradesHtml = `
    <h4 class="trades-header">Associated Trades (${trades.length})</h4>
    <div class="trades-list">
      ${trades.map((trade) => renderTradeRow(trade)).join("")}
    </div>
  `;

  tradesSection.innerHTML = tradesHtml;

  // Add fade-in animation
  tradesSection.style.opacity = "0";
  tradesSection.style.transition = "opacity 0.3s ease";

  setTimeout(() => {
    tradesSection.style.opacity = "1";
  }, 50);
}

function renderTradeRow(trade: any): string {
  const orderTypeNames: { [key: number]: string } = {
    0: "MarketSwap",
    1: "LimitSwap",
    2: "MarketIncrease",
    3: "LimitIncrease",
    4: "MarketDecrease",
    5: "LimitDecrease",
    6: "StopLossDecrease",
    7: "Liquidation",
    8: "StopIncrease",
    9: "Deposit",
  };

  const orderTypeName = orderTypeNames[trade.orderType] || "Unknown";
  const timestamp = new Date(trade.timestamp * 1000).toLocaleDateString();
  const pnlClass = trade.rpnl >= 0 ? "positive" : "negative";

  return `
    <div class="trade-row">
      <div class="trade-info">
        <span class="trade-type">${orderTypeName}</span>
        <span class="trade-date">${timestamp}</span>
      </div>
      <div class="trade-details">
      </div>
    </div>
  `;
}

export default { init };
