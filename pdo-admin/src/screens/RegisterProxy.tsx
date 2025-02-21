import { MouseEvent, useState } from 'react';
import AdminApiService from '../api/AdminApiService';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import ErrorAlert from '../components/ErrorAlert';
import CircularProgress from '@mui/material/CircularProgress';

const RegisterProxy = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e: MouseEvent<HTMLButtonElement>) => {
    try {
      setLoading(true);
      const registerResponse = await AdminApiService.postRegister();
      console.log('loginResponse : ', registerResponse);
      if (registerResponse) {
        console.log('registered: ');
      }
    } catch (err) {
      console.log('err: ', err);
      if (!(err as Error).message) {
        setErrorMessage('There is no connection');
      } else {
        setErrorMessage((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  };

  const onAlertClose = () => {
    setErrorMessage('');
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

  return (
    <Box sx={{ p: 6 }}>
      <Typography variant="h4">Register Proxy</Typography>
      <ErrorAlert
        message={errorMessage}
        isErrorWindow={errorMessage.length > 0}
        onClose={onAlertClose}
      />
      <Stack
        spacing={5}
        justifyContent="center"
        direction="column"
        width={'80%'}
        paddingBottom={3}
        paddingTop={2}
      >
        <Typography>
          Register your issuer server to EBSI so that verifiers can send queries to it concerning
          the revocation status of VCs that you will issue to wallet holders.
        </Typography>
        <Typography>
          The revocation status of every VC that you will issue will be kept in a local database.
        </Typography>
        <Typography>
          You may revoke a VC using the revoke option under the issued VC details.
        </Typography>
      </Stack>

      <Button variant="contained" size="medium" onClick={handleRegister} sx={{ fontWeght: 'bold' }}>
        Register
      </Button>
    </Box>
  );
};

export default RegisterProxy;
