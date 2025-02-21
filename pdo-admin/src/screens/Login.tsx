import React, { MouseEvent, ChangeEvent, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminApiService from '../api/AdminApiService';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ErrorAlert from '../components/ErrorAlert';
import { cardType, issuanceModeType } from '../types';
import CircularProgress from '@mui/material/CircularProgress';
import { profile } from 'console';

interface IProfile {
  
  orgName: string;
  
}

interface PropsLogin {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setOrgName: React.Dispatch<React.SetStateAction<string | null>>;
}

const Login = ({ setIsLoggedIn, setOrgName }: PropsLogin) => {
  const [errorName, setErrorName] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [localOrgName, setLocalOrgName] = useState('');
  const [username, setUserName] = useState('');

  const navigate = useNavigate();

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setErrorName('');
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setErrorPassword('');
    setPassword(event.target.value);
  };

  const handleLogin = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!password) {
      setErrorPassword('Please insert your password');
    }
    if (!email) {
      setErrorName('Please insert your password');
    }
    try {
      setLoading(true);
      const loginResponse = await AdminApiService.toLogin(email, password);
      console.log('loginResponse in LOGIN: ', loginResponse);
      if (loginResponse.message === 'Login Successfully') {
        setIsLoggedIn(true);
        setPassword('');
        setEmail('');
        setUserName(loginResponse.name)

        // const profile: IProfile = await AdminApiService.getProfile();
        // console.log('logged in and profile is: ', profile);
        // setOpMode(profile.opMode);
        // setOrgName(profile.orgName);
        // setLocalOrgName(profile.orgName);

        navigate('/admin', { state: { username } });
      }
    } catch (err) {
      console.log('err: ', err);
      if (!(err as Error).message) {
        setErrorMessage('There is no connection');
      } else {
        setErrorMessage((err as Error).message);
      }

      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const onAlertClose = () => {
    setErrorMessage('');
  };


  const getProfile =async () => {
    const profile: IProfile = await AdminApiService.getProfile();
    console.log('profile is: ', profile);
    
    setOrgName(profile.orgName);
    setLocalOrgName(profile.orgName);
  }
  

  useEffect(() => {
    getProfile();

    }, []);

  return loading ? (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress size="8vw" />
    </Box>
  ) : (
    <Box sx={{ p: 6 }}>
       <Typography variant="h4">{localOrgName}</Typography>
      <Typography  marginTop={'15px'} variant="h6">PDO Admin Panel</Typography>
      <Typography py={3}>Please enter your email and password</Typography>
      <ErrorAlert
        message={errorMessage}
        isErrorWindow={errorMessage.length > 0}
        onClose={onAlertClose}
      />
      <Stack
        spacing={5}
        justifyContent="center"
        direction="column"
        width={'50%'}
        maxWidth={'500px'}
        paddingBottom={3}
        paddingTop={2}
      >
        <TextField
          error={errorName ? true : false}
          type="text"
          id="username"
          placeholder="Email"
          label={errorName ? 'Error' : 'Please enter your email'}
          value={email}
          required
          onChange={handleUsernameChange}
          helperText={errorName ? errorName : null}
        />
      </Stack>
      <Stack
        spacing={5}
        justifyContent="center"
        direction="column"
        width={'50%'}
        maxWidth={'500px'}
        paddingBottom={3}
        paddingTop={2}
      >
        <TextField
          error={errorPassword ? true : false}
          type="password"
          id="password"
          placeholder="Password"
          label={errorPassword ? 'Error' : 'Please enter your password'}
          value={password}
          required
          onChange={handlePasswordChange}
          helperText={errorPassword ? errorPassword : null}
        />
      </Stack>
      <Button variant="contained" size="medium" onClick={handleLogin}>
        Login
      </Button>
    </Box>
  );
};

export default Login;
