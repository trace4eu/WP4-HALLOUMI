import { randomUUID } from "node:crypto";
import {
  EbsiIssuer,
  EbsiVerifiablePresentation,
  createVerifiablePresentationJwt,
} from "@cef-ebsi/verifiable-presentation";
// import { Config } from "../config.js";
// import { Client } from "./Client.js";
import { Alg } from "../interfaces/index.js";
import { JWK } from "jose";

export async function createVPJwt(
  did: string,
  kid:string,
  keys: {
    publicKeyJwk: JWK;
    privateKeyJwk: JWK;
  },
  alg: Alg,
  vc: string | string[],
  audience: string,
  domain:string,
): Promise<{ jwtVp: string; payload: { [x: string]: unknown } }> {
  //const keys = client.keys[alg];
 // const keys = await getIssuerKeyPair("ES256"); 
  if (!keys) throw new Error(`No keys defined for alg ${alg}`);

  const issuer: EbsiIssuer = {
    did: did,
    kid: kid,
    privateKeyJwk: keys.privateKeyJwk,
    publicKeyJwk: keys.publicKeyJwk,
    alg: alg as "ES256K",
  };

  let verifiableCredential: string[];
  if (vc === "empty") {
    verifiableCredential = [];
  } else if (Array.isArray(vc)) {
    verifiableCredential = vc;
  } else {
    verifiableCredential = [vc];
  }

  const payload = {
    id: `urn:did:${randomUUID()}`,
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    type: ["VerifiablePresentation"],
    holder: did,
    verifiableCredential,
  } as EbsiVerifiablePresentation;

  const jwtVp = await createVerifiablePresentationJwt(
    payload,
    issuer,
    audience,
    {
      skipValidation: true,
      ebsiAuthority: domain
        .replace("http://", "")
        .replace("https://", ""),
      nonce: randomUUID(),
      nbf: Math.floor(Date.now() / 1000) - 60, // 1 minute in the past
      exp: Math.floor(Date.now() / 1000) + 120, // 2 minutes in the future
    },
  );
  return { jwtVp, payload };
}

export default createVPJwt;
