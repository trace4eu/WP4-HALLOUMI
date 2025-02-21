import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

import ErrorModal from '../components/ErrorModal';
import AdminApiService from '../api/AdminApiService';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';

interface ReqOnBoardResponseInterface {
  success: boolean;
  errors?: string[];
}

const OnBoardPage: React.FC = () => {
  const [secretPIN, setSecretPIN] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [success, setSuccess] = useState<boolean | null>(null);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!secretPIN || !url) {
      setErrorMessages(['Both Secret PIN and URL are required.']);
      setSuccess(false);
      return;
    }

    try {
      setLoading(true);
      const getReqOnBoardResp: ReqOnBoardResponseInterface = await AdminApiService.getReqOnBoard(
        url,
        secretPIN
      );
      console.log('ReqOnBoard: ');
      console.log(getReqOnBoardResp);

      if (getReqOnBoardResp.success) {
        setSecretPIN('');
        setUrl('');
        setSuccess(true);
      } else {
        setErrorMessages(getReqOnBoardResp.errors || []);
        setSuccess(false);
      }
    } catch (error) {
      console.error('API request failed:', error);
      // setErrorMessages(['API request failed.']);
      // setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const closeErrorModal = () => {
    setErrorMessages([]);
    setSuccess(null);
  };

  if (loading) {
    return (
      <Box
        sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CircularProgress size="8vw" />
      </Box>
    );
  }

  if (success === true) {
    return (
      <Container
        sx={{
          pt: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color={'green'} variant="h5" gutterBottom mb={1}>
          On Boarding has been completed successfully.
        </Typography>
        <Typography variant="body1" paragraph>
          Please check “View wallet” option.
          <br />
          The DIDRegistry entry should have some values.
        </Typography>
      </Container>
    );
  }

  return (
    !success && (
      <Container
        sx={{
          pt: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {success === false && <ErrorModal error={errorMessages} setError={closeErrorModal} />}
        <Typography variant="h4" gutterBottom textAlign={'center'}>
          Request to On Board to EBSI
        </Typography>

        <Paper elevation={3} sx={{ mt: 4, p: 4, width: 'fit-content' }}>
          <Typography variant="body1" paragraph>
            Selecting Proceed will register your wallet’s details in EBSI’s DID registry.
            <br />
            Please make sure your wallet is not already registered using the “View wallet” option.
            <br />
            You will need to type in the secret PIN and the URL sent to you by an authorized entity.
          </Typography>

          <Stack maxWidth={'500px'}>
            <TextField
              label="Secret PIN"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={secretPIN}
              onChange={(e) => setSecretPIN(e.target.value)}
            />

            <TextField
              label="URL"
              variant="outlined"
              fullWidth
              margin="normal"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </Stack>

          <Button
            variant="outlined"
            color="primary"
            style={{ marginTop: '20px' }}
            onClick={handleSubmit}
          >
            Proceed
          </Button>
        </Paper>
      </Container>
    )
  );
};

export default OnBoardPage;
