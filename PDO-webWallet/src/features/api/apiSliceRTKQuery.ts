import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({baseUrl: 'http://'}),
  tagTypes: ['credential-offer', 'metadata', 'openidmetadata', 'token'],
  endpoints: (builder) => ({
    getCredentialOffer: builder.query({
      query: () =>
        // `${process.env.REACT_APP_URL}/openid-credential-offer?credential_offer_uri=${credentialOfferPayload}`,
        `${process.env.REACT_APP_URL}/openid-credential-offer`,
      providesTags: ['credential-offer'],
    }),
    getOfferUri: builder.query({
      query: (offeruri) => `${offeruri}`,
    }),
    getIssuerMetadata: builder.query({
      query: (issuerUrl) => `${issuerUrl}/.well-known/openid-credential-issuer`,
      providesTags: ['metadata'],
    }),
    getOpenIdMetadata: builder.query({
      query: (authServer) => `${authServer}/.well-known/openid-configuration`,
      providesTags: ['openidmetadata'],
    }),
    getAuth: builder.query(
      //<

      //  .query<
      //   any,
      //   { authUrl: string; did: string; authType: string; issueState: string }
      // >
      {
        query: (args: {authUrl: string; did: string; authType: string; issueState: string}) => {
          const {authUrl, did, authType, issueState} = args;
          return {
            url: authUrl,
            params: {
              response_type: 'code',
              scope: 'openid',
              // client_id: 'did.key.xxxxxxx',
              client_id: did,
              redirect_uri: 'openid://',
              authorization_details: {
                type: 'openid_credential',
                format: 'jwt_vc',
                locations: ['http://www.abc.com'],
                types: [
                  'VerifiableCredential',
                  'VerifiableAttestation',
                  authType,
                  //'CTWalletCrossInTime', // TODO
                ],
              },
              issuer_state: issueState,
            },
          };
        },
        transformResponse: async (response, meta) => {
          // Exctract value of the "Location" header with token request - VP or ID token
          // TODO decode response
          const tokenRequest = meta?.response?.headers.get('Location');
          const authresp = await response;
          console.log('apiSlice, token Request: ', tokenRequest);
          console.log('apiSlice auth resp: ', authresp);

          return {authresp, tokenRequest};
        },
      }
    ),
    postToken: builder.mutation({
      query: ({issuerUrl, token}) => ({
        providesTags: ['token'],
        url: `${issuerUrl}/${token}`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetCredentialOfferQuery,
  useGetOfferUriQuery,
  useGetIssuerMetadataQuery,
  useGetOpenIdMetadataQuery,
  useGetAuthQuery,
  usePostTokenMutation,
} = apiSlice;
