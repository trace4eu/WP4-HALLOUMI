//import crypto from "node:crypto";
import {JWK, base64url, exportJWK, type KeyLike, generateKeyPair} from 'jose';
import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';
import ecc from '@bitcoinerlab/secp256k1';
import {util} from '@cef-ebsi/key-did-resolver';
import elliptic from 'elliptic';
import jwt_decode from 'jwt-decode';
import {saveAs} from 'file-saver';
import DataStorageModel from './DataStorageModel';
import UiDate from '../helpers/uiDate';
import {credentialsAddAll} from '../features/credentialSlice';
import {CredentialStoredType} from '../types/typeCredential';
import {IVC} from '../screens/Wallet';
//import cryptoKeys from '../helpers/cryptocurrency_keys';
//import cryptoKeys from '../helpers/cryptocurrency_keys_test';
import cryptoKeys from '../helpers/cryptoKeys';
//import cryptoKeys from '../helpers/cryptoKeys_test';
// import { useAppDispatch } from '../features/hooks';
// import { CredentialStoredType } from 'types/typeCredential';
window.Buffer = window.Buffer || require('buffer').Buffer;
import { Alg } from "../interfaces/utils.interface";


// interface IEncryption {
//   cipherText: ArrayBuffer;
//   authenticationTag: ArrayBuffer;
// }

interface IEncryption {
  cipherText: string;
  authenticationTag: string;
  fromMobile: string;
}

interface KeyPairJwk {
  id: string;
  kid: string;
  privateKeyJwk: JWK;
  publicKeyJwk: JWK;
  publicKeyEncryptionJwk: JWK;
  privateKeyEncryptionJwk: JWK;
}

async function generateKeys(alg: string): Promise<{
  publicKeyJwk: JWK;
  privateKeyJwk: JWK;
}> {
  const keys = await generateKeyPair(alg, {extractable:true});
  return {
    publicKeyJwk: await exportJWK(keys.publicKey),
    privateKeyJwk: await exportJWK(keys.privateKey),
  };
  // const keysJWK = {
  //   publicKeyJwk: await exportJWK(keys.publicKey),
  //   privateKeyJwk: await exportJWK(keys.privateKey),
  // }
  // return keysJWK;
}

// export async function generateKeysEncryption(alg: string): Promise<{
//   publicKeyEncryptionJwk: JWK;
//   privateKeyEncryptionJwk: JWK;
// }> {
//   let keys: {
//     publicKey: KeyLike | crypto.KeyObject;
//     privateKey: KeyLike | crypto.KeyObject;
//   };
//   if (alg === "EdDSA") {
//     keys = crypto.generateKeyPairSync("x25519");
//   } else {
//     keys = await generateKeyPair(alg);
//   }

//   return {
//     publicKeyEncryptionJwk: await exportJWK(keys.publicKey),
//     privateKeyEncryptionJwk: await exportJWK(keys.privateKey),
//   };
// }

function getPublicKeyJwk(jwk: JWK, alg: string): JWK {
  switch (alg) {
    case "ES256K":
    case "ES256":
    case "EdDSA": {
      const { d, ...publicJwk } = jwk;
      return publicJwk;
    }
    case "RS256": {
      const { d, p, q, dp, dq, qi, ...publicJwk } = jwk;
      return publicJwk;
    }
    default:
      throw new Error(`Algorithm ${alg} not supported`);
  }
}



export default class WalletModel extends DataStorageModel {
  keys: {
    ES256K?: KeyPairJwk;
    ES256?: KeyPairJwk;
    RS256?: KeyPairJwk;
    EdDSA?: KeyPairJwk;
  };
  
  constructor() {
    super();
    this.keys = {};
    console.log('walletmodel init');
  }

  private createDID(key: JWK): void {
    const did = util.createDid(key);
    this.storeDID(did);
    console.log('WE are in createDID and did is: ', did);
  }

