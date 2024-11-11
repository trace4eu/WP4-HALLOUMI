import {
  registerDecorator,
  buildMessage,
  ValidationOptions,
} from "class-validator";
import { util } from "@cef-ebsi/key-did-resolver";
import isUrl from "validator/lib/isURL.js";

export function IsDidOrUrl(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (object: Object, propertyName: string): void => {
    registerDecorator({
      name: "isDidOrUrl",
      target: object.constructor,
      propertyName,
      validator: {
        validate(value: string) {
          if (!value || typeof value !== "string") return false;

          if (value.startsWith("did:")) {
            try {
              util.validateDid(value);
              return true;
            } catch (e) {
              return false;
            }
          }

          return isUrl.default(value, {
            // Allow "localhost"
            require_tld: false,
            // Allow custom protocols
            require_valid_protocol: false,
            // Protocol must be present
            require_protocol: true,
            // Allow underscore in host name
            allow_underscores: true,
          });
        },
        defaultMessage: buildMessage(
          (eachPrefix) =>
            `${eachPrefix}$property must either be a URL or a DID using the key DID method`,
          validationOptions
        ),
      },
    });
  };
}

export default IsDidOrUrl;
