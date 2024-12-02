import {CredentialStoredType, issuanceCertificateCardDetails} from '../types/typeCredential';
import WalletModel from '../models/WalletModel';
import {DefferedCredentialType} from '../screens/DeferredCredentials';

class CredentialStorageHelper {
  // to store IN_TIME issued VC in local storage
  storeVC(storeFormatVC: CredentialStoredType, walletModel: WalletModel) {
    const verifiedCredentialsFromLocalStorage = walletModel?.getStoredCredentials();
    const storedVCs: CredentialStoredType[] =
      (verifiedCredentialsFromLocalStorage && verifiedCredentialsFromLocalStorage.length > 0)
        ? verifiedCredentialsFromLocalStorage
        : [];

    // 'credential' in verifiedCredential && storedVCs.push(storeFormatVC);
    storedVCs.push(storeFormatVC);
    console.log('after adding new credential->'+storedVCs);
    walletModel?.storeVerifiedCredentials(JSON.stringify(storedVCs));
  }

  //to check and replace any existing vc
  // with the same productName and allowedEvent as the new vc

  updateVC(newVC: CredentialStoredType, walletModel: WalletModel) {
    const storedCredentials = walletModel?.getStoredCredentials() as CredentialStoredType[] || [];
    const updatedCredentials = storedCredentials.map((vc) => {
      const details = vc.vcDetails as issuanceCertificateCardDetails;
      if (
        details.productName === (newVC.vcDetails as issuanceCertificateCardDetails).productName &&
        details.allowedEvent === (newVC.vcDetails as issuanceCertificateCardDetails).allowedEvent
      ) {
        // Replace the existing VC with newVC
        return newVC;
      }
      return vc;
    });
    walletModel?.storeVerifiedCredentials(JSON.stringify(updatedCredentials));
  }

  // store DEFERRED Credential in local storage
  storeDeferredCredential(newCredential: DefferedCredentialType, walletModel: WalletModel) {
    // get deferred_credentials  json array from local storage (if exists)
    console.log(
      'existing deferred_credentials array in local storage => ',
      walletModel?.getDeferredRequestsList()
    );

    const deferredCredentials = walletModel?.getDeferredRequestsList();
    //const deferredCredentials = localStoredCredentials && localStoredCredentials;
    if (deferredCredentials && deferredCredentials.length) {
      //add a new entry to deferred_credentials array
      const newDeferredCredentials = [...deferredCredentials, newCredential];
      // Update deferred_credentials array in storage
      walletModel?.storeDeferredRequestsList(JSON.stringify(newDeferredCredentials));
      console.log(
        'updated deferred_credentials array in local storage => ',
        walletModel?.getDeferredRequestsList()
      );
    } else {
      walletModel?.storeDeferredRequestsList(JSON.stringify([newCredential]));
      console.log(
        'newly added deferred_credentials array in local storage => ',
        walletModel?.getDeferredRequestsList()
      );
    }
  }
}

export default new CredentialStorageHelper();
