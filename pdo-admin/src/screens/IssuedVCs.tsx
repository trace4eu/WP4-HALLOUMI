import React from 'react';

import Box from '@mui/material/Box';
import AdminApiService, { getVCsParamsType, metadataType } from '../api/AdminApiService';
import DataTable from '../components/DataTable';
import { useNavigate } from 'react-router-dom';

import { serverErrorResponse } from '../api/ApiClient';

export interface IIssuedVC {
  [key: string]: string | boolean | undefined;
  userId?: string;
  userIdentification?: string;
  issued_id: string;
  reqDate: string;
  deferred: boolean;
  firstName: string;
  familyName: string;
  downloaded?: string;
}

export interface IIssuedVCResponse {
  metadata: metadataType;
  data: IIssuedVC[];
}

const IssuedVCs = () => {
  const navigate = useNavigate();

  const getIssuedVCs = (params?: getVCsParamsType) =>
    AdminApiService.getIssuedVCs(params) as
      | Promise<IIssuedVCResponse>
      | Promise<typeof serverErrorResponse.TOKEN_REQUIRED>;

  const navigateToVCDetails = (id: string) => navigate(`/issued-vc/${id}`);

  const HEADER = 'ISSUED VCs';

  return (
    <Box>
      <DataTable
        onRefreshData={getIssuedVCs}
        header={HEADER}
        navigateToVCDetails={navigateToVCDetails}
      />
    </Box>
  );
};

export default IssuedVCs;
