import { provider } from "./metamask";
import { User } from "./users";
import { default as utils } from "./utils";

interface WatchedUser extends User {
  copyStatus: "active" | "inactive";
  watching: number;
}

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

interface CopyConfig {
  maxPositionSize: number;
  maxLeverage: number;
  riskPercentage: number;
  allowedTokens: string[];
  autoCopyEnabled: boolean;
  stopLossEnabled: boolean;
  stopLossPercent: number;
  takeProfitEnabled: boolean;
  takeProfitPercent: number;
}

let watchedUsers: WatchedUser[] = [];
let watchedPositions: WatchedPosition[] = [];
let copyConfig: CopyConfig = {
  maxPositionSize: 1000,
  maxLeverage: 5,
  riskPercentage: 2,
  allowedTokens: ["ETH", "BTC"],
  autoCopyEnabled: false,
  stopLossEnabled: false,
  stopLossPercent: 10,
  takeProfitEnabled: false,
  takeProfitPercent: 20,
};

// Add this variable at the top to cache the template
let watchedUserRowTemplate: string | null = null;

export function showWatchList(): void {
  // Load watch list HTML
  fetch("/html/watch-list.html")
    .then((response) => response.text())
    .then((html) => {
      const indexContent = document.querySelector(".index-content");
      if (indexContent) {
        indexContent.innerHTML = html;
        initializeWatchList();
        loadWatchedUsers();
        loadWatchedPositions();
        loadCopyConfiguration();
      }
    })
    .catch((error) => {
      console.error("Error loading watch list HTML:", error);
      utils.showToast("Failed to load watch list", "error");
    });
}

function initializeWatchList(): void {
  // Add trader button
  const addTraderBtn = document.getElementById("addTraderBtn");
  if (addTraderBtn) {
    addTraderBtn.addEventListener("click", showAddTraderDialog);
  }

  // Copy configuration checkboxes
  const stopLossCheckbox = document.getElementById(
    "stopLossEnabled"
  ) as HTMLInputElement;
  const takeProfitCheckbox = document.getElementById(
    "takeProfitEnabled"
  ) as HTMLInputElement;
  const stopLossInput = document.getElementById(
    "stopLossPercent"
  ) as HTMLInputElement;
  const takeProfitInput = document.getElementById(
    "takeProfitPercent"
  ) as HTMLInputElement;

  if (stopLossCheckbox && stopLossInput) {
    stopLossCheckbox.addEventListener("change", () => {
      stopLossInput.disabled = !stopLossCheckbox.checked;
    });
  }

  if (takeProfitCheckbox && takeProfitInput) {
    takeProfitCheckbox.addEventListener("change", () => {
      takeProfitInput.disabled = !takeProfitCheckbox.checked;
    });
  }

  // Save configuration button
  const saveConfigBtn = document.getElementById("saveConfigBtn");
  if (saveConfigBtn) {
    saveConfigBtn.addEventListener("click", saveCopyConfiguration);
  }

  // Reset configuration button
  const resetConfigBtn = document.getElementById("resetConfigBtn");
  if (resetConfigBtn) {
    resetConfigBtn.addEventListener("click", resetCopyConfiguration);
  }

  // Add token button
  const addTokenBtn = document.getElementById("addTokenBtn");
  if (addTokenBtn) {
    addTokenBtn.addEventListener("click", addCustomToken);
  }
}

function showAddTraderDialog(): void {
  const address = prompt("Enter trader address to watch:");
  if (address && address.trim()) {
    addTraderToWatchList(address.trim());
  }
}

