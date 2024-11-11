import {PresentationDefinitionType} from '../types/presentationDefinitionType';
import {CredentialStoredType, walletKnownCard} from '../types/typeCredential';

export class Constraints {
  private static cards: Array<CredentialStoredType['type']> = [];
  static requestedCredentialsIds: string[] = [];

  private static getFilterConstraints(obj: {
    [key: string]: string | Object | (string | Object)[]; // whatever type
  }) {
    for (let k in obj) {
      if (typeof obj[k] === 'object' && obj[k] !== null) {
        if (k === 'input_descriptors') {
          (obj[k] as Array<{constraints: {}; id: string}>).forEach(
            (item: {constraints: {}; id: string}) => {
              Constraints.requestedCredentialsIds.push(item.id);
            }
          );
        }
        if (k === 'filter') {
          Constraints.cards.push((obj[k] as {contains: {const: walletKnownCard}}).contains.const);
        } else {
          Constraints.getFilterConstraints(
            obj[k] as {
              [key: string]: string | Object | (string | Object)[]; // whatever type
            }
          );
        }
      }
    }
  }

  static getConstraintCards(definition: PresentationDefinitionType) {
    Constraints.getFilterConstraints(definition);

    return Constraints.cards;
  }
}
