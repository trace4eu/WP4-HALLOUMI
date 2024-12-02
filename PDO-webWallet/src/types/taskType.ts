import {EventType} from 'types/newBatchTypes';

export type TaskType = {
  documentId: string;
  createdAt: string;
  batchId: string;
  createdOnBehalfOfName: string;
  type: EventType;
};

export type PendingTaskType = TaskType & {
  notesToActor?: string; // Additional field specific to pending tasks
};

export type ProductDetailsType = {
  halloumi_produced: ['production_date', 'expiry_date', 'milk_proportions', 'total_items_produced'];
  milk_loaded_to_track: ['milk_production_date', 'milk_type', 'milk_volume'];
  mint_delivered: ['mint_delivery_date', 'mint_weight'];
  milk_delivered: ['milk_delivery_date', 'refrigerator_temperature', 'milk_volume'];
  mint_loaded_to_track: string[]; // TODO add more strict type
};

export type EventDetailsOptionType = {
  type: EventType;
  details: ProductDetailsType[EventType];
};

type HalloumiProducedDetailsType = {
  production_date: string;
  expiry_date: string;
  milk_proportions: string;
  total_items_produced?: string;
};

type MilkLoadedDetailsType = {
  milk_production_date: string;
  milk_type: string;
  milk_volume: string;
};

type MintDeliveredDetailsType = {
  mint_delivery_date: string;
  mint_weight: string;
};

type MilkDeliveredDetailsType = {
  milk_delivery_date: string;
  refrigerator_temperature: string;
  milk_volume: string;
};

type MintLoadedDetailsType = {
  mint_production_date?: string;
  mint_weight?: string;
  mint_type?: string;
};

export type EventDetailsType =
  | MintLoadedDetailsType
  | MilkDeliveredDetailsType
  | MintDeliveredDetailsType
  | MilkLoadedDetailsType
  | HalloumiProducedDetailsType;

export type CompletedTaskType = TaskType & {
  eventDetails: EventDetailsType; // Additional field specific to completed tasks
  batchCompleted: boolean; // Additional field specific to completed tasks
};

type CommonDocumentEventType = {
  type: string;
  from: string;
  fromName: string;
};

export type CompletedEventWithStatusType = CommonDocumentEventType & {
  lastInChain: boolean | null;
  vcJwt?: string;
  eventDetails: EventDetailsType;
  createdAt: string;
  licenseStatus?: string;
};

export type PendingRequiredEventsType = CommonDocumentEventType & {
  notesToActor: string;
};

export type CompletedTaskDocumentType = {
  documentId: string;
  createdAt: string;
  batchId: string;
  createdOnBehalfOfName: string;
  batchCompleted: boolean;
  completedEvents: CompletedEventWithStatusType[];
  pendingRequiredEvents: PendingRequiredEventsType[];
};

export type DocumentResponseType = {
  success: boolean;
  errors?: string[];
};
