import {CredentialStoredType, issuanceCertificateCardDetails} from '../types/typeCredential';

export type displayCardType = {
  'Legal Name: ': string;
  'Product Name: ': string;
  'Expiration date: ': string;
  'Issue date: ': string;
  // 'Owner DID: ': string;
  'Issuer Name: '?: string;
  'Issuer DID: ': string;
  'Holder DID: ': string;
  'Allowed Event: ': string;
  'Last In Chain: ': string;
};

export class CardDetailsDisplay {
  public static convert(card: CredentialStoredType) {
    const details = card.vcDetails as issuanceCertificateCardDetails;

    const displayCard: displayCardType = {
      'Legal Name: ': details.legalName,
      'Product Name: ': details.productName,
      'Expiration date: ': card.expirationDate
        ? CardDetailsDisplay.formatDate(card.expirationDate)
        : 'n/a',
      'Issue date: ': CardDetailsDisplay.formatDate(card.issuanceDate),
      'Allowed Event: ': details.allowedEvent,
      'Last In Chain: ': details.lastInChain ? 'yes' : 'no',
      // 'Owner DID: ': details.ownerDID,
      'Holder DID: ': 'this wallet DID',
      'Issuer DID: ': card.issuerDID,
    };

    if (card.issuerName.length > 0) {
      displayCard['Issuer Name: '] = card.issuerName;
    }

    return displayCard;
  }

  static formatDate(date: Date) {
    return new Date(date).toISOString().slice(0, 10).split('-').reverse().join('-');
  }
}
