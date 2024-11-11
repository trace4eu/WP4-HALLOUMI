type EventType =
  | 'milk_loaded_to_track'
  | 'mint_loaded_to_track'
  | 'milk_delivered'
  | 'mint_delivered'
  | 'halloumi_produced';

type EventDetail = {
  type: EventType;
  details: string[];
};

export type ReqEventsRespType = {
  requiredEvents: EventType[];
  lastInChainEvent: EventType;
  eventsDetails: EventDetail[];
};

type RequiredAction = {
  type: string;
  from: string;
  fromName: string;
  notesToActor: string;
};

type descriptorMap = {
  id: 'LicenseToOperate';
  path: '$';
  format: 'jwt_vp';
  path_nested: {
    id: 'LicenseToOperate';
    format: 'jwt_vc';
    path: '$.verifiableCredential[0]';
  };
};

export type initBanchType = {
  productName: string;
  batchId: string;
  requiredActions: RequiredAction[];
  vp_token: string;
  presentation_submission: {
    id: string;
    definition_id: 'pdopresentation';
    descriptor_map: descriptorMap[];
  };
};

export type requiredActionType = {
  type: EventType; //"milk_delivered",
  from: string; //"did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9Kbo6sHBC12QRrparA2rA4St1GNgTLNx3vBy4obWPyjG38y5Jmr1ajefRG9vw5Wj7UVPKyYAUsVXmdAeANVa8eUqbaJmixVjwESjoPVPe7FcetwD1Fs9VVCF8CnyfG3gWr3LG",
  fromName: string; //"HLM tracks Ltd",
  notesToActor: string; //"deliver 80 kilos of cow milk from Alabra"
};
