import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import {EventDetailsOptionType, EventDetailsType} from '../types/pendingTaskType';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventDetails: EventDetailsType | null;
  setEventDetails: React.Dispatch<React.SetStateAction<EventDetailsType | null>>;
  handleProceed: () => Promise<void>;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  eventDetails,
  setEventDetails,
  handleProceed,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = event.target;
    setEventDetails({
      ...eventDetails,
      [name]: value,
    });
  };

  const renderTextField = (label: string, value?: string) => {
    const displayLabel = label.replace(/_/g, ' ');

    return (
      <TextField
        key={displayLabel}
        label={displayLabel}
        value={value || ''}
        onChange={handleChange}
        name={label}
        fullWidth
        margin="normal"
        required
      />
    );
  };

  const isStringField = (
    obj: EventDetailsType,
    field: keyof EventDetailsType
  ): obj is {[K in keyof EventDetailsType]: string} => {
    return typeof obj[field] === 'string';
  };

  const eventDetailsFields = Object.keys(eventDetails || {}).map((field) => {
    if (isStringField(eventDetails!, field as keyof EventDetailsType)) {
      return renderTextField(field, eventDetails![field as keyof EventDetailsType]);
    }
    throw Error('Event detail has unexpevcted type');
  });

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Please enter the event details</DialogTitle>
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
            handleProceed();
            onClose();
          }}
        >
          Proceed
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventDetailsModal;
