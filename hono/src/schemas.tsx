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

function defineValidTimestamp() {
  return z
    .number()
    .refine((ts) => utils.validateTimestamp(ts).isValid, {
      message: "Invalid timestamp format",
    })
    .transform((ts) => BigInt(ts));
}

function refineWalletSignature() {
  return (data: { message: string; signature: string; walletAddr: string }) =>
    wallet.verifySignature(data.message, data.signature, data.walletAddr);
}

const walletSignatureRefinement = {
  refine: refineWalletSignature(),
  message: "Invalid wallet signature",
  path: ["signature"],
};

const selectTrader = z
  .object({
    walletAddr: defineValidWalletAddr(),
    traderAddr: defineValidWalletAddr(),
    signature: z.string(),
    message: z.string(),
    timestamp: defineValidTimestamp(),
    selected: z.boolean(),
  })
  .refine(
    (data) => {
      const { selected, traderAddr, walletAddr, timestamp, message } = data;
      const action = selected ? "Selected" : "Unselected";
      const expectedMessage = `${action} trader ${traderAddr} for ${walletAddr} at ${timestamp}`;
      return message === expectedMessage;
    },
    {
      message: "Message format does not match expected pattern",
      path: ["message"],
    }
  )
  .refine(walletSignatureRefinement.refine, walletSignatureRefinement);

const favoriteTrader = z
  .object({
    walletAddr: defineValidWalletAddr(),
    traderAddr: defineValidWalletAddr(),
    signature: z.string(),
    message: z.string(),
    timestamp: defineValidTimestamp(),
    favorite: z.boolean(),
  })
  .refine(
    (data) => {
      const { favorite, traderAddr, walletAddr, timestamp, message } = data;
      const action = favorite ? "Favorite" : "Unfavorite";
      const expectedMessage = `${action} trader ${traderAddr} for ${walletAddr} at ${timestamp}`;
      return message === expectedMessage;
    },
    {
      message: "Message format does not match expected pattern",
      path: ["message"],
    }
  )
  .refine(walletSignatureRefinement.refine, walletSignatureRefinement);

const schemas = {
  favoriteTrader,
  selectTrader,
};

export default schemas;
