import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import AdminApiService from '../api/AdminApiService';
import DateConverter from '../helpers/DateConverter';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorAlert from '../components/ErrorAlert';
import { cardStatusType, cardType } from '../types';
import { flattenObject } from '../helpers/flattenObject';
import useTheme from '@mui/material/styles/useTheme';
import { serverErrorResponse } from '../api/ApiClient';
import UserDataVerticalTable from '../components/UserDataVerticleTable';
import WarningElement from '../components/Warning';
import SystemDataTable from '../components/SystemDataTable';
import UserDataReqVcsTable from '../components/UserDataReqVCsTable';
import InfoAlert from '../components/InfoAlert';

export interface IIssueAndUnIssueVC {
  success: boolean;
  errors?: string[];
}

interface IIssuedVCDetails {
  [key: string]: unknown;
 // requestDate: string;
  userid?: string;
  useridentification?: string;
  downloaded?: boolean;
  status: cardStatusType;
  vcdata:
    | {
        type: cardType; //'CitizenId' | 'bachelorDegree';
        issuer: string;
        issuerDID: string;
        issuanceDate: string;
        expiryDate: string;
        isRevokable?: boolean;
        userData: {
          [key: string]: unknown;
          _nametag?: cardType;
          personalIdentifier?: string;
          familyName: string;
          firstName: string;
          dateOfBirth?: string;
          ivcfield1?: string;
          ivcfield2?: string;
        };
        Jwt: string;
      }
    | { error: string | unknown };
  submittedVCdata?:
    | Array<{
        status: string;
        vcdata?: {
          type: string;
          issuerDID: string;
          issuanceDate: string;
          expiryDate: string;
          userData?: {
            [key: string]: unknown;
            familyName: string;
            firstName: string;
            svcfield1?: string;
            svcfield2?: string;
          };
          Jwt: string;
        };
      }>
    | { error: string | unknown };
  systemData?: {
    [key: string]: unknown;
    familyName: string;
    firstName: string;
    befield1?: string;
    befield2?: string;
  };
  warning?: string;
}

