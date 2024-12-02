import React from 'react';
import Typography from '@mui/material/Typography';
import {EventDetailsType} from '../types/taskType';
import TableCell from '@mui/material/TableCell';
interface EventDetailsProps {
  eventDetails: EventDetailsType;
}

const EventDetails: React.FC<EventDetailsProps> = ({eventDetails}) => {
  return (
    <TableCell sx={{py: 2}}>
      {Object.entries(eventDetails).map(([key, value]) => (
        <Typography key={key}>
          <span style={{fontWeight: 500}}>{key.replace(/_/g, ' ')}:</span> {value}
        </Typography>
      ))}
    </TableCell>
  );
};

export default EventDetails;
