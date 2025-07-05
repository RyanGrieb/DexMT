import { Alchemy, Network } from "alchemy-sdk";
import fs from "fs";
import { JSONParse, JSONStringify } from "json-with-bigint";
import path from "path";
import { decodeEventLog } from "viem";
import database from "../database";
import log from "./logs";

// GMX V2 Event Emitter - This is where trade events are emitted
const GMX_EVENT_EMITTER_ARB = "0xC8ee91A54287DB53897056e12D9819156D3822Fb";
//const GMX_READER_CONTRACT = "0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413";
const ARBITRUM_ETHERSCAN_CHAIN_ID = "42161";

async function getSelectedTraders(): Promise<string[]> {
  const selectedTraders = await database.getTraders({ selected: true });
  return selectedTraders.map((trader) => trader.address);
}

interface MirrorTradeParams {
  trader: string;
  event: string;
  args: any;
  txHash: string;
  blockNum: number;
}

async function mirrorTrade(params: MirrorTradeParams): Promise<void> {
  log.output(`Mirroring trade: ${params.event} by ${params.trader}`, "info");
  log.output(`Transaction: ${params.txHash}`, "info");
  log.output(`Block: ${params.blockNum}`, "info");
  log.output(`Args: ${JSONStringify(params.args)}`, "info");
}

/*
async function getGmxAbi(): Promise<any[]> {
  log.output(`Fetching GMX ABI from Arbiscan for address: ${GMX_EVENT_EMITTER_ARB}`, "info");

  // Use Arbitrum's specific Etherscan API
  const response = await fetch(
    `https://api.etherscan.io/api?module=contract&action=getabi&chainid=${ARBITRUM_ETHERSCAN_CHAIN_ID}&address=${GMX_EVENT_EMITTER_ARB}&apikey=${process.env.ETHERSCAN_API_KEY}`
  );

  const data = await response.json();

  log.output(`Etherscan API response status: ${data.status}`, "debug");
  log.output(`Etherscan API response message: ${data.message}`, "debug");

  if (data.status !== "1") {
    log.output(`Error fetching GMX ABI: ${data.message || "Unknown error"}`, "error");
    log.output(`Full response: ${JSONStringify(data)}`, "error");
    throw new Error(`Failed to fetch ABI: ${data.message || "Unknown error"}`);
  }

  log.output(`Successfully fetched GMX ABI from Arbiscan`, "info");
  return JSONParse(data.result);
}
  */

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

async function init() {
  log.output("Initializing GMX WebSocket listener...", "info");

  const settings = {
    apiKey: process.env.ALCHEMY_API_KEY!,
    network: Network.ARB_MAINNET,
  };

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
      const account = eventJson.args.eventData.addressItems?.items?.find((item: any) => item.key === "account")?.value;

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

      log.output(`Processing GMX event: ${eventName} for ${account}`, "info");
      log.output(`Decoded GMX event: ${JSONStringify(eventJson)}`, "debug");
    } catch (error) {
      log.output(`Error processing GMX event: ${error}`, "error");
      //log.output(`Raw log - Topics: ${JSON.stringify(logOutput.topics)}, Data: ${logOutput.data}`, "debug");
    }
  });

  log.output("GMX WebSocket listener initialized successfully", "info");
}

const websockets = {
  init,
};

export default websockets;
