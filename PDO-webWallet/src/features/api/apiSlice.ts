import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api', // optional
  baseQuery: fetchBaseQuery({baseUrl: 'http://'}),
  tagTypes: ['credential-offer', 'metadata', 'openidmetadata', 'token', 'credential-key'],
  endpoints: (builder) => ({}),
});
