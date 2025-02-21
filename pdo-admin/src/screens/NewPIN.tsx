import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import AdminApiService, { PIN_TYPE } from '../api/AdminApiService';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';

import ErrorModal from '../components/ErrorModal';

// structure of the wallet capabilities response
interface NewPINResponse {
  pin: string;
  url: string;
  typeDesc: string;
  [key: string]: string;
}

const PIN_TYPE_SELECTION = {
  ONBOARD: 'onboard' as PIN_TYPE,
  ACCR_TAO: 'accrTAO' as PIN_TYPE,
  ACCR_TI: 'accrTI' as PIN_TYPE,
};

const PIN_LABELS = {
  ONBOARD: 'on Board',
  ACCR_TAO: 'Accredit as TAO',
  ACCR_TI: 'Accredit as TI',
};

const NewPIN = () => {
  const [data, setData] = useState<NewPINResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pinType, setPinType] = useState<PIN_TYPE>(PIN_TYPE_SELECTION.ONBOARD);

  // Function to call the getNewWallet API
  const fetchWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      const pin = await AdminApiService.getGenPin(pinType);
      console.log('new PIN: ');
      console.log(pin);
      setData(pin);
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
          <Typography variant="h6" pb={2}>
            Please send the below to the requesting organization:
          </Typography>
          <Typography variant="body1" pt={4}>
            <strong>Secret PIN: </strong>
            <Box component="span" sx={{ color: 'text.secondary' }}>
              {data.pin}
            </Box>
          </Typography>
          <Typography variant="body1" pb={4}>
            <strong>URL: </strong>
            <Box component="span" sx={{ color: 'text.secondary' }}>
              {data.url}
            </Box>
          </Typography>

          <Typography variant="body1" pb={2}>
            The requesting organization can use the above to request to get
            <strong> {data.typeDesc}</strong>
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
      <Typography variant="h4" gutterBottom width={'100%'} mb={3} textAlign={'center'}>
        Generate new PIN
      </Typography>
      {!data && (
        <Paper elevation={3} sx={{ mt: 4, maxWidth: '850px' }}>
          <Stack spacing={2} p={3}>
            <Typography variant="body1" paragraph>
              Selecting Proceed will generate a new secret PIN.
              <br />
              Please send this PIN and your URL to the requesting organization’s administrator via
              SMS.
              <br />
              You will need to select if the requesting organization will use this PIN to onboard or
              get accredited.
            </Typography>
            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">PIN to be used to get:</FormLabel>
              <RadioGroup value={pinType} onChange={(e) => setPinType(e.target.value as PIN_TYPE)}>
                <FormControlLabel
                  value={PIN_TYPE_SELECTION.ONBOARD}
                  control={<Radio />}
                  label={PIN_LABELS.ONBOARD}
                />
                <FormControlLabel
                  value={PIN_TYPE_SELECTION.ACCR_TAO}
                  control={<Radio />}
                  label={PIN_LABELS.ACCR_TAO}
                />
                <FormControlLabel
                  value={PIN_TYPE_SELECTION.ACCR_TI}
                  control={<Radio />}
                  label={PIN_LABELS.ACCR_TI}
                />
              </RadioGroup>
            </FormControl>
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

export default NewPIN;
