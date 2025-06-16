import { provider } from "../metamask";
import { User } from "../users";
import { default as utils } from "../utils";

export interface WatchedTrader extends User {
  copyStatus: "active" | "inactive";
  watching: number;
}

// Cache our HTML templates into memory
let watchedTraderRowTemplate: string | null = null;
let traderActionsMenuTemplate: string | null = null;

// Store watched traders
let watchedTraders: WatchedTrader[] = [];

export async function getActiveWatchedTraders(): Promise<string[]> {
  const walletAddress = provider?.selectedAddress;
  if (!walletAddress) {
    utils.showToast("Please connect your wallet first", "warning");
    return [];
  }

  try {
    const response = await fetch(
      `/api/trader/watched?active=true&copierAddress=${walletAddress}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch active watched traders");
    }

    const data = await response.json();
    return data.active_watched_traders || [];
  } catch (error) {
    console.error("Error fetching active watched traders:", error);
    utils.showToast("Failed to fetch active watched traders", "error");
    return [];
  }
}

export async function loadWatchedTraders(): Promise<void> {
  const walletAddress = provider?.selectedAddress;
  if (!walletAddress) {
    utils.showToast("Please connect your wallet first", "warning");
    return;
  }

  try {
    const response = await fetch(
      `/api/trader/watched?copierAddress=${walletAddress}` // Fetch all watched traders for the connected wallet
    );
    if (!response.ok) {
      throw new Error("Failed to load watched traders");
    }

    // parse the JSON once
    const payload = (await response.json()) as {
      copier_addr: string;
      traders: Array<WatchedTrader>;
    };
    console.log("watched_traders payload:", payload);

    if (!payload || !Array.isArray(payload.traders)) {
      utils.showToast("No watched traders found", "info");
      return;
    }

    // Clear existing watched traders
    watchedTraders = [];
    // Fetch trader details for each watched trader
    for (const trader of payload.traders) {
      const traderAddress = trader.address;

      watchedTraders.push({
        address: traderAddress,
        copyStatus: "inactive",
        watching: 0, // Default watching count
        platform_ranking: trader.platform_ranking, // Default ranking
        dex_platform: trader.dex_platform, // Default platform
        pnlPercentage: trader.pnlPercentage, // Default PnL percentage
        avgSize: trader.avgSize, // Default average size
        avgLeverage: trader.avgLeverage, // Default average leverage
        winRatio: trader.winRatio, // Default win ratio,
        balance: trader.balance, // Default balance,
        traderId: traderAddress, // Use trader address as ID,
        chainId: trader.chainId, // Default chain ID,
        pnl: trader.pnl, // Default PnL
        updatedAt: trader.updatedAt, // Default updated time
      } as WatchedTrader);
    }
    await updateWatchedTradersUI();
  } catch (error) {
    console.error("Error loading watched traders:", error);
    utils.showToast("Failed to load watched traders", "error");
  }
}

export async function updateWatchedTradersUI(): Promise<void> {
  const watchedTradersList = document.querySelector(".watched-traders-list");
  if (!watchedTradersList) return;

  // Load the local selection
  const selectedAddresses = await getActiveWatchedTraders();

  console.log(`Selected addresses:`, selectedAddresses);

  const fragment = document.createDocumentFragment();

  if (watchedTraders.length > 0) {
    // Fetch template if not cached
    if (!watchedTraderRowTemplate) {
      try {
        const response = await fetch("/html/watched-trader-row.html");
        if (response.ok) {
          watchedTraderRowTemplate = await response.text();
        } else {
          throw new Error("Failed to load template");
        }
      } catch (error) {
        console.error("Error loading watched trader row template:", error);
        utils.showToast("Failed to load template", "error");
        return;
      }
    }

    watchedTraders.forEach((trader, index) => {
      // Create a table to properly parse the tr element
      const tempTable = document.createElement("table");
      tempTable.innerHTML = `<tbody>${watchedTraderRowTemplate}</tbody>`;
      const traderRow = tempTable.querySelector(
        "tr.watched-trader-item"
      ) as HTMLElement;

      if (traderRow) {
        // Update elements based on their IDs
        const addressHash = trader.address.slice(2, 4).toUpperCase();

        // Trader checkbox
        const traderCheckbox = traderRow.querySelector(
          "#trader-checkbox"
        ) as HTMLInputElement;
        if (traderCheckbox) {
          traderCheckbox.setAttribute("data-address", trader.address);
          traderCheckbox.removeAttribute("id");
          traderCheckbox.className = "trader-checkbox";

          // Restore checkbox state from localStorage
          traderCheckbox.checked = selectedAddresses.includes(trader.address);
        }

        // Rank
        const traderRank = traderRow.querySelector("#user-rank");
        if (traderRank) {
          traderRank.textContent = `#${trader.platform_ranking || index + 1}`;
          traderRank.removeAttribute("id");
        }

        // Platform
        const traderPlatform = traderRow.querySelector("#user-platform");
        if (traderPlatform) {
          traderPlatform.innerHTML = utils.getPlatformIcon(trader.dex_platform);
          traderPlatform.removeAttribute("id");
        }

        // Trader icon
        const traderIcon = traderRow.querySelector(
          "#trader-icon"
        ) as HTMLElement;
        if (traderIcon) {
          traderIcon.textContent = addressHash;
          traderIcon.style.background = utils.generateIconColor(trader.address);
          traderIcon.removeAttribute("id");
        }

        // Trader address
        const traderAddress = traderRow.querySelector("#trader-address");
        if (traderAddress) {
          traderAddress.textContent = `${trader.address.slice(0, 6)}...${trader.address.slice(-4)}`;
          traderAddress.removeAttribute("id");
        }

        // PNL
        const traderPnl = traderRow.querySelector("#user-pnl") as HTMLElement;
        if (traderPnl) {
          const pnlValue = Number(trader.pnlPercentage || 0);
          traderPnl.textContent = `${pnlValue.toFixed(2)}%`;
          traderPnl.className = `user-pnl ${pnlValue >= 0 ? "positive" : "negative"}`;
          traderPnl.removeAttribute("id");
        }

        // Win Ratio
        const traderWinRatio = traderRow.querySelector("#user-winratio");
        if (traderWinRatio) {
          const winRatioValue = Number(trader.winRatio || 0);
          traderWinRatio.textContent = winRatioValue.toFixed(2);
          traderWinRatio.removeAttribute("id");
        }

        // Watching count
        const traderWatching = traderRow.querySelector("#user-watching");
        if (traderWatching) {
          traderWatching.textContent = (trader.watching || 0).toString();
          traderWatching.removeAttribute("id");
        }

        // Actions button
        const actionsBtn = traderRow.querySelector(
          "#actions-btn"
        ) as HTMLElement;
        if (actionsBtn) {
          actionsBtn.setAttribute("data-address", trader.address);
          actionsBtn.removeAttribute("id");
        }

        // Add click event listener to select trader (same as top-traders)
        traderRow.addEventListener("click", (e) => {
          // Don't trigger selection if clicking on checkbox
          if (!(e.target as HTMLElement).closest(".trader-checkbox")) {
            console.log("Trader row clicked:", trader.address);
            //selectTrader(trader);
          }
        });

        // Add event listener for checkbox
        if (traderCheckbox) {
          traderCheckbox.addEventListener("change", (e) => {
            e.stopPropagation(); // Prevent row click
            handleTraderSelection();
          });
        }

        // Add event listener for actions button
        if (actionsBtn) {
          actionsBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent row click
            showTraderActionsMenu(trader.address, e.target as HTMLElement);
          });
        }

        fragment.appendChild(traderRow);
      }
    });
  } else {
    const emptyRow = document.createElement("tr");
    emptyRow.className = "watched-trader-item";
    emptyRow.innerHTML = `
      <td colspan="7" style="text-align:center;color:#666;padding:20px">
        No traders in watch list. Click "Add Trader" to start watching.
      </td>
    `;
    fragment.appendChild(emptyRow);
  }

  watchedTradersList.replaceChildren(fragment);
  setupSelectAllCheckbox();
}

