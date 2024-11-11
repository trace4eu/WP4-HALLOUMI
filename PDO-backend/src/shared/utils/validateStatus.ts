import { AXIOS_TIMEOUT, EbsiEnvConfiguration, EbsiVerifiableAttestation20221101, EbsiVerifiableAttestation202401, getErrorMessage, mergeConfig, validateEbsiAccreditationEntry, ValidationError, VerifyCredentialOptions, verifyVcJwt } from "@cef-ebsi/verifiable-credential";
import { ConsoleLogger } from "@nestjs/common";
import axios, { AxiosResponse } from "axios";
import { Interface } from "ethers/lib/utils.js";
//import { base64 } from "ethers/lib/utils.js";
import { base64 } from "multiformats/bases/base64";
import { Inflate } from "pako";
import { IssuedVC, IssuedVCDocument } from "../models/issuedvcs.model.js";
import { Model } from "mongoose";
import { CredentialSubject } from "@cef-ebsi/vcdm1.1-attestation-schema";


async function getStatusListjwt(statusListUrl:string) {

    const [suffix3,suffix2,suffix1,proxyId] =
       statusListUrl.split('/').reverse();
    const proxyUrl = statusListUrl.substring(0,statusListUrl.indexOf(proxyId?proxyId:'na'))+proxyId;
    console.log('proxuUrl->'+proxyUrl);

    interface IproxyUrl  {
        prefix:string;
        testSuffix:string;
    }
    let statusListProxyResponse: AxiosResponse<IproxyUrl>;
    
    try {
        statusListProxyResponse = await axios.get<IproxyUrl>(
            proxyUrl,
        {
          //timeout: options.timeout ?? AXIOS_TIMEOUT,
          timeout: 16000
        },
      );
    } catch (e) {
        console.log('error1->'+e);
      throw new ValidationError(
        `Unable to fetch the proxyUrl: ${proxyUrl}. Reason: ${getErrorMessage(
          e,
        )}`,
      );
    }
  //  console.log('statusListProxyResponse->'+JSON.stringify(statusListProxyResponse.data));
    let statusListIssuerResponse: AxiosResponse<unknown>;
    let issuerUrl = `${statusListProxyResponse.data.prefix}${statusListProxyResponse.data.testSuffix}`;
    console.log('issuerUrl->'+issuerUrl);
    try {
       
        statusListIssuerResponse = await axios.get<unknown>(
            issuerUrl,
        {
          //timeout: options.timeout ?? AXIOS_TIMEOUT,
          timeout: 16000
        },
      );
    } catch (e) {
        console.log('error2->'+e);
      throw new ValidationError(
        `Unable to fetch the proxyUrl: ${issuerUrl}. Reason: ${getErrorMessage(
          e,
        )}`,
      );
    }

    
    return statusListIssuerResponse.data;

 }