  // private createKeyFromMnemonic(existedMnemonic: string | null) {
  //   const mnemonic = existedMnemonic != null ? existedMnemonic : this.generateMnemonic();
  //   const seed = bip39.mnemonicToSeedSync(mnemonic);
  //   const ec = new elliptic.ec('p256');
  //   // const ec = new elliptic.ec('secp256k1');
  //   const bip32 = BIP32Factory(ecc);
  //   const rootKey = bip32.fromSeed(seed); //Instance of 'BIP32'

  //   const path = "m/44'/5467'/0'/1'";
  //   const childNode = rootKey.derivePath(path);

  //   const iterable = childNode.privateKey!;
  //   const seedBytes = new Uint8Array(iterable);

  //   const toHexString = (bytes: Uint8Array) =>
  //     bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

  //   const epk = toHexString(seedBytes);

  //   //Instance of 'PrivateKey'
  //   const privateKey = ec.keyFromPrivate(seedBytes);
  //   const publicKeyHex = privateKey.getPublic('hex').substring(2);

  //   // Convert a hex string to a byte array
  //   const hexToBytes = (hexString: string) =>
  //     Uint8Array.from(hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));

  //   const ad = hexToBytes(epk);
  //   const d = base64url.encode(ad).substring(0, 43);
  //   const mx = publicKeyHex.substring(0, 64);
  //   const ax = hexToBytes(mx);
  //   const x = base64url.encode(ax).substring(0, 43);
  //   const my = publicKeyHex.substring(64);
  //   const ay = hexToBytes(my);
  //   const y = base64url.encode(ay).substring(0, 43);

  //   const jwkPrivateKey = {
  //     crv: 'P-256',
  //     d: d,
  //     kty: 'EC',
  //     x: x,
  //     y: y,
  //     // alg: 'ES256',
  //     // ext: true,
  //   };

  //   this.storeKeys(JSON.stringify(jwkPrivateKey));
  //   return jwkPrivateKey;
  // }

  // private generateMnemonic(): string {
  //   const mnemonic = bip39.generateMnemonic();

  //   //console.log('mnemonic ', mnemonic);

  //   this.storeMnemonic(mnemonic);

  //   return mnemonic;
  // }

  // public initWithMnemonic(password: string): void {
  //   if (!password) {
  //     throw new Error('Password needs to be provided');
  //   }

  //   this.initStorage(password);
  //   this.storeJWT('success!');
  //   const mnemonic = this.getMnemonic();
  //  // console.log('mnemonic->' + mnemonic);
  //   const privateKey = this.createKeyFromMnemonic(mnemonic as string | null);
  //   this.createDID(privateKey);
  // }


  //---keyPair-----

  async createRandom(alg: Alg): Promise<JWK> {
    const { privateKeyJwk } = await generateKeys(alg);
   // await this.setJwk(alg, privateKeyJwk);
   this.storeKeys(JSON.stringify(privateKeyJwk));
    return privateKeyJwk;
  }
  
  // async setJwk(alg: Alg, privateKeyJwk: JWK): Promise<void> {
  //   let privateKeyEncryptionJwk: JWK;
  //   let publicKeyEncryptionJwk: JWK;
  //   const publicKeyJwk = getPublicKeyJwk(privateKeyJwk, alg);
  //   if (alg === "ES256K") {
  //     privateKeyEncryptionJwk = privateKeyJwk;
  //     publicKeyEncryptionJwk = publicKeyJwk;
  //   } else {
  //     const pair = await generateKeysEncryption(alg);
  //     privateKeyEncryptionJwk = pair.privateKeyEncryptionJwk;
  //     publicKeyEncryptionJwk = pair.publicKeyEncryptionJwk;
  //   }
  //   this.keys[alg] = {
  //     id: "",
  //     kid: "",
  //     privateKeyJwk,
  //     publicKeyJwk,
  //     privateKeyEncryptionJwk,
  //     publicKeyEncryptionJwk,
  //   };
  // }

