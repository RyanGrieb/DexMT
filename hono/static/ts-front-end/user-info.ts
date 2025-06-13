import { User } from "./users";

let currentUser: User | null = null;
let currentPeriod: string = "today";

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
      // Reload the main view
      location.reload();
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
