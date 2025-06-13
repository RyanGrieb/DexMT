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
/* harmony export */   connectWallet: () => (/* binding */ connectWallet),
/* harmony export */   disconnectWallet: () => (/* binding */ disconnectWallet),
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
        var connectButton, walletAddress, networkStatus, address;
        var _a;
        return __generator(this, function (_b) {
            connectButton = document.getElementById("connectButton");
            walletAddress = document.getElementById("walletAddress");
            networkStatus = document.getElementById("networkStatus");
            console.log("1");
            if (!connectButton || !walletAddress || !networkStatus)
                return [2 /*return*/];
            if (provider === null || provider === void 0 ? void 0 : provider.isConnected) {
                connectButton.textContent = "Disconnect Wallet";
                address = (_a = provider.selectedAddress) !== null && _a !== void 0 ? _a : "";
                walletAddress.textContent = address
                    ? "".concat(address.slice(0, 6), "...").concat(address.slice(-4))
                    : "";
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
                connectButton.textContent = "Connect Wallet";
                walletAddress.textContent = "";
                networkStatus.textContent = "";
            }
            return [2 /*return*/];
        });
    });
}
function connectWallet() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!provider) return [3 /*break*/, 2];
                    return [4 /*yield*/, waitForMetaMaskProvider()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    if (!provider)
                        return [2 /*return*/];
                    // EIP-2255 / EIP-6963 style grant
                    return [4 /*yield*/, provider.request({
                            method: "wallet_requestPermissions",
                            params: [{ eth_accounts: {} }],
                        })];
                case 3:
                    // EIP-2255 / EIP-6963 style grant
                    _a.sent();
                    // selectedAddress will now be set
                    console.log("Connected account:", provider.selectedAddress);
                    updateWalletUI();
                    return [2 /*return*/];
            }
        });
    });
}
function disconnectWallet() {
    return __awaiter(this, void 0, void 0, function () {
        var fetchError_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Disconnecting wallet...");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
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
                    provider = null;
                    updateWalletUI();
                    console.log("Wallet disconnected successfully");
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error("Error disconnecting wallet:", error_1);
                    provider = null;
                    updateWalletUI();
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/** Wait until MetaMask injects the provider per EIP-6963 */
function waitForMetaMaskProvider() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _metamask_detect_provider__WEBPACK_IMPORTED_MODULE_0___default()({
                        mustBeMetaMask: true,
                        silent: false,
                    })];
                case 1:
                    provider = (_a.sent());
                    if (!provider) {
                        console.error("MetaMask not detected");
                        return [2 /*return*/];
                    }
                    // wire up listeners with proper args signature
                    provider.on("accountsChanged", function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        var accounts = args[0];
                        handleAccountsChanged(accounts);
                    });
                    provider.on("chainChanged", function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        var chainId = args[0];
                        handleChainChanged(chainId);
                    });
                    provider.on("connect", function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        console.log("MetaMask connected", args[0]);
                    });
                    provider.on("disconnect", function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        console.log("MetaMask disconnected", args[0]);
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function handleAccountsChanged(accounts) {
    console.log("Accounts changed (detected):", accounts);
    updateWalletUI();
}
function handleChainChanged(chainId) {
    console.log("Chain changed (detected) to:", chainId);
    updateNetworkStatus(chainId);
}


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

/***/ "./static/ts-front-end/user-info.ts":
/*!******************************************!*\
  !*** ./static/ts-front-end/user-info.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   abbreviateNumber: () => (/* binding */ abbreviateNumber),