  public async initWithRandomPrivKey(password: string): Promise<void> {
    if (!password) {
      throw new Error('Password needs to be provided');
    }

    this.initStorage(password);
    this.storeJWT('success!');
   // console.log('privateKey' + privateKey);
    // const privateKey = this.createKeyFromMnemonic(mnemonic as string | null);
    const privateKey = await this.createRandom("ES256");
    // const privateKey = this.generateKeys(ES256);
    this.createDID(privateKey);
  }

  //--------

  // public importWithMnemonic(password: string, mnemonic: string): void {
  //   if (!password) {
  //     throw new Error('Password needs to be provided');
  //   }

  //   if (!mnemonic) {
  //     throw new Error('mnemonic needs to be provided');
  //   }

  //   this.initStorage(password);
  //   this.storeJWT('success!');
    
  //   //console.log('mnemonic->' + mnemonic);
  //   this.storeMnemonic(mnemonic);
  //   const privateKey = this.createKeyFromMnemonic(mnemonic);
  //   this.createDID(privateKey);
  // }

  private readFileContent(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (event.target && event.target.result) {
          const content = event.target.result as string;
          resolve(content);
        } else {
          reject(new Error('Error reading file content.'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Error occurred while reading the file.'));
      };

      reader.readAsText(file);
    });
  }

  // public async importWallet(file: File, password: string, mnemonic: string) {
  //   if (!password) {
  //     throw new Error('Please insert your password');
  //   }
  //   this.initStorage(password);
  //   this.clear();
  //   this.storeTerms(true);
  //   this.storeJWT('success!');

  //   const fileContent: string = await this.readFileContent(file);

  //   console.log('importWallet imported credentials are  ', fileContent);
  //   // const parsedData: IFile = JSON.parse(fileContent);
  //   // // this.storeKeys(JSON.stringify(parsedData.privateKey));

  //   this.storeMnemonic(mnemonic);
  //   const key = this.createKeyFromMnemonic(mnemonic);
  //   this.createDID(key);
  // }

  public openWallet(password: string) {
    if (!password) {
      throw new Error('Please insert your password');
    }
    this.initStorage(password);
    const decodedToken = this.getJWT();
    console.log('decodetoken->' + decodedToken);

    if (!decodedToken || decodedToken !== 'success!') {
      throw new Error('Password is incorrect');
    }
  }

