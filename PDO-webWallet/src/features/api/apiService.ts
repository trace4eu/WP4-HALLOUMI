import qs from 'qs';
import jose from 'node-jose';
import axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios';
import jwt_decode from 'jwt-decode';
import {JWK} from 'jose';
import {TokenParams, Payload, generateToken} from '../../helpers/generateToken';
import WalletModel from '../../models/WalletModel';
import codeChallenge, {codeVerifier} from '../../helpers/codeChallenge';
import type {CredentialOffer, CredentialOfferPayload} from '../../screens/CredentialOffer';
import {IGetVCReqOptions} from '../credentialSlice';
import {typeIssuer} from '../../screens/Issuers';
import {
  CredentialIssuerMetadata,
  CredentialResponse,
  OPMetadata,
  TokenResponse,
  walletKnownCard,
} from '../../types/typeCredential';
import {VCtype} from '../../screens/Wallet';
import {initBanchType, initBatchResponseType, ReqEventsRespType} from '../../types/newBatchTypes';
import {Actor} from '../../components/BatchComponent';
import {EventDetailsType, pendingTaskType} from '../../types/pendingTaskType';
import {presentationSubmission} from '../../helpers/presentationSubmission';
import getVerifiablePresentationJwt from '../../helpers/getVerifiablePresentationJwt';

axios.defaults.timeout = 25000;
const abortTimeout = 25000;

interface ValidationError {
  message: string;
  errors: Record<string, string[]>;
}

type DecodedJWT = {
  aud: string;
  client_id: string; // "http://testissuer.acgoldman.com:3005/v3/auth"
  iss: string; //"http://testissuer.acgoldman.com:3005/v3/auth"
  nonce: string; // "e91bcbc4-6f99-4a90-bf96-92af02e7c961"
  redirect_uri: string; // "http://testissuer.acgoldman.com:3005/v3/auth/direct_post"
  response_mode: string; // "direct_post"
  response_type: string; // "id_token"
  scope: string; //"openid"
  state: string; // "8402ab32-9293-4f72-9ff6-52738d8e7d12"
};

interface JWTHeader {
  typ: string;
  alg: string;
  kid: string;
}

export interface IPostCredentialReqOptions {
  method: string;
  headers: {
    Authorization: string;
    'Content-type': string;
  };
  data: {
    format: 'jwt_vc';
    types: [
      'VerifiableCredential',
      'VerifiableAttestation',
      walletKnownCard // e.g. "CitizenId"
    ];
    proof: {
      proof_type: 'jwt';
      jwt: string;
    };
  }; //qs.ParsedQs;
  url: string;
  // signal: AbortSignal;
}

type headersType = {
  'Content-Type': 'application/x-www-form-urlencoded';
  followRedirects: boolean;
  authorization?: string;
};

interface PostTokenPreAuthorizedCodeDto {
  grant_type: 'urn:ietf:params:oauth:grant-type:pre-authorized_code';
  'pre-authorized_code': string;
  user_pin: string;
}

type errorResponseData = {
  detail: string;

  status: number;
  title: string;
  type: string;
};

export default class ApiService {
  private token_endpoint: string | null;
  private issuerUrl: string | null;
  private issuerUrlCredential: string | null;
  private offerUrl: string | null;
  private types: string[];
  private headers: headersType;
  private walletinstance: WalletModel;
  private isLogin: boolean;

  constructor(walletinstance: WalletModel) {
    // super();
    this.walletinstance = walletinstance;
    this.token_endpoint = null;
    this.issuerUrl = null;
    this.issuerUrlCredential = null;
    this.offerUrl = null;
    this.types = [];
    this.headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      followRedirects: false,
    };
    this.isLogin = false;

