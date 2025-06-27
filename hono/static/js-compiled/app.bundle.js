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

/***/ "./node_modules/ethers/lib.esm/_version.js":
/*!*************************************************!*\
  !*** ./node_modules/ethers/lib.esm/_version.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   version: () => (/* binding */ version)
/* harmony export */ });
/* Do NOT modify this file; see /src.ts/_admin/update-version.ts */
/**
 *  The current version of Ethers.
 */
const version = "6.14.4";


/***/ }),

/***/ "./node_modules/ethers/lib.esm/address/address.js":
/*!********************************************************!*\
  !*** ./node_modules/ethers/lib.esm/address/address.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getAddress: () => (/* binding */ getAddress),
/* harmony export */   getIcapAddress: () => (/* binding */ getIcapAddress)
/* harmony export */ });
/* harmony import */ var _crypto_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../crypto/index.js */ "./node_modules/ethers/lib.esm/crypto/keccak.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/index.js */ "./node_modules/ethers/lib.esm/utils/data.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/index.js */ "./node_modules/ethers/lib.esm/utils/errors.js");


const BN_0 = BigInt(0);
const BN_36 = BigInt(36);
function getChecksumAddress(address) {
    //    if (!isHexString(address, 20)) {
    //        logger.throwArgumentError("invalid address", "address", address);
    //    }
    address = address.toLowerCase();
    const chars = address.substring(2).split("");
    const expanded = new Uint8Array(40);
    for (let i = 0; i < 40; i++) {
        expanded[i] = chars[i].charCodeAt(0);
    }
    const hashed = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_0__.getBytes)((0,_crypto_index_js__WEBPACK_IMPORTED_MODULE_1__.keccak256)(expanded));
    for (let i = 0; i < 40; i += 2) {
        if ((hashed[i >> 1] >> 4) >= 8) {
            chars[i] = chars[i].toUpperCase();
        }
        if ((hashed[i >> 1] & 0x0f) >= 8) {
            chars[i + 1] = chars[i + 1].toUpperCase();
        }
    }
    return "0x" + chars.join("");
}
// See: https://en.wikipedia.org/wiki/International_Bank_Account_Number
// Create lookup table
const ibanLookup = {};
for (let i = 0; i < 10; i++) {
    ibanLookup[String(i)] = String(i);
}
for (let i = 0; i < 26; i++) {
    ibanLookup[String.fromCharCode(65 + i)] = String(10 + i);
}
// How many decimal digits can we process? (for 64-bit float, this is 15)
// i.e. Math.floor(Math.log10(Number.MAX_SAFE_INTEGER));
const safeDigits = 15;
function ibanChecksum(address) {
    address = address.toUpperCase();
    address = address.substring(4) + address.substring(0, 2) + "00";
    let expanded = address.split("").map((c) => { return ibanLookup[c]; }).join("");
    // Javascript can handle integers safely up to 15 (decimal) digits
    while (expanded.length >= safeDigits) {
        let block = expanded.substring(0, safeDigits);
        expanded = parseInt(block, 10) % 97 + expanded.substring(block.length);
    }
    let checksum = String(98 - (parseInt(expanded, 10) % 97));
    while (checksum.length < 2) {
        checksum = "0" + checksum;
    }
    return checksum;
}
;
const Base36 = (function () {
    ;
    const result = {};
    for (let i = 0; i < 36; i++) {
        const key = "0123456789abcdefghijklmnopqrstuvwxyz"[i];
        result[key] = BigInt(i);
    }
    return result;
})();
function fromBase36(value) {
    value = value.toLowerCase();
    let result = BN_0;
    for (let i = 0; i < value.length; i++) {
        result = result * BN_36 + Base36[value[i]];
    }
    return result;
}
/**
 *  Returns a normalized and checksumed address for %%address%%.
 *  This accepts non-checksum addresses, checksum addresses and
 *  [[getIcapAddress]] formats.
 *
 *  The checksum in Ethereum uses the capitalization (upper-case
 *  vs lower-case) of the characters within an address to encode
 *  its checksum, which offers, on average, a checksum of 15-bits.
 *
 *  If %%address%% contains both upper-case and lower-case, it is
 *  assumed to already be a checksum address and its checksum is
 *  validated, and if the address fails its expected checksum an
 *  error is thrown.
 *
 *  If you wish the checksum of %%address%% to be ignore, it should
 *  be converted to lower-case (i.e. ``.toLowercase()``) before
 *  being passed in. This should be a very rare situation though,
 *  that you wish to bypass the safegaurds in place to protect
 *  against an address that has been incorrectly copied from another
 *  source.
 *
 *  @example:
 *    // Adds the checksum (via upper-casing specific letters)
 *    getAddress("0x8ba1f109551bd432803012645ac136ddd64dba72")
 *    //_result:
 *
 *    // Converts ICAP address and adds checksum
 *    getAddress("XE65GB6LDNXYOFTX0NSV3FUWKOWIXAMJK36");
 *    //_result:
 *
 *    // Throws an error if an address contains mixed case,
 *    // but the checksum fails
 *    getAddress("0x8Ba1f109551bD432803012645Ac136ddd64DBA72")
 *    //_error:
 */
function getAddress(address) {
    (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_2__.assertArgument)(typeof (address) === "string", "invalid address", "address", address);
    if (address.match(/^(0x)?[0-9a-fA-F]{40}$/)) {
        // Missing the 0x prefix
        if (!address.startsWith("0x")) {
            address = "0x" + address;
        }
        const result = getChecksumAddress(address);
        // It is a checksummed address with a bad checksum
        (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_2__.assertArgument)(!address.match(/([A-F].*[a-f])|([a-f].*[A-F])/) || result === address, "bad address checksum", "address", address);
        return result;
    }
    // Maybe ICAP? (we only support direct mode)
    if (address.match(/^XE[0-9]{2}[0-9A-Za-z]{30,31}$/)) {
        // It is an ICAP address with a bad checksum
        (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_2__.assertArgument)(address.substring(2, 4) === ibanChecksum(address), "bad icap checksum", "address", address);
        let result = fromBase36(address.substring(4)).toString(16);
        while (result.length < 40) {
            result = "0" + result;
        }
        return getChecksumAddress("0x" + result);
    }
    (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_2__.assertArgument)(false, "invalid address", "address", address);
}
/**
 *  The [ICAP Address format](link-icap) format is an early checksum
 *  format which attempts to be compatible with the banking
 *  industry [IBAN format](link-wiki-iban) for bank accounts.
 *
 *  It is no longer common or a recommended format.
 *
 *  @example:
 *    getIcapAddress("0x8ba1f109551bd432803012645ac136ddd64dba72");
 *    //_result:
 *
 *    getIcapAddress("XE65GB6LDNXYOFTX0NSV3FUWKOWIXAMJK36");
 *    //_result:
 *
 *    // Throws an error if the ICAP checksum is wrong
 *    getIcapAddress("XE65GB6LDNXYOFTX0NSV3FUWKOWIXAMJK37");
 *    //_error:
 */
function getIcapAddress(address) {
    //let base36 = _base16To36(getAddress(address).substring(2)).toUpperCase();
    let base36 = BigInt(getAddress(address)).toString(36).toUpperCase();
    while (base36.length < 30) {
        base36 = "0" + base36;
    }
    return "XE" + ibanChecksum("XE00" + base36) + base36;
}


/***/ }),

/***/ "./node_modules/ethers/lib.esm/crypto/keccak.js":
/*!******************************************************!*\
  !*** ./node_modules/ethers/lib.esm/crypto/keccak.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   keccak256: () => (/* binding */ keccak256)
/* harmony export */ });
/* harmony import */ var _noble_hashes_sha3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @noble/hashes/sha3 */ "./node_modules/ethers/node_modules/@noble/hashes/esm/sha3.js");
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/index.js */ "./node_modules/ethers/lib.esm/utils/data.js");
/**
 *  Cryptographic hashing functions
 *
 *  @_subsection: api/crypto:Hash Functions [about-crypto-hashing]
 */


let locked = false;
const _keccak256 = function (data) {
    return (0,_noble_hashes_sha3__WEBPACK_IMPORTED_MODULE_0__.keccak_256)(data);
};
let __keccak256 = _keccak256;
/**
 *  Compute the cryptographic KECCAK256 hash of %%data%%.
 *
 *  The %%data%% **must** be a data representation, to compute the
 *  hash of UTF-8 data use the [[id]] function.
 *
 *  @returns DataHexstring
 *  @example:
 *    keccak256("0x")
 *    //_result:
 *
 *    keccak256("0x1337")
 *    //_result:
 *
 *    keccak256(new Uint8Array([ 0x13, 0x37 ]))
 *    //_result:
 *
 *    // Strings are assumed to be DataHexString, otherwise it will
 *    // throw. To hash UTF-8 data, see the note above.
 *    keccak256("Hello World")
 *    //_error:
 */
