// import { z } from "zod";
// import { isJWT } from "class-validator";

// const basePexDescriptorSchema = z.object({
//   id: z.string(),
//   path: z.string(),
//   format: z.string(),
// });

// type Descriptor = z.infer<typeof basePexDescriptorSchema> & {
//   path_nested?: Descriptor;
// };

// const pexDescriptorSchema: z.ZodType<Descriptor> =
//   basePexDescriptorSchema.extend({
//     path_nested: z.optional(z.lazy(() => pexDescriptorSchema)),
//   });

// export const directPostVpTokenSchema = z.object({
//   vp_token: z.string().refine(isJWT, { message: "Must be a valid JWT" }),
//   presentation_submission: z.object({
//     id: z.string(),
//     definition_id: z.string(),
//     descriptor_map: z.array(pexDescriptorSchema),
//   }),
//   state: z.string(),
// });

// export type DirectPostVpToken = z.infer<typeof directPostVpTokenSchema>;
import { z } from "zod";
import { isJWT, isJSON } from "class-validator";

export const directPostVpTokenSchema = z.object({
  vp_token: z.string().refine(isJWT, { message: "Must be a valid JWT" }),
  presentation_submission: z
    .string()
    .refine(isJSON, { message: "Must be a valid stringified JSON" }),
  state: z.string(),
});

export type DirectPostVpToken = z.infer<typeof directPostVpTokenSchema>;