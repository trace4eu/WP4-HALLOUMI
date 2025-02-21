import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { useJwt } from 'react-jwt';

interface IModalWindowProps {
  jwt: string;
  onClose: () => void;
  open: boolean;
}

const ModalWindow: React.FC<IModalWindowProps> = ({ jwt, onClose, open }) => {
  const handleCloseModal = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
  };

  const { decodedToken } = useJwt(jwt);

  return (
    <Modal
      open={open}
      onClose={handleCloseModal}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '80%',
          bgcolor: 'background.paper',
          border: '2px solid grey',
          boxShadow: 24,
          borderRadius: '50px',
          p: 4,
        }}
      >
        <Typography aria-labelledby="modal-title" variant="h6" component="div" gutterBottom>
          Decoded JWT
        </Typography>
        <Box sx={{ overflowY: 'auto', height: '80%' }} aria-describedby="modal-description">
          <pre>{JSON.stringify(decodedToken, null, 2)}</pre>
        </Box>
        <Button
          variant="outlined"
          onClick={handleCloseModal}
          sx={{ mt: 2, position: 'relative', float: 'inline-end', width: '100px' }}
        >
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default ModalWindow;
