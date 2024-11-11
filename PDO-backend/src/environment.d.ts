// Provide typings for process.env
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      EBSI_ENV: "test" | "conformance";
      API_PORT?: string;
      IS_VC_REVOKABLE?: string;
      STATUS_LIST_ID?: string;
      IDENTIFICATION_REQUIRED?: string;
      LOGIN_REQUIRED?: string;
      LOGIN_REQUIRED_OPENID?: string;
      WALLET_URL?:string;
      SUPPORTED_VC?:string;
      REQUIRED_VCs?:string;
      VCINS_MODE?:string;
      API_URL_PREFIX?: string;
      LOG_LEVEL?: "silent" | "error" | "warn" | "info" | "verbose" | "debug";
      DOMAIN: string;
      BACK_END_URL?: string;
      FRONT_END_URL?:string;
      LOCAL_ORIGIN?: string;
      REQUEST_TIMEOUT?: string;
      AUTH_PRIVATE_KEY: string;
      // TEST_CLIENT_PRIVATE_KEY: string;
      // TEST_CLIENT_KID: string;
      // TEST_CLIENT_ACCREDITATION_URL: string;
      // TEST_CLIENT_PROXY_URL: string;
      ISSUER_PRIVATE_KEY: string;
      ISSUER_KID: string;
      ISSUER_ACCREDITATION_URL: string;
      ISSUER_PROXY_URL:string;
      AUTHORISATION_CREDENTIAL_SCHEMA_ID: string;
      PDA1_CREDENTIAL_SCHEMA_ID: string;
      STATUSLIST2021_CREDENTIAL_SCHEMA_ID: string;
      TEST_ENV?: string;
      LOKI_AUTH_TOKEN: string;
      LOKI_URL: string;
      LOKI_LOGS_LIFETIME: string;
    }
  }
}

export {};
