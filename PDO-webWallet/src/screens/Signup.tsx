import React, {MouseEvent, useState} from 'react';
import WalletModel from '../models/WalletModel';
import {useNavigate} from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import Checkbox from '@mui/material/Checkbox';
// import Paper from '@mui/material/Paper';

interface PropsSignup {
  walletModel: WalletModel;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const beigeGoldColor = '#d2b48c'; // mnemonic paragraph background color

export const pMnemonicStyle = {
  padding: '10px',
  backgroundColor: beigeGoldColor,
  borderRadius: '5px',
  margin: '20px 0',
  width: 'fit-content',
};

const Signup = ({walletModel, setIsLoggedIn}: PropsSignup) => {
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfo, setPasswordConfo] = useState('');
  const [isNext, setIsNext] = useState(false);
  const navigate = useNavigate();

  const handlePasswordChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    event.preventDefault();
    setError('');
    setPassword(event.target.value);
  };

  const handlePasswordConfoChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    event.preventDefault();
    setError('');
    setPasswordConfo(event.target.value);
  };

  const handleCreate = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!password.trim() || !passwordConfo.trim()) {
      setError('Please enter password.');
    }
    if (password.trim() !== passwordConfo.trim()) {
      setError('Password does not much.');
    } else {
      try {
        // walletModel.initWithMnemonic(password);
        walletModel.initWithRandomPrivKey(password);
        setPassword('');
        setPasswordConfo('');
        setIsLoggedIn(true);

        navigate('/mylicensevc');
        // setIsNext(true);
      } catch (e: unknown) {
        const {message} = e as Error;
        setError(message);
      }
    }
  };

  // const [checked, setChecked] = useState(false);

  // const handleCheckboxChange = () => {
  //   setChecked(!checked);
  // };

  // const confirmMnemonic = (e: MouseEvent<HTMLButtonElement>) => {
  //   e.preventDefault();
  //   setIsLoggedIn(true);

  //   navigate('/wallet');
  // };

  return (
    <Box sx={{p: 6}}>
      <Typography variant="h4" className="govcy-h4">
        Create a New wallet
      </Typography>

      <Typography py={2} variant="h6">
        Please type a password for for opening your wallet.
      </Typography>
      <Typography>clicking next will delete any existing wallet in this browser</Typography>
      <Stack
        spacing={5}
        justifyContent="center"
        direction="column"
        width={'30vw'}
        paddingBottom={3}
        paddingTop={3}
      >
        <label className="govcy-label" htmlFor="password" style={{marginBottom: ' -30px'}}>
          Password
        </label>
        <TextField
          error={error ? true : false}
          type="password"
          id="password"
          //placeholder="Password"
          variant="outlined"
          fullWidth
          label={error ? 'Error' : 'Please enter your password'}
          value={password}
          //minLength={3}
          required
          onChange={handlePasswordChange}
          helperText={error ? error : null}
          margin="normal"
        />
        <label className="govcy-label" htmlFor="passwordConfo" style={{marginBottom: ' -30px'}}>
          Confirm Password
        </label>
        <TextField
          error={error ? true : false}
          type="password"
          id="passwordConfo"
          placeholder="Confirm Password"
          label={error ? 'Error' : 'Confirm your password'}
          value={passwordConfo}
          required
          onChange={(e) => handlePasswordConfoChange(e)}
          helperText={error ? error : null}
        />
      </Stack>

      <Button
        variant="contained"
        size="medium"
        sx={{width: 130, padding: 1}}
        onClick={(e) => handleCreate(e)}
      >
        next
      </Button>
    </Box>
  )
};
export default Signup;
