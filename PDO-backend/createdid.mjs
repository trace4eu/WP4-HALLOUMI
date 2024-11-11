import { util } from "@cef-ebsi/key-did-resolver";

const jwk = {
  kty: "EC",
  crv: "P-256",
 "x":"IVx2uLMAGf7HN1VsGNDVITEDTBzUJL-O9fUe0lLM5BA",
"y":"GEOqMpQijH4s70Lg3qwDRK2EGRn2fKFKo2MdFu-USEg",
};

const did = util.createDid(jwk);
console.log(did);
