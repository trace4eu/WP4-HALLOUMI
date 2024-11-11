import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';
import type {CredentialOfferPayload} from '../screens/CredentialOffer';
import type {RootState} from '../features/store';
//import ApiService from './api/ApiService';
import axios from 'axios';
import { apiService } from '../index';

// {
//   // Multiple possible status enum values
//   status: 'idle' | 'loading' | 'succeeded' | 'failed',
//   error: string | null
// }
export interface offerPayloadState {
  value: CredentialOfferPayload | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: null | string;
}

const initialState: offerPayloadState = {
  value: null,
  status: 'idle',
  error: null,
};

export const fetchOfferPayload = createAsyncThunk(
  'credentialOffer/fetchOfferPayload',
  async (url: string, thunkApi) => {
    const offerPayloadData = await apiService.getPayload(url);
    return offerPayloadData;
  },
  {
    condition: (_url, api) => {
      const commonState = api.getState() as RootState;
      const loadingState = commonState.offerPayload.status;

      if (loadingState === 'loading' || loadingState === 'succeeded') {
        return false;
      }
    },
  }
);

export const offerPayloadSlice = createSlice({
  name: 'offerPayload',
  initialState,
  reducers: {
    offerPayloadAdded(state, action: PayloadAction<CredentialOfferPayload>) {
      state.value = action.payload;
      state.status = 'succeeded';
    },
    offerPayloadRemoved(state) {
      state.value = null;
    },
    offerPayloadErrorRemoved(state) {
      return {
        ...state,
        error: null,
      };
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchOfferPayload.pending, (state, action) => {
        state.status = 'loading';
      })
      .addCase(fetchOfferPayload.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Add a fetched offer payload
        state.value = action.payload as CredentialOfferPayload;
      })
      .addCase(fetchOfferPayload.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message as string;
      });
  },
});

export const {offerPayloadAdded, offerPayloadRemoved, offerPayloadErrorRemoved} =
  offerPayloadSlice.actions;
export const selectOfferPayload = (state: RootState) => state.offerPayload.value;
export default offerPayloadSlice.reducer;
