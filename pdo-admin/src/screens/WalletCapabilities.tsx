import React, { useEffect, useState } from 'react';
import { Button, Typography, Container, CircularProgress, Box, Paper } from '@mui/material';
import AdminApiService from '../api/AdminApiService';
import ErrorModal from '../components/ErrorModal';
import WalletCapDisplay from '../components/WalletCapDisplay';

interface VerificationMethod {
  id: string;
  alg: string;
}

interface DIDRegistry {
  verificationMethod: VerificationMethod[];
  authentication: string[];
  assertionMethod: string[];
  capabilityInvocation: string[];
}

interface AccreditationVC {
  accreditedFor?: string[] | null;
  termsOfUse: string;
}

type DisplayedAccreditationVC = Omit<AccreditationVC, 'accreditedFor'> & {
  accreditedFor?: string[] | 'n/a';
};

interface TIRRegistry {
  attributeId: string;
  issuerType: string;
  tao: string;
  rootTao: string;
  accreditationVC?: AccreditationVC | null;
}

type DisplayedTIRRegistry = Omit<TIRRegistry, 'accreditationVC'> & {
  accreditationVC?: AccreditationVC | 'n/a';
};

export interface IWalletCapabilities {
  Domain: string;
  DID: string;
  DIDKid_ES256: string;
  DIDKid_ES256K: string;
  DID_Registry_API_Url: string;
  TIR_Registry_API_Url: string;
  Accreditation_Url: string;
  DID_Registry: DIDRegistry;
  TIR_Registry: TIRRegistry[];
}

export type DisplayedIWalletCapabilities = Omit<IWalletCapabilities, 'TIR_Registry'> & {
  TIR_Registry: DisplayedTIRRegistry[];
};

const WalletCapabilities = () => {
  const [data, setData] = useState<IWalletCapabilities | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletCapabilities = async () => {
    try {
      setLoading(true);
      setError(null);
      const walletCap: IWalletCapabilities = await AdminApiService.getWalletCapabilities();
      setData(walletCap);
    } catch (err: unknown) {
      if (typeof err === 'string') {
        setError(err);
      } else {
        setError((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletCapabilities();
  }, []);

  const handleRefresh = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    fetchWalletCapabilities();
  };

  if (loading) {
    return (
      <Box
        sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CircularProgress size="8vw" />
      </Box>
    );
  }

  const closeErrorModal = () => setError(null);

  return (
    <Container sx={{ pt: 3 }}>
      <Typography variant="h4" gutterBottom width={'100%'} textAlign={'center'} mb={3}>
        Wallet Capabilities
      </Typography>
      <Button variant="outlined" onClick={handleRefresh}>
        Refresh
      </Button>

      {data && (
        <Paper elevation={3} sx={{ mt: 4, width: 'fit-content' }}>
          <Box p={4}>
            <WalletCapDisplay data={data} />
          </Box>
        </Paper>
      )}

      <ErrorModal error={error} setError={closeErrorModal} />
    </Container>
  );
};

export default WalletCapabilities;
