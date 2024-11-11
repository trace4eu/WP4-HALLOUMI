import React from 'react';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import walletImg from '../assets/images/walletImgBlue.png';

interface IPropsModal {
  isOpen: boolean;
  handleCloseModal: () => void;
  handleContinue: () => void;
}

const DeleteCredentialModal = ({isOpen, handleCloseModal, handleContinue}: IPropsModal) => {
  return (
    <Modal
      open={isOpen}
      onClose={handleCloseModal}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
        <Paper
          sx={{
            marginLeft: '200px',
            padding: 4,
            maxWidth: 600,
            width: 500,
            textAlign: 'center',
            borderRadius: '20px',
          }}
        >
          <Box component="img" alt="wallet turquose color icon" src={walletImg} width={'70px'} />

          <Typography variant="h6" id="modal-title" gutterBottom>
            Do you really want to delete this credential?
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 2,
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              sx={{width: '200px'}}
              onClick={handleCloseModal}
            >
              No
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{width: '200px'}}
              onClick={handleContinue}
            >
              Yes
            </Button>
          </Box>
        </Paper>
      </Box>
    </Modal>
  );
};

export default DeleteCredentialModal;
