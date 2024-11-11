/**
 * A&A tests
 */
// TI
export const TI_REQUEST_VERIFIABLE_AUTHORISATION_TO_ONBOARD =
  "ti_request_verifiable_authorisation_to_onboard";
export const TI_REGISTER_DID = "ti_register_did";
export const TI_REQUEST_VERIFIABLE_ACCREDITATION_TO_ATTEST =
  "ti_request_verifiable_accreditation_to_attest";
export const TI_REGISTER_VERIFIABLE_ACCREDITATION_TO_ATTEST =
  "ti_register_verifiable_accreditation_to_attest";
export const TI_REQUEST_CT_REVOCABLE = "ti_request_ctrevocable";
export const TI_VALIDATE_CT_REVOCABLE = "ti_validate_ctrevocable";
export const TI_REVOKE_CT_REVOCABLE = "ti_revoke_ctrevocable";
// TAO
export const TAO_REQUEST_VERIFIABLE_ACCREDITATION_TO_ACCREDIT =
  "tao_request_verifiable_accreditation_to_accredit";
export const TAO_REGISTER_VERIFIABLE_ACCREDITATION_TO_ACCREDIT =
  "tao_register_verifiable_accreditation_to_accredit";
export const TAO_REQUEST_VERIFIABLE_AUTHORISATION_TO_ONBOARD_SUBACCOUNT =
  "tao_request_verifiable_authorisation_to_onboard_subaccount";
export const TAO_VALIDATE_VERIFIABLE_AUTHORISATION_TO_ONBOARD_SUBACCOUNT =
  "tao_validate_verifiable_authorisation_to_onboard_subaccount";
export const TAO_REQUEST_VERIFIABLE_ACCREDITATION_TO_ATTEST_SUBACCOUNT =
  "tao_request_verifiable_accreditation_to_attest_subaccount";
export const TAO_VALIDATE_VERIFIABLE_ACCREDITATION_TO_ATTEST_SUBACCOUNT =
  "tao_validate_verifiable_accreditation_to_attest_subaccount";
export const TAO_REQUEST_VERIFIABLE_ACCREDITATION_TO_ACCREDIT_SUBACCOUNT =
  "tao_request_verifiable_accreditation_to_accredit_subaccount";
export const TAO_VALIDATE_VERIFIABLE_ACCREDITATION_TO_ACCREDIT_SUBACCOUNT =
  "tao_validate_verifiable_accreditation_to_accredit_subaccount";
export const TAO_REVOKE_RIGHTS_SUBACCOUNT = "tao_revoke_rights_subaccount";
// Root TAO
export const RTAO_REQUEST_VERIFIABLE_AUTHORISATION_FOR_TRUST_CHAIN =
  "rtao_request_verifiableauthorisationfortrustchain";
export const RTAO_REGISTER_VERIFIABLE_AUTHORISATION_FOR_TRUST_CHAIN =
  "rtao_register_verifiableauthorisationfortrustchain";
// Qualification credential
export const REQUEST_CTAA_QUALIFICATION_CREDENTIAL =
  "request_ctaaqualificationcredential";
// All the A&A tests
export const ACCREDIT_AUTHORISE_TESTS = [
  TI_REQUEST_VERIFIABLE_AUTHORISATION_TO_ONBOARD,
  TI_REGISTER_DID,
  TI_REQUEST_VERIFIABLE_ACCREDITATION_TO_ATTEST,
  TI_REGISTER_VERIFIABLE_ACCREDITATION_TO_ATTEST,
  TI_REQUEST_CT_REVOCABLE,
  TI_VALIDATE_CT_REVOCABLE,
  TI_REVOKE_CT_REVOCABLE,
  TAO_REQUEST_VERIFIABLE_ACCREDITATION_TO_ACCREDIT,
  TAO_REGISTER_VERIFIABLE_ACCREDITATION_TO_ACCREDIT,
  TAO_REQUEST_VERIFIABLE_AUTHORISATION_TO_ONBOARD_SUBACCOUNT,
  TAO_VALIDATE_VERIFIABLE_AUTHORISATION_TO_ONBOARD_SUBACCOUNT,
  TAO_REQUEST_VERIFIABLE_ACCREDITATION_TO_ATTEST_SUBACCOUNT,
  TAO_VALIDATE_VERIFIABLE_ACCREDITATION_TO_ATTEST_SUBACCOUNT,
  TAO_REQUEST_VERIFIABLE_ACCREDITATION_TO_ACCREDIT_SUBACCOUNT,
  TAO_VALIDATE_VERIFIABLE_ACCREDITATION_TO_ACCREDIT_SUBACCOUNT,
  TAO_REVOKE_RIGHTS_SUBACCOUNT,
  RTAO_REQUEST_VERIFIABLE_AUTHORISATION_FOR_TRUST_CHAIN,
  RTAO_REGISTER_VERIFIABLE_AUTHORISATION_FOR_TRUST_CHAIN,
] as const;

