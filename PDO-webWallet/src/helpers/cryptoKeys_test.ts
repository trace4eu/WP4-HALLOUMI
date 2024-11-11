import BIP32Factory from 'bip32';
import * as bip39 from 'bip39';
import ecc from '@bitcoinerlab/secp256k1';
import {createCipheriv, createDecipheriv, randomBytes} from 'crypto-browserify';

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

function codePoints(str:string): Array<number> {


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

function appendBuffer( buffer1:ArrayBuffer, buffer2:ArrayBuffer ) {
  var tmp = new Uint8Array( buffer1.byteLength + buffer2.byteLength );
  tmp.set( new Uint8Array( buffer1 ), 0 );
  tmp.set( new Uint8Array( buffer2 ), buffer1.byteLength );
  return tmp.buffer;
}

export interface Encryption2 {
  cipherText: ArrayBuffer;
  authenticationTag: ArrayBuffer;
}

class CryptoKeys {
  static readonly ivVector = 'kibisis';
  static readonly additionalAuthenticatedData = 'Credible';
  static readonly tagLengthDefault = 128;

  private async generateKey(mnemonic: string): Promise<any> {
   // console.log("mnemonic->"+mnemonic);
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
    const key = await crypto.subtle.importKey(
      'raw',
      privateKey,
      {
        name: 'AES-GCM',
       // length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );

    return key;
  }

  async encrypt(message: string, mnemonic: string): Promise<Encryption2> {
    const privateKey = await this.generateKey(mnemonic);

    const iv = Buffer.from(CryptoKeys.ivVector);
    const aad = Buffer.from(CryptoKeys.additionalAuthenticatedData);

    const encodedPlaintext =  Buffer.from((message));

    
    //const encodedPlaintext = new TextEncoder().encode(message);
    const tagLengthDefault = CryptoKeys.tagLengthDefault; //128;

    const ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        additionalData: aad,
        length: 256,
        //tagLength: tagLengthDefault, //default
      },
      privateKey,
      encodedPlaintext
    );

    let authTagLengthBytes = tagLengthDefault / 8;
    let authTagBytes = ciphertext.slice(
      ciphertext.byteLength - authTagLengthBytes,
      ciphertext.byteLength
    );
    let authTagString = new TextDecoder().decode(authTagBytes);
    
    console.log('ciphertext->'+String.fromCharCode(...Buffer.from(ciphertext)));

    return {
      // cipherText: String.fromCharCode(...Buffer.from(ciphertext)),
      // authenticationTag: String.fromCharCode(...Buffer.from(authTagBytes)),
      cipherText: ciphertext,
      authenticationTag: authTagBytes,
    };
  }

  
  async decrypt(mnemonic: string, encryption: Encryption2): Promise<string> {
    const privateKey = await this.generateKey(mnemonic);
    // const privateKey = await this.generateKey(
    //   'charge local split gossip social seat boat tuna sun whale you topple'
    // );
    // for testing

    console.log('Crypto_keys class. decrypt method');
    console.log('privateKey: ', privateKey);

    //const iv = Buffer.from(CryptoKeys.ivVector, 'utf8');
    const iv = Buffer.from(CryptoKeys.ivVector);
    const aad = Buffer.from(CryptoKeys.additionalAuthenticatedData);

    // console.log('authtag->'+codePoints(encryption.authenticationTag));

    const cleartext = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        additionalData: aad,
      },
      privateKey,
      encryption.cipherText
      // appendBuffer(encryption.cipherText,encryption.authenticationTag)
    );
    const data = new TextDecoder().decode(cleartext);
    return data;
  }
}

const cryptoKeys = new CryptoKeys();

export default cryptoKeys;
