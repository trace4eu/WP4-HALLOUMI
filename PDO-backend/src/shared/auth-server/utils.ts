import { createHash, randomUUID } from "node:crypto";
import { URLSearchParams } from "node:url";
import type { PresentationSubmission } from "@sphereon/pex-models";
import type { IPresentation, IVerifiableCredential } from "@sphereon/ssi-types";
import { Checked, PEXv2 } from "@sphereon/pex";
import { IsNotEmpty, validateSync } from "class-validator";
import type { ValidationError } from "class-validator";
import { ClassConstructor, ClassTransformer } from "class-transformer";

import {
  decodeJwt,
  decodeProtectedHeader,
  importJWK,
  JWTPayload,
  jwtVerify,
  ProtectedHeaderParameters,
  SignJWT,
} from "jose";
import type { KeyLike } from "jose";
import axios, { AxiosResponse } from "axios";
import type { Resolver } from "did-resolver";
import { validate as validateEbsiDid } from "@cef-ebsi/ebsi-did-resolver";
import { util as keyDidMethodHelpers } from "@cef-ebsi/key-did-resolver";
import {
  EbsiVerifiablePresentation,
  verifyPresentationJwt,
  VpJwtPayload,
} from "@cef-ebsi/verifiable-presentation";
import type { Level } from "level";
import isEqual from "lodash.isequal";
import defaults from "lodash.defaults";
import { base64url } from "multiformats/bases/base64";
import type { ReadonlyDeep } from "type-fest";
import type {
  AuthenticationErrorResponse,
  IdTokenRequest,
  PresentationDefinition,
  TokenResponse,
  CachedAuthRequest,
  CachedCodeResponse,
  CachedRequestJwt,
  LevelDbKeyAuth,
  LevelDbObjectAuth,
  OPMetadata,
  VpTokenRequest,
  InputDescriptor,
} from "./interfaces.js";
import {
  ACCESS_TOKEN_EXP,
  C_NONCE_EXP,
  ID_TOKEN_EXP,
  
 
} from "./constants.js";
import {
  GetAuthorizeDto,
  GetAuthorizeGenericDto,
  GetAuthorizeHolderWallerDto,
  GetAuthorizeServiceWalletDto,

  PostTokenDto,

  PostTokenPreAuthorizedCodeDto,
} from "./dto/index.js";
import {
  
  clientMetadataSchema,
  idTokenHeaderSchema,
  idTokenPayloadSchema,
 
  directPostIdTokenSchema,
} from "./validators/index.js";
import { AuthorizationDetails,authorizationDetailsSchema, jwksSchema, } from "../validators/index.js";
import { OAuth2TokenError, ClassValidatorError } from "../errors/index.js";
import { JWKWithKid} from "../utils/index.js";
import type { JsonWebKeySet } from "../interfaces.js";
import { HOLDER_WALLET_AUTHORIZATION_CODE_CREDENTIAL_TYPES } from "../constants.js";
import type { Cache } from "cache-manager";

import type { Model } from "mongoose";

import { IssuedVC, IssuedVCDocument } from "../models/issuedvcs.model.js";

/**
 * Asserts if DTO is valid.
 *
 * @param data - The DTO to validate
 * @param cls - The class constructor of the DTO
 */
export function validateDto<T extends object>(
  data: unknown,
  cls: ClassConstructor<T>
): asserts data is T {
  const dataClass = new ClassTransformer().plainToInstance(cls, data);

  const errors = validateSync(dataClass, {
    stopAtFirstError: true,
  });

  if (errors.length > 0) {
    throw new ClassValidatorError(errors[0] as ValidationError); // Return only the first error
  }
}

/**
 * Parse DTO
 *
 * @param data - The DTO to parse
 * @param cls - The class constructor of the DTO
 */
export function parseDto<T extends object>(
  data: unknown,
  cls: ClassConstructor<T>
): { success: false; error: Error } | { success: true; data: T } {
  try {
    validateDto(data, cls);
  } catch (e) {
    // Unknown error during validation
    if (!(e instanceof ClassValidatorError)) {
      return {
        success: false,
        error: new Error(e instanceof Error ? e.message : "Unknown error"),
      };
    }

    // Return first error
    const { constraints } = e.validationError;

    if (!constraints) {
      return {
        success: false,
        error: new Error("Unknown error"),
      };
    }

    const errorDescription = Object.values(constraints)[0];

    return {
      success: false,
      error: new Error(errorDescription),
    };
  }

  return { success: true, data };
}

export function formatAuthErrorResponse(
  redirectUri: string,
  state: string | undefined,
  errorTitle: AuthenticationErrorResponse["error"],
  description: string,
  err?: unknown
) {
  const sanitizedRedirectUri = redirectUri.endsWith(":")
    ? `${redirectUri}//`
    : redirectUri;
  let errorDescription = description;
  if (err && err instanceof Error && err.message)
    errorDescription += `: ${err.message}`;
  else if (err && !(err instanceof Error))
    errorDescription += `: unknown error`;
  return `${sanitizedRedirectUri}?${new URLSearchParams({
    error: errorTitle,
    error_description: errorDescription,
    ...(state && { state }),
  } satisfies AuthenticationErrorResponse).toString()}`;
}