function keccak256(_data) {
    const data = (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_1__.getBytes)(_data, "data");
    return (0,_utils_index_js__WEBPACK_IMPORTED_MODULE_1__.hexlify)(__keccak256(data));
}
keccak256._ = _keccak256;
keccak256.lock = function () { locked = true; };
keccak256.register = function (func) {
    if (locked) {
        throw new TypeError("keccak256 is locked");
    }
    __keccak256 = func;
};
Object.freeze(keccak256);


/***/ }),

/***/ "./node_modules/ethers/lib.esm/utils/data.js":
/*!***************************************************!*\
  !*** ./node_modules/ethers/lib.esm/utils/data.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   concat: () => (/* binding */ concat),
/* harmony export */   dataLength: () => (/* binding */ dataLength),
/* harmony export */   dataSlice: () => (/* binding */ dataSlice),
/* harmony export */   getBytes: () => (/* binding */ getBytes),
/* harmony export */   getBytesCopy: () => (/* binding */ getBytesCopy),
/* harmony export */   hexlify: () => (/* binding */ hexlify),
/* harmony export */   isBytesLike: () => (/* binding */ isBytesLike),
/* harmony export */   isHexString: () => (/* binding */ isHexString),
/* harmony export */   stripZerosLeft: () => (/* binding */ stripZerosLeft),
/* harmony export */   zeroPadBytes: () => (/* binding */ zeroPadBytes),
/* harmony export */   zeroPadValue: () => (/* binding */ zeroPadValue)
/* harmony export */ });
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./errors.js */ "./node_modules/ethers/lib.esm/utils/errors.js");
/**
 *  Some data helpers.
 *
 *
 *  @_subsection api/utils:Data Helpers  [about-data]
 */

function _getBytes(value, name, copy) {
    if (value instanceof Uint8Array) {
        if (copy) {
            return new Uint8Array(value);
        }
        return value;
    }
    if (typeof (value) === "string" && value.match(/^0x(?:[0-9a-f][0-9a-f])*$/i)) {
        const result = new Uint8Array((value.length - 2) / 2);
        let offset = 2;
        for (let i = 0; i < result.length; i++) {
            result[i] = parseInt(value.substring(offset, offset + 2), 16);
            offset += 2;
        }
        return result;
    }
    (0,_errors_js__WEBPACK_IMPORTED_MODULE_0__.assertArgument)(false, "invalid BytesLike value", name || "value", value);
}
/**
 *  Get a typed Uint8Array for %%value%%. If already a Uint8Array
 *  the original %%value%% is returned; if a copy is required use
 *  [[getBytesCopy]].
 *
 *  @see: getBytesCopy
 */
function getBytes(value, name) {
    return _getBytes(value, name, false);
}
/**
 *  Get a typed Uint8Array for %%value%%, creating a copy if necessary
 *  to prevent any modifications of the returned value from being
 *  reflected elsewhere.
 *
 *  @see: getBytes
 */
function getBytesCopy(value, name) {
    return _getBytes(value, name, true);
}
/**
 *  Returns true if %%value%% is a valid [[HexString]].
 *
 *  If %%length%% is ``true`` or a //number//, it also checks that
 *  %%value%% is a valid [[DataHexString]] of %%length%% (if a //number//)
 *  bytes of data (e.g. ``0x1234`` is 2 bytes).
 */
function isHexString(value, length) {
    if (typeof (value) !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
        return false;
    }
    if (typeof (length) === "number" && value.length !== 2 + 2 * length) {
        return false;
    }
    if (length === true && (value.length % 2) !== 0) {
        return false;
    }
    return true;
}
/**
 *  Returns true if %%value%% is a valid representation of arbitrary
 *  data (i.e. a valid [[DataHexString]] or a Uint8Array).
 */
function isBytesLike(value) {
    return (isHexString(value, true) || (value instanceof Uint8Array));
}
const HexCharacters = "0123456789abcdef";
/**
 *  Returns a [[DataHexString]] representation of %%data%%.
 */
function hexlify(data) {
    const bytes = getBytes(data);
    let result = "0x";
    for (let i = 0; i < bytes.length; i++) {
        const v = bytes[i];
        result += HexCharacters[(v & 0xf0) >> 4] + HexCharacters[v & 0x0f];
    }
    return result;
}
/**
 *  Returns a [[DataHexString]] by concatenating all values
 *  within %%data%%.
 */
function concat(datas) {
    return "0x" + datas.map((d) => hexlify(d).substring(2)).join("");
}
/**
 *  Returns the length of %%data%%, in bytes.
 */
function dataLength(data) {
    if (isHexString(data, true)) {
        return (data.length - 2) / 2;
    }
    return getBytes(data).length;
}
/**
 *  Returns a [[DataHexString]] by slicing %%data%% from the %%start%%
 *  offset to the %%end%% offset.
 *
 *  By default %%start%% is 0 and %%end%% is the length of %%data%%.
 */
function dataSlice(data, start, end) {
    const bytes = getBytes(data);
    if (end != null && end > bytes.length) {
        (0,_errors_js__WEBPACK_IMPORTED_MODULE_0__.assert)(false, "cannot slice beyond data bounds", "BUFFER_OVERRUN", {
            buffer: bytes, length: bytes.length, offset: end
        });
    }
    return hexlify(bytes.slice((start == null) ? 0 : start, (end == null) ? bytes.length : end));
}
/**
 *  Return the [[DataHexString]] result by stripping all **leading**
 ** zero bytes from %%data%%.
 */
function stripZerosLeft(data) {
    let bytes = hexlify(data).substring(2);
    while (bytes.startsWith("00")) {
        bytes = bytes.substring(2);
    }
    return "0x" + bytes;
}
function zeroPad(data, length, left) {
    const bytes = getBytes(data);
    (0,_errors_js__WEBPACK_IMPORTED_MODULE_0__.assert)(length >= bytes.length, "padding exceeds data length", "BUFFER_OVERRUN", {
        buffer: new Uint8Array(bytes),
        length: length,
        offset: length + 1
    });
    const result = new Uint8Array(length);
    result.fill(0);
    if (left) {
        result.set(bytes, length - bytes.length);
    }
    else {
        result.set(bytes, 0);
    }
    return hexlify(result);
}
/**
 *  Return the [[DataHexString]] of %%data%% padded on the **left**
 *  to %%length%% bytes.
 *
 *  If %%data%% already exceeds %%length%%, a [[BufferOverrunError]] is
 *  thrown.
 *
 *  This pads data the same as **values** are in Solidity
 *  (e.g. ``uint128``).
 */
function zeroPadValue(data, length) {
    return zeroPad(data, length, true);
}
/**
 *  Return the [[DataHexString]] of %%data%% padded on the **right**
 *  to %%length%% bytes.
 *
 *  If %%data%% already exceeds %%length%%, a [[BufferOverrunError]] is
 *  thrown.
 *
 *  This pads data the same as **bytes** are in Solidity
 *  (e.g. ``bytes16``).
 */
function zeroPadBytes(data, length) {
    return zeroPad(data, length, false);
}


/***/ }),

/***/ "./node_modules/ethers/lib.esm/utils/errors.js":
/*!*****************************************************!*\
  !*** ./node_modules/ethers/lib.esm/utils/errors.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   assert: () => (/* binding */ assert),
/* harmony export */   assertArgument: () => (/* binding */ assertArgument),
/* harmony export */   assertArgumentCount: () => (/* binding */ assertArgumentCount),
/* harmony export */   assertNormalize: () => (/* binding */ assertNormalize),
/* harmony export */   assertPrivate: () => (/* binding */ assertPrivate),
/* harmony export */   isCallException: () => (/* binding */ isCallException),
/* harmony export */   isError: () => (/* binding */ isError),
/* harmony export */   makeError: () => (/* binding */ makeError)
/* harmony export */ });
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../_version.js */ "./node_modules/ethers/lib.esm/_version.js");
/* harmony import */ var _properties_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./properties.js */ "./node_modules/ethers/lib.esm/utils/properties.js");
/**
 *  All errors in ethers include properties to ensure they are both
 *  human-readable (i.e. ``.message``) and machine-readable (i.e. ``.code``).
 *
 *  The [[isError]] function can be used to check the error ``code`` and
 *  provide a type guard for the properties present on that error interface.
 *
 *  @_section: api/utils/errors:Errors  [about-errors]
 */


