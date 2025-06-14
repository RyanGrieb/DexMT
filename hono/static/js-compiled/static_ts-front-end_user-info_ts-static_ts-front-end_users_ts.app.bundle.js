"use strict";
(self["webpackChunkhono"] = self["webpackChunkhono"] || []).push([["static_ts-front-end_user-info_ts-static_ts-front-end_users_ts"],{

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
/* harmony import */ var _metamask__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./metamask */ "./static/ts-front-end/metamask.ts");
/* harmony import */ var _users__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./users */ "./static/ts-front-end/users.ts");
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


var currentUser = null;
var currentPeriod = "today";
var isCopyingTrades = false;
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
    var _this = this;
    // Back button
    var backButton = document.getElementById("backToUsers");
    if (backButton) {
        backButton.addEventListener("click", function () {
            // Fetch and load the top traders HTML
            fetch("/html/top-traders.html")
                .then(function (response) { return response.text(); })
                .then(function (html) {
                var indexContent = document.querySelector(".index-content");
                if (indexContent) {
                    indexContent.innerHTML = html;
                    // Re-populate the users list
                    (0,_users__WEBPACK_IMPORTED_MODULE_1__.updateUsersUI)();
                    // Update navigation button states
                    var topTradersBtn = document.getElementById("topTradersBtn");
                    var myCopiesBtn = document.getElementById("myCopiesBtn");
                    if (topTradersBtn)
                        topTradersBtn.classList.add("active");
                    if (myCopiesBtn)
                        myCopiesBtn.classList.remove("active");
                }
            })
                .catch(function (error) {
                console.error("Error loading top traders HTML:", error);
            });
        });
    }
    // Copy trades button
    var copyTradesButton = document.getElementById("copyTradesButton");
    if (copyTradesButton) {
        copyTradesButton.addEventListener("click", function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Ensure the wallet is connected
                        if (!(_metamask__WEBPACK_IMPORTED_MODULE_0__.provider === null || _metamask__WEBPACK_IMPORTED_MODULE_0__.provider === void 0 ? void 0 : _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.isConnected())) {
                            alert("Wallet not connected. Please connect your wallet first.");
                            return [2 /*return*/];
                        }
                        if (!currentUser) {
                            alert("No user selected.");
                            return [2 /*return*/];
                        }
                        // Toggle copy trading
                        return [4 /*yield*/, toggleCopyTrades()];
                    case 1:
                        // Toggle copy trading
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
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
function toggleCopyTrades() {
    return __awaiter(this, void 0, void 0, function () {
        var copyTradesButton, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!_metamask__WEBPACK_IMPORTED_MODULE_0__.provider || !currentUser)
                        return [2 /*return*/];
                    copyTradesButton = document.getElementById("copyTradesButton");
                    if (!copyTradesButton)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    // Disable button during operation
                    copyTradesButton.setAttribute("disabled", "true");
                    copyTradesButton.textContent = "Processing...";
                    if (!isCopyingTrades) return [3 /*break*/, 3];
                    // Stop copying trades
                    return [4 /*yield*/, stopCopyingTrades()];
                case 2:
                    // Stop copying trades
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: 
                // Start copying trades
                return [4 /*yield*/, startCopyingTrades()];
                case 4:
                    // Start copying trades
                    _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6:
                    error_1 = _a.sent();
                    console.error("Error toggling copy trades:", error_1);
                    alert("Failed to toggle copy trading. Please try again.");
                    return [3 /*break*/, 8];
                case 7:
                    // Re-enable button
                    copyTradesButton.removeAttribute("disabled");
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function startCopyingTrades() {
    return __awaiter(this, void 0, void 0, function () {
        var timestamp, message, signature, response, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!_metamask__WEBPACK_IMPORTED_MODULE_0__.provider || !currentUser)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    timestamp = Date.now();
                    message = "DEXMT Copy Trading Authorization\nTrader: ".concat(currentUser.address, "\nTimestamp: ").concat(timestamp, "\nAction: START_COPY_TRADING\n\nBy signing this message, you authorize DEXMT to copy trades from the specified trader to your wallet.");
                    return [4 /*yield*/, _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.request({
                            method: "personal_sign",
                            params: [message, _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.selectedAddress],
                        })];
                case 2:
                    signature = (_a.sent());
                    return [4 /*yield*/, fetch("/api/copy-trading/start", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                traderAddress: currentUser.address,
                                copierAddress: _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.selectedAddress,
                                message: message,
                                signature: signature,
                                timestamp: timestamp,
                            }),
                        })];
                case 3:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 4:
                    result = _a.sent();
                    if (!response.ok) {
                        throw new Error(result.error || "Failed to start copy trading");
                    }
                    // Update UI state
                    isCopyingTrades = true;
                    updateCopyTradesButton(true);
                    alert("Successfully started copying trades from ".concat(currentUser.address.slice(0, 6), "...").concat(currentUser.address.slice(-4)));
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _a.sent();
                    console.error("Error starting copy trades:", error_2);
                    if (error_2 instanceof Error) {
                        alert("Failed to start copy trading: ".concat(error_2.message));
                    }
                    else {
                        alert("Failed to start copy trading. Please try again.");
                    }
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function stopCopyingTrades() {
    return __awaiter(this, void 0, void 0, function () {
        var timestamp, message, signature, response, result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!_metamask__WEBPACK_IMPORTED_MODULE_0__.provider || !currentUser)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    timestamp = Date.now();
                    message = "DEXMT Copy Trading Termination\nTrader: ".concat(currentUser.address, "\nTimestamp: ").concat(timestamp, "\nAction: STOP_COPY_TRADING\n\nBy signing this message, you authorize DEXMT to stop copying trades from the specified trader.");
                    return [4 /*yield*/, _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.request({
                            method: "personal_sign",
                            params: [message, _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.selectedAddress],
                        })];
                case 2:
                    signature = (_a.sent());
                    return [4 /*yield*/, fetch("/api/copy-trading/stop", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                traderAddress: currentUser.address,
                                copierAddress: _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.selectedAddress,
                                message: message,
                                signature: signature,
                                timestamp: timestamp,
                            }),
                        })];
                case 3:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 4:
                    result = _a.sent();
                    if (!response.ok) {
                        throw new Error(result.error || "Failed to stop copy trading");
                    }
                    // Update UI state
                    isCopyingTrades = false;
                    updateCopyTradesButton(false);
                    alert("Successfully stopped copying trades from ".concat(currentUser.address.slice(0, 6), "...").concat(currentUser.address.slice(-4)));
                    return [3 /*break*/, 6];
                case 5:
                    error_3 = _a.sent();
                    console.error("Error stopping copy trades:", error_3);
                    if (error_3 instanceof Error) {
                        alert("Failed to stop copy trading: ".concat(error_3.message));
                    }
                    else {
                        alert("Failed to stop copy trading. Please try again.");
                    }
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function updateCopyTradesButton(isActive) {
    var copyTradesButton = document.getElementById("copyTradesButton");
    if (!copyTradesButton)
        return;
    if (isActive) {
        copyTradesButton.classList.add("active");
        copyTradesButton.innerHTML = "\n      <svg\n        slot=\"icon\"\n        xmlns=\"http://www.w3.org/2000/svg\"\n        height=\"20\"\n        viewBox=\"0 0 24 24\"\n        width=\"20\"\n      >\n        <path d=\"M0 0h24v24H0z\" fill=\"none\"/>\n        <path d=\"M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z\"/>\n      </svg>\n      Copying Trades\n    ";
    }
    else {
        copyTradesButton.classList.remove("active");
        copyTradesButton.innerHTML = "\n      <svg\n        slot=\"icon\"\n        xmlns=\"http://www.w3.org/2000/svg\"\n        height=\"20\"\n        viewBox=\"0 0 24 24\"\n        width=\"20\"\n      >\n        <path d=\"M0 0h24v24H0z\" fill=\"none\"/>\n        <path d=\"M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z\"/>\n      </svg>\n      Copy Trades\n    ";
    }
}
// Check copy trading status when user info loads
function checkCopyTradingStatus() {
    return __awaiter(this, void 0, void 0, function () {
        var response, result, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!_metamask__WEBPACK_IMPORTED_MODULE_0__.provider || !currentUser)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, fetch("/api/copy-trading/status?traderAddress=".concat(currentUser.address, "&copierAddress=").concat(_metamask__WEBPACK_IMPORTED_MODULE_0__.provider.selectedAddress))];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    console.log("Copy trading status:", result);
                    isCopyingTrades = result.isActive || false;
                    updateCopyTradesButton(isCopyingTrades);
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_4 = _a.sent();
                    console.error("Error checking copy trading status:", error_4);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
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
    // Check if we're already copying this user's trades
    checkCopyTradingStatus();
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


/***/ })

}]);
//# sourceMappingURL=static_ts-front-end_user-info_ts-static_ts-front-end_users_ts.app.bundle.js.map