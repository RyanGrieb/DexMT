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
                buttonTextElement.textContent = connected ? "Disconnect Wallet" : "Connect Wallet";
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
                    _a.trys.push([1, 6, , 8]);
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
                    // Post request to /api/wallet/connect to notify backend of connection
                    return [4 /*yield*/, fetch("/api/wallet/connect", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                address: provider.selectedAddress,
                                chainId: provider.chainId,
                            }),
                        })];
                case 4:
                    // Post request to /api/wallet/connect to notify backend of connection
                    _a.sent();
                    // Update UI immediately after successful connection
                    return [4 /*yield*/, updateWalletUI()];
                case 5:
                    // Update UI immediately after successful connection
                    _a.sent();
                    console.log("Wallet connection successful, connected account:", provider.selectedAddress);
                    return [3 /*break*/, 8];
                case 6:
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
                case 7:
                    // Ensure UI is updated even on error
                    _a.sent();
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
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

/***/ "./static/ts-front-end/profile.ts":
/*!****************************************!*\
  !*** ./static/ts-front-end/profile.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
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


function init() {
    var _this = this;
    _utils__WEBPACK_IMPORTED_MODULE_1__["default"].watchElementsOfQuery(".back-button", function (button) {
        button.addEventListener("click", function (event) {
            window.history.back();
        });
    });
    _utils__WEBPACK_IMPORTED_MODULE_1__["default"].watchElementsOfQuery(".favorite-button", function (button) {
        console.log("Found favorite button");
        button.addEventListener("click", function () { return __awaiter(_this, void 0, void 0, function () {
            var favoriteAddr, walletAddress, originalText, isFavorited, heartPath, svgElement, path1, path2, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        favoriteAddr = button.getAttribute("data-address");
                        if (!favoriteAddr) {
                            console.error("No trader address found");
                            return [2 /*return*/];
                        }
                        // Check if wallet is connected using MetaMask provider
                        if (!_metamask__WEBPACK_IMPORTED_MODULE_0__.provider || !_metamask__WEBPACK_IMPORTED_MODULE_0__.provider.selectedAddress) {
                            _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showNotification("Please connect your wallet first", "error");
                            return [2 /*return*/];
                        }
                        walletAddress = _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.selectedAddress;
                        originalText = ((_a = button.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || "";
                        button.textContent = "Processing...";
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 7]);
                        isFavorited = button.classList.contains("favorited");
                        console.log("Favoriting trader:", !isFavorited);
                        heartPath = isFavorited
                            ? "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                            : "M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zM12.1 18.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z";
                        if (!isFavorited) return [3 /*break*/, 3];
                        return [4 /*yield*/, unfavoriteTrader(walletAddress, favoriteAddr)];
                    case 2:
                        _b.sent();
                        button.classList.remove("favorited");
                        button.textContent = "Favorite";
                        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showNotification("Trader unfavorited successfully", "success");
                        return [3 /*break*/, 5];
                    case 3: 
                    // Send favorite request to server
                    return [4 /*yield*/, favoriteTrader(walletAddress, favoriteAddr)];
                    case 4:
                        // Send favorite request to server
                        _b.sent();
                        // Toggle favorite state on success
                        button.classList.add("favorited");
                        button.textContent = "Unfavorite";
                        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showNotification("Trader favorited successfully", "success");
                        _b.label = 5;
                    case 5:
                        svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                        svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                        svgElement.setAttribute("height", "20");
                        svgElement.setAttribute("viewBox", "0 0 24 24");
                        svgElement.setAttribute("width", "20");
                        path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        path1.setAttribute("d", "M0 0h24v24H0z");
                        path1.setAttribute("fill", "none");
                        path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        path2.setAttribute("d", heartPath);
                        svgElement.appendChild(path1);
                        svgElement.appendChild(path2);
                        button.insertBefore(svgElement, button.firstChild);
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _b.sent();
                        console.error("Error favoriting trader:", error_1);
                        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showNotification("Failed to favorite trader", "error");
                        // Restore original text and state in case of error
                        if (originalText) {
                            button.textContent = originalText;
                        }
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
    });
}
function unfavoriteTrader(followerAddr, favoriteAddr) {
    return __awaiter(this, void 0, void 0, function () {
        var timestamp, message, signature, response, errorData, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    timestamp = Date.now();
                    message = "Unfavorite trader ".concat(favoriteAddr, " for ").concat(followerAddr, " at ").concat(timestamp);
                    // Request wallet signature using MetaMask provider
                    if (!_metamask__WEBPACK_IMPORTED_MODULE_0__.provider) {
                        throw new Error("MetaMask provider not available");
                    }
                    return [4 /*yield*/, _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.request({
                            method: "personal_sign",
                            params: [message, followerAddr],
                        })];
                case 1:
                    signature = (_a.sent());
                    if (!signature) {
                        throw new Error("Failed to get wallet signature");
                    }
                    return [4 /*yield*/, fetch("/api/traders/".concat(followerAddr, "/unfavorite_trader"), {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                favoriteAddr: favoriteAddr,
                                signature: signature,
                                message: message,
                                timestamp: timestamp,
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData || "Failed to unfavorite trader");
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    result = _a.sent();
                    console.log("Unfavorite trader response:", result);
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    console.error("Error in unfavoriteTrader:", error_2);
                    throw error_2;
                case 7: return [2 /*return*/];
            }
        });
    });
}
function favoriteTrader(followerAddr, favoriteAddr) {
    return __awaiter(this, void 0, void 0, function () {
        var timestamp, message, signature, response, errorData, result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    timestamp = Date.now();
                    message = "Favorite trader ".concat(favoriteAddr, " for ").concat(followerAddr, " at ").concat(timestamp);
                    // Request wallet signature using MetaMask provider
                    if (!_metamask__WEBPACK_IMPORTED_MODULE_0__.provider) {
                        throw new Error("MetaMask provider not available");
                    }
                    return [4 /*yield*/, _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.request({
                            method: "personal_sign",
                            params: [message, followerAddr],
                        })];
                case 1:
                    signature = (_a.sent());
                    if (!signature) {
                        throw new Error("Failed to get wallet signature");
                    }
                    return [4 /*yield*/, fetch("/api/traders/".concat(followerAddr, "/favorite_trader"), {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                favoriteAddr: favoriteAddr,
                                signature: signature,
                                message: message,
                                timestamp: timestamp,
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData.error || "Failed to favorite trader");
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    result = _a.sent();
                    console.log("Favorite trader response:", result);
                    return [3 /*break*/, 7];
                case 6:
                    error_3 = _a.sent();
                    console.error("Error in favoriteTrader:", error_3);
                    throw error_3;
                case 7: return [2 /*return*/];
            }
        });
    });
}
var profile = {
    init: init,
    favoriteTrader: favoriteTrader,
    unfavoriteTrader: unfavoriteTrader,
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (profile);


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
/* harmony import */ var _metamask__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./metamask */ "./static/ts-front-end/metamask.ts");
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
// Helper function to update content with optional URL change
function loadContent(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var contentDiv_1, walletAddress, tz, headers, response, html, contentDiv, error_1;
        var apiUrl = _b.apiUrl, browserUrl = _b.browserUrl, title = _b.title, walletAddr = _b.walletAddr, content = _b.content, _c = _b.updateUrl, updateUrl = _c === void 0 ? true : _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 3, , 4]);
                    if (content) {
                        contentDiv_1 = document.querySelector(".index-content");
                        if (contentDiv_1) {
                            contentDiv_1.innerHTML = content;
                        }
                        document.title = title;
                        // Update URL if requested and browserUrl is provided
                        if (updateUrl && browserUrl) {
                            window.history.pushState({}, title, browserUrl);
                        }
                        return [2 /*return*/];
                    }
                    if (!apiUrl) {
                        throw new Error("No API URL or content provided");
                    }
                    document.title = title;
                    // Update browser URL if requested and browserUrl is provided
                    if (updateUrl && browserUrl) {
                        window.history.pushState({}, title, browserUrl);
                    }
                    showLoadingState();
                    walletAddress = walletAddr || (_metamask__WEBPACK_IMPORTED_MODULE_0__.provider === null || _metamask__WEBPACK_IMPORTED_MODULE_0__.provider === void 0 ? void 0 : _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.selectedAddress);
                    tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    headers = {
                        "Content-Type": "application/json",
                        "x-timezone": tz,
                    };
                    // Add wallet address to headers if available
                    if (walletAddress) {
                        headers["x-wallet-address"] = walletAddress;
                    }
                    return [4 /*yield*/, fetch(apiUrl, {
                            method: "GET",
                            headers: headers,
                        })];
                case 1:
                    response = _d.sent();
                    if (!response.ok) {
                        throw new Error("HTTP error! status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.text()];
                case 2:
                    html = _d.sent();
                    contentDiv = document.querySelector(".index-content");
                    if (contentDiv) {
                        contentDiv.innerHTML = html;
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _d.sent();
                    console.error("Error loading content:", error_1);
                    showNotification("Error loading content", "error");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function showLoadingState() {
    var contentArea = document.querySelector(".index-content");
    if (contentArea) {
        contentArea.innerHTML = "\n      <div class=\"loading-container\">\n        <div class=\"loading-spinner\"></div>\n        <p class=\"loading-text\">Loading content, please wait...</p>\n      </div>\n    ";
    }
}
function watchElementsOfQuery(query, onElementLoad) {
    // Handle existing elements on initial load
    var existingElements = document.querySelectorAll(query);
    existingElements.forEach(function (el) { return onElementLoad(el); });
    // Set up a MutationObserver for newly added elements
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    var element = node;
                    // Check if the added node matches our query
                    if (element.matches(query)) {
                        onElementLoad(element);
                    }
                    // Check any child elements
                    element.querySelectorAll(query).forEach(function (child) {
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
function showNotification(message, type) {
    // Simple notification implementation
    // You can replace this with your preferred notification library
    console.log("".concat(type.toUpperCase(), ": ").concat(message));
    // Optional: Create a simple toast notification
    var notification = document.createElement("div");
    notification.className = "notification ".concat(type);
    notification.textContent = message;
    notification.style.cssText = "\n    position: fixed;\n    top: 20px;\n    right: 20px;\n    padding: 12px 20px;\n    background: ".concat(type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6", ";\n    color: white;\n    border-radius: 8px;\n    z-index: 1000;\n    transition: opacity 0.3s ease;\n  ");
    document.body.appendChild(notification);
    setTimeout(function () {
        notification.style.opacity = "0";
        setTimeout(function () { return notification.remove(); }, 300);
    }, 3000);
}
function loadProfile(address, walletAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var apiUrl, browserUrl;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!address) return [3 /*break*/, 2];
                    apiUrl = "/api/html/traderprofile?address=".concat(encodeURIComponent(address));
                    browserUrl = "/traderprofile?address=".concat(encodeURIComponent(address));
                    if (walletAddress) {
                        apiUrl += "&userAddress=".concat(encodeURIComponent(walletAddress));
                    }
                    return [4 /*yield*/, loadContent({
                            apiUrl: apiUrl,
                            browserUrl: browserUrl,
                            title: "Trader Profile",
                            walletAddr: walletAddress || undefined,
                            updateUrl: true, // ← now pushState into history
                        })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, loadContent({
                        title: "Trader Profile",
                        content: '<div class="error-message">Trader address is required</div>',
                        updateUrl: false,
                    })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Function to load content based on current URL
function loadContentForCurrentPage() {
    return __awaiter(this, void 0, void 0, function () {
        var currentPath, searchParams, walletAddress, _a, address, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    currentPath = window.location.pathname;
                    searchParams = new URLSearchParams(window.location.search);
                    walletAddress = _metamask__WEBPACK_IMPORTED_MODULE_0__.provider === null || _metamask__WEBPACK_IMPORTED_MODULE_0__.provider === void 0 ? void 0 : _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.selectedAddress;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 9, , 10]);
                    _a = currentPath;
                    switch (_a) {
                        case "/toptraders": return [3 /*break*/, 2];
                        case "/mywatchlist": return [3 /*break*/, 4];
                        case "/traderprofile": return [3 /*break*/, 6];
                    }
                    return [3 /*break*/, 7];
                case 2: return [4 /*yield*/, loadContent({
                        apiUrl: "/api/html/toptraders",
                        title: "Top Traders",
                        updateUrl: false, // Don't update URL on initial page load
                    })];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 8];
                case 4: return [4 /*yield*/, loadContent({
                        apiUrl: "/api/html/mywatchlist",
                        title: "My Watchlist",
                        walletAddr: walletAddress || undefined,
                        updateUrl: false, // Don't update URL on initial page load
                    })];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 8];
                case 6:
                    address = searchParams.get("address");
                    loadProfile(address, walletAddress);
                    return [3 /*break*/, 8];
                case 7: 
                // For root or unknown paths, don't load anything (let redirect handle it)
                return [3 /*break*/, 8];
                case 8: return [3 /*break*/, 10];
                case 9:
                    error_2 = _b.sent();
                    console.error("Error loading initial content:", error_2);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
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
    watchElementsOfQuery: watchElementsOfQuery,
    showNotification: showNotification,
    loadProfile: loadProfile,
    loadContentForCurrentPage: loadContentForCurrentPage,
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (utils);


/***/ }),

/***/ "./static/ts-front-end/watchlist.ts":
/*!******************************************!*\
  !*** ./static/ts-front-end/watchlist.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _metamask__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./metamask */ "./static/ts-front-end/metamask.ts");
/* harmony import */ var _profile__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./profile */ "./static/ts-front-end/profile.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ "./static/ts-front-end/utils.ts");
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



function init() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            document.body.addEventListener("click", function (e) { return __awaiter(_this, void 0, void 0, function () {
                var traderIdentity, walletAddress, traderCard, address, btn;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            traderIdentity = e.target.closest(".trader-identity");
                            if (traderIdentity) {
                                e.preventDefault();
                                walletAddress = _metamask__WEBPACK_IMPORTED_MODULE_0__.provider === null || _metamask__WEBPACK_IMPORTED_MODULE_0__.provider === void 0 ? void 0 : _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.selectedAddress;
                                traderCard = traderIdentity.closest(".trader-card");
                                address = traderCard === null || traderCard === void 0 ? void 0 : traderCard.getAttribute("data-address");
                                if (address) {
                                    _utils__WEBPACK_IMPORTED_MODULE_2__["default"].loadProfile(address, walletAddress);
                                }
                            }
                            btn = e.target.closest("button");
                            if (!btn) return [3 /*break*/, 6];
                            if (!btn.classList.contains("select-trader")) return [3 /*break*/, 2];
                            return [4 /*yield*/, handleSelect(btn)];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 6];
                        case 2:
                            if (!btn.classList.contains("selected")) return [3 /*break*/, 4];
                            return [4 /*yield*/, handleUnselect(btn)];
                        case 3:
                            _a.sent();
                            return [3 /*break*/, 6];
                        case 4:
                            if (!btn.classList.contains("remove-trader")) return [3 /*break*/, 6];
                            return [4 /*yield*/, handleRemove(btn)];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            // Handle auto‐copy toggle switch
            _utils__WEBPACK_IMPORTED_MODULE_2__["default"].watchElementsOfQuery("#mirrorToggle", function (mirrorToggle) {
                // Set initial state based on user's current auto-copy setting
                mirrorToggle.addEventListener("change", function (e) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, handleMirrorToggle(mirrorToggle)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            // Tab‐switching logic
            _utils__WEBPACK_IMPORTED_MODULE_2__["default"].watchElementsOfQuery(".tab-button", function (element) {
                var tabBtn = element;
                tabBtn.addEventListener("click", function () {
                    var tab = tabBtn.getAttribute("data-tab");
                    if (!tab)
                        return;
                    // deactivate all tab buttons and panes
                    document.querySelectorAll(".tab-button").forEach(function (btn) { return btn.classList.remove("active"); });
                    document.querySelectorAll(".tab-pane").forEach(function (p) { return p.classList.remove("active"); });
                    // activate clicked button & its pane
                    tabBtn.classList.add("active");
                    var pane = document.getElementById("".concat(tab, "-tab"));
                    if (pane)
                        pane.classList.add("active");
                });
            });
            return [2 /*return*/];
        });
    });
}
function handleMirrorToggle(toggle) {
    return __awaiter(this, void 0, void 0, function () {
        var wallet, targetEnable, labelText, ts, msg, sig, res, json, err_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(_metamask__WEBPACK_IMPORTED_MODULE_0__.provider === null || _metamask__WEBPACK_IMPORTED_MODULE_0__.provider === void 0 ? void 0 : _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.selectedAddress)) {
                        _utils__WEBPACK_IMPORTED_MODULE_2__["default"].showNotification("Please connect your wallet first", "error");
                        // revert UI toggle if no wallet
                        toggle.checked = !toggle.checked;
                        return [2 /*return*/];
                    }
                    wallet = _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.selectedAddress;
                    targetEnable = toggle.checked;
                    // immediately revert the checkbox so it only reflects confirmed state
                    toggle.checked = !targetEnable;
                    toggle.disabled = true;
                    labelText = (_a = toggle.parentElement) === null || _a === void 0 ? void 0 : _a.nextElementSibling;
                    if (labelText) {
                        labelText.textContent = "Awaiting signature…";
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, 6, 7]);
                    ts = Date.now();
                    msg = "".concat(targetEnable ? "Enable" : "Disable", " auto-copy trading for ").concat(wallet, " at ").concat(ts);
                    return [4 /*yield*/, _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.request({
                            method: "personal_sign",
                            params: [msg, wallet],
                        })];
                case 2:
                    sig = _b.sent();
                    return [4 /*yield*/, fetch("/api/traders/".concat(wallet, "/auto_copy"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ message: msg, signature: sig, timestamp: ts, enable: targetEnable }),
                        })];
                case 3:
                    res = _b.sent();
                    return [4 /*yield*/, res.json()];
                case 4:
                    json = _b.sent();
                    if (!res.ok || !json.success) {
                        throw new Error(json.error || "Failed to update auto-copy setting");
                    }
                    // on success, reflect the new state
                    toggle.checked = targetEnable;
                    if (labelText) {
                        labelText.textContent = targetEnable ? "Disable Auto-Copy" : "Enable Auto-Copy";
                    }
                    _utils__WEBPACK_IMPORTED_MODULE_2__["default"].showNotification("Auto-copy trading ".concat(targetEnable ? "enabled" : "disabled"), "success");
                    return [3 /*break*/, 7];
                case 5:
                    err_1 = _b.sent();
                    console.error(err_1);
                    _utils__WEBPACK_IMPORTED_MODULE_2__["default"].showNotification(err_1.message, "error");
                    // on error, keep it reverted and restore correct label
                    if (labelText) {
                        labelText.textContent = targetEnable ? "Enable Auto-Copy" : "Disable Auto-Copy";
                    }
                    return [3 /*break*/, 7];
                case 6:
                    toggle.disabled = false;
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function handleRemove(button) {
    return __awaiter(this, void 0, void 0, function () {
        var copyAddr, wallet, origText, traderCard_1, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    copyAddr = button.dataset.address;
                    if (!copyAddr)
                        return [2 /*return*/, console.error("No trader address")];
                    if (!(_metamask__WEBPACK_IMPORTED_MODULE_0__.provider === null || _metamask__WEBPACK_IMPORTED_MODULE_0__.provider === void 0 ? void 0 : _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.selectedAddress)) {
                        return [2 /*return*/, _utils__WEBPACK_IMPORTED_MODULE_2__["default"].showNotification("Please connect your wallet first", "error")];
                    }
                    wallet = _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.selectedAddress;
                    origText = button.textContent;
                    button.textContent = "Processing...";
                    button.disabled = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, _profile__WEBPACK_IMPORTED_MODULE_1__["default"].unfavoriteTrader(wallet, copyAddr)];
                case 2:
                    _a.sent();
                    _utils__WEBPACK_IMPORTED_MODULE_2__["default"].showNotification("Trader removed from favorites", "success");
                    traderCard_1 = button.closest(".trader-card") || button.closest(".watchlist-item");
                    if (traderCard_1) {
                        // Add fade-out animation
                        traderCard_1.style.transition = "opacity 0.3s ease-out";
                        traderCard_1.style.opacity = "0";
                        // Remove element after animation completes
                        setTimeout(function () {
                            traderCard_1.remove();
                        }, 300);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _a.sent();
                    console.error(err_2);
                    _utils__WEBPACK_IMPORTED_MODULE_2__["default"].showNotification(err_2.message || "Failed to remove trader", "error");
                    button.textContent = origText;
                    return [3 /*break*/, 5];
                case 4:
                    if (!button.isConnected)
                        return [2 /*return*/]; // Don't try to update if element was removed
                    button.disabled = false;
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function handleSelect(button) {
    return __awaiter(this, void 0, void 0, function () {
        var copyAddr, wallet, origText, ts, msg, sig, res, json, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    copyAddr = button.dataset.address;
                    if (!copyAddr)
                        return [2 /*return*/, console.error("No trader address")];
                    if (!(_metamask__WEBPACK_IMPORTED_MODULE_0__.provider === null || _metamask__WEBPACK_IMPORTED_MODULE_0__.provider === void 0 ? void 0 : _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.selectedAddress)) {
                        return [2 /*return*/, _utils__WEBPACK_IMPORTED_MODULE_2__["default"].showNotification("Please connect your wallet first", "error")];
                    }
                    wallet = _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.selectedAddress;
                    origText = button.textContent;
                    button.textContent = "Processing...";
                    button.disabled = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    ts = Date.now();
                    msg = "Select traders ".concat(copyAddr, " for ").concat(wallet, " at ").concat(ts);
                    return [4 /*yield*/, _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.request({
                            method: "personal_sign",
                            params: [msg, wallet],
                        })];
                case 2:
                    sig = _a.sent();
                    return [4 /*yield*/, fetch("/api/traders/".concat(wallet, "/select_traders"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                traderAddresses: [copyAddr],
                                signature: sig,
                                message: msg,
                                timestamp: ts,
                            }),
                        })];
                case 3:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 4:
                    json = _a.sent();
                    if (!res.ok || !json.success) {
                        throw new Error(json.error || "Failed to select trader");
                    }
                    _utils__WEBPACK_IMPORTED_MODULE_2__["default"].showNotification("Trader selected", "success");
                    button.textContent = "✓ Selected for Copying";
                    button.classList.replace("select-trader", "unselect-trader");
                    button.classList.replace("btn-primary", "btn-success");
                    button.classList.add("selected");
                    return [3 /*break*/, 7];
                case 5:
                    err_3 = _a.sent();
                    console.error(err_3);
                    _utils__WEBPACK_IMPORTED_MODULE_2__["default"].showNotification(err_3.message, "error");
                    button.textContent = origText;
                    return [3 /*break*/, 7];
                case 6:
                    button.disabled = false;
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function handleUnselect(button) {
    return __awaiter(this, void 0, void 0, function () {
        var copyAddr, wallet, origText, ts, msg, sig, res, json, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    copyAddr = button.dataset.address;
                    if (!copyAddr)
                        return [2 /*return*/, console.error("No trader address")];
                    if (!(_metamask__WEBPACK_IMPORTED_MODULE_0__.provider === null || _metamask__WEBPACK_IMPORTED_MODULE_0__.provider === void 0 ? void 0 : _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.selectedAddress)) {
                        return [2 /*return*/, _utils__WEBPACK_IMPORTED_MODULE_2__["default"].showNotification("Please connect your wallet first", "error")];
                    }
                    wallet = _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.selectedAddress;
                    origText = button.textContent;
                    button.textContent = "Processing...";
                    button.disabled = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    ts = Date.now();
                    msg = "Unselect traders ".concat(copyAddr, " for ").concat(wallet, " at ").concat(ts);
                    return [4 /*yield*/, _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.request({
                            method: "personal_sign",
                            params: [msg, wallet],
                        })];
                case 2:
                    sig = _a.sent();
                    return [4 /*yield*/, fetch("/api/traders/".concat(wallet, "/unselect_traders"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                traderAddresses: [copyAddr],
                                signature: sig,
                                message: msg,
                                timestamp: ts,
                            }),
                        })];
                case 3:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 4:
                    json = _a.sent();
                    if (!res.ok || !json.success) {
                        throw new Error(json.error || "Failed to unselect trader");
                    }
                    _utils__WEBPACK_IMPORTED_MODULE_2__["default"].showNotification("Trader unselected", "success");
                    button.textContent = "Select for Copying";
                    button.classList.replace("unselect-trader", "select-trader");
                    button.classList.replace("btn-success", "btn-primary");
                    button.classList.remove("selected");
                    return [3 /*break*/, 7];
                case 5:
                    err_4 = _a.sent();
                    console.error(err_4);
                    _utils__WEBPACK_IMPORTED_MODULE_2__["default"].showNotification(err_4.message, "error");
                    button.textContent = origText;
                    return [3 /*break*/, 7];
                case 6:
                    button.disabled = false;
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({ init: init });


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
/* harmony import */ var _profile__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./profile */ "./static/ts-front-end/profile.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ "./static/ts-front-end/utils.ts");
/* harmony import */ var _watchlist__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./watchlist */ "./static/ts-front-end/watchlist.ts");
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
window.addEventListener("popstate", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Popstate event detected, loading content for current page...");
                return [4 /*yield*/, _utils__WEBPACK_IMPORTED_MODULE_2__["default"].loadContentForCurrentPage()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// Main application initialization
document.addEventListener("DOMContentLoaded", function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_1, topTradersBtn, myWatchListBtn, connectButton;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("DOM loaded, setting up DEXMT...");
                _profile__WEBPACK_IMPORTED_MODULE_1__["default"].init();
                _watchlist__WEBPACK_IMPORTED_MODULE_3__["default"].init();
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
                _utils__WEBPACK_IMPORTED_MODULE_2__["default"].showToast("Initialization error", "error");
                return [3 /*break*/, 5];
            case 5: 
            // Load content based on current URL
            return [4 /*yield*/, _utils__WEBPACK_IMPORTED_MODULE_2__["default"].loadContentForCurrentPage()];
            case 6:
                // Load content based on current URL
                _a.sent();
                topTradersBtn = document.getElementById("topTradersBtn");
                myWatchListBtn = document.getElementById("myWatchListBtn");
                if (topTradersBtn) {
                    topTradersBtn.addEventListener("click", function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, _utils__WEBPACK_IMPORTED_MODULE_2__["default"].loadContent({
                                        apiUrl: "/api/html/toptraders",
                                        browserUrl: "/toptraders",
                                        title: "Top Traders",
                                    })];
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
                                    return [4 /*yield*/, _utils__WEBPACK_IMPORTED_MODULE_2__["default"].loadContent({
                                            apiUrl: "/api/html/mywatchlist",
                                            browserUrl: "/mywatchlist",
                                            title: "My Watchlist",
                                            walletAddr: walletAddress || undefined,
                                        })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                }
                // Add click listeners to trader rows
                document.addEventListener("click", function (event) { return __awaiter(void 0, void 0, void 0, function () {
                    var traderRow, address, walletAddress;
                    return __generator(this, function (_a) {
                        traderRow = event.target.closest("tr");
                        if (!traderRow)
                            return [2 /*return*/];
                        address = traderRow.getAttribute("address");
                        if (!address)
                            return [2 /*return*/];
                        walletAddress = _metamask__WEBPACK_IMPORTED_MODULE_0__.provider === null || _metamask__WEBPACK_IMPORTED_MODULE_0__.provider === void 0 ? void 0 : _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.selectedAddress;
                        _utils__WEBPACK_IMPORTED_MODULE_2__["default"].loadProfile(address, walletAddress);
                        return [2 /*return*/];
                    });
                }); });
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
    _utils__WEBPACK_IMPORTED_MODULE_2__["default"].showToast("An error occurred. Please refresh the page.", "error");
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