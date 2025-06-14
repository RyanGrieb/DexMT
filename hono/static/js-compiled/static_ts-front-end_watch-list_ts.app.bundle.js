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
/* harmony import */ var _metamask__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./metamask */ "./static/ts-front-end/metamask.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./static/ts-front-end/utils.ts");
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


var watchedUsers = [];
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
// Add this variable at the top to cache the template
var watchedUserRowTemplate = null;
function showWatchList() {
    // Load watch list HTML
    fetch("/html/watch-list.html")
        .then(function (response) { return response.text(); })
        .then(function (html) {
        var indexContent = document.querySelector(".index-content");
        if (indexContent) {
            indexContent.innerHTML = html;
            initializeWatchList();
            loadWatchedUsers();
            loadWatchedPositions();
            loadCopyConfiguration();
        }
    })
        .catch(function (error) {
        console.error("Error loading watch list HTML:", error);
        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Failed to load watch list", "error");
    });
}
function initializeWatchList() {
    // Add trader button
    var addTraderBtn = document.getElementById("addTraderBtn");
    if (addTraderBtn) {
        addTraderBtn.addEventListener("click", showAddTraderDialog);
    }
    // Copy configuration checkboxes
    var stopLossCheckbox = document.getElementById("stopLossEnabled");
    var takeProfitCheckbox = document.getElementById("takeProfitEnabled");
    var stopLossInput = document.getElementById("stopLossPercent");
    var takeProfitInput = document.getElementById("takeProfitPercent");
    if (stopLossCheckbox && stopLossInput) {
        stopLossCheckbox.addEventListener("change", function () {
            stopLossInput.disabled = !stopLossCheckbox.checked;
        });
    }
    if (takeProfitCheckbox && takeProfitInput) {
        takeProfitCheckbox.addEventListener("change", function () {
            takeProfitInput.disabled = !takeProfitCheckbox.checked;
        });
    }
    // Save configuration button
    var saveConfigBtn = document.getElementById("saveConfigBtn");
    if (saveConfigBtn) {
        saveConfigBtn.addEventListener("click", saveCopyConfiguration);
    }
    // Reset configuration button
    var resetConfigBtn = document.getElementById("resetConfigBtn");
    if (resetConfigBtn) {
        resetConfigBtn.addEventListener("click", resetCopyConfiguration);
    }
    // Add token button
    var addTokenBtn = document.getElementById("addTokenBtn");
    if (addTokenBtn) {
        addTokenBtn.addEventListener("click", addCustomToken);
    }
}
function showAddTraderDialog() {
    var address = prompt("Enter trader address to watch:");
    if (address && address.trim()) {
        addTraderToWatchList(address.trim());
    }
}
function addTraderToWatchList(address) {
    return __awaiter(this, void 0, void 0, function () {
        var response, userData, watchedUser, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    // Validate address format
                    if (!address.startsWith("0x") || address.length !== 42) {
                        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Invalid address format", "error");
                        return [2 /*return*/];
                    }
                    // Check if already watching
                    if (watchedUsers.some(function (user) { return user.address.toLowerCase() === address.toLowerCase(); })) {
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
                    userData = _a.sent();
                    watchedUser = __assign(__assign({}, userData), { copyStatus: "inactive", watching: true });
                    watchedUsers.push(watchedUser);
                    updateWatchedUsersUI();
                    _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Added ".concat(address.slice(0, 6), "...").concat(address.slice(-4), " to watch list"), "success");
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error adding trader:", error_1);
                    _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Failed to add trader to watch list", "error");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function updateWatchedUsersUI() {
    return __awaiter(this, void 0, void 0, function () {
        var watchedUsersList, fragment, response, error_2, emptyRow;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    watchedUsersList = document.querySelector(".watched-users-list");
                    if (!watchedUsersList)
                        return [2 /*return*/];
                    fragment = document.createDocumentFragment();
                    if (!(watchedUsers.length > 0)) return [3 /*break*/, 8];
                    if (!!watchedUserRowTemplate) return [3 /*break*/, 7];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, fetch("/html/watched-user-row.html")];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.text()];
                case 3:
                    watchedUserRowTemplate = _a.sent();
                    return [3 /*break*/, 5];
                case 4: throw new Error("Failed to load template");
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    console.error("Error loading watched user row template:", error_2);
                    _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Failed to load template", "error");
                    return [2 /*return*/];
                case 7:
                    watchedUsers.forEach(function (user, index) {
                        // Create a table to properly parse the tr element
                        var tempTable = document.createElement("table");
                        tempTable.innerHTML = "<tbody>".concat(watchedUserRowTemplate, "</tbody>");
                        var userRow = tempTable.querySelector("tr.watched-user-item");
                        if (userRow) {
                            // Update elements based on their IDs
                            var addressHash = user.address.slice(2, 4).toUpperCase();
                            // Trader checkbox
                            var traderCheckbox = userRow.querySelector("#trader-checkbox");
                            if (traderCheckbox) {
                                traderCheckbox.setAttribute("data-address", user.address);
                                traderCheckbox.removeAttribute("id");
                            }
                            // Rank
                            var userRank = userRow.querySelector("#user-rank");
                            if (userRank) {
                                userRank.textContent = "#".concat(user.platform_ranking || index + 1);
                                userRank.removeAttribute("id");
                            }
                            // Platform
                            var userPlatform = userRow.querySelector("#user-platform");
                            if (userPlatform) {
                                userPlatform.innerHTML = _utils__WEBPACK_IMPORTED_MODULE_1__["default"].getPlatformIcon(user.dex_platform);
                                userPlatform.removeAttribute("id");
                            }
                            // Trader icon
                            var traderIcon = userRow.querySelector("#trader-icon");
                            if (traderIcon) {
                                traderIcon.textContent = addressHash;
                                traderIcon.style.background = _utils__WEBPACK_IMPORTED_MODULE_1__["default"].generateIconColor(user.address);
                                traderIcon.removeAttribute("id");
                            }
                            // Trader address
                            var traderAddress = userRow.querySelector("#trader-address");
                            if (traderAddress) {
                                traderAddress.textContent = "".concat(user.address.slice(0, 6), "...").concat(user.address.slice(-4));
                                traderAddress.removeAttribute("id");
                            }
                            // PNL
                            var userPnl = userRow.querySelector("#user-pnl");
                            if (userPnl) {
                                var pnlValue = Number(user.pnlPercentage || 0);
                                userPnl.textContent = "".concat(pnlValue.toFixed(2), "%");
                                userPnl.className = "user-pnl ".concat(pnlValue >= 0 ? "positive" : "negative");
                                userPnl.removeAttribute("id");
                            }
                            // Win Ratio
                            var userWinRatio = userRow.querySelector("#user-winratio");
                            if (userWinRatio) {
                                var winRatioValue = Number(user.winRatio || 0);
                                userWinRatio.textContent = winRatioValue.toFixed(2);
                                userWinRatio.removeAttribute("id");
                            }
                            // Watching count
                            var userWatching = userRow.querySelector("#user-watching");
                            if (userWatching) {
                                userWatching.textContent = (user.watching || 0).toString();
                                userWatching.removeAttribute("id");
                            }
                            // Actions button
                            var actionsBtn = userRow.querySelector("#actions-btn");
                            if (actionsBtn) {
                                actionsBtn.setAttribute("data-address", user.address);
                                actionsBtn.removeAttribute("id");
                            }
                            // Add click event listener to select user (same as top-traders)
                            userRow.addEventListener("click", function (e) {
                                // Don't trigger selection if clicking on checkbox
                                if (!e.target.closest(".trader-checkbox")) {
                                    console.log("User row clicked:", user.address);
                                    //selectUser(user);
                                }
                            });
                            // Add event listener for checkbox
                            if (traderCheckbox) {
                                traderCheckbox.addEventListener("change", function (e) {
                                    e.stopPropagation(); // Prevent row click
                                    handleTraderSelection(user.address, e.target.checked);
                                });
                            }
                            // Add event listener for actions button
                            if (actionsBtn) {
                                actionsBtn.addEventListener("click", function (e) {
                                    e.stopPropagation(); // Prevent row click
                                    showTraderActionsMenu(user.address, e.target);
                                });
                            }
                            fragment.appendChild(userRow);
                        }
                    });
                    return [3 /*break*/, 9];
                case 8:
                    emptyRow = document.createElement("tr");
                    emptyRow.className = "watched-user-item";
                    emptyRow.innerHTML = "\n      <td colspan=\"7\" style=\"text-align:center;color:#666;padding:20px\">\n        No traders in watch list. Click \"Add Trader\" to start watching.\n      </td>\n    ";
                    fragment.appendChild(emptyRow);
                    _a.label = 9;
                case 9:
                    watchedUsersList.replaceChildren(fragment);
                    setupSelectAllCheckbox();
                    return [2 /*return*/];
            }
        });
    });
}
function showTraderActionsMenu(address, button) {
    // Create a simple context menu for trader actions
    var existingMenu = document.querySelector(".trader-actions-menu");
    if (existingMenu) {
        existingMenu.remove();
    }
    var menu = document.createElement("div");
    menu.className = "trader-actions-menu";
    menu.innerHTML = "\n    <div class=\"menu-item\" data-action=\"config\">\n      <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\">\n        <path fill=\"currentColor\" d=\"M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z\"/>\n      </svg>\n      Configure\n    </div>\n    <div class=\"menu-item\" data-action=\"positions\">\n      <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\">\n        <path fill=\"currentColor\" d=\"M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z\"/>\n      </svg>\n      View Positions\n    </div>\n    <div class=\"menu-item\" data-action=\"copy\" id=\"copy-toggle-".concat(address, "\">\n      <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\">\n        <path fill=\"currentColor\" d=\"M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z\"/>\n      </svg>\n      Start Copying\n    </div>\n    <div class=\"menu-item menu-item-danger\" data-action=\"remove\">\n      <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\">\n        <path fill=\"currentColor\" d=\"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z\"/>\n      </svg>\n      Remove from List\n    </div>\n  ");
    // Position the menu near the button
    var rect = button.getBoundingClientRect();
    menu.style.position = "fixed";
    menu.style.top = "".concat(rect.bottom + 5, "px");
    menu.style.left = "".concat(rect.left, "px");
    menu.style.zIndex = "1000";
    // Update copy button text based on current status
    var user = watchedUsers.find(function (u) { return u.address === address; });
    var copyToggle = menu.querySelector("#copy-toggle-".concat(address));
    if (copyToggle && user) {
        if (user.copyStatus === "active") {
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
    // Close menu when clicking outside
    var closeMenu = function (e) {
        if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener("click", closeMenu);
        }
    };
    document.addEventListener("click", closeMenu);
    document.body.appendChild(menu);
}
function toggleCopyStatus(address) {
    return __awaiter(this, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
            user = watchedUsers.find(function (u) { return u.address === address; });
            if (!user)
                return [2 /*return*/];
            try {
                if (user.copyStatus === "active") {
                    // Stop copying
                    user.copyStatus = "inactive";
                    _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Stopped copying ".concat(address.slice(0, 6), "...").concat(address.slice(-4)), "info");
                }
                else {
                    // Start copying
                    if (!(_metamask__WEBPACK_IMPORTED_MODULE_0__.provider === null || _metamask__WEBPACK_IMPORTED_MODULE_0__.provider === void 0 ? void 0 : _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.isConnected())) {
                        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Please connect your wallet first", "warning");
                        return [2 /*return*/];
                    }
                    user.copyStatus = "active";
                    _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Started copying ".concat(address.slice(0, 6), "...").concat(address.slice(-4)), "success");
                }
                updateWatchedUsersUI();
            }
            catch (error) {
                console.error("Error toggling copy status:", error);
                _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Failed to update copy status", "error");
            }
            return [2 /*return*/];
        });
    });
}
function removeTraderFromWatchList(address) {
    var index = watchedUsers.findIndex(function (user) { return user.address === address; });
    if (index !== -1) {
        watchedUsers.splice(index, 1);
        updateWatchedUsersUI();
        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Removed trader from watch list", "info");
    }
}
function loadWatchedUsers() {
    return __awaiter(this, void 0, void 0, function () {
        var walletAddress, response, payload, _i, _a, trader, traderAddress, error_3;
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
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/watched_traders?walletAddress=".concat(walletAddress))];
                case 2:
                    response = _b.sent();
                    if (!response.ok) {
                        throw new Error("Failed to fetch watched traders");
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    payload = (_b.sent());
                    console.log("watched_traders payload:", payload);
                    if (!payload || !Array.isArray(payload.traders)) {
                        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("No watched traders found", "info");
                        return [2 /*return*/];
                    }
                    // Clear existing watched users
                    watchedUsers = [];
                    // Fetch user details for each watched trader
                    for (_i = 0, _a = payload.traders; _i < _a.length; _i++) {
                        trader = _a[_i];
                        traderAddress = trader.address;
                        watchedUsers.push({
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
                    updateWatchedUsersUI();
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _b.sent();
                    console.error("Error loading watched traders:", error_3);
                    _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Failed to load watched traders", "error");
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function updateWatchedPositionsUI() {
    var watchedPositionsList = document.querySelector(".watched-positions-list");
    if (!watchedPositionsList)
        return;
    var fragment = document.createDocumentFragment();
    if (watchedPositions.length > 0) {
        watchedPositions.forEach(function (position) {
            var sideClass = position.side.toLowerCase();
            var pnlClass = position.pnl.startsWith("+") ? "positive" : "negative";
            var positionRow = document.createElement("tr");
            positionRow.className = "watched-position-item";
            positionRow.innerHTML = "\n        <td class=\"trader-info\">\n          ".concat(position.traderName, "\n        </td>\n        <td>\n          <md-chip class=\"position-side-chip ").concat(sideClass, "\">\n            ").concat(position.side, "\n          </md-chip>\n          ").concat(position.market, "\n        </td>\n        <td>").concat(position.size, "</td>\n        <td class=\"position-pnl ").concat(pnlClass, "\">").concat(position.pnl, "</td>\n        <td>").concat(position.entryPrice, "</td>\n        <td>").concat(position.currentPrice, "</td>\n        <td>\n          <md-filled-button class=\"copy-position-btn\" data-position-id=\"").concat(position.id, "\">\n            Copy\n          </md-filled-button>\n        </td>\n      ");
            // Add copy position event listener
            var copyBtn = positionRow.querySelector(".copy-position-btn");
            if (copyBtn) {
                copyBtn.addEventListener("click", function () { return copyPosition(position.id); });
            }
            fragment.appendChild(positionRow);
        });
    }
    else {
        var emptyRow = document.createElement("tr");
        emptyRow.className = "watched-position-item";
        emptyRow.innerHTML = "\n      <td colspan=\"7\" style=\"text-align:center;color:#666;padding:20px\">\n        No open positions from watched traders\n      </td>\n    ";
        fragment.appendChild(emptyRow);
    }
    watchedPositionsList.replaceChildren(fragment);
}
function loadWatchedPositions() {
    // Mock data - replace with actual API call
    var mockPositions = [
        {
            id: "pos1",
            traderAddress: "0x1234567890123456789012345678901234567890",
            traderName: "1234...7890",
            market: "ETH/USD",
            side: "LONG",
            size: "$15,000",
            pnl: "+$2,250",
            entryPrice: "$3,180.50",
            currentPrice: "$3,330.25",
            leverage: "8x",
            timestamp: new Date().toISOString(),
        },
        {
            id: "pos2",
            traderAddress: "0x1234567890123456789012345678901234567890",
            traderName: "1234...7890",
            market: "BTC/USD",
            side: "SHORT",
            size: "$8,500",
            pnl: "-$340",
            entryPrice: "$66,500.00",
            currentPrice: "$67,200.50",
            leverage: "5x",
            timestamp: new Date().toISOString(),
        },
    ];
    watchedPositions = mockPositions;
    updateWatchedPositionsUI();
}
function copyPosition(positionId) {
    return __awaiter(this, void 0, void 0, function () {
        var position;
        return __generator(this, function (_a) {
            if (!(_metamask__WEBPACK_IMPORTED_MODULE_0__.provider === null || _metamask__WEBPACK_IMPORTED_MODULE_0__.provider === void 0 ? void 0 : _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.isConnected())) {
                _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Please connect your wallet first", "warning");
                return [2 /*return*/];
            }
            position = watchedPositions.find(function (p) { return p.id === positionId; });
            if (!position)
                return [2 /*return*/];
            try {
                // Here you would implement the actual position copying logic
                _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Copying ".concat(position.market, " ").concat(position.side, " position..."), "info");
                // Mock API call for copying position
                // await copyTraderPosition(position);
                _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Successfully copied ".concat(position.market, " position"), "success");
            }
            catch (error) {
                console.error("Error copying position:", error);
                _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Failed to copy position", "error");
            }
            return [2 /*return*/];
        });
    });
}
function loadCopyConfiguration() {
    // Load saved configuration from localStorage or API
    var savedConfig = localStorage.getItem("copyConfig");
    if (savedConfig) {
        copyConfig = JSON.parse(savedConfig);
    }
    // Update UI with current configuration
    updateConfigurationUI();
}
function updateConfigurationUI() {
    var maxPositionSize = document.getElementById("maxPositionSize");
    var maxLeverage = document.getElementById("maxLeverage");
    var riskPercentage = document.getElementById("riskPercentage");
    var autoCopyEnabled = document.getElementById("autoCopyEnabled");
    var stopLossEnabled = document.getElementById("stopLossEnabled");
    var stopLossPercent = document.getElementById("stopLossPercent");
    var takeProfitEnabled = document.getElementById("takeProfitEnabled");
    var takeProfitPercent = document.getElementById("takeProfitPercent");
    if (maxPositionSize)
        maxPositionSize.value = copyConfig.maxPositionSize.toString();
    if (maxLeverage)
        maxLeverage.value = copyConfig.maxLeverage.toString();
    if (riskPercentage)
        riskPercentage.value = copyConfig.riskPercentage.toString();
    if (autoCopyEnabled)
        autoCopyEnabled.checked = copyConfig.autoCopyEnabled;
    if (stopLossEnabled)
        stopLossEnabled.checked = copyConfig.stopLossEnabled;
    if (stopLossPercent) {
        stopLossPercent.value = copyConfig.stopLossPercent.toString();
        stopLossPercent.disabled = !copyConfig.stopLossEnabled;
    }
    if (takeProfitEnabled)
        takeProfitEnabled.checked = copyConfig.takeProfitEnabled;
    if (takeProfitPercent) {
        takeProfitPercent.value = copyConfig.takeProfitPercent.toString();
        takeProfitPercent.disabled = !copyConfig.takeProfitEnabled;
    }
    // Update token chips
    updateTokenChips();
}
function updateTokenChips() {
    var tokenChips = ["ethChip", "btcChip", "solChip", "avaxChip", "arbChip"];
    var tokenMap = {
        ethChip: "ETH",
        btcChip: "BTC",
        solChip: "SOL",
        avaxChip: "AVAX",
        arbChip: "ARB",
    };
    tokenChips.forEach(function (chipId) {
        var chip = document.getElementById(chipId);
        if (chip && tokenMap[chipId]) {
            chip.selected = copyConfig.allowedTokens.includes(tokenMap[chipId]);
            chip.addEventListener("click", function () { return toggleTokenFilter(tokenMap[chipId]); });
        }
    });
}
function toggleTokenFilter(token) {
    var index = copyConfig.allowedTokens.indexOf(token);
    if (index > -1) {
        copyConfig.allowedTokens.splice(index, 1);
    }
    else {
        copyConfig.allowedTokens.push(token);
    }
}
function addCustomToken() {
    var customTokenInput = document.getElementById("customToken");
    if (!customTokenInput)
        return;
    var token = customTokenInput.value.trim().toUpperCase();
    if (token && !copyConfig.allowedTokens.includes(token)) {
        copyConfig.allowedTokens.push(token);
        customTokenInput.value = "";
        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Added ".concat(token, " to allowed tokens"), "success");
    }
}
function saveCopyConfiguration() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        // Gather all configuration values
        var maxPositionSize = (_a = document.getElementById("maxPositionSize")) === null || _a === void 0 ? void 0 : _a.value;
        var maxLeverage = (_b = document.getElementById("maxLeverage")) === null || _b === void 0 ? void 0 : _b.value;
        var riskPercentage = (_c = document.getElementById("riskPercentage")) === null || _c === void 0 ? void 0 : _c.value;
        var autoCopyEnabled = (_d = document.getElementById("autoCopyEnabled")) === null || _d === void 0 ? void 0 : _d.checked;
        var stopLossEnabled = (_e = document.getElementById("stopLossEnabled")) === null || _e === void 0 ? void 0 : _e.checked;
        var stopLossPercent = (_f = document.getElementById("stopLossPercent")) === null || _f === void 0 ? void 0 : _f.value;
        var takeProfitEnabled = (_g = document.getElementById("takeProfitEnabled")) === null || _g === void 0 ? void 0 : _g.checked;
        var takeProfitPercent = (_h = document.getElementById("takeProfitPercent")) === null || _h === void 0 ? void 0 : _h.value;
        copyConfig = __assign(__assign({}, copyConfig), { maxPositionSize: Number(maxPositionSize) || 1000, maxLeverage: Number(maxLeverage) || 5, riskPercentage: Number(riskPercentage) || 2, autoCopyEnabled: autoCopyEnabled || false, stopLossEnabled: stopLossEnabled || false, stopLossPercent: Number(stopLossPercent) || 10, takeProfitEnabled: takeProfitEnabled || false, takeProfitPercent: Number(takeProfitPercent) || 20 });
        // Save to localStorage
        localStorage.setItem("copyConfig", JSON.stringify(copyConfig));
        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Configuration saved successfully", "success");
    }
    catch (error) {
        console.error("Error saving configuration:", error);
        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Failed to save configuration", "error");
    }
}
function resetCopyConfiguration() {
    copyConfig = {
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
    updateConfigurationUI();
    _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Configuration reset to defaults", "info");
}
// Refresh positions every 30 seconds
setInterval(function () {
    if (document.querySelector(".watched-positions-list")) {
        loadWatchedPositions();
    }
}, 30000);
function showTraderConfig(address) {
    // Implementation will be added later.
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
        var isChecked = selectAllCheckbox.checked;
        traderCheckboxes.forEach(function (checkbox) {
            checkbox.checked = isChecked;
            var address = checkbox.getAttribute("data-address");
            if (address) {
                handleTraderSelection(address, isChecked);
            }
        });
    });
    // Add event listeners to individual checkboxes
    traderCheckboxes.forEach(function (checkbox) {
        checkbox.addEventListener("change", updateSelectAllState);
    });
    // Initialize the state of the "Select All" checkbox
    updateSelectAllState();
}
function showTraderPositions(address) {
    var trader = watchedUsers.find(function (user) { return user.address === address; });
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
        watchedPositions = positions.map(function (position) { return (__assign(__assign({}, position), { traderName: "".concat(address.slice(0, 6), "...").concat(address.slice(-4)) })); });
        // Update the UI to display the positions
        updateWatchedPositionsUI();
        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Loaded positions for ".concat(address.slice(0, 6), "...").concat(address.slice(-4)), "success");
    })
        .catch(function (error) {
        console.error("Error fetching trader positions:", error);
        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showToast("Failed to load trader positions", "error");
    });
}
function handleTraderSelection(address, checked) {
    var trader = watchedUsers.find(function (user) { return user.address === address; });
    if (!trader) {
        console.warn("Trader with address ".concat(address, " not found in watch list."));
        return;
    }
    if (checked) {
        trader.watching += 1;
    }
    else {
        trader.watching = Math.max(0, trader.watching - 1);
    }
    console.log("Trader ".concat(address, " selection updated. Watching count: ").concat(trader.watching));
}


/***/ })

}]);
//# sourceMappingURL=static_ts-front-end_watch-list_ts.app.bundle.js.map