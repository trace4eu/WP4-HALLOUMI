import React, {useEffect, useRef, useState} from 'react';
import WalletModel from '../models/WalletModel';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import DownloadAlert from '../components/DownloadAlert';
import DeleteCredentialAlert from '../components/DeleteCredentialAlert';
import {useAppSelector, useAppDispatch} from '../features/hooks';
import {credentialAdded, getCredentials} from '../features/credentialSlice';
import {unwrapResult} from '@reduxjs/toolkit';
import {VCtype} from 'screens/Wallet';
import CredentialSaveAlert from '../components/CredentialSaveOrShareOrDeleteAlert';
import {CredentialStoredType} from '../types/typeCredential';
import CredentialDecoder from '../helpers/credentialDecoder';

export type DefferedCredentialType = {
  acceptance_token: string;
  deferredEndpoint: string;
  vctype: string;
  issuer: string;
};

interface PropsDeferredCredentials {
  walletModel: WalletModel;
}

const DeferredCredentials = ({walletModel}: PropsDeferredCredentials) => {
  const [deferredCredentials, setDeferredCredentials] = useState<null | DefferedCredentialType[]>(
    null
  );
  const [isVC, setIsVC] = useState(false);
  const [isErrorWindow, setIsErrorWindow] = useState(false);
  const [isDeleteAlert, setIsDeleteAlert] = useState(false);

  const [componentToRemove, setComponentToRemove] = useState<
    DefferedCredentialType['acceptance_token'] | null
  >(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dispatch = useAppDispatch();

  const loadingCredentialsStatus = useAppSelector((state) => state.credentials.status);
  const errorOnLoadCredential = useAppSelector((state) => state.credentials.error);

  useEffect(() => {
    let dcFromStorage: Array<DefferedCredentialType> = walletModel.getDeferredRequestsList();
    setDeferredCredentials(dcFromStorage);

    console.log('deferredCredentials on start: ', dcFromStorage);

    return () => {
      if (timerRef.current !== null) {
        return clearTimeout(timerRef.current);
      }
    };
  }, []);

  const toUpdateStoredDCs = (dcToken: string) => {
    const updatedCredentials: DefferedCredentialType[] | [] = walletModel
      .getDeferredRequestsList()
      .filter((dc: DefferedCredentialType) => dc.acceptance_token !== dcToken);

    walletModel.storeDeferredRequestsList(JSON.stringify(updatedCredentials));
    setDeferredCredentials(updatedCredentials);
    const storedUpdatedDC = walletModel.getDeferredRequestsList();
    console.info('local storage deferred credentials updated : ', storedUpdatedDC);
  };

  const toAddStoredVC = (vc: VCtype) => {
    let storedVCs: CredentialStoredType[] | [] | undefined = walletModel.getStoredCredentials();
    console.log('Verified Credentials from local storage before updated : ', storedVCs);
    if (!storedVCs) {
      storedVCs = [];
    }
    const storeDecodedVC = new CredentialDecoder(vc.credential).formattedCredential;
    const updatedVCs = storedVCs && [...storedVCs, storeDecodedVC];
    console.log('updatedVCs: ', updatedVCs);
    walletModel.storeVerifiedCredentials(JSON.stringify(updatedVCs));
    console.log(
      'Verified Credentials from local storage after updated : ',
      walletModel.getStoredCredentials()
    );
    // and we store it in app state
    dispatch(credentialAdded(storeDecodedVC));
    setIsVC(true);
  };

  const onDownloadVC = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    dc: DefferedCredentialType
  ) => {
    e.preventDefault();

    const getVCOptions = {
      url: dc.deferredEndpoint,
      acceptance_token: dc.acceptance_token,
    };
    try {
      const resultVCResponse = await dispatch(getCredentials(getVCOptions));
      const promiseVCRespResult = unwrapResult(resultVCResponse);

      if (promiseVCRespResult) {
        toUpdateStoredDCs(dc.acceptance_token);
        toAddStoredVC(promiseVCRespResult);
      }
    } catch (e) {
      console.error('Error:', e);
      type DCError = {
        status: number;
        message: string;
      };

      const displayAlert = () => {
        console.log('displayAlert!!');

        setIsErrorWindow(true);
        timerRef.current = setTimeout(() => {
          setIsErrorWindow(false);
        }, 3000);
      };

      switch ((e as DCError).status) {
        case 400:
          // display floating window with error message for 3 sec
          displayAlert();
          break;
        case 404:
          // display floating window with error message for 3 sec
          displayAlert();
          break;
        default:
          // default error handling
          displayAlert();
          return;
      }
    }
  };

  const onShowDeleteDCAlert = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    dc: DefferedCredentialType['acceptance_token']
  ) => {
    e.preventDefault();
    setComponentToRemove(dc);
    setIsDeleteAlert(true);
  };

  const onDeleteDC = () => {
    console.log(
      'num of storage  DCs in the begginning: ',
      walletModel.getDeferredRequestsList().length
    );

    componentToRemove && toUpdateStoredDCs(componentToRemove);
    setIsDeleteAlert(false);
  };

  if (loadingCredentialsStatus === 'loading') {
    return (
      <CircularProgress
        style={{marginTop: '40vh', marginLeft: '40vw', width: '60px', height: '60px'}}
      />
    );
  }

  const toCloseCredentialSaveAlert = () => setIsVC(false);

  return (
    <Container>
      <CredentialSaveAlert isVC={isVC} toCancel={toCloseCredentialSaveAlert} />
      {isErrorWindow && (
        <DownloadAlert
          message={errorOnLoadCredential as string}
          setIsErrorWindow={setIsErrorWindow}
        />
      )}
      {isDeleteAlert && componentToRemove && (
        <DeleteCredentialAlert
          setIsDeleteAlert={setIsDeleteAlert}
          onDelete={onDeleteDC}
          type={'deferred'}
        />
      )}
      <Box sx={{textAlign: 'center'}} px={5}>
        <Typography variant="h2" className="govcy-h2">
          {' '}
          Deferred Credentials
        </Typography>
        <Typography>Check for and download any deferred credentials</Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center" alignItems="space-around">
        {deferredCredentials?.length === 0 && (
          <Typography sx={{textAlign: 'center', py: 4, fontSize: '1.3rem'}}>
            You have no deferred credentials.
          </Typography>
        )}
        {deferredCredentials &&
          deferredCredentials.map((dc) => {
            return (
              <Grid
                container
                xs={12}
                spacing={0}
                direction="column"
                alignItems="center"
                justifyContent="center"
                key={dc.acceptance_token}
              >
                <Box sx={{padding: 2}}>
                  <Card
                    sx={{
                      boxShadow: 3,
                      borderRadius: '30px',
                      padding: '20px',
                      width: '600px',
                      // height: '300px',
                      backgroundColor: '#ebf1f3',
                    }}
                  >
                    <CardContent
                      sx={{
                        display: 'flex',
                        // justifyContent: 'space-between',
                        flexDirection: 'column',
                        // height: '60%',
                      }}
                    >
                      <Typography variant="subtitle1" fontSize={'1.2rem'}>
                        VC name: {dc.vctype}
                      </Typography>
                      <Typography variant="subtitle1" fontSize={'1.2rem'}>
                        VC issuer: {dc.issuer}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Stack
                        spacing={5}
                        justifyContent="center"
                        direction="row"
                        width={'100%'}
                        padding={3}
                      >
                        <Button
                          variant="contained"
                          size="medium"
                          className="govcy-btn-primary"
                          // sx={{width: 130, padding: 1}}
                          onClick={async (e) => await onDownloadVC(e, dc)}
                        >
                          Download
                        </Button>
                        <Button
                          variant="outlined"
                          size="medium"
                          className="govcy-btn-secondary"
                          // sx={{width: 130, padding: 1}}
                          onClick={(e) => onShowDeleteDCAlert(e, dc.acceptance_token)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </CardActions>
                  </Card>
                </Box>
              </Grid>
            );
          })}
      </Grid>
    </Container>
  );
};

export default React.memo(DeferredCredentials);
