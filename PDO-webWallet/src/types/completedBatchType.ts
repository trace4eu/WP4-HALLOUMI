import {EventDetailsType} from './taskType';
import {EventType} from './newBatchTypes';

// Type for Completed Events
interface ICompletedEvent {
  type: EventType;
  from: string;
  fromName: string;
  lastInChain: boolean;
  vcJwt: string;
  eventDetails: EventDetailsType;
  createdAt: string;
}

export type CompletedBatchType = {
  documentId: string;
  createdAt: string;
  batchId: string;
  createdOnBehalfOfName: string;
  completedEvents: ICompletedEvent[];
};
