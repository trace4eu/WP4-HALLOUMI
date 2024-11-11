import jose from 'node-jose';

export type TokenParams = {
  didKey: string;
  alg: string | undefined; // 'ES256'
  privateKey: string;
};

export type Payload = {
  nonce: string;
  iss: string;
  sub?: string;
  exp?: number;
  iat: number;
  aud: string;
};

export const generateToken = async (
  vpTokenPayload: Payload,
  tokenParams: TokenParams,
  type: string
) => {
  // const privateKey = JSON.stringify(tokenParams.privateKey) as string;
  // const privateKey = JSON.stringify(new TextEncoder().encode(tokenParams.privateKey));
  // const privateKey = jwt_decode(privateBufferKey) as jwt.Secret;
  const didKey = tokenParams.didKey.split('did:key:')[1];
  const header = {
    typ: type,
    alg: tokenParams.alg ? tokenParams.alg : 'ES256',
    kid: tokenParams.didKey.concat('#').concat(didKey),
  };

  const tokenSigned = await jose.JWS.createSign(
    {format: 'compact', fields: header},
    tokenParams.privateKey as unknown as jose.JWK.Key
  )
    .update(JSON.stringify(vpTokenPayload))
    .final();
  return tokenSigned;
};
