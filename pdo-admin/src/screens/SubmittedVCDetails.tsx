import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import AdminApiService from '../api/AdminApiService';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorAlert from '../components/ErrorAlert';
import { flattenObject } from '../helpers/flattenObject';
import { cardStatusType, cardType } from '../types';
import DateConverter from '../helpers/DateConverter';
import Grid2 from '@mui/material/Unstable_Grid2';
import useTheme from '@mui/material/styles/useTheme';
import { serverErrorResponse } from '../api/ApiClient';
import UserDataVerticalTable from '../components/UserDataVerticleTable';

interface ISubmittedVC {
  [key: string]: unknown;
  submittedDate: string;
  userid?: string;
  useridentification?: string;
  status: cardStatusType;
  vcdata:
    | {
        type: cardType; //'CitizenId' | 'bachelorDegree';
        issuer: string;
        issuerDID: string;
        issuanceDate: string;
        expiryDate: string;
        userData: {
          [key: string]: unknown;
          familyName: string;
          firstName: string;
          svcfield1?: string;
          svcfield2?: string;
        };
        Jwt: string;
      }
    | { error: string | unknown };
}

const SubmittedVCDetails = () => {
  const [submittedVCDetails, setSubmittedVCDetails] = useState<Partial<ISubmittedVC> | null>(null);
  const [userDataDetails, setUserDataDetails] = useState<Array<{
    itemKey: string;
    value: string;
  }> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    let ignore = false;

    const getSubmittedVCDetails = async () => {
      let getDetailsResp: ISubmittedVC | typeof serverErrorResponse.TOKEN_REQUIRED;
      try {
        setLoading(true);
        getDetailsResp = await AdminApiService.getSubmittedVCDetails(id as string);

        if (getDetailsResp === serverErrorResponse.TOKEN_REQUIRED) {
          //navigate('/login');
          setError(getDetailsResp);
        }

        if (!getDetailsResp) {
          throw new Error('Error obtaining VC details');
        }

        console.log('get Submitted vc details: ', getDetailsResp);
        if ((getDetailsResp as unknown as { errors: Array<string> }).errors) {
          throw new Error((getDetailsResp as unknown as { errors: Array<string> }).errors[0]);
        } else {
          if (getDetailsResp && !ignore) {
            const vcDetails: { [key: string]: string } = {
              'Submitted date:': DateConverter.dateToString(
                (getDetailsResp as ISubmittedVC).submittedDate as string
              ),
              'Status: ': (getDetailsResp as ISubmittedVC).status,
            };
            if ((getDetailsResp as ISubmittedVC).userid) {
              vcDetails['USER ID: '] = (getDetailsResp as ISubmittedVC).userid as string;
            }
            if ((getDetailsResp as ISubmittedVC).useridentification) {
              vcDetails['USER Identification: '] = (getDetailsResp as ISubmittedVC)
                .useridentification as string;
            }

            const userDataSubmittedVc = flattenObject((getDetailsResp as ISubmittedVC).vcdata);

            console.log('userDataSubmittedVc: ', userDataSubmittedVc);

            setSubmittedVCDetails(vcDetails as Partial<ISubmittedVC>);

            setUserDataDetails(userDataSubmittedVc);
          }
        }
      } catch (e) {
       console.error(e);
        //typeof e === 'string' ? setError(e) : setError('Something went wrong.');
        if (e instanceof  Error)  setError(e.message) 
        else if (e instanceof String) setError(e.toString);
        else setError('Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    getSubmittedVCDetails();

    return () => {
      ignore = true;
    };
  }, []);

  const onErrorAlertClose = () => {
    if (error === serverErrorResponse.TOKEN_REQUIRED) {
      navigate('login');
    } else {
      navigate('submitted-vc');
    }
    setError('');
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

  const cardStatusColor: { [key: string]: string } = {
    active: theme.palette.success.main,
    valid: theme.palette.success.dark,
    expired: theme.palette.error.main,
    invalid: theme.palette.error.dark,
    unknown: theme.palette.info.main,
  };

  return (
    <Container>
      <ErrorAlert message={error} isErrorWindow={error.length > 0} onClose={onErrorAlertClose} />

      <Typography variant="h5" py={3}>
        SUBMITTED VC DETAILS
      </Typography>
      {submittedVCDetails !== null &&
        Object.keys(submittedVCDetails).map((detailKey, i) => {
          const userDataValColor = detailKey.toLowerCase().includes('status')
            ? cardStatusColor[submittedVCDetails[detailKey] as string]
            : 'inherit';
          return (
            <Box display={'flex'} flexDirection={'row'} key={detailKey + '-' + i}>
              <Grid2 paddingRight={2} width={200}>
                <Typography>{detailKey}</Typography>
              </Grid2>
              <Grid2>
                <Typography color={`${userDataValColor}`}>
                  {submittedVCDetails[detailKey] as string}
                </Typography>
              </Grid2>
            </Box>
          );
        })}

      {userDataDetails !== null && (
        <Box>
          <Typography variant="h6" style={{ color: theme.palette.text.secondary }} py={3}>
            User Data in submitted (requested) VC{' '}
          </Typography>
          <Box p={2}>
            <UserDataVerticalTable userDataDetails={userDataDetails} />
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default SubmittedVCDetails;
