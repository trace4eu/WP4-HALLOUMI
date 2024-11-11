import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';

type CredentialType = 'verified' | 'deferred';

interface IDeleteCredentialAlertProps {
  setIsDeleteAlert: React.Dispatch<React.SetStateAction<boolean>>;
  type: CredentialType;
  onDelete: () => void;
}

export default function DeleteCredentialAlert({
  setIsDeleteAlert,
  type,
  onDelete,
}: IDeleteCredentialAlertProps) {
  const verticalPosition = type === 'verified' ? '75vh' : '18vh';
  const horizontalPosition = type === 'verified' ? '20%' : '10px';

  return (
    <Stack sx={{width: '60vw'}} spacing={2}>
      <Alert
        severity="warning"
        sx={{
          position: 'fixed',
          top: verticalPosition,
          right: horizontalPosition,
          zIndex: 1000,
          padding: '0 10px',
        }}
        action={
          <Stack flexDirection="row">
            <Button
              color="inherit"
              size="small"
              onClick={(e) => {
                e.preventDefault();
                onDelete();
              }}
            >
              delete
            </Button>
            <IconButton
              aria-label="delete"
              onClick={(e) => {
                e.preventDefault();
                setIsDeleteAlert(false);
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        }
      >
        <Typography> Once deleted {type} credential can't be restored.</Typography>
        <Typography>You would need to apply to issuer again.</Typography>
      </Alert>
    </Stack>
  );
}
