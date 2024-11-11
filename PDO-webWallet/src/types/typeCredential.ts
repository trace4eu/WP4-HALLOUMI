export type walletKnownCard =
  // | 'CitizenId'
  // | 'bachelorDegree'
  // | 'WalletCredential'
  // | 'LicenseToPractice'
  'LicenseToOperate';

export type walletknownCategory =
  // | 'id'
  // | 'education'
  // | 'selfCertificates'
  'professional' | 'issuanceCertificate';

// export type idCardDetails = {
//   ownerDID: string;
//   familyName: string;
//   firstName: string;
//   dateOfBirth: string;
//   personalIdentifier: string;
// };

// export type educationCardDetails = {
//   ownerDID: string;
//   familyName: string;
//   firstName: string;
//   identifier: string;
//   title: string;
//   grade: string;
// };

// export type professionalCardDetails = {
//   ownerDID: string;
//   familyName: string;
//   firstName: string;
//   registrationNumber: string;
//   licensedFor: string[];
//   licenseCode: string;
// };

export type issuanceCertificateCardDetails = {
  ownerDID: string;
  legalName: string;
  productName: string;
  allowedEvent: string;
  lastInChain: boolean;
};

export type cardDetails =
  // | idCardDetails
  // | educationCardDetails
  // | professionalCardDetails
  issuanceCertificateCardDetails;

export type vcIssuer = {
  id: string; //"did:ebsi:ziDnioxYYLW1a3qUbqTFz4W",
  type: string; // "organisation",
  legalName: string; //"University ABC",
  domainName: string; //"https://university.abc"
};

export type CredentialStoredType = {
  id: string;
  jwt: string;
  type: walletKnownCard; //  'LicenseToOperate';
  category: walletknownCategory;
  image: string; // url from assets
  issuer?: vcIssuer;
  issuerName: string;
  issuerDID: string; // iss
  // ownerDID: string; // credentialSubject.id
  issuanceDate: Date;
  expirationDate?: Date;
  vcDetails: cardDetails; //data in vc.credentialSubject
};

interface DisplayInfo {
  name: string;
  locale: string;
}

interface TrustFramework {
  name: string;
  type: string;
  uri: string;
}

interface CredentialSupport {
  format: string;
  types: string[];
  trust_framework: TrustFramework;
  display: DisplayInfo[];
}

export type CredentialIssuerMetadata = {
  credential_issuer: string;
  authorization_server: string;
  credential_endpoint: string;
  deferred_credential_endpoint: string;
  credentials_supported: CredentialSupport[];
};

interface SupportedVpFormats {
  alg_values_supported: string[];
}

interface VpFormatsSupported {
  jwt_vp: SupportedVpFormats;
  jwt_vc: SupportedVpFormats;
}

interface RequestAuthenticationMethodsSupported {
  authorization_endpoint: string[];
}

export type OPMetadata = {
  redirect_uris: string[];
  issuer: string;
  authorization_endpoint: string;
  legacy_authorization_endpoint: string;
  token_endpoint: string;
  legacy_token_endpoint: string;
  jwks_uri: string;
  scopes_supported: string[];
  response_types_supported: string[];
  response_modes_supported: string[];
  grant_types_supported: string[];
  subject_types_supported: string[];
  id_token_signing_alg_values_supported: string[];
  request_object_signing_alg_values_supported: string[];
  request_parameter_supported: boolean;
  request_uri_parameter_supported: boolean;
  token_endpoint_auth_methods_supported: string[];
  request_authentication_methods_supported: RequestAuthenticationMethodsSupported;
  vp_formats_supported: VpFormatsSupported;
  subject_syntax_types_supported: string[];
  subject_syntax_types_discriminations: string[];
  subject_trust_frameworks_supported: string[];
  id_token_types_supported: string[];
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  id_token: string;
  c_nonce: string;
  c_nonce_expires_in: number;
};

export type CredentialResponse = {
  format: 'jwt_vc';
  credential: 'string';
};
