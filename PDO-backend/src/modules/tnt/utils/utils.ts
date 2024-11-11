import crypto from "node:crypto";
import Joi from "joi";
import elliptic from "elliptic";
import { base64url } from "multiformats/bases/base64";
import { bases } from "multiformats/basics";
import { JWK } from "jose";
//import $RefParser from "@apidevtools/json-schema-ref-parser";
import canonicalize from "canonicalize";
import { base16 } from "multiformats/bases/base16";
import { base58btc } from "multiformats/bases/base58";
import { UnknownObject } from "../interfaces/index.js";

const EC = elliptic.ec;

type SerializeInterface = (input: unknown) => string | undefined;
const serialize = canonicalize as unknown as SerializeInterface;

export function prefixWith0x(key: string): string {
  return key.startsWith("0x") ? key : `0x${key}`;
}

export function removePrefix0x(key: string): string {
  return key.startsWith("0x") ? key.slice(2) : key;
}

export function fromHexString(hexString: string): Buffer {
  return Buffer.from(removePrefix0x(hexString), "hex");
}

export function toHexString(bytes: Uint8Array): string {
  return bytes.reduce(
    (str, byte) => str + byte.toString(16).padStart(2, "0"),
    "",
  );
}

export function getPublicKeyJwk(hex: string): JWK {
  const ec = new EC("secp256k1");
  const publicKey = ec
    .keyFromPublic(Buffer.from(hex.replace("0x", ""), "hex"))
    .getPublic();
  return {
    kty: "EC",
    crv: "secp256k1",
    x: base64url.baseEncode(
      Buffer.from(publicKey.getX().toString("hex", 64), "hex"),
    ),
    y: base64url.baseEncode(
      Buffer.from(publicKey.getY().toString("hex", 64), "hex"),
    ),
  };
}


function removeAnnotations(obj: unknown): unknown {
  /**
   * Lists of annotations keywords:
   * - https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.9
   * - https://json-schema.org/draft/2019-09/json-schema-validation.html#rfc.section.9
   * - https://json-schema.org/draft-07/json-schema-validation.html#rfc.section.10
   */
  const keysToRemove = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples",
  ];

  return JSON.parse(
    JSON.stringify(obj, (key, val: unknown) =>
      keysToRemove.includes(key) ? undefined : val,
    ),
  );
}


export function multibaseEncode(
  base: "base64url" | "base58btc",
  input: Buffer | Uint8Array | string,
): string {
  const buffer = typeof input === "string" ? fromHexString(input) : input;
  return bases[base].encode(buffer).toString();
}

export function detachJwt(jwt: string): string {
  const parts = jwt.split(".");
  return `${parts[0]}..${parts[2]}`;
}

export const JoiHash = Joi.string().pattern(/^(0x)?[0-9a-fA-F]{64,64}$/);

export const JoiHexadecimal = Joi.string().pattern(/^(0x)?[0-9a-fA-F]+$/);






