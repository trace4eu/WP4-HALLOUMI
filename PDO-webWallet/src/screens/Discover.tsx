import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import {useNavigate} from 'react-router-dom';
import {issuerType} from './Issuers';

const Discover = () => {
  const navigate = useNavigate();

  const cardStyle = {
    position: 'absolute',
    top: '50%',
    width: '300px',
    //left: '8%',
    fontSize: '1.1rem',
    color: '#fff',
  };

  const onGetIssuers = async (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    issuerType: string
  ) => {
    e.preventDefault();
    console.log(' onGetIssuers and type is: ', issuerType);
    navigate(`/issuers/${issuerType}`);
  };

  return (
    <Container sx={{p: 0}}>
      <Box width={'100%'}>
        <Typography
          sx={{textAlign: 'center'}}
          variant="h2"
          className="govcy-h2"
          fontWeight="fontWeightBold"
        >
          Discover
        </Typography>
        <Grid
          container
          spacing={4}
          flexDirection="column"
          justifyContent="center"
          alignItems="start"
          px={'20px'}
          paddingTop={'40px'}
          paddingBottom={'30px'}
        >
          <Typography variant="h4" className="govcy-h4" fontWeight="fontWeightBold">
            Get from known issuers
          </Typography>
          <Typography fontSize={'1.3rem'}>Get credentials offered by known issuers</Typography>
        </Grid>
        <Grid
          container
          columnSpacing={{xs: 1, sm: 2, md: 3}}
          spacing={4}
          sx={{paddingTop: 3}}
          width={'fit-content'}
          display={'flex'}
        >
          <Grid
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            xs={6}
            sx={{position: 'relative', cursor: 'pointer'}}
            onClick={(e) => onGetIssuers(e, issuerType.ID)}
          >
            <Box
              component="img"
              alt={`wallet card Citizen ID GET image`}
              src={'/images/cardCitizenIdGet.jpg'}
              width="350px"
              height="210px"
              sx={{backgroundColor: 'primary.light'}}
              borderRadius="30px"
            />
            <Typography sx={cardStyle}>
              Get your Citizen identity Card from your goverment.
            </Typography>
          </Grid>
          <Grid
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            xs={6}
            sx={{position: 'relative', cursor: 'pointer'}}
            onClick={(e) => onGetIssuers(e, issuerType.EDUCATION)}
          >
            <Box
              component="img"
              alt={`wallet card Bachelor Dergee GET image`}
              src={'/images/cardbachelorDegreeGet.jpg'}
              width="350px"
              height="210px"
              sx={{backgroundColor: 'primary.dark'}}
              borderRadius="30px"
            />
            <Typography sx={cardStyle}>Get your bachelor degree from your university.</Typography>
          </Grid>
          <Grid
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            xs={6}
            sx={{position: 'relative', cursor: 'pointer', py: '50px'}}
            onClick={(e) => onGetIssuers(e, issuerType.PROFESSIONAL)}
          >
            <Box
              component="img"
              alt={`wallet card License To Practice GET image`}
              src={'/images/cardLicenseToPracticeGet.jpg'}
              width="350px"
              height="210px"
              sx={{backgroundColor: 'primary.light'}}
              borderRadius="30px"
            />
            <Typography sx={cardStyle}>
              Get your Professional License from your Association.
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Discover;
