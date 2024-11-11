import type {
  ConstraintsV2,
  FieldV2,
  FilterV2,
  InputDescriptorV2,
  PresentationDefinitionV2,
} from "@sphereon/pex-models";

import type { JSONSchema7 } from "json-schema";
//import type { JWKWithKid } from "../utils";
//import type { AuthorizationDetails } from "../validators";



/**
 * An Authentication Error Response is an OAuth 2.0 Authorization Error Response message returned
 * from the OP's Authorization Endpoint in response to the Authorization Request message sent by
 * the RP.
 *
 * @see https://openid.net/specs/openid-connect-core-1_0.html#AuthError
 * @see https://www.rfc-editor.org/rfc/rfc6749#section-4.1.2.1
 */
export interface AuthenticationErrorResponse {
  /**
   * Error code.
   */
  error:
    | "invalid_request"
    | "unauthorized_client"
    | "access_denied"
    | "unsupported_response_type"
    | "invalid_scope"
    | "server_error"
    | "temporarily_unavailable"
    // OpenID Connect additional codes
    | "interaction_required"
    | "login_required"
    | "account_selection_required"
    | "consent_required"
    | "invalid_request_uri"
    | "invalid_request_object"
    | "request_not_supported"
    | "request_uri_not_supported"
    | "registration_not_supported";

  /**
   * Human-readable ASCII encoded text description of the error.
   */
  error_description?: string;

  /**
   * URI of a web page that includes additional information about the error.
   */
  error_uri?: string;

  /**
   * OAuth 2.0 state value.
   * REQUIRED if the Authorization Request included the state parameter.
   * Set to the value received from the Client.
   */
  state?: string;
}




/**
 * Fix PEX models
 */

// Extend "FilterV2" type with JSONSchema7
export type Filter = FilterV2 & JSONSchema7;

export interface Field extends FieldV2 {
  filter?: Filter;
}

export interface Constraints extends ConstraintsV2 {
  fields?: Array<Field>;
}

export interface InputDescriptor extends InputDescriptorV2 {
  constraints?: Constraints;
}

export interface PresentationDefinition extends PresentationDefinitionV2 {
  input_descriptors: Array<InputDescriptor>;
}