async function addTraderToWatchList(address: string): Promise<void> {
  try {
    // Validate address format
    if (!address.startsWith("0x") || address.length !== 42) {
      utils.showToast("Invalid address format", "error");
      return;
    }

    // Check if already watching
    if (
      watchedUsers.some(
        (user) => user.address.toLowerCase() === address.toLowerCase()
      )
    ) {
      utils.showToast("Already watching this trader", "warning");
      return;
    }

    // Fetch user data
    const response = await fetch(`/api/users/${address}`);
    if (!response.ok) {
      throw new Error("Trader not found");
    }

    const userData = await response.json();
    const watchedUser: WatchedUser = {
      ...userData,
      copyStatus: "inactive",
      watching: true,
    };

    watchedUsers.push(watchedUser);
    updateWatchedUsersUI();
    utils.showToast(
      `Added ${address.slice(0, 6)}...${address.slice(-4)} to watch list`,
      "success"
    );
  } catch (error) {
    console.error("Error adding trader:", error);
    utils.showToast("Failed to add trader to watch list", "error");
  }
}

async function updateWatchedUsersUI(): Promise<void> {
  const watchedUsersList = document.querySelector(".watched-users-list");
  if (!watchedUsersList) return;

  const fragment = document.createDocumentFragment();

  if (watchedUsers.length > 0) {
    // Fetch template if not cached
    if (!watchedUserRowTemplate) {
      try {
        const response = await fetch("/html/watched-user-row.html");
        if (response.ok) {
          watchedUserRowTemplate = await response.text();
        } else {
          throw new Error("Failed to load template");
        }
      } catch (error) {
        console.error("Error loading watched user row template:", error);
        utils.showToast("Failed to load template", "error");
        return;
      }
    }

    watchedUsers.forEach((user, index) => {
      // Create a table to properly parse the tr element
      const tempTable = document.createElement("table");
      tempTable.innerHTML = `<tbody>${watchedUserRowTemplate}</tbody>`;
      const userRow = tempTable.querySelector(
        "tr.watched-user-item"
      ) as HTMLElement;

      if (userRow) {
        // Update elements based on their IDs
        const addressHash = user.address.slice(2, 4).toUpperCase();

        // Trader checkbox
        const traderCheckbox = userRow.querySelector(
          "#trader-checkbox"
        ) as HTMLInputElement;
        if (traderCheckbox) {
          traderCheckbox.setAttribute("data-address", user.address);
          traderCheckbox.removeAttribute("id");
        }

        // Rank
        const userRank = userRow.querySelector("#user-rank");
        if (userRank) {
          userRank.textContent = `#${user.platform_ranking || index + 1}`;
          userRank.removeAttribute("id");
        }

        // Platform
        const userPlatform = userRow.querySelector("#user-platform");
        if (userPlatform) {
          userPlatform.innerHTML = utils.getPlatformIcon(user.dex_platform);
          userPlatform.removeAttribute("id");
        }

        // Trader icon
        const traderIcon = userRow.querySelector("#trader-icon") as HTMLElement;
        if (traderIcon) {
          traderIcon.textContent = addressHash;
          traderIcon.style.background = utils.generateIconColor(user.address);
          traderIcon.removeAttribute("id");
        }

        // Trader address
        const traderAddress = userRow.querySelector("#trader-address");
        if (traderAddress) {
          traderAddress.textContent = `${user.address.slice(0, 6)}...${user.address.slice(-4)}`;
          traderAddress.removeAttribute("id");
        }

        // PNL
        const userPnl = userRow.querySelector("#user-pnl") as HTMLElement;
        if (userPnl) {
          const pnlValue = Number(user.pnlPercentage || 0);
          userPnl.textContent = `${pnlValue.toFixed(2)}%`;
          userPnl.className = `user-pnl ${pnlValue >= 0 ? "positive" : "negative"}`;
          userPnl.removeAttribute("id");
        }

        // Win Ratio
        const userWinRatio = userRow.querySelector("#user-winratio");
        if (userWinRatio) {
          const winRatioValue = Number(user.winRatio || 0);
          userWinRatio.textContent = winRatioValue.toFixed(2);
          userWinRatio.removeAttribute("id");
        }

        // Watching count
        const userWatching = userRow.querySelector("#user-watching");
        if (userWatching) {
          userWatching.textContent = (user.watching || 0).toString();
          userWatching.removeAttribute("id");
        }

        // Actions button
        const actionsBtn = userRow.querySelector("#actions-btn") as HTMLElement;
        if (actionsBtn) {
          actionsBtn.setAttribute("data-address", user.address);
          actionsBtn.removeAttribute("id");
        }

        // Add click event listener to select user (same as top-traders)
        userRow.addEventListener("click", (e) => {
          // Don't trigger selection if clicking on checkbox
          if (!(e.target as HTMLElement).closest(".trader-checkbox")) {
            console.log("User row clicked:", user.address);
            //selectUser(user);
          }
        });

        // Add event listener for checkbox
        if (traderCheckbox) {
          traderCheckbox.addEventListener("change", (e) => {
            e.stopPropagation(); // Prevent row click
            handleTraderSelection(
              user.address,
              (e.target as HTMLInputElement).checked
            );
          });
        }

        // Add event listener for actions button
        if (actionsBtn) {
          actionsBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent row click
            showTraderActionsMenu(user.address, e.target as HTMLElement);
          });
        }

        fragment.appendChild(userRow);
      }
    });
  } else {
    const emptyRow = document.createElement("tr");
    emptyRow.className = "watched-user-item";
    emptyRow.innerHTML = `
      <td colspan="7" style="text-align:center;color:#666;padding:20px">
        No traders in watch list. Click "Add Trader" to start watching.
      </td>
    `;
    fragment.appendChild(emptyRow);
  }

  watchedUsersList.replaceChildren(fragment);
  setupSelectAllCheckbox();
}

