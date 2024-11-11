import { z } from "zod";
import { authorizationDetailsSchema } from "../../validators/authorization-details.validator.js";
import { serviceWalletClientMetadataSchema } from "./service-wallet-client-metadata.validator.js";

/**
 * Authentication Request `request`JWT. Used by Service Wallet.
 * @see https://openid.net/specs/openid-connect-core-1_0.html#RequestObject
 * @see https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest
 * @see https://www.ietf.org/archive/id/draft-ietf-oauth-rar-03.html#name-authorization-data-elements
 * @see https://api-conformance.ebsi.eu/docs/specs/providers-and-wallets-metadata#service-wallet-metadata
 */
export const authenticationRequestSchema = z.object({
  iss: z.string(),
  aud: z.string(),
  scope: z.enum([
    "openid",
    "openid ver_test:id_token",
    "openid ver_test:vp_token",
  ]),
  response_type: z.literal("code"),
  client_id: z.string().url(),
  redirect_uri: z.string().url(),
  state: z.string().optional(),
  nonce: z.string().optional(),
  authorization_details: authorizationDetailsSchema,
  client_metadata: serviceWalletClientMetadataSchema,
});

export type AuthenticationRequest = z.infer<typeof authenticationRequestSchema>;
