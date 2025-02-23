import {
  TAO_REQUEST_VERIFIABLE_ACCREDITATION_TO_ACCREDIT_SUBACCOUNT,
  TAO_REQUEST_VERIFIABLE_ACCREDITATION_TO_ATTEST_SUBACCOUNT,
  TAO_REQUEST_VERIFIABLE_AUTHORISATION_TO_ONBOARD_SUBACCOUNT,
  TAO_REVOKE_RIGHTS_SUBACCOUNT,
  TAO_VALIDATE_VERIFIABLE_ACCREDITATION_TO_ACCREDIT_SUBACCOUNT,
  TAO_VALIDATE_VERIFIABLE_ACCREDITATION_TO_ATTEST_SUBACCOUNT,
  TAO_VALIDATE_VERIFIABLE_AUTHORISATION_TO_ONBOARD_SUBACCOUNT,
  TI_REQUEST_CT_REVOCABLE,
  TI_REVOKE_CT_REVOCABLE,
  TI_VALIDATE_CT_REVOCABLE,
  VERIFIER_ID_TOKEN_EXCHANGE,
  VERIFIER_VP_EXPIRED_VC,
  VERIFIER_VP_NOT_YET_VALID_VC,
  VERIFIER_VP_REVOKED_VC,
  VERIFIER_VP_VALID_VC,
} from "../../shared/constants.js";

export const ISSUER_CHECKS_LIST = [
  TI_REQUEST_CT_REVOCABLE,
  TI_VALIDATE_CT_REVOCABLE,
  TI_REVOKE_CT_REVOCABLE,
  TAO_REQUEST_VERIFIABLE_AUTHORISATION_TO_ONBOARD_SUBACCOUNT,
  TAO_VALIDATE_VERIFIABLE_AUTHORISATION_TO_ONBOARD_SUBACCOUNT,
  TAO_REQUEST_VERIFIABLE_ACCREDITATION_TO_ATTEST_SUBACCOUNT,
  TAO_VALIDATE_VERIFIABLE_ACCREDITATION_TO_ATTEST_SUBACCOUNT,
  TAO_REQUEST_VERIFIABLE_ACCREDITATION_TO_ACCREDIT_SUBACCOUNT,
  TAO_VALIDATE_VERIFIABLE_ACCREDITATION_TO_ACCREDIT_SUBACCOUNT,
  TAO_REVOKE_RIGHTS_SUBACCOUNT,
  VERIFIER_ID_TOKEN_EXCHANGE,
  VERIFIER_VP_VALID_VC,
  VERIFIER_VP_EXPIRED_VC,
  VERIFIER_VP_REVOKED_VC,
  VERIFIER_VP_NOT_YET_VALID_VC,
] as const;

export const credential_offer = {
  
   credential_issuer:'',
   credentials: [
     {
       format:"jwt_vc",
       types: ['VerifiableCredential','VerifiableAttestation'],
       trust_framework:{
            name:'EBSI',
            type:'Acrreditation',
            id:''
        },   
     },
   ],
   //one of the two grants should be present
   grants:{"urn:ietf:params:oauth:grant-type:pre-authorized_code": {
                    "pre-authorized_code":'12345',
                     user_pin_required:false
                   },
            "authorization_code": {
               issuer_state:''
           }
          },
   flowtype:'',
   walleturl:''
  
  }

export default ISSUER_CHECKS_LIST;
