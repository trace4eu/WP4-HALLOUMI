import { Injectable,Inject, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import type { Cache } from "cache-manager";
import {
  BadRequestError,
  NotFoundError,
} from "@cef-ebsi/problem-details-errors";
import { Level } from "level";
import type { ApiConfig } from "../../config/configuration.js";
import type {
  TokenResponse,
  LevelDbKeyAuth,
  LevelDbObjectAuth,
  OPMetadata,
  GetAuthorizeHolderWallerDto,
} from "../../shared/auth-server/index.js";
// import {
//   AuthServer,
//   GetAuthorizeDto,
//   GetAuthorizeFullDto,
// } from "../../shared/auth-server";
import { AuthServer, GetAuthorizeDto, formatAuthErrorResponse } from "../../shared/auth-server/index.js";
import type { JsonWebKeySet } from "../../shared/interfaces.js";

//import { EventGateway } from "../../gateways/event.gateway.js";
import  CacheService from "../../cache/cache.service.js";
import { InjectModel } from "@nestjs/mongoose";
//import { ReceivedVC, ReceivedVCDocument } from "../../shared/models/receivedvcs.model.js";
import type { Model } from "mongoose";

import { IssuedVC, IssuedVCDocument } from "../../shared/models/issuedvcs.model.js";

@Injectable()
export class AuthService implements OnModuleInit, OnModuleDestroy {
  private readonly authServer: AuthServer;

  //private readonly db: Level<LevelDbKeyAuth, LevelDbObjectAuth>;

  private readonly privateKeyHex: string;
  private readonly apiUrlPrefix: string;
 
  requiredVCs: Array<string>;

  private readonly backEndUrl: string;
  
 
  LoginRequired: boolean;
  LoginRequiredOpenID: boolean;

  private readonly cacheManager: Cache;

  constructor(
    configService: ConfigService<ApiConfig, true>, 
 
    private cacheService: CacheService, 

    @InjectModel(IssuedVC.name) private issuedVCModel: Model<IssuedVCDocument>,
    ) {
      this.cacheManager = this.cacheService.getCache();
    this.privateKeyHex = configService.get<string>("authPrivateKey");
    this.backEndUrl = configService.get<string>("backEndUrl");
  
    const domain = configService.get<string>("domain");
    this.apiUrlPrefix = configService.get<string>("apiUrlPrefix");
    const didRegistryApiUrl = configService.get<string>("didRegistryApiUrl");
    const trustedIssuersRegistryApiUrl = configService.get<string>(
      "trustedIssuersRegistryApiUrl"
    );
    const trustedPoliciesRegistryApiUrl = configService.get<string>(
      "trustedPoliciesRegistryApiUrl"
    );
    const timeout = configService.get<number>("requestTimeout");
    const issuerPrivateKey = configService.get<string>("issuerPrivateKey");
    const issuerUrl = `${this.backEndUrl}${this.apiUrlPrefix}/tnt`;
   
   this.requiredVCs = configService.get<Array<string>>("requiredVCs");

    this.LoginRequired = configService.get<boolean>("loginRequired");
    this.LoginRequiredOpenID = configService.get<boolean>("loginRequiredOpenID");
  

    
    this.authServer = new AuthServer({
     // db: this.db,
      privateKeyHex: this.privateKeyHex,
      did: "",
      url: `${this.backEndUrl}${this.apiUrlPrefix}/auth`,
      didRegistryApiUrl,
      trustedIssuersRegistryApiUrl,
      trustedPoliciesRegistryApiUrl,
      ebsiAuthority: domain.replace(/^https?:\/\//, ""),
      issuerPrivateKey,
      issuerUrl,
      issuedVCModel,
      timeout,
    });

    
  }

  async onModuleInit() {
   // await this.db.open();
    // const { privateKeyJwk } = await getKeyPair(this.privateKeyHex);
    // await this.db.put({ did: "", jwks: true }, [privateKeyJwk]);
  }

  async onModuleDestroy() {
  //  await this.authServer.close();
   // await this.db.close();
  }

  getOPMetadata(): OPMetadata {
    return this.authServer.getOPMetadata();
  }

  /**
   * Expose Auth's public keys.
   *
   * @returns Auth's JWKS
   */
  async getJwks(): Promise<JsonWebKeySet> {
    return this.authServer.getPublicJwks();
  }

  /**
   * Process client's auth request.
   *
   * @returns The redirect location.
   */
  async authorize(query: GetAuthorizeDto,): Promise<string> {

  
    return this.authServer.authorize(query, this.cacheManager);
  }

  /**
   * Get Authorization Request by ID.
   */
  async getRequestById(requestId: string): Promise<string> {
    try {
      return await this.authServer.getRequestById(this.cacheManager,requestId);
    } catch (error) {
      throw new NotFoundError(NotFoundError.defaultTitle, {
        detail: `No Authorization Request found with the ID ${requestId}`,
      });
    }
  }

  /**
   * Process /direct_post request.
   *
   * @returns The location URI based on the Authentication Request `redirect_uri`, with `code` and `state` params.
   */
  async directPost(query: unknown): Promise<string> {
    try {
      let requiredLogin;
      if (this.LoginRequired || this.LoginRequiredOpenID) requiredLogin=true;
      return await this.authServer.directPost(this.cacheManager, query);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestError(BadRequestError.defaultTitle, {
          detail: error.message,
        });
      }
      throw error;
    }
  }
  

  /**
   * Process /token request.
   * Access Token is delivered as a response payload from a successful Token Endpoint initiation.
   * `c_nonce` (Challenge Nonce) must be stored until a new one is given.
   *
   * @see https://www.rfc-editor.org/rfc/rfc6749#section-4.1.4
   *
   * @param body The POST /token request payload
   * @returns A token response.
   */
  async token(query: unknown): Promise<TokenResponse> {
    // let requiredLogin;
    // if (this.LoginRequired || this.LoginRequiredOpenID) requiredLogin=true;
    return this.authServer.token(this.cacheManager, query);
  }
}

export default AuthService;
