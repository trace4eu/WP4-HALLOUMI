import React, {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircularProgress from '@mui/material/CircularProgress';
import CancelIcon from '@mui/icons-material/Cancel';
import ErrorIcon from '@mui/icons-material/Error';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import {apiService} from '../index';
import {CredentialStoredType} from '../types/typeCredential';
import {CardDetailsDisplay, displayCardType} from '../helpers/cardDetailsDisplay';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ITabCardSectionProps {
  card: CredentialStoredType;
}

type CardStatusType = {
  active: 'active';
  error: 'error';
  expired: 'expired';
  invalid: 'invalid';
  unknown: 'unknown';
  revoked: 'revoked';
};

const statusIcon = {
  active: <CheckCircleIcon color="success" fontSize="small" sx={{marginLeft: '2px'}} />,
  error: <ErrorIcon color="error" fontSize="small" sx={{marginLeft: '2px'}} />,
  expired: <ErrorIcon color="error" fontSize="small" sx={{marginLeft: '2px'}} />,
  invalid: <CancelIcon color="error" fontSize="small" sx={{marginLeft: '2px'}} />,
  unknown: <PanoramaFishEyeIcon fontSize="small" sx={{marginLeft: '2px'}} />,
  revoked: (
    <RefreshIcon
      fontSize="small"
      sx={{marginLeft: '2px', transform: 'rotate(180deg)', color: 'orange'}}
    />
  ),
};

export const TabCardSection = ({card}: ITabCardSectionProps) => {
  const [cardStatus, setCardStatus] = useState<CardStatusType | keyof typeof statusIcon | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCardStatus = async () => {
      try {
        const status: CardStatusType = await apiService.getLicenseStatus(card.jwt);

        if (!status) setCardStatus('unknown');
        else setCardStatus(status);
      } catch (error) {
        setError('Error fetching card status');
        setCardStatus('error');
      } finally {
        setLoading(false);
      }
    };

    card && getCardStatus();
  }, [card]);

  const description = `This is a proof of your entitlement to operate in the supply chain. 
    You can use it to add an event in the production of a batch
    that you have been asked to take part in.`;

  const displayCard = CardDetailsDisplay.convert(card);

  return (
    <Box paddingTop={'20px'}>
      <Typography fontSize={'1rem'} fontWeight={500} width="350px" textAlign="center">
        Information
      </Typography>
      <Divider
        sx={{
          width: 400,
          borderBottomWidth: 2,
          borderColor: 'primary.main',
          paddingTop: 2,
          marginBottom: 2,
        }}
      />

      <Grid container spacing={2} alignItems="center" paddingLeft={1}>
        <Typography sx={{py: 2}} fontSize={'0.9rem'}>
          <Box component="span" fontWeight={500} maxWidth={700}>
            Description:{' '}
          </Box>{' '}
          {description}
        </Typography>
        <Typography>
          <Box component="span" fontWeight={500}>
            Status:
          </Box>{' '}
          {loading ? (
            <CircularProgress size="2vw" sx={{marginLeft: '5px'}} />
          ) : (
            cardStatus && ` ${cardStatus}`
          )}
          {cardStatus && statusIcon[cardStatus as keyof typeof statusIcon]}
          {error && (
            <Box component="span" sx={{color: 'error.main'}}>
              error
            </Box>
          )}
        </Typography>
        {Object.keys(displayCard).map((cardKey: string | keyof displayCardType, i) => {
          return (
            <Grid
              container
              xs={12}
              spacing={0}
              direction="column"
              justifyContent="center"
              key={i}
              paddingLeft={0}
            >
              <Typography variant="subtitle1" fontSize={'0.9rem'} textTransform={'capitalize'}>
                <Box component="span" fontWeight={500}>
                  {cardKey}
                </Box>{' '}
                {`${displayCard[cardKey as keyof displayCardType]}`}
              </Typography>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
