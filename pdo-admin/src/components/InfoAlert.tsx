import React, { useState, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface PropsInfoAlert {
  open: boolean;
  handleClose: () => void;
  message: string;
}
const InfoAlert = ({ open, handleClose, message }: PropsInfoAlert) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000} //  duration in milliseconds (3 seconds in this case)
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity="success">
        {message ? message : 'succes!'}
      </Alert>
    </Snackbar>
  );
};

export default InfoAlert;
