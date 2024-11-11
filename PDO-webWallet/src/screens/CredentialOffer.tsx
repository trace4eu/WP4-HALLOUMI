import qs from 'qs';
import React, {useEffect, useState} from 'react';
import {useSearchParams, useNavigate, useLocation, Navigate} from 'react-router-dom';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import WalletModel from '../models/WalletModel';
import {ICredential, credentialAdded, selectCredentials} from '../features/credentialSlice';

import {useAppSelector, useAppDispatch} from '../features/hooks';
import {
  fetchOfferPayload,
  offerPayloadAdded,
  offerPayloadErrorRemoved,
  offerPayloadRemoved,
  selectOfferPayload,
} from '../features/offerPayloadSlice';

import Wallet, {VCtype} from './Wallet';
import Modal from '../components/Modal';
import {IPostCredentialReqOptions} from '../features/api/apiService';
import {DefferedCredentialType} from './DeferredCredentials';

import CredentialSaveOrShareOrDeleteAlert from '../components/CredentialSaveOrShareOrDeleteAlert';
import CredentialDecoder from '../helpers/credentialDecoder';
import {CredentialStoredType} from '../types/typeCredential';

import ErrorDownloadAlert from '../components/ErrorDownloadAlert';
import {PresentationDefinitionType} from '../types/presentationDefinitionType';
import CredentialStorageHelper from '../helpers/credentialStorageHelper';
import {apiService} from '../index';
import {unwrapResult} from '@reduxjs/toolkit';

type CredentialOfferUri = {
  credential_offer_uri: string;
  credential_issuer: string;
  flowtype: string;
  walleturl: string;
};

export type CredentialOffer = {
  credential_offer?: string; // The credential_offer is a stringified CredentialOfferPayload
  credential_offer_uri?: string; // URI to the credential offer
};

export type CredentialOfferPayload = {
  credential_issuer: string; // url of credential issuer
  credentials: {
    format: 'jwt_vc';
    types: string[];
    trust_framework: {
      name: string;
      type: string;
      uri: string;
    };
  }[];

  grants: {
    authorization_code?: {
      issuer_state?: string;
    };
    'urn:ietf:params:oauth:grant-type:pre-authorized_code'?: {
      'pre-authorized_code': string;
      user_pin_required: boolean;
    };
  };

  flowtype?: string;
  walleturl?: string;
  loginRequired?: boolean;
  loginRequiredOpenID?: boolean;
};

interface PropsOfferPage {
  walletModel: WalletModel | undefined;
}

