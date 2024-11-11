import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {JWK} from 'jose';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import WalletModel from '../models/WalletModel';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import {ICredential, credentialAdded} from '../features/credentialSlice';
import {VCtype} from '../screens/Wallet';
import {DefferedCredentialType} from '../screens/DeferredCredentials';
import CredentialDecoder from '../helpers/credentialDecoder';
import CredentialStorageHelper from '../helpers/credentialStorageHelper';
import {useAppDispatch} from '../features/hooks';
import ErrorDownloadAlert from '../components/ErrorDownloadAlert';
import CredentialSaveAlert from '../components/CredentialSaveOrShareOrDeleteAlert';
import Modal from '../components/Modal';
import {Constraints} from '../helpers/getConstraints';
import WalletCard from '../components/WalletCard';
import {CredentialStoredType} from '../types/typeCredential';
import generatePresentationSubmission from '../helpers/generatePresentationSubmission';
import getVerifiablePresentationJwt from '../helpers/getVerifiablePresentationJwt';
import {apiService} from '../index';

interface PropsPresentationDefenition {
  walletModel: WalletModel;
}

const BUTTON_TEXT = {PRESENT: 'present', NEXT: 'next'};

const PresentationDefinition = ({walletModel}: PropsPresentationDefenition) => {
  const [page, setPage] = useState(1);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [selectedjwtvcs, setSelectedjwtvcs] = useState<string[]>([]);
  const [selectCredentials, setSelectCredentials] = useState<Array<CredentialStoredType[]>>([]);
  const [missingCredentials, setMissingCredentials] = useState<string[]>([]);
  const [requestedCredentialsIds, setRequestedCredentialsIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isErrorWindow, setIsErrorWindow] = useState(false);
  const [isDeferredCredential, setIsDeferredCredential] = useState(false);

  const [isVC, setIsVC] = useState(false);
  const [shared, setShared] = useState(false);

  const {state} = useLocation();
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!state || !state.presentationDefinition) {
      setIsErrorWindow(true);
      return;
    }
    const presentationDefinition = state.presentationDefinition;

    const storedVCs: CredentialStoredType[] = walletModel.getStoredCredentials()
      ? walletModel.getStoredCredentials()
      : [];
    const cards = Array.from(new Set(Constraints.getConstraintCards(presentationDefinition)));

    const receivedRequestedCredentialsIds = Array.from(
      new Set(Constraints.requestedCredentialsIds)
    );
    setRequestedCredentialsIds(receivedRequestedCredentialsIds);
    let missingCredentialsArray: string[] = [];
    const selectedCredentialsArrays: CredentialStoredType[][] = [];
    cards.map((card) => {
      let constraintsArray = storedVCs.filter((item) => item.type === card);

      if (constraintsArray.length === 0) {
        missingCredentialsArray.push(card);
        setMissingCredentials(Array.from(new Set(missingCredentialsArray)));
      } else {
        selectedCredentialsArrays.push(constraintsArray);
      }
    });

    setSelectCredentials(selectedCredentialsArrays);
  }, []);

  const handleCheckboxChange = (value: string) => {
    setSelectedValue(value === selectedValue ? null : value);
  };

  const sendVP = async (selectedjwtvcs: string[]) => {
    setLoading(true);

    const walletDID = walletModel.getDID() as string;
    const privateKeyJwk = walletModel.getKeys() as JWK;
    const audience = state.client_id;

    try {
      const vpJwt = await getVerifiablePresentationJwt(
        audience,
        walletDID,
        selectedjwtvcs,
        privateKeyJwk
      );

      const presentationSubmission = generatePresentationSubmission(
        requestedCredentialsIds,
        state.presentationDefinition
      );

      // POST to redirect_uri
      const redirect_uri = state.redirect_uri;
      const vpTokenData = {
        vp_token: vpJwt, //state.vpJwt,
        state: state.vpTokenRequestState, //state in vpTokenRequest
        presentation_submission: JSON.stringify(presentationSubmission),
      };

      const directPostRespData = await apiService.getDirectPost(vpTokenData, redirect_uri);
      if (directPostRespData?.redirectUri) {
        return window.open(directPostRespData?.redirectUri, '_self');
      }
      const authCode = (directPostRespData as {code: string; [key: string]: string}).code;
      if (authCode === 'sharedOK') {
        setLoading(false);
        console.log('sharedok2');
        setShared(true);
        return;
      }

      const accessTokenRespData = await apiService.getAccessTokenData(authCode as string);

      const postCredentialReqOptions = await apiService.getCredentialEndPointAndOptions(
        accessTokenRespData
      );

      // The response from POST will be a new vc (IN_TIME) or an acceptance_token (DEFERRED)
      const verifiedCredential: ICredential | VCtype =
        await apiService.getInTimeOrDeferredCredential(postCredentialReqOptions);

      if (!verifiedCredential) {
        setMessage('Error while obtaining VC');
        setIsErrorWindow(true);
      }
      // to check if response from /credential endpoint has acceptance token for delayed VC
      else if (
        verifiedCredential &&
        'acceptance_token' in verifiedCredential &&
        verifiedCredential['acceptance_token']
      ) {
        // create new entry to deferred_credentials array which includes:
        // acceptance_token, deferredEndPoint, vctype, issuer
        const newCredential: DefferedCredentialType = {
          acceptance_token: verifiedCredential['acceptance_token'] as string,
          deferredEndpoint: state.deferredEndpoint as string,
          vctype: state.vctype,
          issuer: state.credential_issuer as string,
        };
        CredentialStorageHelper.storeDeferredCredential(newCredential, walletModel);
        // Display a modal with OK button “your credential will be issued in due time and be notified via email
        setIsDeferredCredential(true);
      } else {
        // if issure issued VC immediately then we store VC in local storage
        const storeFormatVC = new CredentialDecoder((verifiedCredential as VCtype).credential)
          .formattedCredential;

        CredentialStorageHelper.storeVC(storeFormatVC, walletModel);
        // and we store it in app state
        dispatch(credentialAdded(storeFormatVC));
        setIsVC(true);
      }
    } catch (e) {
      console.error(e);
      setIsErrorWindow(true);
    }
    setLoading(false);
  };

  const handleButtonClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const newSelectedjwtvcs = [...selectedjwtvcs, selectedValue as string];
    setSelectedjwtvcs(newSelectedjwtvcs);

    if (newSelectedjwtvcs.length === requestedCredentialsIds.length) {
      await sendVP(newSelectedjwtvcs);
    } else {
      setPage((prev) => (prev < selectCredentials.length ? prev + 1 : prev));
      setSelectedValue(null);
    }
  };

  const toCancel = () => {
    setIsDeferredCredential(false);
    navigate('/wallet');
  };

  const toCloseErrorAlert = () => {
    setIsErrorWindow(false);
    navigate('/wallet');
  };

  if (isErrorWindow) {
    if (!message) {
      setMessage('Something went wrong. Please try again later.');
    }
  }

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

      <CredentialSaveAlert isVC={isVC} toCancel={toCancel} />

      <CredentialSaveAlert
        isVC={shared}
        toCancel={toCancel}
        message="your credential(s) have been shared"
      />

      {isDeferredCredential && (
        <Modal
          type={'deferredCredential'}
          onButtonActionClick={toCancel}
          open={isDeferredCredential}
        />
      )}

      <Container>
        {missingCredentials.length > 0 ? (
          <Box sx={{textAlign: 'center'}} padding={3}>
            <Typography variant="h4"> missing credentials</Typography>
            <Typography paddingTop={2} fontSize={'1.2rem'}>
              you are missing {missingCredentials.length} requested credential(s)
            </Typography>
            <Grid
              sx={{
                paddingBottom: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
              }}
            >
              {missingCredentials.map((c, i) => {
                const walletCardsTypes = [
                  'CitizenId',
                  'WalletCredential',
                  'bachelorDegree',
                  'LicenseToPractice',
                ];

                let cardImage = `/images/card${c}Missing.jpg`;
                let isMissingType = false;

                if (walletCardsTypes.indexOf(c) === -1) {
                  cardImage = '/images/card-missing.png';
                  isMissingType = true;
                }

                return (
                  <Grid key={i} sx={{paddingTop: 3, position: 'relative'}}>
                    <Box
                      component="img"
                      alt={`image of credential card type ${c} missing`}
                      src={cardImage} //{`/images/card${c}Missing.jpg`}
                      width="350px"
                      height="210px"
                      sx={{backgroundColor: 'primary.light'}}
                      borderRadius="30px"
                    />
                    {isMissingType && (
                      <Typography
                        position={'absolute'}
                        top={'40%'}
                        left={20}
                        fontSize={'1.3rem'}
                        fontWeight={500}
                      >
                        {c}
                      </Typography>
                    )}
                  </Grid>
                );
              })}
            </Grid>
            <Typography sx={{paddingY: 1}}>
              please get {missingCredentials.length === 1 ? 'it' : ' them'} and then try again
            </Typography>

            <Stack
              spacing={5}
              justifyContent="center"
              direction="row"
              width={'100%'}
              paddingTop={1}
              paddingBottom={3}
            >
              <Button
                variant="contained"
                className="govcy-btn-primary"
                sx={{padding: 1.5, fontWeight: 700}}
                onClick={() => navigate('/wallet')}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        ) : (
          <Box sx={{textAlign: 'center'}} px={3}>
            <Typography variant="h2" className="govcy-h2">
              {' '}
              Select Credential(-s)
            </Typography>
            <Typography>
              issuer requires that you present at least one of the following credentials
            </Typography>
            <Typography>
              {page}/{requestedCredentialsIds.length}
            </Typography>
            <Typography>Select your credential</Typography>
            <FormControl component="fieldset">
              <FormGroup>
                {selectCredentials.length > 0 &&
                  selectCredentials[page - 1].map((c: CredentialStoredType) => {
                    return (
                      <Grid
                        sx={{
                          px: 2,
                          paddingTop: 3,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'end',
                        }}
                        key={c.id}
                      >
                        <WalletCard card={c} />
                        <FormControlLabel
                          key={c.id}
                          control={
                            <Checkbox
                              checked={c.jwt === selectedValue}
                              onChange={() => handleCheckboxChange(c.jwt)}
                            />
                          }
                          label=""
                        />
                      </Grid>
                    );
                  })}
              </FormGroup>
            </FormControl>
            <Stack
              spacing={5}
              justifyContent="center"
              direction="row"
              width={'100%'}
              paddingTop={5}
              paddingBottom={3}
              paddingRight={3}
            >
              <Button
                variant="contained"
                className="govcy-btn-primary"
                sx={{padding: 1.5, fontWeight: 700}}
                onClick={handleButtonClick}
                disabled={selectedValue === null}
              >
                {page === requestedCredentialsIds.length ? BUTTON_TEXT.PRESENT : BUTTON_TEXT.NEXT}
              </Button>
            </Stack>
          </Box>
        )}
      </Container>
    </>
  );
};

export default PresentationDefinition;
