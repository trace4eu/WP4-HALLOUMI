import React, { useState } from 'react';

import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import TableBody from '@mui/material/TableBody';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import ModalWindow from '../components/Modal';
import { transformString, transformTableValue } from '../helpers/transformStringAndData';
import AdminApiService from '../api/AdminApiService';

interface UserDataDetail {
  itemKey: string;
  value: string | boolean;
}

interface VerticalTableProps {
  userDataDetails: UserDataDetail[];
  handleUnissue?: (e: React.MouseEvent) => void;
  isUnissueButtonEnabled?: boolean;
  vcStatus?: string;
  setError?: React.Dispatch<React.SetStateAction<string>>;
  setIsNavigateOnError?: React.Dispatch<React.SetStateAction<boolean>>;
  setAlertMessage?: React.Dispatch<React.SetStateAction<string>>;
  setAlertSuccess?: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}

const UserDataVerticalTable: React.FC<VerticalTableProps> = ({
  userDataDetails,
  handleUnissue,
  isUnissueButtonEnabled,
  vcStatus,
  setError,
  setIsNavigateOnError,
  setAlertMessage,
  setAlertSuccess,
  setLoading,
}) => {
  const [isShowDetails, setIsShowDetails] = useState<boolean>(false);
  const [jwt, setJwt] = useState<string>('');

  // Separate items into licensedFor and others
  const licensedForItems: UserDataDetail[] = [];
  const otherItems: UserDataDetail[] = [];
  let isLicensedForFileds = false;

  userDataDetails.forEach((item) => {
    if (item.itemKey.includes('licensedFor')) {
      licensedForItems.push(item);

      isLicensedForFileds = true;
    } else {
      otherItems.push(item);
    }
  });

  // Merge licensedFor items into one object
  const mergedLicensedForObject: UserDataDetail = {
    itemKey: 'Licensed For',
    value: '',
  };

  licensedForItems.forEach((item, i) => {
    mergedLicensedForObject.value +=
      item.value + (licensedForItems.length === 1 || i === licensedForItems.length - 1 ? '' : ', ');
  });

  // Combine merged licensedFor object with other items
  const finalUserDataDetails = isLicensedForFileds
    ? [...otherItems, mergedLicensedForObject]
    : otherItems;

  // Move the object with itemKey: 'jwt' to the last position
  const jwtObjectIndex = finalUserDataDetails.findIndex((item) => item.itemKey === 'jwt');
  if (jwtObjectIndex !== -1) {
    const jwtObject = finalUserDataDetails.splice(jwtObjectIndex, 1)[0];
    finalUserDataDetails.push(jwtObject);
  }

  console.log('!!User Data Vertical Table and user data details: ', finalUserDataDetails);

  const isRevokableItem = finalUserDataDetails.find((item) => item.itemKey === 'isRevokable');

  const isRevokable = isRevokableItem ? isRevokableItem.value === true : false;

  const statusListIndex = finalUserDataDetails.find((item) => item.itemKey === 'statusListIndex');

  const handleShow = (e: React.MouseEvent, jwt: string) => {
    e.preventDefault();
    setIsShowDetails(true);
    setJwt(jwt);
  };

  const onShowDetailsClose = () => {
    setIsShowDetails(false);
  };

  const handleRevoke = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!statusListIndex) {
      if (setError && setIsNavigateOnError) {
        setIsNavigateOnError(false);
        setError('statusListIndex  not found');
      }
    } else {
      console.log('handleRevoke clicked  && vcid: ', statusListIndex.value);

      try {
        setLoading && setLoading(true);
        const revokeVCResponse = await AdminApiService.postRevokeVC(statusListIndex.value as string);

        console.log('postRevokeVC resp: ', revokeVCResponse);
        if (setAlertMessage && setAlertSuccess) {
          setAlertMessage('VC revoked successfully!');
          setAlertSuccess(true);
        }
      } catch (e) {
        console.error(e);
        setIsNavigateOnError && setIsNavigateOnError(false);
        if (setError) {
          if (e instanceof Error) setError(e.message);
          else if (e instanceof String) setError(e.toString);
          else setError('Something went wrong.');
        }
      } finally {
        setLoading && setLoading(false);
      }
    }
  };

  const handleReActivate = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!statusListIndex) {
      if (setError && setIsNavigateOnError) {
        setError('statusListIndex not found');
        setIsNavigateOnError(false);
      }
    } else {
      console.log('handleReActivate clicked  && walletDID: ', statusListIndex.value);

      try {
        setLoading && setLoading(true);
        const reactivateVCResponse = await AdminApiService.postReActivateVC(
          statusListIndex.value as string
        );

        console.log('post reactivate resp: ', reactivateVCResponse);
        if (setAlertMessage && setAlertSuccess) {
          setAlertMessage('VC reactivated successfully!');
          setAlertSuccess(true);
        }
      } catch (e) {
        console.error(e);
        setIsNavigateOnError && setIsNavigateOnError(false);
        if (setError) {
          if (e instanceof Error) setError(e.message);
          else if (e instanceof String) setError(e.toString);
          else setError('Something went wrong.');
        }
      } finally {
        setLoading && setLoading(false);
      }
    }
  };

  return (
    <TableContainer
      component={Paper}
      style={{ overflowX: 'auto', width: 'fit-content', padding: '20px' }}
    >
      <ModalWindow onClose={onShowDetailsClose} jwt={jwt} open={isShowDetails} />

      <Table style={{ maxWidth: 900 }}>
        <TableBody>
          {finalUserDataDetails.map(({ itemKey, value }, index) => {
            const tableValue = transformTableValue(itemKey, value);

            if (itemKey.includes('nametag') || itemKey.includes('isRevokable')) {
              return null;
            }

            return itemKey.toLowerCase() !== 'jwt' ? (
              <TableRow key={index}>
                <TableCell width={'40%'} key={index + '-' + itemKey} sx={{ minWidth: '200px' }}>
                  <Typography variant="subtitle1">{transformString(itemKey)}</Typography>
                </TableCell>
                <TableCell style={{ whiteSpace: 'pre-line', overflow: 'hidden' }} width={'60%'}>
                  <Typography variant="body1">{tableValue}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow key={index}>
                <TableCell sx={{ minWidth: '200px', borderBottom: 0, padding: 0 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{ width: '150px' }}
                    onClick={(e) => handleShow(e, tableValue as string)}
                  >
                    Show
                  </Button>
                </TableCell>

                <TableCell sx={{ minWidth: '200px', borderBottom: 0, paddingTop: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 3 }}>
                    {/* {handleUnissue && (
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ width: '150px' }}
                        onClick={(e) => handleUnissue(e)}
                        disabled={!isUnissueButtonEnabled}
                      >
                        Un-Issue
                      </Button>
                    )} */}

                    {isRevokable && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 3 }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          sx={{ width: '150px' }}
                          onClick={(e) => handleRevoke(e)}
                          disabled={vcStatus !== 'active'}
                        >
                          Revoke
                        </Button>

                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ width: '150px' }}
                          onClick={(e) => handleReActivate(e)}
                          disabled={vcStatus !== 'revoked'}
                        >
                          Re-activate
                        </Button>
                      </Box>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserDataVerticalTable;
