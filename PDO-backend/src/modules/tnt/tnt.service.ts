
import type { IPresentation, IVerifiableCredential } from "@sphereon/ssi-types";
import { decodeJWT } from "did-jwt";
import Multihash from "multihashes";
import { ethers } from "ethers";
import {
  //CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { ReadonlyDeep } from "type-fest";


import {
  base64url,
  decodeJwt,
  decodeProtectedHeader,
  importJWK,
  SignJWT,
  
} from "jose";
import type { JWK, JWTPayload, ProtectedHeaderParameters } from "jose";
import { Resolver } from "did-resolver";
import { getResolver as getEbsiDidResolver } from "@cef-ebsi/ebsi-did-resolver";
import { getResolver as getKeyDidResolver,util, } from "@cef-ebsi/key-did-resolver";
import {
  
  ValidationError,
  verifyCredentialJwt,
} from "@cef-ebsi/verifiable-credential";
import type {
  EbsiEnvConfiguration,
  EbsiIssuer,
  EbsiVerifiableAttestation,
  EbsiVerifiableAttestation20221101,
  EbsiVerifiableAttestation202401,
  VcJwtPayload,
  VerifyCredentialOptions,
} from "@cef-ebsi/verifiable-credential";
//import { Level } from "level";
import { NotFoundError, InternalServerError, BadRequestError } from "@cef-ebsi/problem-details-errors";

import { z } from "zod";

import type { ApiConfig } from "../../config/configuration.js";
import type {
 
  CredentialOffer,
  CredentialOfferPayload,
  CredentialResponse,
  DeferredCredentialResponse,
  VerifyResponse,
} from "./tnt.interface.js";


import {
  formatZodError,
  getErrorDetails,
  getErrorMessage,
  validateCredentialStatus,
  validateCredentialStatusLocal,
 

} from "../../shared/utils/index.js";

import { EBSIAuthorisationService } from "../ebsi/authorisation.service.js";
import { DataStoreService } from "../data-store/data-store.service.js";
import { LogsService } from "../logs/logs.service.js";


import type {
  CheckResult,
 
  CredentialIssuerMetadata,

  JsonWebKeySet,

  KnownIssuersMetadata,
} from "../../shared/interfaces.js";




import { InjectModel } from "@nestjs/mongoose";

import { IssuedVC, IssuedVCDocument } from "../../shared/models/issuedvcs.model.js";
import type { Model } from "mongoose";
import { EbsiVerifiablePresentation, VerifyPresentationJwtOptions, VpJwtPayload, verifyPresentationJwt } from "@cef-ebsi/verifiable-presentation";
//import type { EbsiVerifiableAttestation } from "@cef-ebsi/verifiable-credential";
import type { AuthenticationErrorResponse, PresentationDefinition } from "../../shared/interfaces2.js";
import { PRESENTATION_DEFINITION_TEMPLATE } from "../../shared/constants2.js";
import type { PresentationSubmission } from "@sphereon/pex-models";
import { Checked, PEXv2 } from "@sphereon/pex";
import { directPostVpTokenSchema } from "./validators/direct-post-vp-token.validator.js";
import presentationSubmissionSchema from "./validators/presentation-submission.validator.js";
import type { Cache } from "cache-manager";
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import getLicenseDto from "./dto/getlicense.dto.js";
import { credential_offer } from "./tnt.constants.js";
import { getKeyPair, KeyPair } from "../../shared/utils/getKeyPair.js";
import validatePostCredential from "../../shared/credential-issuer/validatePostCredential.js";
import { RevList, RevListDocument } from "../../shared/models/revList.model.js";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import issueCredential from "../../shared/credential-issuer/issueCredential.js";
import NewBatchDto from "./dto/newbatch.dto.js";
import { Product, ProductDocument } from "../../shared/models/products.model.js";
import axios, { AxiosResponse } from "axios";
import { logAxiosRequestError, signAndSendTransaction, waitToBeMined } from "../../shared/credential-issuer/utils.js";
import { Alg, BatchAll, CompletedBatch, CompletedTask, PaginatedList, PDOdocument, PDOEvent, PendingBatch, PendingBatchAll, PendingTask, RequiredEvent, TnTDocument, TnTEvent, UnknownObject, UnsignedTransaction } from "./interfaces/index.js";
import { multibaseEncode, removePrefix0x } from "./utils/utils.js";
import createVPJwt from "./utils/verifiablePresentation.js";
import Client from "./utils/Client.js";
import crypto from "node:crypto";
import UpdateBatchDto from "./dto/updatebatch.dto.js";
import TnTqueryDto from "./dto/tntquery.dto.js";
import TnTdocumentDto from "./dto/tntdocument.dto.js";

type EbsiVerifiableAttestations = EbsiVerifiableAttestation20221101 | EbsiVerifiableAttestation202401;




@Injectable()
export class TntService /*implements OnModuleInit, OnModuleDestroy*/ {

  private readonly logger = new Logger(TntService.name);
 

  private readonly authUri: string;
  private readonly  StatusListID: string;
  private readonly IsVCRevokable: Boolean;
  private readonly issuerUri: string;
  private readonly serverUrl: string;

  private readonly backEndUrl: string;
   frontEndURL: string;

  LoginRequired: boolean;
  LoginRequiredOpenID: boolean;
  IdentificationRequired: boolean;
  WalletUrl: string;
  //private readonly IssuerUrl: string;
  SupportedVC: string;
  vcins_mode: string;
  //private readonly RequiredVCs: Array<string>;

  /**
   * Auth  ES256 private key (hex)
   */
  private readonly authPrivateKeyHex: string;


  /**
   * Issuer  ES256 private key (hex)
   */
  private readonly issuerPrivateKeyHex: string;


  private issuerKeyPair: Record<"ES256" | "ES256K", KeyPair | undefined>;

  /**
   * Issuer  DID (as registered in the DIDR and TIR)
   */
  private readonly issuerDid: string;

  /**
   * Issuer  kid (must refer to a verification method in the DID Document)
   */
  private readonly issuerKid: string;

  /**
   * Issuer  accreditation (URL of the attribute in TIR v4)
   */
  private readonly issuerAccreditationUrl: string;

   /**
   * Issuer  proxy URL
   */
   private readonly issuerProxyUrl: string;

  /**
   * EBSI DID v1 Resolver
   */
  private readonly ebsiResolver: Resolver;

  /**
   * Key DID v1 Resolver
   */
  private readonly keyResolver: Resolver;

  /**
   * Request timeout
   */
  private readonly timeout: number;

  /**
   * EBSI Authority
   */
  private readonly ebsiAuthority: string;

  /**
   * EBSI VA schema URI
   */
  private readonly authorisationCredentialSchema: string;

  /**
   * PDA1 schema URI
   */
  private readonly pda1CredentialSchema: string;

  /**
   * Status List 2021 schema UIR
   */
  private readonly statusList2021CredentialSchemaUrl: string;

  /**
   * DIDR API /identifiers endpoint
   */
  private readonly didRegistryApiUrl: string;

  /**
   * DIDR API /jsonrpc endpoint
   */
  private readonly didRegistryApiJsonrpcUrl: string;

  /**
   * TIR API /issuers endpoint
   */
  private readonly trustedIssuersRegistryApiUrl: string;


  private readonly authorisationApiUrl: string;

  /**
   * TIR API /jsonrpc endpoint
   */
  private readonly trustedIssuersRegistryApiJsonrpcUrl: string;

  /**
   * TPR API /users endpoint
   */
  private readonly trustedPoliciesRegistryApiUrl: string;

  /**
   * Ledger API /besu endpoint
   */
  private readonly ledgerApiUrl: string;

  /**
   * Issuer 's authorization_endpoint when acting as a client
   */
  private clientAuthorizationEndpoint: string;
  
  private readonly pex: PEXv2;

  private authKeyPair?: KeyPair;

  constructor(
    configService: ConfigService<ApiConfig, true>,
   
   
    
    @InjectModel(IssuedVC.name) private IssuedVCModel: Model<IssuedVCDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel(RevList.name) private RevListModel: Model<RevListDocument>,
    @InjectModel(Product.name) private ProductModel: Model<ProductDocument>,
   

  ) {

    this.pex = new PEXv2();
    
    //this.ebsiEnvConfig = configService.get("ebsiEnvConfig", { infer: true });
    this.IdentificationRequired = configService.get<boolean>("identificationRequired");
    this.LoginRequired = configService.get<boolean>("loginRequired");
    this.LoginRequiredOpenID = configService.get<boolean>("loginRequiredOpenID");
    this.WalletUrl = configService.get<string>("walletUrl");
    this.SupportedVC = configService.get<string>("supportedVC");
    this.IsVCRevokable = configService.get<boolean>("isVCRevokable");
    this.StatusListID = configService.get<string>("statusListId");
 
    this.frontEndURL = configService.get<string>("frontEndUrl");
    this.vcins_mode = configService.get<string>("vcins_mode");
    this.backEndUrl = configService.get<string>("backEndUrl");
    const apiUrlPrefix = configService.get<string>("apiUrlPrefix");
    this.authUri = `${this.backEndUrl}${apiUrlPrefix}/auth`;
    this.issuerUri = `${this.backEndUrl}${apiUrlPrefix}/tnt`;
    this.serverUrl = `${this.backEndUrl}${apiUrlPrefix}/tnt`;
    this.authPrivateKeyHex =
      configService.get<string>("authPrivateKey");
    this.issuerPrivateKeyHex = configService.get<string>(
      "issuerPrivateKey"
    );
    this.issuerKid = configService.get<string>("issuerKid");
    [this.issuerDid] = this.issuerKid.split("#") as [string];
    this.issuerAccreditationUrl = configService.get<string>(
      "issuerAccreditationUrl"
    );
    this.issuerProxyUrl = configService.get<string>("issuerProxyUrl");
    this.didRegistryApiUrl = configService.get<string>("didRegistryApiUrl");
    this.didRegistryApiJsonrpcUrl = configService.get<string>(
      "didRegistryApiJsonrpcUrl"
    );
    this.trustedIssuersRegistryApiUrl = configService.get<string>(
      "trustedIssuersRegistryApiUrl"
    );

    this.authorisationApiUrl = configService.get<string>(
      "authorisationApiUrl"
    );
    this.trustedIssuersRegistryApiJsonrpcUrl = configService.get<string>(
      "trustedIssuersRegistryApiJsonrpcUrl"
    );
    this.trustedPoliciesRegistryApiUrl = configService.get<string>(
      "trustedPoliciesRegistryApiUrl"
    );
    this.ledgerApiUrl = configService.get<string>("ledgerApiUrl");
    this.ebsiResolver = new Resolver(
      getEbsiDidResolver({ registry: this.didRegistryApiUrl })
    );
    this.keyResolver = new Resolver(getKeyDidResolver());
    this.timeout = configService.get<number>("requestTimeout");
    this.ebsiAuthority = configService
      .get<string>("domain")
      .replace(/^https?:\/\//, ""); // remove http protocol scheme
    this.authorisationCredentialSchema = configService.get<string>(
      "authorisationCredentialSchema"
    );
    this.pda1CredentialSchema = configService.get<string>(
      "pda1CredentialSchema"
    );
    this.statusList2021CredentialSchemaUrl = configService.get<string>(
      "statusList2021CredentialSchemaUrl"
    );
    this.clientAuthorizationEndpoint = "openid:";

    this.issuerKeyPair = {
      ES256: undefined,
      ES256K: undefined,
    };


  }

   /**
   * Load Auth 's key pair from environment.
   *
   * @returns The private and public key JWKs (including "kid")
   */
   async getAuthKeyPair() {
    if (!this.authKeyPair) {
      this.authKeyPair = await getKeyPair(this.authPrivateKeyHex);
    }

    return this.authKeyPair;
  }

  async  getIssuerKeyPair(alg: "ES256" | "ES256K"): Promise<KeyPair> {
    let keyPair = this.issuerKeyPair[alg];
    if (keyPair === undefined) {
      keyPair = await getKeyPair(this.issuerPrivateKeyHex, alg);
      this.issuerKeyPair[alg] = keyPair;
    }
    //YC remove this
   // console.log(`issuer key pair->${JSON.stringify(keyPair)}`);
    console.log(`issuer key pair->`);
    return keyPair;
  }

  async getJwks(): Promise<JsonWebKeySet> {
    const { publicKeyJwk } = await this.getIssuerKeyPair("ES256");

    // Return JWKS
    return {
      keys: [publicKeyJwk],
    };
  }


  async get_license_vc( getLicense: getLicenseDto ){

    let walletDID;

    if (!getLicense.walletDID) {
      this.logger.error('walletDID must be set for PRE-AUTH');
      throw new BadRequestError(
       'walletDID must be set for PRE-AUTH'
      );
     }
     walletDID = getLicense.walletDID;
  

   

    let credentialoffer = JSON.parse(JSON.stringify(credential_offer)) as CredentialOfferPayload;

    credentialoffer.credential_issuer = this.issuerUri;

    if (credentialoffer.credentials[0]) {
       credentialoffer.credentials[0].types.push(this.SupportedVC);
     }

    const keyPair = await this.getIssuerKeyPair("ES256");
    const signingKey = await importJWK(keyPair.privateKeyJwk, "ES256");

    const preAuthorizedCode = await new SignJWT({
      client_id: walletDID,
      authorization_details: [
        {
          type: "openid_credential",
          format: "jwt_vc",
          locations: [this.issuerUri],
          types: [
            "VerifiableCredential",
            "VerifiableAttestation",
            this.SupportedVC,
          ],
        },
      ],
    })
      .setProtectedHeader({
        typ: "JWT",
        alg: "ES256",
        kid: keyPair.publicKeyJwk.kid,
      })
      .setIssuedAt()
      .setExpirationTime("24h")
      .setIssuer(this.issuerUri)
      .setAudience(this.authUri)
      .setSubject(walletDID)
      .sign(signingKey);

    credentialoffer.grants=
     {
      "urn:ietf:params:oauth:grant-type:pre-authorized_code": {
        "pre-authorized_code": preAuthorizedCode,
        user_pin_required: true,
      },
    };

    const credentialOfferEndpoint = 'openid-credential-offer://'; 

 

    const location = `${credentialOfferEndpoint}?${new URLSearchParams({
      credential_offer: JSON.stringify(credentialoffer),
    } satisfies CredentialOffer).toString()}`;

    console.log('offer ->'+location);
   
    return location;

  }

  async postCredential(
    authorizationHeader: string,
    rawRequestBody: unknown
  ): Promise<CredentialResponse | DeferredCredentialResponse> {
   
    const { credentialRequest, accessTokenPayload } =
      await validatePostCredential(
       // this.db as LevelIssuer,
        this.cacheManager,
        this.issuerDid,
        this.issuerUri,
        (
          await this.getAuthKeyPair()
        ).publicKeyJwk,
        this.ebsiResolver,
        this.keyResolver,
        this.timeout,
        authorizationHeader,
        rawRequestBody
      );

      console.log('proof verified ok');

   

    // Store c_nonce to prevent replay attacks
    
    const now = Math.floor(Date.now() / 1000);
  

    await this.cacheManager.set(accessTokenPayload.claims.c_nonce, 
      { nonce: accessTokenPayload.claims.c_nonce },
      accessTokenPayload.exp - now);

   const accessToken = authorizationHeader.replace("Bearer ", "");
   const issuedvc = await this.IssuedVCModel.findOne({access_token: accessToken }).exec();
   if (issuedvc) {
    await this.IssuedVCModel.findByIdAndUpdate(issuedvc._id, {downloaded: true}).exec();
    return {
      format: "jwt_vc",
      credential: issuedvc.vcjwt,
     }
    } else  {
        throw new BadRequestError(
          'could not find issued vc'
         );
     }
  }

  
  async products(productName:string|undefined): Promise<object> {

  

    const data = await this.ProductModel.find({productName: productName ? productName : {$exists: true}}).exec();
    if (!data || data.length == 0) {
      return [];
    }
 
   

      if (productName)
      {
     
     
        return {
          requiredEvents: data[0]?.requiredEvents,
          lastInChainEvent: data[0]?.lastInChainEvent,
          eventsDetails: data[0]?.eventsDetails
        };
      } else {
        const result2:string[] = [];
         data.map((element: Product)=> {
        
          result2.push(
                  //   shared_id: element._id,
                      element.productName
                  
                    )
                  
        
      });
      return result2;
      }
 
    
  }

  async init_new_batch(    
    newBatchBody: NewBatchDto
  ): Promise<CheckResult> {

    const {productName:productN, batchId, vp_token,requiredActions, presentation_submission} = newBatchBody;
    console.log('new batch->'+JSON.stringify(newBatchBody));

    const documentHash = this.getDocHash(productN,batchId);
    const {pdodocument} = await this.getDocument(documentHash);
    if (pdodocument) {
      return {
        success: false,
        errors: ['batch document already exists']
      }
    }

    let licenseVp;
     // check licensevp
     try {
      licenseVp= await this.validateLicenseVP(vp_token, presentation_submission, this.pex)
     } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestError(BadRequestError.defaultTitle, {
           detail: error.message,
        });
      }
      throw error;
     }

    // console.log('licenseVP->'+licenseVp);

     if ( typeof licenseVp === 'string') {
      return {
        success:false,
        errors: [licenseVp]
      }

     }

    //console.log('licenseVP->'+JSON.stringify(licenseVp));

    const {productName:productLic, legalName, allowedEvent, lastInChain,vcJwt,actordid } = licenseVp;
    if (productLic!== productN) {
      return {
        success:false,
        errors: ['product in License VC does not match product in request']
      }
    }

    if (!lastInChain) {
      return {
        success:false,
        errors: ['init_batch only allowed by last in chain actor']
      }
    }



    //check product name is valid

    const product = await this.ProductModel.findOne({productName: productN}).exec() as Product;

   
    if (!product) {
      return {
        success: false,
        errors:['product does not exist']
      }
    }

    const {productName, requiredEvents, lastInChainEvent} = product;

    if (lastInChainEvent !== allowedEvent) {
      return {
        success:false,
        errors: ['allowedEvent for Actor does not match lastInChainEvent for the product']
      }
    }

    //check all required actions have been added

    const missingActions: string | string[] = [];
    requiredEvents.map((event) => {

      if (!(requiredActions.some(action=> action.type == event )) ) {
       if (event != lastInChainEvent)
       missingActions.push(event);
      }
    })

    console.log('missingActions->'+ missingActions);
    if (missingActions.length > 0) {
      return {
        success: false,
        errors: ['following actions are missing: '+missingActions]
      }
    }

    //check for duplicate required actions

    const totelDuplicates = requiredActions.filter( (item, index) =>
      requiredActions.some( (elem,idx) =>
       (elem.type === item.type && idx!==index)

      )

    ).length

    if (totelDuplicates > 0) {
      return {
        success:false,
        errors: ['duplicate required Events not allowed']
      }
    }

    //check for valid and active actors DID in requested actions

    let response: AxiosResponse<unknown>;
    try {
      response = await axios.get(
        `${this.serverUrl}/active_actors?productName=${productName}`,
        { timeout:8000 }
      );
    } catch (err) {
    
  
      return {
        success: false,
        errors: [
          `Couldn't load available actors: ${getErrorMessage(
            err
          )}`,
        ],
      };
    }

    console.log(response.data);

    type ActorType = {actorDID: string; legalName:string;allowedEvent:string}

    const availActors = response.data as ActorType[];
    if (availActors.length == 0) {
      return {
        success: false,
        errors: [`no valid Actors found in DB for product ${productName}`]
      }
    }
    const invalidActors: string | string[] = [];
    requiredActions.map((action) => {
      if (!(availActors.some(actor => actor.actorDID == action.from && actor.allowedEvent == action.type ))) {
        invalidActors.push(action.type)
      }
    });

    console.log('invalidActors->'+ invalidActors);
    if (invalidActors.length > 0) {
      return {
        success: false,
        errors: ['following actions have invalid Actor: '+invalidActors]
      }
    }

   //call TNT

   
   const authToken = await this.authorisationAuth('tnt_create', "empty", "ES256");
   console.log('auhtToken->'+authToken);

   if (typeof authToken !== 'string') {
    return {
      success:false,
      errors: ['error from authorization API '+authToken.error]
    }
   }

  
   const wallet = new ethers.Wallet(this.issuerPrivateKeyHex);
   //const documentHash = this.getDocHash(productName,batchId);
   console.log('hash->'+documentHash);

   const requiredEventsDoc = [
    ...requiredActions,
    {
      type: lastInChainEvent,
      from: actordid,
      fromName: legalName,
      lastInChain: true
    }
   ]

   

   const documentMetadata = JSON.stringify(
    {
      createdOnBehalfOfdid: actordid,
      createdOnBehalfOfName: legalName,
      batchId: batchId,
      requiredEvents: requiredEventsDoc
    }
   )

   //console.log('documentMeta->'+documentMetadata);

   const params = [{
     from: wallet.address,
     documentHash,
     documentMetadata,
     didEbsiCreator: this.issuerDid,
   }]

    return await this.jsonrpcCall("createDocument",params,authToken);

 

  }


  async update_batch(   
    newBatchBody: UpdateBatchDto
  ): Promise<CheckResult> {

    const {documentId, vp_token,eventDetails, presentation_submission} = newBatchBody;
   // console.log('update batch->'+JSON.stringify(newBatchBody));

    let licenseVp;
     // check licensevp
     try {
      licenseVp= await this.validateLicenseVP(vp_token, presentation_submission, this.pex)
     } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestError(BadRequestError.defaultTitle, {
           detail: error.message,
        });
      }
      throw error;
     }

    // console.log('licenseVP->'+licenseVp);

     if ( typeof licenseVp === 'string') {
      return {
        success:false,
        errors: [licenseVp]
      }

     }

     //check submitted event details

     const {productName, legalName, allowedEvent, lastInChain,vcJwt,actordid } = licenseVp;

    const product = await this.ProductModel.findOne({productName}).exec() as Product;

   
    if (!product) {
      return {
        success: false,
        errors:['product does not exist']
      }
    }

  
    const { eventsDetails} = product;
    // const eventDbDetails = [{type: "halloumi_produced",details: ["production_date","expiry_date","milk_proportions"]}]

     let eventDbDetails:string[]= []
     eventsDetails.map(detailsEntry => {
      if (detailsEntry.type == allowedEvent) eventDbDetails = [...detailsEntry.details]
     })

     if (eventDbDetails.length == 0) {
      return {
        success:false,
        errors: [`no pre-defined event details found in db for ${allowedEvent}`]
      }

     }
   
     const entries:[string, unknown][] = []; 
     eventDbDetails.map(key=> {
      entries.push([key,'']);
     })

     const reqEventDetails = Object.fromEntries(entries);
    
 
     console.log('reqDbDetails->'+JSON.stringify(reqEventDetails));
    
   
     console.log('subDetails->'+JSON.stringify(eventDetails));
     const missingDetails: string[] =[];
     Object.keys(reqEventDetails).map(key => {
      if (!eventDetails.hasOwnProperty(key)) {
        console.log('keys is required->'+key); 
        missingDetails.push(key)
      }
     });

     if (missingDetails.length > 0) {
      return {
        success:false,
        errors: [`following event details are missing: ${missingDetails} `]
      }

     }

    //console.log('licenseVP->'+JSON.stringify(licenseVp));


  
  

    //get document and check if 
    //it has not already event with type == allowedEvent
    //exists requiredEvents type == allowedEvent and from==actordid
    //if requiredEvents.lastInChain check if license is lastInChain and all requiredEvents have been submitted

    const {pdodocument,requiredEvents, events} = await this.getDocument(documentId);
   

   
    if (!pdodocument) 
      return {
          success:false,
          errors:['error getting tnt document']
      }

      console.log('pdodoc->'+JSON.stringify(pdodocument));

      if (!requiredEvents.some(reqEvent => reqEvent.type == allowedEvent )) {
        return {
          success:false,
          errors: [`${allowedEvent} event not requested on this batch`]
        }
      }

      if (requiredEvents.some(reqEvent => reqEvent.type == allowedEvent && reqEvent.from != actordid)) {
        return {
          success:false,
          errors: [`${allowedEvent} event not requested from this actor`]
        }
      }

      const {pdoEvents,success} = await this.getEvents(documentId,events);

      if (!success) 
        return {
            success:false,
            errors:['error getting tnt document events']
        }

        console.log('pdoevents->'+JSON.stringify(pdoEvents));

        if (lastInChain) {
          const missingRequiredEvents = this.missingReqEvents(requiredEvents,pdoEvents, allowedEvent);
          if (missingRequiredEvents.length > 0) {
            return {
              success:false,
              errors: [`the following events must be added first: ${missingRequiredEvents}`]
            }
          }
        }

        if (pdoEvents.some(pdoEvent => pdoEvent.type == allowedEvent)) {
          return {
            success:false,
            errors: [`${allowedEvent} event already added to this batch`]
          }
        }

  

   //call TNT

   
   const authToken = await this.authorisationAuth('tnt_write', "empty", "ES256");
   console.log('auhtToken->'+authToken);

   if (typeof authToken !== 'string') {
    return {
      success:false,
      errors: ['error from authorization API '+authToken.error]
    }
   }

  
  const wallet = new ethers.Wallet(this.issuerPrivateKeyHex);

   
 const eventMetadata = JSON.stringify(
  {
    type: allowedEvent,
    from: actordid,
    fromName: legalName,
    lastInChain,
    vcJwt,
    eventDetails,
  //  eventDetails : {milk_production_date: '051024', milk_type: 'cow', milk_volume:'100 kilos'}

  }
 )

   //console.log('documentMeta->'+documentMetadata);

   const params = [{
     from: wallet.address,
     eventParams: {
     documentHash:documentId,
     externalHash: "0x29214",
     sender:`0x${Buffer.from(this.issuerDid).toString("hex")}`,
     origin:"my origin",
     metadata:eventMetadata
     }
     
   }]

    return await this.jsonrpcCall("writeEvent",params,authToken);

   

  }

  missingReqEvents(requiredEvents: RequiredEvent[], pdoEvents: PDOEvent[], lastInChainEvent: String | null) {

    if (requiredEvents.some(reqEvent => reqEvent.type == lastInChainEvent && !reqEvent.lastInChain)) {
      return ['allowedEvent not the required last in chain event']

    }
    const missingEvents: string[] = [];
    requiredEvents.map(reqEvent => {
      if (!pdoEvents.some(pdoEvent => reqEvent.type == pdoEvent.type)) {
        if (reqEvent.type != lastInChainEvent) missingEvents.push(reqEvent.type)
      }
    })
    return missingEvents;
  }


  async getDocument(hash:string) {

    const docUrl = 'https://api-pilot.ebsi.eu/track-and-trace/v1/documents'

    try {
    const response = await axios.get(
      `${docUrl}/${hash}`,
      
    )
    const tntDocument = response.data as TnTDocument;
    const pdodocument = JSON.parse(tntDocument.metadata) as PDOdocument;
    const events = tntDocument.events;
    const createdAt = tntDocument.timestamp.datetime;
    const requiredEvents = pdodocument.requiredEvents;
    return {pdodocument,requiredEvents,events,createdAt};

    } catch (error) {
      console.log('getdocument error->'+error);
      return {pdodocument: null, requiredEvents:null, events:null, createdAt:null}
    } 
  
   

  }

  async getEvents(hash:string, events: string[]) {

    const docUrl = 'https://api-pilot.ebsi.eu/track-and-trace/v1/documents'

    let pdoEvents: PDOEvent[] = [] ;
    let success:boolean = true;

    await Promise.all(
      events.map(async event => {

        try {
          const response = await axios.get(
            `${docUrl}/${hash}/events/${event}`,
            
          )
          console.log('event->'+response.data);
          const tntEvent = response.data as TnTEvent;
          const pdoEvent = JSON.parse(tntEvent.metadata) as PDOEvent;
          pdoEvent.createdAt = tntEvent.timestamp.datetime;
          pdoEvents.push(pdoEvent)
          
      
          } catch (error) {
           // console.log('getdocument error->'+error);
            success = false;
          // return {pdoEvents: []}
          } 
        
      })
   )

    return {pdoEvents, success}

  }

  getDocHash(productName:string,batchId:string):string {

    const padding= '123456789012345';
    const mainpart = `PDO-${productName}-${batchId}-`
    const productId = `${mainpart}${padding.substring(0,32-mainpart.length)}`
    
    return `0x${Buffer.from(productId,'utf8').toString('hex')}`;
  }

  isTnTdocument(productName:string,hash:string):boolean {

    const mainpart = `PDO-${productName}-`
   
    const productIdName = Buffer.from(hash.substring(2),'hex').toString('utf-8');
    if (productIdName.startsWith(mainpart) ) return true;
    return false;
  }


  
  async pendingBatches(tntQuery: TnTqueryDto): Promise<object> {

    const {productName, actordid, allowedEvent} = tntQuery;

    const accessesUrl = `https://api-pilot.ebsi.eu/track-and-trace/v1/accesses?subject=${this.issuerDid}&page[size]=10`

    const previous: BatchAll[] = [];

    const results= await this.batchAll(productName,accessesUrl,previous) as BatchAll[];



     if (actordid && allowedEvent) {
      console.log("PendingTasks")
      //get pending tasks for actor in pending batches

      const pendingTasks: PendingTask[] = [];

      results.map( batch => {
        const {requiredEvents, pdoEvents} = batch;
        const batchCompleted = pdoEvents.some(event => (event.lastInChain));

        if (!batchCompleted) { 

            requiredEvents.map(reqEvent => {
            if (reqEvent.from == actordid && reqEvent.type == allowedEvent) {
              if (!(pdoEvents.some(pdoEvent => 
                pdoEvent.from == actordid && pdoEvent.type == allowedEvent
              )))
              pendingTasks.push({
                documentId:batch.documentId,
                createdAt:batch.createdAt,
                batchId:batch.batchId,
                createdOnBehalfOfName: batch.createdOnBehalfOfName,
                type:reqEvent.type,
                notesToActor: reqEvent.notesToActor})

            }
            })
          }
      })
      return pendingTasks;
     }

     //return pendingBatch

     console.log("PendingBatch")

     const pendingBatch: PendingBatch[] = [];

     results.map( batch => {
       const {requiredEvents, pdoEvents} = batch;
       const pendingRequiredEvents: string[] = []
       const batchCompleted = pdoEvents.some(event => (event.lastInChain));

       if (!batchCompleted) { 

          requiredEvents.map(reqEvent => {
          
              if (!(pdoEvents.some(pdoEvent => 
                pdoEvent.type == reqEvent.type
              )))
              pendingRequiredEvents.push(
                reqEvent.type
           //   type: reqEvent.type,
           //   from: reqEvent.from,
           //   fromName: reqEvent.fromName,
           //   notesToActor: reqEvent.notesToActor}
              )

              })
              pendingBatch.push({
                documentId: batch.documentId,
                createdAt: batch.createdAt,
                batchId: batch.batchId,
                createdOnBehalfOfName: batch.createdOnBehalfOfName,
                requiredEvents: batch.requiredEvents,
                pendingRequiredEvents 
              })
        }
      })
      
     return pendingBatch;


  }

  
  

  async completedBatches(tntQuery: TnTqueryDto): Promise<object> {

    const {productName, actordid, allowedEvent} = tntQuery;

    const accessesUrl = `https://api-pilot.ebsi.eu/track-and-trace/v1/accesses?subject=${this.issuerDid}&page[size]=10`

    const previous: BatchAll[] = [];

     const results= await this.batchAll(productName,accessesUrl,previous) as BatchAll[];



     if (actordid && allowedEvent) {
      //find completed tasks for actor in completed batches. called from lastInchain actor for qrcode
      console.log("for qrcode")

      const completedTasks: CompletedTask[] = [];

      results.map( batch => {

        const {pdoEvents} = batch;
          if (pdoEvents.some(pdoEvent => pdoEvent.lastInChain && pdoEvent.from == actordid && pdoEvent.type == allowedEvent)) {
            
             {
            
              completedTasks.push({
                documentId:batch.documentId,
                createdAt:batch.createdAt,
                batchId:batch.batchId,
                createdOnBehalfOfName: batch.createdOnBehalfOfName,
                type:allowedEvent,
                eventDetails: {},
                batchCompleted: true
                //notesToActor:''
                })

            }
            
          }

      })
      return completedTasks;
     }

     //return completedBatch

     const completedBatches: CompletedBatch[] = [];

     results.map( batch => {

       const {requiredEvents,pdoEvents} = batch;
         if (pdoEvents.some(pdoEvent => pdoEvent.lastInChain)) {
           
          completedBatches.push({
               documentId:batch.documentId,
               createdAt:batch.createdAt,
               batchId:batch.batchId,
               createdOnBehalfOfName: batch.createdOnBehalfOfName,
               completedEvents: pdoEvents
               })

           }
           
         }

     )


     console.log("completedBatch")

     return completedBatches;


  }
    
  async completedTasks(tntQuery: TnTqueryDto): Promise<object> {

    const {productName, actordid, allowedEvent} = tntQuery;

   //find completed events from actor in either pending or completed batches
  

   const accessesUrl = `https://api-pilot.ebsi.eu/track-and-trace/v1/accesses?subject=${this.issuerDid}&page[size]=10`

   const previous: BatchAll[] = [];

    const results= await this.batchAll(productName,accessesUrl,previous) as BatchAll[];



    if (actordid && allowedEvent) {
     

     const completedTasks: CompletedTask[] = [];

     results.map( batch => {

       const {pdoEvents} = batch;
         
           const completed = pdoEvents.some(event => (event.lastInChain));
           pdoEvents.map(pdoEvent2 => {
           
           if (pdoEvent2.from == actordid && pdoEvent2.type == allowedEvent) {
           
             completedTasks.push({
               documentId:batch.documentId,
               createdAt:batch.createdAt,
               batchId:batch.batchId,
               createdOnBehalfOfName: batch.createdOnBehalfOfName,
               type:pdoEvent2.type,
               eventDetails: pdoEvent2.eventDetails,
               batchCompleted: completed ? true : false
               })

           }
           })
         

     })
     return completedTasks;
    }

     return [];


  }

    
  async document(tntQuery: TnTdocumentDto): Promise<object> {

    const {documentId, fromCustomer} = tntQuery;
    const {pdodocument,requiredEvents, events, createdAt} = await this.getDocument(documentId);
   

   
    if (!pdodocument) 
      return {
          success:false,
          errors:['error getting tnt document']
      }



    const {pdoEvents,success} = await this.getEvents(documentId,events);

    if (!success) 
      return {
          success:false,
          errors:['error getting tnt document events']
      }

    console.log('pdoevents->'+JSON.stringify(pdoEvents));

    if (fromCustomer=="false") {

      console.log('not from customer');


        const batchCompleted = pdoEvents.some(event => (event.lastInChain));
        const pendingRequiredEvents: RequiredEvent[] = [];
        const completedEvents = pdoEvents;

        if (!batchCompleted) {
     
           requiredEvents.map(reqEvent => {
           
               if (!(pdoEvents.some(pdoEvent => 
                 pdoEvent.type == reqEvent.type
               )))
               pendingRequiredEvents.push({
               type: reqEvent.type,
               from: reqEvent.from,
               fromName: reqEvent.fromName,
               notesToActor: reqEvent.notesToActor})
 
               })
       
          }
      
       
          return {
            documentId,
            createdAt,
            batchId: pdodocument.batchId,
            createdOnBehalfOfName: pdodocument.createdOnBehalfOfName,
            batchCompleted,
            pendingRequiredEvents,
            completedEvents
          }


    } else  if (fromCustomer=="true") {

      const batchCompleted = pdoEvents.some(event => (event.lastInChain));
      if (!batchCompleted) {
        return {
          success: false,
          errors: ['batch not completed yet']
        }
      }

      type EventWithStatus =   Partial<PDOEvent> & {licenseStatus:string};
      const completedEventsWithStatus: EventWithStatus[] = [];
      //validate vcs is pdoEvents and add status property
      
      await Promise.all(
        pdoEvents.map(async event => {
         // console.log('vc->'+event.vcJwt);
          const response = await this.verifyVC(event.vcJwt);
          const tempEvent = {...event, licenseStatus: response.status}; //add licenseStatus key
          const  {vcJwt, ...newEvent} = tempEvent;  //remove vcJwt key
          completedEventsWithStatus.push(newEvent)
        }));
      //return a formatted html page

      return {
        documentId,
        createdAt,
        batchId: pdodocument.batchId,
        createdOnBehalfOfName: pdodocument.createdOnBehalfOfName,
        batchCompleted,
        completedEventsWithStatus
      }


    }

    return    {
      success: false,
      errors: ['fromCustomer must be true or false']
    }

  }

  
    

  
    async batchAll(productName: string, url: string, prevresults: BatchAll[] ): Promise<object> {

      console.log('calling batch All');
     
        const newresults = [...prevresults];
    
        try {
        const response = await axios.get(
          url,
          
        )
        const allDocuments = response.data as PaginatedList;
        const items = allDocuments.items;
    
        await Promise.all(
          items.map(async item => {
            
             if (this.isTnTdocument(productName,item.documentId)) {
               const {pdodocument,requiredEvents, events, createdAt, } = await this.getDocument(item.documentId);
               if (pdodocument) {
                const {pdoEvents,success} = await this.getEvents(item.documentId, events);
                if (success) {
                
                    newresults.push({
                      documentId: item.documentId,
                      createdAt,
                      batchId: pdodocument.batchId,
                      createdOnBehalfOfName: pdodocument.createdOnBehalfOfName,
                      requiredEvents,
                      pdoEvents
                    })
                  
                }
               }
               
               
             }
            
          })
       )
    
       if (allDocuments.links.next !== allDocuments.self ) {
          return await this.batchAll(productName,allDocuments.links.next, newresults);
          
       } else
         return newresults;
    
        } catch (error) {
          console.log('BatchAll error->'+error);
          return [];
        } 
      
     
    
      }
      
  
  async  authorisationAuth(scope: string, vc:string ,alg:string) {
   
    //const alg =  "ES256";
    const apiUrl = this.authorisationApiUrl;
  
 
    const response = await axios.get(
      `${apiUrl}/.well-known/openid-configuration`,
      
    );
  
    const openIdConfig = response.data as {issuer: string};

    const vpJwt = (await this.compute(
      "createPresentationJwt",
      [vc || "empty", alg, openIdConfig.issuer],
      
    )) as string;
  
    return this.authorisationToken(scope,vpJwt);
  }

