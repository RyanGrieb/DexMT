import { Alchemy, Network } from "alchemy-sdk";
import fs from "fs";
import { JSONParse, JSONStringify } from "json-with-bigint";
import path from "path";
import { decodeEventLog } from "viem";
import database from "../database/database";
import { DEXTradeAction } from "../types/trader";
import log from "./logs";

// GMX V2 Event Emitter - This is where trade events are emitted
const GMX_EVENT_EMITTER_ARB = "0xC8ee91A54287DB53897056e12D9819156D3822Fb";

async function getSelectedTraders(): Promise<string[]> {
  const selectedTraders = await database.getTraders({ selected: true });
  return selectedTraders.map((trader) => trader.address);
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
    log.output(`Error loading GMX ABI from local file: ${error}`, "error");
    throw new Error(`Failed to load ABI from local file: ${error}`);
  }
}

function getDEXTradeActionFromGMXEvent(event: any): DEXTradeAction | null {
  return null;
}

async function listenForGMXEvents() {
  log.output("Listening for GMX events...", "info");

  const settings = {
    apiKey: process.env.ALCHEMY_API_KEY!,
    network: Network.ARB_MAINNET,
  };

  const selectedTraders = await getSelectedTraders();
  const alchemy = new Alchemy(settings);

  // Fetch GMX ABI for decoding events
  const gmxAbi = getGmxAbi();

  // Get selected traders from database
  //const selectedTraders = await getSelectedTraders();
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

      // Filter for trade-relevant events only
      const tradeRelevantEvents = [
        "PositionIncrease",
        "PositionDecrease",
        "OrderCreated",
        "OrderUpdated",
        //"OrderExecuted",
        "OrderCancelled",
        "OrderFrozen",
        //"SwapInfo",
      ];

      if (!tradeRelevantEvents.includes(eventName)) {
        //log.output(`Ignoring non-trade event: ${eventName}`, "debug");
        return;
      }

      log.output(`Processing GMX event: ${eventName} for ${accountAddr}`, "info");
      log.output(`Decoded GMX event: ${JSONStringify(eventJson)}`, "debug");

      if (!selectedTraders.includes(accountAddr)) {
        //log.output(`Skipping event for unselected trader: ${accountAddr}`, "debug");
        return;
      }

      // Obtain the trade action for the selected trader
      const tradeAction = getDEXTradeActionFromGMXEvent(eventJson);

      if (!tradeAction) {
        log.output(`No trade action found for event: ${eventName}`, "debug");
        return;
      }

      // Save the trade action to the database
      await database.insertTrades([tradeAction]);
    } catch (error) {
      log.output(`Error processing GMX event: ${error}`, "error");
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
