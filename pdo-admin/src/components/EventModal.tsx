import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { useJwt } from 'react-jwt';

interface IModalWindowProps {
  jsonObject: object;
  onClose: () => void;
  open: boolean;
  title: string;
}

const EventModal: React.FC<IModalWindowProps> = ({ jsonObject, onClose, open, title }) => {
  const handleCloseModal = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
  };

  let newObject;
  let subtitle;
  if (title.includes('shared')) {
    const object1 = jsonObject as {verifiedBy?:string}
    subtitle = `personal data verified by ${object1.verifiedBy}`;
     delete object1.verifiedBy;
     newObject = object1;
  } else {
    newObject = jsonObject;
    subtitle =''
  }
  const eventwithmeta = JSON.parse(JSON.stringify(newObject, null, 4).replace(/\\"/g,'"').replace(/"{/g,'{').replace(/}"/g,'}'))


  return (
    <Modal
      open={open}
      onClose={handleCloseModal}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '80%',
          bgcolor: 'background.paper',
          border: '2px solid grey',
          boxShadow: 24,
          borderRadius: '50px',
          p: 4,
        }}
      >
        <Typography aria-labelledby="modal-title" variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ overflowY: 'auto', height: '80%' }} aria-describedby="modal-description">
          <pre>{JSON.stringify(eventwithmeta, null, 4)}</pre>
        </Box>
        <Typography aria-labelledby="modal-title" variant="h6" component="div" gutterBottom>
          {subtitle}
        </Typography>
        <Button
          variant="outlined"
          onClick={handleCloseModal}
          sx={{ mt: 2, position: 'relative', float: 'inline-end', width: '100px' }}
        >
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default EventModal;
