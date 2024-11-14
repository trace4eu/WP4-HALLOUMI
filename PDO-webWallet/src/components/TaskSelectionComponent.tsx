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
import {pendingTaskType} from '../types/pendingTaskType';
import {formatUnixTimestamp} from '../helpers/formatUnixTimestamp';

interface ITaskSelectionComponentProps {
  tasks: Array<pendingTaskType>;
  selectedTask: pendingTaskType | null;
  setSelectedTask: Dispatch<SetStateAction<pendingTaskType | null>>;
  handleMarkAsComplete: () => Promise<void>;
}
const TaskSelectionComponent = ({
  tasks,
  selectedTask,
  setSelectedTask,
  handleMarkAsComplete,
}: ITaskSelectionComponentProps) => {
  const handleTaskSelect = (taskId: string) => {
    const taskById = tasks.find((task) => task.documentId === taskId);

    taskById && setSelectedTask(taskById);
  };

  const handleMarkAsCompleteClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    handleMarkAsComplete();
  };

  return (
    <Box sx={{p: 4, display: 'flex', flexDirection: 'column'}}>
      <Typography variant="subtitle1" sx={{textAlign: 'center'}}>
        you need to take action on the following supply chain tasks
      </Typography>
      <Typography variant="h4" className="govcy-h4" gutterBottom>
        Select an Event to Mark as Complete
      </Typography>

      <TableContainer component={Paper} style={{marginTop: 20}}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Select</TableCell>
              <TableCell>Batch ID</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Requested By</TableCell>
              <TableCell>Notes</TableCell>
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
                <TableCell>{task.createdOnBehalfOfName}</TableCell>
                <TableCell>{task.notesToActor || 'No notes'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button
        variant="contained"
        color="primary"
        disabled={!selectedTask}
        onClick={handleMarkAsCompleteClick}
        style={{marginTop: 20}}
      >
        Mark as Complete
      </Button>
    </Box>
  );
};

export default TaskSelectionComponent;
