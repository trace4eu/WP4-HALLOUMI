import {PresentationSubmissionType} from '../types/newBatchTypes';
import {v4 as uuidv4} from 'uuid';

const PDO_PRESENTATION = 'pdopresentation';
const LICENSE = 'LicenseToOperate';
const JWT_VP = 'jwt_vp';
const JWT_VC = 'jwt_vc';

export const presentationSubmission: PresentationSubmissionType = {
  id: uuidv4(),
  definition_id: PDO_PRESENTATION,
  descriptor_map: [
    {
      id: LICENSE,
      path: '$',
      format: JWT_VP,
      path_nested: {
        id: LICENSE,
        format: JWT_VC,
        path: '$.verifiableCredential[0]',
      },
    },
  ],
};
