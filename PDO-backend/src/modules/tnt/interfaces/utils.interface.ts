export type Alg = "ES256K" | "ES256" | "RS256" | "EdDSA";

export interface TrustedApp {
  privateKey: string;
  name: string;
  kid: string;
  publicKeyPem?: string;
  publicKeyPemBase64?: string;
}

export interface BuildParamResponse {
  info: {
    title: string;
    data: unknown;
  };
  param: {
    [x: string]: unknown;
  };
  method?: string;
}

export interface UnknownObject {
  [x: string]: unknown;
}

export interface TnTtimestamp {
  datetime: string;

}

export interface RequiredEvent {
  type: string;
  from: string;
  fromName:string;
  notesToActor: string;
  lastInChain?: boolean;
}

export interface PDOdocument {
  createdOnBehalfOfdid: string;
  createdOnBehalfOfName: string;
  batchId: string;
  requiredEvents: RequiredEvent[];
}

export interface TnTDocument {
  metadata: string;
  timestamp: TnTtimestamp;
  events: string[];
}

export interface PDOEvent {
  type: string;
  from: string;
  fromName: string;
  lastInChain: boolean;
  vcJwt: string;
  eventDetails: object;
  createdAt: string;
}

export interface TnTEvent {
  metadata: string;
  timestamp: TnTtimestamp;
}

export interface BatchAll {
  documentId: string;
  createdAt: string;
  batchId: string;
  createdOnBehalfOfName: string;
  requiredEvents: RequiredEvent[];
  pdoEvents: PDOEvent[]
  
}

export interface PendingBatchAll {
  documentId: string;
  createdAt: string;
  batchId: string;
  createdOnBehalfOfName: string;
  requiredEvents: RequiredEvent[];
  pdoEvents: PDOEvent[]
  
}

export interface PendingBatch {
  documentId: string;
  createdAt: string;
  batchId: string;
  createdOnBehalfOfName: string;
  requiredEvents: RequiredEvent[];
  pendingRequiredEvents: RequiredEvent[]
  completedEvents: PDOEvent[]
  
}

export interface PendingTask {
  documentId: string;
  createdAt: string;
  batchId: string;
  createdOnBehalfOfName: string;
  type: string;
  notesToActor: string;
  
}

export interface CompletedBatch {
  documentId: string;
  createdAt: string;
  batchId: string;
  createdOnBehalfOfName: string;
  completedEvents: PDOEvent[]
  
}

export interface CompletedTask {
  documentId: string;
  createdAt: string;
  batchId: string;
  createdOnBehalfOfName: string;
  type: string;
  eventDetails: object;
  batchCompleted: boolean
 // notesToActor: string;
  
}