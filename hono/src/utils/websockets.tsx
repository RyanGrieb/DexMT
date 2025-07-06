import { Alchemy, Network } from "alchemy-sdk";
import fs from "fs";
import { JSONParse, JSONStringify } from "json-with-bigint";
import path from "path";
import { decodeEventLog } from "viem";
import database from "../database/database";
import gmxSdk from "../gmxsdk";
import { DEXOrderType, DEXTradeAction } from "../types/trader";
import log from "./logs";

// GMX V2 Event Emitter - This is where trade events are emitted
const GMX_EVENT_EMITTER_ARB = "0xC8ee91A54287DB53897056e12D9819156D3822Fb";

// FIXME: This is a temporary cache to avoid hitting the database too often
// It should be replaced with a more robust caching solution in the future
let selectedTradersCache: string[] = [];
let cacheTimestamp: number = 0;
const CACHE_DURATION_MS = 30 * 1000; // 10 seconds

async function getSelectedTraders(): Promise<string[]> {
  const now = Date.now();

  // Check if cache is still valid
  if (selectedTradersCache.length > 0 && now - cacheTimestamp < CACHE_DURATION_MS) {
    return selectedTradersCache;
  }

  // Cache is expired or empty, fetch fresh data
  const selectedTraders = await database.getTraders({ selected: true });
  selectedTradersCache = selectedTraders.map((trader) => trader.address);
  cacheTimestamp = now;

  log.output(`Refreshed selected traders cache: ${selectedTradersCache.length} traders`, "info");

  return selectedTradersCache;
}

function getGmxAbi() {
  log.output("Loading GMX Event Emitter ABI from local file...", "info");

  try {
    const abiPath = path.join(process.cwd(), "src", "abis", "event-emitter.json");
    const abiData = fs.readFileSync(abiPath, "utf8");
    const abi = JSONParse(abiData);

    log.output(`Successfully loaded GMX ABI`, "info");
    return abi;
  } catch (error) {
    log.throwError(error);
  }
}

async function getDEXTradeActionFromGMXEvent(event: any): Promise<DEXTradeAction> {
  const eventName = event.args.eventName as string;
  const eventData = event.args.eventData;

  // Helper function to get value from event items
  const getAddressItem = (key: string): string => {
    return eventData.addressItems.items.find((item: any) => item.key === key)?.value || "";
  };

  const getUintItem = (key: string): bigint => {
    return BigInt(eventData.uintItems.items.find((item: any) => item.key === key)?.value || 0);
  };

  const getIntItem = (key: string): bigint => {
    return BigInt(eventData.intItems.items.find((item: any) => item.key === key)?.value || 0);
  };

  const getBoolItem = (key: string): boolean => {
    return eventData.boolItems.items.find((item: any) => item.key === key)?.value || false;
  };

  const getBytes32Item = (key: string): string => {
    return eventData.bytes32Items.items.find((item: any) => item.key === key)?.value || "";
  };

  // Extract common fields
  const account = getAddressItem("account");
  const marketAddress = getAddressItem("market");
  const collateralToken = getAddressItem("collateralToken");
  const isLong = getBoolItem("isLong");
  const orderType = Number(getUintItem("orderType"));
  const executionPrice = Number(getUintItem("executionPrice")) / 1e30; // FIXME: This is wrong.

  // Size and collateral calculations
  const sizeInUsd = Number(getUintItem("sizeInUsd")) / 1e30;
  const sizeDeltaUsd = Number(getUintItem("sizeDeltaUsd")) / 1e30;
  const collateralAmount = Number(getUintItem("collateralAmount")) / 1e6; // USDC has 6 decimals
  const collateralDeltaAmount = Number(getIntItem("collateralDeltaAmount")) / 1e6;

  // Calculate PnL for decrease events
  let rpnl = 0;
  if (eventName === "PositionDecrease") {
    const basePnlUsd = Number(getIntItem("basePnlUsd")) / 1e30;
    rpnl = basePnlUsd;
  }

  // Get timestamp
  let timestamp = Date.now();
  if (eventName === "PositionIncrease") {
    timestamp = Number(getUintItem("increasedAtTime")) * 1000;
  } else if (eventName === "PositionDecrease") {
    timestamp = Number(getUintItem("decreasedAtTime")) * 1000;
  }

  // Generate unique ID using order key if available, otherwise use timestamp and account
  const orderKey = getBytes32Item("orderKey");
  const tradeId = orderKey || `${account}_${marketAddress}_${timestamp}`;

  // Determine actual size and collateral based on event type
  let actualSizeUsd = sizeDeltaUsd;
  let actualCollateralUsd = Math.abs(collateralDeltaAmount);

  // For position increases, if sizeDeltaUsd is 0, this might be a collateral-only adjustment
  if (eventName === "PositionIncrease" && sizeDeltaUsd === 0) {
    actualSizeUsd = 0;
    actualCollateralUsd = collateralDeltaAmount;
  }

  // TODO: We need to get market info to populate these fields properly
  // For now, we'll use placeholder values that should be filled by the calling function
  const marketName = await gmxSdk.getMarketName(marketAddress);
  const tokenName = marketName ? marketName.split("/")[0] : "";
  const longTokenAddress = ""; // This should be fetched from market info
  const shortTokenAddress = ""; // This should be fetched from market info

  const tradeAction: DEXTradeAction = {
    id: tradeId,
    eventName: eventName,
    isFake: false,
    orderType: orderType as DEXOrderType,
    traderAddr: account,
    marketAddress: marketAddress,
    longTokenAddress: longTokenAddress,
    shortTokenAddress: shortTokenAddress,
    isLong: isLong,
    marketName: marketName || "Unknown Market",
    tokenName: tokenName || "Unknown Token",
    sizeUsd: actualSizeUsd,
    priceUsd: executionPrice,
    initialCollateralUsd: actualCollateralUsd,
    sizeDeltaUsd: sizeDeltaUsd,
    rpnl: rpnl,
    timestamp: timestamp,
  };

  return tradeAction;
}

