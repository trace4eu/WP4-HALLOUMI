import React, {useEffect, useState} from 'react';
import WalletModel from '../models/WalletModel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {useAppDispatch, useAppSelector} from '../features/hooks';
import {selectedCredential, selectSingleCredential} from '../features/credentialSlice';
import {apiService} from '../index';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import {ReqEventsRespType} from '../types/newBatchTypes';
import BatchComponent from '../components/BatchComponent';
import ErrorDownloadAlert from '../components/ErrorDownloadAlert';
import {CircularProgress} from '@mui/material';
import {CredentialStoredType} from '../types/typeCredential';
import { Bolt } from '@mui/icons-material';

interface PropsNewBatch {
  walletModel: WalletModel;
}

const NewBatch = ({walletModel}: PropsNewBatch) => {
  const [events, setEvents] = useState<Array<string> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const license = useAppSelector(selectSingleCredential);
  useEffect(() => {
    if (!license) {

      if (walletModel.getStoredCredentials() && walletModel.getStoredCredentials().length > 0) {
      const existingVC: CredentialStoredType = walletModel.getStoredCredentials()[0];

      if (existingVC) {
        dispatch(selectedCredential(existingVC.jwt));
      }
    }
    }
  }, []);

  const getRequiredEvents = async () => {
    try {
      setLoading(true);
      const reqEventsResp: ReqEventsRespType = await apiService.getRequiredEvents(
        license!.vcDetails.productName
      );
      // Filter requiredEvents to exclude the lastInChainEvent
      const filteredRequiredEvents: string[] = reqEventsResp.requiredEvents.filter(
        (event: string) => event !== reqEventsResp.lastInChainEvent
      );

      if (filteredRequiredEvents && filteredRequiredEvents.length > 0) {
        setEvents(filteredRequiredEvents);
      } else {
        throw new Error('request events error');
      }
    } catch (error: unknown) {
      console.error('request events error', error);
      let errorMessage = 'Error submitting batch';
      if (typeof error === 'string') {
        errorMessage = error;
      }
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (license && license?.vcDetails.lastInChain) {
      getRequiredEvents();
    }
  }, [license, license?.vcDetails.lastInChain]);

  const lastInChainWarning = !license?.vcDetails.lastInChain ? (
    <Typography sx={{textAlign: 'center', color: 'red'}}>
      Only last in chain actors can create a new batch.
    </Typography>
  ) : null;

  const toCloseAlert = () => {
    setError(null);
  };

  if (loading) {
    return (
      <Box sx={{height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <CircularProgress size="8vw" />
      </Box>
    );
  }

  return (
    <Container sx={{position: 'relative'}}>
      {error !== null && (
        <ErrorDownloadAlert
          message={error as string}
          isErrorWindow={error !== null}
          onClose={toCloseAlert}
        />
      )}

      <Box sx={{px: 6}}>
        <Typography
          sx={{textAlign: 'center'}}
          variant="h2"
          className="govcy-h2"
          fontWeight="fontWeightBold"
        >
          New Batch
        </Typography>
        <Typography
          sx={{textAlign: 'center'}}
       
        >
          create a supply chain traceability document (TnT) for a new batch
        </Typography>

        <Box>{lastInChainWarning}</Box>
        {events && license && !lastInChainWarning && (
          <Box sx={{marginTop: '20px'}}>
            <Typography gutterBottom>Events Required to Complete the Batch Production for {license.vcDetails.productName}:</Typography>
            <List>
              {events.map((event, index) => (
                <ListItem key={index}>
                  <ListItemText primaryTypographyProps={{ fontStyle: 'italic', fontWeight: 'bold' }}primary={`${event}`} />
                </ListItem>
              ))}
            </List>
            <Typography sx={{marginBottom: '15px'}}>
              Type the new batch id and select the supply chain actors to take part in the new batch.
              <span style={{color: '#cc3300'}}>
                You must select an actor for each required event above.
              </span>
            </Typography>
            <BatchComponent
              productName={license!.vcDetails.productName}
              walletModel={walletModel}
              jwtvc={license!.jwt}
            />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default NewBatch;
