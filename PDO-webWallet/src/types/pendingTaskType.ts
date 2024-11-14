import {EventType} from 'types/newBatchTypes';

export type pendingTaskType = {
  documentId: string;
  createdAt: string;
  batchId: string;
  createdOnBehalfOfName: string;
  type: EventType;
  notesToActor?: string;
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
