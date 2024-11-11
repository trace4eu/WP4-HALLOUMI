import React from 'react';
import {useNavigate} from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import DateConverter from '../helpers/dateConverter';
import Box from '@mui/material/Box';
import {CredentialStoredType} from '../types/typeCredential';
import CardMedia from '@mui/material/CardMedia';

export interface IObjectMap {
  [key: string]: string | undefined;
}

//TODO not full exact list
const cardType: IObjectMap = {
  CitizenId: 'Citizen ID',
  bachelorDegree: 'Diploma Card',
  LicenseToPractice: 'Professional License',
  LicenseToOperate: 'License to Operate',
  // TODO once 3rd type is implemented
  // WalletCredential: 'Wallet Certificate',
};

const cardColor: IObjectMap = {
  CitizenId: 'primary.light',
  bachelorDegree: 'primary.dark',
  LicenseToPractice: '#f4cd2a',

  // TODO once 3rd type is implemented
  WalletCredential: 'secondary.light',
};

interface IWalletCardProps {
  card: CredentialStoredType;
}

const styles = {
  media: {
    left: 0,
    top: 0,
    width: '350px',
    height: '210px',
  },
};

const WalletCard = ({card}: IWalletCardProps) => {
  const navigate = useNavigate();
  // console.log(' card: ', card);

  const onRedirect = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    console.log(' Clicked on redirect ');
    e.preventDefault();
    navigate(`/cards/${card.id}`);
  };

  return (
    <Grid xs={12} paddingLeft={0}>
      <Box sx={{py: 2}}>
        <Card
          sx={{
            boxShadow: 3,
            backgroundColor: `${cardColor[card.type]}`,
            borderRadius: '30px',
            padding: '20px',
            width: '350px',
            maxWidth: '350px',
            height: '210px',
            position: 'relative',
            cursor: 'pointer',
          }}
          onClick={onRedirect}
        >
          <CardMedia
            image={`${card.image}`}
            title="wallet card image"
            style={styles.media}
            sx={{position: 'absolute'}}
          />
          <CardContent
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              flexDirection: 'column',
              position: 'absolute',
              height: 'auto',
              bottom: 0,
              left: 0,
              width: '100%',
              padding: '0 25px 0',
              color: '#fff',
            }}
          >
            {card.issuerName.length > 0 ? (
              <Box textAlign="left" paddingBottom={'25px'}>
                <Typography fontSize={'0.9rem'}>Provided by:</Typography>
                <Typography fontSize={'1rem'} fontWeight={500}>
                  {card.issuerName}
                </Typography>
              </Box>
            ) : null}
            <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
              <Stack textAlign="left">
                <Typography fontSize={'0.9rem'}>Issued on:</Typography>
                <Typography fontSize={'1rem'} fontWeight={500}>
                  {DateConverter.dateToString(card.issuanceDate)}
                </Typography>
              </Stack>
              <Stack>
                <Typography fontSize={'0.9rem'}>Expiration date:</Typography>
                <Typography fontSize={'1rem'} fontWeight={500}>
                  {card.expirationDate ? DateConverter.dateToString(card.expirationDate) : 'n/a'}
                </Typography>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Grid>
  );
};

export default WalletCard;
