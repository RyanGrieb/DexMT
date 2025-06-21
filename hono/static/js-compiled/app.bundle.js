/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@metamask/detect-provider/dist/index.js":
/*!**************************************************************!*\
  !*** ./node_modules/@metamask/detect-provider/dist/index.js ***!
  \**************************************************************/
/***/ ((module) => {


/**
 * Returns a Promise that resolves to the value of window.ethereum if it is
 * set within the given timeout, or null.
 * The Promise will not reject, but an error will be thrown if invalid options
 * are provided.
 *
 * @param options - Options bag.
 * @param options.mustBeMetaMask - Whether to only look for MetaMask providers.
 * Default: false
 * @param options.silent - Whether to silence console errors. Does not affect
 * thrown errors. Default: false
 * @param options.timeout - Milliseconds to wait for 'ethereum#initialized' to
 * be dispatched. Default: 3000
 * @returns A Promise that resolves with the Provider if it is detected within
 * given timeout, otherwise null.
 */
function detectEthereumProvider({ mustBeMetaMask = false, silent = false, timeout = 3000, } = {}) {
    _validateInputs();
    let handled = false;
    return new Promise((resolve) => {
        if (window.ethereum) {
            handleEthereum();
        }
        else {
            window.addEventListener('ethereum#initialized', handleEthereum, { once: true });
            setTimeout(() => {
                handleEthereum();
            }, timeout);
        }
        function handleEthereum() {
            if (handled) {
                return;
            }
            handled = true;
            window.removeEventListener('ethereum#initialized', handleEthereum);
            const { ethereum } = window;
            if (ethereum && (!mustBeMetaMask || ethereum.isMetaMask)) {
                resolve(ethereum);
            }
            else {
                const message = mustBeMetaMask && ethereum
                    ? 'Non-MetaMask window.ethereum detected.'
                    : 'Unable to detect window.ethereum.';
                !silent && console.error('@metamask/detect-provider:', message);
                resolve(null);
            }
        }
    });
    function _validateInputs() {
        if (typeof mustBeMetaMask !== 'boolean') {
            throw new Error(`@metamask/detect-provider: Expected option 'mustBeMetaMask' to be a boolean.`);
        }
        if (typeof silent !== 'boolean') {
            throw new Error(`@metamask/detect-provider: Expected option 'silent' to be a boolean.`);
        }
        if (typeof timeout !== 'number') {
            throw new Error(`@metamask/detect-provider: Expected option 'timeout' to be a number.`);
        }
    }
}
module.exports = detectEthereumProvider;


/***/ }),

/***/ "./static/ts-front-end/metamask.ts":
/*!*****************************************!*\
  !*** ./static/ts-front-end/metamask.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   autoReconnectWallet: () => (/* binding */ autoReconnectWallet),
/* harmony export */   checkExistingConnection: () => (/* binding */ checkExistingConnection),
/* harmony export */   connectWallet: () => (/* binding */ connectWallet),
/* harmony export */   disconnectWallet: () => (/* binding */ disconnectWallet),
/* harmony export */   isWalletConnected: () => (/* binding */ isWalletConnected),
/* harmony export */   provider: () => (/* binding */ provider),
/* harmony export */   updateWalletUI: () => (/* binding */ updateWalletUI),
/* harmony export */   waitForMetaMaskProvider: () => (/* binding */ waitForMetaMaskProvider)
/* harmony export */ });
/* harmony import */ var _metamask_detect_provider__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @metamask/detect-provider */ "./node_modules/@metamask/detect-provider/dist/index.js");
/* harmony import */ var _metamask_detect_provider__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_metamask_detect_provider__WEBPACK_IMPORTED_MODULE_0__);
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};