const OfferPage: React.FunctionComponent<PropsOfferPage> = ({walletModel}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isErrorWindow, setIsErrorWindow] = useState(false);

  const [postCredentialResponse, setPostCredentialResponse] = useState<
    string | null | ICredential | VCtype
  >(null);

  const [isVC, setIsVC] = useState(false);
  const [isDefferedCredential, setIsDefferedCredential] = useState(false);
  const [modalType, setModalType] = useState('offer');

  const offerPayload = useAppSelector(selectOfferPayload);
  const dispatch = useAppDispatch();

  const loadingStatus = useAppSelector((state) => state.offerPayload.status);
  const error = useAppSelector((state) => state.offerPayload.error);

  const getOfferUri = async (offeruri: string) => {
    try {
      const result = await dispatch(fetchOfferPayload(offeruri));
      const offerPayload = unwrapResult(result);

      if (offerPayload && offerPayload.credentials[0].types[2].includes('PRESENTVC')) {
        setModalType('share');
      }
    } catch (e) {
      console.error(e);
      setIsErrorWindow(true);
    }
  };

  useEffect(() => {
    const offer = qs.parse(searchParams.toString()) as unknown as CredentialOffer;

    if (offer.credential_offer) {
      const payload = JSON.parse(offer.credential_offer) as unknown as CredentialOfferPayload;

      dispatch(offerPayloadAdded(payload));
    } else if (offer.credential_offer_uri) {
      //get credential

      let credentialofferuri = JSON.parse(offer.credential_offer_uri) as CredentialOfferUri;

      (async () => {
        (await getOfferUri(
          credentialofferuri.credential_offer_uri
        )) as unknown as CredentialOfferPayload;
      })();
    }
  }, []);
  console.log('=====================');
  console.log('offerPayload :');
  console.log(offerPayload);
  console.log('=====================');

  const acceptVC = () => {
    dispatch(offerPayloadRemoved());
    setIsVC(true);
  };

  const getVC = async () => {
    setLoading(true);
    let verifiedCredential: unknown;
    let deferredEndpoint: unknown;
    try {
      const authResponse = await apiService.getAuthResponse(
        offerPayload?.credential_issuer as string,
        offerPayload?.credentials[0].types as string[],
        offerPayload?.grants as CredentialOfferPayload['grants']
      );

      // LoginRequired or LoginRequiredOpenID is true
      // and no 'openid-code' in direct_post response - flag redirect: 'redirect'

      if (authResponse.redirectUri) {
        window.open(authResponse.redirectUri, '_self');
      } else if (authResponse.shared) {
        console.log('sharedok');
      } else {
        const credential_issuer = offerPayload?.credential_issuer; // issuer url
        deferredEndpoint = authResponse?.deferredEndpoint as string;

        if (!authResponse.isVpToken) {
          const postCredentialReqOptions = authResponse?.postCredentialReqOptions;

          verifiedCredential = (await apiService.getInTimeOrDeferredCredential(
            postCredentialReqOptions as IPostCredentialReqOptions
          )) as ICredential | VCtype;

          if (!verifiedCredential) {
            setMessage('Error while obtaining VC');
            setIsErrorWindow(true);
          }
        } else {
          const vpTokenRequest = authResponse.authResponse;
          const vpTokenRequestState = vpTokenRequest && vpTokenRequest['state'];
          const client_id = vpTokenRequest && vpTokenRequest['client_id'];
          let redirect_uri = vpTokenRequest && vpTokenRequest['redirect_uri'];
          const nonce = vpTokenRequest && vpTokenRequest['nonce'];
          const presentationDefinition: PresentationDefinitionType =
            vpTokenRequest && vpTokenRequest['presentation_definition'];
          const vpJwt = vpTokenRequest && vpTokenRequest['request'];

          //  start presentation flow for presentationDefinition

          navigate(`/presentation-definition`, {
            state: {
              presentationDefinition,
              client_id,
              vpJwt,
              vpTokenRequestState,
              redirect_uri,
              credential_issuer,
              deferredEndpoint,
              vctype: offerPayload?.credentials[0].types[2] as string,
            },
          });
        }
      }
    } catch (e) {
      console.error('error while obtaining VC: ', e);
      setMessage('Error while obtaining VC');
      setIsErrorWindow(true);
    }

    const vc = verifiedCredential as ICredential | VCtype;
    setPostCredentialResponse(vc as ICredential | VCtype);
    setModalType('accept');
    // to check if response from /credential endpoint has acceptance token for delayed VC
    if (vc && 'acceptance_token' in vc && vc['acceptance_token']) {
      // create new entry to deferred_credentials array which includes:
      // acceptance_token, deferredEndPoint, vctype, issuer
      const newCredential: DefferedCredentialType = {
        acceptance_token: vc['acceptance_token'] as string,
        deferredEndpoint: deferredEndpoint as string,
        vctype: offerPayload?.credentials[0].types[2] as string,
        issuer: offerPayload?.credential_issuer as string,
      };

      CredentialStorageHelper.storeDeferredCredential(newCredential, walletModel!);

      // Display a modal with OK button “your credential will be issued in due time and be notified via email
      setIsDefferedCredential(true);
      setModalType('deferredCredential');
    } else {
      // if issure issued VC immediately then we store VC in local storage
      if (vc) {
        const storeFormatVC = new CredentialDecoder((vc as VCtype).credential).formattedCredential;

        CredentialStorageHelper.storeVC(storeFormatVC, walletModel!);

        // and we store it in app state
        dispatch(credentialAdded(storeFormatVC));
        acceptVC();
      }
    }
    setLoading(false);
  };

  const toCancel = () => {
    dispatch(offerPayloadRemoved());
    setIsDefferedCredential(false);
    navigate('/wallet');
  };

  const toCloseErrorAlert = () => {
    dispatch(offerPayloadErrorRemoved());
    setIsErrorWindow(false);
    navigate('/wallet');
  };

  if (
    offerPayload &&
    (!walletModel ||
      walletModel.keysNotExist() ||
      !walletModel.getDID() ||
      !walletModel.getMnemonic())
  ) {
    console.log('something missing ');
    return <Navigate to="/" replace state={{redirectTo: location}} />;
  }
  console.log('error from fetch: ', error);

  if (error || isErrorWindow) {
    if (!isErrorWindow) {
      setIsErrorWindow(true);
    }
    if (!message) {
      if (error?.search('timeout') !== -1 || error === 'canceled') {
        setMessage('It is taking too long to get a reply.');
      } else {
        setMessage('Error: invalid params');
      }
    }
  }

  const isOfferModal =
    !sessionStorage.getItem('issuerUrl') && !postCredentialResponse && offerPayload?.credentials
      ? true
      : false;

  if (loading || loadingStatus === 'idle' || loadingStatus === 'loading') {
    return (
      <Box sx={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <CircularProgress size="8vw" />
      </Box>
    );
  }

  return (
    <>
      <ErrorDownloadAlert
        message={message}
        isErrorWindow={isErrorWindow}
        onClose={toCloseErrorAlert}
      />

      {walletModel && <Wallet walletModel={walletModel} />}

      <CredentialSaveOrShareOrDeleteAlert isVC={isVC} toCancel={toCancel} />
      {!isErrorWindow && isOfferModal && (
        <Modal
          type={modalType}
          onButtonActionClick={toCancel}
          open={isOfferModal}
          onAcceptButtonAction={getVC}
        />
      )}

      {isDefferedCredential && (
        <Modal type={modalType} onButtonActionClick={toCancel} open={isDefferedCredential} />
      )}
    </>
  );
};

export default OfferPage;
