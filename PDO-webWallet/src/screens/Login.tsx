import React, {MouseEvent, ChangeEvent, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import WalletModel from '../models/WalletModel';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Header from '../components/Header';

interface PropsLogin {
  walletModel: WalletModel;
  setWalletOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Login = ({walletModel, setWalletOpen}: PropsLogin) => {
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const {state, pathname} = useLocation();
  console.log('Path and prev path: ', pathname, state?.previousPath);

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setError('');
    setPassword(event.target.value);
  };

  const handleLogin = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!password) {
      setError('Please insert your password');
    }
    try {
      walletModel.openWallet(password);
      setWalletOpen(true);
      setPassword('');
      if (!state) {
        navigate('/PendingTasks');
      } else {
        navigate(state?.previousPath);
      }
    } catch (err) {
      setError((err as Error).message);
      setWalletOpen(false);
    }
  };

  // const handleBackToWelcomeScreen = (event: MouseEvent<HTMLButtonElement>) => {
  //   event.preventDefault();
  //   navigate('/');
  // };

  return (
    <>
      <Header isWalletBar={false} />
      <Box
        sx={{
          p: 6,
          height: '60vh',
          maxHeight: '700px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        <Typography variant="h2" className="govcy-h2">
          Open Wallet
        </Typography>
        <Typography>The wallet will be loaded from your browser's local storage.</Typography>
        <Stack
          spacing={5}
          justifyContent="center"
          direction="column"
          width={'25%'}
          maxWidth={'460px'}
          paddingBottom={3}
          paddingTop={2}
        >
          <label className="govcy-label" htmlFor="password" style={{marginBottom: ' -30px'}}>
            Password
          </label>
          <TextField
            error={error ? true : false}
            type="password"
            id="password"
            placeholder="Password"
            label={error ? 'Error' : 'Please enter your password'}
            value={password}
            //minLength={3}
            required
            onChange={handlePasswordChange}
            helperText={error ? error : null}
            className="govcy-text-input"
          />
        </Stack>
        <Button
          variant="contained"
          size="medium"
          onClick={handleLogin}
          className="govcy-btn-primary"
        >
          Open wallet
        </Button>
      </Box>
    </>
  );
};

export default Login;
