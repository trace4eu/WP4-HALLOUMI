import { z } from "zod";

export const presentationDefinitionVerifierSchema = z.object({
  id: z.string(),
  format: z.object({
    jwt_vc: z.object({
      alg: z.array(z.literal("ES256")),
    }),
    jwt_vp: z.object({
      alg: z.array(z.literal("ES256")),
    }),
  }),
  input_descriptors: z
    .array(
      z.object({
        id: z.string(),
        constraints: z.object({
          fields: z.array(
            z.object({
              path: z.array(z.literal("$.type")),
              filter: z.object({
                type: z.literal("array"),
                contains: z.object({
                  const: z.literal("VerifiableAuthorisationToOnboard"),
                }),
              }),
            })
          ),
        }),
      })
    )
    .length(1),
});

export default presentationDefinitionVerifierSchema;
