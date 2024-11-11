import React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Snackbar from '@mui/material/Snackbar';

interface IPropsAlert {
  isOpen: boolean;
  onClose: () => void;
  alertText: string;
}

export default function SuccessAlert({isOpen, onClose, alertText}: IPropsAlert) {
  // const alertText = 'Copied to clipboard!';

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      sx={{marginTop: '130px'}}
    >
      <Alert onClose={onClose}>
        <AlertTitle sx={{width: '25vw', minWidth: 'fit-content'}}>{alertText}</AlertTitle>
      </Alert>
    </Snackbar>
  );
}