    // axios.defaults.timeout = 13000;
    console.log('apiservice init->' + this.walletinstance);
  }

  // Centralized error handler
  private _handleError(error: unknown): never {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const errorData = axiosError.response.data as errorResponseData;
      let errorDetails = errorData.detail;
      const parsedDetail = JSON.parse(errorData.detail);

      if (Array.isArray(parsedDetail)) {
        errorDetails = parsedDetail.join(', ');
      }
      const errorMessage = `${errorData.title || 'Request error '}: \n ${errorDetails}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    if (error instanceof Error) {
      throw new Error('Request error:  \n' + error.message);
    } else {
      console.error('Network or other error', error);
      throw new Error('An unexpected error occurred');
    }
  }

  // Reusable request method
  private async request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const configWithSignal: AxiosRequestConfig = {
      ...config,
      signal: AbortSignal.timeout(abortTimeout),
    };

    try {
      return await axios(configWithSignal);
    } catch (error) {
      this._handleError(error);
    }
  }

  async getPayload(url: string) {
    sessionStorage.clear();
    const response = await axios.get(url, {signal: AbortSignal.timeout(abortTimeout)});
    this.types = response.data.credentials[0].types;
    this.isLogin =
      response.data.loginRequired === true || response.data.loginRequiredOpenID === true
        ? true
        : false;

    console.log('isLogin ===', this.isLogin);
    if (this.isLogin) {
      sessionStorage.setItem('codeVerifier', codeVerifier);
      sessionStorage.setItem('types', response.data.credentials[0].types);
    }

    return response.data;
  }

  async getAuth(issuerurl: string, types: string[], issuer_state: string) {
    let authresp;
    let authServer;
    let deferredEndpoint;

    try {
      const metadata = await axios.get(`${issuerurl}/.well-known/openid-credential-issuer`, {
        signal: AbortSignal.timeout(abortTimeout),
      });

      authServer = metadata.data?.authorization_server as unknown as string;
      deferredEndpoint = metadata.data?.deferred_credential_endpoint as unknown as string;
      this.issuerUrl = issuerurl; //metadata.data?.credential_endpoint;
      console.log('=================');
      console.log('issuerUrl received by getAuth:', issuerurl);
      this.issuerUrlCredential = metadata.data?.credential_endpoint;
      console.log('issuerUrlCredential: ', metadata.data?.credential_endpoint);

      if (this.isLogin) {
        sessionStorage.setItem('issuerUrlMeta', metadata.data?.credential_endpoint);
        sessionStorage.setItem('issuerUrl', issuerurl);
        sessionStorage.setItem('deferredEndpoint', deferredEndpoint);
      }

      const openidmetadata = await axios.get(`${authServer}/.well-known/openid-configuration`, {
        signal: AbortSignal.timeout(abortTimeout),
      });
      this.token_endpoint = openidmetadata.data.token_endpoint;

      this.isLogin && sessionStorage.setItem('token_endpoint', openidmetadata.data.token_endpoint);

      const redirect_uri = `${process.env.REACT_APP_URL}/openid-code`;

      authresp = await axios.get(openidmetadata.data.authorization_endpoint, {
        params: {
          response_type: 'code',
          scope: 'openid',
          code_challenge: codeChallenge,
          code_challenge_method: 'S256',
          client_id: this.walletinstance.getDID(), // 'did.key.xxxxxxx',
          redirect_uri: redirect_uri,
          authorization_details: JSON.stringify([
            {
              type: 'openid_credential',
              format: 'jwt_vc',

              types: types,
              locations: [issuerurl],
            },
          ]),
          issuer_state, //: offerPayload?.grants.authorization_code?.issuer_state,
        },
        signal: AbortSignal.timeout(abortTimeout),
      });
    } catch (error) {
      console.log('error->' + error);
      throw new Error(JSON.stringify(error));
      //const e = error as unknown as AxiosError;
      //  TODO
      // if (e.response!.statusCode === 302) {
      //   requestUriRespData = e.response!.headers.value('location');
      // }
      // throw new Error('Error:' + JSON.stringify(e.response?.data));
      //return error;
    }

    // openid://?state=52b02b01-a5b6-4a0e-b394-15f36ef2befa&client_id=http%3A%2F%2Ftestissuer.acgoldman.com%3A3005%2Fv3%2Fauth&redirect_uri=http%3A%2F%2Ftestissuer.acgoldman.com%3A3005%2Fv3%2Fauth%2Fdirect_post&response_type=id_token&response_mode=direct_post&scope=openid&nonce=849e4484-b34c-4f2b-be4e-f31ed5e3172a&request_uri=http%3A%2F%2Ftestissuer.acgoldman.com%3A3005%2Fv3%2Fauth%2Frequest_uri%2Fe29de1d8-32f7-4a6a-85f7-3d14f3a45e7d
    const authReqResp = qs.parse(authresp.data.toString());

    if (authReqResp['error']) {
      console.error(authReqResp['error_description']);
      throw new Error(authReqResp['error_description'] as string);
    }
    const requestUri = authReqResp['request_uri'] as string;

    const redirectUri = authReqResp['redirect_uri'] as string;

    const authRespState = authReqResp['openid://?state'];
    const authRespTokenType = authReqResp['response_type'];
    const nonce = authReqResp['nonce'] as string;
    const client_id = authReqResp['client_id'] as string;
    const presentation_definition =
      authReqResp['presentation_definition'] &&
      JSON.parse(authReqResp['presentation_definition'] as string);

    const request = authReqResp['request'];
    let requestUriRespData;

    // if response is too long app needs to get data from request_uri
    if (requestUri) {
      const requestUriResp = await axios.get(requestUri, {
        signal: AbortSignal.timeout(abortTimeout),
      });
      requestUriRespData = requestUriResp.data;
      // if server sends request data directly app accepts request
    } else if (authReqResp.request) {
      requestUriRespData = authReqResp.request as string;
    } else {
      console.error('there neither request nor request_uri');
      throw new Error('there neither request nor request_uri');
    }
    // app gets server key
    const serverKey = await axios.get(`${authServer}/jwks`, {
      signal: AbortSignal.timeout(abortTimeout),
    });
    const decodedJwt: DecodedJWT = jwt_decode(requestUriRespData);

    const decodedJwtHeader: JWTHeader = jwt_decode(requestUriRespData, {
      header: true,
    });

    const serverJwk = serverKey.data['keys'][0];

    if (decodedJwtHeader['kid'] !== serverJwk['kid']) {
      console.error('Server kid is invalid');
      throw new Error('Server kid is invalid');
    }

    // verify
    // create a JsonWebKey for verifying the signature
    const privateKey = await jose.JWK.asKey(serverJwk, 'json');
    // create keysStore and add jwk
    const keystore = jose.JWK.createKeyStore();
    await keystore.add(privateKey);
    // create a JsonWebSignature verifier from the encoded string
    const verifier = jose.JWS.createVerify(keystore);
    const verified = await verifier.verify(requestUriRespData).catch((e: Error) => {
      console.error('Error during verify ', e);
      throw new Error('Error during verify ' + e);
    });

    if (!verified) {
      console.error('invalid ID or VP Token request signature');
      throw new Error('invalid ID or VP Token request signature');
    }

    return {
      authResp: authReqResp,
      decodedJwt: decodedJwt,
      codeVerifier,
      verifiedKey: verified,
      deferredEndpoint,
      state: authRespState,
      client_id,
      nonce,
      redirect_uri: redirectUri,
      presentation_definition,
      request,
    };
  }

  async getDirectPost(
    vpOrIdTokenData:
      | {
          vp_token: string;
          state?: string;
          presentation_submission?: string;
          verifier_email?: string;
          validity_period?: string;
        }
      | {
          id_token: jose.JWS.CreateSignResult;
          state: string;
        },
    redirect_uri: string
  ) {
    const directPostOptions = {
      method: 'POST',
      headers: this.headers,
      data: qs.stringify(vpOrIdTokenData),
      url: redirect_uri as string,
      signal: AbortSignal.timeout(abortTimeout),
    };

    console.log('directPostOptions =>', directPostOptions);
    try {
      const directPostResp = await axios(directPostOptions);
      console.log('api service directPostResp:', directPostResp);
      // let openidCode_redirect_uri;
      // if (this.isLogin) {
      //   openidCode_redirect_uri = `${process.env.REACT_APP_URL}/openid-code`;
      //   return {redirectUri: directPostResp.data};
      // }
      if ((directPostResp?.data as string).split('error=')[1]) {
        console.error(
          'direct post error',
          qs.parse((directPostResp?.data as string).split('error_description=')[1])
        );
        throw new Error(
          ' Direct post error: ' +
            qs.parse((directPostResp?.data as string).split('error_description=')[1])
        );
      } else {
        const directPostRespData = qs.parse((directPostResp?.data as string).split('?')[1]);

        console.log('directPostRespData string =>', directPostResp?.data);
        if (directPostResp?.data.includes('openid-code')) {
          return directPostRespData;
        } else {
          directPostRespData.redirect = 'redirect';
          return {redirectUri: directPostResp.data};
        }
      }
    } catch (error) {
      if (axios.isAxiosError<ValidationError, Record<string, unknown>>(error)) {
        console.log(error.status);
        console.error(error.response);
      } else {
        console.error(error);
      }
    }
  }

  async getAccessTokenData(authCode: string) {
    const postTokenData = {
      grant_type: 'authorization_code',
      client_id: this.walletinstance.getDID(),
      code: authCode,
      code_verifier: sessionStorage.getItem('codeVerifier') || codeVerifier,
    };

    const postTokenOpts = {
      method: 'POST',
      headers: this.headers,
      url:
        this.token_endpoint !== null
          ? (this.token_endpoint as string)
          : (sessionStorage.getItem('token_endpoint') as string),
      data: postTokenData,
      signal: AbortSignal.timeout(abortTimeout),
    };

    try {
      const accessTokenResp = await axios(postTokenOpts);
      console.log('accessTokenResp : ', accessTokenResp);
      return accessTokenResp.data;
    } catch (e) {
      console.error('Error in getting Access Token Data:', e);
      throw new Error('Error in getting Access Token Data:' + JSON.stringify(e));
    }
  }

  async getCredentialEndPointAndOptions(accessTokenRespData: {
    access_token: string;
    c_nonce: string;
    id_token: string;
  }) {
    const accessToken: string = accessTokenRespData['access_token'];
    const cNonce = accessTokenRespData['c_nonce'];

    const proofJwtPayload: Payload = {
      nonce: cNonce, //c_nonce from token response
      aud: sessionStorage.getItem('codeVerifier')
        ? (sessionStorage.getItem('issuerUrl') as string) // (sessionStorage.getItem('issuerUrl') as string)
        : (this.issuerUrl as string), //this.offerUrl as string, // "https://issuer-url",
      iat: new Date().getTime() / 1000,
      iss: this.walletinstance.getDID() as string,
    };

    const issuerTokenParameters: TokenParams = {
      didKey: this.walletinstance.getDID() as string,
      alg: 'ES256',
      privateKey: this.walletinstance.getKeys(),
    };
    try {
      const proofJwt = await generateToken(
        proofJwtPayload,
        issuerTokenParameters,
        'openid4vci-proof+jwt'
      );

      const offerTypesArray = sessionStorage.getItem('types')?.split(',');

      const postCredentialReqData = qs.stringify({
        format: 'jwt_vc',
        types: offerTypesArray ? offerTypesArray : this.types,
        proof: {
          proof_type: 'jwt',
          jwt: proofJwt,
        },
      });

      const postCredentialReqOptions: IPostCredentialReqOptions = {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + accessToken,
          'Content-type': 'application/json; charset=utf-8',
        },
        data: qs.parse(postCredentialReqData) as IPostCredentialReqOptions['data'],
        url: sessionStorage.getItem('codeVerifier')
          ? (sessionStorage.getItem('issuerUrlMeta') as string)
          : (this.issuerUrlCredential as string),
        // signal: AbortSignal.timeout(20000),
      };
      console.log('postCredentialReq Options: ', postCredentialReqOptions);
      // The response from POST will be a new vc (IN_TIME) or an acceptance_token (DEFERRED)

      return postCredentialReqOptions;
    } catch (e) {
      console.error('Error in getting Credential EndPoint And Options:', e);
      throw new Error('Error in getting Credential EndPoint And Options:' + JSON.stringify(e));
    }
  }

  async getAuthResponse(
    offerUrl: string,
    types: string[],
    offerPayloadGrants: CredentialOfferPayload['grants']
  ) {
    this.offerUrl = offerUrl;

    try {
      const authResponse = await this.getAuth(
        offerUrl,
        types,
        offerPayloadGrants.authorization_code?.issuer_state as string
      );
      const deferredEndpoint = authResponse && authResponse['deferredEndpoint'];
      const authResp = authResponse && authResponse['authResp'];
      const decodedJwt = authResponse && authResponse['decodedJwt'];
      const codeVerifier = authResponse && authResponse['codeVerifier'];
      const headerJwt = authResponse && (authResponse['verifiedKey'].header as JWTHeader);

      console.log('=======================');
      console.log('Api Service authResponse: ', authResponse);

      const toSignIdToken = (
        response: qs.ParsedQs | undefined,
        issuerTokenParameters: TokenParams
      ) => {
        const payload: Payload = {
          iss: issuerTokenParameters.didKey,
          sub: issuerTokenParameters.didKey,
          aud: decodedJwt!.client_id,
          exp: new Date().getTime() / 1000 + 1000 * 60 * 5,
          iat: new Date().getTime() / 1000,
          nonce: response!['nonce'] as string, //used in auth req
        };

        const signedToken = generateToken(payload, issuerTokenParameters, headerJwt!.typ);

        return signedToken;
      };

      const issuerTokenParameters: TokenParams = {
        didKey: this.walletinstance.getDID() as string,
        alg: headerJwt!.alg, //'ES256'
        privateKey: this.walletinstance.getKeys(),
      };

      const directPostData = {
        id_token: await toSignIdToken(authResp, issuerTokenParameters),
        state: decodedJwt!.state,
      };

      let isVpToken;

      if (authResp!['response_type'] === 'vp_token') {
        // VP Token case for presentation definition flow
        isVpToken = true;
        return {postCredentialReqOptions: null, deferredEndpoint, isVpToken, authResponse};
      } else {
        isVpToken = false;
      }

      console.log('===directPostData=====');
      console.log(directPostData);
      console.log('==authResp![redirect_uri]=');
      console.log(authResp!['redirect_uri']);

      const directPostRespData = await this.getDirectPost(
        directPostData,
        authResp!['redirect_uri'] as string
      );

      console.log('===============');
      console.log('response from /direct_post API');
      console.log(directPostRespData);
      console.log('is directPostRespData.redirectUri');
      directPostRespData && console.log(directPostRespData.redirectUri);
      console.log('===============');
      if (directPostRespData && directPostRespData.redirectUri) {
        return {
          redirectUri: directPostRespData.redirectUri,
          // redirect_uri: directPostRespData.redirect_uri as string,
          //redirect: directPostRespData.redirect,
        };
      } else {
        const authCode = (directPostRespData as {code: string; [key: string]: string}).code;

        if (authCode === 'sharedOK') {
          return {shared: 'success'};
        }

        // get access token
        // if 'authorization_code' was offered = TODO how to check?
        const grant_type = offerPayloadGrants;

        console.log('if grant_type has authorization_code?: ', 'authorization_code' in grant_type!);
        // if ( 'authorization_code' in grant_type!) {}

        const accessTokenResp = await this.getAccessTokenData(authCode as string);

        const postCredentialReqOptions = await this.getCredentialEndPointAndOptions(
          accessTokenResp
        );
        console.log('postCredentialReq Options: ', postCredentialReqOptions);

        return {postCredentialReqOptions, deferredEndpoint, isVpToken};
      }
    } catch (e) {
      console.error('Error get Auth response:', e);
      throw new Error('Error get Auth response:' + JSON.stringify(e));
    }
  }

  async getInTimeOrDeferredCredential(postCredentialReqOptions: IPostCredentialReqOptions) {
    console.log('API Service post Credential Request and options ->: ', postCredentialReqOptions);
    try {
      const credentialPostResp = await axios({
        ...postCredentialReqOptions,
        signal: AbortSignal.timeout(abortTimeout),
      });
      console.log('credential post response: ', credentialPostResp);
      return credentialPostResp.data;
    } catch (e) {
      console.error('Error: ', e);
    }
  }

  async getDeferredCredential({url, acceptance_token}: IGetVCReqOptions) {
    console.log('url credential_endpoint  / credential', url);
    const getDCOptions = {
      url,
      method: 'POST',
      headers: {
        authorization: `Bearer ${acceptance_token}`,
      },
    };
    const vc = await axios(getDCOptions);
    return vc.data;
  }

  async getWalletCardStatus(jwt: string, holderDID: string) {
    const walletDID = this.walletinstance.getDID();
    if (holderDID !== walletDID) {
      console.error('Wrong Holder DID');
      throw new Error('Wrong Holder DID');
    }

    const getStatusOptions = {
      url: `${process.env.REACT_APP_PDO_BACKEND_URL}/v3/verifier/verifyVC`,
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      data: {
        jwtvc: '' + jwt,
      },
      // timeout: 7000,
      signal: AbortSignal.timeout(abortTimeout),
    };

    let statusResp = null;

    try {
      statusResp = await axios(getStatusOptions);
    } catch (error) {
      console.error('Card status request error: ', error);
      throw new Error('card status error' as string);
    }

    if (statusResp?.data['error']) {
      console.error('Axios error: ', statusResp.data['error_description']);
      throw new Error(statusResp.data['error_description'] as string);
    }

    return statusResp?.data.status;
  }

  async getIssuers(type: string) {
    const getIssuersOptions = {
      url: `${process.env.REACT_APP_PDO_BACKEND_URL}/v3/verifier/known_issuers`,
      method: 'GET',
      signal: AbortSignal.timeout(abortTimeout),
    };

    let getIssuersResponse;

    try {
      getIssuersResponse = await axios(getIssuersOptions);
      if (getIssuersResponse?.data['error']) {
        console.error('Axios error: ', getIssuersResponse.data['error_description']);
        throw new Error(getIssuersResponse.data['error_description'] as string);
      }
    } catch (e) {
      console.error('Get known issuers API request error: ', e);
      return e;
    }

    const typedIssuers = getIssuersResponse?.data.filter(
      (issuer: typeIssuer) => issuer['supported_vc_type'] === type
    );

    return typedIssuers;
  }

  async getLicenseVC(pinCode: string) {
    const did = this.walletinstance.getDID();
    const getLicenseVCOptions = {
      url: `${process.env.REACT_APP_PDO_BACKEND_URL}/v3/tnt/get_license_vc?walletDID=${did}`,
      method: 'GET',
      signal: AbortSignal.timeout(abortTimeout),
    };

    let getLicenseVCResponse;
    try {
      getLicenseVCResponse = await axios(getLicenseVCOptions);
    } catch (e) {
      console.error('Get license request error: ', e);
      if ((e as unknown as AxiosError).code === 'ERR_CANCELED') {
        throw new Error('It is getting too long to get a response.');
      } else {
        throw new Error('get license vc error');
      }
    }
    if (!getLicenseVCResponse?.data) {
      throw new Error('empty response for get license VC request');
    }

    if (getLicenseVCResponse?.data['error']) {
      console.error('Axios error: ', getLicenseVCResponse.data['error_description']);
      throw new Error(getLicenseVCResponse.data['error_description'] as string);
    }

    if (!getLicenseVCResponse.data.startsWith('openid-credential-offer')) {
      console.error('GET license error: ', getLicenseVCResponse.data['error_description']);
      throw new Error('get license VC request response is not a credenial-offer');
    }

    const offer = getLicenseVCResponse.data as string;

    const {search} = new URL(offer);

    let credentialOfferPayload;
    let response: AxiosResponse<unknown>;

    const parsedCredentialOffer = qs.parse(search.slice(1)) as unknown as CredentialOffer;

    if (parsedCredentialOffer.credential_offer) {
      credentialOfferPayload = JSON.parse(
        parsedCredentialOffer.credential_offer
      ) as CredentialOfferPayload;
    } else if (parsedCredentialOffer.credential_offer_uri) {
      //get it
      const offerUri = JSON.parse(parsedCredentialOffer.credential_offer_uri) as unknown as {
        credential_offer_uri: string;
      };

      try {
        response = await axios.get(offerUri.credential_offer_uri, {timeout: 8000});
        credentialOfferPayload = response.data as CredentialOfferPayload;
      } catch (err) {
        console.error(err);
        throw new Error('get credential-offer error');
      }
    } else {
      throw new Error('response from TAO is not a valid credential-offer');
    }

    let issuerUri = credentialOfferPayload.credential_issuer;
    let offeredCredentials = credentialOfferPayload.credentials[0]?.types;

    if (!offeredCredentials?.includes('LicenseToOperate')) {
      throw new Error('VC Offered should be License To Operate');
    }

    let grants = credentialOfferPayload.grants as unknown as {
      'urn:ietf:params:oauth:grant-type:pre-authorized_code': {
        'pre-authorized_code': string;
        user_pin_required: true;
      };
    };

    if (!grants['urn:ietf:params:oauth:grant-type:pre-authorized_code']['pre-authorized_code']) {
      throw new Error('VC Offered not pre-authorized');
    }

    response = await axios.get(
      `${process.env.REACT_APP_PDO_BACKEND_URL}/v3/tnt/.well-known/openid-credential-issuer`
    );

    const credentialIssuerConfig = response.data as CredentialIssuerMetadata;

    if (!credentialIssuerConfig.authorization_server) {
      throw new Error('could not get authorization_server uri');
    }

    const authorizationServerUri = credentialIssuerConfig.authorization_server;

    response = await axios.get(`${authorizationServerUri}/.well-known/openid-configuration`); // /v3/auth/

    const authConfig = response.data as OPMetadata;

    const preAuthorizedCode = grants['urn:ietf:params:oauth:grant-type:pre-authorized_code']?.[
      'pre-authorized_code'
    ] as string;

    const tokenRequestQueryParams = {
      grant_type: 'urn:ietf:params:oauth:grant-type:pre-authorized_code',
      'pre-authorized_code': preAuthorizedCode,
      user_pin: pinCode,
    } satisfies PostTokenPreAuthorizedCodeDto;

    try {
      response = await axios.post(
        authConfig.token_endpoint,
        new URLSearchParams(tokenRequestQueryParams).toString(),
        {
          signal: AbortSignal.timeout(abortTimeout),
          headers: {'content-type': 'application/x-www-form-urlencoded'},
        }
      );
    } catch (err) {
      const axioserr = err as AxiosError;
      let message = 'error from token endpoint';
      console.error(axioserr.response?.data);
      if (axioserr.response?.data) {
        message = message + JSON.stringify(axioserr.response?.data);
      }

      throw new Error(message);
    }

    const {access_token: accessToken, c_nonce: cNonce} = response.data as TokenResponse;

    const expTime = 5 * 60 * 1000; // 5min = 300000 milliseconds;

    const tokenPayload = {
      nonce: cNonce,
      iss: did,
      sub: did,
      exp: Date.now() + expTime,
      iat: Date.now(),
      aud: issuerUri,
    };

    const tokenParams = {
      didKey: did,
      alg: 'ES256',
      privateKey: this.walletinstance.getKeys(),
    };

    const type = 'openid4vci-proof+jwt';
    const proofJwt = await generateToken(tokenPayload, tokenParams, type);

    const credentialRequestParams = {
      types: offeredCredentials,
      format: 'jwt_vc',
      proof: {
        proof_type: 'jwt',
        jwt: proofJwt,
      },
    };

    try {
      response = await axios.post(
        credentialIssuerConfig.credential_endpoint,
        credentialRequestParams,
        {
          headers: {authorization: `Bearer ${accessToken}`},
        }
      );
    } catch (err) {
      const axioserr = err as AxiosError;
      let message = 'error from credential endpoint';
      console.log(axioserr.response?.data);
      if (axioserr.response?.data) {
        message = message + JSON.stringify(axioserr.response?.data);
      }
      throw new Error(message);
    }

    const {credential} = response.data as CredentialResponse;

    return credential as VCtype['credential'];
  }

  async getLicenseStatus(jwt: string) {
    const getLicenseStatusOptions = {
      url: `${process.env.REACT_APP_PDO_BACKEND_URL}/v3/tnt/verifyVC`,
      method: 'POST',
      signal: AbortSignal.timeout(abortTimeout),
      headers: {'Content-Type': 'application/json'},
      data: {
        jwtvc: jwt,
      },
    };

    let getVerifyVCResponse;

    try {
      getVerifyVCResponse = await axios(getLicenseStatusOptions);
      if (getVerifyVCResponse?.data['error']) {
        console.error('Axios error: ', getVerifyVCResponse.data['error_description']);
        //throw new Error(getVerifyVCResponse.data['error_description'] as string);
        return 'error';
      }
    } catch (e) {
      console.error('Get known issuers API request error: ', e);
      return 'error';
    }

    return getVerifyVCResponse?.data.status;
  }

  async getRequiredEvents(productName: string) {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: `${process.env.REACT_APP_PDO_BACKEND_URL}/v3/tnt/products`,
      params: {productName},
    };

    const getRequiredEventsResponse = await this.request(config);

    return getRequiredEventsResponse?.data as ReqEventsRespType;
  }

  async getActiveActors(productName: string) {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: `${process.env.REACT_APP_PDO_BACKEND_URL}/v3/tnt/active_actors`,
      params: {productName},
    };

    const getActiveActorsResponse = await this.request(config);
    return getActiveActorsResponse?.data as Actor[];
  }

  async initNewBatch(initBanchDetails: initBanchType) {
    const initNewBatchPostOptions = {
      url: `${process.env.REACT_APP_PDO_BACKEND_URL}/v3/tnt/init_new_batch`,
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      data: initBanchDetails,
    };
    const initNewBatchResponse = await this.request(initNewBatchPostOptions);
    console.log('init batch resp: ', initNewBatchResponse);
    return initNewBatchResponse?.data as initBatchResponseType;
  }

  //GET /pendingBatches?productName&actordid&allowedEvent
  async getPendingBatches(productName: string, actordid: string, allowedEvent: string) {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: `${process.env.REACT_APP_PDO_BACKEND_URL}/v3/tnt/pendingBatches`,
      params: {productName, actordid, allowedEvent},
    };

    const getRequiredEventsResponse = await this.request(config);
    return getRequiredEventsResponse.data as pendingTaskType[];
  }

  async updateBatch(documentId: string, eventDetails: EventDetailsType, jwtvc: string) {
    const walletDID = this.walletinstance.getDID() as string;
    const privateKeyJwk = this.walletinstance.getKeys() as JWK;
    const audience = `${process.env.REACT_APP_PDO_BACKEND_URL}/v3/tnt`;
    const selectedjwtvcs = [jwtvc];
    const vpJwt = await getVerifiablePresentationJwt(
      audience,
      walletDID,
      selectedjwtvcs,
      privateKeyJwk
    );

    const config: AxiosRequestConfig = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      url: `${process.env.REACT_APP_PDO_BACKEND_URL}/v3/tnt/update_batch`,
      data: {
        documentId: documentId,
        eventDetails: eventDetails,
        vp_token: vpJwt,
        presentation_submission: presentationSubmission,
      },
    };

    const updateBatchResponse = await this.request(config);
    console.log('updateBatchResponse: ', updateBatchResponse);

    return updateBatchResponse.data as initBatchResponseType;
  }
}
