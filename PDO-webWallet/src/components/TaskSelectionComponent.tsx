import React, {Dispatch, SetStateAction} from 'react';
import Button from '@mui/material/Button';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {PendingTaskType, CompletedTaskType} from '../types/taskType';
import {formatUnixTimestamp} from '../helpers/formatUnixTimestamp';
import EventDetails from '../components/EventDetailsComponent';
import {CompletedBatchType} from '../types/completedBatchType';

interface ITaskSelectionComponentProps<T> {
  tasks: Array<T>;
  selectedTask: T | null;
  setSelectedTask: Dispatch<SetStateAction<T | null>>;
  handleMarkAsComplete?: () => Promise<void>;
  handleShowTask?: () => Promise<void>;
  handleGenerateQRcode?: () => Promise<void>;
}

const TaskSelectionComponent = <
  T extends PendingTaskType | CompletedTaskType | CompletedBatchType
>({
  tasks,
  selectedTask,
  setSelectedTask,
  handleMarkAsComplete,
  handleShowTask,
  handleGenerateQRcode,
}: ITaskSelectionComponentProps<T>) => {
  const handleTaskSelect = (taskId: string) => {
    const taskById = tasks.find((task) => task.documentId === taskId);
    if (taskById) {
      setSelectedTask(taskById);
    }
  };

  const handleTaskClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (handleShowTask) {
      handleShowTask();
    }
    if (handleMarkAsComplete) {
      handleMarkAsComplete();
    }
  };

  const PADDING = handleMarkAsComplete ? 4 : '10px 32px 32px';
  const SHOW_BTN_TEXT = handleGenerateQRcode ? 'show As customer' : 'show';
  const COMPLETE_BTN_TXT = 'Mark as Complete';

  return (
    <Box sx={{p: PADDING, display: 'flex', flexDirection: 'column'}}>
      {handleMarkAsComplete ? (
        <>
          <Typography variant="subtitle1" sx={{textAlign: 'center'}}>
            you need to take action on the following supply chain tasks
          </Typography>
          <Typography variant="h4" className="govcy-h4" gutterBottom>
            Select an Event to Mark as Complete
          </Typography>
        </>
      ) : !handleGenerateQRcode ? (
        <Typography variant="h4" className="govcy-h4" gutterBottom>
          List of supply chain tasks that I have completed
        </Typography>
      ) : null}

      <TableContainer component={Paper} style={{marginTop: 20}}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Select</TableCell>
              <TableCell>Batch ID</TableCell>
              <TableCell>Created At</TableCell>
              {!handleGenerateQRcode && <TableCell>Requested By</TableCell>}
              {handleMarkAsComplete && <TableCell>Notes</TableCell>}
              {handleShowTask && !handleGenerateQRcode && <TableCell>Completed Batch</TableCell>}
              {handleShowTask && !handleGenerateQRcode && <TableCell>Event Details</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.documentId}>
                <TableCell>
                  <Checkbox
                    checked={selectedTask?.documentId === task.documentId}
                    onChange={() => handleTaskSelect(task.documentId)}
                  />
                </TableCell>
                <TableCell>{task.batchId}</TableCell>
                <TableCell>{formatUnixTimestamp(task.createdAt)}</TableCell>
                {!handleGenerateQRcode && <TableCell>{task.createdOnBehalfOfName}</TableCell>}
                {handleMarkAsComplete && (
                  <TableCell>{(task as PendingTaskType).notesToActor || 'No notes'} </TableCell>
                )}
                {handleShowTask && !handleGenerateQRcode && (
                  <TableCell sx={{textAlign: 'center'}}>
                    {(task as CompletedTaskType).batchCompleted ? 'yes' : 'no'}
                  </TableCell>
                )}
                {handleShowTask && !handleGenerateQRcode && (
                  <EventDetails eventDetails={(task as CompletedTaskType).eventDetails} />
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box width={'100%'}>
        <Button
          variant="contained"
          color="primary"
          disabled={!selectedTask}
          onClick={handleTaskClick}
          style={{marginTop: 20}}
        >
          {handleShowTask ? SHOW_BTN_TEXT : COMPLETE_BTN_TXT}
        </Button>

        {handleGenerateQRcode && (
          <Button
            variant="outlined"
            color="primary"
            disabled={!selectedTask}
            onClick={handleGenerateQRcode}
            style={{marginTop: 20, paddingLeft: 15, marginLeft: 40}}
          >
            Generate QR code
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default TaskSelectionComponent;
