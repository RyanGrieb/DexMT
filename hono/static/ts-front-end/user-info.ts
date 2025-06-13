import { provider } from "./metamask";
import { User, updateUsersUI } from "./users";

let currentUser: User | null = null;
let currentPeriod: string = "today";
let isCopyingTrades = false;

export function showUserInfo(user: User): void {
  currentUser = user;

  // Load user info HTML
  fetch("/html/user-info.html")
    .then((response) => response.text())
    .then((html) => {
      const indexContent = document.querySelector(".index-content");
      if (indexContent) {
        indexContent.innerHTML = html;
        initializeUserInfo();
        populateUserData(user);
        loadUserPositions(user.address);
      }
    })
    .catch((error) => {
      console.error("Error loading user info:", error);
    });
}

function initializeUserInfo(): void {
  // Back button
  const backButton = document.getElementById("backToUsers");
  if (backButton) {
    backButton.addEventListener("click", () => {
      // Fetch and load the top traders HTML
      fetch("/html/top-traders.html")
        .then((response) => response.text())
        .then((html) => {
          const indexContent = document.querySelector(".index-content");
          if (indexContent) {
            indexContent.innerHTML = html;

            // Re-populate the users list
            updateUsersUI();

            // Update navigation button states
            const topTradersBtn = document.getElementById("topTradersBtn");
            const myCopiesBtn = document.getElementById("myCopiesBtn");
            if (topTradersBtn) topTradersBtn.classList.add("active");
            if (myCopiesBtn) myCopiesBtn.classList.remove("active");
          }
        })
        .catch((error) => {
          console.error("Error loading top traders HTML:", error);
        });
    });
  }

  // Copy trades button
  const copyTradesButton = document.getElementById("copyTradesButton");
  if (copyTradesButton) {
    copyTradesButton.addEventListener("click", async () => {
      // Ensure the wallet is connected
      if (!provider?.isConnected()) {
        alert("Wallet not connected. Please connect your wallet first.");
        return;
      }

      if (!currentUser) {
        alert("No user selected.");
        return;
      }

      // Toggle copy trading
      await toggleCopyTrades();
    });
  }

  // Time period tabs
  const timeTabs = document.querySelectorAll(".time-tab");
  timeTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs
      timeTabs.forEach((t) => t.classList.remove("active"));
      // Add active class to clicked tab
      tab.classList.add("active");

      const period = tab.getAttribute("data-period");
      if (period) {
        currentPeriod = period;
        updatePerformanceMetrics(period);
      }
    });
  });
}

async function toggleCopyTrades(): Promise<void> {
  if (!provider || !currentUser) return;

  const copyTradesButton = document.getElementById("copyTradesButton");
  if (!copyTradesButton) return;

  try {
    // Disable button during operation
    copyTradesButton.setAttribute("disabled", "true");
    copyTradesButton.textContent = "Processing...";

    if (isCopyingTrades) {
      // Stop copying trades
      await stopCopyingTrades();
    } else {
      // Start copying trades
      await startCopyingTrades();
    }
  } catch (error) {
    console.error("Error toggling copy trades:", error);
    alert("Failed to toggle copy trading. Please try again.");
  } finally {
    // Re-enable button
    copyTradesButton.removeAttribute("disabled");
  }
}

async function startCopyingTrades(): Promise<void> {
  if (!provider || !currentUser) return;

  try {
    // Create a message to sign
    const timestamp = Date.now();
    const message = `DEXMT Copy Trading Authorization
Trader: ${currentUser.address}
Timestamp: ${timestamp}
Action: START_COPY_TRADING

By signing this message, you authorize DEXMT to copy trades from the specified trader to your wallet.`;

    // Request signature from user
    const signature = (await provider.request({
      method: "personal_sign",
      params: [message, provider.selectedAddress],
    })) as string;

    // Send request to backend with signature
    const response = await fetch("/api/copy-trading/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        traderAddress: currentUser.address,
        copierAddress: provider.selectedAddress,
        message: message,
        signature: signature,
        timestamp: timestamp,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to start copy trading");
    }

    // Update UI state
    isCopyingTrades = true;
    updateCopyTradesButton(true);

    alert(
      `Successfully started copying trades from ${currentUser.address.slice(0, 6)}...${currentUser.address.slice(-4)}`
    );
  } catch (error) {
    console.error("Error starting copy trades:", error);
    if (error instanceof Error) {
      alert(`Failed to start copy trading: ${error.message}`);
    } else {
      alert("Failed to start copy trading. Please try again.");
    }
  }
}

