import React from 'react';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface ISystemDataTableProps {
  systemData?: {
    [key: string]: unknown;
    familyName: string;
    firstName: string;
    befield1?: string;
    befield2?: string;
  };
}

const SystemDataTable: React.FC<ISystemDataTableProps> = ({ systemData }) => {
  const theme = useTheme();

  if (!systemData) {
    return null;
  }

  const headers = Object.keys(systemData);
  const values = Object.values(systemData) as string[];

  return (
    <TableContainer component={Paper}>
      <Box>
        <Typography variant="h6" style={{ color: theme.palette.text.secondary }} py={3}>
          User Data from our backend matched to one of user id, user Identification, svcfield1...
        </Typography>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            {headers.map((header) => (
              <TableCell key={header}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            {values.map((value, index) => (
              <TableCell key={index}>{value}</TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SystemDataTable;