export async function showTraderActionsMenu(
  address: string,
  button: HTMLElement
): Promise<Promise<void>> {
  // Create a simple context menu for trader actions
  const existingMenu = document.querySelector(".trader-actions-menu");
  if (existingMenu) {
    existingMenu.remove();
  }

  // Load menu template if not cached
  if (!traderActionsMenuTemplate) {
    try {
      const response = await fetch("/html/trader-actions-menu.html");
      if (response.ok) {
        traderActionsMenuTemplate = await response.text();
      } else {
        throw new Error("Failed to load menu template");
      }
    } catch (error) {
      console.error("Error loading trader actions menu template:", error);
      utils.showToast("Failed to load menu", "error");
      return;
    }
  }

  const menu = document.createElement("div");
  menu.className = "trader-actions-menu";
  // Replace TRADER_ADDRESS placeholder in the template with actual address
  menu.innerHTML = traderActionsMenuTemplate.replace("TRADER_ADDRESS", address);

  // Position the menu near the button
  const rect = button.getBoundingClientRect();
  menu.style.position = "fixed";
  menu.style.top = `${rect.bottom + 5}px`;
  menu.style.left = `${rect.left}px`;
  menu.style.zIndex = "1000";

  // Update copy button text based on current status
  const trader = watchedTraders.find((t) => t.address === address);
  const copyToggle = menu.querySelector(`#copy-toggle-${address}`);
  if (copyToggle && trader) {
    if (trader.copyStatus === "active") {
      copyToggle.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path fill="currentColor" d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>
        </svg>
        Stop Copying
      `;
    }
  }

  // Add event listeners for menu items
  menu.addEventListener("click", (e) => {
    const menuItem = (e.target as HTMLElement).closest(
      ".menu-item"
    ) as HTMLElement;
    if (!menuItem) return;

    const action = menuItem.getAttribute("data-action");
    switch (action) {
      case "config":
        showTraderConfig(address);
        break;
      case "positions":
        showTraderPositions(address);
        break;
      case "copy":
        toggleCopyStatus(address);
        break;
      case "remove":
        removeTraderFromWatchList(address);
        break;
    }

    menu.remove();
  });

  // Close menu when clicking outside
  const closeMenu = (e: MouseEvent) => {
    if (!menu.contains(e.target as Node)) {
      menu.remove();
      document.removeEventListener("click", closeMenu);
    }
  };

  document.addEventListener("click", closeMenu);
  document.body.appendChild(menu);
}

export async function addTraderToWatchList(address: string): Promise<void> {
  try {
    // Validate address format
    if (!address.startsWith("0x") || address.length !== 42) {
      utils.showToast("Invalid address format", "error");
      return;
    }

    // Check if already watching
    if (
      watchedTraders.some(
        (trader) => trader.address.toLowerCase() === address.toLowerCase()
      )
    ) {
      utils.showToast("Already watching this trader", "warning");
      return;
    }

    // Fetch trader data
    const response = await fetch(`/api/users/${address}`);
    if (!response.ok) {
      throw new Error("Trader not found");
    }

    const traderData = await response.json();
    const watchedTrader: WatchedTrader = {
      ...traderData,
      copyStatus: "inactive",
      watching: 0,
    };

    watchedTraders.push(watchedTrader);
    await updateWatchedTradersUI();
    utils.showToast(
      `Added ${address.slice(0, 6)}...${address.slice(-4)} to watch list`,
      "success"
    );
  } catch (error) {
    console.error("Error adding trader:", error);
    utils.showToast("Failed to add trader to watch list", "error");
  }
}

export async function toggleCopyStatus(address: string): Promise<void> {
  const trader = watchedTraders.find((t) => t.address === address);
  if (!trader) return;

  try {
    if (trader.copyStatus === "active") {
      // Stop copying
      trader.copyStatus = "inactive";
      utils.showToast(
        `Stopped copying ${address.slice(0, 6)}...${address.slice(-4)}`,
        "info"
      );
    } else {
      // Start copying
      if (!provider?.isConnected()) {
        utils.showToast("Please connect your wallet first", "warning");
        return;
      }
      trader.copyStatus = "active";
      utils.showToast(
        `Started copying ${address.slice(0, 6)}...${address.slice(-4)}`,
        "success"
      );
    }

    await updateWatchedTradersUI();
  } catch (error) {
    console.error("Error toggling copy status:", error);
    utils.showToast("Failed to update copy status", "error");
  }
}

export function removeTraderFromWatchList(address: string): void {
  const index = watchedTraders.findIndex(
    (trader) => trader.address === address
  );
  if (index !== -1) {
    watchedTraders.splice(index, 1);
    updateWatchedTradersUI();
    utils.showToast(`Removed trader from watch list`, "info");
  }
}

export function setupSelectAllCheckbox(): void {
  const selectAllCheckbox = document.getElementById(
    "selectAllTraders"
  ) as HTMLInputElement;
  const traderCheckboxes = document.querySelectorAll(
    ".trader-checkbox"
  ) as NodeListOf<HTMLInputElement>;

  if (!selectAllCheckbox) return;

  // Update the "Select All" checkbox state based on individual checkboxes
  const updateSelectAllState = () => {
    const allChecked = Array.from(traderCheckboxes).every(
      (checkbox) => checkbox.checked
    );
    const someChecked = Array.from(traderCheckboxes).some(
      (checkbox) => checkbox.checked
    );
    selectAllCheckbox.checked = allChecked;
    selectAllCheckbox.indeterminate = !allChecked && someChecked;
  };

  // Add event listener to "Select All" checkbox
  selectAllCheckbox.addEventListener("change", () => {
    handleTraderSelection();
  });

  // Add event listeners to individual checkboxes
  traderCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", updateSelectAllState);
  });

  // Initialize the state of the "Select All" checkbox
  updateSelectAllState();
}

export function handleTraderSelection(): void {
  const traderCheckboxes = document.querySelectorAll(
    ".trader-checkbox"
  ) as NodeListOf<HTMLInputElement>;

  const selectedTraders = Array.from(traderCheckboxes).map((checkbox) => ({
    address: checkbox.getAttribute("data-address") || "",
    checked: checkbox.checked,
  }));

  console.log("Selected traders:", selectedTraders);
}

export function showTraderConfig(address: string): void {
  // Implementation will be added later.
  console.log("Showing config for trader:", address);
}

export function showTraderPositions(address: string): void {
  const trader = watchedTraders.find((trader) =>
    address.includes(trader.address)
  );
  if (!trader) {
    utils.showToast("Trader not found in watch list", "error");
    return;
  }

  // Fetch trader's positions
  fetch(`/api/trader_positions?address=${address}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch trader positions");
      }
      return response.json();
    })
    .then((positions) => {
      // Update watched positions with the fetched data
      // This would need to be imported from positions module
      console.log("Trader positions:", positions);
      utils.showToast(
        `Loaded positions for ${address.slice(0, 6)}...${address.slice(-4)}`,
        "success"
      );
    })
    .catch((error) => {
      console.error("Error fetching trader positions:", error);
      utils.showToast("Failed to load trader positions", "error");
    });
}

// Export the watchedTraders for use in other modules if needed
export function getWatchedTraders(): WatchedTrader[] {
  return watchedTraders;
}