async function validateStatusList2021Entry(
    credentialStatus: NonNullable<
      | EbsiVerifiableAttestation20221101["credentialStatus"]
      | EbsiVerifiableAttestation202401["credentialStatus"]
    >,
    config: EbsiEnvConfiguration,
    options: VerifyCredentialOptions,
  ) {
    if (Array.isArray(credentialStatus)) {
      throw new ValidationError(
        "The credentialStatus passed to validateStatusList2021Entry must be a single element",
      );
    }
  
    if (credentialStatus.type !== "StatusList2021Entry") {
      throw new ValidationError(
        'The credentialStatus type must be "StatusList2021Entry"',
      );
    }
  
    if (!("statusPurpose" in credentialStatus)) {
      throw new ValidationError(
        'The credentialStatus MUST contain a "statusPurpose" property',
      );
    }
  
    const { statusPurpose } = credentialStatus;
    if (statusPurpose !== "revocation" && statusPurpose !== "suspension") {
      throw new ValidationError(
        'The credentialStatus "statusPurpose" property must be either "revocation" or "suspension"',
      );
    }
  
    if (!("statusListIndex" in credentialStatus)) {
      throw new ValidationError(
        'The credentialStatus MUST contain a "statusListIndex" property',
      );
    }
  
    if (typeof credentialStatus["statusListIndex"] !== "string") {
      throw new ValidationError(
        'The credentialStatus "statusListIndex" property must be a number expressed as a string',
      );
    }
  
    const statusListIndex = parseInt(credentialStatus["statusListIndex"], 10);
    if (Number.isNaN(statusListIndex)) {
      throw new ValidationError(
        'The credentialStatus "statusListIndex" property is not a valid number expressed as a string',
      );
    }
  
    if (statusListIndex < 0) {
      throw new ValidationError(
        'The credentialStatus "statusListIndex" property must be greater or equal to 0',
      );
    }
  
    if (!("statusListCredential" in credentialStatus)) {
      throw new ValidationError(
        'The credentialStatus MUST contain a "statusListCredential" property',
      );
    }
  
    if (typeof credentialStatus["statusListCredential"] !== "string") {
      throw new ValidationError(
        'The credentialStatus "statusListCredential" property must be a string',
      );
    }
  
    const statusListCredentialUrl = credentialStatus["statusListCredential"];
    try {
      // eslint-disable-next-line no-new
      new URL(statusListCredentialUrl);
    } catch {
      // Error while parsing the URL
      throw new ValidationError(
        'The credentialStatus "statusListCredential" property must be a valid URL',
      );
    }
  
    if (!statusListCredentialUrl.startsWith(config.trustedIssuersRegistry)) {
      throw new ValidationError(
        `The credentialStatus "statusListCredential" property must be a URL from the Trusted Issuers Registry (${config.trustedIssuersRegistry})`,
      );
    }
  
    console.log("calling statusListCredentialUrl->"+statusListCredentialUrl+"<-");
    // Fetch statusListCredentialUrl, verify it is a valid StatusList2021Credential and that the statusListIndex is not revoked or suspended
    // let statusListCredentialUrlResponse: AxiosResponse<unknown>;
    // try {
    //   statusListCredentialUrlResponse = await axios.get<unknown>(
    //     statusListCredentialUrl,
    //     {
    //       //timeout: options.timeout ?? AXIOS_TIMEOUT,
    //       timeout: 16000
    //     },
    //   );
    // } catch (e) {
    //     console.log('error->'+e);
    //   throw new ValidationError(
    //     `Unable to fetch the StatusList2021Credential: ${statusListCredentialUrl}. Reason: ${getErrorMessage(
    //       e,
    //     )}`,
    //   );
    // }
  
    // Parse and validate response. It must be a valid StatusList2021Credential JWT.
   // const statusListCredentialJwt = statusListCredentialUrlResponse.data;
    const statusListCredentialJwt = await getStatusListjwt(statusListCredentialUrl);
  
    if (typeof statusListCredentialJwt !== "string") {
      throw new ValidationError(
        "The StatusList2021Credential must be a JWT string",
      );
    }
  
    let statusListCredential:
      | EbsiVerifiableAttestation20221101
      | EbsiVerifiableAttestation202401;
    try {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      statusListCredential = await verifyVcJwt(statusListCredentialJwt, config, {
        ...options,
        // the Status List Credential does not require terms of use
        validateAccreditationWithoutTermsOfUse: false,
      });
    } catch (e) {
      throw new ValidationError(
        `The StatusList2021Credential JWT is not valid: ${
          e instanceof Error ? e.message : "unknown error"
        }`,
      );
    }
  
    // Possible improvements:
    // - Check that the issuer is the same as the issuer of the VC
  
    if (!("type" in statusListCredential.credentialSubject)) {
      throw new ValidationError(
        'The StatusList2021Credential "credentialSubject" property MUST contain a "type" property',
      );
    }
  
    if (statusListCredential.credentialSubject["type"] !== "StatusList2021") {
      throw new ValidationError(
        'The StatusList2021Credential "credentialSubject.type" property MUST be "StatusList2021"',
      );
    }
  
    if (!("statusPurpose" in statusListCredential.credentialSubject)) {
      throw new ValidationError(
        'The StatusList2021Credential "credentialSubject" property MUST contain a "statusPurpose" property',
      );
    }
  
    if (
      statusListCredential.credentialSubject["statusPurpose"] !== statusPurpose
    ) {
      throw new ValidationError(
        'The StatusList2021Credential "credentialSubject.statusPurpose" property MUST match the "statusPurpose" property of the VC',
      );
    }
  
    if (!("encodedList" in statusListCredential.credentialSubject)) {
      throw new ValidationError(
        'The StatusList2021Credential "credentialSubject" property MUST contain a "encodedList" property',
      );
    }
  
    const { encodedList } = statusListCredential.credentialSubject;
    if (typeof encodedList !== "string") {
      throw new ValidationError(
        'The StatusList2021Credential "credentialSubject.encodedList" property MUST be a string',
      );
    }
  
    // The encodedList property of the credential subject MUST be the GZIP-compressed [RFC1952],
    // base-64 encoded [RFC4648] bitstring values for the associated range of verifiable credential
    // status values. The uncompressed bitstring MUST be at least 16KB in size. The bitstring MUST be
    // encoded such that the first index, with a value of zero (0), is located at the left-most bit
    // in the bitstring and the last index, with a value of one less than the length of the bitstring
    // (bitstring_length - 1), is located at the right-most bit in the bitstring.
  
    // Transform the base64 encoded string into a Uint8Array
    let decodedList: Uint8Array;
    try {
      decodedList = base64.baseDecode(encodedList);
    } catch (e) {
      throw new ValidationError(
        'The StatusList2021Credential "credentialSubject.encodedList" property MUST be a valid base64 string',
      );
    }
  
    // Inflate decodedList
    const inflator = new Inflate();
    inflator.push(decodedList);
  
    if (inflator.err) {
      throw new ValidationError(
        "The StatusList2021Credential is not a valid GZIP-compressed bitstring",
      );
    }
  
    const inflatedList = inflator.result as Uint8Array;
  
    const bytePosition = Math.floor(statusListIndex / 8);
    const bitPosition = statusListIndex % 8;
  
    const byte = inflatedList.at(bytePosition);
  
    if (byte === undefined) {
      throw new ValidationError(
        "The StatusList2021Credential encoded list doesn't contain the statusListIndex",
      );
    }
  
    // Transform number to base2 string, pad with 0 to have 8 bits, get the bit at the bitPosition
    const bit = byte.toString(2).padStart(8, "0").at(bitPosition) as string;
  
    // bit="0" -> ok, bit="1" -> revoked/suspended
    if (bit === "1") {
      throw new ValidationError(
        `The credential is ${
          statusPurpose === "revocation" ? "revoked" : "suspended"
        }`,
      );
    }
  }

