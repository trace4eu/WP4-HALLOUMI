import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminApiService from '../api/AdminApiService';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import DateConverter from '../helpers/DateConverter';
import { flattenObject } from '../helpers/flattenObject';
import ErrorAlert from '../components/ErrorAlert';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import WarningElement from '../components/Warning';
import SystemDataTable from '../components/SystemDataTable';
import VCIssueForm, { INewVCIssueData, IVCIssueData } from '../components/IssueVCForm';
import InfoAlert from '../components/InfoAlert';
import { transformString } from '../helpers/transformStringAndData';
import { IIssueAndUnIssueVC } from '../screens/IssuedVCDetails';
import UserDataReqVcsTable from '../components/UserDataReqVCsTable';
import { cardType } from '../types';

interface IPendingReqAndUserDataDetails {
  [key: string]: unknown;
  deferred_id: string;
  requestDate: string;
  userid?: string;
  useridentification?: string;
  submittedVCdata?: [
    {
      status?: string;
      vcdata?:
        | {
            [key: string]: unknown;
            type: string;
            issuer: string;
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
          }
        | { error: string | unknown };
    },
  ];
  systemData?: {
    [key: string]: unknown;
    familyName: string;
    firstName: string;
    befield1?: string;
    befield2?: string;
  };
  warning?: string;
}

interface PropsUserDataDetails {
  vcType: cardType | null;
}

