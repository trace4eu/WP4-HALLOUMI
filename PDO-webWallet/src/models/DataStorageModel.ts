//import secureLocalStorage from 'react-secure-storage';
import { EncryptStorage } from 'encrypt-storage';

export default class DataStorageModel {

  constructor() {
    console.log('datastore');
  }

  secureLocalStorage: EncryptStorage | undefined;
  
  public initStorage(key:string) {
    try {
    this.secureLocalStorage = new EncryptStorage(key+'7890');
    console.log('datastore init');
    } catch (e) {
      console.log(e);
      if ((e as Error).message.includes('min 10') ) {
        throw Error('password must be at least 6 characters')

      }
      else throw Error(e as string);
    }
  }
  private setItem(itemName: string, item: string) {
    if (this.secureLocalStorage)
      this.secureLocalStorage.setItem(itemName, item)
    else {
      console.log("securestorage not initialized - not set->"+itemName);
      
    }
  }

  private getItem(itemName: string) {
    if (this.secureLocalStorage) {
      return this.secureLocalStorage.getItem(itemName);
      // const value= this.secureLocalStorage.getItem(itemName)
      // if (!value) return null;
      // else {
      //   try {
      //   if (typeof value === 'object')
      //     return JSON.stringify(value);
      //    else return value;
      //   } catch (e) {
      //     return value;
      //   }
      //  // return value;
      // }
    }
    else {
      console.log("securestorage not initialized - cannot get->"+itemName);
      return null;
    }
  }

  private removeItem(itemName: string) {
    if (this.secureLocalStorage)
    return this.secureLocalStorage.removeItem(itemName);
  }

  public clear() {
    if (this.secureLocalStorage) 
    this.secureLocalStorage.clear();
  }

  public storeVerifiedCredentials(verifiedCredentials: string): void {
    this.setItem('verifiedCredentials', verifiedCredentials);
  }

  public getStoredCredentials() {
    return this.getItem('verifiedCredentials');
  }

  public storeDeferredRequestsList(deferredCredentials: string): void {
    this.setItem('deferredCredentials', deferredCredentials);
  }

  public getDeferredRequestsList() {
    return this.getItem('deferredCredentials');
  }

  public storeDID(did: string): void {
    this.setItem('Did', did);
  }

  public getDID() {
    return this.getItem('Did');
  }

  public removeDID(): void {
    this.removeItem('Did');
  }

  public storeMnemonic(mnemonic: string): void {
    this.setItem('Mnemonic', mnemonic);
  }

  public getMnemonic() {
    return this.getItem('Mnemonic');
  }

  public storeJWT(token: string): void {
    this.setItem('Jwt', token);
  }

  public getJWT(): null | string {
    return this.getItem('Jwt') as string | null;
  }

  public removeJWT(): void {
    this.removeItem('Jwt');
  }

  public connectionNotEstablished(): boolean {
    return this.getItem('Jwt') === null || this.getItem('Jwt') === 'undefined';
  }

  public storeKeys(keys: string): void {
    console.log('store keys->'+keys);
    this.setItem('Keys', keys);
  }

  public getKeys() {
    const keys = this.getItem('Keys');
    console.log('keys->'+keys);
    if (!keys) {
      return null;
    }
    return keys;
  }

  public keysNotExist(): boolean {
    
    const keysnotexist=localStorage.getItem("Keys") === null;
    console.log('Wallet keys not exists->: ', keysnotexist);
    return keysnotexist;
  }

  public removeKeys(): void {
    this.removeItem('Keys');
  }

  public storeTerms(accept: boolean): void {
    localStorage.setItem('T&C', accept ? 'true' : 'false');
  }

  public getTerms(): boolean {
    if (localStorage.getItem('T&C') === null || localStorage.getItem('T&C') === 'undefined') {
      console.log('data storage model - getT&C', localStorage.getItem('T&C'));
      return false;
    }
    const response = localStorage.getItem('T&C');
    return response === 'true';
  }
}