export function getPrivateKeyJwk(
  privateJwks: JWKWithKid[],
  alg: "ES256" | "ES256K" = "ES256"
): JWKWithKid {
  const privateKeyJwk = privateJwks.find(
    (k) =>
      ((alg === "ES256" && k.kty === "EC" && k.crv === "P-256") ||
        (alg === "ES256K" && k.kty === "EC" && k.crv === "secp256k1")) &&
      !!k.d &&
      !!k.kid
  );
  if (!privateKeyJwk) {
    throw new Error(`No private ${alg} key found containing a kid`);
  }
  return privateKeyJwk;
}

export async function getPrivateJwks(
  db: Level<LevelDbKeyAuth, LevelDbObjectAuth>,
  serverDid: string
): Promise<JWKWithKid[]> {
  try {
    return (await db.get({ did: serverDid, jwks: true })) as JWKWithKid[];
  } catch (error) {
    throw new Error(`No JWKS found for ${serverDid}`);
  }
}

export function getOPMetadata(url: string): OPMetadata {
  return {
    redirect_uris: [`${url}/direct_post`],
    issuer: url,
    authorization_endpoint: `${url}/authorize`,
    legacy_authorization_endpoint: `${url}/beauth`,
    token_endpoint: `${url}/token`,
    legacy_token_endpoint: `${url}/betoken`,
    jwks_uri: `${url}/jwks`,
    scopes_supported: ["openid"],
    response_types_supported: ["vp_token", "id_token"],
    response_modes_supported: ["query"],
    grant_types_supported: ["authorization_code"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["ES256"],
    request_object_signing_alg_values_supported: ["ES256"],
    request_parameter_supported: true,
    request_uri_parameter_supported: true,
    token_endpoint_auth_methods_supported: ["private_key_jwt"],
    request_authentication_methods_supported: {
      authorization_endpoint: ["request_object"],
    },
    vp_formats_supported: {
      jwt_vp: {
        alg_values_supported: ["ES256"],
      },
      jwt_vc: {
        alg_values_supported: ["ES256"],
      },
    },
    subject_syntax_types_supported: ["did:key", "did:ebsi"],
    subject_syntax_types_discriminations: [
      "did:key:jwk_jcs-pub",
      "did:ebsi:v1",
    ],
    subject_trust_frameworks_supported: ["ebsi"],
    id_token_types_supported: [
      "subject_signed_id_token",
      "attester_signed_id_token",
    ],
  };
}

/**
 * Expose Auth Mock's public keys.
 *
 * @returns Auth Mock's JWKS
 */
export function getPublicJwks(privateJwks: JWKWithKid[]): JsonWebKeySet {
  return { keys: privateJwks.map(({ d, ...jwk }) => jwk) };
}


/**
 * Process Holder Wallet auth request.
 *
 * @returns The redirect location.
 */
export async function authorizeHolderWallet(
 // db: Level<LevelDbKeyAuth, LevelDbObjectAuth>,
  cacheManager: Cache,
 // eventGateway: EventGateway,
//  addKeyToCacheManager: (key: LevelDbKeyAuth, ttl?: number) => void,
  serverDid: string,
  serverUrl: string,
  serverKid: string,
  privateKey: Uint8Array | KeyLike,
  query: GetAuthorizeDto,
  issuerPublicKeyJwk: JWKWithKid,
  expectedIssuerState?: string,
  queryState?: string,
 // requiredVCs?: Array<string>,
 // verifierRequiredVCs?: Array<string>,
  
): Promise<string> {
  const invalidRequest = (description: string, error?: unknown) => {
    return formatAuthErrorResponse(
      query.redirect_uri,
      queryState,
      "invalid_request",
      description,
      error
    );
  };

  const serverError = (description: string, error?: unknown) => {
    return formatAuthErrorResponse(
      query.redirect_uri,
      queryState,
      "server_error",
      description,
      error
    );
  };

 

  // Validate query params (full DTO)
  try {
    validateDto(query, GetAuthorizeHolderWallerDto);
  } catch (e) {
    // Unknown error during validation
    if (!(e instanceof ClassValidatorError)) {
      return serverError("", e);
    }

    // Return first error
    const { constraints } = e.validationError;

    let errorDesc = "";
    if (constraints) {
      errorDesc = Object.values(constraints)[0] as string;
    }

    return invalidRequest(errorDesc, e);
  }

  // Default Client Metadata
  // See https://api-conformance.ebsi.eu/docs/specs/providers-and-wallets-metadata#holder-wallet-metadata
  let clientMetadata = {
    authorization_endpoint: "openid:",
    response_types_supported: ["vp_token", "id_token"],
    vp_formats_supported: {
      jwt_vp: {
        alg_values_supported: ["ES256"],
      },
      jwt_vc: {
        alg_values_supported: ["ES256"],
      },
    },
    scopes_supported: ["openid"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["ES256"],
    request_object_signing_alg_values_supported: ["ES256"],
    subject_syntax_types_supported: [
      "urn:ietf:params:oauth:jwk-thumbprint",
      "did:key:jwk_jcs-pub",
    ],
    id_token_types_supported: ["subject_signed_id_token"],
  };

  // Validate optional Client Metadata
  if (query.client_metadata) {
    let unsafeClientMetadata: unknown;
    try {
      unsafeClientMetadata = JSON.parse(query.client_metadata);
    } catch {
      return invalidRequest("invalid client_metadata: can't be parsed as JSON");
    }

    const parsedClientMetadata =
      clientMetadataSchema.safeParse(unsafeClientMetadata);

    if (!parsedClientMetadata.success) {
      const errorDesc = parsedClientMetadata.error.issues
        .map(
          (issue) =>
            `[${issue.code}] in '${issue.path.join(".")}': ${issue.message}`
        )
        .join("\n");

      return invalidRequest(`invalid client metadata: ${errorDesc}`);
    }

    // Merge parsed Client Metadata with default Client Metadata
    clientMetadata = defaults(
      parsedClientMetadata.data,
      clientMetadata
    ) as typeof clientMetadata;
  }

  let requestedTypes: string[] = [];
  let authorizationDetails: AuthorizationDetails | undefined;
  if (query.authorization_details) {
    let unsafeAuthorizationDetails: unknown;
    try {
      unsafeAuthorizationDetails = JSON.parse(query.authorization_details);
    } catch {
      return invalidRequest(
        "invalid authorization_details: can't be parsed as JSON"
      );
    }
  // Validate authorization_details
  const parsedAuthorizationDetails = authorizationDetailsSchema.safeParse(
    unsafeAuthorizationDetails
  );

  if (!parsedAuthorizationDetails.success) {
    const errorDesc = parsedAuthorizationDetails.error.issues
      .map(
        (issue) =>
          `[${issue.code}] in '${issue.path.join(".")}': ${issue.message}`
      )
      .join("\n");

    return invalidRequest(`invalid authorization_details: ${errorDesc}`);
  }

    authorizationDetails = parsedAuthorizationDetails.data;
    requestedTypes = authorizationDetails[0].types;
}

  if (
    (requestedTypes.some((type) =>
      HOLDER_WALLET_AUTHORIZATION_CODE_CREDENTIAL_TYPES.includes(type)
    ) ||
      expectedIssuerState) &&
    !query.issuer_state
  ) {
    return invalidRequest("issuer_state is required for this request");
  }

  let streamid=randomUUID() as string; //YC this will change to the value in issuer_state, if exists
  // Validate issuer_state if present
  if (query.issuer_state) {
    if (expectedIssuerState) {
      if (query.issuer_state !== expectedIssuerState) {
        return invalidRequest(
          "invalid issuer state: doesn't match the expected string"
        );
      }
    } else {
      let issuerStatePayload: JWTPayload;
      try {
        issuerStatePayload = decodeJwt(query.issuer_state);
      } catch {
        return invalidRequest("invalid issuer state: can't decode JWT");
      }
      
      if (
        !Array.isArray(issuerStatePayload["credential_types"]) 
      ) {
        return invalidRequest("invalid issuer state -no credential_types");
      }

     
      
      if (issuerStatePayload["streamid"] == undefined ) {
        return invalidRequest(
          "invalid issuer state: stream id not found in issuer state"
        );
      } else {
        streamid = issuerStatePayload["streamid"] as string;
      }

      if (!isEqual(requestedTypes, issuerStatePayload["credential_types"])) {
        return invalidRequest(
          "invalid issuer state: the requested types don't match the types offered by the Credential Issuer"
        );
      }

      // Verify signature
      try {
        const issuerPublicKey = await importJWK(
          issuerPublicKeyJwk,
          "ES256"
        );
        await jwtVerify(query.issuer_state, issuerPublicKey);
      } catch (e) {
        return invalidRequest(
          "error while verifying the signature of issuer_state",
          e
        );
      }
    }
  }

  // PKCE: require code_challenge_method and code_challenge if client_id is a NP (did:key)
  if (
    query.client_id.startsWith("did:key:") &&
    (!query.code_challenge || !query.code_challenge_method)  &&
    query.scope === "openid"
  ) {
    return invalidRequest(
      "code_challenge_method and code_challenge are required for this request"
    );
  }



  

  // Bind authentication request with state
  // @see https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest
  // `state`: RECOMMENDED. Opaque value used to maintain state between the request and the
  // callback. Typically, Cross-Site Request Forgery (CSRF, XSRF) mitigation is done by
  // cryptographically binding the value of this parameter with a browser cookie.
  const state = randomUUID();
  const nonce = randomUUID();
 // const nonce = query.nonce ? query.nonce : randomUUID();

  // Store request payload and generated nonce in cache (to be used by /direct_post)

  const storedValue: CachedAuthRequest = {
    requestPayload: {
      redirect_uri: query.redirect_uri,
      state: query.state,  //client state
      authorization_details: authorizationDetails,
      client_id: query.client_id,
      scope: query.scope,
      streamid: streamid, //YC
    },
    nonce,
    codeChallenge: query.code_challenge,
  };

  // const dbKey1 = { did: serverDid, state };
  // await db.put(dbKey1, storedValue);
  // addKeyToCacheManager(dbKey1, 120_000); // 2 minutes

  await cacheManager.set(state, storedValue, 120_000);

  // Redirect: ID Token Request
  const clientAuthorizationEndpoint =
    clientMetadata.authorization_endpoint ?? "openid:";

  // If "authorization_endpoint" is just the scheme, add "//" to make it a valid URL
  const sanitizedAuthorizationEndpoint = clientAuthorizationEndpoint.endsWith(
    ":"
  )
    ? `${clientAuthorizationEndpoint}//`
    : clientAuthorizationEndpoint;

  // For VerifiableAuthorisationForTrustChain and CTWalletQualificationCredential, return
  // a VP Token request instead of an ID Token request
  // TODO: what happens when authorization_details has more than 1 element?
 


  // Create ID Token request
  const idTokenRequest: Omit<IdTokenRequest, "request"> = {
    state,
    client_id: serverUrl,
    redirect_uri: `${serverUrl}/direct_post`,
    response_type: "id_token",
    response_mode: "direct_post",
    scope: "openid",
    nonce,
  };

  const requestJwt = await new SignJWT(idTokenRequest)
    .setProtectedHeader({
      typ: "JWT",
      alg: "ES256",
      kid: serverKid,
    })
    .setIssuer(serverUrl)
    .setAudience(query.client_id)
    .sign(privateKey);

  const location = `${sanitizedAuthorizationEndpoint}?${new URLSearchParams({
    ...idTokenRequest,
    request: requestJwt,
  } satisfies IdTokenRequest).toString()}`;

  // If the client requests a request object by reference, or if the redirect location is longer than 500 characters, use `request_uri` instead of `request`
  if (query.request_object === "reference" || location.length > 500) {
    // Store request in cache
    const requestNonce = randomUUID();  //YC streamid

    // const dbKey2 = { did: serverDid, requestNonce };
    // await db.put(dbKey2, { requestJwt });
    // addKeyToCacheManager(dbKey2); // unlimited

    await cacheManager.set(requestNonce, {requestJwt});

    // Return
    return `${sanitizedAuthorizationEndpoint}?${new URLSearchParams({
      ...idTokenRequest,
      request_uri: `${serverUrl}/request_uri/${requestNonce}`,
    } satisfies IdTokenRequest).toString()}`;
  }


  return location;
}

/**
 * Process client's auth request.
 *
 * @returns The redirect location.
 */
export async function authorize(

  cacheManager: Cache,

  serverDid: string,
  serverUrl: string,
  serverKid: string,
  privateKey: Uint8Array | KeyLike,
  query: GetAuthorizeDto,
  issuerPublicKeyJwk: JWKWithKid,
  expectedIssuerState?: string,
 
  
): Promise<string> {
  const queryState =
    "state" in query && typeof query.state === "string"
      ? query.state
      : undefined;

  console.log('client querystate->'+queryState);
  console.log('expected issuer state->'+expectedIssuerState);

  const invalidRequest = (description: string, error?: unknown) => {
    return formatAuthErrorResponse(
      query.redirect_uri,
      queryState,
      "invalid_request",
      description,
      error
    );
  };

  const serverError = (description: string, error?: unknown) => {
    return formatAuthErrorResponse(
      query.redirect_uri,
      queryState,
      "server_error",
      description,
      error
    );
  };

  const invalidScope = (description: string, error?: unknown) => {
    return formatAuthErrorResponse(
      query.redirect_uri,
      queryState,
      "invalid_scope",
      description,
      error
    );
  };

  // Validate query params (Generic DTO)
  try {
    validateDto(query, GetAuthorizeGenericDto);
  } catch (e) {
    // Unknown error during validation
    if (!(e instanceof ClassValidatorError)) {
      return serverError("", e);
    }

    // Return first error
    const { property, constraints } = e.validationError;

    let errorDesc = "";
    if (constraints) {
      errorDesc = Object.values(constraints)[0] as string;
    }

    return property === "scope"
      ? invalidScope(errorDesc, e)
      : invalidRequest(errorDesc, e);
  }

  // Holder wallet request
  if (
    "client_id" in query &&
    typeof query.client_id === "string" &&
    query.client_id.startsWith("did:key:")
  ) {
    return authorizeHolderWallet(
     // db,
      cacheManager,
  
      serverDid,
      serverUrl,
      serverKid,
      privateKey,
      query,
      issuerPublicKeyJwk,
      expectedIssuerState,
      queryState,
 
     
    );
  }

  return invalidRequest('not a holder wallet');
}




/**
 * Get Authorization Request by ID.
 */
export async function getRequestById(
 // db: Level<LevelDbKeyAuth, LevelDbObjectAuth>,
  cacheManager:Cache,
 // serverDid: string,
  requestNonce: string
): Promise<string> {
  // return (
  //   (await db.get({
  //     did: serverDid,
  //     requestNonce,
  //   })) as CachedRequestJwt
  // ).requestJwt;

  return (
    (await cacheManager.get( requestNonce)) as CachedRequestJwt
  ).requestJwt;
}

export function validatePresentationSubmissionObject(
  presentationSubmission: PresentationSubmission,
  presentationDefinition: ReadonlyDeep<PresentationDefinition>
) {
  const validationResult = PEXv2.validateSubmission(presentationSubmission);

  const checkedArray = Array.isArray(validationResult)
    ? validationResult
    : [validationResult];

  const errors = checkedArray
    .map((checked) => {
      if (checked.status === "error") {
        return checked;
      }
      return null;
    })
    .filter(Boolean);

  if (errors.length > 0) {
    throw new Error(
      `\n${errors
        .map((err) => `- [${err.tag}] ${err.message ?? "Unknown error"}`)
        .join("\n")}`
    );
  }

  /**
   * The presentation_submission object MUST contain a definition_id property.
   * The value of this property MUST be the id value of a valid Presentation Definition.
   *
   * @see https://identity.foundation/presentation-exchange/#presentation-submission
   */
  if (presentationSubmission.definition_id !== presentationDefinition.id) {
    throw new Error(
      "definition_id doesn't match the expected Presentation Definition ID for the requested scope"
    );
  }

  /**
   * Make sure every descriptor_map[x].id of the Presentation Submission
   * matches an existing input_descriptors[x].id of the Presentation Definition
   */
  presentationSubmission.descriptor_map.forEach((descriptor) => {
    const matchingDescriptor = presentationDefinition.input_descriptors.find(
      (inputDescriptor) => inputDescriptor.id === descriptor.id
    );

    if (!matchingDescriptor) {
      throw new Error(
        `The presentation definition doesn't contain any input descriptor with the ID ${descriptor.id}`
      );
    }
  });

  /**
   * Make sure every input_descriptors[x] of the Presentation Definition is
   * satisfied, i.e. there's at least 1 descriptor_map[x] with the same id.
   */
  presentationDefinition.input_descriptors.forEach((inputDescriptor) => {
    const matchingDescriptor = presentationSubmission.descriptor_map.find(
      (descriptor) => descriptor.id === inputDescriptor.id
    );

    if (!matchingDescriptor) {
      throw new Error(`Input descriptor ${inputDescriptor.id} is missing`);
    }
  });
}

/**
 * Validates that the Presentation Exchange is correct, i.e. the submitted VP and its associated
 * presentation_submission match the requirements of the given presentation_definition.
 *
 * @param pex - The PEXv2 instance
 * @param vp - The Verifiable Presentation extracted from the VP Token.
 * @param presentationDefinition - The Presentation Definition that articulates the proof requirements.
 * @param presentationSubmission - The Presentation Submission that describes the proofs submitted.
 */
export function validatePresentationExchange(
  pex: PEXv2,
  vp: EbsiVerifiablePresentation,
  presentationDefinition: ReadonlyDeep<PresentationDefinition>,
  presentationSubmission: PresentationSubmission
) {
  const errors: Checked[] = [];

  // Evaluate each descriptor_map[x] individually
  presentationSubmission.descriptor_map.forEach((descriptor) => {
    // Trim presentation definition: keep only the constraints related to descriptor.id
    // Reason: the PEX library tries to apply every constraint to every input
    const trimmedPresentationDefinition = {
      ...presentationDefinition,
      input_descriptors: presentationDefinition.input_descriptors.filter(
        (inputDescriptor) => inputDescriptor.id === descriptor.id
      ),
    } as const;

    const presentation = {
      "@context": vp["@context"],
      type: vp.type,
      holder: vp.holder,
      presentation_submission: presentationSubmission,
      verifiableCredential:
        vp.verifiableCredential as unknown as IVerifiableCredential[],
    } satisfies IPresentation;

    const result = pex.evaluatePresentation(
      trimmedPresentationDefinition as PresentationDefinition,
      presentation
    );

    if (result.errors) {
      errors.push(...result.errors);
    }
  });

  if (errors && errors.length > 0) {
    throw new Error(
      errors
        .map(
          (error) => `${error.tag} tag: ${error.message ?? "Unknown error"};`
        )
        .join()
    );
  }
}

/**
 * Process /direct_post request.
 *
 * @returns The location URI based on the Authentication Request `redirect_uri`, with `code` and `state` params.
 */


export async function directPost(
  // db: Level<LevelDbKeyAuth, LevelDbObjectAuth>,
  // addKeyToCacheManager: (key: LevelDbKeyAuth, ttl?: number) => void,
   cacheManager: Cache,
   serverDid: string,
   serverUrl: string,
   ebsiAuthority: string,
   didRegistryApiUrl: string,
   trustedIssuersRegistryApiUrl: string,
   trustedPoliciesRegistryApiUrl: string,
   pex: PEXv2,
   ebsiResolver: Resolver,
   keyResolver: Resolver,
  
   timeout: number | undefined,
   query: unknown,
  
 ): Promise<string> {
   console.log('directPostQuery->'+JSON.stringify(query));
   if (
     !query ||
     typeof query !== "object" ||
     !("state" in query) ||
     !query.state ||
     typeof query.state !== "string"
   ) {
     throw new Error("state must be a string");
   }
 
   const { state } = query;
 
   // Find corresponding authentication request (bound by "state")
   let req: CachedAuthRequest;
   try {
     // req = (await db.get({
     //   did: serverDid,
     //   state,
     // })) as CachedAuthRequest;
     req = (await cacheManager.get(state)) as CachedAuthRequest;
     if (!req) {
       throw new Error(`No Authentication Request bound to state ${state} found`);
     }
   } catch (error) {
     throw new Error(`No Authentication Request bound to state ${state} found`);
   }
 
   await cacheManager.del(state);
 
   const { nonce, requestPayload, jwks, codeChallenge } = req;
   console.log('saved authReq redirect_uri->'+requestPayload.redirect_uri);
 
   const invalidRequest = (description: string, error?: unknown) => {
     return formatAuthErrorResponse(
       requestPayload.redirect_uri,
       requestPayload.state,
       "invalid_request",
       description,
       error
     );
   };
 

    
 
   // Verify authorization
   const { authorization_details: authorizationDetails, streamid } = requestPayload;
 
 
   let did: string;
 
   // For VerifiableAuthorisationForTrustChain and CTWalletQualificationCredential, return
   // a VP Token request instead of an ID Token request
   // TODO: what happens when authorization_details has more than 1 element?

   
 
  
     // validation using id_token
     const parsedDirectPostIdToken = directPostIdTokenSchema.safeParse(query);
 
     if (!parsedDirectPostIdToken.success) {
       const error = new Error(
         parsedDirectPostIdToken.error.issues
           .map((issue) => `'${issue.path.join(".")}': ${issue.message}`)
           .join("\n")
       );
 
       return invalidRequest("invalid_request", error);
     }
 
     const { id_token: idToken } = parsedDirectPostIdToken.data;
 
     // Decode and validate ID Token
     const idTokenHeader = idTokenHeaderSchema.safeParse(
       decodeProtectedHeader(idToken)
     );
 
     if (!idTokenHeader.success) {
       const errorDesc = idTokenHeader.error.issues
         .map(
           (issue) =>
             `[${issue.code}] in '${issue.path.join(".")}': ${issue.message}`
         )
         .join("\n");
 
       return invalidRequest(`invalid ID Token header: ${errorDesc}`);
     }
 
     const idTokenPayload = idTokenPayloadSchema.safeParse(
       // We assume `decodeJwt()` won't throw since the DTO verified `IsJWT()`
       decodeJwt(idToken)
     );
 
     if (!idTokenPayload.success) {
       const errorDesc = idTokenPayload.error.issues
         .map(
           (issue) =>
             `[${issue.code}] in '${issue.path.join(".")}': ${issue.message}`
         )
         .join("\n");
 
       return invalidRequest(`invalid ID Token payload: ${errorDesc}`);
     }
 
     // Verify nonce
     if (idTokenPayload.data.nonce !== nonce) {
       return invalidRequest(
         "invalid ID Token payload: nonce doesn't match the Authentication Request nonce"
       );
     }
 
     // DID must be a valid EBSI DID v1 or Key DID
     const { kid } = idTokenHeader.data;
     did = kid.split("#")[0] as string;
 
     let resolver: Resolver;
     try {
       if (did.startsWith("did:ebsi:")) {
         const version = validateEbsiDid(did);
         if (version !== 1) {
           throw new Error(`EBSI DID version ${version} is not supported`);
         }
         resolver = ebsiResolver;
       } else if (did.startsWith("did:key:")) {
         keyDidMethodHelpers.validateDid(did);
         resolver = keyResolver;
       } else {
         throw new Error("the DID is not a valid EBSI DID v1 or Key DID");
       }
     } catch (err) {
       return invalidRequest("invalid ID Token", err);
     }
 
     // Verify that iss = sub = did (from kid)
     if (idTokenPayload.data.iss !== did) {
       return invalidRequest(
         "invalid ID Token payload: iss doesn't match the DID from the kid"
       );
     }
 
     if (idTokenPayload.data.sub !== did) {
       return invalidRequest(
         "invalid ID Token payload: sub doesn't match the DID from the kid"
       );
     }
 
     // Get DID document
     const didDoc = await resolver.resolve(did, { timeout });
 
     // The kid must be a valid EBSI DID v1
     if (didDoc.didResolutionMetadata.error === "invalidDid") {
       return invalidRequest(
         "invalid ID Token: kid doesn't refer to a valid DID"
       );
     }
 
     const types  = authorizationDetails?.[0].types ?? [];
 
     // Edge case: VerifiableAuthorisationToOnboard. The DID document must not be registered.
     if (types.includes("VerifiableAuthorisationToOnboard")) {
       // Do not check the ID Token signature
       if (didDoc.didDocument) {
         return invalidRequest(
           `invalid ID Token: DID ${did} is already registered in the DID Registry`
         );
       }
     } else {
       const { didDocument } = didDoc;
       // DID document must be registered
       if (!didDocument) {
         return invalidRequest(
           `invalid ID Token: DID ${did} not found in the DID Registry`
         );
       }
 
       // Verify ID Token signature: signed by DID document's authentication key
       const verificationMethods = (didDocument.authentication ?? [])
         .map((authMethod) => {
           if (typeof authMethod !== "string") {
             return authMethod;
           }
 
           // Find verification method corresponding to authMethod
           return didDocument.verificationMethod?.find(
             (method) => method.id === authMethod
           );
         })
         // Remove undefined
         .filter(Boolean);
 
       const matchingVerificationMethod = verificationMethods.find(
         (method) => method.id === kid
       );
 
       if (!matchingVerificationMethod) {
         return invalidRequest(
           `invalid ID Token: no authentication method matching ${kid} found in the DID document`
         );
       }
 
       if (!matchingVerificationMethod.publicKeyJwk) {
         return invalidRequest(
           `invalid ID Token: the authentication method matching ${kid} doesn't have a publicKeyJwk`
         );
       }
 
       const { publicKeyJwk } = matchingVerificationMethod;
 
       // id_token_signing_alg_values_supported -> only ES256 is supported
       if (publicKeyJwk.kty !== "EC" || publicKeyJwk.crv !== "P-256") {
         return invalidRequest(
           "invalid ID Token signature: only ES256 is supported"
         );
       }
 
       try {
         const publicKey = await importJWK(publicKeyJwk, "ES256");
         await jwtVerify(idToken, publicKey);
       } catch (e) {
         return invalidRequest("invalid ID Token signature", e);
       }
     }
   
 
   // Success - https://openid.net/specs/openid-connect-basic-1_0.html#CodeOK
   const code = randomUUID();
 
   const storedValue: CachedCodeResponse = {
     clientId: requestPayload.client_id,
     did,
     authorizationDetails,
     jwks,
     codeChallenge,
  
   };
 
   // const dbKey2 = { did: serverDid, code };
   // await db.put(dbKey2, storedValue);
   // addKeyToCacheManager(dbKey2, 120_000); // 2 minutes
 
   await cacheManager.set(code, storedValue, 120_000);
 
  
   
   
 
   let location; //YC
   
  if (requestPayload.redirect_uri.endsWith("//"))
       location = `${requestPayload.redirect_uri}?${new URLSearchParams({
       code,
       ...(requestPayload.state && { state: requestPayload.state }),
       
       }).toString()}`;
     else 
       location = `${requestPayload.redirect_uri}?${new URLSearchParams({
       code,
       ...(requestPayload.state && { state: requestPayload.state }),
     
       }).toString()}`;
   
   console.log('directPost resp->'+location);
   return location;
 }
 

/**
 * Process /token request when `grant_type` is "authorization_code"
 */

/**
 * Process /token request when `grant_type` is "urn:ietf:params:oauth:grant-type:pre-authorized_code"
 */
async function preAuthorizedCodeToken(
  serverUrl: string,
  serverKid: string,
  privateKey: Uint8Array | KeyLike,
  
  unsafeQuery: PostTokenDto,
  issuedVCModel: Model<IssuedVCDocument>,
  timeout?: number
): Promise<TokenResponse> {
  // Validate query params (partial DTO)
  console.log("processing pre-authcode token request");
  const parsedQuery = parseDto(unsafeQuery, PostTokenPreAuthorizedCodeDto);

  if (!parsedQuery.success) {
    throw new OAuth2TokenError("invalid_request", {
      errorDescription: parsedQuery.error.message,
    });
  }

  const query = parsedQuery.data;

  const { "pre-authorized_code": preAuthorizedCode, user_pin: userPin } = query;

  // Validate that preAuthorizedCode has been issued by this Issuer module
  const preAuthorizedCodePayload = decodeJwt(preAuthorizedCode); // Assume pre-authorized_code is a JWT (validated by DTO)
  if (typeof preAuthorizedCodePayload["client_id"] !== "string") {
    throw new OAuth2TokenError("invalid_request", {
      errorDescription: "invalid pre-authorised code: client_id is missing",
    });
  }

  // Validate authorization_details
  if (!preAuthorizedCodePayload["authorization_details"]) {
    throw new OAuth2TokenError("invalid_request", {
      errorDescription:
        "invalid pre-authorised code: authorization_details is missing",
    });
  }

  const parsedAuthorizationDetails = authorizationDetailsSchema.safeParse(
    preAuthorizedCodePayload["authorization_details"]
  );

  if (!parsedAuthorizationDetails.success) {
    throw new OAuth2TokenError("invalid_request", {
      errorDescription:
        "invalid pre-authorised code: invalid authorization_details",
    });
  }


  const preAuthorizedCodeHeader = decodeProtectedHeader(preAuthorizedCode);
  if (typeof preAuthorizedCodeHeader.kid !== "string") {
    throw new OAuth2TokenError("invalid_request", {
      errorDescription: "invalid pre-authorised code: kid is missing",
    });
  }

  // Verify signature
  try {
    // const issuerPublicKey = await importJWK(
    //   issuerPublicKeyJwk,
    //   "ES256"
    // Get server JWKS
    let response: AxiosResponse<unknown>;
    const jwksUri = `${preAuthorizedCodePayload.iss}/jwks`;
    try {
      response = await axios.get(jwksUri, {
        timeout,
      });
    } catch (err) {
      throw new Error(`couldn't fetch JWKS from URL: ${jwksUri}`);
    }

    const parsedServerJwks = jwksSchema.safeParse(response.data);

    if (!parsedServerJwks.success) {
      throw new Error(
        `${preAuthorizedCodePayload.iss} doesn't return a valid JWKS`
      );
    }

    const serverJwks = parsedServerJwks.data;

    const serverPrivateKeyJwk = serverJwks.keys.find(
      (key) => key.kid === preAuthorizedCodeHeader.kid
    );

    if (!serverPrivateKeyJwk) {
      throw new Error(`no keys found for kid ${preAuthorizedCodeHeader.kid}`);
    }

    const issuerPublicKey = await importJWK(serverPrivateKeyJwk, "ES256");

    await jwtVerify(preAuthorizedCode, issuerPublicKey);
  } catch (e) {
    throw new OAuth2TokenError("invalid_request", {
      errorDescription: `error while verifying the signature of pre-authorized_code: ${
        e instanceof Error ? e.message : "invalid signature"
      }`,
    });
  }

  // Validate PIN
  console.log('submitted pin->'+userPin);
  const clientId = preAuthorizedCodePayload["client_id"];
  const issuedvc = await issuedVCModel.findOne({authpin:userPin, actorDID:clientId}).exec() as IssuedVC;
  if (!issuedvc) {
    throw new OAuth2TokenError("invalid_request", {
      errorDescription: "Invalid or expired PIN or wrong wallet DID",
    });
  }


  
  const authorizationDetails = parsedAuthorizationDetails.data;

  const cNonce = randomUUID();
  const now = Math.floor(Date.now() / 1000);
  const accessToken = await new SignJWT({
    nonce: randomUUID(),
    claims: {
      authorization_details: authorizationDetails,
      c_nonce: cNonce,
      c_nonce_expires_in: C_NONCE_EXP,
      client_id: clientId,
     
    },
  })
    .setProtectedHeader({
      typ: "JWT",
      alg: "ES256",
      kid: serverKid,
    })
    .setIssuer(serverUrl)
    .setAudience(authorizationDetails[0].locations ?? serverUrl)
    .setSubject(clientId)
    .setIssuedAt(now)
    .setExpirationTime(now + ACCESS_TOKEN_EXP)
    .sign(privateKey);

  const idToken = await new SignJWT({
    nonce: randomUUID(),
  })
    .setProtectedHeader({
      typ: "JWT",
      alg: "ES256",
      kid: serverKid,
    })
    .setIssuer(serverUrl)
    .setSubject(clientId)
    .setAudience(clientId)
    .setIssuedAt(now)
    .setExpirationTime(now + ID_TOKEN_EXP)
    .sign(privateKey);

    await issuedVCModel.findByIdAndUpdate(issuedvc._id, {access_token: accessToken}).exec();

  return {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: ACCESS_TOKEN_EXP,
    id_token: idToken,
    c_nonce: cNonce,
    c_nonce_expires_in: C_NONCE_EXP,
  };
}

/**
 * Process /token request.
 * Access Token is delivered as a response payload from a successful Token Endpoint initiation.
 * `c_nonce` (Challenge Nonce) must be stored until a new one is given.
 *
 * @see https://www.rfc-editor.org/rfc/rfc6749#section-4.1.4
 */
export async function token(
 
  cacheManager: Cache,
  serverDid: string,
  serverUrl: string,
  serverKid: string,
  privateKey: Uint8Array | KeyLike,
  unsafeQuery: unknown,
  //receivedVCModel: Model<ReceivedVCDocument>,
  issuedVCModel: Model<IssuedVCDocument>,
  timeout?: number,
  
 // requiredLogin? :boolean,
): Promise<TokenResponse> {
  // Validate query params (partial DTO)
  const parsedQuery = parseDto(unsafeQuery, PostTokenDto);

  if (!parsedQuery.success) {
    throw new OAuth2TokenError("invalid_request", {
      errorDescription: parsedQuery.error.message,
    });
  }

  const query = parsedQuery.data;

  if (query.grant_type === "authorization_code") {
   

    throw new OAuth2TokenError("invalid_request", {
      errorDescription: "authorization_code not supported",
    });
    
  }

  return preAuthorizedCodeToken(
    serverUrl,
    serverKid,
    privateKey,
    query,
    issuedVCModel,
    timeout
  );
}
