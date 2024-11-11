import React, {ChangeEvent, useEffect, useState} from 'react';
import WalletModel from '../models/WalletModel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorDownloadAlert from '../components/ErrorDownloadAlert';
import {apiService} from '../index';
import Stack from '@mui/material/Stack';
import CredentialDecoder from '../helpers/credentialDecoder';
import CredentialStorageHelper from '../helpers/credentialStorageHelper';
import {useAppDispatch} from '../features/hooks';
import {credentialAdded, credentialsAddAll, credentialsRemoved} from '../features/credentialSlice';
import CredentialSaveAlert from '../components/CredentialSaveOrShareOrDeleteAlert';
import {CredentialStoredType, issuanceCertificateCardDetails} from '../types/typeCredential';

interface PropsReqLicenseVC {
  walletModel: WalletModel;
}

const ReqLicenseVC = ({walletModel}: PropsReqLicenseVC) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pinCode, setPinCode] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isVC, setIsVC] = useState(false);
  const [storeFormatVC, setStoreFormatVC] = useState<CredentialStoredType | null>(null);
  const dispatch = useAppDispatch();

  const handlePinInput = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setPinError('');
    setPinCode(e.target.value);
  };

  // Handle the "Proceed" button click
  const handleProceed = async () => {
    if (!pinCode) {
      setPinError('Please enter a PIN code.');
      return;
    }

    setLoading(true);
    try {
      const verifiedCredential = await apiService.getLicenseVC(pinCode.trim());
      const storeFormatNewVC = new CredentialDecoder(verifiedCredential).formattedCredential;
      setStoreFormatVC(storeFormatNewVC);
      setIsVC(true);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Error retrieving License VC');
    } finally {
      setLoading(false);
    }
  };

  const saveNewVC = () => {
    const storedCredentials = walletModel.getStoredCredentials()
      ? (walletModel.getStoredCredentials() as CredentialStoredType[])
      : [];

    if (storeFormatVC !== null) {
      // Check if there's an existing VC with the same productName and allowedEvent
      const isDuplicate =
        storedCredentials &&
        storedCredentials.some((vc) => {
          if (vc.vcDetails) {
            const details = vc.vcDetails as issuanceCertificateCardDetails;

            return (
              details.productName ===
                (storeFormatVC.vcDetails as issuanceCertificateCardDetails).productName &&
              details.allowedEvent ===
                (storeFormatVC.vcDetails as issuanceCertificateCardDetails).allowedEvent
            );
          }
        });

      if (!isDuplicate) {
        // if not a duplicate we add  VC to local storage VCs array
        CredentialStorageHelper.storeVC(storeFormatVC, walletModel);
        // and we store it in app state
        dispatch(credentialAdded(storeFormatVC));
      } else {
        // if duplicate then we update same productName and allowedEvent VC
        // at local storage and app state
        CredentialStorageHelper.updateVC(storeFormatVC, walletModel);

        const updatedStoredCredentials =
          walletModel.getStoredCredentials() as CredentialStoredType[];

        dispatch(credentialsRemoved());
        dispatch(credentialsAddAll(updatedStoredCredentials));
      }
    }
  };

  const toCloseErrorAlert = () => {
    setError(null);
  };

  const toCloseVCAlert = () => {
    setIsVC(false);
    saveNewVC();
    setPinCode('');
  };

  if (loading) {
    return (
      <Box sx={{height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <CircularProgress size="8vw" />
      </Box>
    );
  }

  return (
    <Container>
      {error && (
        <ErrorDownloadAlert message={error} isErrorWindow={true} onClose={toCloseErrorAlert} />
      )}

      <CredentialSaveAlert isVC={isVC} toCancel={toCloseVCAlert} />

      <Box
        sx={{
          px: 6,
          paddingBottom: 6,
          height: '60vh',
          maxHeight: '700px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
        }}
      >
        <Typography sx={{textAlign: 'center'}} variant="h2" className="govcy-h2">
          Request License VC
        </Typography>

        <Typography sx={{textAlign: 'center'}} variant="h6" className="govcy-h6">
          please enter the pin code that you received from the MoA admin
        </Typography>

        <Stack
          spacing={5}
          justifyContent="center"
          direction="column"
          width={'25%'}
          maxWidth={'460px'}
          py={3}
        >
          <label className="govcy-label" htmlFor="pin" style={{marginBottom: ' -30px'}}>
            PIN Code
          </label>
          <TextField
            error={pinError ? true : false}
            //label="Enter PIN Code"
            label={pinError ? 'Error' : 'Please enter PIN Code'}
            id="pin"
            variant="outlined"
            fullWidth
            value={pinCode}
            onChange={handlePinInput}
            helperText={pinError ? pinError : null}
            required
            className="govcy-text-input"
          />
        </Stack>
        <Button variant="contained" size="medium" onClick={handleProceed} sx={{mt: 2}} fullWidth>
          Proceed
        </Button>
      </Box>
    </Container>
  );
};

export default ReqLicenseVC;
