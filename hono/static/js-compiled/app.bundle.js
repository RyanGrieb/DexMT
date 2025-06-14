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
        var connectButton, connected, svg, buttonText, walletAddress, networkStatus, address;
        return __generator(this, function (_a) {
            connectButton = document.getElementById("connectButton");
            if (!connectButton)
                return [2 /*return*/];
            connected = (provider === null || provider === void 0 ? void 0 : provider.isConnected()) && provider.selectedAddress;
            svg = document.getElementById("connectWalletIcon");
            console.log("Updating wallet UI, connected: ".concat(connected, " svg: ").concat(svg));
            buttonText = connectButton.querySelector("p");
            if (buttonText) {
                buttonText.innerHTML = "".concat(connected ? "Disconnect Wallet" : "Connect Wallet");
            }
            if (svg) {
                if (connected) {
                    svg.classList.add("hidden");
                }
                else {
                    svg.classList.remove("hidden");
                }
            }
            walletAddress = document.getElementById("walletAddress");
            networkStatus = document.getElementById("networkStatus");
            if (!walletAddress || !networkStatus)
                return [2 /*return*/];
            if (connected) {
                address = provider.selectedAddress;
                walletAddress.textContent = "".concat(address.slice(0, 6), "...").concat(address.slice(-4));
                walletAddress.style.display = "inline-block";
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
                walletAddress.textContent = "";
                walletAddress.style.display = "none";
                networkStatus.textContent = "";
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

/***/ "./static/ts-front-end/router.ts":
/*!***************************************!*\
  !*** ./static/ts-front-end/router.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Router: () => (/* binding */ Router),
/* harmony export */   router: () => (/* binding */ router),
/* harmony export */   routes: () => (/* binding */ routes)
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
var routes = [
    {
        path: "/toptraders",
        view: "top-traders",
        title: "Top Traders - DEXMT",
    },
    {
        path: "/mywatchlist",
        view: "watch-list",
        title: "My Watch List - DEXMT",
    },
];
var Router = /** @class */ (function () {
    function Router() {
        var _this = this;
        this.currentView = "top-traders";
        // Listen for browser back/forward navigation
        window.addEventListener("popstate", function (event) {
            var _a;
            var view = ((_a = event.state) === null || _a === void 0 ? void 0 : _a.view) || _this.getViewFromPath();
            _this.loadView(view, false); // false = don't push to history
        });
    }
    // Get view from current URL path
    Router.prototype.getViewFromPath = function () {
        var path = window.location.pathname;
        var route = routes.find(function (r) { return r.path === path; });
        return (route === null || route === void 0 ? void 0 : route.view) || "top-traders";
    };
    // Navigate to a specific view
    Router.prototype.navigateTo = function (view, pushToHistory) {
        if (pushToHistory === void 0) { pushToHistory = true; }
        var route = routes.find(function (r) { return r.view === view; });
        if (!route)
            return;
        if (pushToHistory) {
            window.history.pushState({ view: view }, route.title, route.path);
        }
        document.title = route.title;
        this.currentView = view;
        this.loadView(view, false);
    };
    // Load view content and update UI
    Router.prototype.loadView = function (view_1) {
        return __awaiter(this, arguments, void 0, function (view, pushToHistory) {
            var error_1, showToast;
            if (pushToHistory === void 0) { pushToHistory = true; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 7]);
                        // Update navigation buttons
                        this.updateNavigationButtons(view);
                        if (!(view === "top-traders")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.loadTopTraders()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(view === "watch-list")) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.loadWatchList()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        this.currentView = view;
                        return [3 /*break*/, 7];
                    case 5:
                        error_1 = _a.sent();
                        console.error("Error loading ".concat(view, " view:"), error_1);
                        return [4 /*yield*/, Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ./utils */ "./static/ts-front-end/utils.ts"))];
                    case 6:
                        showToast = (_a.sent()).showToast;
                        showToast("Failed to load ".concat(view.replace("-", " ")), "error");
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Router.prototype.loadTopTraders = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, html, indexContent, updateUsersUI;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/html/top-traders.html")];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.text()];
                    case 2:
                        html = _a.sent();
                        indexContent = document.querySelector(".index-content");
                        if (!indexContent) return [3 /*break*/, 4];
                        indexContent.innerHTML = html;
                        return [4 /*yield*/, __webpack_require__.e(/*! import() */ "static_ts-front-end_user-info_ts-static_ts-front-end_users_ts").then(__webpack_require__.bind(__webpack_require__, /*! ./users */ "./static/ts-front-end/users.ts"))];
                    case 3:
                        updateUsersUI = (_a.sent()).updateUsersUI;
                        updateUsersUI();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Router.prototype.loadWatchList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var showWatchList;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, __webpack_require__.e(/*! import() */ "static_ts-front-end_watch-list_ts").then(__webpack_require__.bind(__webpack_require__, /*! ./watch-list */ "./static/ts-front-end/watch-list.ts"))];
                    case 1:
                        showWatchList = (_a.sent()).showWatchList;
                        showWatchList();
                        return [2 /*return*/];
                }
            });
        });
    };
    Router.prototype.updateNavigationButtons = function (view) {
        var topTradersBtn = document.getElementById("topTradersBtn");
        var myWatchListBtn = document.getElementById("myWatchListBtn");
        if (topTradersBtn && myWatchListBtn) {
            // Remove active class from both
            topTradersBtn.classList.remove("active");
            myWatchListBtn.classList.remove("active");
            // Add active class to current view
            if (view === "top-traders") {
                topTradersBtn.classList.add("active");
            }
            else if (view === "watch-list") {
                myWatchListBtn.classList.add("active");
            }
        }
    };
    // Initialize router and load current view
    Router.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var initialView;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        initialView = this.getViewFromPath();
                        return [4 /*yield*/, this.loadView(initialView, false)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Get current view
    Router.prototype.getCurrentView = function () {
        return this.currentView;
    };
    return Router;
}());

