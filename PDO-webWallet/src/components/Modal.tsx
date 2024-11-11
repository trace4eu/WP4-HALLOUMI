import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import {useAppSelector} from '../features/hooks';
import {selectOfferPayload} from '../features/offerPayloadSlice';
import Stack from '@mui/material/Stack';
import DialogTitle from '@mui/material/DialogTitle';
import {IObjectMap} from '../components/WalletCard';
import walletImg from '../assets/images/walletImgBlue.png';

interface ModalProps {
  type: string;
  onButtonActionClick: () => void;
  open: boolean;
  onAcceptButtonAction?: () => Promise<void> | void;
}

const ModalWindow = ({type, onButtonActionClick, open, onAcceptButtonAction}: ModalProps) => {
  const offerPayload = useAppSelector(selectOfferPayload);

  const styleModal = {
    bgcolor: '#ebf1f3', //'#fff',
    boxShadow: 24,
    p: 4,
    borderRadius: 5,
    color: '#000',
    display: 'flex',
    flexDirection: ' column',
    justifyContent: 'space-around',
    alignItems: 'center',
  };

  const styleButton = {
    width: 170,
    padding: 1,
    borderRadius: '25px',
    fontSize: '1rem',
  };

  const styleContainedButton = {...styleButton, color: '#fff'};

  const vcType: IObjectMap = {
    CitizenId: 'Citizen ID',
    bachelorDegree: 'Bachelor Degree',
    LicenseToPractice: 'License To Practice',
  };

  return (
    <Dialog
      open={open}
      onClose={(e: React.MouseEvent) => e.stopPropagation()}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      PaperProps={{sx: {borderRadius: '20px', textAlign: 'center'}}}
    >
      <Box sx={{...styleModal}}>
        {type === 'offer' && (
          <>
            <Box component="img" alt="wallet dark blue color icon" src={walletImg} width={'70px'} />
            <DialogTitle id="modal-title" fontSize={'1.4rem !important'} fontWeight={600}>
              Verifiable Credential
            </DialogTitle>
            <Typography id="modal-description" fontSize={'1.3rem'} fontWeight={400}>
              to be issued for
            </Typography>
            <Typography
              id="modal-description"
              // color="secondary.light"
              fontSize={'1.3rem'}
              fontWeight={600}
            >
              {offerPayload && vcType[offerPayload.credentials[0].types[2]]}
            </Typography>
            {(offerPayload?.loginRequiredOpenID || offerPayload?.loginRequired) && (
              <Typography py={2} color="error.main" fontWeight={800}>
                a Login will be required
              </Typography>
            )}
          </>
        )}
        {type === 'share' && (
          <>
            <Box component="img" alt="wallet dark blue color icon" src={walletImg} width={'70px'} />
            <DialogTitle id="modal-title" fontSize={'1.4rem !important'} fontWeight={600}>
              Share to Verifier
            </DialogTitle>
            <Typography id="modal-description" fontSize={'1.3rem'} fontWeight={500}>
              accept sharing
            </Typography>

            <Typography py={2} color="error.main" fontWeight={800}>
              you will be asked to select and share one or more VCs
            </Typography>
          </>
        )}
        {type === 'deferredCredential' && (
          <>
            <Box component="img" alt="wallet dark blue color icon" src={walletImg} width={'70px'} />
            <DialogTitle
              id="modal-title"
              fontSize={'1.4rem !important'}
              fontWeight={600}
              paddingTop={'20px'}
            >
              Deferred Credential
            </DialogTitle>
            <Typography id="modal-description">
              Your credential will be issued in due time. Please check deferred credential option on
              your wallet.{' '}
            </Typography>
          </>
        )}
        {/* {type === 'vc' && (
          <>
            <DialogTitle id="modal-title">CONGRATULATIONS</DialogTitle>
            <DialogContentText id="modal-description">
              Your Credential has been succesfully stored in your wallet
            </DialogContentText>
          </>
        )} */}

        {!onAcceptButtonAction ? (
          <Stack paddingTop={5}>
            <Button
              onClick={onButtonActionClick}
              variant="contained"
              size="medium"
              sx={{...styleContainedButton, color: '#fff'}}
            >
              OK
            </Button>
          </Stack>
        ) : (
          <Stack spacing={5} justifyContent="space-around" direction="row" paddingTop={3}>
            <Button
              onClick={onButtonActionClick}
              variant="outlined"
              size="medium"
              sx={{
                ...styleButton,
                //border: '3px solid',
              }}
            >
              Deny
            </Button>
            <Button
              onClick={async () => await onAcceptButtonAction()}
              variant="contained"
              size="medium"
              sx={{...styleContainedButton, color: '#fff'}}
            >
              Accept
            </Button>
          </Stack>
        )}
      </Box>
    </Dialog>
  );
};

export default ModalWindow;
