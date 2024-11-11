import {v4 as uuidv4} from 'uuid';
import {PresentationDefinitionType} from '../types/presentationDefinitionType';

const createMapEntry = (id: string, index: string) => {
  return {
    id: id,
    path: '$',
    format: 'jwt_vp',
    path_nested: {
      id: id,
      format: 'jwt_vc',
      path: '$.verifiableCredential[' + index + ']',
    },
  };
};

const generatePresentationSubmission = (
  requestedCredentialsIds: string[],
  presentationDefinition?: PresentationDefinitionType,
  definitionId?: string
) => {
  const descriptionMap = [];
  for (let reqcredentialId in requestedCredentialsIds) {
    const mapEntry = createMapEntry(requestedCredentialsIds[reqcredentialId], reqcredentialId);
    descriptionMap.push(mapEntry);
  }
  return {
    id: uuidv4(),
    definition_id: presentationDefinition ? presentationDefinition.id : definitionId,
    descriptor_map: descriptionMap,
  };
};

export default generatePresentationSubmission;
