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

const DIDShareWarningModal = ({isOpen, handleCloseModal, handleContinue}: IPropsModal) => {
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
            maxWidth: 500,
            textAlign: 'center',
            backgroundColor: '#fff',
            color: '#000',
            borderRadius: '20px',
          }}
        >
          <Box component="img" alt="wallet turquose color icon" src={walletImg} width={'70px'} />

          <Typography variant="h6" id="modal-title" gutterBottom>
            Be careful
          </Typography>
          <Typography
            variant="body2"
            id="modal-description"
            sx={{marginBottom: 2, fontSize: '1.1rem', fontWeight: 500}}
          >
            Please do not share your private key with anyone. eKibisis is non custodial, we will
            never ask for it.
          </Typography>
          <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
            <Button
              variant="outlined"
              color="primary"
              sx={{width: '200px'}}
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{width: '200px'}}
              onClick={handleContinue}
            >
              Continue
            </Button>
          </Box>
        </Paper>
      </Box>
    </Modal>
  );
};

export default DIDShareWarningModal;
