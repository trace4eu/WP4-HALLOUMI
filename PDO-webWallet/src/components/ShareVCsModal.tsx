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
}

const ShareVCsModal = ({isOpen, handleCloseModal}: IPropsModal) => {
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
            borderRadius: '20px',
          }}
        >
          <Box component="img" alt="wallet turquose color icon" src={walletImg} width={'70px'} />

          <Typography variant="h6" id="modal-title" gutterBottom>
            Share VCs
          </Typography>
          <Typography
            variant="body2"
            id="modal-description"
            sx={{marginBottom: 2, fontSize: '1.1rem', fontWeight: 500}}
          >
            Your credential(s) have been submitted successfully. The verifier will be notified
          </Typography>
          <Box
            sx={{paddingTop: 3, display: 'flex', justifyContent: 'center', alignItems: 'flex-end'}}
          >
            <Button
              variant="contained"
              color="primary"
              // sx={{width: '200px'}}
              className="govcy-btn-primary"
              style={{marginBottom: 0}}
              onClick={handleCloseModal}
            >
              OK
            </Button>
          </Box>
        </Paper>
      </Box>
    </Modal>
  );
};

export default ShareVCsModal;