/* harmony export */   showUserInfo: () => (/* binding */ showUserInfo)
/* harmony export */ });
var currentUser = null;
var currentPeriod = "today";
function showUserInfo(user) {
    currentUser = user;
    // Load user info HTML
    fetch("/html/user-info.html")
        .then(function (response) { return response.text(); })
        .then(function (html) {
        var indexContent = document.querySelector(".index-content");
        if (indexContent) {
            indexContent.innerHTML = html;
            initializeUserInfo();
            populateUserData(user);
            loadUserPositions(user.address);
        }
    })
        .catch(function (error) {
        console.error("Error loading user info:", error);
    });
}
function initializeUserInfo() {
    // Back button
    var backButton = document.getElementById("backToUsers");
    if (backButton) {
        backButton.addEventListener("click", function () {
            // Reload the main view
            location.reload();
        });
    }
    // Time period tabs
    var timeTabs = document.querySelectorAll(".time-tab");
    timeTabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            // Remove active class from all tabs
            timeTabs.forEach(function (t) { return t.classList.remove("active"); });
            // Add active class to clicked tab
            tab.classList.add("active");
            var period = tab.getAttribute("data-period");
            if (period) {
                currentPeriod = period;
                updatePerformanceMetrics(period);
            }
        });
    });
}
function populateUserData(user) {
    // User avatar
    var userAvatar = document.getElementById("userAvatar");
    if (userAvatar) {
        var addressHash = user.address.slice(2, 4).toUpperCase();
        userAvatar.textContent = addressHash;
        userAvatar.style.background = "linear-gradient(135deg, #bb86fc, #03dac6)";
    }
    // User address
    var userAddress = document.getElementById("userAddress");
    if (userAddress) {
        userAddress.textContent = user.address;
    }
    // Platform and rank
    var userPlatform = document.getElementById("userPlatform");
    if (userPlatform) {
        userPlatform.textContent = user.dex_platform || "Unknown Platform";
    }
    var userRank = document.getElementById("userRank");
    if (userRank) {
        userRank.textContent = "#".concat(user.platform_ranking || "Unranked");
    }
    // Load initial performance metrics
    updatePerformanceMetrics("today");
}
function updatePerformanceMetrics(period) {
    // Mock data - replace with actual API calls later
    var mockData = {
        today: {
            pnl: 1250.5,
            pnlPercentage: 2.35,
            volume: 125000,
            avgSize: 5000,
            winRate: 65.5,
            totalTrades: 8,
        },
        yesterday: {
            pnl: -580.25,
            pnlPercentage: -1.12,
            volume: 89000,
            avgSize: 4800,
            winRate: 45.2,
            totalTrades: 12,
        },
        "7d": {
            pnl: 8950.75,
            pnlPercentage: 15.8,
            volume: 850000,
            avgSize: 5200,
            winRate: 58.3,
            totalTrades: 67,
        },
        "30d": {
            pnl: 25680.3,
            pnlPercentage: 45.2,
            volume: 3200000,
            avgSize: 4900,
            winRate: 62.1,
            totalTrades: 245,
        },
        year: {
            pnl: 156000.8,
            pnlPercentage: 312.5,
            volume: 15600000,
            avgSize: 5100,
            winRate: 59.8,
            totalTrades: 1204,
        },
        all: {
            pnl: 245000.5,
            pnlPercentage: 485.2,
            volume: 25000000,
            avgSize: 5050,
            winRate: 61.2,
            totalTrades: 1856,
        },
    };
    var data = mockData[period];
    if (!data)
        return;
    // Update PNL
    var pnlValue = document.getElementById("pnlValue");
    var pnlPercentage = document.getElementById("pnlPercentage");
    if (pnlValue && pnlPercentage) {
        var pnlClass = data.pnl >= 0 ? "positive" : "negative";
        var pnlSign = data.pnl >= 0 ? "+" : "";
        pnlValue.textContent = "".concat(pnlSign, "$").concat(Math.abs(data.pnl).toLocaleString());
        pnlValue.className = "metric-value pnl ".concat(pnlClass);
        pnlPercentage.textContent = "".concat(pnlSign).concat(data.pnlPercentage.toFixed(2), "%");
        pnlPercentage.className = "metric-value pnl ".concat(pnlClass);
    }
    // Update other metrics
    var volumeValue = document.getElementById("volumeValue");
    if (volumeValue) {
        volumeValue.textContent = "$".concat(data.volume.toLocaleString());
    }
    var avgSizeValue = document.getElementById("avgSizeValue");
    if (avgSizeValue) {
        avgSizeValue.textContent = "$".concat(data.avgSize.toLocaleString());
    }
    var winRateValue = document.getElementById("winRateValue");
    if (winRateValue) {
        winRateValue.textContent = "".concat(data.winRate.toFixed(1), "%");
    }
    var totalTradesValue = document.getElementById("totalTradesValue");
    if (totalTradesValue) {
        totalTradesValue.textContent = data.totalTrades.toString();
    }
}
function loadUserPositions(userAddress) {
    // Mock positions data - replace with actual API call later
    var mockPositions = [
        {
            market: "ETH/USD",
            side: "LONG",
            leverage: "10.5x",
            size: "$12,500",
            netValue: "+$1,250",
            collateral: "$1,190",
            entryPrice: "$3,250.50",
            markPrice: "$3,352.80",
            liqPrice: "$2,890.25",
        },
        {
            market: "BTC/USD",
            side: "SHORT",
            leverage: "5.2x",
            size: "$8,750",
            netValue: "-$420",
            collateral: "$1,680",
            entryPrice: "$65,280.00",
            markPrice: "$64,850.50",
            liqPrice: "$78,350.00",
        },
    ];
    var positionsList = document.querySelector(".positions-list");
    if (!positionsList)
        return;
    var fragment = document.createDocumentFragment();
    if (mockPositions.length > 0) {
        mockPositions.forEach(function (position) {
            var sideClass = position.side.toLowerCase();
            var netValueClass = position.netValue.startsWith("+")
                ? "positive"
                : "negative";
            var positionRow = document.createElement("tr");
            positionRow.className = "position-item";
            positionRow.innerHTML = "\n        <td class=\"position-side ".concat(sideClass, "\">\n          ").concat(position.side, " ").concat(position.market, "\n        </td>\n        <td class=\"position-leverage\">").concat(position.leverage, "</td>\n        <td class=\"position-size\">").concat(position.size, "</td>\n        <td class=\"position-net-value ").concat(netValueClass, "\">").concat(position.netValue, "</td>\n        <td class=\"position-collateral\">").concat(position.collateral, "</td>\n        <td class=\"position-entry-price\">").concat(position.entryPrice, "</td>\n        <td class=\"position-mark-price\">").concat(position.markPrice, "</td>\n        <td class=\"position-liq-price\">").concat(position.liqPrice, "</td>\n      ");
            fragment.appendChild(positionRow);
        });
    }
    else {
        var emptyRow = document.createElement("tr");
        emptyRow.className = "position-item";
        emptyRow.innerHTML = "\n      <td colspan=\"8\" style=\"text-align:center;color:#666;padding:20px\">\n        No open positions\n      </td>";
        fragment.appendChild(emptyRow);
    }
    positionsList.replaceChildren(fragment);
}
function abbreviateNumber(value) {
    if (Math.abs(value) >= 1e6) {
        return (value / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (Math.abs(value) >= 1e3) {
        return (value / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return value.toString();
}


/***/ }),

/***/ "./static/ts-front-end/users.ts":
/*!**************************************!*\
  !*** ./static/ts-front-end/users.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   abbreviateNumber: () => (/* binding */ abbreviateNumber),
/* harmony export */   generateIconColor: () => (/* binding */ generateIconColor),
/* harmony export */   updateUsersUI: () => (/* binding */ updateUsersUI)
/* harmony export */ });
/* harmony import */ var _user_info__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./user-info */ "./static/ts-front-end/user-info.ts");

