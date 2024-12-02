import {useEffect, useState} from 'react';
import WalletModel from '../models/WalletModel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {useAppSelector} from '../features/hooks';
import {selectSingleCredential} from '../features/credentialSlice';
import {apiService} from '../index';
import {EventDetailsOptionType, EventDetailsType, PendingTaskType} from '../types/taskType';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorDownloadAlert from '../components/ErrorDownloadAlert';
import TaskSelectionComponent from '../components/TaskSelectionComponent';
import CredentialSaveOrShareOrDeleteAlert from '../components/CredentialSaveOrShareOrDeleteAlert';
import EventDetailsModal from '../components/EventDetailsModal';

interface PropsPendingTasks {
  walletModel: WalletModel;
}

const SUCCESS_COMPLETE_MSG =
  'Batch has been completed. \nPlease proceed with generating a QR code for the batch items.';

const SUCCESS_UPDATE_MSG = 'Batch updated succesfully';

const PendingTasks = ({walletModel}: PropsPendingTasks) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<PendingTaskType[] | null>(null);
  const [selectedTask, setSelectedTask] = useState<PendingTaskType | null>(null);
  const [isEventDetails, setIsEventDetails] = useState(false);
  const [eventDetails, setEventDetails] = useState<EventDetailsType | null>(null);
  const [isBatchUpdated, setIsBatchUpdated] = useState(false);
  const [isBatchCompleted, setIsBatchCompleted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);

  const license = useAppSelector(selectSingleCredential);

  const getPendingTasks = async () => {
    if (eventDetails) setEventDetails(null);
    if (tasks) setTasks(null);
    if (selectedTask) setSelectedTask(null);

    setLoading(true);
    const pendingTasks = await apiService.getPendingBatches(
      license!.vcDetails.productName,
      license!.vcDetails.ownerDID,
      license!.vcDetails.allowedEvent
    );

    setTasks(pendingTasks);
  };

  const onGetTasks = () => {
    getPendingTasks()
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

  const handleMarkAsComplete = async () => {
    if (!selectedTask) return;

    // Fetch event details based on product name
    try {
      setLoading(true);
      const eventDetailsReq = await apiService.getRequiredEvents(license!.vcDetails.productName);

      const eventDetailOptions: EventDetailsOptionType[] = eventDetailsReq.eventsDetails.filter(
        (item) => item.details
      );

      // Check if there are event details for this allowed event
      if (!eventDetailOptions || eventDetailOptions.length === 0) {
        setError('No event details found for the selected product event type.');

        return;
      }
      const matchingEventDetail = eventDetailOptions.find(
        (option) => option.type === selectedTask.type
      ) as unknown as EventDetailsOptionType;

      if (!matchingEventDetail || matchingEventDetail.details.length === 0) {
        setError('No event details found for the selected product event type.');
      } else {
        const eventDetailsObject: {[key: string]: string} = {};
        matchingEventDetail.details.forEach((detail) => {
          eventDetailsObject[detail] = '';
        });

        setEventDetails(eventDetailsObject as EventDetailsType);
        setIsEventDetails(true);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error('Error getting event details:', err);
      setError('Error getting event details: \n' + err);
      setEventDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const scrollWindowTop = () =>
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

  const handleProceed = async () => {
    if (!eventDetails) {
      setError('Please enter event details.');
      return;
    }

    try {
      scrollWindowTop();
      setLoading(true);
      const updatedBatchResp =
        selectedTask &&
        (await apiService.updateBatch(
          selectedTask.documentId,
          eventDetails,
          license?.jwt as string
        ));

      if (updatedBatchResp?.success) {
        if (license?.vcDetails.lastInChain) {
          setIsBatchCompleted(true); // to triger alert success  complete message
        } else {
          setIsBatchUpdated(true); // update sucess alert
        }
        onGetTasks();
      }
      if (!updatedBatchResp?.success) {
        if (updatedBatchResp?.errors) {
          setError(updatedBatchResp?.errors.join(', '));
        } else setError('failed but no error description');
      }
    } catch (err) {
      console.error('Error updating batch:', err);
      let errMsg = 'Error updating batch';
      if (err instanceof Error) {
        errMsg = errMsg + ': ' + err.message;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const toCloseAlert = () => {
    setError(null);
    setIsBatchUpdated(false);
    setEventDetails(null);
    setSelectedTask(null);
  };

  if (loading) {
    return (
      <Box sx={{height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <CircularProgress size="8vw" />
      </Box>
    );
  }

  if (error) scrollWindowTop();

  return (
    <Container>
      {error !== null && (
        <ErrorDownloadAlert
          message={error as string}
          isErrorWindow={error !== null}
          onClose={toCloseAlert}
        />
      )}
      {(isBatchUpdated || isBatchCompleted) && (
        <CredentialSaveOrShareOrDeleteAlert
          isVC={isBatchUpdated}
          toCancel={toCloseAlert}
          message={isBatchCompleted ? SUCCESS_COMPLETE_MSG : SUCCESS_UPDATE_MSG}
        />
      )}
      <Box sx={{px: 6}}>
        <Typography
          sx={{textAlign: 'center', marginBottom: '0 !important'}}
          variant="h2"
          className="govcy-h2"
          fontWeight="fontWeightBold"
        >
          Pending Tasks
        </Typography>
      </Box>

      {!tasks || tasks.length === 0 ? (
        <Typography marginTop={2} textAlign="center">
          {' '}
          No pending tasks yet
        </Typography>
      ) :
       (
        <TaskSelectionComponent<PendingTaskType>
          tasks={tasks}
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          handleMarkAsComplete={handleMarkAsComplete}
        />
      )}
      {isEventDetails && eventDetails && (
        <EventDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          eventDetails={eventDetails}
          setEventDetails={setEventDetails}
          handleProceed={handleProceed}
        />
      )}
    </Container>
  );
};

export default PendingTasks;
