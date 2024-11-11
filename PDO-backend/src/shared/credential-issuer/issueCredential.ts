import {
  createVerifiableCredentialJwt,
  CreateVerifiableCredentialOptions,
  EbsiIssuer,
 // EbsiVerifiableAttestation,
} from "@cef-ebsi/verifiable-credential";
import type { EbsiVerifiableAttestation202401 as EbsiVerifiableAttestation } from "@cef-ebsi/verifiable-credential";
import { randomBytes, randomUUID } from "node:crypto";
import type { JWKWithKid } from "../utils/index.js";

import { BadRequestException } from "@nestjs/common";

import { IssuedVC } from "../models/issuedvcs.model.js";

export async function issueCredential(
  serverDid: string,
  issuerName:string,
  serverKid: string,
  issuerPrivateKeyJwk: JWKWithKid,
  issuerAccreditationUrl: string,
  authorisationCredentialSchema: string,
  createVerifiableCredentialOptions: CreateVerifiableCredentialOptions,
  additionalVcPayload: Partial<EbsiVerifiableAttestation>,
 
  vcdatareq: IssuedVC,
): Promise<{
  //reservedAttributeId: string;
  vcJwt: string;
}> {


  const vcdata = {legalName: vcdatareq.legalName,productName: vcdatareq.productName, allowedEvent:vcdatareq.allowedEvent,
                  lastInChain: vcdatareq.lastInChain }
  

  // Issue VC
  const { d, ...publicKeyJwk } = issuerPrivateKeyJwk;
  const vcIssuer: EbsiIssuer = {
    kid: serverKid,
    did: serverDid,
    publicKeyJwk,
    privateKeyJwk: issuerPrivateKeyJwk,
    alg: "ES256", //YC256
  };
  const issuedAt = new Date();
  const eoYear = new Date(issuedAt.getFullYear(),12,0,23,59,59);
  const issuedAtlocal = new Date(issuedAt.getTime() - issuedAt.getTimezoneOffset()*60000);
  
 const issuanceDate = `${issuedAt.toISOString().slice(0, -5)}Z`;
// const issuanceDate = issuedAtlocal.toISOString().slice(0, -5);
  const expiresAt = new Date(issuedAt.getTime() + 1000 * 60 * 60 * 24 * 365 * 1 );
  
 

 
 const expiresAtlocal =  new Date(expiresAt.getTime() - expiresAt.getTimezoneOffset()*60000);
 const expirationDate = `${expiresAt.toISOString().slice(0, -5)}Z`;
 //const expirationDate = `${expiresAtlocal.toISOString().slice(0, -5)}`;

 
  const vcPayload: EbsiVerifiableAttestation = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
  // "@context": ["https://www.w3.org/ns/credentials/v2"],
    id: `vc:cyebsi:${randomUUID()}`,
    type: [ "VerifiableCredential",
      "VerifiableAttestation",
      "LicenseToOperate"],

   // issuer: vcIssuer.did,
    issuer: {
      "id": vcIssuer.did,
     // "type": "organisation",
      "legalName": issuerName,
     // "domainName": "https://university.abc"
    },
    issuanceDate,
    issued: issuanceDate,
    validFrom: issuanceDate,
    expirationDate,
    credentialSubject: {
      
      id: vcdatareq.actorDID,
     
      ...(vcdata && vcdata)
 
    },
    credentialSchema: {
      id: authorisationCredentialSchema,
    // id:  "https://api-test.ebsi.eu/trusted-schemas-registry/v2/schemas/0x22691f9d112f4213b717a6d954c0fe4a7d2dbbb1839a31c29b48a35fda36b13f",
      type: "FullJsonSchemaValidator2021",
    },
    ...(issuerAccreditationUrl  && { //patch for issuer CT
    termsOfUse: {
      id: issuerAccreditationUrl,
      type: "IssuanceCertificate",
    }
  }),
  ...additionalVcPayload,
  };
console.log('vc to issue->'+JSON.stringify(vcPayload));
  let vcJwt='';
  try {
    vcJwt = await createVerifiableCredentialJwt(
    vcPayload,
    vcIssuer,
    createVerifiableCredentialOptions
  );
  // return { vcJwt, reservedAttributeId };
  } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
  }
  return { vcJwt  };
}

export default issueCredential;