async  authorisationToken(scope:string, vpJwt:string) {
  const apiUrl = this.authorisationApiUrl;
  
  const validScopes = ["tnt_create","tnt_write"];

  if (!validScopes.some(vscope => vscope==scope)) {
   return {
    error: 'invalid authorization scope'
   }
  }

  const httpOpts = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    
    },
  };

  const presentationSubmission = {
    id: randomUUID(),
    definition_id: `${scope}_presentation`,
    descriptor_map: [],
  };

  const response = await axios.post(
    `${apiUrl}/token`,
    new URLSearchParams({
      grant_type: "vp_token",
      scope: `openid ${scope}`,
      vp_token: vpJwt,
      presentation_submission: JSON.stringify(presentationSubmission),
    }).toString(),
    httpOpts,
  );

  const accessToken = (
    response.data as {
      access_token: string;
    }
  ).access_token;
  return accessToken;
}


async jsonrpcCall(method: string, params: unknown[], accessToken:string):Promise<CheckResult> {

  const wallet = new ethers.Wallet(this.issuerPrivateKeyHex);
  const jsonrpcUrl = 'https://api-pilot.ebsi.eu/track-and-trace/v1/jsonrpc'

  let responseBuild: AxiosResponse<{
    result: UnsignedTransaction;
  }>;

  try {
    responseBuild = await axios.post(
      jsonrpcUrl,
      {
        jsonrpc: "2.0",
        method,
        params,
        
       id: Math.ceil(Math.random() * 1000),
      },
      {
        headers: { authorization: `Bearer ${accessToken}` },
      }
    );
  } catch (error) {
    logAxiosRequestError(error, this.logger);
    return {
      success: false,
      errors: [
        `Unable to build the transaction for ${method}: ${getErrorMessage(
          error
        )}`,
      ],
    };
  }
  let unsignedTransaction = responseBuild.data.result;

  let transactionResult = await signAndSendTransaction(
    unsignedTransaction,
    wallet,
    jsonrpcUrl,
    this.logger,
    accessToken
  );

  if (!transactionResult.success) {
    return {
      success: false,
      errors: [
        `Unable to send the transaction for ${method}: ${getErrorMessage(
          transactionResult.error
        )}`,
      ],
    };
  }

  let { txId } = transactionResult;

  console.log('txId->'+txId);

  let miningResult = await waitToBeMined(
    this.ledgerApiUrl,
    this.logger,
    txId
  );

  console.log('mining result->'+JSON.stringify(miningResult));

  if (!miningResult.success) {
    return {
      success: false,
      errors: [miningResult.error.message],
    };
  }

  
  return { success: true };

}

