import { z } from "zod";
import { INTENTS_LIST } from "../../../shared/constants.js";

export const requestSchema = z.object({
  intent: z.enum(INTENTS_LIST),
  data: z.record(z.unknown()),
});

export default requestSchema;
