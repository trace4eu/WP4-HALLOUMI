
import { EbsiEnvConfiguration } from "@cef-ebsi/verifiable-credential";
import { CacheManagerOptions } from "@nestjs/cache-manager";
import { ConfigModule } from "@nestjs/config";
import Joi from "joi";

// List here all the values that will be returned by the config factory
export interface ApiConfig {
  network: "test" | "conformance";
  isVCRevokable: boolean;
  statusListId: string;
  identificationRequired: boolean;
  loginRequired:boolean;
  loginRequiredOpenID:boolean;
  walletUrl:string;
  supportedVC:string;
  requiredVCs:Array<string>;
  vcins_mode:string;
  apiPort: number;
  apiUrlPrefix: string;
  domain: string;
  backEndUrl: string;
  frontEndUrl:string;
  localOrigin: string;
  //ebsiEnvConfig: EbsiEnvConfiguration;
  logLevel: "silent" | "error" | "warn" | "info" | "verbose" | "debug";
  externalEbsiApiHealthCheck: string;
  requestTimeout: number;
  authPrivateKey: string;
  // testClientMockPrivateKey: string;
  // testClientMockKid: string;
  // testClientMockAccreditationUrl: string;
  // testClientMockProxyUrl: string;
  issuerPrivateKey: string;
  issuerKid: string;
  issuerAccreditationUrl: string;
  issuerProxyUrl: string;
  didRegistryApiUrl: string;
  didRegistryApiJsonrpcUrl: string;
  ledgerApiUrl: string;
  authorisationApiUrl: string;
  trustedIssuersRegistryApiUrl: string;
  trustedIssuersRegistryApiJsonrpcUrl: string;
  trustedPoliciesRegistryApiUrl: string;
  trustedAppsRegistryApiUrl: string;
  authorisationCredentialSchema: string;
  pda1CredentialSchema: string;
  lokiUrl: string;
  lokiAuthToken: string;
  lokiLogsLifetime: number;
  statusList2021CredentialSchemaUrl: string;
}

const HEALTH_CHECK_PATH = "/docs/";

// export const services = {
//   "did-registry": "v4",
//   "trusted-issuers-registry": "v4",
//   "trusted-policies-registry": "v3",
//   "trusted-schemas-registry": "v2",
// } satisfies EbsiEnvConfiguration["services"];

// export const DIDR_API_PATH = "/did-registry/v4/identifiers";
// export const DIDR_JSON_RPC_PATH = "/did-registry/v4/jsonrpc";
// export const LEDGER_API_PATH = "/ledger/v4/blockchains/besu";
// export const TIR_API_PATH = "/trusted-issuers-registry/v4/issuers";
// export const TIR_JSON_RPC_PATH = "/trusted-issuers-registry/v4/jsonrpc";
// export const TAR_API_PATH = "/trusted-apps-registry/v3/apps";
// export const TPR_API_PATH = "/trusted-policies-registry/v2/users";
// export const TSR_API_PATH = "/trusted-schemas-registry/v2/schemas";
// export const AUTH_API_PATH = "/authorisation/v3";

export const DIDR_API_PATH = "/did-registry/v5/identifiers";
export const DIDR_JSON_RPC_PATH = "/did-registry/v5/jsonrpc";
export const LEDGER_API_PATH = "/ledger/v4/blockchains/besu";
export const TIR_API_PATH = "/trusted-issuers-registry/v5/issuers";
export const TIR_JSON_RPC_PATH = "/trusted-issuers-registry/v5/jsonrpc";
export const TAR_API_PATH = "/trusted-apps-registry/v3/apps";
export const TPR_API_PATH = "/trusted-policies-registry/v3/users";
export const TSR_API_PATH = "/trusted-schemas-registry/v3/schemas";
export const AUTH_API_PATH = "/authorisation/v4";

