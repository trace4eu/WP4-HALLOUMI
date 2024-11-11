import {
  decodeJwt,
  decodeProtectedHeader,
  importJWK,
  JWTPayload,
  jwtVerify,
  ProtectedHeaderParameters,
} from "jose";
import type { Level } from "level";
import type { Resolver } from "did-resolver";
import {
  accessTokenHeaderSchema,
  AccessTokenPayload,
  accessTokenPayloadSchema,
  CredentialRequest,
  credentialRequestProofHeaderSchema,
  credentialRequestProofPayloadSchema,
  credentialRequestSchema,
} from "./validators/index.js";
import { CredentialError } from "../errors/index.js";
import type { JWKWithKid } from "../utils/index.js";
import type {
  CachedNonce,
  LevelDbKeyIssuer,
  LevelDbObjectIssuer,
} from "./interfaces.js";
import type { Cache } from "cache-manager";

export async function validatePostCredential(
 // db: Level<LevelDbKeyIssuer, LevelDbObjectIssuer>,
  cachemanager: Cache,
  serverDid: string,
  serverUrl: string,
  authPublicKeyJwk: JWKWithKid,
  ebsiResolver: Resolver,
  keyResolver: Resolver,
  timeout: number | undefined,
  authorizationHeader: string,
  rawRequestBody: unknown
): Promise<{
  credentialRequest: CredentialRequest;
  accessTokenPayload: AccessTokenPayload;
}> {
  if (!authorizationHeader) {
    throw new CredentialError("invalid_token", {
      errorDescription: "Authorization header is missing",
    });
  }

  if (!authorizationHeader.startsWith("Bearer ")) {
    throw new CredentialError("invalid_token", {
      errorDescription: "Authorization header must contain a Bearer token",
    });
  }

  const accessToken = authorizationHeader.replace("Bearer ", "");

  // Try to decode Access Token header
  let rawAccessTokenHeaderParams: ProtectedHeaderParameters;
  try {
    rawAccessTokenHeaderParams = decodeProtectedHeader(accessToken);
  } catch (e) {
    throw new CredentialError("invalid_token", {
      errorDescription: "Invalid Access Token header. Parsing failed.",
    });
  }

  // Validate Access Token JWT header
  const parsedAccessTokenHeaderParams = accessTokenHeaderSchema.safeParse(
    rawAccessTokenHeaderParams
  );

  if (!parsedAccessTokenHeaderParams.success) {
    const errorDesc = parsedAccessTokenHeaderParams.error.issues
      .map((issue) => `'${issue.path.join(".")}': ${issue.message}`)
      .join("\n");

    throw new CredentialError("invalid_token", {
      errorDescription: `Invalid Access Token header: ${errorDesc}`,
    });
  }
  const accessTokenHeaderParams = parsedAccessTokenHeaderParams.data;

  // Try to decode Access Token payload
  let rawAccessTokenPayload: JWTPayload;
  try {
    rawAccessTokenPayload = decodeJwt(accessToken);
  } catch (e) {
    throw new CredentialError("invalid_token", {
      errorDescription: "Invalid Access Token payload. Parsing failed.",
    });
  }

  // Validate Access Token payload
  const parsedAccessTokenPayload = accessTokenPayloadSchema.safeParse(
    rawAccessTokenPayload
  );

  if (!parsedAccessTokenPayload.success) {
    const errorDesc = parsedAccessTokenPayload.error.issues
      .map((issue) => `'${issue.path.join(".")}': ${issue.message}`)
      .join("\n");

    throw new CredentialError("invalid_token", {
      errorDescription: `Invalid Access Token payload: ${errorDesc}`,
    });
  }

  // Validate that Issuer Mock URI is included in the access token "aud"
  const accessTokenPayload = parsedAccessTokenPayload.data;
  if (!accessTokenPayload.aud.includes(serverUrl)) {
    throw new CredentialError("invalid_token", {
      errorDescription: `Invalid Access Token payload: the audience must include ${serverUrl}`,
    });
  }

  // Check if the c_nonce has already been used
  let cachedNonceAccessToken: CachedNonce | undefined;
  // try {
  //   cachedNonceAccessToken = (await db.get({
  //     did: serverDid,
  //     nonceAccessToken: accessTokenPayload.claims.c_nonce,
      
  //   })) as CachedNonce;
  // } catch {
  //   // empty
  // }

  try {
    cachedNonceAccessToken = (await cachemanager.get(
     accessTokenPayload.claims.c_nonce,
      
    )) as CachedNonce;
  } catch {
    // empty
  }
  if (cachedNonceAccessToken) {
    throw new CredentialError("invalid_token", {
      errorDescription: "The access token has already been used",
    });
  }

  // Make sure the Access Token is valid
  const now = Math.floor(Date.now() / 1000);
  if (accessTokenPayload.exp < now) {
    throw new CredentialError("invalid_token", {
      errorDescription: "The access token is expired",
    });
  }

  if (accessTokenPayload.iat > now) {
    throw new CredentialError("invalid_token", {
      errorDescription: "The access token is not yet valid",
    });
  }

  // Verify access token kid + signature
  // Note: ideally, the Issuer Mock should dynamically retrieve the public key of the Auth Mock.
  // However, since they're both on the same server, we can import the public key directly.
  if (accessTokenHeaderParams.kid !== authPublicKeyJwk.kid) {
    throw new CredentialError("invalid_token", {
      errorDescription:
        "Invalid Access Token header: kid doesn't match Auth Mock's public key",
    });
  }

  const authPublicKey = await importJWK(authPublicKeyJwk);
  try {
    await jwtVerify(accessToken, authPublicKey);
  } catch (e) {
    throw new CredentialError("invalid_token", {
      errorDescription: `Invalid Access Token: ${
        e instanceof Error ? e.message : "invalid signature"
      }`,
    });
  }

  // Validate request body
  const parsedRequestBody = credentialRequestSchema.safeParse(rawRequestBody);
  if (!parsedRequestBody.success) {
    const errorDesc = parsedRequestBody.error.issues
      .map((issue) => `'${issue.path.join(".")}': ${issue.message}`)
      .join("\n");

    throw new CredentialError("invalid_request", {
      errorDescription: `Invalid request payload: ${errorDesc}`,
    });
  }
  const requestBody = parsedRequestBody.data;

  // Verify authorization_details (all the requested types must be included in the authorization details)
  if (
    !requestBody.types.every((type) =>
      accessTokenPayload.claims.authorization_details[0].types.includes(type)
    )
  ) {
    throw new CredentialError("invalid_request", {
      errorDescription: `Invalid request: the requested types don't correspond to the authorized types`,
      statusCode: 401,
    });
  }

  // Decode and parse proof.jwt
  let rawProofPayload: JWTPayload;
  try {
    rawProofPayload = decodeJwt(requestBody.proof.jwt);
  } catch (e) {
    throw new CredentialError("invalid_or_missing_proof", {
      errorDescription: "Invalid Proof JWT. Parsing failed.",
    });
  }

  const parsedProofPayload =
    credentialRequestProofPayloadSchema.safeParse(rawProofPayload);

  if (!parsedProofPayload.success) {
    const errorDesc = parsedProofPayload.error.issues
      .map((issue) => `'${issue.path.join(".")}': ${issue.message}`)
      .join("\n");

    throw new CredentialError("invalid_or_missing_proof", {
      errorDescription: `Invalid Proof JWT: ${errorDesc}`,
    });
  }

  const proofPayload = parsedProofPayload.data;

  if (proofPayload.nonce !== accessTokenPayload.claims.c_nonce) {
    throw new CredentialError("invalid_or_missing_proof", {
      errorDescription:
        "Invalid Proof JWT: nonce doesn't match the expected c_nonce",
    });
  }

  if (proofPayload.aud !== serverUrl) {
    throw new CredentialError("invalid_or_missing_proof", {
      errorDescription: `Invalid Proof JWT: aud doesn't match the expected audience ${serverUrl}`,
    });
  }

  if (proofPayload.iss !== accessTokenPayload.claims.client_id) {
    throw new CredentialError("invalid_or_missing_proof", {
      errorDescription:
        "Invalid Proof JWT: iss doesn't match the expected client_id",
    });
  }

  // Verify proof signature
  if (requestBody.types.includes("VerifiableAuthorisationToOnboard")) {
    // Skip signature validation, as the DID is not yet registered
  } else {
    // Decode proof headers
    let rawProofHeaderParams: ProtectedHeaderParameters;
    try {
      rawProofHeaderParams = decodeProtectedHeader(requestBody.proof.jwt);
    } catch (e) {
      throw new CredentialError("invalid_or_missing_proof", {
        errorDescription: "Invalid Proof JWT header. Parsing failed.",
      });
    }

    const parsedProofHeaderParams =
      credentialRequestProofHeaderSchema.safeParse(rawProofHeaderParams);

    if (!parsedProofHeaderParams.success) {
      const errorDesc = parsedProofHeaderParams.error.issues
        .map((issue) => `'${issue.path.join(".")}': ${issue.message}`)
        .join("\n");

      throw new CredentialError("invalid_or_missing_proof", {
        errorDescription: `Invalid Proof JWT header: ${errorDesc}`,
      });
    }

    const proofHeaderParams = parsedProofHeaderParams.data;

    //Verify proof.kid starts with AT.sub (same subject)
    if (!proofHeaderParams.kid.startsWith(accessTokenPayload.sub)) {
      throw new CredentialError("invalid_or_missing_proof", {
        errorDescription:
          "Invalid Proof JWT header: kid must correspond to the DID used during the authentication",
      });
    }

    // Resolve DID Document corresponding to "kid"
    const { kid } = proofHeaderParams;
    const did = kid.split("#")[0] as string;

    const resolver = did.startsWith("did:ebsi:") ? ebsiResolver : keyResolver;

    const didDoc = await resolver.resolve(did, { timeout });

    // The kid must be a valid EBSI DID v1
    if (didDoc.didResolutionMetadata.error === "invalidDid") {
      throw new CredentialError("invalid_or_missing_proof", {
        errorDescription: "Invalid Proof JWT: kid doesn't refer to a valid DID",
      });
    }

    // DID Document must be registered
    const { didDocument } = didDoc;
    if (!didDocument) {
      throw new CredentialError("invalid_or_missing_proof", {
        errorDescription: `Invalid Proof JWT: DID ${did} not found in the DID Registry`,
      });
    }

    // Verify JWT signature
    const verificationMethods = didDocument.verificationMethod ?? [];
    const matchingVerificationMethod = verificationMethods.find(
      (method) => method.id === kid
    );

    if (!matchingVerificationMethod) {
      throw new CredentialError("invalid_or_missing_proof", {
        errorDescription: `Invalid Proof JWT: no verification method matching ${kid} found in the DID Document`,
      });
    }

    if (!matchingVerificationMethod.publicKeyJwk) {
      throw new CredentialError("invalid_or_missing_proof", {
        errorDescription: `Invalid Proof JWT: the verification method matching ${kid} doesn't have a publicKeyJwk`,
      });
    }

    const { publicKeyJwk } = matchingVerificationMethod;

    try {
      //YC jose nodejs expects secp256k1 instead of P-256K for ES256K or P-256 for ES256 
      const publicKey = await importJWK(publicKeyJwk, proofHeaderParams.alg);
      await jwtVerify(requestBody.proof.jwt, publicKey);
    } catch (e) {
      throw new CredentialError("invalid_or_missing_proof", {
        errorDescription: `Invalid Proof JWT signature: ${
          e instanceof Error ? e.message : "unknown error"
        }`,
      });
    }
  }

  return {
    credentialRequest: requestBody,
    accessTokenPayload,
  };
}

export default validatePostCredential;
