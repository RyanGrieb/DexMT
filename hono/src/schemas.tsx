import { ethers } from "ethers";
import { z } from "zod";
import wallet from "./api/wallet";
import utils from "./utils";

function defineValidWalletAddr() {
  return z.string().refine(
    (addr) => {
      if (!utils.isValidAddress(addr)) {
        return false;
      }
      addr = ethers.getAddress(addr); // Ensure addresses have the proper uppercase format
      return true;
    },
    {
      message: "Invalid wallet address format",
    }
  );
}

function isValidWalletSignature(message: string, signature: string, walletAddr: string): boolean {
  return wallet.verifySignature(message, signature, walletAddr);
}

const selectTrader = z
  .object({
    walletAddr: defineValidWalletAddr(),
    traderAddr: defineValidWalletAddr(),
    signature: z.string(),
    message: z.string(),
    timestamp: z
      .number()
      .refine((ts) => utils.validateTimestamp(ts).isValid, {
        message: "Invalid timestamp format",
      })
      .transform((ts) => BigInt(ts)),
    selected: z.boolean(),
  })
  .refine(
    (data) => {
      // Validate the message format using all fields
      const { selected, traderAddr, walletAddr, timestamp, message } = data;
      const action = selected ? "Selected" : "Unselected";
      const expectedMessage = `${action} trader ${traderAddr} for ${walletAddr} at ${timestamp}`;
      return message === expectedMessage;
    },
    {
      message: "Message format does not match expected pattern",
      path: ["message"], // This will attach the error to the message field
    }
  )
  .refine((data) => isValidWalletSignature(data.message, data.signature, data.walletAddr), {
    message: "Invalid wallet signature",
    path: ["signature"],
  });

const favoriteTrader = z
  .object({
    walletAddr: defineValidWalletAddr(),
    traderAddr: defineValidWalletAddr(),
    signature: z.string(),
    message: z.string(),
    timestamp: z
      .number()
      .refine((ts) => utils.validateTimestamp(ts).isValid, {
        message: "Invalid timestamp format",
      })
      .transform((ts) => BigInt(ts)),
    favorite: z.boolean(),
  })
  .refine(
    (data) => {
      // Validate the message format using all fields
      const { favorite, traderAddr, walletAddr, timestamp, message } = data;
      const action = favorite ? "Favorite" : "Unfavorite";
      const expectedMessage = `${action} trader ${traderAddr} for ${walletAddr} at ${timestamp}`;
      return message === expectedMessage;
    },
    {
      message: "Message format does not match expected pattern",
      path: ["message"], // This will attach the error to the message field
    }
  )
  .refine((data) => isValidWalletSignature(data.message, data.signature, data.walletAddr), {
    message: "Invalid wallet signature",
    path: ["signature"],
  });

const schemas = {
  favoriteTrader,
};

export default schemas;