const UserDataDetails = ({ vcType }: PropsUserDataDetails) => {
  const [pendingReqs, setPendingReqs] = useState<Partial<IPendingReqAndUserDataDetails> | null>(
    null
  );
  const [userDataDetails, setUserDataDetails] = useState<Record<string, string>[][]>([]);

  const [systemData, setSystemData] = useState<IPendingReqAndUserDataDetails['systemData'] | null>(
    null
  );

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isWarning, setIsWarning] = useState<boolean>(false);
  const [alertSuccess, setAlertSuccess] = useState(false);

  const [alertMessage, setAlertMessage] = useState<string>('Success!');
  const [headCellsInSubmittedVCs, setHeadCellsInSubmittedVCs] = useState<string[]>([]);
  const [vcIssuerFormData, setVcIssuerFormData] = useState<INewVCIssueData | null>(null);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    const getUserDataDetails = async () => {
      let getDetailsResp: unknown;
      try {
        setLoading(true);
        getDetailsResp = (await AdminApiService.getUserDataDetails(id as string)) as
          | IPendingReqAndUserDataDetails
          | unknown;

        if (getDetailsResp === 'jwt expired' || getDetailsResp === 'bearer token needed') {
          navigate('/login');
        }
        console.log('get user data details: ', getDetailsResp);

        if ('errors' in (getDetailsResp as { errors: Array<string> })) {
          throw new Error((getDetailsResp as { errors: Array<string> }).errors[0]);
        } else {
          (getDetailsResp as IPendingReqAndUserDataDetails).warning && setIsWarning(true);

          const reqDetails: { [key: string]: string } = {
            'Request date:': DateConverter.dateToString(
              (getDetailsResp as IPendingReqAndUserDataDetails).requestDate
            ),
          };
          if ((getDetailsResp as IPendingReqAndUserDataDetails).userid) {
            reqDetails['USER ID: '] = (getDetailsResp as IPendingReqAndUserDataDetails)
              .userid as string;
          }
          if ((getDetailsResp as IPendingReqAndUserDataDetails).useridentification as string) {
            reqDetails['USER Identification: '] = (getDetailsResp as IPendingReqAndUserDataDetails)
              .useridentification as string;
          }
          if ((getDetailsResp as IPendingReqAndUserDataDetails) && !ignore) {
            const vcUserDataInReqVCsArray = (
              getDetailsResp as IPendingReqAndUserDataDetails
            ).submittedVCdata?.map((vcdata: object) => flattenObject(vcdata));

            console.log(' vcUserDataIn Submitted ReqVCs: ', vcUserDataInReqVCsArray);

            setPendingReqs(reqDetails);

            if (!vcUserDataInReqVCsArray) {
              setHeadCellsInSubmittedVCs([]);
              setUserDataDetails([]);
            } else {
              const headers = Array.from(
                new Set(vcUserDataInReqVCsArray.flat().map((item) => item.itemKey))
              ).filter((itemKey) => itemKey !== 'issuerDID');

              console.log('headers in submitted VCs: ', headers);
              headers && setHeadCellsInSubmittedVCs(headers);

              vcUserDataInReqVCsArray && setUserDataDetails(vcUserDataInReqVCsArray);
            }

            const backendUserData = (getDetailsResp as IPendingReqAndUserDataDetails).systemData;

            if (!backendUserData) {
              setSystemData(null);
            } else {
              setSystemData(backendUserData);
            }

            console.log('getDetailsResp: ', getDetailsResp);

            if (
              getDetailsResp !== undefined &&
              getDetailsResp !== null &&
              Object.keys(getDetailsResp).length !== 0
            ) {
              const newDataArray = (
                getDetailsResp as IPendingReqAndUserDataDetails
              ).submittedVCdata?.map((vcData: any) => {
                return {
                  deferred_id: (getDetailsResp as IPendingReqAndUserDataDetails).deferred_id,
                  type: vcType,
                  firstName: vcData.userData ? vcData.userData.firstName : '',
                  familyName: vcData.userData ? vcData.userData.familyName : '',
                  // personalIdentifier: vcData.userData.personalIdentifier,
                  // dateOfBirth: vcData.userData.dateOfBirth,
                  // identifierValue: vcData.userData.identifierValue,
                  // title: vcData.userData.title,
                  // grade: vcData.userData.grade,
                };
              })[0] as INewVCIssueData;

              console.log('new VC issue data:', newDataArray);
              if (!newDataArray) {
                // 'CitizenId' | 'bachelorDegree';
                let emptyDataArray;

                console.log('vcType: ', vcType);

                if (vcType === 'CitizenId') {
                  emptyDataArray = {
                    deferred_id: (getDetailsResp as IPendingReqAndUserDataDetails).deferred_id,
                    type: vcType,
                    firstName: '',
                    familyName: '',
                    personalIdentifier: '',
                    dateOfBirth: '',
                  };
                }
                if (vcType === 'bachelorDegree') {
                  emptyDataArray = {
                    deferred_id: (getDetailsResp as IPendingReqAndUserDataDetails).deferred_id,
                    type: vcType,
                    firstName: '',
                    familyName: '',
                    identifierValue: '',
                    title: '',
                    grade: '',
                  };
                }

                if (vcType === 'LicenseToPractice') {
                  emptyDataArray = {
                    deferred_id: (getDetailsResp as IPendingReqAndUserDataDetails).deferred_id,
                    type: vcType,
                    firstName: '',
                    familyName: '',
                    registrationNumber: '',
                    licenseCode: '',
                    licensedFor: '',
                  };
                }

                console.log('emptyDataArray: ', emptyDataArray);
                setVcIssuerFormData(emptyDataArray as INewVCIssueData);
              } else {
                setVcIssuerFormData(newDataArray);
              }
            }
          }
        }
      } catch (e) {
        console.error(e);
        if (e instanceof  Error)  setError(e.message) 
        else if (e instanceof String) setError(e.toString);
        else setError('Something went wrong.');
        // const error = e as Error;
        // setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    getUserDataDetails();
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
    navigate('/pending-vc');
  };

  const onInfoAlertClose = () => {
    setAlertSuccess(false);
    navigate('/pending-vc');
  };

  const handleIssueVC = async (formData: IVCIssueData) => {
    console.log('Issuing VC with data:', formData);
    try {
      const issueVCResp = await AdminApiService.issueVCform(formData);
      console.log('issue vc resp: ', issueVCResp);
      if (issueVCResp.success) {
        setAlertMessage('VC issued successfully!');
        setAlertSuccess(true);
      } else {
        setError('Error during issue VC');
      }
    } catch (e) {
      console.error(e);
      setError('Something went wrong.');
    }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      const deleteVCResp: IIssueAndUnIssueVC = await AdminApiService.deleteVC(id);

      if (deleteVCResp.success) {
        setAlertMessage('Pending Request deleted succesfully.');
        setAlertSuccess(true);
      } else {
        console.error(deleteVCResp.errors?.join(', '));
        setError('Error during deleting request');
      }
    } catch (e) {
      console.error(e);
      setError('Something went wrong.');
    }
  };
  console.log('VcIssuerFormData: ', vcIssuerFormData);

  return (
    <Container>
      <ErrorAlert message={error} isErrorWindow={error.length > 0} onClose={onErrorAlertClose} />
      <InfoAlert message={alertMessage} open={alertSuccess} handleClose={onInfoAlertClose} />

      <Typography variant="h5" py={3}>
        PENDING REQ DETAILS
      </Typography>
      {pendingReqs !== null &&
        Object.keys(pendingReqs).map((detailKey, i) => {
          return (
            <Box display={'flex'} flexDirection={'row'} key={i + '-' + detailKey}>
              <Grid2 width={'150px'}>
                <Typography>{transformString(detailKey)}</Typography>
              </Grid2>
              <Grid2>
                <Typography>{pendingReqs[detailKey] as string}</Typography>
              </Grid2>
            </Box>
          );
        })}

      {/* user data in requested  VCs table */}
      {userDataDetails.length > 0 && (
        <UserDataReqVcsTable
          userDataDetails={userDataDetails as Array<{ itemKey: string; value: string }>[]}
          headCellsInSubmittedVCs={headCellsInSubmittedVCs}
        />
      )}

      {systemData !== null && <SystemDataTable systemData={systemData} />}

      {isWarning && <WarningElement />}

      {vcIssuerFormData !== null && (
        <VCIssueForm
          onIssueVC={handleIssueVC}
          onDeleteRequest={handleDeleteRequest}
          data={vcIssuerFormData}
        />
      )}
    </Container>
  );
};

export default UserDataDetails;
