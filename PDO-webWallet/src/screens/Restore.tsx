import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import Button from '@mui/material/Button';
import UploadIcon from '@mui/icons-material/FileUploadOutlined';
import FileIcon from '@mui/icons-material/DescriptionOutlined';
import WalletModel from '../models/WalletModel';
import PasswordModal from '../components/PasswordModal';
import IconButton from '@mui/material/IconButton';
import ErrorDownloadAlert from '../components/ErrorDownloadAlert';
import CredentialStorageHelper from '../helpers/credentialStorageHelper';
import {useAppDispatch} from '../features/hooks';
import {credentialAdded} from '../features/credentialSlice';

import {CredentialStoredType} from '../types/typeCredential';
import CredentialDecoder from '../helpers/credentialDecoder';
import SuccessAlert from '../components/SuccessAlert';

interface IPropsRestore {
  walletModel: WalletModel;
}

// Restore screen displays a modal or popup window to enter password.
// if password entered correctly display a button to upload file from local storage
// and a button to process the file (disabled before a file is selected)

const Restore = ({walletModel}: IPropsRestore) => {
  const [open, setOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const uploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('file: ', file);
    if (file) {
      setFile(file);
      setFileName(file.name);
      setIsFileSelected(true);
    }
  };

  const insertBckCredentials = (bckCredentials: CredentialStoredType[]) => {
    const walletCredentials: CredentialStoredType[] = walletModel.getStoredCredentials()
      ? walletModel.getStoredCredentials()
      : [];

    console.log('bckCredentials:');
    console.log(bckCredentials);
    console.log('===============');
    const existingJwts = new Set(walletCredentials.map((credential) => credential.jwt));

    bckCredentials.forEach((credential) => {
      if (!existingJwts.has(credential.jwt)) {
        console.log('if !existingJwts.has(credential.jwt)');

        console.log(credential.jwt);
        console.log('==============');
        // Format the credential for the store if  bckCredentials have other type
        // Adjust this as per wallet store format requirements
        const storeFormatVC = new CredentialDecoder(credential.jwt).formattedCredential;

        console.log('storeFormatVC: ', storeFormatVC);
        console.log('==============');

        // Store the new credential
        CredentialStorageHelper.storeVC(storeFormatVC, walletModel);

        // Dispatch the action to add the new credential to the store
        dispatch(credentialAdded(storeFormatVC));
      }
    });
  };

  const restoreFile = async (e: React.MouseEvent) => {
    e.preventDefault();
    const walletCredentials = walletModel.getStoredCredentials();
    console.log('wallet vcs: ');
    console.log(walletCredentials);
    console.log('===============');

    try {
      if (file) {
        const bckCredentials = await walletModel.processRestoreFile(file);

        if (bckCredentials.length > 0) {
          insertBckCredentials(bckCredentials);
        }
        setIsAlertOpen(true);
      } else {
        throw new Error('No file found');
      }
    } catch (error) {
      console.error(error);
      setError('Error when restoring file');
    }
  };

  const onSuccessAlertClose = () => {
    setIsAlertOpen(false);
    // Redirect user to "wallet" screen and display added credentials
    navigate('/wallet');
  };

  const ALERT_TEXT = 'Restore successful!';

  return !isAuthenticated ? (
    <PasswordModal
      open={open}
      setOpen={setOpen}
      setIsAuthenticated={setIsAuthenticated}
      walletModel={walletModel}
    />
  ) : (
    <Container
      sx={{
        minHeight: '70vh',
        paddingTop: 5,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {error !== null && (
        <ErrorDownloadAlert
          message={error}
          isErrorWindow={error !== null}
          onClose={() => setError(null)}
        />
      )}
      <SuccessAlert isOpen={isAlertOpen} onClose={onSuccessAlertClose} alertText={ALERT_TEXT} />
      <Box sx={{textAlign: 'center', width: '100%'}}>
        <Typography variant="h2" className="govcy-h2" gutterBottom>
          Restore credentials
        </Typography>

        <Typography sx={{my: 3}}>Step 2: Upload your credentials backup file</Typography>

        {/* Hidden input element for file selection */}
        <input
          type="file"
          id="fileInput"
          accept=".txt"
          style={{display: 'none'}}
          onChange={uploadFile}
        />

        <IconButton
          sx={{width: 'fit-content'}}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('fileInput')?.click();
          }}
        >
          {' '}
          {!isFileSelected ? <UploadIcon sx={{fontSize: 30}} /> : <FileIcon sx={{fontSize: 30}} />}
          <Typography fontWeight={500} variant="body1" textAlign={'center'} paddingLeft={1}>
            {!isFileSelected ? 'Upload file' : `${fileName}`}
          </Typography>
        </IconButton>
      </Box>

      <Button
        variant="contained"
        color="primary"
        className="govcy-btn-primary"
        sx={{
          width: '30%',
          maxWidth: '300px',
          //fontWeight: 700,
          fontSize: '1.2rem',
        }}
        disabled={!isFileSelected}
        onClick={restoreFile}
      >
        Process File
      </Button>
    </Container>
  );
};

export default Restore;