// Config factory
// Note that process.env — for which provide typings in src/environment.d.ts —
// should have already been validated by Joi in src/app.module.ts
export const loadConfig = (): ApiConfig => {
  const {EBSI_ENV, DOMAIN } = process.env;

  const ebsiAuthority = DOMAIN.replace(/^https?:\/\//, "");

  return {
    isVCRevokable: (process.env.IS_VC_REVOKABLE=='true'),
    statusListId: (process.env.STATUS_LIST_ID || '1'),
    identificationRequired: (process.env.IDENTIFICATION_REQUIRED=='true'),
    loginRequired: (process.env.LOGIN_REQUIRED=='true'),
    loginRequiredOpenID: (process.env.LOGIN_REQUIRED_OPENID=='true'),
    walletUrl: process.env.WALLET_URL || '',
    supportedVC: process.env.SUPPORTED_VC || '',
    vcins_mode: process.env.VCINS_MODE || '',
    requiredVCs: process.env.REQUIRED_VCs?.replace(/\s+/g, '').split(",") || [],
    apiPort: parseInt(process.env.API_PORT || "3000", 10),
    apiUrlPrefix: process.env.API_URL_PREFIX || "/v3",
    domain: DOMAIN,
    network: EBSI_ENV,
    // ebsiEnvConfig: {
    //   network: EBSI_ENV,
    //   hosts: [ebsiAuthority],
    //   services,
    // },
    backEndUrl: process.env.BACK_END_URL || DOMAIN,
    frontEndUrl: process.env.FRONT_END_URL || DOMAIN,
    localOrigin: process.env.LOCAL_ORIGIN || "",
    logLevel: process.env.LOG_LEVEL || "info",
    externalEbsiApiHealthCheck: DOMAIN + HEALTH_CHECK_PATH,
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || "15000", 10),
    authPrivateKey: process.env.AUTH_PRIVATE_KEY,
    // testClientMockPrivateKey: process.env.TEST_CLIENT_PRIVATE_KEY || "",
    // testClientMockKid: process.env.TEST_CLIENT_KID || "",
    // testClientMockAccreditationUrl:
    //   process.env.TEST_CLIENT_ACCREDITATION_URL || "",
    // testClientMockProxyUrl: process.env.TEST_CLIENT_PROXY_URL || "",
    issuerPrivateKey: process.env.ISSUER_PRIVATE_KEY,
    issuerKid: process.env.ISSUER_KID,
    issuerAccreditationUrl: process.env.ISSUER_ACCREDITATION_URL,
    issuerProxyUrl: process.env.ISSUER_PROXY_URL,
    authorisationApiUrl: DOMAIN + AUTH_API_PATH,
    didRegistryApiUrl: DOMAIN + DIDR_API_PATH,
    didRegistryApiJsonrpcUrl: DOMAIN + DIDR_JSON_RPC_PATH,
    ledgerApiUrl: DOMAIN + LEDGER_API_PATH,
    trustedIssuersRegistryApiUrl: DOMAIN + TIR_API_PATH,
    trustedIssuersRegistryApiJsonrpcUrl: DOMAIN + TIR_JSON_RPC_PATH,
    trustedPoliciesRegistryApiUrl: DOMAIN + TPR_API_PATH,
    trustedAppsRegistryApiUrl: DOMAIN + TAR_API_PATH,
    authorisationCredentialSchema: `${DOMAIN}${TSR_API_PATH}/${process.env.AUTHORISATION_CREDENTIAL_SCHEMA_ID}`,
    pda1CredentialSchema: `${DOMAIN}${TSR_API_PATH}/${process.env.PDA1_CREDENTIAL_SCHEMA_ID}`,
    lokiAuthToken: process.env.LOKI_AUTH_TOKEN,
    lokiUrl: process.env.LOKI_URL,
    lokiLogsLifetime: parseInt(process.env.LOKI_LOGS_LIFETIME, 10),
    statusList2021CredentialSchemaUrl: `${DOMAIN}${TSR_API_PATH}/${process.env.STATUSLIST2021_CREDENTIAL_SCHEMA_ID}`,
  };
};

export const ApiConfigModule = ConfigModule.forRoot({
  envFilePath: [
    `.env.${process.env.NODE_ENV}.local`,
    `.env.${process.env.NODE_ENV}`,
    ".env.local",
    ".env",
  ],
  load: [loadConfig],
  validationSchema: Joi.object({
    // Common API variables
    NODE_ENV: Joi.string()
      .valid("development", "production", "test", "DiplomaIssuer", "https")
      .default("development"),
    EBSI_ENV: Joi.string().valid("test", "conformance").default("test"),
    API_PORT: Joi.string().default("3000"),
    IDENTIFICATION_REQUIRED: Joi.string().default("false"),
    LOGIN_REQUIRED: Joi.string().default("false"),
    WALLET_URL:Joi.string().uri().required(),
    SUPPORTED_VC:Joi.string().required(),
    REQUIRED_VCs:Joi.string(),
    VCINS_MODE:Joi.string().required(),
    LOGIN_REQUIRED_OPENID: Joi.string().default("false"),
    API_URL_PREFIX: Joi.string(),
    LOG_LEVEL: Joi.string().valid(
      "silent",
      "error",
      "warn",
      "info",
      "verbose",
      "debug"
    ),
    DOMAIN: Joi.string().uri().required(),
    LOCAL_ORIGIN: Joi.string().uri(),
    HEALTH_CHECK: Joi.string(),
    REQUEST_TIMEOUT: Joi.string(),
    // Variables specific to Conformance API
    BACK_END_URL: Joi.string().uri(),
    AUTH_PRIVATE_KEY: Joi.string().required(),
    // TEST_CLIENT_PRIVATE_KEY: Joi.string(),
    // TEST_CLIENT_KID: Joi.string(),
    // TEST_CLIENT_ACCREDITATION_URL: Joi.string(),
    // TEST_CLIENT_PROXY_URL: Joi.string(),
    ISSUER_PRIVATE_KEY: Joi.string().required(),
    ISSUER_KID: Joi.string().required(),
    ISSUER_ACCREDITATION_URL: Joi.string().uri().required(),
    AUTHORISATION_CREDENTIAL_SCHEMA_ID: Joi.string().required(),
    LOKI_AUTH_TOKEN: Joi.string().required(),
    LOKI_URL: Joi.string().required(),
    LOKI_LOGS_LIFETIME: Joi.string().required(),
    STATUSLIST2021_CREDENTIAL_SCHEMA_ID: Joi.string().required(),
  }),
});

export const cacheConfig: CacheManagerOptions = {
  ttl: 0,
  max: 10_000,
};


