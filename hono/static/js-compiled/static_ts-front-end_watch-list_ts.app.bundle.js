"use strict";
(self["webpackChunkhono"] = self["webpackChunkhono"] || []).push([["static_ts-front-end_watch-list_ts"],{

/***/ "./static/ts-front-end/watch-list.ts":
/*!*******************************************!*\
  !*** ./static/ts-front-end/watch-list.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   showWatchList: () => (/* binding */ showWatchList)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./static/ts-front-end/utils.ts");
/* harmony import */ var _watch_list_watched_traders__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./watch-list/watched-traders */ "./static/ts-front-end/watch-list/watched-traders.ts");


var watchedPositions = [];
var copyConfig = {
    maxPositionSize: 1000,
    maxLeverage: 5,
    riskPercentage: 2,
    allowedTokens: ["ETH", "BTC"],
    autoCopyEnabled: false,
    stopLossEnabled: false,
    stopLossPercent: 10,
    takeProfitEnabled: false,
    takeProfitPercent: 20,
};
function showWatchList() {
    // Load watch list HTML
    fetch("/html/watch-list.html")
        .then(function (response) { return response.text(); })
        .then(function (html) {
        var indexContent = document.querySelector(".index-content");
        if (indexContent) {
            indexContent.innerHTML = html;
            (0,_watch_list_watched_traders__WEBPACK_IMPORTED_MODULE_1__.loadWatchedTraders)();
            // loadCopiedPositions()
            // loadOpenPositions()
        }
    })
        .catch(function (error) {
        console.error("Error loading watch list HTML:", error);
        _utils__WEBPACK_IMPORTED_MODULE_0__["default"].showToast("Failed to load watch list", "error");
    });
}


/***/ }),

/***/ "./static/ts-front-end/watch-list/watched-traders.ts":
/*!***********************************************************!*\
  !*** ./static/ts-front-end/watch-list/watched-traders.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addTraderToWatchList: () => (/* binding */ addTraderToWatchList),
/* harmony export */   getActiveWatchedTraders: () => (/* binding */ getActiveWatchedTraders),
/* harmony export */   getWatchedTraders: () => (/* binding */ getWatchedTraders),
/* harmony export */   handleTraderSelection: () => (/* binding */ handleTraderSelection),
/* harmony export */   loadWatchedTraders: () => (/* binding */ loadWatchedTraders),
/* harmony export */   removeTraderFromWatchList: () => (/* binding */ removeTraderFromWatchList),
/* harmony export */   setupSelectAllCheckbox: () => (/* binding */ setupSelectAllCheckbox),
/* harmony export */   showTraderActionsMenu: () => (/* binding */ showTraderActionsMenu),
/* harmony export */   showTraderConfig: () => (/* binding */ showTraderConfig),
/* harmony export */   showTraderPositions: () => (/* binding */ showTraderPositions),
/* harmony export */   toggleCopyStatus: () => (/* binding */ toggleCopyStatus),
/* harmony export */   updateWatchedTradersUI: () => (/* binding */ updateWatchedTradersUI)
/* harmony export */ });
/* harmony import */ var _metamask__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../metamask */ "./static/ts-front-end/metamask.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./static/ts-front-end/utils.ts");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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


