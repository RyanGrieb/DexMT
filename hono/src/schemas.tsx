import { ethers } from "ethers";
import { z } from "zod";
import wallet from "./api/wallet";
import utils from "./utils/utils";

function defineValidWalletAddr() {
  return z
    .string()
    .refine((addr) => addr.startsWith("0x"), {
      message: "Wallet address must start with 0x",
      path: ["walletAddr"],
    })
    .refine((addr) => utils.isValidAddress(addr), {
      message: "Invalid wallet address format",
      path: ["walletAddr"],
    })
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
  const action = selected ? "Select" : "Unselect";
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

// Testing schemas - FIXME: Check for testing environment variable
const injectFakeTrade = z.object({
  id: z.string(),
  isFake: z.boolean().default(true), // Indicates this is a fake trade for testing
  orderType: z.number().int().min(0).max(9), // DEXOrderType enum values
  traderAddr: defineValidWalletAddr(),
  mirroredTraderAddr: defineValidWalletAddr().optional(),
  marketAddress: z.string(),
  longTokenAddress: z.string(),
  shortTokenAddress: z.string(),
  isLong: z.boolean(),
  marketName: z.string(),
  tokenName: z.string(),
  sizeUsd: z.number(),
  priceUsd: z.number(),
  initialCollateralUsd: z.number(),
  sizeDeltaUsd: z.number(),
  rpnl: z.number(),
  timestamp: z.number(),
});

const injectFakePosition = z.object({
  isFake: z.boolean().default(true), // Indicates this is a fake position for testing
  key: z.string(),
  contractKey: z.string(),
  account: defineValidWalletAddr(),
  traderAddr: defineValidWalletAddr(),
  marketAddress: z.string(),
  collateralTokenAddress: z.string(),
  sizeInUsd: z.number().transform(BigInt),
  sizeInTokens: z.number().transform(BigInt),
  collateralAmount: z.number().transform(BigInt),
  pendingBorrowingFeesUsd: z.number().transform(BigInt).default(0),
  increasedAtTime: z.number().transform(BigInt).default(Date.now()),
  decreasedAtTime: z.number().transform(BigInt).default(0),
  isLong: z.boolean(),
  fundingFeeAmount: z.number().transform(BigInt).default(0),
  claimableLongTokenAmount: z.number().transform(BigInt).default(0),
  claimableShortTokenAmount: z.number().transform(BigInt).default(0),
  isOpening: z.boolean().default(false),
  pnl: z.number().transform(BigInt).default(0),
  positionFeeAmount: z.number().transform(BigInt).default(0),
  traderDiscountAmount: z.number().transform(BigInt).default(0),
  uiFeeAmount: z.number().transform(BigInt).default(0),
  data: z.string().default(""),
  tokenName: z.string(),
  collateralAmountUsd: z.number(),
  liqPriceUsd: z.number(),
  entryPriceUsd: z.number(),
  markPriceUsd: z.number(),
  sizeUsd: z.number(),
  pnlUsd: z.number(),
  leverage: z.number(),
});

// FIXME: These schemas should be in upper-case like 'FavoritesOfWallet'
const schemas = {
  favoriteTrader,
  selectTrader,
  autoCopy,
  connectWallet,
  disconnectWallet,
  FavoritesOfWallet,
  injectFakeTrade,
  injectFakePosition,
};

export default schemas;