async  compute(
  method: string,
  inputs: (UnknownObject |string)[],
  
): Promise<unknown> {
 // const { config, client } = context;

 

  switch (method) {
    // case "signTransaction": {
    //   const unsignedTransaction = inputs[0] as unknown as ethers.Transaction;
    //   const uTx = formatEthersUnsignedTransaction(
    //     JSON.parse(JSON.stringify(unsignedTransaction)) as ethers.Transaction,
    //   );
    //   const sgnTx = await client.ethWallet.signTransaction(
    //     uTx as ethers.Transaction,
    //   );
    //   yellow(sgnTx);
    //   return sgnTx;
    // }
    case "createPresentationJwt": {
      const verifiableCredential = inputs[0] as string | string[];
      const alg = (inputs[1] as Alg) || "ES256K";
      const audience = inputs[2] as string;
      
      const keys = await this.getIssuerKeyPair(alg as "ES256K");
      if (!verifiableCredential)
        throw new Error("Verifiable Credential not defined");
      const { jwtVp, payload } = await createVPJwt(
        this.issuerDid,
        this.issuerKid,
        keys,
        alg,
        verifiableCredential,
        audience,
        this.ebsiAuthority
      );
     
      return jwtVp;
    }
    case "createVcJwt": {
      const payloadVc = inputs[0] as {
        id?: string;
        credentialSubject?: {
          id?: string;
        };
        [x: string]: unknown;
      };
      const payloadJwt = inputs[1] as UnknownObject;
      const alg = (inputs[2] || "ES256K") as Alg;
      const keys = await this.getIssuerKeyPair(alg as "ES256K");
  
      if (!keys)
        throw new Error(`There is no key defined for alg ${alg}`);
      const privateKey = await importJWK(keys.privateKeyJwk, alg);
      const iat = Math.floor(Date.now() / 1000) - 10;
      const exp = iat + 5 * 365 * 24 * 3600;
      const issuanceDate = `${new Date(iat * 1000)
        .toISOString()
        .slice(0, -5)}Z`;
      const expirationDate = `${new Date(exp * 1000)
        .toISOString()
        .slice(0, -5)}Z`;
      const jti = payloadVc.id || `urn:uuid:${randomUUID()}`;
      const sub = payloadVc.credentialSubject?.id;
      const payload = {
        iat,
        jti,
        nbf: iat,
        exp,
        sub,
        vc: {
          "@context": ["https://www.w3.org/2018/credentials/v1"],
          id: jti,
          type: ["VerifiableCredential"],
          issuer: this.issuerDid,
          issuanceDate,
          issued: issuanceDate,
          validFrom: issuanceDate,
          expirationDate,
          ...payloadVc,
        },
        ...payloadJwt,
      };
      const vc = await new SignJWT(payload)
        .setProtectedHeader({
          alg,
          typ: "JWT",
          kid: this.issuerKid,
        })
        .setIssuer(this.issuerDid)
        .sign(privateKey);
      
      return vc;
    }
    case "signJwt": {
      const [payload, alg, headers] = inputs as [
        UnknownObject,
        Alg,
        UnknownObject,
      ];
      const keys = await this.getIssuerKeyPair(alg as "ES256K");
      const privateKey = await importJWK(keys.privateKeyJwk, alg);
      const jwt = await new SignJWT(payload)
        .setProtectedHeader({
          alg,
          typ: "JWT",
          kid: this.issuerKid,
          ...headers,
        })
        .sign(privateKey);
      
      return jwt;
    }
    case "wait": {
      const [seconds] = inputs as [string];
      const milliseconds = Math.round(Number(seconds) * 1000);
      console.log(`waiting ${milliseconds / 1000} seconds`);
      await new Promise((r) => {
        setTimeout(r, milliseconds);
      });
      return 0;
    }
    // case "userPin": {
    //   const [did] = inputs as [string];
    //   const userPin = getUserPin(did);
      
    //   return userPin;
    // }
    // case "schemaId": {
    //   const [schema, base] = inputs as [UnknownObject, "base16" | "base58btc"];
    //   const schemaId = await computeSchemaId(schema, base);
      
    //   return schemaId;
    // }
    // case "checkStatusList2021CredentialSchema": {
    //   const [credential] = inputs as [UnknownObject];
    //   try {
    //     Joi.assert(
    //       credential,
    //       Joi.object({
    //         "@context": Joi.array()
    //           .ordered(
    //             Joi.string()
    //               .valid("https://www.w3.org/2018/credentials/v1")
    //               .required(),
    //             Joi.string()
    //               .valid("https://w3id.org/vc/status-list/2021/v1")
    //               .required(),
    //           )
    //           .items(Joi.string().uri())
    //           .required(),
    //         type: Joi.array()
    //           .ordered(
    //             // First item must be "VerifiableCredential"
    //             Joi.string().valid("VerifiableCredential").required(),
    //           )
    //           .items(
    //             // "StatusList2021Credential" must be present
    //             Joi.string().valid("StatusList2021Credential").required(),
    //             Joi.string(),
    //           )
    //           .required(),
    //         credentialSubject: Joi.object({
    //           id: Joi.string().uri().required(),
    //           type: Joi.string().valid("StatusList2021").required(),
    //           statusPurpose: Joi.string()
    //             .valid("revocation", "suspension")
    //             .required(),
    //           encodedList: Joi.string().required(),
    //         })
    //           .unknown(true)
    //           .required(),
    //       })
    //         // Allow additional properties
    //         .unknown(true),
    //     );
    //     yellow("StatusList2021 Credential Schema correct");
    //     return true;
    //   } catch (error) {
    //     red(error);
    //     throw error;
    //   }
    // }
    // case "verifyVcJwt": {
    //   try {
    //     const result = await computeVerifyVcJwt(inputs, context);
    //     yellow(result);
    //     return result;
    //   } catch (error) {
    //     if (error instanceof ValidationError) {
    //       red(error.toJSON());
    //     } else {
    //       red(error);
    //     }
    //     throw error;
    //   }
    // }
    // case "verifyVpJwt": {
    //   try {
    //     const result = await computeVerifyVpJwt(inputs as string[], context);
    //     yellow(result);
    //     return result;
    //   } catch (error) {
    //     if (error instanceof ValidationError) {
    //       red(error.toJSON());
    //     } else {
    //       red(error);
    //     }
    //     throw error;
    //   }
    // }
    // case "verifyAuthenticationRequest": {
    //   const request = inputs[0] as {
    //     client_id: string;
    //     request: string;
    //   };
    //   Joi.assert(
    //     request,
    //     Joi.object({
    //       client_id: Joi.string(),
    //       request: Joi.string(),
    //     }).unknown(),
    //   );
    //   await verifyJwtTar(request.request, {
    //     trustedAppsRegistry: `${config.api.tar.url}/apps`,
    //   });
    //   yellow("Authentication request OK");
    //   return request.client_id;
    // }
    // case "verifySessionResponse": {
    //   const nr = inputs[0] as {
    //     alg: string;
    //     nonce: string;
    //     response: AkeResponse;
    //   };
    //   Joi.assert(
    //     nr,
    //     Joi.object({
    //       alg: Joi.string(),
    //       nonce: Joi.string(),
    //       response: Joi.object(),
    //     }).unknown(),
    //   );
    //   const key = client.keys[nr.alg] as KeyPairJwk;
    //   if (!key) throw new Error(`There is no key defined for alg ${nr.alg}`);
    //   const accessToken = await SiopAgent.verifyAkeResponse(nr.response, {
    //     nonce: nr.nonce,
    //     privateEncryptionKeyJwk: key.privateKeyEncryptionJwk,
    //     trustedAppsRegistry: `${config.api.tar.url}/apps`,
    //     alg: nr.alg,
    //   });
    //   yellow(`Session Response OK. Access token: ${accessToken}`);
    //   return accessToken;
    // }
    // case "did2": {
    //   const [jwk] = inputs as [UnknownObject];
    //   const did = EbsiWallet.createDid("NATURAL_PERSON", jwk);
    //   yellow(did);
    //   return did;
    // }
    case "sha256": {
      const [data] = inputs as [UnknownObject | string];
      if (typeof data === "object") {
        return this.sha256(JSON.stringify(data));
      }
      return this.sha256(data);
    }
    case "decodeJWT": {
      const jwt = inputs[0] as string;
      //Joi.assert(jwt, Joi.string());
      const decoded = decodeJWT(jwt) as unknown;
     
      return decoded;
    }
    case "encodeBase64": {
      const dec = inputs[0] as string;
      //Joi.assert(dec, Joi.string());
      const encoded = Buffer.from(removePrefix0x(dec), "hex").toString(
        "base64",
      );
     
      return encoded;
    }
    case "encodeBase64url": {
      const dec = inputs[0] as string;
      //Joi.assert(dec, Joi.string());
      const encoded = base64url.encode(Buffer.from(removePrefix0x(dec), "hex"));
    //  yellow(encoded);
      return encoded;
    }
    case "timestampId": {
      const hash = inputs[0] as string;
     // Joi.assert(hash, Joi.string());
      const bufferSha256 = Buffer.from(this.sha256(hash), "hex");
      const multihash = Multihash.encode(bufferSha256, "sha2-256", 32);
      const timestampId = `u${base64url.encode(multihash)}`;
     
      return timestampId;
    }
    case "recordId": {
      const [address, blockNumber, hashValue] = inputs as [
        string,
        string,
        string,
      ];
      
      const abiEncoded = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256", "bytes"],
        [address, blockNumber, hashValue],
      );
      const bufferSha256 = Buffer.from(this.sha256(abiEncoded), "hex");
      const recordId = multibaseEncode("base64url", bufferSha256);
     
      return recordId;
    }
    case "decodeBase64": {
      const enc = inputs[0] as string;
      const type = (inputs[1] as string) || "utf8";
     
      const buffer = Buffer.from(enc, "base64");
      if (type === "buffer") {
        console.log(buffer);
        return buffer;
      }

      const decoded = buffer.toString("utf8");
      
      return decoded;
    }
    case "decodeBase64url": {
      const enc = inputs[0] as string;
 
      const decoded = base64url.decode(enc);
      
      return decoded;
    }
    case "decodeHex": {
      const enc = inputs[0] as string;
    
      const decoded = Buffer.from(removePrefix0x(enc), "hex").toString("utf8");
     
      return decoded;
    }
    case "randomID": {
      return randomBytes(32).toString("hex");
    }
    // case "subaccountDid": {
    //   const [did] = inputs as [string];
     
    //   const subaccountMsiBytes = createHash("sha256")
    //     .update(did, "utf8")
    //     .digest()
    //     .slice(0, 16);
    //   const subaccount = util.createDid(subaccountMsiBytes);
     
    //   return subaccount;
    // }
    case "statusListIndex": {
      const [did] = inputs as [string];
      
      const statusListIndex = (
        createHash("sha256")
          .update(did, "utf8")
          .digest()
          .slice(0, 6)
          .readUInt32BE() % 131072
      ).toString();
     
      return statusListIndex;
    }
    // case "thumbprint": {
    //   const [hexOrJwk] = inputs as [string | UnknownObject];
    //   let publicKeyJwk: JWK;
    //   if (typeof hexOrJwk === "string") {
    //     publicKeyJwk = getPublicKeyJwk(hexOrJwk);
    //   } else {
    //     publicKeyJwk = hexOrJwk;
    //   }
    //   const thumbprint = await calculateJwkThumbprint(publicKeyJwk, "sha256");
    //   yellow(thumbprint);
    //   return thumbprint;
    // }
    default:
      
      return 0;
  }
}