// MetaMask provider detection and handling
var provider = null;
// Track connection timestamp for expiry (this is just for our 7-day rule)
var CONNECTION_TIME_KEY = "metamask_connection_time";
// Arbitrum One network configuration
var ARBITRUM_NETWORK = {
    chainId: "0xa4b1", // 42161 in hex
    chainName: "Arbitrum One",
    nativeCurrency: {
        name: "Ethereum",
        symbol: "ETH",
        decimals: 18,
    },
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://arbiscan.io/"],
};
function updateNetworkStatus(chainId) {
    var networkStatus = document.getElementById("networkStatus");
    if (!networkStatus)
        return;
    if (chainId === ARBITRUM_NETWORK.chainId) {
        networkStatus.textContent = "✅ Arbitrum One";
        networkStatus.style.color = "green";
    }
    else {
        networkStatus.textContent = "⚠️ Wrong Network";
        networkStatus.style.color = "orange";
    }
}
function updateWalletUI() {
    return __awaiter(this, void 0, void 0, function () {
        var connectButton, connected, buttonTextElement, svgElement, textNode, walletAddress, networkStatus, address;
        return __generator(this, function (_a) {
            connectButton = document.getElementById("connectButton");
            if (!connectButton)
                return [2 /*return*/];
            connected = (provider === null || provider === void 0 ? void 0 : provider.isConnected()) && provider.selectedAddress;
            console.log("Updating wallet UI, connected: ".concat(connected));
            buttonTextElement = connectButton.querySelector("p") || connectButton;
            if (buttonTextElement.tagName === "P") {
                buttonTextElement.textContent = connected
                    ? "Disconnect Wallet"
                    : "Connect Wallet";
            }
            else {
                svgElement = connectButton.querySelector("svg");
                connectButton.innerHTML = "";
                if (svgElement) {
                    connectButton.appendChild(svgElement);
                }
                textNode = document.createTextNode(connected ? "Disconnect Wallet" : "Connect Wallet");
                connectButton.appendChild(textNode);
            }
            walletAddress = document.getElementById("walletAddress");
            networkStatus = document.getElementById("networkStatus");
            if (!walletAddress || !networkStatus) {
                console.warn("Wallet info elements not found in DOM");
                return [2 /*return*/];
            }
            if (connected) {
                address = provider.selectedAddress;
                // Update wallet address display
                walletAddress.textContent = "".concat(address.slice(0, 6), "...").concat(address.slice(-4));
                walletAddress.classList.remove("hidden");
                // Update network status
                networkStatus.classList.remove("hidden");
                try {
                    if (provider && provider.isMetaMask) {
                        updateNetworkStatus(provider.chainId || "");
                    }
                }
                catch (error) {
                    console.error("Error getting chain ID:", error);
                    networkStatus.textContent = "❌ Network Error";
                    networkStatus.style.color = "red";
                }
            }
            else {
                // Hide wallet info when disconnected
                walletAddress.textContent = "";
                walletAddress.classList.add("hidden");
                networkStatus.textContent = "";
                networkStatus.classList.add("hidden");
            }
            return [2 /*return*/];
        });
    });
}
function connectWallet() {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Connect wallet called");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 7]);
                    // Always ensure we have a fresh provider reference
                    return [4 /*yield*/, waitForMetaMaskProvider()];
                case 2:
                    // Always ensure we have a fresh provider reference
                    _a.sent();
                    if (!provider) {
                        console.error("MetaMask not available after waiting");
                        alert("MetaMask not detected. Please install MetaMask to continue.");
                        return [2 /*return*/];
                    }
                    console.log("Provider found, requesting connection...");
                    return [4 /*yield*/, provider.request({
                            method: "wallet_requestPermissions",
                            params: [{ eth_accounts: {} }],
                        })];
                case 3:
                    result = _a.sent();
                    console.log("Permission result:", result);
                    // Store connection timestamp for our 7-day expiry rule
                    localStorage.setItem(CONNECTION_TIME_KEY, Date.now().toString());
                    // Update UI immediately after successful connection
                    return [4 /*yield*/, updateWalletUI()];
                case 4:
                    // Update UI immediately after successful connection
                    _a.sent();
                    console.log("Wallet connection successful, connected account:", provider.selectedAddress);
                    return [3 /*break*/, 7];
                case 5:
                    error_1 = _a.sent();
                    console.error("Full error object:", error_1);
                    if (error_1.code === 4001) {
                        console.log("User rejected wallet connection");
                    }
                    else if (error_1.code === -32002) {
                        console.log("Connection request already pending");
                        alert("Connection request already pending. Please check MetaMask.");
                    }
                    else {
                        console.error("Error connecting wallet:", error_1);
                        alert("Failed to connect wallet: ".concat(error_1.message || "Unknown error"));
                    }
                    // Ensure UI is updated even on error
                    return [4 /*yield*/, updateWalletUI()];
                case 6:
                    // Ensure UI is updated even on error
                    _a.sent();
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function checkExistingConnection() {
    return __awaiter(this, void 0, void 0, function () {
        var permissions, accountsPermission, accounts, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    if (!!provider) return [3 /*break*/, 2];
                    return [4 /*yield*/, waitForMetaMaskProvider()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    if (!provider) {
                        console.log("MetaMask not available for connection check");
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, provider.request({
                            method: "wallet_getPermissions",
                        })];
                case 3:
                    permissions = (_a.sent());
                    accountsPermission = permissions.find(function (permission) { return permission.parentCapability === "eth_accounts"; });
                    if (!accountsPermission) return [3 /*break*/, 6];
                    return [4 /*yield*/, provider.request({
                            method: "eth_accounts",
                        })];
                case 4:
                    accounts = (_a.sent());
                    if (!(accounts.length > 0)) return [3 /*break*/, 6];
                    console.log("Existing connection found:", accounts[0]);
                    return [4 /*yield*/, updateWalletUI()];
                case 5:
                    _a.sent();
                    return [2 /*return*/, true];
                case 6: return [2 /*return*/, false];
                case 7:
                    error_2 = _a.sent();
                    console.error("Error checking existing connection:", error_2);
                    return [2 /*return*/, false];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function disconnectWallet() {
    return __awaiter(this, void 0, void 0, function () {
        var fetchError_1, revokeError_1, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Disconnecting wallet...");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 11, , 13]);
                    if (!(provider === null || provider === void 0 ? void 0 : provider.isConnected())) return [3 /*break*/, 5];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/wallet/disconnect", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                address: provider.selectedAddress,
                            }),
                        })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    fetchError_1 = _a.sent();
                    console.warn("Failed to notify backend of wallet disconnection:", fetchError_1);
                    return [3 /*break*/, 5];
                case 5:
                    // Clear connection timestamp
                    localStorage.removeItem(CONNECTION_TIME_KEY);
                    if (!provider) return [3 /*break*/, 9];
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, provider.request({
                            method: "wallet_revokePermissions",
                            params: [{ eth_accounts: {} }],
                        })];
                case 7:
                    _a.sent();
                    console.log("Wallet permissions revoked successfully");
                    return [3 /*break*/, 9];
                case 8:
                    revokeError_1 = _a.sent();
                    console.warn("Could not revoke permissions:", revokeError_1);
                    return [3 /*break*/, 9];
                case 9:
                    // Clear our local provider state
                    provider = null;
                    return [4 /*yield*/, updateWalletUI()];
                case 10:
                    _a.sent();
                    console.log("Wallet disconnected successfully");
                    return [3 /*break*/, 13];
                case 11:
                    error_3 = _a.sent();
                    console.error("Error disconnecting wallet:", error_3);
                    // Always clear local state even if there's an error
                    localStorage.removeItem(CONNECTION_TIME_KEY);
                    provider = null;
                    return [4 /*yield*/, updateWalletUI()];
                case 12:
                    _a.sent();
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    });
}
/** Wait until MetaMask injects the provider per EIP-6963 */
function waitForMetaMaskProvider() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Waiting for MetaMask provider...");
                    if (!!provider) return [3 /*break*/, 2];
                    return [4 /*yield*/, _metamask_detect_provider__WEBPACK_IMPORTED_MODULE_0___default()({
                            mustBeMetaMask: true,
                            silent: false,
                            timeout: 5000, // 5 second timeout
                        })];
                case 1:
                    provider = (_a.sent());
                    if (!provider) {
                        console.error("MetaMask not detected after waiting");
                        return [2 /*return*/];
                    }
                    console.log("MetaMask provider detected, setting up listeners...");
                    // Remove existing listeners to avoid duplicates
                    if (provider.removeAllListeners) {
                        provider.removeAllListeners();
                    }
                    // wire up listeners with proper args signature
                    provider.on("accountsChanged", function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        var accounts = args[0];
                        console.log("accountsChanged event:", accounts);
                        handleAccountsChanged(accounts);
                    });
                    provider.on("chainChanged", function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        var chainId = args[0];
                        console.log("chainChanged event:", chainId);
                        handleChainChanged(chainId);
                    });
                    provider.on("connect", function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        console.log("MetaMask connected event", args[0]);
                        updateWalletUI();
                    });
                    provider.on("disconnect", function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        console.log("MetaMask disconnected event", args[0]);
                        updateWalletUI();
                    });
                    return [3 /*break*/, 3];
                case 2:
                    console.log("Provider already exists");
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function handleAccountsChanged(accounts) {
    console.log("Accounts changed (detected):", accounts);
    if (accounts.length === 0) {
        // User disconnected their wallet from MetaMask interface
        // Clear connection timestamp since user disconnected
        localStorage.removeItem(CONNECTION_TIME_KEY);
        provider = null;
    }
    updateWalletUI();
}
function handleChainChanged(chainId) {
    console.log("Chain changed (detected) to:", chainId);
    updateNetworkStatus(chainId);
}
// Auto-reconnect function to be called on page load
function autoReconnectWallet() {
    return __awaiter(this, void 0, void 0, function () {
        var connectionTime, timeDiff, sevenDaysInMs, error_4, connected;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    connectionTime = localStorage.getItem(CONNECTION_TIME_KEY);
                    if (!connectionTime) return [3 /*break*/, 8];
                    timeDiff = Date.now() - parseInt(connectionTime);
                    sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
                    if (!(timeDiff > sevenDaysInMs)) return [3 /*break*/, 8];
                    // Connection is older than 7 days, clear it and don't auto-reconnect
                    localStorage.removeItem(CONNECTION_TIME_KEY);
                    console.log("Connection expired (older than 7 days)");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    if (!!provider) return [3 /*break*/, 3];
                    return [4 /*yield*/, waitForMetaMaskProvider()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    if (!provider) return [3 /*break*/, 5];
                    return [4 /*yield*/, provider.request({
                            method: "wallet_revokePermissions",
                            params: [{ eth_accounts: {} }],
                        })];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_4 = _a.sent();
                    console.warn("Could not revoke expired permissions:", error_4);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
                case 8: return [4 /*yield*/, checkExistingConnection()];
                case 9:
                    connected = _a.sent();
                    if (!connected) {
                        console.log("No existing wallet connection found");
                        // Clear timestamp if no permissions exist
                        localStorage.removeItem(CONNECTION_TIME_KEY);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// Helper function to check if wallet is actually connected (permissions + accounts)
function isWalletConnected() {
    return __awaiter(this, void 0, void 0, function () {
        var permissions, accountsPermission, accounts, connected, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!provider) {
                        console.log("No provider available for connection check");
                        return [2 /*return*/, false];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    // First check if provider thinks it's connected
                    if (!provider.isConnected() || !provider.selectedAddress) {
                        console.log("Provider not connected or no selected address");
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, provider.request({
                            method: "wallet_getPermissions",
                        })];
                case 2:
                    permissions = (_a.sent());
                    accountsPermission = permissions.find(function (permission) { return permission.parentCapability === "eth_accounts"; });
                    if (!accountsPermission) {
                        console.log("No eth_accounts permission found");
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, provider.request({
                            method: "eth_accounts",
                        })];
                case 3:
                    accounts = (_a.sent());
                    connected = accounts.length > 0;
                    console.log("Wallet connection check result:", connected, "accounts:", accounts.length);
                    return [2 /*return*/, connected];
                case 4:
                    error_5 = _a.sent();
                    console.error("Error checking wallet connection:", error_5);
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/];
            }
        });
    });
}


/***/ }),

