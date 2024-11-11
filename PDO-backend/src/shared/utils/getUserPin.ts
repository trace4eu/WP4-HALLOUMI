import { createHash } from "node:crypto";

/**
 * Computes the user PIN based on the DID:
 * - Hashes the DID with SHA256
 * - Takes the last 4 bytes
 * - Maps each byte to a digit between 0 and 9
 * - Concatenates the digits
 *
 * @param did - The user DID
 * @returns The user PIN
 */
export function getUserPin(did: string) {
  return createHash("sha256")
    .update(did)
    .digest()
    .slice(-4)
    .map((byte) => byte % 10)
    .reduce((acc, digit) => `${acc}${digit}`, "");
}

export default getUserPin;
