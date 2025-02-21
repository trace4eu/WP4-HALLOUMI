import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';

import ErrorModal from '../components/ErrorModal';
import AdminApiService, { accrAsType } from '../api/AdminApiService';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';

interface ReqAccreditResponseInterface {
  success: boolean;
  errors?: string[];
}

const ACCREDIT_SELECTION = {
  TAO: 'TAO' as accrAsType,
  TI: 'TI' as accrAsType,
};

const AccreditationPage: React.FC = () => {
  const [secretPIN, setSecretPIN] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [accreditAs, setAccreditAs] = useState<accrAsType>(ACCREDIT_SELECTION.TAO);
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
      const response: ReqAccreditResponseInterface = await AdminApiService.getReqAccredit({
        accrAs: accreditAs,
        taoURL: url,
        preAuthCode: secretPIN,
      });

      if (response.success) {
        setSuccess(true);
        setSecretPIN('');
        setUrl('');
        setAccreditAs(ACCREDIT_SELECTION.TAO); // Reset to default
      } else {
        setErrorMessages(response.errors || []);
        setSuccess(false);
      }
    } catch (error) {
      console.error('API request failed:', error);
      setErrorMessages(['API request failed.']);
      setSuccess(false);
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
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        <Typography color={'green'} variant="h5" gutterBottom py={3}>
          Accreditation has been completed successfully.
        </Typography>
        <Typography variant="body1" paragraph>
          Please check the “View wallet” option and replace in the config file the variable:
        </Typography>
        <Typography sx={{ color: 'text.secondary' }} py={2}>
          ISSUER_ACCREDITATION_URL=/trusted-issuers-registry/v4/issuers/DID/attributes/attributeId
        </Typography>
        <br />
        <Typography variant="body1" paragraph>
          where DID and attributeId can be found in the response from “View Wallet”.
          <br />
          <br />
          Save the config file and restart your issuer module.
        </Typography>
      </Container>
    );
  }

  return (
    !success && (
      <Stack display={'flex'} flexDirection="column" alignItems="center" pt={3}>
        {success === false && <ErrorModal error={errorMessages} setError={closeErrorModal} />}

        <Typography variant="h4" gutterBottom textAlign={'center'}>
          Request to be Accredited
        </Typography>

        <Paper elevation={3} sx={{ mt: 4, p: 4, width: 'fit-content' }}>
          <Typography variant="body1" paragraph>
            Selecting Proceed will register your wallet’s details in EBSI’s TIR (Trusted Issuers)
            registry.
            <br />
            Please make sure your wallet is not already registered using the “View wallet” option.
            <br />
            You will need to type in the secret PIN and the URL sent to you by an authorized entity.
            <br />
            You will also need to select if you wish to be accredited as TAO or TI.
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

            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Accredit As</FormLabel>
              <RadioGroup
                value={accreditAs}
                onChange={(e) => setAccreditAs(e.target.value as accrAsType)}
              >
                <FormControlLabel
                  value={ACCREDIT_SELECTION.TAO}
                  control={<Radio />}
                  label={ACCREDIT_SELECTION.TAO}
                />
                <FormControlLabel
                  value={ACCREDIT_SELECTION.TI}
                  control={<Radio />}
                  label={ACCREDIT_SELECTION.TI}
                />
              </RadioGroup>
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              style={{ marginTop: '20px' }}
              onClick={handleSubmit}
            >
              Proceed
            </Button>
          </Stack>
        </Paper>
      </Stack>
    )
  );
};

export default AccreditationPage;