function stringify(value, seen) {
    if (value == null) {
        return "null";
    }
    if (seen == null) {
        seen = new Set();
    }
    if (typeof (value) === "object") {
        if (seen.has(value)) {
            return "[Circular]";
        }
        seen.add(value);
    }
    if (Array.isArray(value)) {
        return "[ " + (value.map((v) => stringify(v, seen))).join(", ") + " ]";
    }
    if (value instanceof Uint8Array) {
        const HEX = "0123456789abcdef";
        let result = "0x";
        for (let i = 0; i < value.length; i++) {
            result += HEX[value[i] >> 4];
            result += HEX[value[i] & 0xf];
        }
        return result;
    }
    if (typeof (value) === "object" && typeof (value.toJSON) === "function") {
        return stringify(value.toJSON(), seen);
    }
    switch (typeof (value)) {
        case "boolean":
        case "number":
        case "symbol":
            return value.toString();
        case "bigint":
            return BigInt(value).toString();
        case "string":
            return JSON.stringify(value);
        case "object": {
            const keys = Object.keys(value);
            keys.sort();
            return "{ " + keys.map((k) => `${stringify(k, seen)}: ${stringify(value[k], seen)}`).join(", ") + " }";
        }
    }
    return `[ COULD NOT SERIALIZE ]`;
}
/**
 *  Returns true if the %%error%% matches an error thrown by ethers
 *  that matches the error %%code%%.
 *
 *  In TypeScript environments, this can be used to check that %%error%%
 *  matches an EthersError type, which means the expected properties will
 *  be set.
 *
 *  @See [ErrorCodes](api:ErrorCode)
 *  @example
 *    try {
 *      // code....
 *    } catch (e) {
 *      if (isError(e, "CALL_EXCEPTION")) {
 *          // The Type Guard has validated this object
 *          console.log(e.data);
 *      }
 *    }
 */
function isError(error, code) {
    return (error && error.code === code);
}
/**
 *  Returns true if %%error%% is a [[CallExceptionError].
 */
function isCallException(error) {
    return isError(error, "CALL_EXCEPTION");
}
/**
 *  Returns a new Error configured to the format ethers emits errors, with
 *  the %%message%%, [[api:ErrorCode]] %%code%% and additional properties
 *  for the corresponding EthersError.
 *
 *  Each error in ethers includes the version of ethers, a
 *  machine-readable [[ErrorCode]], and depending on %%code%%, additional
 *  required properties. The error message will also include the %%message%%,
 *  ethers version, %%code%% and all additional properties, serialized.
 */
function makeError(message, code, info) {
    let shortMessage = message;
    {
        const details = [];
        if (info) {
            if ("message" in info || "code" in info || "name" in info) {
                throw new Error(`value will overwrite populated values: ${stringify(info)}`);
            }
            for (const key in info) {
                if (key === "shortMessage") {
                    continue;
                }
                const value = (info[key]);
                //                try {
                details.push(key + "=" + stringify(value));
                //                } catch (error: any) {
                //                console.log("MMM", error.message);
                //                    details.push(key + "=[could not serialize object]");
                //                }
            }
        }
        details.push(`code=${code}`);
        details.push(`version=${_version_js__WEBPACK_IMPORTED_MODULE_0__.version}`);
        if (details.length) {
            message += " (" + details.join(", ") + ")";
        }
    }
    let error;
    switch (code) {
        case "INVALID_ARGUMENT":
            error = new TypeError(message);
            break;
        case "NUMERIC_FAULT":
        case "BUFFER_OVERRUN":
            error = new RangeError(message);
            break;
        default:
            error = new Error(message);
    }
    (0,_properties_js__WEBPACK_IMPORTED_MODULE_1__.defineProperties)(error, { code });
    if (info) {
        Object.assign(error, info);
    }
    if (error.shortMessage == null) {
        (0,_properties_js__WEBPACK_IMPORTED_MODULE_1__.defineProperties)(error, { shortMessage });
    }
    return error;
}
/**
 *  Throws an EthersError with %%message%%, %%code%% and additional error
 *  %%info%% when %%check%% is falsish..
 *
 *  @see [[api:makeError]]
 */
function assert(check, message, code, info) {
    if (!check) {
        throw makeError(message, code, info);
    }
}
/**
 *  A simple helper to simply ensuring provided arguments match expected
 *  constraints, throwing if not.
 *
 *  In TypeScript environments, the %%check%% has been asserted true, so
 *  any further code does not need additional compile-time checks.
 */
function assertArgument(check, message, name, value) {
    assert(check, message, "INVALID_ARGUMENT", { argument: name, value: value });
}
function assertArgumentCount(count, expectedCount, message) {
    if (message == null) {
        message = "";
    }
    if (message) {
        message = ": " + message;
    }
    assert(count >= expectedCount, "missing argument" + message, "MISSING_ARGUMENT", {
        count: count,
        expectedCount: expectedCount
    });
    assert(count <= expectedCount, "too many arguments" + message, "UNEXPECTED_ARGUMENT", {
        count: count,
        expectedCount: expectedCount
    });
}
const _normalizeForms = ["NFD", "NFC", "NFKD", "NFKC"].reduce((accum, form) => {
    try {
        // General test for normalize
        /* c8 ignore start */
        if ("test".normalize(form) !== "test") {
            throw new Error("bad");
        }
        ;
        /* c8 ignore stop */
        if (form === "NFD") {
            const check = String.fromCharCode(0xe9).normalize("NFD");
            const expected = String.fromCharCode(0x65, 0x0301);
            /* c8 ignore start */
            if (check !== expected) {
                throw new Error("broken");
            }
            /* c8 ignore stop */
        }
        accum.push(form);
    }
    catch (error) { }
    return accum;
}, []);
/**
 *  Throws if the normalization %%form%% is not supported.
 */
function assertNormalize(form) {
    assert(_normalizeForms.indexOf(form) >= 0, "platform missing String.prototype.normalize", "UNSUPPORTED_OPERATION", {
        operation: "String.prototype.normalize", info: { form }
    });
}
/**
 *  Many classes use file-scoped values to guard the constructor,
 *  making it effectively private. This facilitates that pattern
 *  by ensuring the %%givenGaurd%% matches the file-scoped %%guard%%,
 *  throwing if not, indicating the %%className%% if provided.
 */
function assertPrivate(givenGuard, guard, className) {
    if (className == null) {
        className = "";
    }
    if (givenGuard !== guard) {
        let method = className, operation = "new";
        if (className) {
            method += ".";
            operation += " " + className;
        }
        assert(false, `private constructor; use ${method}from* methods`, "UNSUPPORTED_OPERATION", {
            operation
        });
    }
}


/***/ }),

/***/ "./node_modules/ethers/lib.esm/utils/properties.js":
/*!*********************************************************!*\
  !*** ./node_modules/ethers/lib.esm/utils/properties.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   defineProperties: () => (/* binding */ defineProperties),
/* harmony export */   resolveProperties: () => (/* binding */ resolveProperties)
/* harmony export */ });
/**
 *  Property helper functions.
 *
 *  @_subsection api/utils:Properties  [about-properties]
 */
function checkType(value, type, name) {
    const types = type.split("|").map(t => t.trim());
    for (let i = 0; i < types.length; i++) {
        switch (type) {
            case "any":
                return;
            case "bigint":
            case "boolean":
            case "number":
            case "string":
                if (typeof (value) === type) {
                    return;
                }
        }
    }
    const error = new Error(`invalid value for type ${type}`);
    error.code = "INVALID_ARGUMENT";
    error.argument = `value.${name}`;
    error.value = value;
    throw error;
}
/**
 *  Resolves to a new object that is a copy of %%value%%, but with all
 *  values resolved.
 */
async function resolveProperties(value) {
    const keys = Object.keys(value);
    const results = await Promise.all(keys.map((k) => Promise.resolve(value[k])));
    return results.reduce((accum, v, index) => {
        accum[keys[index]] = v;
        return accum;
    }, {});
}
/**
 *  Assigns the %%values%% to %%target%% as read-only values.
 *
 *  It %%types%% is specified, the values are checked.
 */
function defineProperties(target, values, types) {
    for (let key in values) {
        let value = values[key];
        const type = (types ? types[key] : null);
        if (type) {
            checkType(value, type, key);
        }
        Object.defineProperty(target, key, { enumerable: true, value, writable: false });
    }
}


/***/ }),

/***/ "./node_modules/ethers/node_modules/@noble/hashes/esm/_assert.js":
/*!***********************************************************************!*\
  !*** ./node_modules/ethers/node_modules/@noble/hashes/esm/_assert.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bool: () => (/* binding */ bool),
/* harmony export */   bytes: () => (/* binding */ bytes),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   exists: () => (/* binding */ exists),
/* harmony export */   hash: () => (/* binding */ hash),
/* harmony export */   number: () => (/* binding */ number),
/* harmony export */   output: () => (/* binding */ output)
/* harmony export */ });
function number(n) {
    if (!Number.isSafeInteger(n) || n < 0)
        throw new Error(`Wrong positive integer: ${n}`);
}
function bool(b) {
    if (typeof b !== 'boolean')
        throw new Error(`Expected boolean, not ${b}`);
}
function bytes(b, ...lengths) {
    if (!(b instanceof Uint8Array))
        throw new Error('Expected Uint8Array');
    if (lengths.length > 0 && !lengths.includes(b.length))
        throw new Error(`Expected Uint8Array of length ${lengths}, not of length=${b.length}`);
}
function hash(hash) {
    if (typeof hash !== 'function' || typeof hash.create !== 'function')
        throw new Error('Hash should be wrapped by utils.wrapConstructor');
    number(hash.outputLen);
    number(hash.blockLen);
}
function exists(instance, checkFinished = true) {
    if (instance.destroyed)
        throw new Error('Hash instance has been destroyed');
    if (checkFinished && instance.finished)
        throw new Error('Hash#digest() has already been called');
}
function output(out, instance) {
    bytes(out);
    const min = instance.outputLen;
    if (out.length < min) {
        throw new Error(`digestInto() expects output buffer of length at least ${min}`);
    }
}