sha256(data: string) {
  let hash = createHash("sha256");
  if (data.startsWith("0x")) {
    hash = hash.update(removePrefix0x(data), "hex");
  } else {
    hash = hash.update(data, "utf8");
  }
  return hash.digest().toString("hex");
}

  getCredentialIssuerMetadata(): CredentialIssuerMetadata {
    return {
      credential_issuer: this.issuerUri,
      authorization_server: this.authUri,
      credential_endpoint: `${this.issuerUri}/credential`,
      deferred_credential_endpoint: `${this.issuerUri}/credential_deferred`,
      credentials_supported: [
        {
          format: "jwt_vc",
          types: [
            "VerifiableCredential",
            "VerifiableAttestation",
            "LicenseToOperate",
          ],
          trust_framework: {
            name: "ebsi",
            type: "Accreditation",
            uri: "TIR link towards accreditation",
          },
          display: [
            {
              name: "Verifiable Attestation Conformance",
              locale: "en-GB",
            },
          ],
        },
        
      ],
    };
  }


  //called from last in chain actor

  async active_actors(ProductName:string): Promise<object> {

    
    type resElement = {actorDID:string;legalName:string;allowedEvent:string}
    let result: resElement[] = []
  
    const data = await this.IssuedVCModel.aggregate([
      {
        $match: {
          productName: ProductName,
          lastInChain: {$ne: true},
          status: "active",
          //issued:true,
          // deferred:true,
          // acceptancetoken: {$exists: true},
          downloaded: true
       
        },
        
      },
      {
        $sort: {issuedDate: -1}
      },

      
    ])

   //console.log(data);
    //result.metadata = pagevcs[0].metaData[0];

    if (data && data.length > 0)

     {
      data.map((element: IssuedVC)=> {
         //skip duplicates
          if ((result.some(e =>e.actorDID== element.actorDID && e.allowedEvent==element.allowedEvent) ))
               {
               // pagevcs[0].metaData[0].total =  pagevcs[0].metaData[0].total -1;
               } else {
          result.push({
                   //   shared_id: element._id,
                  //    issuedDate: element.issuedDate,
                      actorDID: element.actorDID,
                      legalName: element.legalName,
                      allowedEvent: element.allowedEvent,
                   //   lastInChain: element.lastInChain,
                   //   status: element.status,
                    })
                  };
        
      });
    }
    return result;
    
  }
  

  
  async adminIssuePreAuthVC(vcdatareq: IssuedVC): Promise<string> {
  
    const keyPair = await this.getIssuerKeyPair("ES256"); //YC256
    console.log('issuer Accred url ->'+this.issuerAccreditationUrl);
    console.log('trusted issuer Registry url ->'+this.trustedIssuersRegistryApiUrl);


    const additionalVcPayload: Pick<EbsiVerifiableAttestations,"credentialStatus" > = {};

    if (this.IsVCRevokable ) {
    let proxyId = "";
  

    const revList=await this.RevListModel.findOne({did: `${this.issuerDid}`, statusList2021Id: `${this.StatusListID}`}).exec() as RevList;
    if (!revList || !revList.proxyid)
      throw new NotFoundError(NotFoundError.defaultTitle, {
        detail: `No proxy found for status list ${this.StatusListID}`,
      });

    if (!revList.proxyidrec)
      throw new NotFoundError(NotFoundError.defaultTitle, {
        detail: `proxy ${revList.proxyid} not registered`,
      });
    
    proxyId = revList.proxyid;
      
    const statusListCredential = `${this.trustedIssuersRegistryApiUrl}/${this.issuerDid}/proxies/${proxyId}/credentials/status/${this.StatusListID}`;
    const statusListIndex = (
      createHash("sha256")
        .update(vcdatareq.actorDID, "utf8")
        .digest()
        .slice(0, 6)
        .readUInt32BE() % 131072
    ).toString();
    additionalVcPayload.credentialStatus = {
      id: statusListCredential,
      type: "StatusList2021Entry",
      statusPurpose: "revocation",
      statusListIndex,
      statusListCredential,
    };

    
  }


    const {  vcJwt } = await issueCredential(
      this.issuerDid,
      "Ministry Of Argiculture",
      this.issuerKid,
      keyPair.privateKeyJwk,
      this.issuerAccreditationUrl,
      this.authorisationCredentialSchema,
      {
        ebsiAuthority: this.ebsiAuthority,
        timeout: this.timeout,
        skipAccreditationsValidation: true,
        ebsiEnvConfig: {
          didRegistry: this.didRegistryApiUrl,
          trustedIssuersRegistry: this.trustedIssuersRegistryApiUrl,
          trustedPoliciesRegistry: this.trustedPoliciesRegistryApiUrl,
        },
      },
      additionalVcPayload,
    
    //  this.AuthPINModel,
      vcdatareq,
    );



    return vcJwt;

  }

  async verifyVC(
    jwtvc: string,
    
  ): Promise<VerifyResponse> {

    //remove this
  //   let sumPromise = new Promise(function (resolve, reject) {
  //     setTimeout(function () {
  //        resolve("The sum of all data is 100.");
  //     }, 10000);
  //  });
  //  let result = await sumPromise;
    console.log('validAt->'+Math.floor(Date.now()/1000));
    console.log('axios timeout->'+this.timeout);
   
    let verifiedCredential: EbsiVerifiableAttestation202401 | EbsiVerifiableAttestation20221101;
    const options: VerifyCredentialOptions = {
    //  ...this.ebsiEnvConfig,
      ebsiAuthority:this.ebsiAuthority,
      timeout: this.timeout,
      skipAccreditationsValidation: true,
      skipStatusValidation:true,  //always true if using my own routine
      skipCredentialSubjectValidation: false,
      validAt: Math.floor(Date.now()/1000),
      ebsiEnvConfig: {
        didRegistry:this.didRegistryApiUrl,
        trustedIssuersRegistry:this.trustedIssuersRegistryApiUrl,
        trustedPoliciesRegistry:this.trustedPoliciesRegistryApiUrl
      },
    };
    console.log('skipAccreditation->'+options.skipAccreditationsValidation);
    console.log('skipStatusVal->'+options.skipStatusValidation);
    console.log('sckipCredentialSubVal->'+options.skipCredentialSubjectValidation);
    try {

      verifiedCredential = await verifyCredentialJwt(jwtvc, options);
      console.log("calling my ValidateStatusLocal");
    //  await validateCredentialStatus(verifiedCredential,options);
      await validateCredentialStatusLocal(verifiedCredential as EbsiVerifiableAttestation202401,this.IssuedVCModel);

    } catch (err) {
      console.log('err->'+err);
      console.log('verification error->'+JSON.stringify(err)); 
      let errobj = err as {name: string; message:string};
      console.log('verification error name->'+errobj.name);
      console.log('verification error message->'+errobj.message);
      if (errobj.message.includes('not valid after'))
        return {status: 'expired'};
      else if (errobj.message.includes('revoked'))
        return {status: 'revoked'};
      return {
        status: 'invalid',
     
      };
    }
  
    return {status: 'active'}

  }





  async validateLicenseVP(vpJwt:string, unsafePresentationSubmission:string, pex: PEXv2) {


    
    const invalidRequest = (description: string, error?: unknown) => {
      return this.formatAuthErrorResponse(
        'openid://',//requestPayload.redirect_uri,
        undefined,
        "invalid_request",
        description,
        error
      );
    };

    let presentationDefinition: ReadonlyDeep<PresentationDefinition> | null =
    null;
 
    presentationDefinition = PRESENTATION_DEFINITION_TEMPLATE;
  


    // const unsafePresentationSubmission = JSON.parse(
    //   presentationSubmissionString
    // );

    const parsedPresentationSubmission = presentationSubmissionSchema.safeParse(
      unsafePresentationSubmission
    );

    if (!parsedPresentationSubmission.success) {
      const error = new Error(
        parsedPresentationSubmission.error.issues
          .map((issue) => `'${issue.path.join(".")}': ${issue.message}`)
          .join("\n")
      );

      return invalidRequest("invalid_request", error);
    }

    let vpTokenPayload: JWTPayload;
    let vpTokenHeader: ProtectedHeaderParameters;
    try {
      vpTokenPayload = decodeJwt(vpJwt);
      vpTokenHeader = decodeProtectedHeader(vpJwt);
    } catch (error) {
      return invalidRequest("Invalid Verifiable Presentation", error);
    }

    const { kid } = vpTokenHeader;
    if (!kid) {
      return invalidRequest("Invalid vp_token: No kid defined");
    }
    const did = kid.split("#")[0] as string;

    // prevent replay attack
    if (!vpTokenPayload["nonce"]) {
      return invalidRequest(
        "The vp_token must contain a nonce in order to prevent replay attacks."
      );
    }

    const nonceVpToken = vpTokenPayload["nonce"] as string;
    try {
    
      const vpnonce = await this.cacheManager.get(nonceVpToken);
      console.log("vpnonce exists->"+vpnonce);
      // it exists
      if (vpnonce != undefined)
        return invalidRequest(
          "The vp_token contains a nonce which has already been used."
        )
    } catch (e) {
      // empty
    }

    // const dbKey1 = { did: serverDid, nonceVpToken };
    // await db.put(dbKey1, { nonce: nonceVpToken });
    // addKeyToCacheManager(dbKey1, 300_000); // 5 minutes

    await this.cacheManager.set(nonceVpToken, { nonce: nonceVpToken },5_000 );

    // Verify presentation_submission object
    const presentationSubmission = parsedPresentationSubmission.data;
    try {
      this.validatePresentationSubmissionObject(
        presentationSubmission,
        presentationDefinition
      );
    } catch (error) {
      return invalidRequest("Invalid Presentation Submission", error);
    }

    // Now, we can assert that vpTokenPayload is a VpJwtPayload
    const { vp } = vpTokenPayload as VpJwtPayload;

    // Fix: EBSIINT-6065
    // The PEX library is not forcing that all inputs listed in the
    // input_descriptors array are required for submission. This means that
    // if vp.verifiableCredential is an empty array the input_descriptors are
    // skipped.
    // To fix this we enforce that the didr_invite and tir_invite scopes
    // must have at least one VC, so the PEX library is able to validate the
    // corresponding credentials.
    if (!vp.verifiableCredential || vp.verifiableCredential.length === 0) {
      return invalidRequest(
        "Invalid Verifiable Presentation: The presentation must contain at least 1 verifiable credential"
      );
    }

    // Verify presentation exchange
    try {
      this.validatePresentationExchange(
        pex,
        vp,
        presentationDefinition,
        presentationSubmission
      );
    } catch (error) {
      return invalidRequest("Invalid Presentation Exchange", error);
    }

    // Verify VP JWT
    try {
      const audience = this.serverUrl;
      const options: VerifyPresentationJwtOptions = {
       ebsiAuthority:this.ebsiAuthority,
     // ...this.ebsiEnvConfig,
        ebsiEnvConfig: {
          didRegistry:this.didRegistryApiUrl,
          trustedIssuersRegistry:this.trustedIssuersRegistryApiUrl,
          trustedPoliciesRegistry:this.trustedPoliciesRegistryApiUrl
        },
        timeout: this.timeout,
        skipAccreditationsValidation: true,
        skipStatusValidation:true,  //always true if using my own routine
        skipCredentialSubjectValidation: false,
        validAt: Math.floor(Date.now() / 1000), // The JWT VC(s) must be valid now
        skipSignatureValidation: false,  //YC correct this. also check issuer module
        // OPTIONAL. Determines whether or not to validate the issuer's accreditations when
        // `termsOfUse` is missing. Default: false
        // used by validateAccreditations of vcs and only when skipAccreditationsValidation = false
        //if skipAccreditationsValidation = false && validateAccreditationWithoutTermsOfUse = true
        //it checks if verifiableAuthorizsationForTrustChain
        validateAccreditationWithoutTermsOfUse: false, // The VC must contain terms of use (or be self-accredited)
      }

      console.log('skipAccreditation->'+options.skipAccreditationsValidation);
      console.log('skipStatusVal->'+options.skipStatusValidation);
      console.log('sckipCredentialSubVal->'+options.skipCredentialSubjectValidation);

      //only skipSignatureValidation applies to vp. all others to included VCs
    
      const vp = await verifyPresentationJwt(vpJwt, audience, options);
      //need to call this within lib for each vc in vp
    
     console.log("calling my ValidateStatusLocal after verifyPresentation");
     await Promise.all(
       vp.verifiableCredential.map(async (vcJwt) => {
         if (typeof vcJwt === 'string' ) {
           const vcJwtPayload = decodeJwt(vcJwt) as VcJwtPayload;
           const { vc: credentialPayload } = vcJwtPayload;
           await validateCredentialStatusLocal(credentialPayload as EbsiVerifiableAttestation202401,this.IssuedVCModel);
           return;
          }
          throw new ValidationError("Unsupported verifiableCredential type");
       },
     ));

    } catch (error) {
      return invalidRequest("VP Verification Error", error);
    }

  

   

    if (vp && vp.verifiableCredential  && vp.verifiableCredential[0] ) {
        const VPPayload = decodeJwt(vp.verifiableCredential[0] as string) ;
        const VPvc = VPPayload['vc'] as EbsiVerifiableAttestation;
        const type = VPvc.type[2];
        const actordid = VPvc.credentialSubject.id;
        const legalName = VPvc.credentialSubject['legalName'] ? VPvc.credentialSubject['legalName'] as string : null;
        const productName = VPvc.credentialSubject['productName'] ? VPvc.credentialSubject['productName'] as string : null;
        const allowedEvent = VPvc.credentialSubject['allowedEvent'] ? VPvc.credentialSubject['allowedEvent'] as string : null;
        const lastInChain = VPvc.credentialSubject['lastInChain'] ? VPvc.credentialSubject['lastInChain'] as boolean : null;
      
            
        if (type !== 'LicenseToOperate') {
          return invalidRequest("VC type should be LicenseToOperate");
        }

        return {
          legalName,
          productName,
          allowedEvent,
          lastInChain,
          vcJwt: vp.verifiableCredential[0] as string,
          actordid 
        }
    
     }


     return invalidRequest("VP Verification. someething went wrong");

 

  }