// Cache our HTML templates into memory
var watchedTraderRowTemplate = null;
var traderActionsMenuTemplate = null;
// Store watched traders
var watchedTraders = [];
function getActiveWatchedTraders() {
    return __awaiter(this, void 0, void 0, function () {
        var walletAddress, response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    walletAddress = _metamask__WEBPACK_IMPORTED_MODULE_0__.provider === null || _metamask__WEBPACK_IMPORTED_MODULE_0__.provider === void 0 ? void 0 : _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.selectedAddress;
                    if (!walletAddress) {
                        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Please connect your wallet first", "warning");
                        return [2 /*return*/, []];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/trader/watched?active=true&copierAddress=".concat(walletAddress))];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to fetch active watched traders");
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    return [2 /*return*/, data.active_watched_traders || []];
                case 4:
                    error_1 = _a.sent();
                    console.error("Error fetching active watched traders:", error_1);
                    _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Failed to fetch active watched traders", "error");
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function loadWatchedTraders() {
    return __awaiter(this, void 0, void 0, function () {
        var walletAddress, response, payload, _i, _a, trader, traderAddress, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    walletAddress = _metamask__WEBPACK_IMPORTED_MODULE_0__.provider === null || _metamask__WEBPACK_IMPORTED_MODULE_0__.provider === void 0 ? void 0 : _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.selectedAddress;
                    if (!walletAddress) {
                        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Please connect your wallet first", "warning");
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, fetch("/api/trader/watched?copierAddress=".concat(walletAddress) // Fetch all watched traders for the connected wallet
                        )];
                case 2:
                    response = _b.sent();
                    if (!response.ok) {
                        throw new Error("Failed to load watched traders");
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    payload = (_b.sent());
                    console.log("watched_traders payload:", payload);
                    if (!payload || !Array.isArray(payload.traders)) {
                        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("No watched traders found", "info");
                        return [2 /*return*/];
                    }
                    // Clear existing watched traders
                    watchedTraders = [];
                    // Fetch trader details for each watched trader
                    for (_i = 0, _a = payload.traders; _i < _a.length; _i++) {
                        trader = _a[_i];
                        traderAddress = trader.address;
                        watchedTraders.push({
                            address: traderAddress,
                            copyStatus: "inactive",
                            watching: 0, // Default watching count
                            platform_ranking: trader.platform_ranking, // Default ranking
                            dex_platform: trader.dex_platform, // Default platform
                            pnlPercentage: trader.pnlPercentage, // Default PnL percentage
                            avgSize: trader.avgSize, // Default average size
                            avgLeverage: trader.avgLeverage, // Default average leverage
                            winRatio: trader.winRatio, // Default win ratio,
                            balance: trader.balance, // Default balance,
                            traderId: traderAddress, // Use trader address as ID,
                            chainId: trader.chainId, // Default chain ID,
                            pnl: trader.pnl, // Default PnL
                            updatedAt: trader.updatedAt, // Default updated time
                        });
                    }
                    return [4 /*yield*/, updateWatchedTradersUI()];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _b.sent();
                    console.error("Error loading watched traders:", error_2);
                    _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Failed to load watched traders", "error");
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function updateWatchedTradersUI() {
    return __awaiter(this, void 0, void 0, function () {
        var watchedTradersList, selectedAddresses, fragment, response, error_3, emptyRow;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    watchedTradersList = document.querySelector(".watched-traders-list");
                    if (!watchedTradersList)
                        return [2 /*return*/];
                    return [4 /*yield*/, getActiveWatchedTraders()];
                case 1:
                    selectedAddresses = _a.sent();
                    console.log("Selected addresses:", selectedAddresses);
                    fragment = document.createDocumentFragment();
                    if (!(watchedTraders.length > 0)) return [3 /*break*/, 9];
                    if (!!watchedTraderRowTemplate) return [3 /*break*/, 8];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, , 8]);
                    return [4 /*yield*/, fetch("/html/watched-trader-row.html")];
                case 3:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 5];
                    return [4 /*yield*/, response.text()];
                case 4:
                    watchedTraderRowTemplate = _a.sent();
                    return [3 /*break*/, 6];
                case 5: throw new Error("Failed to load template");
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_3 = _a.sent();
                    console.error("Error loading watched trader row template:", error_3);
                    _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Failed to load template", "error");
                    return [2 /*return*/];
                case 8:
                    watchedTraders.forEach(function (trader, index) {
                        // Create a table to properly parse the tr element
                        var tempTable = document.createElement("table");
                        tempTable.innerHTML = "<tbody>".concat(watchedTraderRowTemplate, "</tbody>");
                        var traderRow = tempTable.querySelector("tr.watched-trader-item");
                        if (traderRow) {
                            // Update elements based on their IDs
                            var addressHash = trader.address.slice(2, 4).toUpperCase();
                            // Trader checkbox
                            var traderCheckbox = traderRow.querySelector("#trader-checkbox");
                            if (traderCheckbox) {
                                traderCheckbox.setAttribute("data-address", trader.address);
                                traderCheckbox.removeAttribute("id");
                                traderCheckbox.className = "trader-checkbox";
                                // Restore checkbox state from localStorage
                                traderCheckbox.checked = selectedAddresses.includes(trader.address);
                            }
                            // Rank
                            var traderRank = traderRow.querySelector("#user-rank");
                            if (traderRank) {
                                traderRank.textContent = "#".concat(trader.platform_ranking || index + 1);
                                traderRank.removeAttribute("id");
                            }
                            // Platform
                            var traderPlatform = traderRow.querySelector("#user-platform");
                            if (traderPlatform) {
                                traderPlatform.innerHTML = _utils__WEBPACK_IMPORTED_MODULE_1__["default"].getPlatformIcon(trader.dex_platform);
                                traderPlatform.removeAttribute("id");
                            }
                            // Trader icon
                            var traderIcon = traderRow.querySelector("#trader-icon");
                            if (traderIcon) {
                                traderIcon.textContent = addressHash;
                                traderIcon.style.background = _utils__WEBPACK_IMPORTED_MODULE_1__["default"].generateIconColor(trader.address);
                                traderIcon.removeAttribute("id");
                            }
                            // Trader address
                            var traderAddress = traderRow.querySelector("#trader-address");
                            if (traderAddress) {
                                traderAddress.textContent = "".concat(trader.address.slice(0, 6), "...").concat(trader.address.slice(-4));
                                traderAddress.removeAttribute("id");
                            }
                            // PNL
                            var traderPnl = traderRow.querySelector("#user-pnl");
                            if (traderPnl) {
                                var pnlValue = Number(trader.pnlPercentage || 0);
                                traderPnl.textContent = "".concat(pnlValue.toFixed(2), "%");
                                traderPnl.className = "user-pnl ".concat(pnlValue >= 0 ? "positive" : "negative");
                                traderPnl.removeAttribute("id");
                            }
                            // Win Ratio
                            var traderWinRatio = traderRow.querySelector("#user-winratio");
                            if (traderWinRatio) {
                                var winRatioValue = Number(trader.winRatio || 0);
                                traderWinRatio.textContent = winRatioValue.toFixed(2);
                                traderWinRatio.removeAttribute("id");
                            }
                            // Watching count
                            var traderWatching = traderRow.querySelector("#user-watching");
                            if (traderWatching) {
                                traderWatching.textContent = (trader.watching || 0).toString();
                                traderWatching.removeAttribute("id");
                            }
                            // Actions button
                            var actionsBtn = traderRow.querySelector("#actions-btn");
                            if (actionsBtn) {
                                actionsBtn.setAttribute("data-address", trader.address);
                                actionsBtn.removeAttribute("id");
                            }
                            // Add click event listener to select trader (same as top-traders)
                            traderRow.addEventListener("click", function (e) {
                                // Don't trigger selection if clicking on checkbox
                                if (!e.target.closest(".trader-checkbox")) {
                                    console.log("Trader row clicked:", trader.address);
                                    //selectTrader(trader);
                                }
                            });
                            // Add event listener for checkbox
                            if (traderCheckbox) {
                                traderCheckbox.addEventListener("change", function (e) {
                                    e.stopPropagation(); // Prevent row click
                                    handleTraderSelection();
                                });
                            }
                            // Add event listener for actions button
                            if (actionsBtn) {
                                actionsBtn.addEventListener("click", function (e) {
                                    e.stopPropagation(); // Prevent row click
                                    showTraderActionsMenu(trader.address, e.target);
                                });
                            }
                            fragment.appendChild(traderRow);
                        }
                    });
                    return [3 /*break*/, 10];
                case 9:
                    emptyRow = document.createElement("tr");
                    emptyRow.className = "watched-trader-item";
                    emptyRow.innerHTML = "\n      <td colspan=\"7\" style=\"text-align:center;color:#666;padding:20px\">\n        No traders in watch list. Click \"Add Trader\" to start watching.\n      </td>\n    ";
                    fragment.appendChild(emptyRow);
                    _a.label = 10;
                case 10:
                    watchedTradersList.replaceChildren(fragment);
                    setupSelectAllCheckbox();
                    return [2 /*return*/];
            }
        });
    });
}
function showTraderActionsMenu(address, button) {
    return __awaiter(this, void 0, void 0, function () {
        var existingMenu, response, error_4, menu, rect, trader, copyToggle, closeMenu;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    existingMenu = document.querySelector(".trader-actions-menu");
                    if (existingMenu) {
                        existingMenu.remove();
                    }
                    if (!!traderActionsMenuTemplate) return [3 /*break*/, 7];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, fetch("/html/trader-actions-menu.html")];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.text()];
                case 3:
                    traderActionsMenuTemplate = _a.sent();
                    return [3 /*break*/, 5];
                case 4: throw new Error("Failed to load menu template");
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_4 = _a.sent();
                    console.error("Error loading trader actions menu template:", error_4);
                    _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Failed to load menu", "error");
                    return [2 /*return*/];
                case 7:
                    menu = document.createElement("div");
                    menu.className = "trader-actions-menu";
                    // Replace TRADER_ADDRESS placeholder in the template with actual address
                    menu.innerHTML = traderActionsMenuTemplate.replace("TRADER_ADDRESS", address);
                    rect = button.getBoundingClientRect();
                    menu.style.position = "fixed";
                    menu.style.top = "".concat(rect.bottom + 5, "px");
                    menu.style.left = "".concat(rect.left, "px");
                    menu.style.zIndex = "1000";
                    trader = watchedTraders.find(function (t) { return t.address === address; });
                    copyToggle = menu.querySelector("#copy-toggle-".concat(address));
                    if (copyToggle && trader) {
                        if (trader.copyStatus === "active") {
                            copyToggle.innerHTML = "\n        <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\">\n          <path fill=\"currentColor\" d=\"M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z\"/>\n        </svg>\n        Stop Copying\n      ";
                        }
                    }
                    // Add event listeners for menu items
                    menu.addEventListener("click", function (e) {
                        var menuItem = e.target.closest(".menu-item");
                        if (!menuItem)
                            return;
                        var action = menuItem.getAttribute("data-action");
                        switch (action) {
                            case "config":
                                showTraderConfig(address);
                                break;
                            case "positions":
                                showTraderPositions(address);
                                break;
                            case "copy":
                                toggleCopyStatus(address);
                                break;
                            case "remove":
                                removeTraderFromWatchList(address);
                                break;
                        }
                        menu.remove();
                    });
                    closeMenu = function (e) {
                        if (!menu.contains(e.target)) {
                            menu.remove();
                            document.removeEventListener("click", closeMenu);
                        }
                    };
                    document.addEventListener("click", closeMenu);
                    document.body.appendChild(menu);
                    return [2 /*return*/];
            }
        });
    });
}
function addTraderToWatchList(address) {
    return __awaiter(this, void 0, void 0, function () {
        var response, traderData, watchedTrader, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    // Validate address format
                    if (!address.startsWith("0x") || address.length !== 42) {
                        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Invalid address format", "error");
                        return [2 /*return*/];
                    }
                    // Check if already watching
                    if (watchedTraders.some(function (trader) { return trader.address.toLowerCase() === address.toLowerCase(); })) {
                        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Already watching this trader", "warning");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetch("/api/users/".concat(address))];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Trader not found");
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    traderData = _a.sent();
                    watchedTrader = __assign(__assign({}, traderData), { copyStatus: "inactive", watching: 0 });
                    watchedTraders.push(watchedTrader);
                    return [4 /*yield*/, updateWatchedTradersUI()];
                case 3:
                    _a.sent();
                    _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Added ".concat(address.slice(0, 6), "...").concat(address.slice(-4), " to watch list"), "success");
                    return [3 /*break*/, 5];
                case 4:
                    error_5 = _a.sent();
                    console.error("Error adding trader:", error_5);
                    _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Failed to add trader to watch list", "error");
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function toggleCopyStatus(address) {
    return __awaiter(this, void 0, void 0, function () {
        var trader, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    trader = watchedTraders.find(function (t) { return t.address === address; });
                    if (!trader)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    if (trader.copyStatus === "active") {
                        // Stop copying
                        trader.copyStatus = "inactive";
                        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Stopped copying ".concat(address.slice(0, 6), "...").concat(address.slice(-4)), "info");
                    }
                    else {
                        // Start copying
                        if (!(_metamask__WEBPACK_IMPORTED_MODULE_0__.provider === null || _metamask__WEBPACK_IMPORTED_MODULE_0__.provider === void 0 ? void 0 : _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.isConnected())) {
                            _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Please connect your wallet first", "warning");
                            return [2 /*return*/];
                        }
                        trader.copyStatus = "active";
                        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Started copying ".concat(address.slice(0, 6), "...").concat(address.slice(-4)), "success");
                    }
                    return [4 /*yield*/, updateWatchedTradersUI()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_6 = _a.sent();
                    console.error("Error toggling copy status:", error_6);
                    _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Failed to update copy status", "error");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function removeTraderFromWatchList(address) {
    var index = watchedTraders.findIndex(function (trader) { return trader.address === address; });
    if (index !== -1) {
        watchedTraders.splice(index, 1);
        updateWatchedTradersUI();
        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Removed trader from watch list", "info");
    }
}
function setupSelectAllCheckbox() {
    var selectAllCheckbox = document.getElementById("selectAllTraders");
    var traderCheckboxes = document.querySelectorAll(".trader-checkbox");
    if (!selectAllCheckbox)
        return;
    // Update the "Select All" checkbox state based on individual checkboxes
    var updateSelectAllState = function () {
        var allChecked = Array.from(traderCheckboxes).every(function (checkbox) { return checkbox.checked; });
        var someChecked = Array.from(traderCheckboxes).some(function (checkbox) { return checkbox.checked; });
        selectAllCheckbox.checked = allChecked;
        selectAllCheckbox.indeterminate = !allChecked && someChecked;
    };
    // Add event listener to "Select All" checkbox
    selectAllCheckbox.addEventListener("change", function () {
        handleTraderSelection();
    });
    // Add event listeners to individual checkboxes
    traderCheckboxes.forEach(function (checkbox) {
        checkbox.addEventListener("change", updateSelectAllState);
    });
    // Initialize the state of the "Select All" checkbox
    updateSelectAllState();
}
function handleTraderSelection() {
    var traderCheckboxes = document.querySelectorAll(".trader-checkbox");
    var selectedTraders = Array.from(traderCheckboxes).map(function (checkbox) { return ({
        address: checkbox.getAttribute("data-address") || "",
        checked: checkbox.checked,
    }); });
    console.log("Selected traders:", selectedTraders);
}
function showTraderConfig(address) {
    // Implementation will be added later.
    console.log("Showing config for trader:", address);
}
function showTraderPositions(address) {
    var trader = watchedTraders.find(function (trader) {
        return address.includes(trader.address);
    });
    if (!trader) {
        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Trader not found in watch list", "error");
        return;
    }
    // Fetch trader's positions
    fetch("/api/trader_positions?address=".concat(address))
        .then(function (response) {
        if (!response.ok) {
            throw new Error("Failed to fetch trader positions");
        }
        return response.json();
    })
        .then(function (positions) {
        // Update watched positions with the fetched data
        // This would need to be imported from positions module
        console.log("Trader positions:", positions);
        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Loaded positions for ".concat(address.slice(0, 6), "...").concat(address.slice(-4)), "success");
    })
        .catch(function (error) {
        console.error("Error fetching trader positions:", error);
        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Failed to load trader positions", "error");
    });
}
// Export the watchedTraders for use in other modules if needed
function getWatchedTraders() {
    return watchedTraders;
}


/***/ })

}]);
//# sourceMappingURL=static_ts-front-end_watch-list_ts.app.bundle.js.map