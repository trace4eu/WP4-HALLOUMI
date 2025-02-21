import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import AdminApiService from '../api/AdminApiService';
import Paper from '@mui/material/Paper';
import { Stack } from '@mui/material';
import ErrorModal from '../components/ErrorModal';

// structure of the wallet capabilities response
interface NewWalletResponse {
  Did: string;
  privateKeyHex: string;
  [key: string]: string;
}

const NewWallet = () => {
  const [data, setData] = useState<NewWalletResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to call the getNewWallet API
  const fetchWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      const wallet = await AdminApiService.getNewWallet();
      console.log('walletCap: ');
      console.log(wallet);
      setData(wallet);
    } catch (err: unknown) {
      console.log('err: ', err);
      if (!(err as Error).message) {
        setError('An error occurred');
      }
      if (typeof err === 'string') {
        setError(err);
      } else {
        setError((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Proceed button click call GET new wallet  endpoint
  const handleProceed = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    fetchWallet();
  };

  // Render  ISSUER KID  and KEYs and its values
  const renderObject = () => {
    return (
      data && (
        <Stack spacing={2}>
          <Typography variant="body1" fontSize={'1.2em'} pb={2}>
            Please edit your issuer’s config file and <strong>replace</strong> the following
            variables:
          </Typography>
          <Typography variant="body1" pb={2} sx={{ color: 'text.secondary' }}>
            <strong>ISSUER_KID</strong>={data.Did}#keys-3
          </Typography>
          <Typography variant="body1" pb={2} sx={{ color: 'text.secondary' }}>
            <strong>ISSUER_KID_ES256K</strong>={data.Did}#keys-1
          </Typography>
          <Typography variant="body1" pb={2} sx={{ color: 'text.secondary' }}>
            <strong>ISSUER_PRIVATE_KEY</strong>={data.privateKeyHex}
          </Typography>
          <Typography variant="body1" pb={2} sx={{ color: 'text.secondary' }}>
            <strong>AUTH_PRIVATE_KEY</strong>={data.privateKeyHex}
          </Typography>

          <Typography variant="h6" pt={2}>
            Save the config file and restart your issuer module
          </Typography>
        </Stack>
      )
    );
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

  const closeErrorModal = () => setError(null);

  return (
    <Stack display={'flex'} flexDirection="column" alignItems="center" pt={3}>
      <Typography variant="h4" gutterBottom width={'100%'} textAlign={'center'} mb={3}>
        Create new enterprise wallet
      </Typography>
      {!data && (
        <Paper elevation={3} sx={{ mt: 4, maxWidth: '650px' }}>
          <Stack spacing={2} p={3}>
            <Typography>
              Pressing Proceed will generate a new DID and private key for a new wallet.
            </Typography>
            <Typography>Are you sure?</Typography>
            <Button variant="outlined" onClick={handleProceed}>
              Proceed
            </Button>
          </Stack>
        </Paper>
      )}

      {data && (
        <Paper elevation={3} sx={{ mt: 4 }}>
          <Box p={4}>{renderObject()}</Box>
        </Paper>
      )}

      {/* Error dialog */}
      <ErrorModal error={error} setError={closeErrorModal} />
    </Stack>
  );
};

export default NewWallet;
