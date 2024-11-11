import {
  createVerifiablePresentationJwt,
  type CreateVerifiablePresentationJwtOptions,
  type EbsiIssuer,
  type EbsiVerifiablePresentation,
} from '@cef-ebsi/verifiable-presentation';
import {v4 as uuidv4} from 'uuid';
import {JWK} from 'jose';
window.Buffer = window.Buffer || require('buffer').Buffer;

const getVerifiablePresentationJwt = async (
  audience: string,
  walletDID: string,
  selectedjwtvcs: string[],
  privateKeyJwk: JWK
) => {
  const publicKeyJwk = {...privateKeyJwk};
  delete publicKeyJwk.d;

  const signer = {
    did: walletDID, // walletDID,
    kid: walletDID.concat('#').concat(walletDID.split('did:key:')[1]), //walletkid,
    publicKeyJwk: publicKeyJwk, //walletpublicKeyJwk,
    privateKeyJwk: privateKeyJwk, // walletprivatekeyJwk,
    alg: 'ES256',
  } satisfies EbsiIssuer;

  const vpPayload = {
    id: 'urn:did:' + uuidv4(), //'urn:did:$uuid',
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiablePresentation'],
    holder: walletDID,

    verifiableCredential: selectedjwtvcs,
  } satisfies EbsiVerifiablePresentation;

  const vpOptions = {
    // REQUIRED. EBSI URI Authority ([userinfo "@"] host [":" port])
    ebsiAuthority: 'api-pilot.ebsi.eu',
    exp: Math.round(Date.now() / 1000) + 200,
    nonce: uuidv4(),
    // OPTIONAL. EBSI environment configuration.
    // This option allows you to override the default URLs (TIR, DIDR, TSR).
    ebsiEnvConfig: {
      didRegistry: 'https://api-pilot.ebsi.eu/did-registry/v5/identifiers',
      trustedIssuersRegistry: 'https://api-pilot.ebsi.eu/trusted-issuers-registry/v5/issuers',
      trustedPoliciesRegistry: 'https://api-pilot.ebsi.eu/trusted-policies-registry/v3/users',
    },
    skipValidation: true,
    skipAccreditationsValidation: true,
  } satisfies CreateVerifiablePresentationJwtOptions;

  const vpJwt = await createVerifiablePresentationJwt(vpPayload, signer, audience, vpOptions);

  return vpJwt;
};

export default getVerifiablePresentationJwt;