validatePresentationSubmissionObject(
  presentationSubmission: PresentationSubmission,
  presentationDefinition: ReadonlyDeep<PresentationDefinition>
) {
  const validationResult = PEXv2.validateSubmission(presentationSubmission);

  const checkedArray = Array.isArray(validationResult)
    ? validationResult
    : [validationResult];

  const errors = checkedArray
    .map((checked) => {
      if (checked.status === "error") {
        return checked;
      }
      return null;
    })
    .filter(Boolean);

  if (errors.length > 0) {
    throw new Error(
      `\n${errors
        .map((err) => `- [${err.tag}] ${err.message ?? "Unknown error"}`)
        .join("\n")}`
    );
  }

  /**
   * The presentation_submission object MUST contain a definition_id property.
   * The value of this property MUST be the id value of a valid Presentation Definition.
   *
   * @see https://identity.foundation/presentation-exchange/#presentation-submission
   */
  if (presentationSubmission.definition_id !== presentationDefinition.id) {
    throw new Error(
      "definition_id doesn't match the expected Presentation Definition ID for the requested scope"
    );
  }

  /**
   * Make sure every descriptor_map[x].id of the Presentation Submission
   * matches an existing input_descriptors[x].id of the Presentation Definition
   */
  // presentationSubmission.descriptor_map.forEach((descriptor) => {
  //   const matchingDescriptor = presentationDefinition.input_descriptors.find(
  //     (inputDescriptor) => inputDescriptor.id === descriptor.id
  //   );

  //   if (!matchingDescriptor) {
  //     throw new Error(
  //       `The presentation definition doesn't contain any input descriptor with the ID ${descriptor.id}`
  //     );
  //   }
  // });

  /**
   * Make sure every input_descriptors[x] of the Presentation Definition is
   * satisfied, i.e. there's at least 1 descriptor_map[x] with the same id.
   */
  presentationDefinition.input_descriptors.forEach((inputDescriptor) => {
    const matchingDescriptor = presentationSubmission.descriptor_map.find(
      (descriptor) => descriptor.id === inputDescriptor.id
    );

    if (!matchingDescriptor) {
      throw new Error(`Input descriptor ${inputDescriptor.id} is missing`);
    }
  });
}

