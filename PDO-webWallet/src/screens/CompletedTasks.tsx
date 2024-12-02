import React, {useEffect, useState} from 'react';
import WalletModel from '../models/WalletModel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {useAppSelector} from '../features/hooks';
import {selectSingleCredential} from '../features/credentialSlice';
import {apiService} from '../index';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorDownloadAlert from '../components/ErrorDownloadAlert';
import TaskSelectionComponent from '../components/TaskSelectionComponent';
import {
  CompletedTaskDocumentType,
  CompletedTaskType,
  DocumentResponseType,
} from '../types/taskType';
import TaskDocumentModal from '../components/TaskDocumentModal';

interface PropsCompletedTasks {
  walletModel: WalletModel;
}

const CompletedTasks = ({walletModel}: PropsCompletedTasks) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<CompletedTaskType[] | null>(null);
  const [selectedTask, setSelectedTask] = useState<CompletedTaskType | null>(null);
  const [document, setDocument] = useState<CompletedTaskDocumentType | null>(null);

  const license = useAppSelector(selectSingleCredential);

  const getCompletedTasks = async () => {
    if (tasks) setTasks(null);

    setLoading(true);
    const completedTasks = await apiService.getCompletedTasks(
      license!.vcDetails.productName,
      license!.vcDetails.ownerDID,
      license!.vcDetails.allowedEvent
    );

    setTasks(completedTasks);
  };

  const onGetTasks = () => {
    getCompletedTasks()
      .catch((e: unknown) => {
        console.error('Error on fetching pending tasks: ', e);
        let msg = 'Error on fetching pending tasks';
        if (e instanceof Error) msg = msg + ': ' + e.message;
        if (typeof e === 'string') msg = msg + ': ' + e;
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    license && onGetTasks();
  }, [license]);

  const toCloseAlert = () => {
    setError(null);
  };

  const handleShowTask = async () => {
    try {
      setLoading(true);
      const documentResp =
        selectedTask && (await apiService.getTaskDocument(selectedTask.documentId));
      if (documentResp) {
        if ((documentResp as DocumentResponseType).errors) {
          setError((documentResp as DocumentResponseType).errors?.join(', ') as string);
          setSelectedTask(null);
        }
        setDocument(documentResp as CompletedTaskDocumentType);

        console.log(' success doc resp', documentResp);
      }
    } catch {
      (e: unknown) => {
        console.error('Error on fetching task document: ', e);
        let msg = 'Error on fetching task document';
        if (e instanceof Error) msg = msg + ': ' + e.message;
        if (typeof e === 'string') msg = msg + ': ' + e;
        setError(msg);
        setSelectedTask(null);
      };
    } finally {
      setLoading(false);
    }
  };

  const scrollWindowTop = () =>
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

  const onModalClose = () => {
    setDocument(null);
    setSelectedTask(null);
  };

  if (error) scrollWindowTop();

  console.log('lisence ', license);
  console.log('completedTasks: ', tasks);

  if (loading) {
    return (
      <Box sx={{height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <CircularProgress size="8vw" />
      </Box>
    );
  }

  return (
    <Container>
      <Box sx={{px: 6}}>
        {error !== null && (
          <ErrorDownloadAlert
            message={error as string}
            isErrorWindow={error !== null}
            onClose={toCloseAlert}
          />
        )}

        {document && (
          <TaskDocumentModal open={document !== null} document={document} onClose={onModalClose} />
        )}
        <Typography
          sx={{textAlign: 'center', marginBottom: '2 !important'}}
          variant="h2"
          className="govcy-h2"
          fontWeight="fontWeightBold"
        >
          Completed Tasks
        </Typography>
      </Box>
      {!tasks || tasks.length === 0 ? (
        <Typography marginTop={2} textAlign="center">
          {' '}
          No completed tasks yet
        </Typography>
      ) : (
        <TaskSelectionComponent<CompletedTaskType>
          tasks={tasks}
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          handleShowTask={handleShowTask}
        />
      )}
    </Container>
  );
};

export default CompletedTasks;