/**
 * Holder wallet tests
 */
export const CT_WALLET_CROSS_IN_TIME = "ct_wallet_cross_in_time";
export const CT_WALLET_CROSS_DEFERRED = "ct_wallet_cross_deferred";
export const CT_WALLET_CROSS_PRE_AUTHORISED = "ct_wallet_cross_pre_authorised";
export const CT_WALLET_SAME_IN_TIME = "ct_wallet_same_in_time";
export const CT_WALLET_SAME_DEFERRED = "ct_wallet_same_deferred";
export const CT_WALLET_SAME_PRE_AUTHORISED = "ct_wallet_same_pre_authorised";
// Qualification credential
export const REQUEST_CT_WALLET_QUALIFICATION_CREDENTIAL =
  "request_ct_wallet_qualification_credential";
// All the Holder wallet tests
export const HOLDER_WALLET_TESTS = [
  CT_WALLET_CROSS_IN_TIME,
  CT_WALLET_CROSS_DEFERRED,
  CT_WALLET_SAME_IN_TIME,
  CT_WALLET_SAME_DEFERRED,
  CT_WALLET_CROSS_PRE_AUTHORISED,
  CT_WALLET_SAME_PRE_AUTHORISED,
] as const;

/**
 * Issue to holder tests
 */
export const ISSUE_TO_HOLDER_INITIATE_CT_WALLET_SAME_IN_TIME =
  "issue_to_holder_initiate_ct_wallet_same_in_time";
export const ISSUE_TO_HOLDER_VALIDATE_CT_WALLET_SAME_IN_TIME =
  "issue_to_holder_validate_ct_wallet_same_in_time";
export const ISSUE_TO_HOLDER_INITIATE_CT_WALLET_SAME_DEFERRED =
  "issue_to_holder_initiate_ct_wallet_same_deferred";
export const ISSUE_TO_HOLDER_VALIDATE_CT_WALLET_SAME_DEFERRED =
  "issue_to_holder_validate_ct_wallet_same_deferred";
export const ISSUE_TO_HOLDER_INITIATE_CT_WALLET_SAME_PRE_AUTHORISED =
  "issue_to_holder_initiate_ct_wallet_same_pre_authorised";
export const ISSUE_TO_HOLDER_VALIDATE_CT_WALLET_SAME_PRE_AUTHORISED =
  "issue_to_holder_validate_ct_wallet_same_pre_authorised";
// Qualification credential
export const REQUEST_CT_ISSUE_TO_HOLDER_QUALIFICATION_CREDENTIAL =
  "request_ct_issue_to_holder_qualification_credential";
// All the Issue to holder tests
export const ISSUE_TO_HOLDER_TESTS = [
  ISSUE_TO_HOLDER_INITIATE_CT_WALLET_SAME_IN_TIME,
  ISSUE_TO_HOLDER_VALIDATE_CT_WALLET_SAME_IN_TIME,
  ISSUE_TO_HOLDER_INITIATE_CT_WALLET_SAME_DEFERRED,
  ISSUE_TO_HOLDER_VALIDATE_CT_WALLET_SAME_DEFERRED,
  ISSUE_TO_HOLDER_INITIATE_CT_WALLET_SAME_PRE_AUTHORISED,
  ISSUE_TO_HOLDER_VALIDATE_CT_WALLET_SAME_PRE_AUTHORISED,
] as const;

