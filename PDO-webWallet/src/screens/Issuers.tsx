import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios, {AxiosError} from 'axios';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
//import ApiService from '../features/api/ApiService';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Unstable_Grid2';
import CardContent from '@mui/material/CardContent';
import Card from '@mui/material/Card';
import ErrorDownloadAlert from '../components/ErrorDownloadAlert';
import {apiService} from '../index';
import {walletKnownCard} from '../types/typeCredential';
import Paper from '@mui/material/Paper';

export const issuerType = {
  ID: 'CitizenId',
  EDUCATION: 'bachelorDegree',
  PROFESSIONAL: 'LicenseToPractice',
};

export type typeIssuer = {
  issuer_name: string;
  issuer_url: string;
  supported_vc_type: walletKnownCard; // 'CitizenId' | 'bachelorDegree' | 'LicenseToPractice';
};

const Issuers = () => {
  const navigate = useNavigate();
  const {type} = useParams<{type: string}>();
  const [issuers, setIssuers] = useState<typeIssuer[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isErrorWindow, setIsErrorWindow] = useState<boolean>(false);

  useEffect(() => {
    const getIssuers = async () => {
      if (!type) {
        setError('No type of issuer provided');
      }
      try {
        const issuers: typeIssuer[] | AxiosError = await apiService.getIssuers(type as string);

        if (!axios.isAxiosError(issuers)) {
          setIssuers(issuers);
        } else if (axios.isAxiosError(issuers)) {
          setError('Error fetching issuers: ' + issuers.message);
          setIsErrorWindow(true);
        } else {
          throw Error('Error fetching issuers');
        }
      } catch (error) {
        console.error('Error fetching issuers', error);
        setError('Error fetching issuers: ' + error);
        setIsErrorWindow(true);
      } finally {
        setLoading(false);
      }
    };

    getIssuers();
  }, []);

  const onVisitIssuerUrl = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, url: string) => {
    e.preventDefault();
    window.open(url, '_self');
  };

  const onErrorAlertClose = () => {
    setIsErrorWindow(false);
    navigate('/discover');
  };

  if (loading) {
    return (
      <Box sx={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <CircularProgress size="8vw" />
      </Box>
    );
  }

  if (error) {
    return (
      <ErrorDownloadAlert
        message={error}
        isErrorWindow={isErrorWindow}
        onClose={onErrorAlertClose}
      />
    );
  }

  return (
    <Container sx={{p: 0}}>
      <Box sx={{px: 6}} width={'100%'}>
        <Typography
          sx={{textAlign: 'center'}}
          variant="h2"
          className="govcy-h2"
          fontWeight="fontWeightBold"
        >
          Known Issuers
        </Typography>
        <Paper
          elevation={3}
          sx={{
            p: 5,
            marginTop: '5vh',
            width: '70vw',
            maxWidth: 1000,
            maxHeight: 600,
            textAlign: 'center',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            alignItems: 'center',
            // height: '70vh',
            backgroundColor: '#ebf1f3',
          }}
        >
          <Grid
            container
            spacing={4}
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            px={'20px'}
            paddingTop={'40px'}
            paddingBottom={'30px'}
          >
            {issuers?.length === 0 ? (
              <Typography fontSize={'1.3rem'} paddingBottom={'30px'} paddingTop={'40px'}>
                No issuers of this VC type are known.
              </Typography>
            ) : (
              <Typography fontSize={'1.3rem'} paddingBottom={'30px'}>
                Please select one of the issuers to visit and get your {type}
              </Typography>
            )}
            {issuers &&
              issuers?.length > 0 &&
              issuers.map((issuer, i) => {
                return (
                  <Box
                    sx={{padding: 2, cursor: 'pointer'}}
                    key={i}
                    onClick={(e) => onVisitIssuerUrl(e, `${issuer.issuer_url}/?web`)}
                  >
                    <Card
                      sx={{
                        boxShadow: 3,
                        borderRadius: '30px',
                        padding: '20px',
                        width: '600px',
                        backgroundColor: '#31576F',
                      }}
                    >
                      <CardContent
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexDirection: 'column',
                          height: '60%',
                          color: '#fff',
                        }}
                      >
                        <Typography variant="subtitle1" fontSize={'1.3rem'}>
                          Issuer: {issuer.issuer_name}
                        </Typography>
                        <Typography variant="subtitle1" fontSize={'1.3rem'} textAlign={'left'}>
                          Issuer url: {issuer.issuer_url}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                );
              })}
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default Issuers;