const assert = { number, bool, bytes, hash, exists, output };
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (assert);


/***/ }),

/***/ "./node_modules/ethers/node_modules/@noble/hashes/esm/_u64.js":
/*!********************************************************************!*\
  !*** ./node_modules/ethers/node_modules/@noble/hashes/esm/_u64.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   add: () => (/* binding */ add),
/* harmony export */   add3H: () => (/* binding */ add3H),
/* harmony export */   add3L: () => (/* binding */ add3L),
/* harmony export */   add4H: () => (/* binding */ add4H),
/* harmony export */   add4L: () => (/* binding */ add4L),
/* harmony export */   add5H: () => (/* binding */ add5H),
/* harmony export */   add5L: () => (/* binding */ add5L),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   fromBig: () => (/* binding */ fromBig),
/* harmony export */   rotlBH: () => (/* binding */ rotlBH),
/* harmony export */   rotlBL: () => (/* binding */ rotlBL),
/* harmony export */   rotlSH: () => (/* binding */ rotlSH),
/* harmony export */   rotlSL: () => (/* binding */ rotlSL),
/* harmony export */   rotr32H: () => (/* binding */ rotr32H),
/* harmony export */   rotr32L: () => (/* binding */ rotr32L),
/* harmony export */   rotrBH: () => (/* binding */ rotrBH),
/* harmony export */   rotrBL: () => (/* binding */ rotrBL),
/* harmony export */   rotrSH: () => (/* binding */ rotrSH),
/* harmony export */   rotrSL: () => (/* binding */ rotrSL),
/* harmony export */   shrSH: () => (/* binding */ shrSH),
/* harmony export */   shrSL: () => (/* binding */ shrSL),
/* harmony export */   split: () => (/* binding */ split),
/* harmony export */   toBig: () => (/* binding */ toBig)
/* harmony export */ });
const U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
const _32n = /* @__PURE__ */ BigInt(32);
// We are not using BigUint64Array, because they are extremely slow as per 2022
function fromBig(n, le = false) {
    if (le)
        return { h: Number(n & U32_MASK64), l: Number((n >> _32n) & U32_MASK64) };
    return { h: Number((n >> _32n) & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
    let Ah = new Uint32Array(lst.length);
    let Al = new Uint32Array(lst.length);
    for (let i = 0; i < lst.length; i++) {
        const { h, l } = fromBig(lst[i], le);
        [Ah[i], Al[i]] = [h, l];
    }
    return [Ah, Al];
}
const toBig = (h, l) => (BigInt(h >>> 0) << _32n) | BigInt(l >>> 0);
// for Shift in [0, 32)
const shrSH = (h, _l, s) => h >>> s;
const shrSL = (h, l, s) => (h << (32 - s)) | (l >>> s);
// Right rotate for Shift in [1, 32)
const rotrSH = (h, l, s) => (h >>> s) | (l << (32 - s));
const rotrSL = (h, l, s) => (h << (32 - s)) | (l >>> s);
// Right rotate for Shift in (32, 64), NOTE: 32 is special case.
const rotrBH = (h, l, s) => (h << (64 - s)) | (l >>> (s - 32));
const rotrBL = (h, l, s) => (h >>> (s - 32)) | (l << (64 - s));
// Right rotate for shift===32 (just swaps l&h)
const rotr32H = (_h, l) => l;
const rotr32L = (h, _l) => h;
// Left rotate for Shift in [1, 32)
const rotlSH = (h, l, s) => (h << s) | (l >>> (32 - s));
const rotlSL = (h, l, s) => (l << s) | (h >>> (32 - s));
// Left rotate for Shift in (32, 64), NOTE: 32 is special case.
const rotlBH = (h, l, s) => (l << (s - 32)) | (h >>> (64 - s));
const rotlBL = (h, l, s) => (h << (s - 32)) | (l >>> (64 - s));
// JS uses 32-bit signed integers for bitwise operations which means we cannot
// simple take carry out of low bit sum by shift, we need to use division.
function add(Ah, Al, Bh, Bl) {
    const l = (Al >>> 0) + (Bl >>> 0);
    return { h: (Ah + Bh + ((l / 2 ** 32) | 0)) | 0, l: l | 0 };
}
// Addition with more than 2 elements
const add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
const add3H = (low, Ah, Bh, Ch) => (Ah + Bh + Ch + ((low / 2 ** 32) | 0)) | 0;
const add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
const add4H = (low, Ah, Bh, Ch, Dh) => (Ah + Bh + Ch + Dh + ((low / 2 ** 32) | 0)) | 0;
const add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
const add5H = (low, Ah, Bh, Ch, Dh, Eh) => (Ah + Bh + Ch + Dh + Eh + ((low / 2 ** 32) | 0)) | 0;
// prettier-ignore

// prettier-ignore
const u64 = {
    fromBig, split, toBig,
    shrSH, shrSL,
    rotrSH, rotrSL, rotrBH, rotrBL,
    rotr32H, rotr32L,
    rotlSH, rotlSL, rotlBH, rotlBL,
    add, add3L, add3H, add4L, add4H, add5H, add5L,
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (u64);


/***/ }),

/***/ "./node_modules/ethers/node_modules/@noble/hashes/esm/crypto.js":
/*!**********************************************************************!*\
  !*** ./node_modules/ethers/node_modules/@noble/hashes/esm/crypto.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   crypto: () => (/* binding */ crypto)
/* harmony export */ });
const crypto = typeof globalThis === 'object' && 'crypto' in globalThis ? globalThis.crypto : undefined;


/***/ }),

/***/ "./node_modules/ethers/node_modules/@noble/hashes/esm/sha3.js":
/*!********************************************************************!*\
  !*** ./node_modules/ethers/node_modules/@noble/hashes/esm/sha3.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Keccak: () => (/* binding */ Keccak),
/* harmony export */   keccakP: () => (/* binding */ keccakP),
/* harmony export */   keccak_224: () => (/* binding */ keccak_224),
/* harmony export */   keccak_256: () => (/* binding */ keccak_256),
/* harmony export */   keccak_384: () => (/* binding */ keccak_384),
/* harmony export */   keccak_512: () => (/* binding */ keccak_512),
/* harmony export */   sha3_224: () => (/* binding */ sha3_224),
/* harmony export */   sha3_256: () => (/* binding */ sha3_256),
/* harmony export */   sha3_384: () => (/* binding */ sha3_384),
/* harmony export */   sha3_512: () => (/* binding */ sha3_512),
/* harmony export */   shake128: () => (/* binding */ shake128),
/* harmony export */   shake256: () => (/* binding */ shake256)
/* harmony export */ });
/* harmony import */ var _assert_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_assert.js */ "./node_modules/ethers/node_modules/@noble/hashes/esm/_assert.js");
/* harmony import */ var _u64_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_u64.js */ "./node_modules/ethers/node_modules/@noble/hashes/esm/_u64.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils.js */ "./node_modules/ethers/node_modules/@noble/hashes/esm/utils.js");



