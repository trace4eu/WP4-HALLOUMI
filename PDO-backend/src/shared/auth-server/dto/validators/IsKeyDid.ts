import {
  registerDecorator,
  buildMessage,
  ValidationOptions,
} from "class-validator";
import { util } from "@cef-ebsi/key-did-resolver";

export function IsKeyDid(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (object: Object, propertyName: string): void => {
    registerDecorator({
      name: "isKeyDid",
      target: object.constructor,
      propertyName,
      validator: {
        validate(value: string) {
          if (!value || typeof value !== "string") return false;

          try {
            util.validateDid(value);
            return true;
          } catch (e) {
            return false;
          }
        },
        defaultMessage: buildMessage(
          (eachPrefix) =>
            `${eachPrefix}$property must either be a valid DID using the Key DID method`,
          validationOptions
        ),
      },
    });
  };
}

export default IsKeyDid;