function abbreviateNumber(value) {
    var num = Number(value) || 0;
    if (Math.abs(num) >= 1e6) {
        return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (Math.abs(num) >= 1e3) {
        return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
}
function updateUsersUI() {
    var usersList = document.querySelector(".user-list");
    if (!usersList) {
        console.warn("User list element not found");
        return;
    }
    fetch("/api/users")
        .then(function (res) { return res.json(); })
        .then(function (users) {
        var fragment = document.createDocumentFragment();
        if (Array.isArray(users) && users.length > 0) {
            users.forEach(function (user, index) {
                var _a;
                var pnlValue = Number(user.pnlPercentage) || 0;
                var pnlClass = pnlValue >= 0 ? "positive" : "negative";
                var pnlText = pnlValue.toFixed(2);
                var sizeText = abbreviateNumber((_a = user.avgSize) !== null && _a !== void 0 ? _a : 0);
                var leverageValue = Number(user.avgLeverage) || 0;
                var leverageText = leverageValue.toFixed(1);
                var winRatioValue = Number(user.winRatio) || 0;
                var winRatioText = winRatioValue.toFixed(2);
                var watchingCount = user.watching || 0;
                // Get platform icon
                var platformIcon = getPlatformIcon(user.dex_platform);
                var addressHash = user.address.slice(2, 4).toUpperCase();
                var userRow = document.createElement("tr");
                userRow.className = "user-item";
                userRow.innerHTML = "\n            <td class=\"user-rank\">#".concat(user.platform_ranking || index + 1, "</td>\n            <td class=\"user-platform\">").concat(platformIcon, "</td>\n            <td class=\"user-trader\">\n              <div class=\"trader-icon\">").concat(addressHash, "</div>\n              <div class=\"trader-address\">\n                ").concat(user.address.slice(0, 6), "...").concat(user.address.slice(-4), "\n              </div>\n            </td>\n            <td class=\"user-pnl ").concat(pnlClass, "\">").concat(pnlText, "%</td>\n            <td class=\"user-size\">").concat(sizeText, "</td>\n            <td class=\"user-leverage\">").concat(leverageText, "x</td>\n            <td class=\"user-winratio\">").concat(winRatioText, "</td>\n            <td class=\"user-watching\">").concat(watchingCount, "</td>\n          ");
                userRow.addEventListener("click", function () { return selectUser(user); });
                fragment.appendChild(userRow);
            });
        }
        else {
            var emptyRow = document.createElement("tr");
            emptyRow.className = "user-item";
            emptyRow.innerHTML = "\n          <td colspan=\"8\" style=\"text-align:center;color:#666;padding:20px\">\n            No users found\n          </td>";
            fragment.appendChild(emptyRow);
        }
        usersList.replaceChildren(fragment);
        console.log("Loaded ".concat(users.length, " users"));
    })
        .catch(function (error) {
        console.error("Error fetching users:", error);
        var fragment = document.createDocumentFragment();
        var errorRow = document.createElement("tr");
        errorRow.className = "user-item";
        errorRow.innerHTML = "\n        <td colspan=\"8\" style=\"text-align:center;color:#f44336;padding:20px\">\n          Failed to load users\n        </td>";
        fragment.appendChild(errorRow);
        usersList.replaceChildren(fragment);
    });
}
function getPlatformIcon(platform) {
    if (!platform) {
        return '<span style="color:#666;">-</span>';
    }
    var platformLower = platform.toLowerCase();
    switch (platformLower) {
        case "gmx":
            return "\n        <svg width=\"24\" height=\"24\" viewBox=\"0 0 30 30\" xmlns=\"http://www.w3.org/2000/svg\">\n          <defs>\n            <linearGradient id=\"gmx-gradient\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\">\n              <stop offset=\"0%\" style=\"stop-color:#4f46e5;stop-opacity:1\" />\n              <stop offset=\"100%\" style=\"stop-color:#06b6d4;stop-opacity:1\" />\n            </linearGradient>\n          </defs>\n          <path fill=\"url(#gmx-gradient)\" transform=\"translate(-525.667 -696) scale(1)\" d=\"m555.182 717.462-14.735-21.462-14.78 21.462h20.592l-5.812-8.191-2.883 4.256h-3.064l5.949-8.557 8.6 12.493z\"/>\n        </svg>\n      ";
        case "dydx":
            return "<span style=\"font-size:0.75rem;color:#888;\">DYDX</span>";
        case "hyperliquid":
            return "<span style=\"font-size:0.75rem;color:#888;\">HL</span>";
        default:
            // Fallback to text if no icon available
            return "<span style=\"font-size:0.75rem;color:#888;\">".concat(platform.toUpperCase(), "</span>");
    }
}
function selectUser(user) {
    console.log("User selected:", user);
    (0,_user_info__WEBPACK_IMPORTED_MODULE_0__.showUserInfo)(user);
}
function generateIconColor(address) {
    var hash = address.slice(2, 8);
    var r = parseInt(hash.slice(0, 2), 16);
    var g = parseInt(hash.slice(2, 4), 16);
    var b = parseInt(hash.slice(4, 6), 16);
    return "rgb(".concat(r, ", ").concat(g, ", ").concat(b, ")");
}
// Export to global window (for compatibility)
window.UsersManager = {
    updateUsersUI: updateUsersUI,
    abbreviateNumber: abbreviateNumber,
    generateIconColor: generateIconColor,
    selectUser: selectUser,
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
// Export to global window (for compatibility)
window.Utils = {
    formatNumber: formatNumber,
    formatCurrency: formatCurrency,
    formatPercentage: formatPercentage,
    truncateAddress: truncateAddress,
    isValidAddress: isValidAddress,
    formatTimestamp: formatTimestamp,
    timeAgo: timeAgo,
    createElement: createElement,
    showToast: showToast,
};


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
/* harmony import */ var _trades__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./trades */ "./static/ts-front-end/trades.ts");
/* harmony import */ var _users__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./users */ "./static/ts-front-end/users.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils */ "./static/ts-front-end/utils.ts");
// Import only what you need from each module




console.log("DEXMT JS file loaded");
// Main application initialization
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM loaded, setting up DEXMT...");
    // Setup wallet connection button
    var connectButton = document.getElementById("connectButton");
    if (connectButton) {
        connectButton.addEventListener("click", function () {
            if (_metamask__WEBPACK_IMPORTED_MODULE_0__.provider === null || _metamask__WEBPACK_IMPORTED_MODULE_0__.provider === void 0 ? void 0 : _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.isConnected()) {
                (0,_metamask__WEBPACK_IMPORTED_MODULE_0__.disconnectWallet)();
            }
            else {
                (0,_metamask__WEBPACK_IMPORTED_MODULE_0__.connectWallet)();
            }
        });
    }
    // Initialize users UI
    (0,_users__WEBPACK_IMPORTED_MODULE_2__.updateUsersUI)();
    // Refresh users every 10 seconds
    setInterval(_users__WEBPACK_IMPORTED_MODULE_2__.updateUsersUI, 10000);
    // Initialize trades UI
    (0,_trades__WEBPACK_IMPORTED_MODULE_1__.updateTradesUI)();
    console.log("DEXMT setup complete");
});
// Global error handler
window.addEventListener("error", function (event) {
    console.error("Global error:", event.error);
    (0,_utils__WEBPACK_IMPORTED_MODULE_3__.showToast)("An error occurred. Please refresh the page.", "error");
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