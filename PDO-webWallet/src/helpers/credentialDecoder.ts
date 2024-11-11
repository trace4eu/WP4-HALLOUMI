import jwt_decode from 'jwt-decode';
import {randomBytes} from 'crypto-browserify';
import {IVC, vcCardTypes} from '../screens/Wallet';
import {CredentialStoredType, walletknownCategory, cardDetails} from '../types/typeCredential';

export default class CredentialDecoder {
  decodedCredential: IVC;
  formattedCredential: CredentialStoredType;

  constructor(encodedCredential: string) {
    this.decodedCredential = this.decode(encodedCredential);
    this.formattedCredential = this.formatCredential(encodedCredential, this.decodedCredential);
  }

  private decode(credential: string) {
    return jwt_decode(credential) as IVC;
  }

  private getVCDetails = (credential: IVC) => {
    const getGrade = () =>
      credential.vc.credentialSubject.achieved
        ?.map((item) => item.wasDerivedFrom?.map((nestedItem) => nestedItem.grade))
        .flat()
        .join(', ');

    if (credential.vc.type[2] === vcCardTypes.LICENSE_TO_OPERATE) {
      return {
        ownerDID: credential.vc.credentialSubject.id,
        legalName: credential.vc.credentialSubject.legalName,
        productName: credential.vc.credentialSubject.productName,
        allowedEvent: credential.vc.credentialSubject.allowedEvent,
        lastInChain: credential.vc.credentialSubject.lastInChain,
      };
    }

    if (credential.vc.type[2] === vcCardTypes.CITIZEN_ID) {
      return {
        ownerDID: credential.vc.credentialSubject.id, // credentialSubject.id
        familyName: credential.vc.credentialSubject.familyName,
        firstName: credential.vc.credentialSubject.firstName,
        dateOfBirth: credential.vc.credentialSubject.dateOfBirth,
        personalIdentifier: credential.vc.credentialSubject.personalIdentifier,
      };
    }
    if (credential.vc.type[2] === vcCardTypes.BACHELOR_DEGREE) {
      return {
        ownerDID: credential.vc.credentialSubject.id, // credentialSubject.id
        familyName: credential.vc.credentialSubject.familyName,
        firstName: credential.vc.credentialSubject.firstName,
        dateOfBirth: credential.vc.credentialSubject.dateOfBirth,
        identifier: credential.vc.credentialSubject.identifier?.value,
        title: credential.vc.credentialSubject.achieved?.map((item) => item.title).join(', '),
        grade: getGrade(),
      };
    }
    if (credential.vc.type[2] === vcCardTypes.LICENSE_TO_PRACTICE) {
      return {
        ownerDID: credential.vc.credentialSubject.id, // credentialSubject.id
        familyName: credential.vc.credentialSubject.familyName,
        firstName: credential.vc.credentialSubject.firstName,
        registrationNumber: credential.vc.credentialSubject.registrationNumber,
        licensedFor: credential.vc.credentialSubject.licensedFor,
        licenseCode: credential.vc.credentialSubject.licenseCode,
      };
    }
  };

  private formatCredential(encodedCredential: string, credential: IVC) {
    const IMAGES_PATH = '/images/';
    let did: string;

    if (typeof credential.vc.issuer === 'object') {
      did = credential.vc.issuer.id;
    } else {
      did = credential.vc.issuer;
    }

    const storedcredential = {
      id: randomBytes(32).toString('hex'),
      jwt: encodedCredential,
      type: credential.vc.type[2] as CredentialStoredType['type'],
      category:
        credential.vc.type[2] === vcCardTypes.LICENSE_TO_OPERATE
          ? 'professional'
          : ('issuanceCertificate' as walletknownCategory),
      // credential.vc.type[2] === vcCardTypes.CITIZEN_ID
      //   ? 'id'
      //   : credential.vc.type[2] === vcCardTypes.BACHELOR_DEGREE
      //   ? 'education'
      //   : credential.vc.type[2] === vcCardTypes.LICENSE_TO_PRACTICE
      //   ? 'professional'
      //   : ('issuanceCertificate' as walletknownCategory), //CredentialStoredType['category']),
      image: IMAGES_PATH + 'card' + credential.vc.type[2] + '.jpg', // url from public images
      issuerName: typeof credential.vc.issuer !== 'string' ? credential.vc.issuer.legalName : '',
      issuer: typeof credential.vc.issuer !== 'string' ? credential.vc.issuer : undefined,
      issuerDID: did, //credential.vc.issuer,
      issuanceDate: credential.vc.issuanceDate,
      expirationDate: credential.vc.expirationDate ? credential.vc.expirationDate : undefined,
      vcDetails: this.getVCDetails(credential) as cardDetails,
    };

    return storedcredential;
  }
}
