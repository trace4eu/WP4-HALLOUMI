import React, {useState} from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import PersonIcon from '@mui/icons-material/Person';
import {CredentialStoredType} from '../types/typeCredential';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Typography from '@mui/material/Typography';
import WalletModel from '../models/WalletModel';
import getVerifiablePresentationJwt from '../helpers/getVerifiablePresentationJwt';
import {JWK} from 'jose';
import generatePresentationSubmission from '../helpers/generatePresentationSubmission';
//import ApiService from '../features/api/ApiService';
import ErrorDownloadAlert from '../components/ErrorDownloadAlert';
import CircularProgress from '@mui/material/CircularProgress';
import {useNavigate} from 'react-router-dom';
import ShareVCsModal from '../components/ShareVCsModal';
import {apiService} from '../index';
import Paper from '@mui/material/Paper';

interface FormValues {
  verifier_name: string;
  verifier_email: string;
  validity: string;
}

interface PropsShareDetailsForm {
  selectedVCs: CredentialStoredType[];
  walletModel: WalletModel;
}

const ShareDetailsForm = ({selectedVCs, walletModel}: PropsShareDetailsForm) => {
  const [formValues, setFormValues] = useState<FormValues>({
    verifier_name: '',
    verifier_email: '',
    validity: '',
  });

  const [errors, setErrors] = useState<Partial<FormValues>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isErrorWindow, setIsErrorWindow] = useState(false);
  const [isVCShared, setIsVCShared] = useState(false);
  const navigate = useNavigate();

  const selectedCredetialTypes = selectedVCs.map((vc) => vc.type) as string[];
  const selectedjwtvcs = selectedVCs.map((vc) => vc.jwt) as string[];

  const handleInputFocus = (field: keyof FormValues) => {
    errors[field] &&
      setErrors((prevValues) => ({
        ...prevValues,
        [field]: undefined,
      }));
  };

  const handleInputChange = (field: keyof FormValues, value: string) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [field]: value,
    }));
  };

  const sendVPGW = async (
    selectedCredentialTypes: string[],
    verifier_name: string,
    verifier_email: string,
    validity: string,
    selectedjwtvcs: string[]
  ) => {
    setLoading(true);

    interface Ivprequest {
      redirect_Uri: string;
      gw_name: string;
      gw_email: string;
      gw_period: string;
      id: string;
      state: string;
      client_id: string;
    }

    const vprequest: Ivprequest = {
      redirect_Uri: `${process.env.REACT_APP_PDO_BACKEND_URL}/v3/verifier/share`,
      gw_name: verifier_name,
      gw_email: verifier_email,
      gw_period: validity,
      id: 'gwpresentation',
      state: 'na',
      client_id: `${process.env.REACT_APP_PDO_BACKEND_URL}/v3/verifier`,
    };

    const audience = vprequest.client_id;
    const walletDID = walletModel.getDID();
    const privateKeyJwk = walletModel.getKeys() as JWK;

    const vpJwt = await getVerifiablePresentationJwt(
      audience,
      walletDID as string,
      selectedjwtvcs,
      privateKeyJwk
    );

    const presentationDefinition = undefined;
    const definitionId = vprequest.id;

    const presentationSubmission = generatePresentationSubmission(
      selectedCredentialTypes,
      presentationDefinition,
      definitionId
    );

    const redirect_uri = vprequest.redirect_Uri;

    const vpTokenData = {
      vp_token: vpJwt,
      verifier_name: vprequest.gw_name,
      verifier_email: vprequest.gw_email,
      validity_period: vprequest.gw_period,
      presentation_submission: JSON.stringify(presentationSubmission),
    };

    try {
      const directPostRespData = await apiService.getDirectPost(vpTokenData, redirect_uri);
      console.log('directPostRespData: ', directPostRespData);

      if (!directPostRespData || !directPostRespData.redirectUri.includes('successfully')) {
        setMessage('Error while sharing VC(s)');
        setIsErrorWindow(true);
      } else {
        setIsVCShared(true);
      }
    } catch (e) {
      console.error(e);
      setMessage(e as unknown as string);
      setIsErrorWindow(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    // validation
    const newErrors: Partial<FormValues> = {};

    if (!formValues.verifier_name.trim()) {
      newErrors.verifier_name = "Please enter verifier's name";
    }

    if (!formValues.verifier_email.trim()) {
      newErrors.verifier_email = "Please enter verifier's email";
    }

    // check email address validation
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formValues.verifier_email.trim())) {
      newErrors.verifier_email = 'You have entered an invalid email address';
    }

    if (!formValues.validity.trim()) {
      newErrors.validity = 'Please enter number of days';
      // TODO check if number is in string if not throw error
    }
    if (isNaN(+formValues.validity)) {
      newErrors.validity = 'Please enter only numeric value';
    }

    setErrors(newErrors);

    // form submission if there are no errors
    if (Object.keys(newErrors).length === 0) {
      console.log('Form submitted:', formValues);

      sendVPGW(
        selectedCredetialTypes,
        formValues.verifier_name,
        formValues.verifier_email,
        formValues.validity,
        selectedjwtvcs
      );
    }
  };

  const toCloseAlert = () => {
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
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <ShareVCsModal isOpen={isVCShared} handleCloseModal={toCloseAlert} />

      <ErrorDownloadAlert message={message} isErrorWindow={isErrorWindow} onClose={toCloseAlert} />

      <Typography variant="h2" className="govcy-h2" fontWeight="800" py={2}>
        {' '}
        Share details
      </Typography>
      <Paper
        elevation={3}
        sx={{
          padding: 5,
          width: '70vw',
          maxWidth: 1000,
          height: '70vh',
          maxHeight: 600,
          backgroundColor: '#ebf1f3',
        }}
      >
        <Box
          component="form"
          width={'100%'}
          sx={{
            '& .MuiTextField-root': {m: 1, width: '100%'},
            '& .MuiInputBase-root': {paddingBottom: '15px'},
          }}
          display={'flex'}
          flexDirection={'column'}
          fontSize={'1.3rem'}
          p={2}
        >
          <Typography py={2}>
            the following credentials will be shared through the CY EBSI GW:
          </Typography>
          <Typography fontWeight={700}>{selectedCredetialTypes.join(', ')}</Typography>
          <Box py={5}>
            <Stack justifyContent="space-between" direction="row" alignItems={'center'}>
              <PersonIcon fontSize="large" sx={{marginRight: '10px'}} />
              <TextField
                label="verfier's name"
                variant="standard"
                value={errors.verifier_name ? "Enter verifier's name" : formValues.verifier_name}
                onChange={(e) => handleInputChange('verifier_name', e.target.value)}
                onFocus={() => handleInputFocus('verifier_name')}
                error={!!errors.verifier_name}
                helperText={errors.verifier_name}
              />
            </Stack>
            <Stack justifyContent="space-between" direction="row" alignItems={'center'}>
              <EmailIcon fontSize="large" sx={{marginRight: '10px'}} />
              <TextField
                label="verfier's email"
                variant="standard"
                value={errors.verifier_email ? "Enter verifier's email" : formValues.verifier_email}
                onChange={(e) => handleInputChange('verifier_email', e.target.value)}
                onFocus={() => handleInputFocus('verifier_email')}
                error={!!errors.verifier_email}
                helperText={errors.verifier_email}
              />
            </Stack>
            <Stack justifyContent="space-between" direction="row" alignItems={'center'}>
              <CalendarTodayIcon fontSize="large" sx={{marginRight: '10px'}} />
              <TextField
                label="validity period (days)"
                variant="standard"
                value={
                  errors.validity ? 'Enter number of days to be kept on GW' : formValues.validity
                }
                onChange={(e) => handleInputChange('validity', e.target.value)}
                onFocus={() => handleInputFocus('validity')}
                error={!!errors.validity}
                helperText={errors.validity}
              />
            </Stack>
          </Box>
          <Stack
            spacing={5}
            justifyContent="center"
            direction="row"
            width={'100%'}
            paddingTop={6}
            paddingBottom={3}
            paddingRight={3}
          >
            <Button
              variant="contained"
              color="primary"
              className="govcy-btn-primary"
              onClick={handleSubmit}
              sx={{px: 2, fontWeight: 700}}
              // fontSize: '1.2rem'
            >
              Proceed
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default ShareDetailsForm;