async function listenForGMXEvents() {
  log.output("Listening for GMX events...", "info");

  const settings = {
    apiKey: process.env.ALCHEMY_API_KEY!,
    network: Network.ARB_MAINNET,
  };

  const alchemy = new Alchemy(settings);

  // Fetch GMX ABI for decoding events
  const gmxAbi = getGmxAbi();

  // Get selected traders from database
  //log.output(`Monitoring ${selectedTraders.length} selected traders`, "info");

  // Listen to all events from the GMX Event Emitter
  const eventFilter = {
    address: GMX_EVENT_EMITTER_ARB,
  };

  alchemy.ws.on(eventFilter, async (logOutput) => {
    try {
      // Decode the event using viem
      const decodedLog = decodeEventLog({
        abi: gmxAbi,
        data: logOutput.data as `0x${string}`,
        topics: logOutput.topics as [`0x${string}`, ...`0x${string}`[]],
      });

      if (!decodedLog) {
        log.output(`Could not parse log: ${logOutput.transactionHash}`, "debug");
        return;
      }

      const eventJson = JSONParse(JSONStringify(decodedLog));

      const eventName = eventJson.args.eventName as string;
      const accountAddr = eventJson.args.eventData.addressItems?.items?.find(
        (item: any) => item.key === "account"
      )?.value;

      // TODO: Handle orders (if needed? well see...)
      // Filter for trade-relevant events only
      const tradeRelevantEvents = [
        "PositionIncrease",
        "PositionDecrease",
        //"OrderCreated",
        //"OrderUpdated",
        //"OrderExecuted",
        //"OrderCancelled",
        //"OrderFrozen",
        //"SwapInfo",
      ];

      // TODO: Account for failed market increase/decrease events (if needed?...)

      if (!tradeRelevantEvents.includes(eventName)) {
        //log.output(`Ignoring non-trade event: ${eventName}`, "debug");
        return;
      }

      //log.output(`Processing GMX event: ${eventName} for ${accountAddr}`, "info");
      //log.output(`Decoded GMX event: ${JSONStringify(eventJson)}`, "debug");

      // initialCollateralUsd <= 0 tells us if the position is being opened or closed
      // PositionDecrease & initialCollateralUsd <= 0 indicates a position closing
      // PositionIncrease & initialCollateralUsd <= 0 indicates a position opening
      const tradeAction: DEXTradeAction = await getDEXTradeActionFromGMXEvent(eventJson);

      log.output(`\nTrade action created: ${JSONStringify(tradeAction)}\n`, "debug");
      log.output(`Decoded GMX event: ${JSONStringify(eventJson)}`, "debug");

      const selectedTraders = await getSelectedTraders();
      const followingTraders = await database.getTradersFollowing(accountAddr);

      if (!selectedTraders.includes(accountAddr)) {
        //log.output(`Skipping event for unselected trader: ${accountAddr}`, "debug");
        return;
      }

      // Obtain the trade action for the selected trader
      //const tradeAction: DEXTradeAction = getDEXTradeActionFromGMXEvent(eventJson);

      if (!tradeAction) {
        log.output(`No trade action found for event: ${eventName}`, "debug");
        return;
      }

      // Save the trade action to the database
      await database.insertTrades([tradeAction]);

      for (const trader of followingTraders) {
        // Create a mirrored trade action for each trader following the account
        const mirroredTradeAction: DEXTradeAction = {
          ...tradeAction,
          id: `${tradeAction.id}-mirror-${trader.address}`, // Ensure unique ID for mirrored trades
          traderAddr: trader.address, // Change the trader address to the mirroring trader
          mirroredTraderAddr: accountAddr, // Keep the original trader as the mirrored trader
        };

        // Insert the mirrored trade action into the database
        await database.insertTrades([mirroredTradeAction]);
        trader.mirrorTrade(tradeAction);
      }
    } catch (error) {
      log.output(`Error processing GMX event: ${error}`, "error");
      log.error(error);
      //log.output(`Raw log - Topics: ${JSON.stringify(logOutput.topics)}, Data: ${logOutput.data}`, "debug");
    }
  });
}

async function init() {
  log.output("Initializing GMX WebSocket listener...", "info");

  await listenForGMXEvents();

  log.output("GMX WebSocket listener initialized successfully", "info");
}

const websockets = {
  init,
};

export default websockets;
