import elliptic from "elliptic";
import { base64url, calculateJwkThumbprint } from "jose";
import { base64url as base64url2 } from "multiformats/bases/base64";
import type { JWK } from "jose";
import { removePrefix0x } from "../../modules/tnt/utils/utils.js";

export type JWKWithKid = JWK & { kid: string };

export type KeyPair = {
  privateKeyJwk: JWKWithKid;
  publicKeyJwk: JWKWithKid;
};

export async function getKeyPair(
  privateKey: string | JWK,
  alg = "ES256"
): Promise<KeyPair> {
  if (!privateKey) {
    throw new Error("You must provide a non-empty hexadecimal private key");
  }

  let jwk: JWK;
  let d: string;
  if (typeof privateKey === "string") {
    const EC = elliptic.ec;
    let ec: elliptic.ec;
    if (alg === "ES256") {
      ec = new EC("p256");
    } else if (alg === "ES256K") {
      ec = new EC("secp256k1");
    } else {
      throw new Error(`alg ${alg} not supported`);
    }

    // Get key pair from hex private key
    const keyPair = ec.keyFromPrivate(removePrefix0x(privateKey), "hex");

    // Validate key pair
    const validation = keyPair.validate();
    if (validation.result === false) {
      throw new Error(validation.reason);
    }

    // Format as JWK
    const pubPoint = keyPair.getPublic();
    jwk = {
      kty: "EC",
      crv: alg === "ES256" ? "P-256" : "secp256k1",
      alg,
      x: base64url.encode(pubPoint.getX().toBuffer("be", 32)),
      y: base64url.encode(pubPoint.getY().toBuffer("be", 32)),
    };

    d = base64url.encode(Buffer.from(removePrefix0x(privateKey), "hex"));
  } else {
    const { d: privateExponent, ...pubKeyJwk } = privateKey;
    d = privateExponent as string;
    jwk = pubKeyJwk;
  }

  const thumbprint = await calculateJwkThumbprint(jwk);

  const publicKeyJwk = {
    ...jwk,
    kid: thumbprint,
  };

  const privateKeyJwk = {
    ...publicKeyJwk,
    d,
  };

  return {
    publicKeyJwk,
    privateKeyJwk,
  };
}

export function getPublicKeyHex(jwk: JWK): string {
  const EC = elliptic.ec;

  if (jwk.crv === "secp256k1") {
    const ec = new EC("secp256k1");
    if (jwk.x && jwk.y) {
    const publicKey = ec.keyFromPublic({
      x: Buffer.from(base64url2.baseDecode(jwk.x)).toString("hex"),
      y: Buffer.from(base64url2.baseDecode(jwk.y)).toString("hex"),
    });
    return `0x${publicKey.getPublic().encode("hex", false)}`;
   } else return "0x111";
  }
  return `0x${Buffer.from(JSON.stringify(jwk)).toString("hex")}`;
}


export async function getKeyPair2(
  privateKey: string | JWK,
  alg = "ES256"
): Promise<KeyPair> {
  if (!privateKey) {
    throw new Error("You must provide a non-empty hexadecimal private key");
  }

  let jwk: JWK;
  let d: string;
  if (typeof privateKey === "string") {
    const EC = elliptic.ec;
    let ec: elliptic.ec;
    if (alg === "ES256") {
      ec = new EC("p256");
    } else if (alg === "ES256K") {
      ec = new EC("secp256k1");
    } else {
      throw new Error(`alg ${alg} not supported`);
    }

    // Get key pair from hex private key
    const keyPair = ec.keyFromPrivate(privateKey, "hex");

    // Validate key pair
    const validation = keyPair.validate();
    if (validation.result === false) {
      throw new Error(validation.reason);
    }

    // Format as JWK
    const pubPoint = keyPair.getPublic();
    jwk = {
      kty: "EC",
      crv: alg === "ES256" ? "P-256" : "secp256k1",
      alg,
      x: base64url2.baseEncode(
        Buffer.from(pubPoint.getX().toString("hex",64),"hex"),
      ),
      y: base64url2.baseEncode(
        Buffer.from(pubPoint.getX().toString("hex",64),"hex"),
      ),
      
    };

    d = base64url.encode(Buffer.from(privateKey, "hex"));
  } else {
    const { d: privateExponent, ...pubKeyJwk } = privateKey;
    d = privateExponent as string;
    jwk = pubKeyJwk;
  }

  const thumbprint = await calculateJwkThumbprint(jwk);

  const publicKeyJwk = {
    ...jwk,
    kid: thumbprint,
  };

  const privateKeyJwk = {
    ...publicKeyJwk,
    d,
  };

  return {
    publicKeyJwk,
    privateKeyJwk,
  };
}
