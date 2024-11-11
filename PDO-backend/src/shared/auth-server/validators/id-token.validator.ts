import { z } from "zod";

/**
 * ID Token Payload
 *
 * @see https://openid.net/specs/openid-connect-core-1_0.html#IDToken
 */
export const idTokenPayloadSchema = z.object({
  iss: z.string().url(),
  sub: z.string(),
  aud: z.string().url(),
  exp: z.number(),
  iat: z.number(),
  nonce: z.string(), // Required by Auth Mock
});

export type IdTokenPayload = z.infer<typeof idTokenPayloadSchema>;

/**
 * ID Token Header
 */
export const idTokenHeaderSchema = z.object({
  typ: z.literal("JWT"),
  kid: z.string(),
  alg: z.string(),
});

export type IdTokenHeader = z.infer<typeof idTokenHeaderSchema>;
