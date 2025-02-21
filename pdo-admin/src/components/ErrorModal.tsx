import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const ErrorModal = ({
  error,
  setError,
}: {
  error: string | null | string[];
  setError: () => void;
}) => {
  const errorMessage = Array.isArray(error) ? error.join(', ') : error;

  return (
    <Dialog open={!!error} onClose={() => setError()} sx={{ ml: '200px' }}>
      <DialogTitle sx={{ color: 'error.main' }}>Error</DialogTitle>
      <DialogContent>
        <DialogContentText>{errorMessage}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setError()} color="primary">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorModal;
