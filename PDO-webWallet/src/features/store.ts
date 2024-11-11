import {configureStore} from '@reduxjs/toolkit';
import logger from 'redux-logger';
import {apiSlice} from './api/apiSliceRTKQuery';
import credentialsReducer from './credentialSlice';
import offerPayloadReducer from './offerPayloadSlice';

const preloadedState = {};

export const store = configureStore({
  reducer: {
    credentials: credentialsReducer,
    offerPayload: offerPayloadReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware as any, logger),
  devTools: process.env.REACT_APP_NODE_ENV !== 'production',
  preloadedState,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

// https://redux-toolkit.js.org/tutorials/typescript
// https://redux.js.org/tutorials/essentials/part-5-async-logic
// https://tengweiherr.medium.com/async-api-requests-with-redux-toolkit-6808d9d2c069
