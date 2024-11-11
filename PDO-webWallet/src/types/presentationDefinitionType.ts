import {walletKnownCard} from './typeCredential';

type DescriptorType = {
  id: string; //'gov-id';
  constraints: {
    fields: [
      {
        path: ['$.type'];
        filter: {
          type: 'array';
          contains: {
            const: walletKnownCard; // 'CitizenId' | 'WalletCredential' | 'bachelorDegree';
          };
        };
      }
    ];
  };
};

export type PresentationDefinitionType = {
  id: string; // 'presentation-id' | 'gwpresentation';
  format: {
    jwt_vc: {
      alg: ['ES256'];
    };
    jwt_vp: {
      alg: ['ES256'];
    };
  };
  input_descriptors: Array<DescriptorType>;
};
