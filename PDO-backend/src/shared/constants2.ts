import type { ReadonlyDeep } from "type-fest";
import type { PresentationDefinition } from "./interfaces2.js";

export const ACCESS_TOKEN_EXP = 86400; // 24 hours

export const C_NONCE_EXP = 86400; // 24 hours

export const ID_TOKEN_EXP = 120; // 2 minutes



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

export const INPUT_DESCRIPTION_TEMP = {
  
  id: "bachelorDegree",
  constraints: {
    fields: [
      {
        path: ["$.type"],
        filter: {
          type: "array",
          contains: { const: "bachelorDegree" },
        },
      },
      {
        path: ["$.credentialSubject.achieved[0].title"],
        filter: {
          type: "string",
          pattern: "BSc",
        },
      },
    ],
  },

} as const;

// Presentation Definition in order to get a VerifiableAuthorisationForTrustChain
export const PRESENTATION_DEFINITION_TEMPLATE = {
  id: "pdopresentation",
  format: { jwt_vc: { alg: ["ES256"] }, jwt_vp: { alg: ["ES256"] } },
  input_descriptors: [],
  
} as const satisfies ReadonlyDeep<PresentationDefinition>;


