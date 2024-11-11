import React, {useState} from 'react';
import {Box, Button, Modal, Typography, TextField, Paper, Container, Stack} from '@mui/material';
import WalletModel from '../models/WalletModel';
import {useNavigate} from 'react-router-dom';

interface IPasswordModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  walletModel: WalletModel;
}

const PasswordModal = ({open, setOpen, setIsAuthenticated, walletModel}: IPasswordModalProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setError(false);
    setPassword(event.target.value);
  };

  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate('/wallet');
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!password) {
      setError(true);
    }
    try {
      walletModel.openWallet(password);
      setIsAuthenticated(true);
      setOpen(false);
      setPassword('');
    } catch (err) {
      setError(true);
    }
  };

  return (
    <Modal open={open}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-around',
          position: 'absolute',
          top: '50%',
          left: '60%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          height: '40%',
          borderRadius: '20px',
        }}
      >
        <Typography variant="h6" component="h2" sx={{mb: 2}}>
          Enter Password
        </Typography>
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          error={error}
          helperText={error ? 'Incorrect password' : ''}
          fullWidth
        />
        <Stack width={'100%'} flexDirection={'row'} justifyContent={'space-between'} paddingTop={2}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{p: 1, width: '40%', maxWidth: '300px', fontWeight: 700}}
          >
            Submit
          </Button>

          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{p: 1, width: '40%', maxWidth: '300px', fontWeight: 700}}
          >
            Close
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default PasswordModal;
