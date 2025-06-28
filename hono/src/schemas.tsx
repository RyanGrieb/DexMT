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
  message:
    "Invalid wallet signature. Ensure the signature was created by signing the message with the wallet address provided.",
  path: ["signature"],
};

function createInvalidMessageError(expectedPattern: string) {
  return {
    message: `Message format does not match expected pattern. Expected: "${expectedPattern}"`,
    path: ["message"],
  };
}

function createMessageValidator<T>(getExpectedMessage: (data: T) => string) {
  return {
    validator: (data: T) => {
      const expectedMessage = getExpectedMessage(data);
      return (data as any).message === expectedMessage;
    },
    errorHandler: (data: T) => {
      const expectedMessage = getExpectedMessage(data);
      return createInvalidMessageError(expectedMessage);
    },
  };
}

const autoCopyMessageValidator = createMessageValidator((data: any) => {
  const { enable, walletAddr, timestamp } = data;
  const action = enable ? "Enable" : "Disable";
  return `${action} auto-copy trading for ${walletAddr} at ${timestamp}`;
});

const autoCopy = z
  .object({
    walletAddr: defineValidWalletAddr(),
    signature: z.string(),
    message: z.string(),
    timestamp: defineValidTimestamp(),
    enable: z.boolean(),
  })
  .refine(walletSignatureRefine.refine, walletSignatureRefine)
  .refine(autoCopyMessageValidator.validator, autoCopyMessageValidator.errorHandler);

const selectTraderMessageValidator = createMessageValidator((data: any) => {
  const { selected, traderAddr, walletAddr, timestamp } = data;
  const action = selected ? "Selected" : "Unselected";
  return `${action} trader ${traderAddr} for ${walletAddr} at ${timestamp}`;
});

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
  .refine(selectTraderMessageValidator.validator, selectTraderMessageValidator.errorHandler);

const favoriteTraderMessageValidator = createMessageValidator((data: any) => {
  const { favorite, traderAddr, walletAddr, timestamp } = data;
  const action = favorite ? "Favorite" : "Unfavorite";
  return `${action} trader ${traderAddr} for ${walletAddr} at ${timestamp}`;
});

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
  .refine(favoriteTraderMessageValidator.validator, favoriteTraderMessageValidator.errorHandler);

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

const FavoritesOfWallet = z.object({
  walletAddr: defineValidWalletAddr(),
});

// FIXME: These schemas should be in upper-case like 'FavoritesOfWallet'
const schemas = {
  favoriteTrader,
  selectTrader,
  autoCopy,
  connectWallet,
  disconnectWallet,
  FavoritesOfWallet,
};

export default schemas;
