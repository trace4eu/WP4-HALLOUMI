import React, {MouseEvent, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import WalletModel from '../models/WalletModel';
import Stack from '@mui/material/Stack';
import Header from '../components/Header';

interface PropsWelcome {
  walletModel: WalletModel;
}

export const Welcome = ({walletModel}: PropsWelcome) => {
  const [isWalletExists, setIsWalletExists] = useState(false);
  const navigate = useNavigate();

  // if did and keys are in local storage then password is required to open existed wallet
  // if not did and keys then two options:
  // a - create new wallet by typing password
  // b - export from json existed
  useEffect(() => {
    const areNotKeys = walletModel.keysNotExist();
    !areNotKeys && setIsWalletExists(true);
  }, []);

  // import existing wallet details
  // const handleImport = (e: MouseEvent<HTMLButtonElement>) => {
  //   e.preventDefault();
  //   navigate('/import');
  // };

  return (
    <>
      <Header isWalletBar={false} />
      <Box
        sx={{
          px: 6,
          height: '60vh',

          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-around',
          maxHeight: '700px',
        }}
      >
        {isWalletExists ? (
          <>
            <Typography variant="h2" className="govcy-h2">
              Welcome back to PDO Wallet!
            </Typography>
            <Typography>We've detected that you already have a wallet on this browser.</Typography>
            <Button
              variant="contained"
              size="medium"
              sx={{p: 1.5}}
              className="govcy-btn-primary"
              onClick={(e: MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                navigate('/login');
              }}
            >
              Use your existing wallet
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h2" className="govcy-h2">
              Welcome to PDO Wallet!
            </Typography>
            <Box sx={{textAlign: 'center'}} padding={3}>
              <Typography>We have not detected a wallet in this browser.</Typography>
              <Typography>
                If you have already created a wallet on a different browser please reload this page
                again using that browser.
              </Typography>

              <Typography>You can create a new wallet or import existing.</Typography>
            </Box>
            <Stack
              py={3}
              spacing={{xs: 10}}
              direction="row"
              useFlexGap
              flexWrap="wrap"
              width="80vw"
              justifyContent="center"
            >
              <Button
                variant="contained"
                size="medium"
                sx={{padding: 2, minWidth: '200px'}}
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  navigate('/signup');
                }}
              >
                Create new wallet
              </Button>
              {/* <Button
                variant="outlined"
                color="primary"
                onClick={handleImport}
                sx={{padding: 2, minWidth: '200px'}}
              >
                Import existing wallet
              </Button> */}
            </Stack>
          </>
        )}
      </Box>
    </>
  );
};
