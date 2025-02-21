import React from 'react';

import Box from '@mui/material/Box';
import AdminApiService, { getVCsParamsType, metadataType } from '../api/AdminApiService';
import DataTable from '../components/DataTable';
import { useNavigate } from 'react-router-dom';

export interface IPendingVC {
  [key: string]: string | undefined;
  userId?: string;
  userIdentification?: string;
  reqDate: string;
  deferred_id: string;
}

export interface IPendingVCResponse {
  metadata: metadataType;
  data: IPendingVC[];
}

const PendingVCs = () => {
  const navigate = useNavigate();
  const params = {page:1, limit:5, productName: "HALLOUMI"}
  const getPendingVCs = () =>
    AdminApiService.getPendingVCs(params) as Promise<IPendingVCResponse>;

  const navigateToVCDetails = (id: string) => navigate(`/userdata/${id}`);

  const HEADER = 'PENDING REQS';

  return (
    <></>
    // <Box>
    //   <DataTable
    //     onRefreshData={getPendingVCs}
    //     navigateToVCDetails={navigateToVCDetails}
    //     header={HEADER}
    //   />
    // </Box>
  );
};

export default PendingVCs;
