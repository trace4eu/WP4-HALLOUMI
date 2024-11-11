import React, {useEffect, useState} from 'react';
import WalletModel from '../models/WalletModel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

interface PropsPendingTasks {
    walletModel: WalletModel;
}

const PendingTasks = ({walletModel}: PropsPendingTasks) => {
    return (
        <Container>
        <Box sx={{px: 6}}>
          <Typography
            sx={{textAlign: 'center'}}
            variant="h2"
            className="govcy-h2"
            fontWeight="fontWeightBold"
          >
            Pending Tasks
          </Typography>
        </Box>
      </Container>
    )

}

export default PendingTasks;