export async function validateCredentialStatus(
    payload: Pick<
      EbsiVerifiableAttestation20221101 | EbsiVerifiableAttestation202401,
      "credentialStatus" | "credentialSubject"
    >,
    //config: EbsiEnvConfiguration,
    options: VerifyCredentialOptions,
  ) {

    const config = mergeConfig(
        options.ebsiAuthority,
        options.ebsiEnvConfig,
        options.trustedHostnames,
      );
    
    const { credentialStatus, credentialSubject } = payload;
  
    if (
      !credentialStatus ||
      (Array.isArray(credentialStatus) && credentialStatus.length === 0)
    ) {
      // Return without throwing an error
      console.log('vc does not contain credentialStatus');
      return;
    }
  
    const credentialStatusArray = Array.isArray(credentialStatus)
      ? credentialStatus
      : [credentialStatus];
  
    await Promise.all(
      credentialStatusArray.map(async (credStatus) => {
        if (credStatus.type === "StatusList2021Entry") {
          await validateStatusList2021Entry(credStatus, config, options);
          return;
        }
  
        if (credStatus.type === "EbsiAccreditationEntry") {
          await validateEbsiAccreditationEntry(
            credStatus,
            credentialSubject,
            config,
            options,
          );
          return;
        }
  
        throw new ValidationError(
          `The credentialStatus type ${credStatus.type} is not supported`,
        );
      }),
    );
  }

  
export async function validateCredentialStatusLocal(
  payload: EbsiVerifiableAttestation202401,
    
  //config: EbsiEnvConfiguration,
  issuedvcModel: Model<IssuedVCDocument>,
) {

  
  const { credentialSubject } = payload as EbsiVerifiableAttestation202401;

  if (Array.isArray(credentialSubject)) {
    throw new ValidationError("credentialSubject can't be an array");
  }


  const issuedvc = await issuedvcModel.findOne({actorDID: credentialSubject.id}).exec() as IssuedVC;
  if (!issuedvc) {
    throw new ValidationError("actorDID not found in db");
  }

  if (issuedvc.status == 'revoked') {
    throw new ValidationError("actorDID is revoked");
  }

}