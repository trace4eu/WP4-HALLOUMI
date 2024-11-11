import type { z } from "zod";

export function formatZodError(error: z.ZodError, pathPrefix?: string) {
  return error.issues.map(
    (issue) =>
      `Validation error. Path: '${[pathPrefix, ...issue.path]
        .filter(Boolean)
        .join(".")}'. Reason: ${issue.message}`
  );
}

export default formatZodError;
