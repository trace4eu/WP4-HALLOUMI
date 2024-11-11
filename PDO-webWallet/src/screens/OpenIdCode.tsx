import qs from 'qs';
import React, {useEffect, useState} from 'react';
import {Navigate, useLocation, useNavigate, useSearchParams} from 'react-router-dom';
import {apiService} from '../index';
import ErrorDownloadAlert from '../components/ErrorDownloadAlert';
import WalletModel from '../models/WalletModel';
import Wallet, {VCtype} from '../screens/Wallet';
import CredentialDecoder from '../helpers/credentialDecoder';
import CredentialStorageHelper from '../helpers/credentialStorageHelper';
import {useAppDispatch} from '../features/hooks';
import {ICredential, credentialAdded} from '../features/credentialSlice';
import Modal from '../components/Modal';
import CredentialSaveAlert from '../components/CredentialSaveOrShareOrDeleteAlert';

import {offerPayloadRemoved} from '../features/offerPayloadSlice';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import {DefferedCredentialType} from '../screens/DeferredCredentials';

interface IPropsOpenIdCodePage {
  walletModel: WalletModel | undefined;
}
const OpenIdCode: React.FunctionComponent<IPropsOpenIdCodePage> = ({walletModel}) => {
  const [isErrorWindow, setIsErrorWindow] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [isVC, setIsVC] = useState(false);
  const [isDefferedCredential, setIsDefferedCredential] = useState(false);
  const [loading, setLoading] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const params = qs.parse(searchParams.toString());

  const dispatch = useAppDispatch();

  const DEFERRED_VC_MODAL = 'deferredCredential';

  const navigateToLogin = () => {
    setIsErrorWindow(false);
    return <Navigate to="/" replace state={{redirectTo: location}} />;
  };

  const postToken = async () => {
    try {
      const accessTokenRespData = await apiService.getAccessTokenData(params.code as string);

      console.log('resp of get token', accessTokenRespData);

      const postCredentialReqOptions = await apiService.getCredentialEndPointAndOptions(
        accessTokenRespData
      );

      // The response from POST will be a new vc (IN_TIME) or an acceptance_token (DEFERRED)
      const verifiedCredentialData: ICredential | VCtype =
        await apiService.getInTimeOrDeferredCredential(postCredentialReqOptions);
      console.log('=================');
      console.log('verifiedCredential: ');
      console.log(verifiedCredentialData);
      if (!verifiedCredentialData) {
        throw new Error();
      } else {
        const vcJwt = (verifiedCredentialData as VCtype).credential;
        // if issure issued VC immediately then we store VC in local storage

        if (vcJwt) {
          const storeFormatVC = new CredentialDecoder(vcJwt).formattedCredential;

          CredentialStorageHelper.storeVC(storeFormatVC, walletModel!);

          // and we store it in app state
          dispatch(credentialAdded(storeFormatVC));
          setIsVC(true); //acceptVC();
          sessionStorage.clear();
        } else {
          // to check if response from /credential endpoint has acceptance token for delayed VC
          if (
            verifiedCredentialData &&
            'acceptance_token' in verifiedCredentialData &&
            verifiedCredentialData['acceptance_token']
          ) {
            // create new entry to deferred_credentials array which includes:
            // acceptance_token, deferredEndPoint, vctype, issuer
            const newCredential: DefferedCredentialType = {
              acceptance_token: verifiedCredentialData['acceptance_token'] as string,
              deferredEndpoint: sessionStorage.getItem('deferredEndpoint') as string, //deferredEndpoint as string,
              vctype: (sessionStorage.getItem('types') as string).split(',')[2] as string, //offerPayload?.credentials[0].types[2] as string,
              issuer: sessionStorage.getItem('issuerUrl') as string, //offerPayload?.credential_issuer as string,
            };

            CredentialStorageHelper.storeDeferredCredential(newCredential, walletModel!);

            setIsDefferedCredential(true);
            sessionStorage.clear();
          }
        }
      }
    } catch (e) {
      console.error(e);

      setMessage('Error while obtaining VC');
      setIsErrorWindow(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(
    () => {
      // if (walletModel?.keysNotExist()) {
      //   navigateToLogin();
      // } else {
      try {
        setLoading(true);

        //makes a post request to /token API with code as
        // the code-verifier from the session storage
        // and the other parameters as usual.
        //Continue with the rest of the flow
        (async () => {
          await postToken();
        })();
      } catch (e) {
        console.error(e);
        setMessage('Error while obtaining VC');
        setIsErrorWindow(true);
      } finally {
        //  setLoading(false);
      }
    },
    /* }*/ []
  );

  const toCloseErrorAlert = () => {
    setIsErrorWindow(false);
    navigate('/wallet');
  };

  const toCloseCredentialSaveAlert = () => {
    dispatch(offerPayloadRemoved());
    setIsDefferedCredential(false);
    setIsVC(false);
    navigate('/wallet');
  };

  if (loading) {
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
      <CredentialSaveAlert isVC={isVC} toCancel={toCloseCredentialSaveAlert} />

      {isDefferedCredential && (
        <Modal
          type={DEFERRED_VC_MODAL}
          onButtonActionClick={toCloseCredentialSaveAlert}
          open={isDefferedCredential}
        />
      )}
    </>
  );
};

export default OpenIdCode;
