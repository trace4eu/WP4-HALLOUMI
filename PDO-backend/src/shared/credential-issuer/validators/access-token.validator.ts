import { z } from "zod";
import { authorizationDetailsSchema } from "../../validators/authorization-details.validator.js";

/**
 * Access Token Payload, as issued by Auth Mock.
 */
export const accessTokenPayloadSchema = z.object({
  iss: z.string().url(),
  aud: z.union([z.array(z.string().url()), z.string().url()]),
  sub: z.string(),
  iat: z.number(),
  exp: z.number(),
  nonce: z.string(),
  claims: z.object({
    authorization_details: authorizationDetailsSchema,
    c_nonce: z.string(),
    c_nonce_expires_in: z.number(),
     client_id: z.string(),  //YC  .url() ?? this is did
     streamid: z.string().optional(),  //YC
     accrFor: z.string().optional(),
   }),
});

export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;

export const beTokenPayloadSchema = z.object({
  iss: z.string().url(),
  aud: z.union([z.array(z.string().url()), z.string().url()]),
  
  iat: z.number(),
  exp: z.number(),
 // streamid: z.string(),
  userid: z.string(),

});

export type BeTokenPayload = z.infer<typeof beTokenPayloadSchema>;

/**
 * Access Token Header
 */
export const accessTokenHeaderSchema = z.object({
  typ: z.literal("JWT"),
  alg: z.literal("ES256"),
  kid: z.string(),
});

export type AccessTokenHeader = z.infer<typeof accessTokenHeaderSchema>;
