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
exports.validateDid = exports.createDid = void 0;
const jwkJcsPubCodec = __importStar(require("./codecs/jwk_jcs-pub"));
const constants_1 = require("./constants");
const internals_1 = require("./internals");
/**
 * Generic function to create a `did:key:` DID based on the provided public key and codec.
 *
 * Note: currently, the only supported codec is "jwk_jcs-pub" and the public key format is JWK.
 *
 * @param publicKey - The raw public key, in the format required by the codec's `encode()` method.
 * @param codec - The multiformats codec to use.
 * @returns
 */
function createDid(publicKey, codec = jwkJcsPubCodec) {
    if (codec.code !== jwkJcsPubCodec.code) {
        throw new Error(`The @cef-ebsi/key-did-resolver library only supports the "${jwkJcsPubCodec.name}" codec (${jwkJcsPubCodec.code})`);
    }
    try {
        return `${constants_1.KEY_DID_METHOD_PREFIX}${(0, internals_1.encodePublicKey)(codec.encode(publicKey), codec.code)}`;
    }
    catch (e) {
        throw new Error(e instanceof Error ? e.message : "Unknown error");
    }
}
exports.createDid = createDid;
/**
 * Asserts if the DID can be resolved.
 *
 * @param did - The DID to verify
 */
function validateDid(did) {
    (0, internals_1.resolveDidDoc)(did);
}
exports.validateDid = validateDid;
//# sourceMappingURL=util.js.map