async function stopCopyingTrades(): Promise<void> {
  if (!provider || !currentUser) return;

  try {
    // Create a message to sign
    const timestamp = Date.now();
    const message = `DEXMT Copy Trading Termination
Trader: ${currentUser.address}
Timestamp: ${timestamp}
Action: STOP_COPY_TRADING

By signing this message, you authorize DEXMT to stop copying trades from the specified trader.`;

    // Request signature from user
    const signature = (await provider.request({
      method: "personal_sign",
      params: [message, provider.selectedAddress],
    })) as string;

    // Send request to backend with signature
    const response = await fetch("/api/copy-trading/stop", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        traderAddress: currentUser.address,
        copierAddress: provider.selectedAddress,
        message: message,
        signature: signature,
        timestamp: timestamp,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to stop copy trading");
    }

    // Update UI state
    isCopyingTrades = false;
    updateCopyTradesButton(false);

    alert(
      `Successfully stopped copying trades from ${currentUser.address.slice(0, 6)}...${currentUser.address.slice(-4)}`
    );
  } catch (error) {
    console.error("Error stopping copy trades:", error);
    if (error instanceof Error) {
      alert(`Failed to stop copy trading: ${error.message}`);
    } else {
      alert("Failed to stop copy trading. Please try again.");
    }
  }
}

function updateCopyTradesButton(isActive: boolean): void {
  const copyTradesButton = document.getElementById("copyTradesButton");
  if (!copyTradesButton) return;

  if (isActive) {
    copyTradesButton.classList.add("active");
    copyTradesButton.innerHTML = `
      <svg
        slot="icon"
        xmlns="http://www.w3.org/2000/svg"
        height="20"
        viewBox="0 0 24 24"
        width="20"
      >
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
      </svg>
      Copying Trades
    `;
  } else {
    copyTradesButton.classList.remove("active");
    copyTradesButton.innerHTML = `
      <svg
        slot="icon"
        xmlns="http://www.w3.org/2000/svg"
        height="20"
        viewBox="0 0 24 24"
        width="20"
      >
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
      </svg>
      Copy Trades
    `;
  }
}

// Check copy trading status when user info loads
async function checkCopyTradingStatus(): Promise<void> {
  if (!provider || !currentUser) return;

  try {
    const response = await fetch(
      `/api/copy-trading/status?traderAddress=${currentUser.address}&copierAddress=${provider.selectedAddress}`
    );
    if (response.ok) {
      const result = await response.json();
      console.log("Copy trading status:", result);
      isCopyingTrades = result.isActive || false;
      updateCopyTradesButton(isCopyingTrades);
    }
  } catch (error) {
    console.error("Error checking copy trading status:", error);
  }
}

function populateUserData(user: User): void {
  // User avatar
  const userAvatar = document.getElementById("userAvatar");
  if (userAvatar) {
    const addressHash = user.address.slice(2, 4).toUpperCase();
    userAvatar.textContent = addressHash;
    userAvatar.style.background = `linear-gradient(135deg, #bb86fc, #03dac6)`;
  }

  // User address
  const userAddress = document.getElementById("userAddress");
  if (userAddress) {
    userAddress.textContent = user.address;
  }

  // Platform and rank
  const userPlatform = document.getElementById("userPlatform");
  if (userPlatform) {
    userPlatform.textContent = user.dex_platform || "Unknown Platform";
  }

  const userRank = document.getElementById("userRank");
  if (userRank) {
    userRank.textContent = `#${user.platform_ranking || "Unranked"}`;
  }

  // Load initial performance metrics
  updatePerformanceMetrics("today");

  // Check if we're already copying this user's trades
  checkCopyTradingStatus();
}