/**
 * TnT tests
 */
export const VERIFIER_ID_TOKEN_EXCHANGE = "verifier_id_token_exchange";
export const VERIFIER_VP_VALID_VC = "verifier_vp_valid_vc";
export const VERIFIER_VP_EXPIRED_VC = "verifier_vp_expired_vc";
export const VERIFIER_VP_REVOKED_VC = "verifier_vp_revoked_vc";
export const VERIFIER_VP_NOT_YET_VALID_VC = "verifier_vp_not_yet_valid_vc";

// All the TnT tests
export const VERIFIER_TESTS = [
  VERIFIER_ID_TOKEN_EXCHANGE,
  VERIFIER_VP_VALID_VC,
  VERIFIER_VP_EXPIRED_VC,
  VERIFIER_VP_REVOKED_VC,
  VERIFIER_VP_NOT_YET_VALID_VC,
] as const;

/**
 * Intents list
 */
export const INTENTS_LIST = [
  // A&A
  ...ACCREDIT_AUTHORISE_TESTS,
  REQUEST_CTAA_QUALIFICATION_CREDENTIAL,
  // Holder wallet
  ...HOLDER_WALLET_TESTS,
  REQUEST_CT_WALLET_QUALIFICATION_CREDENTIAL,
  // Issue to holder
  ...ISSUE_TO_HOLDER_TESTS,
  REQUEST_CT_ISSUE_TO_HOLDER_QUALIFICATION_CREDENTIAL,
  // TnT
  ...VERIFIER_TESTS,
] as const;

// Issuer Types from TIR API v4
export const ISSUER_TYPES = [
  "undefined",
  "RootTAO",
  "TAO",
  "TI",
  "Revoked",
] as const;

// Generic credential types
export const REQUIRED_CREDENTIAL_TYPES = [
  "VerifiableCredential",
  "VerifiableAttestation",
] as const;

// A&A credential types
export const ACCREDIT_AND_AUTHORISE_CREDENTIAL_TYPES = [
  "VerifiableAuthorisationToOnboard",
  "VerifiableAuthorisationForTrustChain",
  "VerifiableAccreditation",
  "VerifiableAccreditationToAttest",
  "VerifiableAccreditationToAccredit",
  "CTAAQualificationCredential",
  "CTRevocable",
] as const;

// Credential types that follow that authorization code flow during the Holder wallet tests
export const HOLDER_WALLET_AUTHORIZATION_CODE_CREDENTIAL_TYPES = [
  "CTWalletSameInTime",
  "CTWalletCrossInTime",
  "CTWalletSameDeferred",
  "CTWalletCrossDeferred",
  "CTWalletQualificationCredential",
  "UNI_DEGREE",
  "GOV_ID",
  "LicenseToOperate",
  "bachelorDegree"
] as const;

// Credential types that follow that pre-authorized code flow during the Holder wallet tests
export const HOLDER_WALLET_PRE_AUTHORIZED_CODE_CREDENTIAL_TYPES = [
  "CTWalletSamePreAuthorised",
  "CTWalletCrossPreAuthorised",
] as const;

// Credential types the client can request the issuer to offer during the Holder wallet tests
export const HOLDER_WALLET_CREDENTIAL_TYPES = [
  ...HOLDER_WALLET_AUTHORIZATION_CODE_CREDENTIAL_TYPES,
  ...HOLDER_WALLET_PRE_AUTHORIZED_CODE_CREDENTIAL_TYPES,
] as const;

export const ISSUE_TO_HOLDER_CREDENTIAL_TYPES = [
  "CTIssueQualificationCredential",
] as const;

export const PDA1_CREDENTIAL_TYPES = ["VerifiablePortableDocumentA1"] as const;

// All the credential types
export const VALID_CREDENTIAL_TYPES = [
  ...REQUIRED_CREDENTIAL_TYPES,
  ...ACCREDIT_AND_AUTHORISE_CREDENTIAL_TYPES,
  ...HOLDER_WALLET_CREDENTIAL_TYPES,
  ...ISSUE_TO_HOLDER_CREDENTIAL_TYPES,
  ...PDA1_CREDENTIAL_TYPES,
] as const;
