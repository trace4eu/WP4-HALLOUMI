import {createHash} from 'crypto-browserify';
import jose from 'node-jose';
import {bytesToBase64} from 'byte-base64';

const randomBytes = jose.util.randomBytes(50);

export const codeVerifier = bytesToBase64(randomBytes).split('=')[0];

const codeChallenge = jose.util.base64url
  .encode(createHash('sha256').update(codeVerifier).digest())
  .split('=')[0];

export default codeChallenge;
