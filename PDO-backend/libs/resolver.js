"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResolver = void 0;
const constants_1 = require("./constants");
const errors_1 = require("./errors");
const internals_1 = require("./internals");
/**
 * DID Resolver for Natural Persons (did:key method)
 *
 * @returns A record mapping the "key" method with the resolver.
 */
function getResolver() {
    function resolve(did, parsedDid, resolver, didResolutionOptions) {
        try {
            const contentType = didResolutionOptions?.accept || constants_1.DID_LD_JSON;
            if (!constants_1.SUPPORTED_CONTENT_TYPES.includes(contentType)) {
                throw new errors_1.RepresentationNotSupportedError(`Representation "${contentType}" is not supported`);
            }
            const didDocument = (0, internals_1.resolveDidDoc)(did, contentType);
            return Promise.resolve({
                didDocument,
                didDocumentMetadata: {},
                didResolutionMetadata: { contentType },
            });
        }
        catch (e) {
            if (e instanceof errors_1.DidResolutionError) {
                return Promise.resolve({
                    didDocument: null,
                    didDocumentMetadata: {},
                    didResolutionMetadata: {
                        error: e.code,
                        message: e.message,
                    },
                });
            }
            const message = e instanceof Error ? e.message : "Unknown error";
            return Promise.resolve({
                didDocument: null,
                didDocumentMetadata: {},
                didResolutionMetadata: {
                    error: "invalidDid",
                    message,
                },
            });
        }
    }
    return { key: resolve };
}
exports.getResolver = getResolver;
exports.default = getResolver;
//# sourceMappingURL=resolver.js.map