  public async exportKeys() {
    const fileName = 'keys.txt';
    const privateKey = this.getKeys();
    // const mnemonic = this.getMnemonic();
    const did = this.getDID();
    const token = this.getJWT();
    if (!privateKey) {
      throw new Error('Key not found');
    }
    // if (!mnemonic) {
    if (did) {
      throw new Error('Mnemonic not found');
    }
    if (!token) {
      throw new Error('Token not found');
    }
    // const fileData = get Credentials;
    //TODO get Credentials
    const fileData = 'Credentials: 123456'; // MOCK
    const jsonBlob = new Blob([fileData], {type: 'application/json; charset=utf-8;'});
    const url = URL.createObjectURL(jsonBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
  }

  // private generateToken = (password: string): string => {
  //   const token = jwt.sign(password, this.SECRET_KEY);

  //   this.storeJWT(token);
  //   return token;
  // };

  public async encryptAndDownloadFile() :Promise<boolean> {
    const bck_credentials_list = [];
    const storedCredentials: CredentialStoredType[] | [] = this.getStoredCredentials();

    console.log('allCredentials', storedCredentials);
    for (const credential of storedCredentials) {
      let decodedData = jwt_decode(credential.jwt) as IVC;
      //let vc= (decoded as IVC).vc;
      interface IVCWithSingleType extends Omit<IVC['vc'], 'type'> {
        type: string[];
      }
      let data = decodedData.vc as unknown as IVCWithSingleType;
      data.type = decodedData.vc.type;

      let bck_credential = {
        id: data.id,
        data: data,
        expirationDate: data.expirationDate,
        activities: [],
        jwt: credential.jwt,
      };
      if (data.type[2] != 'WalletCredential')
        bck_credentials_list.push(bck_credential);
    }

    if (bck_credentials_list.length == 0)
      return false;

    const date = UiDate.formatDate(new Date());
    console.log('uiDate: ', date);

    const message = {
      date: date,
      credentials: bck_credentials_list,
    };

    const fileName = 'kibisis-backup';

    // const encryptedData = await cryptoKeys.encrypt("¨`ýp<ÐW3AR1¯#.í©¥¿e,|VrtuXÅ", this.getMnemonic());
    
    // //const encryptedData = await cryptoKeys.encrypt("test messge", this.getMnemonic());

    // const testdecrypteddata = await cryptoKeys.decrypt(this.getMnemonic(), encryptedData);
    // console.log('testdecrypt->'+testdecrypteddata);

    // const encryptedData = await cryptoKeys.encrypt(JSON.stringify(message), this.getMnemonic());
    const encryptedData = await cryptoKeys.encrypt(JSON.stringify(message), this.getDID());
    // Convert encryptedData to a JSON string
    const jsonString = JSON.stringify(encryptedData);

    // Encode JSON string as UTF-8
    const utf8Encoder = new TextEncoder();
    const fileBytes = utf8Encoder.encode(jsonString);

    // Create a Blob from the byte array
    const blob = new Blob([fileBytes], {type: 'text/plain'});

    // Save the file using FileSaver.js
    saveAs(blob, `${fileName}.txt`, { autoBom: true });

    return true;
    //     bck_credentials_list = list of bck_credential
    // for each encodedjwt in local storage
    // data = decode(encodedjwt).vc
    // data['type'] = data.type[2]
    // bck_credential = {
    //   'id': data.id
    //   'data': data
    //   'expirationDate': data.expirationDate
    //   'activities': []
    //   'jwt': encodedjwt
    //  }
    //  add bck_credential to list
    //    date = UiDate.formatDate(DateTime.now());
    //    message = {
    //                'date': date,
    //                'credentials': bck_credentials_list,
    //               };
    //    encryptedData = await cryptoKeys.encrypt(jsonEncode(message), mnemonics!);
    //    fileBytes= Uint8List.fromList(utf8.encode(jsonEncode(encryptedData)));
    //    filePath = await fileSaver.saveAs(
    //                         name: fileName,
    //                         bytes: fileBytes,
    //                         ext: 'txt',
    //                         mimeType: MimeType.text,
    //
    //                      );
  }

  public readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  public async processRestoreFile(file: File) {
    //const fileContent: string = await this.readFileContent(file);
    const fileContent: string = await this.readFile(file);

    const json = JSON.parse(fileContent);

    console.log('restored from file credentials are:  ', json);
    console.log('===============');

    if (!json.cipherText || !json.authenticationTag) {
      throw new Error('Invalid backup file');
    }

    const encryption: IEncryption = {
      cipherText: json.cipherText,
      authenticationTag: json.authenticationTag,
      fromMobile: json.fromMobile,
    };

    // const mnemonic = this.getMnemonic();
    const did = this.getDID();

    // const decryptedText = await cryptoKeys.decrypt(mnemonic, encryption);
    const decryptedText = await cryptoKeys.decrypt( did, encryption);
    const decryptedJson = JSON.parse(decryptedText);

    if (
      !decryptedJson.date ||
      !decryptedJson.credentials ||
      typeof decryptedJson.date !== 'string'
    ) {
      throw new Error('Invalid decrypted data.');
    }

    const bckCredentials = decryptedJson.credentials;

    return bckCredentials;
  }

  public verifyToken() {
    const token = this.getJWT();

    if (token !== null) {
      return token;
    } else {
      throw new Error('Token not found');
    }
  }
}