// Export singleton instance
var router = new Router();


/***/ }),

/***/ "./static/ts-front-end/trades.ts":
/*!***************************************!*\
  !*** ./static/ts-front-end/trades.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   displayUserTrades: () => (/* binding */ displayUserTrades),
/* harmony export */   fetchUserTrades: () => (/* binding */ fetchUserTrades),
/* harmony export */   updateTradesUI: () => (/* binding */ updateTradesUI)
/* harmony export */ });
function updateTradesUI() {
    console.log("Updating trades UI...");
    // TODO: Implement trades UI update
}
function fetchUserTrades(userAddress) {
    console.log("Fetching trades for user: ".concat(userAddress));
    return fetch("/api/trades/".concat(userAddress))
        .then(function (response) { return response.json(); })
        .then(function (trades) {
        console.log("Loaded ".concat(trades.length, " trades for ").concat(userAddress));
        return trades;
    })
        .catch(function (error) {
        console.error("Error fetching trades:", error);
        return [];
    });
}
function displayUserTrades(trades) {
    // TODO: Implement trade display logic
    console.log("Displaying trades:", trades);
}
// Export to global window (for compatibility)
window.TradesManager = {
    updateTradesUI: updateTradesUI,
    fetchUserTrades: fetchUserTrades,
    displayUserTrades: displayUserTrades,
};


/***/ }),

/***/ "./static/ts-front-end/utils.ts":
/*!**************************************!*\
  !*** ./static/ts-front-end/utils.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createElement: () => (/* binding */ createElement),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   formatCurrency: () => (/* binding */ formatCurrency),
/* harmony export */   formatNumber: () => (/* binding */ formatNumber),
/* harmony export */   formatPercentage: () => (/* binding */ formatPercentage),
/* harmony export */   formatTimestamp: () => (/* binding */ formatTimestamp),
/* harmony export */   isValidAddress: () => (/* binding */ isValidAddress),
/* harmony export */   showToast: () => (/* binding */ showToast),
/* harmony export */   timeAgo: () => (/* binding */ timeAgo),
/* harmony export */   truncateAddress: () => (/* binding */ truncateAddress)
/* harmony export */ });
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
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
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
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".app.bundle.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		var inProgress = {};
/******/ 		var dataWebpackPrefix = "hono:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 		
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
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
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "/js/";
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.f.j = (chunkId, promises) => {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 		
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(true) { // all chunks have JS
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
/******/ 							promises.push(installedChunkData[2] = promise);
/******/ 		
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							var loadingEnded = (event) => {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) {
/******/ 										var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										var realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 		};
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 		
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkhono"] = self["webpackChunkhono"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
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
/* harmony import */ var _router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./router */ "./static/ts-front-end/router.ts");
/* harmony import */ var _trades__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./trades */ "./static/ts-front-end/trades.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils */ "./static/ts-front-end/utils.ts");
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
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
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
                // Initialize router and load the appropriate view based on URL
                return [4 /*yield*/, _router__WEBPACK_IMPORTED_MODULE_1__.router.init()];
            case 4:
                // Initialize router and load the appropriate view based on URL
                _a.sent();
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                console.error("Error during initialization:", error_1);
                (0,_utils__WEBPACK_IMPORTED_MODULE_3__.showToast)("Failed to initialize application", "error");
                return [3 /*break*/, 6];
            case 6:
                topTradersBtn = document.getElementById("topTradersBtn");
                myWatchListBtn = document.getElementById("myWatchListBtn");
                if (topTradersBtn) {
                    topTradersBtn.addEventListener("click", function () {
                        _router__WEBPACK_IMPORTED_MODULE_1__.router.navigateTo("top-traders");
                    });
                }
                if (myWatchListBtn) {
                    myWatchListBtn.addEventListener("click", function () {
                        _router__WEBPACK_IMPORTED_MODULE_1__.router.navigateTo("watch-list");
                    });
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
                (0,_trades__WEBPACK_IMPORTED_MODULE_2__.updateTradesUI)();
                console.log("DEXMT setup complete");
                return [2 /*return*/];
        }
    });
}); });
// Global error handler
window.addEventListener("error", function (event) {
    console.error("Global error:", event.error);
    (0,_utils__WEBPACK_IMPORTED_MODULE_3__.showToast)("An error occurred. Please refresh the page.", "error");
});
// Export for debugging/compatibility
window.DEXMT = {
    version: "1.0.0",
    initialized: true,
    router: _router__WEBPACK_IMPORTED_MODULE_1__.router,
};

})();

/******/ })()
;
//# sourceMappingURL=app.bundle.js.map