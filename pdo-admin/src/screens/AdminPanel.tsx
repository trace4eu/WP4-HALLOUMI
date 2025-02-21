import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useLocation } from 'react-router-dom';
import { transformString } from '../helpers/transformStringAndData';
import { cardType } from '../types';

interface PropsAdmin {
  orgName: string | null;
}

const AdminPanel = ({ orgName }: PropsAdmin) => {
  const { state } = useLocation();

  return (
    <Box padding={6}>
      <Typography textTransform={'capitalize'} py={2} fontSize={'1.5rem'}>
        Dear {state && state.username ? state.username : 'Admin'},
      </Typography>
      <Typography fontSize={'1.2rem'}>Welcome to {orgName} PDO Admin Panel.</Typography>
     
    </Box>
  );
};

export default AdminPanel;
