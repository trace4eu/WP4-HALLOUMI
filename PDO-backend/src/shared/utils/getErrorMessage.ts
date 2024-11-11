import { JsonSchemaValidationError } from "@cef-ebsi/verifiable-credential";
import axios from "axios";

export function getErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return "Unknown error";

  if (axios.isAxiosError(err)) {
    const data: unknown = err.response?.data;

    if (!data) return "Unknown error";

    if (typeof data === "string") return data;

    return JSON.stringify(data);
  }

  return err.message;
}

export function getErrorDetails(err: unknown, context: string): string[] {
  if (!(err instanceof Error)) return [];

  if (err instanceof JsonSchemaValidationError) {
    return err.ajvErrors.map((ajvError) =>
      [context, ajvError.instancePath, ajvError.message]
        .filter(Boolean)
        .join(" ")
    );
  }

  return [];
}

export default getErrorMessage;
