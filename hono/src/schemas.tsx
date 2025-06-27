import { ethers } from "ethers";
import { z } from "zod";
import wallet from "./api/wallet";
import utils from "./utils";

function defineValidWalletAddr() {
  return z
    .string()
    .refine((addr) => utils.isValidAddress(addr), { message: "Invalid wallet address format", path: ["walletAddr"] })
    .transform((addr) => ethers.getAddress(addr));
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

const walletSignatureRefine = {
  refine: refineWalletSignature(),
  message: "Invalid wallet signature",
  path: ["signature"],
};

const invalidMessageError = {
  message: "Message format does not match expected pattern",
  path: ["message"],
};

const autoCopy = z
  .object({
    walletAddr: defineValidWalletAddr(),
    signature: z.string(),
    message: z.string(),
    timestamp: defineValidTimestamp(),
    enable: z.boolean(),
  })
  .refine(walletSignatureRefine.refine, walletSignatureRefine)
  .refine((data) => {
    const { enable, walletAddr, timestamp, message } = data;
    const action = enable ? "Enable" : "Disable";
    const expectedMessage = `${action} auto-copy trading for ${walletAddr} at ${timestamp}`;
    return message === expectedMessage;
  }, invalidMessageError);

const selectTrader = z
  .object({
    walletAddr: defineValidWalletAddr(),
    traderAddr: defineValidWalletAddr(),
    signature: z.string(),
    message: z.string(),
    timestamp: defineValidTimestamp(),
    selected: z.boolean(),
  })
  .refine(walletSignatureRefine.refine, walletSignatureRefine)
  .refine((data) => {
    const { selected, traderAddr, walletAddr, timestamp, message } = data;
    const action = selected ? "Selected" : "Unselected";
    const expectedMessage = `${action} trader ${traderAddr} for ${walletAddr} at ${timestamp}`;
    return message === expectedMessage;
  }, invalidMessageError);

const favoriteTrader = z
  .object({
    walletAddr: defineValidWalletAddr(),
    traderAddr: defineValidWalletAddr(),
    signature: z.string(),
    message: z.string(),
    timestamp: defineValidTimestamp(),
    favorite: z.boolean(),
  })
  .refine(walletSignatureRefine.refine, walletSignatureRefine)
  .refine((data) => {
    const { favorite, traderAddr, walletAddr, timestamp, message } = data;
    const action = favorite ? "Favorite" : "Unfavorite";
    const expectedMessage = `${action} trader ${traderAddr} for ${walletAddr} at ${timestamp}`;
    return message === expectedMessage;
  }, invalidMessageError);

const connectWallet = z.object({
  walletAddr: defineValidWalletAddr(),
  chainId: z.string().refine((id) => utils.isValidChainId(id), {
    message: "Invalid chain ID",
    path: ["chainId"],
  }),
});

const disconnectWallet = z.object({
  walletAddr: defineValidWalletAddr(),
});

const schemas = {
  favoriteTrader,
  selectTrader,
  autoCopy,
  connectWallet,
  disconnectWallet,
};

export default schemas;
