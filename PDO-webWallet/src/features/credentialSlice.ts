import {createAsyncThunk, createSlice, PayloadAction, current} from '@reduxjs/toolkit';
import {RootState} from './store';
import {AxiosError} from 'axios';
// import WalletModel from '../models/WalletModel';
import {CredentialStoredType} from '../types/typeCredential';
import {apiService} from '../index';

export interface ICredential {
  id?: string;
  acceptance_token?: string;
}
interface CredentialState {
  value: Array<CredentialStoredType>;
  selectedCredential: CredentialStoredType | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: null | string;
}

// const walletModel = new WalletModel();
// const storedCredentials: CredentialStoredType[] | [] | undefined =
//   walletModel.getStoredCredentials();

const initialState: CredentialState = {
  value: /*storedCredentials ? storedCredentials :*/ [],
  selectedCredential: null,
  status: 'idle',
  error: null,
};

export interface IGetVCReqOptions {
  url: string;
  acceptance_token: string;
}

type ErrorMessagePayload = {
  error: string;
  error_description: string;
};

type ErrorPayload = {
  status: number;
  message: ErrorMessagePayload['error_description'];
};

export const getCredentials = createAsyncThunk(
  'credentials/postCredentials',
  async (getCredentialReqOptions: IGetVCReqOptions, {rejectWithValue}) => {
    // getting issued Credential
    try {
      const vcData = await apiService.getDeferredCredential(getCredentialReqOptions);

      return vcData;
    } catch (err: unknown) {
      const error = err as AxiosError;
      console.error('Axios error: ', error);
      if (!error.response) {
        throw err;
      }
      return rejectWithValue({
        status: error.response.status,
        message: (error.response.data as ErrorMessagePayload).error_description,
      });
    }
  }
);

const credentialSlice = createSlice({
  name: 'credentials',
  initialState,
  reducers: {
    credentialAdded(state, action: PayloadAction<CredentialStoredType>) {
      state.value.push(action.payload);
    },
    credentialsAddAll(state, action: PayloadAction<CredentialStoredType[]>) {
      return {
        ...state,
        value: action.payload,
      };
    },
    credentialsRemoved(state) {
      return {
        ...state,
        value: [],
      };
    },
    credentialRemoved(state, action: PayloadAction<string>) {
      const index = state.value.findIndex((item) => item.id === action.payload);
      if (index !== -1) {
        state.value.splice(index, 1);
      }

      // walletModel.storeVerifiedCredentials(JSON.stringify(current(state).value));
      // console.log(
      //   'Verified Credentials from local storage after removL OF ONE VC  : ',
      //   walletModel.getStoredCredentials()
      // );
    },
    selectedCredential(state, action: PayloadAction<string>) {
      // Set the chosen credential in the state
      const credential = state.value.find((item) => item.jwt === action.payload);
      state.selectedCredential = credential || null; // Set to null if not found
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getCredentials.pending, (state, action) => {
        state.status = 'loading';
      })
      .addCase(getCredentials.fulfilled, (state, action) => {
        // Add a fetched vc
        state.value.push(action.payload as unknown as CredentialStoredType);
        state.status = 'succeeded';
      })
      .addCase(getCredentials.rejected, (state, action) => {
        console.log('case failed: ', action.payload);
        state.error = action.payload
          ? (action.payload as ErrorPayload).message
          : (action.error.message as string);
        state.status = 'failed';
      });
  },
});

export const {
  credentialAdded,
  credentialsAddAll,
  credentialRemoved,
  credentialsRemoved,
  selectedCredential,
} = credentialSlice.actions;
export const selectSingleCredential = (state: RootState) => state.credentials.selectedCredential;
export const selectCredentials = (state: RootState) => state.credentials.value;
export default credentialSlice.reducer;