function showTraderActionsMenu(address: string, button: HTMLElement): void {
  // Create a simple context menu for trader actions
  const existingMenu = document.querySelector(".trader-actions-menu");
  if (existingMenu) {
    existingMenu.remove();
  }

  const menu = document.createElement("div");
  menu.className = "trader-actions-menu";
  menu.innerHTML = `
    <div class="menu-item" data-action="config">
      <svg width="16" height="16" viewBox="0 0 24 24">
        <path fill="currentColor" d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
      </svg>
      Configure
    </div>
    <div class="menu-item" data-action="positions">
      <svg width="16" height="16" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z"/>
      </svg>
      View Positions
    </div>
    <div class="menu-item" data-action="copy" id="copy-toggle-${address}">
      <svg width="16" height="16" viewBox="0 0 24 24">
        <path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
      </svg>
      Start Copying
    </div>
    <div class="menu-item menu-item-danger" data-action="remove">
      <svg width="16" height="16" viewBox="0 0 24 24">
        <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
      </svg>
      Remove from List
    </div>
  `;

  // Position the menu near the button
  const rect = button.getBoundingClientRect();
  menu.style.position = "fixed";
  menu.style.top = `${rect.bottom + 5}px`;
  menu.style.left = `${rect.left}px`;
  menu.style.zIndex = "1000";

  // Update copy button text based on current status
  const user = watchedUsers.find((u) => u.address === address);
  const copyToggle = menu.querySelector(`#copy-toggle-${address}`);
  if (copyToggle && user) {
    if (user.copyStatus === "active") {
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

async function toggleCopyStatus(address: string): Promise<void> {
  const user = watchedUsers.find((u) => u.address === address);
  if (!user) return;

  try {
    if (user.copyStatus === "active") {
      // Stop copying
      user.copyStatus = "inactive";
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
      user.copyStatus = "active";
      utils.showToast(
        `Started copying ${address.slice(0, 6)}...${address.slice(-4)}`,
        "success"
      );
    }

    updateWatchedUsersUI();
  } catch (error) {
    console.error("Error toggling copy status:", error);
    utils.showToast("Failed to update copy status", "error");
  }
}

function removeTraderFromWatchList(address: string): void {
  const index = watchedUsers.findIndex((user) => user.address === address);
  if (index !== -1) {
    watchedUsers.splice(index, 1);
    updateWatchedUsersUI();
    utils.showToast(`Removed trader from watch list`, "info");
  }
}

async function loadWatchedUsers(): Promise<void> {
  const walletAddress = provider?.selectedAddress;
  if (!walletAddress) {
    utils.showToast("Please connect your wallet first", "warning");
    return;
  }

  try {
    const response = await fetch(
      `/api/watched_traders?walletAddress=${walletAddress}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch watched traders");
    }

    // parse the JSON once
    const payload = (await response.json()) as {
      copier_addr: string;
      traders: Array<WatchedUser>;
    };
    console.log("watched_traders payload:", payload);

    if (!payload || !Array.isArray(payload.traders)) {
      utils.showToast("No watched traders found", "info");
      return;
    }

    // Clear existing watched users
    watchedUsers = [];
    // Fetch user details for each watched trader
    for (const trader of payload.traders) {
      const traderAddress = trader.address;

      watchedUsers.push({
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
      } as WatchedUser);
    }
    updateWatchedUsersUI();
  } catch (error) {
    console.error("Error loading watched traders:", error);
    utils.showToast("Failed to load watched traders", "error");
  }
}

function updateWatchedPositionsUI(): void {
  const watchedPositionsList = document.querySelector(
    ".watched-positions-list"
  );
  if (!watchedPositionsList) return;

  const fragment = document.createDocumentFragment();

  if (watchedPositions.length > 0) {
    watchedPositions.forEach((position) => {
      const sideClass = position.side.toLowerCase();
      const pnlClass = position.pnl.startsWith("+") ? "positive" : "negative";

      const positionRow = document.createElement("tr");
      positionRow.className = "watched-position-item";
      positionRow.innerHTML = `
        <td class="trader-info">
          ${position.traderName}
        </td>
        <td>
          <md-chip class="position-side-chip ${sideClass}">
            ${position.side}
          </md-chip>
          ${position.market}
        </td>
        <td>${position.size}</td>
        <td class="position-pnl ${pnlClass}">${position.pnl}</td>
        <td>${position.entryPrice}</td>
        <td>${position.currentPrice}</td>
        <td>
          <md-filled-button class="copy-position-btn" data-position-id="${position.id}">
            Copy
          </md-filled-button>
        </td>
      `;

      // Add copy position event listener
      const copyBtn = positionRow.querySelector(".copy-position-btn");
      if (copyBtn) {
        copyBtn.addEventListener("click", () => copyPosition(position.id));
      }

      fragment.appendChild(positionRow);
    });
  } else {
    const emptyRow = document.createElement("tr");
    emptyRow.className = "watched-position-item";
    emptyRow.innerHTML = `
      <td colspan="7" style="text-align:center;color:#666;padding:20px">
        No open positions from watched traders
      </td>
    `;
    fragment.appendChild(emptyRow);
  }

  watchedPositionsList.replaceChildren(fragment);
}

function loadWatchedPositions(): void {
  // Mock data - replace with actual API call
  const mockPositions: WatchedPosition[] = [
    {
      id: "pos1",
      traderAddress: "0x1234567890123456789012345678901234567890",
      traderName: "1234...7890",
      market: "ETH/USD",
      side: "LONG",
      size: "$15,000",
      pnl: "+$2,250",
      entryPrice: "$3,180.50",
      currentPrice: "$3,330.25",
      leverage: "8x",
      timestamp: new Date().toISOString(),
    },
    {
      id: "pos2",
      traderAddress: "0x1234567890123456789012345678901234567890",
      traderName: "1234...7890",
      market: "BTC/USD",
      side: "SHORT",
      size: "$8,500",
      pnl: "-$340",
      entryPrice: "$66,500.00",
      currentPrice: "$67,200.50",
      leverage: "5x",
      timestamp: new Date().toISOString(),
    },
  ];

  watchedPositions = mockPositions;
  updateWatchedPositionsUI();
}

async function copyPosition(positionId: string): Promise<void> {
  if (!provider?.isConnected()) {
    utils.showToast("Please connect your wallet first", "warning");
    return;
  }

  const position = watchedPositions.find((p) => p.id === positionId);
  if (!position) return;

  try {
    // Here you would implement the actual position copying logic
    utils.showToast(
      `Copying ${position.market} ${position.side} position...`,
      "info"
    );

    // Mock API call for copying position
    // await copyTraderPosition(position);

    utils.showToast(
      `Successfully copied ${position.market} position`,
      "success"
    );
  } catch (error) {
    console.error("Error copying position:", error);
    utils.showToast("Failed to copy position", "error");
  }
}

function loadCopyConfiguration(): void {
  // Load saved configuration from localStorage or API
  const savedConfig = localStorage.getItem("copyConfig");
  if (savedConfig) {
    copyConfig = JSON.parse(savedConfig);
  }

  // Update UI with current configuration
  updateConfigurationUI();
}

function updateConfigurationUI(): void {
  const maxPositionSize = document.getElementById(
    "maxPositionSize"
  ) as HTMLInputElement;
  const maxLeverage = document.getElementById(
    "maxLeverage"
  ) as HTMLInputElement;
  const riskPercentage = document.getElementById(
    "riskPercentage"
  ) as HTMLInputElement;
  const autoCopyEnabled = document.getElementById(
    "autoCopyEnabled"
  ) as HTMLInputElement;
  const stopLossEnabled = document.getElementById(
    "stopLossEnabled"
  ) as HTMLInputElement;
  const stopLossPercent = document.getElementById(
    "stopLossPercent"
  ) as HTMLInputElement;
  const takeProfitEnabled = document.getElementById(
    "takeProfitEnabled"
  ) as HTMLInputElement;
  const takeProfitPercent = document.getElementById(
    "takeProfitPercent"
  ) as HTMLInputElement;

  if (maxPositionSize)
    maxPositionSize.value = copyConfig.maxPositionSize.toString();
  if (maxLeverage) maxLeverage.value = copyConfig.maxLeverage.toString();
  if (riskPercentage)
    riskPercentage.value = copyConfig.riskPercentage.toString();
  if (autoCopyEnabled) autoCopyEnabled.checked = copyConfig.autoCopyEnabled;
  if (stopLossEnabled) stopLossEnabled.checked = copyConfig.stopLossEnabled;
  if (stopLossPercent) {
    stopLossPercent.value = copyConfig.stopLossPercent.toString();
    stopLossPercent.disabled = !copyConfig.stopLossEnabled;
  }
  if (takeProfitEnabled)
    takeProfitEnabled.checked = copyConfig.takeProfitEnabled;
  if (takeProfitPercent) {
    takeProfitPercent.value = copyConfig.takeProfitPercent.toString();
    takeProfitPercent.disabled = !copyConfig.takeProfitEnabled;
  }

  // Update token chips
  updateTokenChips();
}

function updateTokenChips(): void {
  const tokenChips = ["ethChip", "btcChip", "solChip", "avaxChip", "arbChip"];
  const tokenMap: { [key: string]: string } = {
    ethChip: "ETH",
    btcChip: "BTC",
    solChip: "SOL",
    avaxChip: "AVAX",
    arbChip: "ARB",
  };

  tokenChips.forEach((chipId) => {
    const chip = document.getElementById(chipId) as any;
    if (chip && tokenMap[chipId]) {
      chip.selected = copyConfig.allowedTokens.includes(tokenMap[chipId]);
      chip.addEventListener("click", () => toggleTokenFilter(tokenMap[chipId]));
    }
  });
}

function toggleTokenFilter(token: string): void {
  const index = copyConfig.allowedTokens.indexOf(token);
  if (index > -1) {
    copyConfig.allowedTokens.splice(index, 1);
  } else {
    copyConfig.allowedTokens.push(token);
  }
}

function addCustomToken(): void {
  const customTokenInput = document.getElementById(
    "customToken"
  ) as HTMLInputElement;
  if (!customTokenInput) return;

  const token = customTokenInput.value.trim().toUpperCase();
  if (token && !copyConfig.allowedTokens.includes(token)) {
    copyConfig.allowedTokens.push(token);
    customTokenInput.value = "";
    utils.showToast(`Added ${token} to allowed tokens`, "success");
  }
}

function saveCopyConfiguration(): void {
  try {
    // Gather all configuration values
    const maxPositionSize = (
      document.getElementById("maxPositionSize") as HTMLInputElement
    )?.value;
    const maxLeverage = (
      document.getElementById("maxLeverage") as HTMLInputElement
    )?.value;
    const riskPercentage = (
      document.getElementById("riskPercentage") as HTMLInputElement
    )?.value;
    const autoCopyEnabled = (
      document.getElementById("autoCopyEnabled") as HTMLInputElement
    )?.checked;
    const stopLossEnabled = (
      document.getElementById("stopLossEnabled") as HTMLInputElement
    )?.checked;
    const stopLossPercent = (
      document.getElementById("stopLossPercent") as HTMLInputElement
    )?.value;
    const takeProfitEnabled = (
      document.getElementById("takeProfitEnabled") as HTMLInputElement
    )?.checked;
    const takeProfitPercent = (
      document.getElementById("takeProfitPercent") as HTMLInputElement
    )?.value;

    copyConfig = {
      ...copyConfig,
      maxPositionSize: Number(maxPositionSize) || 1000,
      maxLeverage: Number(maxLeverage) || 5,
      riskPercentage: Number(riskPercentage) || 2,
      autoCopyEnabled: autoCopyEnabled || false,
      stopLossEnabled: stopLossEnabled || false,
      stopLossPercent: Number(stopLossPercent) || 10,
      takeProfitEnabled: takeProfitEnabled || false,
      takeProfitPercent: Number(takeProfitPercent) || 20,
    };

    // Save to localStorage
    localStorage.setItem("copyConfig", JSON.stringify(copyConfig));

    utils.showToast("Configuration saved successfully", "success");
  } catch (error) {
    console.error("Error saving configuration:", error);
    utils.showToast("Failed to save configuration", "error");
  }
}

function resetCopyConfiguration(): void {
  copyConfig = {
    maxPositionSize: 1000,
    maxLeverage: 5,
    riskPercentage: 2,
    allowedTokens: ["ETH", "BTC"],
    autoCopyEnabled: false,
    stopLossEnabled: false,
    stopLossPercent: 10,
    takeProfitEnabled: false,
    takeProfitPercent: 20,
  };

  updateConfigurationUI();
  utils.showToast("Configuration reset to defaults", "info");
}

// Refresh positions every 30 seconds
setInterval(() => {
  if (document.querySelector(".watched-positions-list")) {
    loadWatchedPositions();
  }
}, 30000);
function showTraderConfig(address: string): void {
  // Implementation will be added later.
}
function setupSelectAllCheckbox(): void {
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
    const isChecked = selectAllCheckbox.checked;
    traderCheckboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
      const address = checkbox.getAttribute("data-address");
      if (address) {
        handleTraderSelection(address, isChecked);
      }
    });
  });

  // Add event listeners to individual checkboxes
  traderCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", updateSelectAllState);
  });

  // Initialize the state of the "Select All" checkbox
  updateSelectAllState();
}
function showTraderPositions(address: string): void {
  const trader = watchedUsers.find((user) => user.address === address);
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
    .then((positions: WatchedPosition[]) => {
      // Update watched positions with the fetched data
      watchedPositions = positions.map((position) => ({
        ...position,
        traderName: `${address.slice(0, 6)}...${address.slice(-4)}`,
      }));

      // Update the UI to display the positions
      updateWatchedPositionsUI();
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
function handleTraderSelection(address: string, checked: boolean): void {
  const trader = watchedUsers.find((user) => user.address === address);
  if (!trader) {
    console.warn(`Trader with address ${address} not found in watch list.`);
    return;
  }

  if (checked) {
    trader.watching += 1;
  } else {
    trader.watching = Math.max(0, trader.watching - 1);
  }

  console.log(
    `Trader ${address} selection updated. Watching count: ${trader.watching}`
  );
}