const IssuedVCDetails = () => {
  const [loading, setLoading] = useState(true);
  const [issuedVCDetails, setIssuedVCDetails] = useState<Partial<IIssuedVCDetails> | null>(null);
  const [userDataDetailsInIssuedVC, setUserDataDetailsInIssuedVC] = useState<Array<{
    itemKey: string;
    value: string;
  }> | null>(null);
  const [userDataInRequestedVC, setUserDataInRequestedVC] = useState<
    | Array<{
        itemKey: string;
        value: string;
      }>[]
    | null
  >(null);

  const [headCellsInSubmittedVCs, setHeadCellsInSubmittedVCs] = useState<string[]>([]);
  const [systemData, setSystemData] = useState<IIssuedVCDetails['systemData'] | null>(null);

  const [error, setError] = useState<string>('');
  const [isNavigateOnError, setIsNavigateOnError] = useState<boolean>(true);
  const [isWarning, setIsWarning] = useState<boolean>(false);

  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string>('Success!');

  const [isDownloaded, setIsDownloaded] = useState<boolean | null>(null);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    let ignore = false;

    const getIssuedVCDetails = async () => {
      let getDetailsResp: IIssuedVCDetails | unknown;
      try {
        getDetailsResp = await AdminApiService.getIssuedVCDetails(id as string);
        if (getDetailsResp === serverErrorResponse.TOKEN_REQUIRED) {
          //navigate('/login');
          setError(getDetailsResp);
        }

        if (!getDetailsResp) {
          throw new Error('Error obtaining VC details');
        }
        if ((getDetailsResp as unknown as { errors: Array<string> }).errors) {
          throw new Error((getDetailsResp as unknown as { errors: Array<string> }).errors[0]);
        } else {
          (getDetailsResp as IIssuedVCDetails).warning && setIsWarning(true);

          const vcDetails: { [key: string]: string } = {
          
            'Status: ': (getDetailsResp as IIssuedVCDetails).status,
          };

          if ((getDetailsResp as IIssuedVCDetails).userid) {
            vcDetails['USER ID: '] = (getDetailsResp as IIssuedVCDetails).userid as string;
          }
          if ((getDetailsResp as IIssuedVCDetails).useridentification) {
            vcDetails['USER Identification: '] = (getDetailsResp as IIssuedVCDetails)
              .useridentification as string;
          }
          if ('downloaded' in (getDetailsResp as IIssuedVCDetails)) {
            setIsDownloaded((getDetailsResp as IIssuedVCDetails).downloaded as boolean);
            vcDetails['Downloaded: '] =
              (getDetailsResp as IIssuedVCDetails).downloaded === true ? 'yes' : 'no';
          }
          const vcdata = (getDetailsResp as IIssuedVCDetails).vcdata;

          if (!('error' in vcdata) && 'isRevokable' in vcdata) {
            vcDetails['Revokable: '] = vcdata.isRevokable ? 'true' : 'false';
          }

          if (!ignore) {
            const userDataIssuedVc = flattenObject((getDetailsResp as IIssuedVCDetails).vcdata);

            setIssuedVCDetails(vcDetails as Partial<IIssuedVCDetails>);

            setUserDataDetailsInIssuedVC(
              userDataIssuedVc as unknown as Array<{
                itemKey: string;
                value: string;
              }>
            );

            const submittedVcdata = (getDetailsResp as IIssuedVCDetails).submittedVCdata;

            const vcUserDataInReqVCsArray =
              Array.isArray(submittedVcdata) &&
              submittedVcdata.map((vcdata: object) => flattenObject(vcdata));

            const userDataInReqVC =
              Array.isArray(vcUserDataInReqVCsArray) && vcUserDataInReqVCsArray.flat();

            if (Array.isArray(userDataInReqVC)) {
              const headers: string[] = userDataInReqVC.map(
                (item: Record<string, string>) => item.itemKey
              );

              const uniqueHeaders = [...new Set(headers)];

              headers && setHeadCellsInSubmittedVCs(uniqueHeaders);
            }

            setUserDataInRequestedVC(
              vcUserDataInReqVCsArray as Array<{ itemKey: string; value: string }>[]
            );
            const backendUserData = (getDetailsResp as IIssuedVCDetails).systemData;
            setSystemData(backendUserData);
          }
        }
      } catch (e) {
        console.error(e);
        if (e instanceof Error) setError(e.message);
        else if (e instanceof String) setError(e.toString);
        else setError('Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    getIssuedVCDetails();

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <Box
        sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CircularProgress size="8vw" />
      </Box>
    );
  }

  const onErrorAlertClose = () => {
    setError('');
    if (isNavigateOnError) {
      navigate('/issued-vc');
    } else {
      setIsNavigateOnError(true);
    }
  };

  const handleUnissue = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const unissueResp: unknown = await AdminApiService.putUnissueVC(id as string);

      if ('errors' in (unissueResp as IIssueAndUnIssueVC)) {
        const errorMessage =
          unissueResp && (unissueResp as IIssueAndUnIssueVC).errors !== undefined
            ? (unissueResp as IIssueAndUnIssueVC).errors?.join(', ')
            : 'This request cannot be unissued.';
        setError(errorMessage as string);
      } else {
        setAlertMessage('VC un-issued successfully!');
        setAlertSuccess(true);
      }
    } catch (e) {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const cardStatusColor: { [key: string]: string } = {
    active: theme.palette.success.main,
    valid: theme.palette.success.dark,
    expired: theme.palette.error.main,
    invalid: theme.palette.error.dark,
    revoked: '#FF875A',
    unknown: theme.palette.info.main,
  };

  const onInfoAlertClose = () => {
    setAlertSuccess(false);
    navigate('/issued-vc');
  };

  return (
    <Container>
      <ErrorAlert message={error} isErrorWindow={error.length > 0} onClose={onErrorAlertClose} />
      <InfoAlert message={alertMessage} open={alertSuccess} handleClose={onInfoAlertClose} />

      <Typography variant="h5" py={3}>
        ISSUED VC DETAILS
      </Typography>
      {issuedVCDetails !== null &&
        Object.keys(issuedVCDetails).map((detailKey, i) => {
          const userDataValColor = detailKey.toLowerCase().includes('status')
            ? cardStatusColor[issuedVCDetails[detailKey] as string]
            : 'inherit';

          const displayValue =
            detailKey.toLowerCase() !== 'dowloaded'
              ? (issuedVCDetails[detailKey] as string)
              : issuedVCDetails[detailKey] === true
                ? 'yes'
                : 'no';

          return (
            <Box display={'flex'} flexDirection={'row'} key={detailKey + '-' + i}>
              <Grid2 paddingRight={2} width={200}>
                <Typography>{detailKey} </Typography>
              </Grid2>
              <Grid2>
                <Typography color={`${userDataValColor}`}>{displayValue}</Typography>
              </Grid2>
            </Box>
          );
        })}

      {issuedVCDetails !== null &&
        userDataDetailsInIssuedVC !== null &&
        userDataDetailsInIssuedVC[0].itemKey !== 'error' && (
          <>
            <Typography variant="h6" style={{ color: theme.palette.text.secondary }} py={3}>
              User Data in issued VC{' '}
            </Typography>
            <Box p={2}>
              <UserDataVerticalTable
                userDataDetails={userDataDetailsInIssuedVC}
                handleUnissue={handleUnissue}
                isUnissueButtonEnabled={isDownloaded === false}
                vcStatus={issuedVCDetails['Status: '] as string}
                setError={setError}
                setIsNavigateOnError={setIsNavigateOnError}
                setAlertMessage={setAlertMessage}
                setAlertSuccess={setAlertSuccess}
                setLoading={setLoading}
              />
            </Box>
          </>
        )}

      {/* user data in requested  VCs table */}
      {userDataInRequestedVC !== null && (
        <UserDataReqVcsTable
          userDataDetails={userDataInRequestedVC}
          headCellsInSubmittedVCs={headCellsInSubmittedVCs}
        />
      )}

      {/* system backend table */}
      {systemData !== null && <SystemDataTable systemData={systemData} />}

      {/* warnings displayed only if any exist */}
      {isWarning && <WarningElement />}
    </Container>
  );
};

export default IssuedVCDetails;