// SHA3 (keccak) is based on a new design: basically, the internal state is bigger than output size.
// It's called a sponge function.
// Various per round constants calculations
const [SHA3_PI, SHA3_ROTL, _SHA3_IOTA] = [[], [], []];
const _0n = /* @__PURE__ */ BigInt(0);
const _1n = /* @__PURE__ */ BigInt(1);
const _2n = /* @__PURE__ */ BigInt(2);
const _7n = /* @__PURE__ */ BigInt(7);
const _256n = /* @__PURE__ */ BigInt(256);
const _0x71n = /* @__PURE__ */ BigInt(0x71);
for (let round = 0, R = _1n, x = 1, y = 0; round < 24; round++) {
    // Pi
    [x, y] = [y, (2 * x + 3 * y) % 5];
    SHA3_PI.push(2 * (5 * y + x));
    // Rotational
    SHA3_ROTL.push((((round + 1) * (round + 2)) / 2) % 64);
    // Iota
    let t = _0n;
    for (let j = 0; j < 7; j++) {
        R = ((R << _1n) ^ ((R >> _7n) * _0x71n)) % _256n;
        if (R & _2n)
            t ^= _1n << ((_1n << /* @__PURE__ */ BigInt(j)) - _1n);
    }
    _SHA3_IOTA.push(t);
}
const [SHA3_IOTA_H, SHA3_IOTA_L] = /* @__PURE__ */ (0,_u64_js__WEBPACK_IMPORTED_MODULE_0__.split)(_SHA3_IOTA, true);
// Left rotation (without 0, 32, 64)
const rotlH = (h, l, s) => (s > 32 ? (0,_u64_js__WEBPACK_IMPORTED_MODULE_0__.rotlBH)(h, l, s) : (0,_u64_js__WEBPACK_IMPORTED_MODULE_0__.rotlSH)(h, l, s));
const rotlL = (h, l, s) => (s > 32 ? (0,_u64_js__WEBPACK_IMPORTED_MODULE_0__.rotlBL)(h, l, s) : (0,_u64_js__WEBPACK_IMPORTED_MODULE_0__.rotlSL)(h, l, s));
// Same as keccakf1600, but allows to skip some rounds
function keccakP(s, rounds = 24) {
    const B = new Uint32Array(5 * 2);
    // NOTE: all indices are x2 since we store state as u32 instead of u64 (bigints to slow in js)
    for (let round = 24 - rounds; round < 24; round++) {
        // Theta θ
        for (let x = 0; x < 10; x++)
            B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
        for (let x = 0; x < 10; x += 2) {
            const idx1 = (x + 8) % 10;
            const idx0 = (x + 2) % 10;
            const B0 = B[idx0];
            const B1 = B[idx0 + 1];
            const Th = rotlH(B0, B1, 1) ^ B[idx1];
            const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
            for (let y = 0; y < 50; y += 10) {
                s[x + y] ^= Th;
                s[x + y + 1] ^= Tl;
            }
        }
        // Rho (ρ) and Pi (π)
        let curH = s[2];
        let curL = s[3];
        for (let t = 0; t < 24; t++) {
            const shift = SHA3_ROTL[t];
            const Th = rotlH(curH, curL, shift);
            const Tl = rotlL(curH, curL, shift);
            const PI = SHA3_PI[t];
            curH = s[PI];
            curL = s[PI + 1];
            s[PI] = Th;
            s[PI + 1] = Tl;
        }
        // Chi (χ)
        for (let y = 0; y < 50; y += 10) {
            for (let x = 0; x < 10; x++)
                B[x] = s[y + x];
            for (let x = 0; x < 10; x++)
                s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
        }
        // Iota (ι)
        s[0] ^= SHA3_IOTA_H[round];
        s[1] ^= SHA3_IOTA_L[round];
    }
    B.fill(0);
}
class Keccak extends _utils_js__WEBPACK_IMPORTED_MODULE_1__.Hash {
    // NOTE: we accept arguments in bytes instead of bits here.
    constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
        super();
        this.blockLen = blockLen;
        this.suffix = suffix;
        this.outputLen = outputLen;
        this.enableXOF = enableXOF;
        this.rounds = rounds;
        this.pos = 0;
        this.posOut = 0;
        this.finished = false;
        this.destroyed = false;
        // Can be passed from user as dkLen
        (0,_assert_js__WEBPACK_IMPORTED_MODULE_2__.number)(outputLen);
        // 1600 = 5x5 matrix of 64bit.  1600 bits === 200 bytes
        if (0 >= this.blockLen || this.blockLen >= 200)
            throw new Error('Sha3 supports only keccak-f1600 function');
        this.state = new Uint8Array(200);
        this.state32 = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.u32)(this.state);
    }
    keccak() {
        keccakP(this.state32, this.rounds);
        this.posOut = 0;
        this.pos = 0;
    }
    update(data) {
        (0,_assert_js__WEBPACK_IMPORTED_MODULE_2__.exists)(this);
        const { blockLen, state } = this;
        data = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.toBytes)(data);
        const len = data.length;
        for (let pos = 0; pos < len;) {
            const take = Math.min(blockLen - this.pos, len - pos);
            for (let i = 0; i < take; i++)
                state[this.pos++] ^= data[pos++];
            if (this.pos === blockLen)
                this.keccak();
        }
        return this;
    }
    finish() {
        if (this.finished)
            return;
        this.finished = true;
        const { state, suffix, pos, blockLen } = this;
        // Do the padding
        state[pos] ^= suffix;
        if ((suffix & 0x80) !== 0 && pos === blockLen - 1)
            this.keccak();
        state[blockLen - 1] ^= 0x80;
        this.keccak();
    }
    writeInto(out) {
        (0,_assert_js__WEBPACK_IMPORTED_MODULE_2__.exists)(this, false);
        (0,_assert_js__WEBPACK_IMPORTED_MODULE_2__.bytes)(out);
        this.finish();
        const bufferOut = this.state;
        const { blockLen } = this;
        for (let pos = 0, len = out.length; pos < len;) {
            if (this.posOut >= blockLen)
                this.keccak();
            const take = Math.min(blockLen - this.posOut, len - pos);
            out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
            this.posOut += take;
            pos += take;
        }
        return out;
    }
    xofInto(out) {
        // Sha3/Keccak usage with XOF is probably mistake, only SHAKE instances can do XOF
        if (!this.enableXOF)
            throw new Error('XOF is not possible for this instance');
        return this.writeInto(out);
    }
    xof(bytes) {
        (0,_assert_js__WEBPACK_IMPORTED_MODULE_2__.number)(bytes);
        return this.xofInto(new Uint8Array(bytes));
    }
    digestInto(out) {
        (0,_assert_js__WEBPACK_IMPORTED_MODULE_2__.output)(out, this);
        if (this.finished)
            throw new Error('digest() was already called');
        this.writeInto(out);
        this.destroy();
        return out;
    }
    digest() {
        return this.digestInto(new Uint8Array(this.outputLen));
    }
    destroy() {
        this.destroyed = true;
        this.state.fill(0);
    }
    _cloneInto(to) {
        const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
        to || (to = new Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
        to.state32.set(this.state32);
        to.pos = this.pos;
        to.posOut = this.posOut;
        to.finished = this.finished;
        to.rounds = rounds;
        // Suffix can change in cSHAKE
        to.suffix = suffix;
        to.outputLen = outputLen;
        to.enableXOF = enableXOF;
        to.destroyed = this.destroyed;
        return to;
    }
}
const gen = (suffix, blockLen, outputLen) => (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.wrapConstructor)(() => new Keccak(blockLen, suffix, outputLen));
const sha3_224 = /* @__PURE__ */ gen(0x06, 144, 224 / 8);
/**
 * SHA3-256 hash function
 * @param message - that would be hashed
 */
const sha3_256 = /* @__PURE__ */ gen(0x06, 136, 256 / 8);
const sha3_384 = /* @__PURE__ */ gen(0x06, 104, 384 / 8);
const sha3_512 = /* @__PURE__ */ gen(0x06, 72, 512 / 8);
const keccak_224 = /* @__PURE__ */ gen(0x01, 144, 224 / 8);
/**
 * keccak-256 hash function. Different from SHA3-256.
 * @param message - that would be hashed
 */
const keccak_256 = /* @__PURE__ */ gen(0x01, 136, 256 / 8);
const keccak_384 = /* @__PURE__ */ gen(0x01, 104, 384 / 8);
const keccak_512 = /* @__PURE__ */ gen(0x01, 72, 512 / 8);
const genShake = (suffix, blockLen, outputLen) => (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.wrapXOFConstructorWithOpts)((opts = {}) => new Keccak(blockLen, suffix, opts.dkLen === undefined ? outputLen : opts.dkLen, true));
const shake128 = /* @__PURE__ */ genShake(0x1f, 168, 128 / 8);
const shake256 = /* @__PURE__ */ genShake(0x1f, 136, 256 / 8);


/***/ }),

/***/ "./node_modules/ethers/node_modules/@noble/hashes/esm/utils.js":
/*!*********************************************************************!*\
  !*** ./node_modules/ethers/node_modules/@noble/hashes/esm/utils.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Hash: () => (/* binding */ Hash),
/* harmony export */   asyncLoop: () => (/* binding */ asyncLoop),
/* harmony export */   bytesToHex: () => (/* binding */ bytesToHex),
/* harmony export */   checkOpts: () => (/* binding */ checkOpts),
/* harmony export */   concatBytes: () => (/* binding */ concatBytes),
/* harmony export */   createView: () => (/* binding */ createView),
/* harmony export */   hexToBytes: () => (/* binding */ hexToBytes),
/* harmony export */   isLE: () => (/* binding */ isLE),
/* harmony export */   nextTick: () => (/* binding */ nextTick),
/* harmony export */   randomBytes: () => (/* binding */ randomBytes),
/* harmony export */   rotr: () => (/* binding */ rotr),
/* harmony export */   toBytes: () => (/* binding */ toBytes),
/* harmony export */   u32: () => (/* binding */ u32),
/* harmony export */   u8: () => (/* binding */ u8),
/* harmony export */   utf8ToBytes: () => (/* binding */ utf8ToBytes),
/* harmony export */   wrapConstructor: () => (/* binding */ wrapConstructor),
/* harmony export */   wrapConstructorWithOpts: () => (/* binding */ wrapConstructorWithOpts),
/* harmony export */   wrapXOFConstructorWithOpts: () => (/* binding */ wrapXOFConstructorWithOpts)
/* harmony export */ });
/* harmony import */ var _noble_hashes_crypto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @noble/hashes/crypto */ "./node_modules/ethers/node_modules/@noble/hashes/esm/crypto.js");
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
// We use WebCrypto aka globalThis.crypto, which exists in browsers and node.js 16+.
// node.js versions earlier than v19 don't declare it in global scope.
// For node.js, package.json#exports field mapping rewrites import
// from `crypto` to `cryptoNode`, which imports native module.
// Makes the utils un-importable in browsers without a bundler.
// Once node.js 18 is deprecated, we can just drop the import.

