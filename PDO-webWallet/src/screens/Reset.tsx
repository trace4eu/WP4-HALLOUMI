import {useState} from 'react';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';

import {useTheme} from '@mui/material/styles';
import WalletModel from '../models/WalletModel';
import {useNavigate} from 'react-router-dom';

interface PropsReset {
  walletModel: WalletModel;
}

const Reset = ({walletModel}: PropsReset) => {
  const [checkedRecoveryPhrase, setCheckedRecoveryPhrase] = useState(false);
  const [checkedBackupFile, setCheckedBackupFile] = useState(false);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  const handleResetWallet = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setPassword('');
    setError('');
  };

  const handleConfirm = () => {
    try {
      walletModel.openWallet(password);
      setPassword('');
      //navigate('/create-or-import-wallet');
      walletModel.clear();
      navigate('/');
    } catch (err) {
      setError('Incorrect password. Please try again.');
      console.error((err as Error).message);
    }
  };

  return (
    <Box sx={{px: 6, mx: 'auto'}}>
      {/* <Typography variant="h6" gutterBottom> */}
      <Typography
        sx={{textAlign: 'center'}}
        variant="h2"
        className="govcy-h2"
        fontWeight="fontWeightBold"
      >
        Reset Wallet
      </Typography>
      <Typography sx={{textAlign: 'center', py: 4, fontSize: '1rem'}} fontWeight="fontWeightBold">
        Are you sure you want to reset your wallet?
      </Typography>
      <Typography sx={{textAlign: 'center', py: 2, fontSize: '1rem'}}>
        This action will erase your data. Please make sure you have saved your Recovery Phrase and
        credentials backup file before deleting.
      </Typography>
      <Typography
        sx={{textAlign: 'center', py: 2, fontSize: '1rem', color: 'orange'}}
        paddingBottom={3}
      >
        eKibisis is self-custodian so we are not able to recover your credentials for you
      </Typography>
      <Stack
        spacing={5}
        justifyContent="center"
        direction="column"
        width={'100%'}
        paddingBottom={3}
        paddingTop={2}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={checkedRecoveryPhrase}
              sx={{fontWeght: 700}}
              onChange={(e) => setCheckedRecoveryPhrase(e.target.checked)}
            />
          }
          label="I wrote down my Recovery Phrase"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={checkedBackupFile}
              sx={{fontWeght: 700}}
              onChange={(e) => setCheckedBackupFile(e.target.checked)}
            />
          }
          label="I saved my backup credentials file"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleResetWallet}
          disabled={!checkedRecoveryPhrase || !checkedBackupFile}
          sx={{
            width: '35%',
            maxWidth: '200px',
            padding: 2,
            fontWeight: 700,
            fontSize: '1rem',
            alignSelf: 'center',
          }}
          style={{color: '#fff'}}
        >
          Reset Wallet
        </Button>
      </Stack>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Enter Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To reset your wallet, please enter your password to confirm.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="standard"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button className="govcy-btn-secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button className="govcy-btn-primary" onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reset;