/***/ "./static/ts-front-end/utils.ts":
/*!**************************************!*\
  !*** ./static/ts-front-end/utils.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// Number formatting utilities
function formatNumber(value, decimals) {
    if (decimals === void 0) { decimals = 2; }
    var num = Number(value) || 0;
    return num.toFixed(decimals);
}
function formatCurrency(value, currency) {
    if (currency === void 0) { currency = "$"; }
    var num = Number(value) || 0;
    return "".concat(currency).concat(num.toLocaleString());
}
function formatPercentage(value) {
    var num = Number(value) || 0;
    var sign = num >= 0 ? "+" : "";
    return "".concat(sign).concat(num.toFixed(2), "%");
}
function truncateAddress(address, startLength, endLength) {
    if (startLength === void 0) { startLength = 6; }
    if (endLength === void 0) { endLength = 4; }
    if (!address || address.length < startLength + endLength) {
        return address;
    }
    return "".concat(address.slice(0, startLength), "...").concat(address.slice(-endLength));
}
function isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}
function formatTimestamp(timestamp) {
    var date = new Date(timestamp);
    return date.toLocaleString();
}
function timeAgo(timestamp) {
    var now = new Date();
    var past = new Date(timestamp);
    var diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    if (diffInSeconds < 60)
        return "".concat(diffInSeconds, "s ago");
    if (diffInSeconds < 3600)
        return "".concat(Math.floor(diffInSeconds / 60), "m ago");
    if (diffInSeconds < 86400)
        return "".concat(Math.floor(diffInSeconds / 3600), "h ago");
    return "".concat(Math.floor(diffInSeconds / 86400), "d ago");
}
function createElement(tag, className, innerHTML) {
    var element = document.createElement(tag);
    if (className)
        element.className = className;
    if (innerHTML)
        element.innerHTML = innerHTML;
    return element;
}
function showToast(message, type) {
    if (type === void 0) { type = "info"; }
    // TODO: Implement toast notification system
    console.log("[".concat(type.toUpperCase(), "] ").concat(message));
}
function getPlatformIcon(platform) {
    if (!platform) {
        return '<span style="color:#666;">-</span>';
    }
    var platformLower = platform.toLowerCase();
    switch (platformLower) {
        case "gmx":
            return "\n        <svg width=\"24\" height=\"24\" viewBox=\"0 0 30 30\" xmlns=\"http://www.w3.org/2000/svg\">\n          <defs>\n            <linearGradient id=\"gmx-gradient-watched\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\">\n              <stop offset=\"0%\" style=\"stop-color:#4f46e5;stop-opacity:1\" />\n              <stop offset=\"100%\" style=\"stop-color:#06b6d4;stop-opacity:1\" />\n            </linearGradient>\n          </defs>\n          <path fill=\"url(#gmx-gradient-watched)\" transform=\"translate(-525.667 -696) scale(1)\" d=\"m555.182 717.462-14.735-21.462-14.78 21.462h20.592l-5.812-8.191-2.883 4.256h-3.064l5.949-8.557 8.6 12.493z\"/>\n        </svg>\n      ";
        case "dydx":
            return "<span style=\"font-size:0.75rem;color:#888;\">DYDX</span>";
        case "hyperliquid":
            return "<span style=\"font-size:0.75rem;color:#888;\">HL</span>";
        default:
            return "<span style=\"font-size:0.75rem;color:#888;\">".concat(platform.toUpperCase(), "</span>");
    }
}
function generateIconColor(address) {
    var hash = address.slice(2, 8);
    var r = parseInt(hash.slice(0, 2), 16);
    var g = parseInt(hash.slice(2, 4), 16);
    var b = parseInt(hash.slice(4, 6), 16);
    return "rgb(".concat(r, ", ").concat(g, ", ").concat(b, ")");
}
// Helper function to update content without page refresh
function loadContent(endpoint, userURL, title, userAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var url, headers, response, html, contentArea, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    showLoadingState();
                    url = endpoint;
                    headers = {};
                    // Add wallet address to request if available
                    if (userAddress) {
                        url += "?address=".concat(encodeURIComponent(userAddress));
                        headers["x-wallet-address"] = userAddress;
                    }
                    return [4 /*yield*/, fetch(url, { headers: headers })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("HTTP error! status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.text()];
                case 2:
                    html = _a.sent();
                    contentArea = document.querySelector(".index-content");
                    if (contentArea) {
                        contentArea.innerHTML = html;
                        // Update page title and URL
                        document.title = "DEXMT - ".concat(title);
                        window.history.pushState({}, title, userURL);
                        showToast("".concat(title, " loaded successfully"), "success");
                    }
                    else {
                        throw new Error("Content area not found");
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error loading ".concat(title, ":"), error_1);
                    showToast("Error loading ".concat(title, ". Please try again."), "error");
                    return [3 /*break*/, 5];
                case 4: return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Show loading state
function showLoadingState() {
    var contentArea = document.querySelector(".index-content");
    if (contentArea) {
        contentArea.innerHTML = "\n      <div class=\"loading-container\">\n        <div class=\"loading-spinner\"></div>\n        <p>Loading...</p>\n      </div>\n    ";
    }
}
function watchElementsOfClass(className, onElementLoad) {
    // Handle existing elements on initial load
    var existingElements = document.querySelectorAll(".".concat(className));
    existingElements.forEach(function (el) { return onElementLoad(el); });
    // Set up a MutationObserver for newly added elements
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    var element = node;
                    // Check if the added node has our class
                    if (element.classList.contains(className)) {
                        onElementLoad(element);
                    }
                    // Check any child elements
                    element.querySelectorAll(".".concat(className)).forEach(function (child) {
                        onElementLoad(child);
                    });
                }
            });
        });
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}
var utils = {
    formatNumber: formatNumber,
    formatCurrency: formatCurrency,
    formatPercentage: formatPercentage,
    truncateAddress: truncateAddress,
    isValidAddress: isValidAddress,
    formatTimestamp: formatTimestamp,
    timeAgo: timeAgo,
    createElement: createElement,
    showToast: showToast,
    getPlatformIcon: getPlatformIcon,
    generateIconColor: generateIconColor,
    loadContent: loadContent,
    watchElementsOfClass: watchElementsOfClass,
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (utils);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!************************************!*\
  !*** ./static/ts-front-end/app.ts ***!
  \************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _metamask__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./metamask */ "./static/ts-front-end/metamask.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./static/ts-front-end/utils.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// Import only what you need from each module


console.log("DEXMT JS file loaded");
// Main application initialization
document.addEventListener("DOMContentLoaded", function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_1, topTradersBtn, myWatchListBtn, connectButton;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("DOM loaded, setting up DEXMT...");
                _utils__WEBPACK_IMPORTED_MODULE_1__["default"].watchElementsOfClass("back-button", function (button) {
                    button.addEventListener("click", function () {
                        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].loadContent("/api/html/toptraders", "/toptraders", "Top Traders");
                    });
                });
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                // Auto-reconnect wallet if previously connected
                return [4 /*yield*/, (0,_metamask__WEBPACK_IMPORTED_MODULE_0__.autoReconnectWallet)()];
            case 2:
                // Auto-reconnect wallet if previously connected
                _a.sent();
                // sync the Connect/Disconnect button to real wallet state
                return [4 /*yield*/, (0,_metamask__WEBPACK_IMPORTED_MODULE_0__.updateWalletUI)()];
            case 3:
                // sync the Connect/Disconnect button to real wallet state
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.error("Error during initialization:", error_1);
                _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Initialization error", "error");
                return [3 /*break*/, 5];
            case 5:
                topTradersBtn = document.getElementById("topTradersBtn");
                myWatchListBtn = document.getElementById("myWatchListBtn");
                if (topTradersBtn) {
                    topTradersBtn.addEventListener("click", function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, _utils__WEBPACK_IMPORTED_MODULE_1__["default"].loadContent("/api/html/toptraders", "/toptraders", "Top Traders")];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                }
                if (myWatchListBtn) {
                    //FIXME: Authenticate user selected address before loading watchlist
                    myWatchListBtn.addEventListener("click", function () { return __awaiter(void 0, void 0, void 0, function () {
                        var walletAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    walletAddress = _metamask__WEBPACK_IMPORTED_MODULE_0__.provider === null || _metamask__WEBPACK_IMPORTED_MODULE_0__.provider === void 0 ? void 0 : _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.selectedAddress;
                                    return [4 /*yield*/, _utils__WEBPACK_IMPORTED_MODULE_1__["default"].loadContent("/api/html/mywatchlist", "/mywatchlist", "My Watchlist", walletAddress || undefined)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    // Add click listeners to trader rows
                    document.addEventListener("click", function (event) { return __awaiter(void 0, void 0, void 0, function () {
                        var traderRow, address;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    traderRow = event.target.closest("tr");
                                    if (!traderRow)
                                        return [2 /*return*/];
                                    address = traderRow.getAttribute("address");
                                    if (!address)
                                        return [2 /*return*/];
                                    return [4 /*yield*/, _utils__WEBPACK_IMPORTED_MODULE_1__["default"].loadContent("/api/html/traderprofile?address=".concat(encodeURIComponent(address)), "/traderprofile?address=" + encodeURIComponent(address), "Trader Profile")];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                }
                connectButton = document.getElementById("connectButton");
                if (connectButton) {
                    connectButton.addEventListener("click", function () { return __awaiter(void 0, void 0, void 0, function () {
                        var currentlyConnected;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, (0,_metamask__WEBPACK_IMPORTED_MODULE_0__.isWalletConnected)()];
                                case 1:
                                    currentlyConnected = _a.sent();
                                    if (!currentlyConnected) return [3 /*break*/, 3];
                                    return [4 /*yield*/, (0,_metamask__WEBPACK_IMPORTED_MODULE_0__.disconnectWallet)()];
                                case 2:
                                    _a.sent();
                                    return [3 /*break*/, 5];
                                case 3: return [4 /*yield*/, (0,_metamask__WEBPACK_IMPORTED_MODULE_0__.connectWallet)()];
                                case 4:
                                    _a.sent();
                                    _a.label = 5;
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                }
                console.log("DEXMT setup complete");
                return [2 /*return*/];
        }
    });
}); });
// Global error handler
window.addEventListener("error", function (event) {
    console.error("Global error:", event.error);
    _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("An error occurred. Please refresh the page.", "error");
});
// Export for debugging/compatibility
window.DEXMT = {
    version: "1.0.0",
    initialized: true,
};

})();

/******/ })()
;
//# sourceMappingURL=app.bundle.js.map