const u8a = (a) => a instanceof Uint8Array;
// Cast array to different type
const u8 = (arr) => new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
const u32 = (arr) => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
// Cast array to view
const createView = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
// The rotate right (circular right shift) operation for uint32
const rotr = (word, shift) => (word << (32 - shift)) | (word >>> shift);
// big-endian hardware is rare. Just in case someone still decides to run hashes:
// early-throw an error because we don't support BE yet.
const isLE = new Uint8Array(new Uint32Array([0x11223344]).buffer)[0] === 0x44;
if (!isLE)
    throw new Error('Non little-endian hardware is not supported');
const hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, '0'));
/**
 * @example bytesToHex(Uint8Array.from([0xca, 0xfe, 0x01, 0x23])) // 'cafe0123'
 */
function bytesToHex(bytes) {
    if (!u8a(bytes))
        throw new Error('Uint8Array expected');
    // pre-caching improves the speed 6x
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
        hex += hexes[bytes[i]];
    }
    return hex;
}
/**
 * @example hexToBytes('cafe0123') // Uint8Array.from([0xca, 0xfe, 0x01, 0x23])
 */
function hexToBytes(hex) {
    if (typeof hex !== 'string')
        throw new Error('hex string expected, got ' + typeof hex);
    const len = hex.length;
    if (len % 2)
        throw new Error('padded hex string expected, got unpadded hex of length ' + len);
    const array = new Uint8Array(len / 2);
    for (let i = 0; i < array.length; i++) {
        const j = i * 2;
        const hexByte = hex.slice(j, j + 2);
        const byte = Number.parseInt(hexByte, 16);
        if (Number.isNaN(byte) || byte < 0)
            throw new Error('Invalid byte sequence');
        array[i] = byte;
    }
    return array;
}
// There is no setImmediate in browser and setTimeout is slow.
// call of async fn will return Promise, which will be fullfiled only on
// next scheduler queue processing step and this is exactly what we need.
const nextTick = async () => { };
// Returns control to thread each 'tick' ms to avoid blocking
async function asyncLoop(iters, tick, cb) {
    let ts = Date.now();
    for (let i = 0; i < iters; i++) {
        cb(i);
        // Date.now() is not monotonic, so in case if clock goes backwards we return return control too
        const diff = Date.now() - ts;
        if (diff >= 0 && diff < tick)
            continue;
        await nextTick();
        ts += diff;
    }
}
/**
 * @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
 */
function utf8ToBytes(str) {
    if (typeof str !== 'string')
        throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
    return new Uint8Array(new TextEncoder().encode(str)); // https://bugzil.la/1681809
}
/**
 * Normalizes (non-hex) string or Uint8Array to Uint8Array.
 * Warning: when Uint8Array is passed, it would NOT get copied.
 * Keep in mind for future mutable operations.
 */
function toBytes(data) {
    if (typeof data === 'string')
        data = utf8ToBytes(data);
    if (!u8a(data))
        throw new Error(`expected Uint8Array, got ${typeof data}`);
    return data;
}
/**
 * Copies several Uint8Arrays into one.
 */
function concatBytes(...arrays) {
    const r = new Uint8Array(arrays.reduce((sum, a) => sum + a.length, 0));
    let pad = 0; // walk through each item, ensure they have proper type
    arrays.forEach((a) => {
        if (!u8a(a))
            throw new Error('Uint8Array expected');
        r.set(a, pad);
        pad += a.length;
    });
    return r;
}
// For runtime check if class implements interface
class Hash {
    // Safe version that clones internal state
    clone() {
        return this._cloneInto();
    }
}
const toStr = {}.toString;
function checkOpts(defaults, opts) {
    if (opts !== undefined && toStr.call(opts) !== '[object Object]')
        throw new Error('Options should be object or undefined');
    const merged = Object.assign(defaults, opts);
    return merged;
}
function wrapConstructor(hashCons) {
    const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
    const tmp = hashCons();
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = () => hashCons();
    return hashC;
}
function wrapConstructorWithOpts(hashCons) {
    const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
    const tmp = hashCons({});
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = (opts) => hashCons(opts);
    return hashC;
}
function wrapXOFConstructorWithOpts(hashCons) {
    const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
    const tmp = hashCons({});
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = (opts) => hashCons(opts);
    return hashC;
}
/**
 * Secure PRNG. Uses `crypto.getRandomValues`, which defers to OS.
 */
function randomBytes(bytesLength = 32) {
    if (_noble_hashes_crypto__WEBPACK_IMPORTED_MODULE_0__.crypto && typeof _noble_hashes_crypto__WEBPACK_IMPORTED_MODULE_0__.crypto.getRandomValues === 'function') {
        return _noble_hashes_crypto__WEBPACK_IMPORTED_MODULE_0__.crypto.getRandomValues(new Uint8Array(bytesLength));
    }
    throw new Error('crypto.getRandomValues must be defined');
}


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
/* harmony export */   getWalletAddr: () => (/* binding */ getWalletAddr),
/* harmony export */   isWalletConnected: () => (/* binding */ isWalletConnected),
/* harmony export */   provider: () => (/* binding */ provider),
/* harmony export */   updateWalletUI: () => (/* binding */ updateWalletUI),
/* harmony export */   waitForMetaMaskProvider: () => (/* binding */ waitForMetaMaskProvider)
/* harmony export */ });
/* harmony import */ var _metamask_detect_provider__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @metamask/detect-provider */ "./node_modules/@metamask/detect-provider/dist/index.js");
/* harmony import */ var _metamask_detect_provider__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_metamask_detect_provider__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var ethers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ethers */ "./node_modules/ethers/lib.esm/address/address.js");
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
function getWalletAddr() {
    if (!provider || !provider.selectedAddress) {
        console.warn("No wallet address available");
        return undefined;
    }
    return ethers__WEBPACK_IMPORTED_MODULE_1__.getAddress(provider.selectedAddress);
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
/* harmony import */ var ethers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ethers */ "./node_modules/ethers/lib.esm/address/address.js");
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
                        walletAddress = (0,_metamask__WEBPACK_IMPORTED_MODULE_0__.getWalletAddr)();
                        // Check if wallet is connected using MetaMask provider
                        if (!walletAddress) {
                            _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showNotification("Please connect your wallet first", "error");
                            return [2 /*return*/];
                        }
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
                        return [4 /*yield*/, favoriteTrader(favoriteAddr, false)];
                    case 2:
                        _b.sent();
                        button.classList.remove("favorited");
                        button.textContent = "Favorite";
                        _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showNotification("Trader unfavorited successfully", "success");
                        return [3 /*break*/, 5];
                    case 3: 
                    // Send favorite request to server
                    return [4 /*yield*/, favoriteTrader(favoriteAddr, true)];
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
function favoriteTrader(favoriteAddr, favorite) {
    return __awaiter(this, void 0, void 0, function () {
        var walletAddr, timestamp, action, message, signature, response, errorData, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    walletAddr = (0,_metamask__WEBPACK_IMPORTED_MODULE_0__.getWalletAddr)();
                    favoriteAddr = ethers__WEBPACK_IMPORTED_MODULE_2__.getAddress(favoriteAddr);
                    timestamp = Date.now();
                    action = favorite ? "Favorite" : "Unfavorite";
                    message = "".concat(action, " trader ").concat(favoriteAddr, " for ").concat(walletAddr, " at ").concat(timestamp);
                    // Request wallet signature using MetaMask provider
                    if (!_metamask__WEBPACK_IMPORTED_MODULE_0__.provider) {
                        throw new Error("MetaMask provider not available");
                    }
                    return [4 /*yield*/, _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.request({
                            method: "personal_sign",
                            params: [message, walletAddr],
                        })];
                case 1:
                    signature = (_a.sent());
                    if (!signature) {
                        throw new Error("Failed to get wallet signature");
                    }
                    return [4 /*yield*/, fetch("/api/traders/".concat(walletAddr, "/favorite_trader"), {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                walletAddr: walletAddr,
                                traderAddr: favoriteAddr,
                                signature: signature,
                                message: message,
                                timestamp: timestamp,
                                favorite: favorite,
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
                    console.log("".concat(action, " trader response:"), result);
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    console.error("Error in favoriteTrader:", error_2);
                    throw error_2;
                case 7: return [2 /*return*/];
            }
        });
    });
}
var profile = {
    init: init,
    favoriteTrader: favoriteTrader,
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (profile);


/***/ }),

/***/ "./static/ts-front-end/router.ts":
/*!***************************************!*\
  !*** ./static/ts-front-end/router.ts ***!
  \***************************************/
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


