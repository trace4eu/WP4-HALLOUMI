import React, {useState, useEffect} from 'react';
import IconButton from '@mui/material/IconButton';
import FileCopyRoundedIcon from '@mui/icons-material/FileCopyRounded';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CopiedDIDAlert from './SuccessAlert';

interface IDecentralizedIDKeyProps {
  didPrivateKey: string;
  setOnRevealKeyOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TIMER_SEC = 20;

const DecentralizedIDKey = ({didPrivateKey, setOnRevealKeyOpen}: IDecentralizedIDKeyProps) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [countdown, setCountdown] = useState(TIMER_SEC);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setOnRevealKeyOpen(false);
    }
  }, [countdown]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(didPrivateKey);
    setAlertOpen(true);
  };

  const onAlertClose = () => {
    setAlertOpen(false);
  };

  const ALERT_TEXT = 'Copied to clipboard!';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
      }}
    >
      <Typography variant="h2" className="govcy-h3" py={2} gutterBottom>
        Decentralized ID key
      </Typography>
      <Paper
        elevation={3}
        sx={{
          padding: 5,
          width: '70vw',
          maxWidth: 1000,
          height: '70vh',
          maxHeight: 600,
          textAlign: 'center',
          backgroundColor: '#ebf1f3',
        }}
      >
        <Typography variant="body1" sx={{wordBreak: 'break-all', fontWeight: 500}}>
          DID private key
        </Typography>
        <Typography variant="body2" sx={{wordBreak: 'break-all', marginBottom: 2}}>
          {`${didPrivateKey}`}
        </Typography>
        <IconButton onClick={copyToClipboard}>
          <FileCopyRoundedIcon sx={{color: 'orange'}} />
          <Typography fontWeight={500} variant="body1" textAlign={'center'} paddingLeft={1}>
            Copy
          </Typography>
        </IconButton>

        {/* <CopiedDIDAlert isOpen={alertOpen} onClose={onAlertClose} /> */}

        {/* {alertOpen && (
          <Alert severity="info" sx={{mt: 2}}>
            Copied to clipboard!
          </Alert>
        )} */}
        <CopiedDIDAlert isOpen={alertOpen} onClose={onAlertClose} alertText={ALERT_TEXT} />
        <Typography variant="h2" className="govcy-h2" sx={{marginTop: 2}}>
          {countdown.toString().padStart(2, '0')} : 00
        </Typography>
      </Paper>
    </Box>
  );
};

export default DecentralizedIDKey;
