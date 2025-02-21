import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { checkedCellValue } from '../helpers/checkedCellValue';
import React, { useState } from 'react';
import useTheme from '@mui/material/styles/useTheme';
import ModalWindow from '../components/Modal';
import { transformString, transformTableValue } from '../helpers/transformStringAndData';

interface IUserDataDetailsProps {
  userDataDetails: Array<{ itemKey: string; value: string }>[];
  headCellsInSubmittedVCs: Array<string>;
}

const UserDataReqVcsTable = ({
  headCellsInSubmittedVCs,
  userDataDetails,
}: IUserDataDetailsProps) => {
  const [isShowDetails, setIsShowDetails] = useState<boolean>(false);
  const [jwt, setJwt] = useState<string>('');

  const theme = useTheme();

  const onShow = (e: React.MouseEvent, jwt: string) => {
    e.preventDefault();

    setIsShowDetails(true);
    setJwt(jwt);
  };

  const onShowDetailsClose = () => {
    setIsShowDetails(false);
  };

  const cardStatusColor: { [key: string]: string } = {
    active: theme.palette.success.main,
    valid: theme.palette.success.dark,
    expired: theme.palette.error.main,
    invalid: theme.palette.error.dark,
    unknown: theme.palette.info.main,
  };

  const displayedDataDetails = userDataDetails && userDataDetails.map((subarray) => {
    // Check if "jwt" item exists and push it to the end
    const jwtItem = subarray.find((item) => item.itemKey.toLowerCase() === 'jwt');
    // Update each subarray with missing itemKeys
    const mappedArray = headCellsInSubmittedVCs.map((header) => {
      const matchingItem = subarray.find(
        (item) => item.itemKey.toLowerCase() === header.toLowerCase()
      );

      if (matchingItem) {
        return matchingItem;
      } else {
        // Add missing item key and value to each subarray
        return { itemKey: header, value: '' };
      }
    });

    // Remove jwtItem from its original position
    const filteredSubarray = mappedArray.filter((item) => item.itemKey.toLowerCase() !== 'jwt');

    // push jwtItem from to last position for button show
    if (jwtItem) {
      filteredSubarray.push(jwtItem);
    }

    return filteredSubarray;
  });

  return (
    <Box display={'flex'} flexDirection={'column'}>
      <ModalWindow onClose={onShowDetailsClose} jwt={jwt} open={isShowDetails} />
      {userDataDetails.length > 0 &&
      <Typography variant="h6" style={{ color: theme.palette.text.secondary }} py={3}>
        User Data in Submitted (Requested) VCs
      </Typography>
      }
      <TableContainer component={Paper} style={{ margin: '5vh 0' }}>
        <Table>
          <TableHead>
            <TableRow>
              {headCellsInSubmittedVCs.map((headCell, i) => {
                const header = checkedCellValue(headCell);

                return (
                  header && (
                    <TableCell key={headCell + '-' + i} sx={{ minWidth: '120px' }}>
                      {transformString(header)}
                    </TableCell>
                  )
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {userDataDetails.length > 0 && Array.isArray(userDataDetails) &&
              displayedDataDetails.map((singleUserDataDetails, i) => {
                return (
                  <TableRow key={i}>
                    {singleUserDataDetails.map((item, index) => {
                      const userDataValColor = item.itemKey.toLowerCase().includes('status')
                        ? cardStatusColor[item.value as string]
                        : 'inherit';

                      return item.itemKey.toLowerCase() !== 'jwt' &&
                        !item.itemKey.includes('nametag') &&
                        !item.itemKey.includes('issuerDID') ? (
                        <TableCell
                          key={index + item.value}
                          sx={{ color: `${userDataValColor}`, minWidth: 150 }}
                        >
                          {transformTableValue(item.itemKey, item.value)}
                        </TableCell>
                      ) : (
                        item.itemKey.toLowerCase() === 'jwt' && (
                          <TableCell
                            //colSpan={2}
                            align="center"
                            key={'show--button' + '-' + index}
                          >
                            <Button
                              variant="contained"
                              size="medium"
                              sx={{ width: 130, padding: 1 }}
                              onClick={(e) => onShow(e, item.value)}
                            >
                              SHOW
                            </Button>
                          </TableCell>
                        )
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserDataReqVcsTable;