function updatePerformanceMetrics(period: string): void {
  // Mock data - replace with actual API calls later
  const mockData = {
    today: {
      pnl: 1250.5,
      pnlPercentage: 2.35,
      volume: 125000,
      avgSize: 5000,
      winRate: 65.5,
      totalTrades: 8,
    },
    yesterday: {
      pnl: -580.25,
      pnlPercentage: -1.12,
      volume: 89000,
      avgSize: 4800,
      winRate: 45.2,
      totalTrades: 12,
    },
    "7d": {
      pnl: 8950.75,
      pnlPercentage: 15.8,
      volume: 850000,
      avgSize: 5200,
      winRate: 58.3,
      totalTrades: 67,
    },
    "30d": {
      pnl: 25680.3,
      pnlPercentage: 45.2,
      volume: 3200000,
      avgSize: 4900,
      winRate: 62.1,
      totalTrades: 245,
    },
    year: {
      pnl: 156000.8,
      pnlPercentage: 312.5,
      volume: 15600000,
      avgSize: 5100,
      winRate: 59.8,
      totalTrades: 1204,
    },
    all: {
      pnl: 245000.5,
      pnlPercentage: 485.2,
      volume: 25000000,
      avgSize: 5050,
      winRate: 61.2,
      totalTrades: 1856,
    },
  };

  const data = mockData[period as keyof typeof mockData];
  if (!data) return;

  // Update PNL
  const pnlValue = document.getElementById("pnlValue");
  const pnlPercentage = document.getElementById("pnlPercentage");
  if (pnlValue && pnlPercentage) {
    const pnlClass = data.pnl >= 0 ? "positive" : "negative";
    const pnlSign = data.pnl >= 0 ? "+" : "";

    pnlValue.textContent = `${pnlSign}$${Math.abs(data.pnl).toLocaleString()}`;
    pnlValue.className = `metric-value pnl ${pnlClass}`;

    pnlPercentage.textContent = `${pnlSign}${data.pnlPercentage.toFixed(2)}%`;
    pnlPercentage.className = `metric-value pnl ${pnlClass}`;
  }

  // Update other metrics
  const volumeValue = document.getElementById("volumeValue");
  if (volumeValue) {
    volumeValue.textContent = `$${data.volume.toLocaleString()}`;
  }

  const avgSizeValue = document.getElementById("avgSizeValue");
  if (avgSizeValue) {
    avgSizeValue.textContent = `$${data.avgSize.toLocaleString()}`;
  }

  const winRateValue = document.getElementById("winRateValue");
  if (winRateValue) {
    winRateValue.textContent = `${data.winRate.toFixed(1)}%`;
  }

  const totalTradesValue = document.getElementById("totalTradesValue");
  if (totalTradesValue) {
    totalTradesValue.textContent = data.totalTrades.toString();
  }
}

function loadUserPositions(userAddress: string): void {
  // Mock positions data - replace with actual API call later
  const mockPositions = [
    {
      market: "ETH/USD",
      side: "LONG",
      leverage: "10.5x",
      size: "$12,500",
      netValue: "+$1,250",
      collateral: "$1,190",
      entryPrice: "$3,250.50",
      markPrice: "$3,352.80",
      liqPrice: "$2,890.25",
    },
    {
      market: "BTC/USD",
      side: "SHORT",
      leverage: "5.2x",
      size: "$8,750",
      netValue: "-$420",
      collateral: "$1,680",
      entryPrice: "$65,280.00",
      markPrice: "$64,850.50",
      liqPrice: "$78,350.00",
    },
  ];

  const positionsList = document.querySelector(".positions-list");
  if (!positionsList) return;

  const fragment = document.createDocumentFragment();

  if (mockPositions.length > 0) {
    mockPositions.forEach((position) => {
      const sideClass = position.side.toLowerCase();
      const netValueClass = position.netValue.startsWith("+")
        ? "positive"
        : "negative";

      const positionRow = document.createElement("tr");
      positionRow.className = "position-item";
      positionRow.innerHTML = `
        <td class="position-side ${sideClass}">
          ${position.side} ${position.market}
        </td>
        <td class="position-leverage">${position.leverage}</td>
        <td class="position-size">${position.size}</td>
        <td class="position-net-value ${netValueClass}">${position.netValue}</td>
        <td class="position-collateral">${position.collateral}</td>
        <td class="position-entry-price">${position.entryPrice}</td>
        <td class="position-mark-price">${position.markPrice}</td>
        <td class="position-liq-price">${position.liqPrice}</td>
      `;

      fragment.appendChild(positionRow);
    });
  } else {
    const emptyRow = document.createElement("tr");
    emptyRow.className = "position-item";
    emptyRow.innerHTML = `
      <td colspan="8" style="text-align:center;color:#666;padding:20px">
        No open positions
      </td>`;
    fragment.appendChild(emptyRow);
  }

  positionsList.replaceChildren(fragment);
}

export function abbreviateNumber(value: number): string {
  if (Math.abs(value) >= 1e6) {
    return (value / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (Math.abs(value) >= 1e3) {
    return (value / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return value.toString();
}
