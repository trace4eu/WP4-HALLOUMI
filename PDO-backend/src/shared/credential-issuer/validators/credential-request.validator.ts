import { z } from "zod";
import {
  REQUIRED_CREDENTIAL_TYPES,
  VALID_CREDENTIAL_TYPES,
} from "../../constants.js";

/**
 * @see https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-11.html#name-credential-request
 */
export const credentialRequestSchema = z.object({
  format: z.literal("jwt_vc"),
  types: z
    .array(z.enum(VALID_CREDENTIAL_TYPES))
    // Ensures that all the REQUIRED_CREDENTIAL_TYPES are present
    .refine(
      (arr) =>
        REQUIRED_CREDENTIAL_TYPES.every((requiredType) =>
          arr.includes(requiredType)
        ),
      {
        message: `Array must include ${REQUIRED_CREDENTIAL_TYPES.join(", ")}`,
      }
    ),
  proof: z.object({
    proof_type: z.literal("jwt"),
    jwt: z.string(),
  }),
});

/**
 * @see https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-11.html#section-7.2.1
 */
export const credentialRequestProofPayloadSchema = z.object({
  iss: z.string().url(), // client_id URI
  aud: z.string().url(), // issuer mock URI
  iat: z.number(),
  nonce: z.string(),
});

/**
 * @see https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-11.html#section-7.2.1
 */
export const credentialRequestProofHeaderSchema = z.object({
  typ: z.literal("openid4vci-proof+jwt"),
  alg: z.string(),
  kid: z.string(),
});

export type CredentialRequest = z.infer<typeof credentialRequestSchema>;
