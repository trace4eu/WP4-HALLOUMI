import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';

const WarningElement = () => {
  const theme = useTheme();

  return (
    <Typography component="div" variant="h6" style={{ color: theme.palette.text.secondary }} py={3}>
      <Box fontWeight="fontWeightBold" display="inline">
        Warnigns:{' '}
      </Box>
      data from submitted VCs do not match those in backend
    </Typography>
  );
};

export default WarningElement;
