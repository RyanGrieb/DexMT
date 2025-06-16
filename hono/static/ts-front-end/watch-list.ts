import { default as utils } from "./utils";
import { loadWatchedTraders } from "./watch-list/watched-traders";

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

export function showWatchList(): void {
  // Load watch list HTML
  fetch("/html/watch-list.html")
    .then((response) => response.text())
    .then((html) => {
      const indexContent = document.querySelector(".index-content");
      if (indexContent) {
        indexContent.innerHTML = html;
        loadWatchedTraders();
        // loadCopiedPositions()
        // loadOpenPositions()
      }
    })
    .catch((error) => {
      console.error("Error loading watch list HTML:", error);
      utils.showToast("Failed to load watch list", "error");
    });
}
