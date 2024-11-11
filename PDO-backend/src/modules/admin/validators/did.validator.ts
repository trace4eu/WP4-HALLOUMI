import { z } from "zod";

export const didSchema = z.object({
  did: z.string(),
});

export default didSchema;
