import React from 'react';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import {CompletedTaskDocumentType} from '../types/taskType';
import DocumentFormatter from '../helpers/DocumentFormatter';

const TaskDocumentModal = ({
  open,
  onClose,
  document,
}: {
  open: boolean;
  onClose: () => void;
  document: CompletedTaskDocumentType;
}) => {
  // Format the document
  const formatter = new DocumentFormatter(document);
  const formattedDocument = formatter.format();

  // Destructure formatted document
  const {
    'Batch ID': batchId,
    'Created At': createdAt,
    'Requested By': createdOnBehalfOfName, //| requestedBy,
    'Completed Batch': completedBatch,
    'Pending Required Events': pendingRequiredEvents,
    'Completed Events': completedEvents,
  } = formattedDocument;

  // Helper function to render event details in columns
  const renderEventDetails = (eventDetails: Record<string, string>) => {
    return (
      <Grid container spacing={2} flexWrap="nowrap" flexDirection={'column'} py={2} marginLeft={0}>
        {Object.entries(eventDetails).map(([key, value]) => (
          <Grid item xs={6} key={key} paddingTop={'8px !important'}>
            <Typography variant="body2" sx={{wordBreak: 'break-word'}} paddingTop={0}>
              <strong>{key}:</strong> {value}
            </Typography>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Batch progress Details</DialogTitle>
      <DialogContent
        sx={{
          wordBreak: 'break-word',
          m: 4,
          backgroundColor: '#e3f4f9',
          borderRadius: '10px',
          padding: '24px !important',
        }}
      >
        <Box
          sx={{
            py: 1,
          }}
        >
          {/* Basic Information */}
          <Box sx={{mb: 3}}>
            <Typography variant="body1" paddingBottom="5px">
              <strong>Batch ID:</strong> {batchId}
            </Typography>
            <Typography variant="body1" paddingBottom="5px">
              <strong>Created At:</strong> {createdAt}
            </Typography>
            <Typography variant="body1" paddingBottom="5px">
              <strong>Requested By:</strong> {createdOnBehalfOfName}
              {/* {requestedBy} */}
            </Typography>
            <Typography variant="body1">
              <strong>Completed Batch:</strong> {completedBatch}
            </Typography>
          </Box>

          {/* Pending Required Events */}
          {pendingRequiredEvents && pendingRequiredEvents.length > 0 && (
            <Box sx={{mb: 3}}>
              <Typography variant="h6" gutterBottom>
                Pending Required Events
              </Typography>
              {/* Table Header */}
              <Grid container sx={{mb: 1, pl: 2, borderBottom: '1px solid #ccc'}}>
                <Grid item xs={4}>
                  <Typography fontWeight={500}>Type</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography fontWeight={500}>Actor Assigned to</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography fontWeight={500}>Notes to Actor</Typography>
                </Grid>
              </Grid>
              {/* Table Rows */}
              {pendingRequiredEvents.map((event, index) => (
                <Grid
                  container
                  key={index}
                  sx={{
                    py: 1,
                    pl: 2,
                    borderBottom:
                      index < pendingRequiredEvents.length - 1 ? '1px solid #eee' : 'none',
                  }}
                >
                  <Grid item xs={4}>
                    <Typography sx={{fontStyle: 'italic'}}>{event.Type}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography>{event.From}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography>{event['Notes to Actor']}</Typography>
                  </Grid>
                </Grid>
              ))}
            </Box>
          )}

          {/* Completed Events */}
          {completedEvents && completedEvents.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Completed Events
              </Typography>
              {completedEvents.map((event, index) => (
                <Box key={index} sx={{mb: 2}}>
                  <Grid container spacing={2}>
                    {/* Type on its own line */}
                    <Grid item xs={12} paddingLeft={'24px !important'}>
                      <Typography sx={{fontStyle: 'italic'}}>
                        <strong>Type:</strong> {event.Type}
                      </Typography>
                    </Grid>
                    {/* Other details with indentation */}
                    <Grid item xs={12}>
                      <Box sx={{ml: 2}}>
                        <Typography paddingBottom={'3px'}>
                          <strong>Actor Assigned to:</strong> {event.From}
                        </Typography>
                        {event['Last in Chain'] !== null && (
                          <Typography paddingBottom={'3px'}>
                            <strong>Last in Chain:</strong> {event['Last in Chain'] ? 'Yes' : 'No'}
                          </Typography>
                        )}
                        {event['Created At'] && (
                          <Typography paddingBottom={'3px'}>
                            <strong>Created At:</strong> {event['Created At']}
                          </Typography>
                        )}
                        {event['Event Details'] && (
                          <Box sx={{mt: 2}}>
                            <Typography fontWeight={500}>Event Details:</Typography>
                            {renderEventDetails(event['Event Details'])}
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                  {index < completedEvents.length - 1 && <Divider />}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{paddingTop: 2, paddingRight: '20px'}}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDocumentModal;