validatePresentationExchange(
  pex: PEXv2,
  vp: EbsiVerifiablePresentation,
  presentationDefinition: ReadonlyDeep<PresentationDefinition>,
  presentationSubmission: PresentationSubmission
) {
  const errors: Checked[] = [];

  // Evaluate each descriptor_map[x] individually
  presentationSubmission.descriptor_map.forEach((descriptor) => {
    // Trim presentation definition: keep only the constraints related to descriptor.id
    // Reason: the PEX library tries to apply every constraint to every input
    const trimmedPresentationDefinition = {
      ...presentationDefinition,
      input_descriptors: presentationDefinition.input_descriptors.filter(
        (inputDescriptor) => inputDescriptor.id === descriptor.id
      ),
    } as const;

    const presentation = {
      "@context": vp["@context"],
      type: vp.type,
      holder: vp.holder,
      presentation_submission: presentationSubmission,
      verifiableCredential:
        vp.verifiableCredential as unknown as IVerifiableCredential[],
    } satisfies IPresentation;

    const result = pex.evaluatePresentation(
      trimmedPresentationDefinition as PresentationDefinition,
      presentation
    );

    if (result.errors) {
      errors.push(...result.errors);
    }
  });

  if (errors && errors.length > 0) {
    throw new Error(
      errors
        .map(
          (error) => `${error.tag} tag: ${error.message ?? "Unknown error"};`
        )
        .join()
    );
  }
}

formatAuthErrorResponse(
  redirectUri: string,
  state: string | undefined,
  errorTitle: AuthenticationErrorResponse["error"],
  description: string,
  err?: unknown
) {
  const sanitizedRedirectUri = redirectUri.endsWith(":")
    ? `${redirectUri}//`
    : redirectUri;
  let errorDescription = description;
  if (err && err instanceof Error && err.message)
    errorDescription += `: ${err.message}`;
  else if (err && !(err instanceof Error))
    errorDescription += `: unknown error`;
  return `${sanitizedRedirectUri}?${new URLSearchParams({
    error: errorTitle,
    error_description: errorDescription,
    ...(state && { state }),
  } satisfies AuthenticationErrorResponse).toString()}`;
}


}
 
 

export default TntService;
