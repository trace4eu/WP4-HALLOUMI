import BIP32Factory from 'bip32';
import * as bip39 from 'bip39';
import ecc from '@bitcoinerlab/secp256k1';
import {createCipheriv, createDecipheriv, randomBytes} from 'crypto-browserify';
import codeChallenge from './codeChallenge';

function stringToUtf8Bytes(str :string) {
  const bytes: Array<any> = [];

  for (let i = 0; i < str.length; i++) {
    let codePoint = str.codePointAt(i);
    if (codePoint) {
    if (codePoint < 0x80) {
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
    } else if (codePoint < 0x10000) {
      bytes.push(
        0xe0 | (codePoint >> 12),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f)
      );
    } else {
      i++; // skip one iteration since we have a surrogate pair
      bytes.push(
        0xf0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3f),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f)
      );
    }
  }
}
  return bytes;
}

function getCodePoint(str: string) {
  var first = str.charCodeAt(0);

  if (first >= 0xD800 && first <= 0xDBFF && str.length > 1) {
    var second = str.charCodeAt(1);

    if (second >= 0xDC00 && second <= 0xDFFF) {
      return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
    }
  }

  return first;
};

function codePoint(str: string) {
  if (typeof str !== 'string') {
    throw new TypeError(String(str) + ' is not a string. Argument must be a string.');
  }

  if (str.length === 0) {
    throw new Error('Argument must be a non-empty string.');
  }

  return getCodePoint(str);
};

function codePoints(str:string) {


  if (typeof str !== 'string') {
    throw new TypeError(
      str +
      ' is not a string. First argument to code-points must be a string.'
    );
  }

  var result: Array<number> = [];

  var index = 0;
  while (index < str.length) {
    var point = codePoint(str.charAt(index) + str.charAt(index + 1));

    if (point > 0xffff) {
      index += 2;
    } else {
      index += 1;
    }


    result.push(point);
  }

  return result;
}



export interface Encryption {
  cipherText: string;
  authenticationTag: string;
}

class CryptocurrencyKeys {
  static readonly ivVector = 'kibisis';
  static readonly additionalAuthenticatedData = 'Credible';

  private async generateKey(mnemonic: string): Promise<any> {
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc);
    const rootKey = bip32.fromSeed(seed);
    const child = rootKey.derivePath("m/44'/60'/0'/0/0");

    if (!child.privateKey) {
      throw new Error('No private key available');
    }
    const iterable = child.privateKey;
    const privateKey = new Uint8Array(iterable);
    console.log('privkay->'+privateKey.toString());
    return privateKey;
    // const symmetricKey = new SymmetricKey(child.privateKey);
    // const keyPair = KeyPair.symmetric(symmetricKey);
  }

  async encrypt(message: string, mnemonic: string): Promise<Encryption> {
    const privateKey = await this.generateKey(mnemonic);

    const iv = Buffer.from(CryptocurrencyKeys.ivVector);
    const aad = Buffer.from(CryptocurrencyKeys.additionalAuthenticatedData);
    // const iv = CryptocurrencyKeys.ivVector;
    // const aad = CryptocurrencyKeys.additionalAuthenticatedData;
    const cipher = createCipheriv('aes-256-gcm', privateKey, iv);
    cipher.setAAD(aad);

    // let encrypted = cipher.update(message, 'utf8', 'hex');
    // encrypted += cipher.final('hex');
    // const authenticationTag = cipher.getAuthTag().toString('hex');

    let encrypted = cipher.update(Buffer.from(codePoints(message)),'utf8','hex');
   encrypted += cipher.final('hex');
    console.log('authtag enc1->'+cipher.getAuthTag());
    // const authenticationTag = cipher.getAuthTag().toString();
    // console.log('authtag enc->'+codePoints(cipher.getAuthTag().toString()));
    return {
      cipherText: String.fromCharCode(...Buffer.from(encrypted)),
      authenticationTag: String.fromCharCode(...Buffer.from(cipher.getAuthTag())),
    };
  }

  async decrypt(mnemonic: string, encryption: Encryption): Promise<string> {
    const privateKey = await this.generateKey(mnemonic);
    // const privateKey = await this.generateKey(
    //   'charge local split gossip social seat boat tuna sun whale you topple'
    // );
    // for testing

    console.log('Crypto_keys class. decrypt method');
    // console.log('privateKey: ', privateKey);

    const iv = Buffer.from(CryptocurrencyKeys.ivVector);
    //console.log('iv: ', iv);

    const aad = Buffer.from(CryptocurrencyKeys.additionalAuthenticatedData);
    // console.log('aad: ', aad);

    const decipher = createDecipheriv('aes-256-gcm', privateKey, iv);
    //console.log('decipher: ', decipher);

    decipher.setAAD(aad);
    // decipher.setAuthTag(Buffer.from(encryption.authenticationTag, 'hex'));

    // let decrypted = decipher.update(encryption.cipherText, 'hex', 'utf8');
    // decrypted += decipher.final('utf8');

    // console.log('authtag1->'+encryption.authenticationTag);
    // console.log('authtag->'+codePoints(encryption.authenticationTag));

    decipher.setAuthTag( encryption.authenticationTag);

    let decrypted = decipher.update( Buffer.from(codePoints(encryption.cipherText)),'hex','utf8');
    decrypted += decipher.final('utf8');
    console.log('decrypted->'+decrypted);

    return decrypted;
  }
}

const cryptoKeys = new CryptocurrencyKeys();

export default cryptoKeys;
