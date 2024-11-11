import { z } from "zod";

export const accreditAuthoriseParamsSchema = z.object({
  clientId: z.string().url(),
  did: z.string(),
});

export default accreditAuthoriseParamsSchema;
