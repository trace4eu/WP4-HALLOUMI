import { z } from "zod";
import { isJWT } from "class-validator";

export const directPostIdTokenSchema = z.object({
  id_token: z.string().refine(isJWT, { message: "Must be a valid JWT" }),
  state: z.string(),
});

export type DirectPostIdToken = z.infer<typeof directPostIdTokenSchema>;
