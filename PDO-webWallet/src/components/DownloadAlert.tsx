import * as React from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import AlertTitle from '@mui/material/AlertTitle';

interface IPropsAlert {
  message: string;
  setIsErrorWindow: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DownloadAlert({message, setIsErrorWindow}: IPropsAlert) {
  let alertText = message;
  if (!message) {
    alertText = 'Error during download';
  } else if (message.search('timeout') !== -1) {
    alertText = 'It is taking too long to get a reply.';
  }
  return (
    <Stack
      spacing={2}
      sx={{
        position: 'fixed',
        top: '18vh',
        // left: 0,
        right: 0,
        margin: 'auto',
        width: '30vw',
        zIndex: 1000,
        padding: '0 10px',
      }}
    >
      <Alert sx={{width: '100%'}} severity="error" onClose={() => setIsErrorWindow(false)}>
        <AlertTitle>{alertText}</AlertTitle>

        <strong>Try to download later.</strong>
      </Alert>
    </Stack>
  );
}
