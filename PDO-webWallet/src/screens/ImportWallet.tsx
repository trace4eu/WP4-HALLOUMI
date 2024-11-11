import React, {ChangeEvent, MouseEvent, useRef, useState} from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import WalletModel from '../models/WalletModel';
import {useNavigate} from 'react-router-dom';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Header from '../components/Header';

interface PropsImportWallet {
  walletModel: WalletModel;
}

const ImportWallet = ({walletModel}: PropsImportWallet) => {
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  //   'Once you have entered your 12 words (recovery phrase), press import.'
  // );
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const navigate = useNavigate();

  const handleNext = (e: MouseEvent) => {
    e.preventDefault();
    if (password.trim() === '') {
      setPasswordError('Please enter password');
    }
    if (confirmPassword.trim() === '') {
      setConfirmPasswordError('Please enter password');
    }
    if (password.trim() !== confirmPassword.trim()) {
      setPasswordError('Password does not match');
      setConfirmPasswordError('Password does not match');
    } else {
      setPasswordError('');
      setConfirmPasswordError('');
      setStep((prevStep) => prevStep + 1);
    }
  };

  const isValidMnemonic = (mnemonic: string): boolean => {
    const words = mnemonic.trim().split(/\s+/);
    return words.length === 12;
  };

  const handleImport = (e: MouseEvent) => {
    e.preventDefault();
    // save mnemonic phrase in local Storage
    //  walletModel.storeMnemonic(mnemonic);
    //init wallet
    walletModel.importWithMnemonic(password, mnemonic);
    // Redirect to wallet page
    navigate('/');
  };

  const steps = ['Step 1/2', 'Step 2/2'];

  return (
    <>
      <Header isWalletBar={false} />
      <Box sx={{p: 6, maxWidth: 700, mx: 'auto', textAlign: 'center'}}>
        <Typography variant="h2" className="govcy-h2" py={3} gutterBottom>
          Import account
        </Typography>
        <Typography sx={{py: 2}}>{steps[step - 1]}</Typography>
        <Stepper activeStep={step - 1} sx={{py: 3}}>
          {steps.map((_label, index) => (
            <Step key={index}>
              <StepLabel></StepLabel>
            </Step>
          ))}
        </Stepper>

        {step === 1 && (
          <>
            <Typography variant="h6" gutterBottom>
              Set a New Password
            </Typography>
            <Stack
              spacing={2}
              py={3}
              width="30vw"
              height="50vh"
              maxHeight="400px"
              justifyContent="space-around"
            >
              <TextField
                label="Password"
                type="password"
                fullWidth
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!passwordError}
                helperText={passwordError}
              />
              <TextField
                label="Confirm Password"
                type="password"
                fullWidth
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={!!confirmPasswordError}
                helperText={confirmPasswordError}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={!password || !confirmPassword || password !== confirmPassword}
                sx={{py: 2, fontWeight: 700}}
              >
                Next
              </Button>
            </Stack>
          </>
        )}
        {step === 2 && (
          <>
            <Typography variant="h6" gutterBottom>
              Enter your recovery phrase here.
            </Typography>
            <Stack
              spacing={2}
              py={3}
              width="40vw"
              height="50vh"
              maxHeight="600px"
              justifyContent="space-around"
            >
              <TextField
                //defaultValue="Once you have entered your 12 words (recovery phrase), press import."
                label="Once you have entered your 12 words (recovery phrase), press import."
                required
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleImport}
                disabled={!isValidMnemonic(mnemonic)}
                sx={{py: 2, fontWeight: 700}}
                fullWidth
              >
                Import
              </Button>
            </Stack>
          </>
        )}
      </Box>
    </>
  );
};

export default ImportWallet;
