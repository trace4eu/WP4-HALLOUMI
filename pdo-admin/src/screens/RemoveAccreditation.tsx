import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorModal from '../components/ErrorModal';
import AdminApiService from '../api/AdminApiService';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface IRemoveAccredit {
  success: boolean;
  errors?: string[];
}

const RemoveAccreditation = () => {
  const [success, setSuccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string[]>([]);
  const [did, setDid] = useState<string>('');
  const [openConfirmModal, setOpenConfirmModal] = useState<boolean>(false);

  // Function to call the remove accredit API
  const removeAccredit = async () => {
    try {
      setLoading(true);
      setError([]);

      const removeAccreditResp: IRemoveAccredit = await AdminApiService.getRemoveAccredit(did);
      console.log('response on get remove accredit: ', removeAccreditResp);

      if (removeAccreditResp.success) {
        setSuccess(true);
        setDid('');
      } else {
        setError(removeAccreditResp.errors || []);
        setSuccess(false);
      }
    } catch (err: unknown) {
      console.log('err: ', err);
      setSuccess(true);
      setSuccess(false);
      if (typeof err === 'string') {
        setError([err]);
      } else if (!(err as Error).message) {
        setError(['An error occurred']);
      } else {
        setError([(err as Error).message]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Proceed button click call GET remove accredit endpoint
  const handleProceed = () => {
    removeAccredit();
    setOpenConfirmModal(false);
  };

  // Open confirmation modal
  const handleOpenModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (!did) {
      setError(['DID is required.']);
      setSuccess(false);
      return;
    }
    setOpenConfirmModal(true);
  };

  const handleCloseModal = () => {
    setOpenConfirmModal(false);
  };

  const closeErrorModal = () => {
    setError([]);
    setSuccess(null);
  };

  if (loading) {
    return (
      <Box
        sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CircularProgress size="8vw" />
      </Box>
    );
  }

  if (success === true) {
    return (
      <Stack display={'flex'} flexDirection="column" alignItems="center" pt={4}>
        <Typography color={'green'} variant="h6" gutterBottom textAlign={'center'}>
          Accreditation for {did} has been removed successfully
        </Typography>
      </Stack>
    );
  }

  return (
    !success && (
      <Stack display={'flex'} flexDirection="column" alignItems="center" pt={3}>
        {success === false && <ErrorModal error={error} setError={closeErrorModal} />}

        <Typography variant="h4" textAlign={'center'} pb={2}>
          Remove Accreditation
        </Typography>

        <Paper elevation={3} sx={{ mt: 2, p: 4, width: 'fit-content' }}>
          <Typography variant="body1" pb={1}>
            Selecting Proceed will remove the accreditation that you have provided for an
            organization.
          </Typography>
          <Typography variant="body1" pb={1}>
            Following this, the organization will not be able to issue any type of Verifiable
            Credentials.
          </Typography>
          <Typography variant="body1" pb={1}>
            You will need to specify the DID of the organization to be removed.
          </Typography>

          <Stack maxWidth={'500px'}>
            <TextField
              label="DID"
              type="text"
              variant="outlined"
              fullWidth
              margin="normal"
              value={did}
              onChange={(e) => setDid(e.target.value)}
            />
          </Stack>

          <Button
            variant="outlined"
            color="primary"
            style={{ marginTop: '20px' }}
            onClick={handleOpenModal}
          >
            Proceed
          </Button>
        </Paper>

        {/* Confirmation Modal */}
        <Dialog
          open={openConfirmModal}
          onClose={handleCloseModal}
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
          sx={{ ml: '200px' }}
        >
          <DialogTitle id="confirm-dialog-title">Confirm Action</DialogTitle>
          <DialogContent>
            <DialogContentText id="confirm-dialog-description">
              Are you sure you want to remove the accreditation for the DID: {did}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="primary">
              Cancel
            </Button>
            <Button onClick={handleProceed} color="primary" autoFocus>
              Proceed
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    )
  );
};

export default RemoveAccreditation;
