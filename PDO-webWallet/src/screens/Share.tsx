import React, {useEffect, useState} from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import WalletCard from '../components/WalletCard';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import WalletModel from '../models/WalletModel';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {CredentialStoredType} from '../types/typeCredential';
import ShareDetailsForm from '../components/ShareDetailsForm';

interface PropsShare {
  walletModel: WalletModel;
}

const Share = ({walletModel}: PropsShare) => {
  const [credentials, setCredentials] = useState<CredentialStoredType[]>([]);
  const [selectedVCs, setSelectedVCs] = useState<CredentialStoredType[]>([]);
  const [isShareForm, setIsShareForm] = useState(false);

  useEffect(() => {
    const storedCredentials = walletModel.getStoredCredentials();
    console.log('storedCredentials: ', storedCredentials);
    setCredentials(storedCredentials ? storedCredentials : []);
  }, []);

  const isVCselected = (vc: CredentialStoredType) => {
    return selectedVCs.some((c) => c.jwt === vc.jwt);
  };

  const handleCheckboxChange = (vc: CredentialStoredType) => {
    setSelectedVCs((prevSelected) => {
      if (isVCselected(vc)) {
        return prevSelected.filter((c) => c.jwt !== vc.jwt);
      } else {
        return [...prevSelected, vc];
      }
    });
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('selectedVCs: ', selectedVCs);
    setIsShareForm(true);
  };

  return (
    <Container>
      {!isShareForm ? (
        <Box sx={{textAlign: 'center'}} px={3}>
          <Typography variant="h2" className="govcy-h2" fontWeight="800">
            {' '}
            Share
          </Typography>
          {credentials.length > 0 ? (
            <Typography>Please select one ore more credentials to share via CY EBSI GW</Typography>
          ) : (
            <Typography>you have no credentials to share</Typography>
          )}

          <FormControl component="fieldset">
            <FormGroup>
              {credentials.length > 0 &&
                credentials.map((c: CredentialStoredType) => {
                  return (
                    <Grid
                      sx={{
                        px: 2,
                        paddingTop: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'end',
                      }}
                      key={c.id}
                    >
                      <WalletCard card={c} />
                      <FormControlLabel
                        key={c.id}
                        control={
                          <Checkbox
                            checked={isVCselected(c)}
                            onChange={() => handleCheckboxChange(c)}
                          />
                        }
                        label=""
                      />
                    </Grid>
                  );
                })}
            </FormGroup>
          </FormControl>
          <Stack
            spacing={5}
            justifyContent="center"
            direction="row"
            width={'100%'}
            paddingTop={5}
            paddingBottom={3}
            paddingRight={3}
          >
            <Button
              variant="contained"
              className="govcy-btn-primary"
              sx={{padding: 2, fontWeight: 800, fontSize: '1.3rem'}}
              style={{color: '#fff'}}
              onClick={handleShareClick}
              disabled={selectedVCs.length === 0}
            >
              Share ({selectedVCs.length})
            </Button>
          </Stack>
        </Box>
      ) : (
        <ShareDetailsForm selectedVCs={selectedVCs} walletModel={walletModel} />
      )}
    </Container>
  );
};

export default Share;