function loadProfile(address) {
    return __awaiter(this, void 0, void 0, function () {
        var apiUrl, browserUrl, walletAddr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!address) return [3 /*break*/, 2];
                    apiUrl = "/api/html/traderprofile?address=".concat(encodeURIComponent(address));
                    browserUrl = "/traderprofile?address=".concat(encodeURIComponent(address));
                    walletAddr = (0,_metamask__WEBPACK_IMPORTED_MODULE_0__.getWalletAddr)();
                    if (walletAddr) {
                        apiUrl += "&userAddress=".concat(encodeURIComponent(walletAddr));
                    }
                    return [4 /*yield*/, loadContent({
                            apiUrl: apiUrl,
                            browserUrl: browserUrl,
                            title: "Trader Profile",
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
        var currentPath, searchParams, _a, address, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    currentPath = window.location.pathname;
                    searchParams = new URLSearchParams(window.location.search);
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
                        updateUrl: false, // Don't update URL on initial page load
                    })];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 8];
                case 6:
                    address = searchParams.get("address");
                    loadProfile(address);
                    return [3 /*break*/, 8];
                case 7: 
                // For root or unknown paths, don't load anything (let redirect handle it)
                return [3 /*break*/, 8];
                case 8: return [3 /*break*/, 10];
                case 9:
                    error_1 = _b.sent();
                    console.error("Error loading initial content:", error_1);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
// Helper function to update content with optional URL change
function loadContent(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var contentDiv_1, tz, headers, walletAddr, response, html, contentDiv, error_2;
        var apiUrl = _b.apiUrl, browserUrl = _b.browserUrl, title = _b.title, content = _b.content, _c = _b.updateUrl, updateUrl = _c === void 0 ? true : _c;
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
                    tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    headers = {
                        "Content-Type": "application/json",
                        "x-timezone": tz,
                    };
                    walletAddr = (0,_metamask__WEBPACK_IMPORTED_MODULE_0__.getWalletAddr)();
                    if (walletAddr) {
                        headers["x-wallet-address"] = walletAddr;
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
                    error_2 = _d.sent();
                    console.error("Error loading content:", error_2);
                    _utils__WEBPACK_IMPORTED_MODULE_1__["default"].showNotification("Error loading content", "error");
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
var router = {
    loadProfile: loadProfile,
    loadContentForCurrentPage: loadContentForCurrentPage,
    loadContent: loadContent,
    showLoadingState: showLoadingState,
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);


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
function generateIconColor(address) {
    var hash = address.slice(2, 8);
    var r = parseInt(hash.slice(0, 2), 16);
    var g = parseInt(hash.slice(2, 4), 16);
    var b = parseInt(hash.slice(4, 6), 16);
    return "rgb(".concat(r, ", ").concat(g, ", ").concat(b, ")");
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
    generateIconColor: generateIconColor,
    watchElementsOfQuery: watchElementsOfQuery,
    showNotification: showNotification,
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (utils);


/***/ }),

/***/ "./static/ts-front-end/watchlist/favorites.ts":
/*!****************************************************!*\
  !*** ./static/ts-front-end/watchlist/favorites.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var ethers__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ethers */ "./node_modules/ethers/lib.esm/address/address.js");
/* harmony import */ var _metamask__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../metamask */ "./static/ts-front-end/metamask.ts");
/* harmony import */ var _profile__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../profile */ "./static/ts-front-end/profile.ts");
/* harmony import */ var _router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../router */ "./static/ts-front-end/router.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils */ "./static/ts-front-end/utils.ts");
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
                var traderIdentity, traderCard, address, btn;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            traderIdentity = e.target.closest(".trader-identity");
                            if (traderIdentity) {
                                e.preventDefault();
                                traderCard = traderIdentity.closest(".trader-card");
                                address = traderCard === null || traderCard === void 0 ? void 0 : traderCard.getAttribute("data-address");
                                if (address) {
                                    _router__WEBPACK_IMPORTED_MODULE_2__["default"].loadProfile(address);
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
            _utils__WEBPACK_IMPORTED_MODULE_3__["default"].watchElementsOfQuery("#mirrorToggle", function (mirrorToggle) {
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
            _utils__WEBPACK_IMPORTED_MODULE_3__["default"].watchElementsOfQuery(".tab-button", function (element) {
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
        var walletAddr, targetEnable, labelText, ts, msg, sig, res, json, err_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    walletAddr = (0,_metamask__WEBPACK_IMPORTED_MODULE_0__.getWalletAddr)();
                    if (!_metamask__WEBPACK_IMPORTED_MODULE_0__.provider || !walletAddr) {
                        _utils__WEBPACK_IMPORTED_MODULE_3__["default"].showNotification("Please connect your wallet first", "error");
                        // revert UI toggle if no wallet
                        toggle.checked = !toggle.checked;
                        return [2 /*return*/];
                    }
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
                    msg = "".concat(targetEnable ? "Enable" : "Disable", " auto-copy trading for ").concat(walletAddr, " at ").concat(ts);
                    return [4 /*yield*/, _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.request({
                            method: "personal_sign",
                            params: [msg, walletAddr],
                        })];
                case 2:
                    sig = _b.sent();
                    return [4 /*yield*/, fetch("/api/traders/".concat(walletAddr, "/auto_copy"), {
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
                    _utils__WEBPACK_IMPORTED_MODULE_3__["default"].showNotification("Auto-copy trading ".concat(targetEnable ? "enabled" : "disabled"), "success");
                    return [3 /*break*/, 7];
                case 5:
                    err_1 = _b.sent();
                    console.error(err_1);
                    _utils__WEBPACK_IMPORTED_MODULE_3__["default"].showNotification(err_1.message, "error");
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
        var copyAddr, walletAddr, origText, traderCard_1, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!button.dataset.address) {
                        return [2 /*return*/, console.error("No trader address specified for removal")];
                    }
                    copyAddr = ethers__WEBPACK_IMPORTED_MODULE_4__.getAddress(button.dataset.address);
                    walletAddr = (0,_metamask__WEBPACK_IMPORTED_MODULE_0__.getWalletAddr)();
                    if (!copyAddr)
                        return [2 /*return*/, console.error("No trader address")];
                    if (!walletAddr) {
                        return [2 /*return*/, _utils__WEBPACK_IMPORTED_MODULE_3__["default"].showNotification("Please connect your wallet first", "error")];
                    }
                    origText = button.textContent;
                    button.textContent = "Processing...";
                    button.disabled = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, _profile__WEBPACK_IMPORTED_MODULE_1__["default"].favoriteTrader(copyAddr, false)];
                case 2:
                    _a.sent();
                    _utils__WEBPACK_IMPORTED_MODULE_3__["default"].showNotification("Trader removed from favorites", "success");
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
                    _utils__WEBPACK_IMPORTED_MODULE_3__["default"].showNotification(err_2.message || "Failed to remove trader", "error");
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
        var walletAddr, copyAddr, origText, ts, msg, sig, res, json, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!button.dataset.address) {
                        return [2 /*return*/, console.error("No trader address specified for selection")];
                    }
                    walletAddr = (0,_metamask__WEBPACK_IMPORTED_MODULE_0__.getWalletAddr)();
                    copyAddr = ethers__WEBPACK_IMPORTED_MODULE_4__.getAddress(button.dataset.address);
                    if (!copyAddr)
                        return [2 /*return*/, console.error("No trader address")];
                    if (!_metamask__WEBPACK_IMPORTED_MODULE_0__.provider || !walletAddr) {
                        return [2 /*return*/, _utils__WEBPACK_IMPORTED_MODULE_3__["default"].showNotification("Please connect your wallet first", "error")];
                    }
                    origText = button.textContent;
                    button.textContent = "Processing...";
                    button.disabled = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    ts = Date.now();
                    msg = "Select traders ".concat(copyAddr, " for ").concat(walletAddr, " at ").concat(ts);
                    return [4 /*yield*/, _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.request({
                            method: "personal_sign",
                            params: [msg, walletAddr],
                        })];
                case 2:
                    sig = _a.sent();
                    return [4 /*yield*/, fetch("/api/traders/".concat(walletAddr, "/select_traders"), {
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
                    _utils__WEBPACK_IMPORTED_MODULE_3__["default"].showNotification("Trader selected", "success");
                    button.textContent = "✓ Selected for Copying";
                    button.classList.replace("select-trader", "unselect-trader");
                    button.classList.replace("btn-primary", "btn-success");
                    button.classList.add("selected");
                    return [3 /*break*/, 7];
                case 5:
                    err_3 = _a.sent();
                    console.error(err_3);
                    _utils__WEBPACK_IMPORTED_MODULE_3__["default"].showNotification(err_3.message, "error");
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
        var walletAddr, copyAddr, origText, ts, msg, sig, res, json, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!button.dataset.address) {
                        return [2 /*return*/, console.error("No trader address specified for unselection")];
                    }
                    walletAddr = (0,_metamask__WEBPACK_IMPORTED_MODULE_0__.getWalletAddr)();
                    copyAddr = ethers__WEBPACK_IMPORTED_MODULE_4__.getAddress(button.dataset.address);
                    if (!copyAddr)
                        return [2 /*return*/, console.error("No trader address")];
                    if (!_metamask__WEBPACK_IMPORTED_MODULE_0__.provider || !walletAddr) {
                        return [2 /*return*/, _utils__WEBPACK_IMPORTED_MODULE_3__["default"].showNotification("Please connect your wallet first", "error")];
                    }
                    origText = button.textContent;
                    button.textContent = "Processing...";
                    button.disabled = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    ts = Date.now();
                    msg = "Unselect traders ".concat(copyAddr, " for ").concat(walletAddr, " at ").concat(ts);
                    return [4 /*yield*/, _metamask__WEBPACK_IMPORTED_MODULE_0__.provider.request({
                            method: "personal_sign",
                            params: [msg, walletAddr],
                        })];
                case 2:
                    sig = _a.sent();
                    return [4 /*yield*/, fetch("/api/traders/".concat(walletAddr, "/unselect_traders"), {
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
                    _utils__WEBPACK_IMPORTED_MODULE_3__["default"].showNotification("Trader unselected", "success");
                    button.textContent = "Select for Copying";
                    button.classList.replace("unselect-trader", "select-trader");
                    button.classList.replace("btn-success", "btn-primary");
                    button.classList.remove("selected");
                    return [3 /*break*/, 7];
                case 5:
                    err_4 = _a.sent();
                    console.error(err_4);
                    _utils__WEBPACK_IMPORTED_MODULE_3__["default"].showNotification(err_4.message, "error");
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


/***/ }),

/***/ "./static/ts-front-end/watchlist/open-positions.ts":
/*!*********************************************************!*\
  !*** ./static/ts-front-end/watchlist/open-positions.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./static/ts-front-end/utils.ts");
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

// Global function for onclick in HTML
window.toggleTraderPositions = toggleTraderPositions;
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            // Handle clicks within open positions tab
            document.body.addEventListener("click", function (e) { return __awaiter(_this, void 0, void 0, function () {
                var btn;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            btn = e.target.closest("button");
                            if (!btn) return [3 /*break*/, 2];
                            if (!btn.classList.contains("load-trades-btn")) return [3 /*break*/, 2];
                            return [4 /*yield*/, handleLoadTrades(btn)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            }); });
            // Initialize collapsed state when tab becomes active
            _utils__WEBPACK_IMPORTED_MODULE_0__["default"].watchElementsOfQuery(".tab-button[data-tab='all-open-positions']", function (element) {
                var tabBtn = element;
                tabBtn.addEventListener("click", function () {
                    // Small delay to ensure tab content is loaded
                    setTimeout(function () {
                        initializeCollapsedState();
                    }, 100);
                });
            });
            return [2 /*return*/];
        });
    });
}
function initializeCollapsedState() {
    var traderGroups = document.querySelectorAll(".trader-positions-group");
    traderGroups.forEach(function (group) {
        // Ensure all positions start collapsed
        var positionsList = group.querySelector(".positions-list");
        if (positionsList) {
            positionsList.classList.add("collapsed");
            positionsList.classList.remove("expanded");
        }
        // Ensure trader group is not marked as expanded
        group.classList.remove("expanded");
    });
}
function toggleTraderPositions(traderAddress) {
    var traderGroup = document.querySelector(".trader-positions-group[data-trader=\"".concat(traderAddress, "\"]"));
    if (!traderGroup)
        return;
    var positionsList = traderGroup.querySelector(".positions-list");
    if (!positionsList)
        return;
    var isCurrentlyCollapsed = positionsList.classList.contains("collapsed");
    if (isCurrentlyCollapsed) {
        // Expand
        positionsList.classList.remove("collapsed");
        positionsList.classList.add("expanded");
        traderGroup.classList.add("expanded");
    }
    else {
        // Collapse
        positionsList.classList.remove("expanded");
        positionsList.classList.add("collapsed");
        traderGroup.classList.remove("expanded");
    }
}
function handleLoadTrades(button) {
    return __awaiter(this, void 0, void 0, function () {
        var traderAddress, positionId, originalText, response, trades, positionCard, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    traderAddress = button.dataset.trader;
                    positionId = button.dataset.position;
                    if (!traderAddress || !positionId) {
                        console.error("Missing trader address or position ID");
                        return [2 /*return*/];
                    }
                    originalText = button.textContent;
                    // Set loading state
                    button.classList.add("loading");
                    button.textContent = "Loading...";
                    button.disabled = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, fetch("/api/traders/".concat(traderAddress, "/positions/").concat(positionId, "/trades"))];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to load trades: ".concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    trades = _a.sent();
                    positionCard = button.closest(".position-card");
                    if (!positionCard) return [3 /*break*/, 5];
                    return [4 /*yield*/, renderTradesInPosition(positionCard, trades)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    // Update button to show success
                    button.textContent = " Trades Loaded";
                    button.classList.remove("loading");
                    // Hide the button after successful load
                    setTimeout(function () {
                        button.style.display = "none";
                    }, 1500);
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error("Error loading trades:", error_1);
                    _utils__WEBPACK_IMPORTED_MODULE_0__["default"].showNotification(error_1.message || "Failed to load trades", "error");
                    // Reset button state
                    button.textContent = originalText;
                    button.classList.remove("loading");
                    button.disabled = false;
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function renderTradesInPosition(positionCard, trades) {
    return __awaiter(this, void 0, void 0, function () {
        var tradesSection, tradesHtml;
        return __generator(this, function (_a) {
            tradesSection = positionCard.querySelector(".associated-trades");
            if (!tradesSection) {
                // Create new trades section
                tradesSection = document.createElement("div");
                tradesSection.className = "associated-trades";
                positionCard.appendChild(tradesSection);
            }
            tradesHtml = "\n    <h4 class=\"trades-header\">Associated Trades (".concat(trades.length, ")</h4>\n    <div class=\"trades-list\">\n      ").concat(trades.map(function (trade) { return renderTradeRow(trade); }).join(""), "\n    </div>\n  ");
            tradesSection.innerHTML = tradesHtml;
            // Add fade-in animation
            tradesSection.style.opacity = "0";
            tradesSection.style.transition = "opacity 0.3s ease";
            setTimeout(function () {
                tradesSection.style.opacity = "1";
            }, 50);
            return [2 /*return*/];
        });
    });
}
function renderTradeRow(trade) {
    var orderTypeNames = {
        0: "MarketSwap",
        1: "LimitSwap",
        2: "MarketIncrease",
        3: "LimitIncrease",
        4: "MarketDecrease",
        5: "LimitDecrease",
        6: "StopLossDecrease",
        7: "Liquidation",
        8: "StopIncrease",
        9: "Deposit",
    };
    var orderTypeName = orderTypeNames[trade.orderType] || "Unknown";
    var timestamp = new Date(trade.timestamp * 1000).toLocaleDateString();
    var pnlClass = trade.rpnl >= 0 ? "positive" : "negative";
    return "\n    <div class=\"trade-row\">\n      <div class=\"trade-info\">\n        <span class=\"trade-type\">".concat(orderTypeName, "</span>\n        <span class=\"trade-date\">").concat(timestamp, "</span>\n      </div>\n      <div class=\"trade-details\">\n      </div>\n    </div>\n  ");
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
/* harmony import */ var _router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./router */ "./static/ts-front-end/router.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils */ "./static/ts-front-end/utils.ts");
/* harmony import */ var _watchlist_favorites__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./watchlist/favorites */ "./static/ts-front-end/watchlist/favorites.ts");
/* harmony import */ var _watchlist_open_positions__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./watchlist/open-positions */ "./static/ts-front-end/watchlist/open-positions.ts");
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
                console.log("Popstate, loading content…");
                return [4 /*yield*/, _router__WEBPACK_IMPORTED_MODULE_2__["default"].loadContentForCurrentPage()];
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
                _watchlist_favorites__WEBPACK_IMPORTED_MODULE_4__["default"].init();
                _watchlist_open_positions__WEBPACK_IMPORTED_MODULE_5__["default"].init();
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
                _utils__WEBPACK_IMPORTED_MODULE_3__["default"].showToast("Initialization error", "error");
                return [3 /*break*/, 5];
            case 5: 
            // initial load
            return [4 /*yield*/, _router__WEBPACK_IMPORTED_MODULE_2__["default"].loadContentForCurrentPage()];
            case 6:
                // initial load
                _a.sent();
                topTradersBtn = document.getElementById("topTradersBtn");
                myWatchListBtn = document.getElementById("myWatchListBtn");
                if (topTradersBtn) {
                    topTradersBtn.addEventListener("click", function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, _router__WEBPACK_IMPORTED_MODULE_2__["default"].loadContent({
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
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, _router__WEBPACK_IMPORTED_MODULE_2__["default"].loadContent({
                                        apiUrl: "/api/html/mywatchlist",
                                        browserUrl: "/mywatchlist",
                                        title: "My Watchlist",
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
                    var traderRow, profileAddr;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                traderRow = event.target.closest("tr");
                                if (!traderRow)
                                    return [2 /*return*/];
                                profileAddr = traderRow.getAttribute("address");
                                if (!profileAddr)
                                    return [2 /*return*/];
                                return [4 /*yield*/, _router__WEBPACK_IMPORTED_MODULE_2__["default"].loadProfile(profileAddr)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
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
    _utils__WEBPACK_IMPORTED_MODULE_3__["default"].showToast("An error occurred. Please refresh the page.", "error");
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