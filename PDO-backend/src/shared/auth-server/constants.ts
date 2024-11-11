import type { ReadonlyDeep } from "type-fest";
import type { PresentationDefinition } from "./interfaces.js";

export const ACCESS_TOKEN_EXP = 86400; // 24 hours

export const C_NONCE_EXP = 86400; // 24 hours

export const ID_TOKEN_EXP = 120; // 2 minutes

// Presentation Definition in order to get a VerifiableAuthorisationForTrustChain
export const VA_TO_ONBOARD_PRESENTATION_DEFINITION = {
  id: "va-to-onboard-presentation",
  input_descriptors: [
    {
      id: "verifiable-authorisation-to-onboard",
      constraints: {
        fields: [
          {
            path: ["$.type"],
            filter: {
              type: "array",
              contains: { const: "VerifiableAuthorisationToOnboard" },
            },
          },
        ],
      },
    },
  ],
  format: { jwt_vc: { alg: ["ES256"] }, jwt_vp: { alg: ["ES256"] } },
} as const satisfies ReadonlyDeep<PresentationDefinition>;

export const INPUT_DESCRIPTION_TEMPLATE = {
  
    id: "input_descriptor-id",
    constraints: {
      fields: [
        {
          path: ["$.type"],
          filter: {
            type: "array",
            contains: { const: "input_descriptor_const" },
          },
        },
      ],
    },
  
} as const;

// Presentation Definition in order to get a VerifiableAuthorisationForTrustChain
export const PRESENTATION_DEFINITION_TEMPLATE = {
  id: "presentation-id",
  format: { jwt_vc: { alg: ["ES256"] }, jwt_vp: { alg: ["ES256"] } },
  input_descriptors: [],
  
} as const satisfies ReadonlyDeep<PresentationDefinition>;

// Presentation Definition in order to get a CTWalletQualificationCredential
// The requested credentials are all of:
// - CTWalletSameInTime
// - CTWalletCrossInTime
// - CTWalletSameDeferred
// - CTWalletCrossDeferred
// - CTWalletSamePreAuthorised
// - CTWalletCrossPreAuthorised.
export const HOLDER_WALLET_QUALIFICATION_PRESENTATION_DEFINITION = {
  id: "holder-wallet-qualification-presentation",
  format: { jwt_vc: { alg: ["ES256"] }, jwt_vp: { alg: ["ES256"] } },
  input_descriptors: [
    // {
    //   id: "same-device-in-time-credential",
    //   constraints: {
    //     fields: [
    //       {
    //         path: ["$.type"],
    //         filter: {
    //           type: "array",
    //           contains: { const: "CTWalletSameInTime" },
    //         },
    //       },
    //     ],
    //   },
    // },
    {
      id: "cross-device-in-time-credential",
      constraints: {
        fields: [
          {
            path: ["$.type"],
            filter: {
              type: "array",
              contains: { const: "CTWalletCrossInTime" },
            },
          },
        ],
      },
    },
    // {
    //   id: "same-device-deferred-credential",
    //   constraints: {
    //     fields: [
    //       {
    //         path: ["$.type"],
    //         filter: {
    //           type: "array",
    //           contains: { const: "CTWalletSameDeferred" },
    //         },
    //       },
    //     ],
    //   },
    // },
    {
      id: "cross-device-deferred-credential",
      constraints: {
        fields: [
          {
            path: ["$.type"],
            filter: {
              type: "array",
              contains: { const: "CTWalletCrossDeferred" },
            },
          },
        ],
      },
    },
    // {
    //   id: "same-device-pre_authorised-credential",
    //   constraints: {
    //     fields: [
    //       {
    //         path: ["$.type"],
    //         filter: {
    //           type: "array",
    //           contains: { const: "CTWalletSamePreAuthorised" },
    //         },
    //       },
    //     ],
    //   },
    // },
    // {
    //   id: "cross-device-pre_authorised-credential",
    //   constraints: {
    //     fields: [
    //       {
    //         path: ["$.type"],
    //         filter: {
    //           type: "array",
    //           contains: { const: "CTWalletCrossPreAuthorised" },
    //         },
    //       },
    //     ],
    //   },
    // },
  ],
} as const satisfies ReadonlyDeep<PresentationDefinition>;

// Presentation Definition for testing verifiers
// See https://api-conformance.ebsi.eu/docs/ct/verifier-functional-flows
export const VERIFIER_TEST_PRESENTATION_DEFINITION = {
  id: "<any id, random or static>",
  format: { jwt_vc: { alg: ["ES256"] }, jwt_vp: { alg: ["ES256"] } },
  input_descriptors: [
    {
      id: "<any id, random or static>",
      constraints: {
        fields: [
          {
            path: ["$.type"],
            filter: {
              type: "array",
              contains: { const: "VerifiableAttestation" },
            },
          },
        ],
      },
    },
    {
      id: "<any id, random or static>",
      constraints: {
        fields: [
          {
            path: ["$.type"],
            filter: {
              type: "array",
              contains: { const: "VerifiableAttestation" },
            },
          },
        ],
      },
    },
    {
      id: "<any id, random or static>",
      constraints: {
        fields: [
          {
            path: ["$.type"],
            filter: {
              type: "array",
              contains: { const: "VerifiableAttestation" },
            },
          },
        ],
      },
    },
  ],
} as const satisfies ReadonlyDeep<PresentationDefinition>;