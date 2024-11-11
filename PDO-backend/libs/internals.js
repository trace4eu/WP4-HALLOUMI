"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDidDoc = exports.decodePublicKey = exports.encodePublicKey = void 0;
const multiformats_1 = require("multiformats");
const base58_1 = require("multiformats/bases/base58");
const constants_1 = require("./constants");
const errors_1 = require("./errors");
const codec = __importStar(require("./codecs/jwk_jcs-pub"));
const jwkDriver = __importStar(require("./drivers/jwk_jcs-pub"));
/**
 * Supported drivers
 */
const codecToDriver = {
    [codec.code]: jwkDriver,
};
/**
 * Encodes the public key (bytes) as:
 *
 * ```
 * MULTIBASE(base58-btc, MULTICODEC(public-key-type, raw-public-key-bytes))
 * ```
 *
 * @see https://w3c-ccg.github.io/did-method-key/#format
 * @see https://github.com/multiformats/multicodec/blob/master/table.csv
 *
 * @param pubKeyBytes - The "raw-public-key-bytes".
 * @param code - The "public-key-type" multicodec code. E.g: 0xeb51
 * @returns The encoded public key.
 */
const encodePublicKey = (pubKeyBytes, code) => {
    const size = pubKeyBytes.byteLength;
    const sizeOffset = multiformats_1.varint.encodingLength(code);
    const messageOffset = sizeOffset;
    const bytes = new Uint8Array(messageOffset + size);
    multiformats_1.varint.encodeTo(code, bytes, 0);
    bytes.set(pubKeyBytes, messageOffset);
    return base58_1.base58btc.encode(bytes);
};
exports.encodePublicKey = encodePublicKey;
/**
 * Decodes the multibase-base58btc-encoded public key and the related multicodec code.
 *
 * @param publicKey - The encoded public key.
 * @returns The decoded public key (bytes) and the multicodec code.
 */
const decodePublicKey = (publicKey) => {
    const multicodecPubKey = base58_1.base58btc.decode(publicKey);
    const [code, sizeOffset] = multiformats_1.varint.decode(multicodecPubKey);
    const pubKeyBytes = multicodecPubKey.slice(sizeOffset);
    return {
        pubKeyBytes,
        code,
    };
};
exports.decodePublicKey = decodePublicKey;
/**
 * Resolves a DID Document based on the given DID.
 *
 * @param did - The DID to resolve.
 * @param contentType - The content type, e.g. "application/did+ld+json" or "application/did+json" (optional).
 * @returns The DID Document decoded from the method specific identifier.
 */
function resolveDidDoc(did, contentType) {
    let pubKeyBytes;
    let code;
    if (!did || typeof did !== "string") {
        throw new errors_1.InvalidDidError("The DID must be a string");
    }
    if (!did.startsWith(constants_1.KEY_DID_METHOD_PREFIX)) {
        throw new errors_1.InvalidDidError(`The DID must start with "${constants_1.KEY_DID_METHOD_PREFIX}"`);
    }
    const methodSpecificIdentifier = did.substring(constants_1.KEY_DID_METHOD_PREFIX.length);
    if (!methodSpecificIdentifier.startsWith(base58_1.base58btc.prefix)) {
        throw new errors_1.InvalidDidError(`The method-specific identifier must start with "${base58_1.base58btc.prefix}" (multibase base58btc-encoded)`);
    }
    try {
        const decodedResult = (0, exports.decodePublicKey)(methodSpecificIdentifier);
        pubKeyBytes = decodedResult.pubKeyBytes;
        code = decodedResult.code;
    }
    catch (e) {
        throw new errors_1.InvalidDidError("The method-specific identifier is not a valid multibase base58btc-encoded string");
    }
    if (!codecToDriver[code]) {
        throw new errors_1.InvalidDidError(`Unsupported codec ${code}`);
    }
    const didDocument = codecToDriver[code].pubKeyBytesToDidDoc(pubKeyBytes, methodSpecificIdentifier, contentType);
    return didDocument;
}
exports.resolveDidDoc = resolveDidDoc;
//# sourceMappingURL=internals.js.map