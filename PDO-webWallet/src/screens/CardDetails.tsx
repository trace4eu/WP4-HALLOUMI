import React, {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import {CredentialStoredType} from '../types/typeCredential';
import WalletCard from '../components/WalletCard';
import {selectCredentials} from '../features/credentialSlice';
import {useAppDispatch, useAppSelector} from '../features/hooks';
import {TabCardSection} from '../components/TabCardSection';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import {credentialRemoved} from '../features/credentialSlice';
import DeleteCredentialModal from '../components/DeleteCredentialModal';
import WalletModel from '../models/WalletModel';
import Paper from '@mui/material/Paper';
import CredentialSaveOrShareOrDeleteAlert from '../components/CredentialSaveOrShareOrDeleteAlert';
import Wallet from '../screens/Wallet';

interface PropsWallet {
  walletModel: WalletModel;
}

const DELETE_MSG = 'Succesfully deleted.';

const CardDetails = ({walletModel}: PropsWallet) => {
  const navigate = useNavigate();
  const {id} = useParams<{id: string}>();
  const cards = useAppSelector(selectCredentials);
  const dispatch = useAppDispatch();
  const [isDeleteAlert, setIsDeleteAlert] = useState(false);
  const [isDeleteSuccess, setIsDeleteSuccess] = useState(false);

  const card: CredentialStoredType | undefined = cards.find(
    (c: CredentialStoredType) => c.id === id
  );

  const onDeleteVC = () => {
    card && dispatch(credentialRemoved(card.id));
    const index = card && cards.findIndex((item) => item.id === card.id);
    if (index != undefined && index !== -1) {
      const newcards = [...cards];
      newcards.splice(index, 1);
      console.log('index->' + index + ' ' + newcards);
      walletModel.storeVerifiedCredentials(JSON.stringify(newcards));
      console.log(
        'Verified Credentials from local storage after removL OF ONE VC  : ',
        walletModel.getStoredCredentials()
      );
      setIsDeleteSuccess(true);
    }
  };

  const toCloseAlert = () => {
    setIsDeleteSuccess(false);
    navigate('/wallet');
  };

  if (!card && !isDeleteSuccess) {
    return (
      <Typography width={'100%'} textAlign={'center'}>
        Card not found
      </Typography>
    );
  }

  if (!card && isDeleteSuccess) {
    return (
      <Container
        sx={{
          paddingTop: '3vh',
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <CredentialSaveOrShareOrDeleteAlert
          isVC={isDeleteSuccess}
          toCancel={toCloseAlert}
          message={DELETE_MSG}
        />
        <Wallet walletModel={walletModel} />
      </Container>
    );
  }

  return (
    card && (
      <Container
        sx={{
          paddingTop: '3vh',
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <DeleteCredentialModal
          isOpen={isDeleteAlert}
          handleCloseModal={() => setIsDeleteAlert(false)}
          handleContinue={onDeleteVC}
        />

        {/* {isDeleteAlert && (
         <DeleteCredentialAlert
             setIsDeleteAlert={setIsDeleteAlert}
             onDelete={onDeleteVC}
             type={'verified'}
           /> 
        )} */}
        <Typography fontWeight={500} fontSize={'2rem'} textAlign={'center'}>
          Card details
        </Typography>
        <Paper
          elevation={3}
          sx={{
            px: 5,
            width: '70vw',
            maxWidth: 1000,
            marginBottom: '20px',
            backgroundColor: '#ebf1f3',
          }}
        >
          <WalletCard card={card} />
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
            delete this card
          </Button>
        </Stack>
      </Container>
    )
  );
};

export default CardDetails;
