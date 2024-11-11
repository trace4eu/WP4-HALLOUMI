import React, {useState} from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import WalletModel from '../models/WalletModel';
import PasswordModal from '../components/PasswordModal';
import SuccessAlert from '../components/SuccessAlert';

import ErrorDownloadAlert from '../components/ErrorDownloadAlert';
import {useNavigate} from 'react-router-dom';

interface PropsBackup {
  walletModel: WalletModel;
}

//display a modal or popup window to enter password.
// If password is correct then Display mnemonic

const Backup = ({walletModel}: PropsBackup) => {
  const [open, setOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isNoCredentialAlert, setIsNoCredentialAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [step, setStep] = useState(1);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const navigate = useNavigate();

  const recoveryPhrase: string = walletModel.getMnemonic();
  console.log('recovery->' + recoveryPhrase);
  const recoveryWords: string[] = recoveryPhrase.split(' ');

  const onFileSave = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const credentials = walletModel.getStoredCredentials();

    if (credentials) {
      try {
        const oneORmore = await walletModel.encryptAndDownloadFile();
        setIsAlertOpen(true);
        if (!oneORmore) setErrorMessage('Error on backup file');
        setIsNoCredentialAlert(true);
      } catch (error) {
        console.error(error);
        setErrorMessage('Error on backup file');
        setIsNoCredentialAlert(true);
      }
    } else {
      setErrorMessage('There are no credentials yet.');
      setIsNoCredentialAlert(true);
    }
  };

  const onSuccessAlertClose = () => {
    setIsAlertOpen(false);
    // Redirect user to "wallet" screen
    navigate('/wallet');
  };

  const ALERT_TEXT = 'Backup successful!';

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
      <ErrorDownloadAlert
        message={errorMessage}
        isErrorWindow={isNoCredentialAlert}
        onClose={() => setIsNoCredentialAlert(false)}
      />
      <SuccessAlert isOpen={isAlertOpen} onClose={onSuccessAlertClose} alertText={ALERT_TEXT} />

      <Box sx={{textAlign: 'center', width: '100%'}}>
        <Typography variant="h2" className="govcy-h2" gutterBottom>
          Backup credentials
        </Typography>
        {step === 2 && (
          <Typography variant="subtitle1" sx={{my: 2}}>
            Step 2/2
          </Typography>
        )}
        <Box
          sx={{
            p: 2,
            width: '50%',
            margin: '0 auto',
            display: 'flex',

            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{width: '47%', height: '4px', backgroundColor: 'orange'}} />
          <Box
            sx={{
              width: '47%',
              height: '4px',
              backgroundColor: step === 1 ? 'none' : 'orange',
            }}
          />
        </Box>
        <Typography variant="body1" sx={{marginY: 4, whiteSpace: 'pre-line'}}>
          {step === 1
            ? 'To backup your credentials write down your Recovery Phrase and keep it in a safe place.'
            : 'Download the backup file. \n Keep it in a safe place.'}
        </Typography>
      </Box>

      {step === 1 ? (
        <Grid container spacing={2}>
          {recoveryWords.map((word, index) => (
            <Grid item xs={4} key={index}>
              <Box
                sx={{
                  border: '2px solid #31576f',
                  padding: 2,
                  borderRadius: '50px',
                  textAlign: 'center',
                  fontSize: '16px',
                }}
              >
                {index + 1}. {word}
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          <Typography variant="body1" color="orange" sx={{marginBottom: 4}}>
            To recover all your credentials you will need the Recovery Phrase AND this backup file.
          </Typography>
          <DownloadIcon sx={{fontSize: 60, marginBottom: 4}} />
        </>
      )}

      {step === 1 ? (
        <Box sx={{textAlign: 'center', marginTop: 4}}>
          <Button
            variant="contained"
            className="govcy-btn-primary"
            sx={{
              maxWidth: '300px',
              fontSize: '1.2rem',
            }}
            onClick={(e) => {
              e.preventDefault();
              setStep(2);
            }}
          >
            Next
          </Button>
        </Box>
      ) : (
        <Button
          variant="contained"
          color="primary"
          className="govcy-btn-primary"
          sx={{
            maxWidth: '300px',
            fontSize: '1.2rem',
          }}
          onClick={onFileSave}
        >
          Save the file
        </Button>
      )}
    </Container>
  );
};

export default Backup;
