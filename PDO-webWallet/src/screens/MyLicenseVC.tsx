import {useEffect, useState} from 'react';
import WalletModel from '../models/WalletModel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {useAppDispatch, useAppSelector} from '../features/hooks';
import {
  credentialRemoved,
  selectCredentials,
  selectedCredential,
  selectSingleCredential,
} from '../features/credentialSlice';
import {CredentialStoredType} from '../types/typeCredential';
import {useParams} from 'react-router-dom';
import {credentialsAddAll} from '../features/credentialSlice';
import CredentialSaveOrShareOrDeleteAlert from '../components/CredentialSaveOrShareOrDeleteAlert';
import Paper from '@mui/material/Paper';
import LicenseCard from '../components/LicenseCard';
import DeleteCredentialModal from '../components/DeleteCredentialModal';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {TabCardSection} from '../components/TabCardSection';

interface PropsMyLicenseVC {
  walletModel: WalletModel;
}

const DELETE_MSG = 'Successfully deleted.';
const UNISSUED =
  'You have not being issued a license to operate VC yet. Please contact the PDO admin and request one';

const MyLicenseVC = ({walletModel}: PropsMyLicenseVC) => {
  const dispatch = useAppDispatch();
  const [isDeleteAlert, setIsDeleteAlert] = useState(false);
  const [isDeleteSuccess, setIsDeleteSuccess] = useState(false);

  const appStoredCredentials = useAppSelector(selectCredentials) || [];
  const storedCredentials = (walletModel.getStoredCredentials() as CredentialStoredType[]) || [];
  const isLicense = storedCredentials && storedCredentials.length > 0;

  if ((!appStoredCredentials || appStoredCredentials.length === 0) && isLicense) {
    dispatch(credentialsAddAll(storedCredentials));
  }

  let card = useAppSelector(selectSingleCredential);
  if (
    !card &&
    walletModel.getStoredCredentials() &&
    walletModel.getStoredCredentials().length > 0
  ) {
    card = walletModel.getStoredCredentials()[0];
  }

  const onDeleteVC = () => {
    if (card) {
      dispatch(credentialRemoved(card.id));
      const index = storedCredentials.findIndex((item) => item.id === card?.id);
      if (index !== -1) {
        const newcards = [...storedCredentials];
        newcards.splice(index, 1);
        walletModel.storeVerifiedCredentials(JSON.stringify(newcards));
        const newCard = walletModel.getStoredCredentials()[0];
        if (newCard) dispatch(selectedCredential((newCard as CredentialStoredType).jwt));

        setIsDeleteSuccess(true);
        setIsDeleteAlert(false);
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    }
  };

  const toCloseAlert = () => {
    setIsDeleteSuccess(false);
  };

  return (
    <Container>
      <Box sx={{px: 6}}>
        <Typography
          sx={{textAlign: 'center'}}
          variant="h2"
          className="govcy-h2"
          fontWeight="fontWeightBold"
        >
          My License VC
        </Typography>
        {isDeleteSuccess && (
          <CredentialSaveOrShareOrDeleteAlert
            isVC={isDeleteSuccess}
            toCancel={toCloseAlert}
            message={DELETE_MSG}
          />
        )}

        {!storedCredentials || storedCredentials.length === 0 ? (
          <Typography sx={{textAlign: 'center', py: 4, fontSize: '1.3rem'}}>{UNISSUED}</Typography>
        ) : null}
      </Box>
      {isDeleteAlert && (
        <DeleteCredentialModal
          isOpen={isDeleteAlert}
          handleCloseModal={() => setIsDeleteAlert(false)}
          handleContinue={onDeleteVC}
        />
      )}

      {card && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              px: 5,
              py: 3,
              width: '60vw',
              maxWidth: 1000,
              marginBottom: '20px',
              backgroundColor: '#ebf1f3',
            }}
          >
            <LicenseCard card={card} />
            <TabCardSection card={card} />
          </Paper>
          <Stack
            spacing={5}
            justifyContent="center"
            direction="row"
            width={'100%'}
            paddingBottom={3}
            paddingRight={3}
          >
            <Button
              variant="contained"
              size="medium"
              sx={{padding: 1}}
              onClick={() => setIsDeleteAlert(true)}
            >
              Delete this card
            </Button>
          </Stack>
        </Box>
      )}
    </Container>
  );
};

export default MyLicenseVC;
