import { z } from "zod";
import {
  REQUIRED_CREDENTIAL_TYPES,
  VALID_CREDENTIAL_TYPES,
} from "../constants.js";

/**
 * @see https://www.ietf.org/archive/id/draft-ietf-oauth-rar-03.html#name-authorization-data-elements
 */
export const authorizationDetailsSchema = z
  .array(
    z.object({
      type: z.literal("openid_credential"),
      format: z.literal("jwt_vc"),
      locations: z.array(z.string().url()).nonempty().optional(),
      types: z
        .array(z.enum(VALID_CREDENTIAL_TYPES))
        // Ensures that all the REQUIRED_CREDENTIAL_TYPES are present
        .refine(
          (arr) =>
            REQUIRED_CREDENTIAL_TYPES.every((requiredType) =>
              arr.includes(requiredType)
            ),
          {
            message: `Array must include ${REQUIRED_CREDENTIAL_TYPES.join(
              ", "
            )}`,
          }
        ),
    })
  )
  .nonempty();

export type AuthorizationDetails = z.infer<typeof authorizationDetailsSchema>;
