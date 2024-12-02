import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
interface ICredentialSaveAlertProps {
  isVC: boolean;
  toCancel: () => void;
  message?: string;
}

const CredentialSaveOrShareOrDeleteAlert = ({
  isVC,
  toCancel,
  message,
}: ICredentialSaveAlertProps) => {
  return (
    <Snackbar
      open={isVC}
      autoHideDuration={4000}
      onClose={toCancel}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      sx={{marginTop: '120px'}}
    >
      <Alert
        onClose={toCancel}
        severity="success"
        sx={{
          width: '100%',
          // backgroundColor: 'secondary.light',
        }}
      >
        {!message ? (
          <>
            {/* <Typography variant="h6">CONGRATULATIONS</Typography> */}
            <Typography>A new credential has been succesfully added!</Typography>
          </>
        ) : (
          <Typography>{message}</Typography>
        )}
      </Alert>
    </Snackbar>
  );
};

export default CredentialSaveOrShareOrDeleteAlert;
