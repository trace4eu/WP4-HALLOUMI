import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
//import {EventDetailsType} from '../types/taskType';

export type SubmittedDetails = {
    [key:string]:string|undefined;
}

export type VerifiedEventDetails = {
    
    firstName: string | undefined;
    lastName:string | undefined;
    nationality:string | undefined;
    birthDate:string | undefined;
    personalId:string | undefined;
    address:string | undefined;
    salary:string | undefined;
    employer:string | undefined;
    telephone:string | undefined;
    email:string | undefined;
}

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
 // eventDetails: VerifiedEventDetails | null;
 // setEventDetails: React.Dispatch<React.SetStateAction<SubmittedDetails | null>>;
//  setEventDetails: (submittedDetails:SubmittedDetails) => void;
  handleProceed: (submittedDetails:SubmittedDetails) => Promise<void>;
}

const VerifiedEventModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  
//  setEventDetails,
  handleProceed,
}) => {
    
  const eventDetails:VerifiedEventDetails={
      
      firstName: '',
      lastName: '',
      nationality: '',
      birthDate: '',
      personalId: '',
      address: '',
      salary: '',
      employer: '',
      telephone: '',
      email: ''
  }  

  const submittedDetails: SubmittedDetails = {};

  console.log('in verified modal->'+JSON.stringify(submittedDetails));
  //const [localEventDetails, setLocalEventDetails] = useState<SubmittedDetails>({})

  const handleFinish =() => {
    console.log('in handle finish->'+JSON.stringify(submittedDetails));
   // setEventDetails(submittedDetails);
    handleProceed(submittedDetails);
  }
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = event.target;

    submittedDetails[name] = value;
  
  };

  const renderTextField = (label: string, value?: string) => {
    const displayLabel = label.replace('Name', ' Name').replace('Date',' Date').replace('Id', ' Id');
    //const displayLabel = label;
    return (
      <TextField
        key={label}
        label={displayLabel}
        value={submittedDetails[label]}
        onChange={handleChange}
        name={label}
        fullWidth
        margin="normal"
        required
      />
    );
  };

  const isStringField = (
    obj: VerifiedEventDetails,
    field: keyof VerifiedEventDetails
  ): obj is {[K in keyof VerifiedEventDetails]: string} => {
    return typeof obj[field] === 'string';
  };

  const eventDetailsFields = Object.keys(eventDetails ).map((field) => {
    if (isStringField(eventDetails, field as keyof VerifiedEventDetails)) {
       // console.log('value field->'+field+ ' ->' +submittedDetails[field])
      return renderTextField(field, submittedDetails[field as keyof VerifiedEventDetails]);
    }
    throw Error('Event detail has unexpevcted type');
  });
 
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Please enter the user's verified personal data</DialogTitle>
      <DialogContent>{eventDetailsFields}</DialogContent>
      <DialogActions sx={{paddingRight: '25px', gap: '20px'}}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={(e) => {
            e.preventDefault();
            handleFinish();
            onClose();
          }}
        >
          Proceed
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VerifiedEventModal;
