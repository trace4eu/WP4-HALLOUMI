import React, {Dispatch, SetStateAction, useState} from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import {JWK} from 'jose';
import {v4 as uuidv4} from 'uuid';
import {apiService} from '../index';
import {initBanchType} from '../types/newBatchTypes';
import getVerifiablePresentationJwt from '../helpers/getVerifiablePresentationJwt';
import WalletModel from '../models/WalletModel';

import CredentialSaveOrShareOrDeleteAlert from '../components/CredentialSaveOrShareOrDeleteAlert';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorDownloadAlert from '../components/ErrorDownloadAlert';

interface Actor {
  actorDID: string;
  legalName: string;
  allowedEvent: string;
}

interface SelectedActor extends Actor {
  notesToActor: string;
  uniqueId: string;
}

const PDO_PRESENTATION = 'pdopresentation';
const LICENSE = 'LicenseToOperate';
const JWT_VP = 'jwt_vp';
const JWT_VC = 'jwt_vc';
const SUCCESS_MSG = 'Batch successfully created!';

const BatchComponent = ({
  productName,
  jwtvc,
  walletModel,
}: {
  productName: string;
  jwtvc: string;
  walletModel: WalletModel;
}) => {
  const [batchId, setBatchId] = useState<string>('');
  const [actors, setActors] = useState<Actor[]>([]);
  const [selectedActors, setSelectedActors] = useState<SelectedActor[]>([]);
  const [inputError, setInputError] = useState<string | null>(null);
  const [isInitSuccess, setIsInitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFetchActors = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (batchId.length < 8) {
      setInputError('Batch ID must be at least 8 characters.');
      return;
    }
    try {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      setLoading(true);
      const getActorsResponse = await apiService.getActiveActors(productName);

      if (getActorsResponse) {
        setActors(getActorsResponse);
        setInputError(null);
      } else {
        throw new Error('Error fetching actors');
      }
    } catch (error: unknown) {
      console.error('Error fetching actors', error);
      setError(error as string);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectActor = (actor: Actor, index: number) => {
    const uniqueId = `${actor.actorDID}-${index}`;
    const alreadySelected = selectedActors.find((selected) => selected.uniqueId === uniqueId);

    if (alreadySelected) {
      setSelectedActors(selectedActors.filter((selected) => selected.uniqueId !== uniqueId));
    } else {
      setSelectedActors([...selectedActors, {...actor, notesToActor: '', uniqueId}]);
    }
  };

  const handleNoteChange = (uniqueId: string, notes: string) => {
    setSelectedActors(
      selectedActors.map((actor) =>
        actor.uniqueId === uniqueId ? {...actor, notesToActor: notes} : actor
      )
    );
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const walletDID = walletModel.getDID() as string;
    const privateKeyJwk = walletModel.getKeys() as JWK;
    const audience = `${process.env.REACT_APP_PDO_BACKEND_URL}/v3/tnt`;
    const selectedjwtvcs = [jwtvc];

    const vpJwt = await getVerifiablePresentationJwt(
      audience,
      walletDID,
      selectedjwtvcs,
      privateKeyJwk
    );

    const initBanch: initBanchType = {
      productName,
      batchId,
      requiredActions: selectedActors.map(({allowedEvent, actorDID, legalName, notesToActor}) => ({
        type: allowedEvent,
        from: actorDID,
        fromName: legalName,
        notesToActor,
      })),
      vp_token: vpJwt,
      presentation_submission: {
        id: uuidv4(), // '00f4c7ee-2934-4db2-adb0-4909652f10d8',
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
      },
    };

    try {
      setSelectedActors([]);
      setBatchId('');
      window.scrollTo({
        top: 0,
        // behavior: 'smooth',
      });
      setLoading(true);
      const batchInitResp = await apiService.initNewBatch(initBanch);

      if (batchInitResp.success) {
        setIsInitSuccess(batchInitResp.success);
      } else {
        throw new Error(batchInitResp.errors.join(', '));
      }
    } catch (error) {
      console.error('Error submitting batch', error);
      let errorMessage = 'Error submitting batch';
      if (typeof error === 'string') {
        errorMessage = error;
      }
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toCloseAlert = () => {
    setIsInitSuccess(false);
    setError(null);
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: '50vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          zIndex: 20,
          top: 0,
          left: 0,
          backgroundColor: '#fff',
        }}
      >
        <CircularProgress size="8vw" />
      </Box>
    );
  }

  return (
    <Box>
      {loading && (
        <Box
          sx={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            backgroundColor: '#fff',
            left: 0,
            top: 0,
            zIndex: 10,
          }}
        >
          <CircularProgress size="8vw" />
        </Box>
      )}
      {isInitSuccess && (
        <CredentialSaveOrShareOrDeleteAlert
          isVC={isInitSuccess}
          toCancel={toCloseAlert}
          message={SUCCESS_MSG}
        />
      )}
      {error !== null && (
        <ErrorDownloadAlert
          message={error as string}
          isErrorWindow={error !== null}
          onClose={toCloseAlert}
        />
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          width: '60%',
          maxWidth: '400px',
        }}
      >
        <TextField
          label="Batch ID"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          error={!!inputError}
          helperText={inputError}
          margin="normal"
        />
        <Button
          variant="contained"
          onClick={handleFetchActors}
          disabled={batchId.length < 8}
          sx={{marginBottom: 0}}
        >
          Proceed
        </Button>
      </Box>

      {actors.length > 0 && (
        <TableContainer component={Paper} style={{marginTop: 20}}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Select</TableCell>
                <TableCell>Actor’s Name</TableCell>
                <TableCell>Allowed Event</TableCell>
                <TableCell>Notes to Actor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {actors.map((actor, index) => {
                const uniqueId = `${actor.actorDID}-${index}`;
                const isSelected = !!selectedActors.find(
                  (selected) => selected.uniqueId === uniqueId
                );

                return (
                  <TableRow key={uniqueId}>
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectActor(actor, index)}
                      />
                    </TableCell>
                    <TableCell>{actor.legalName}</TableCell>
                    <TableCell>{actor.allowedEvent}</TableCell>
                    <TableCell>
                      <TextField
                        placeholder="Enter notes"
                        value={
                          isSelected
                            ? selectedActors.find((selected) => selected.uniqueId === uniqueId)
                                ?.notesToActor || ''
                            : ''
                        }
                        onChange={(e) => handleNoteChange(uniqueId, e.target.value)}
                        fullWidth
                        // required
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={
              selectedActors.length === 0
              // || selectedActors.some((actor) => !actor.notesToActor)
            }
            style={{marginTop: 20, marginLeft: 25}}
          >
            Submit
          </Button>
        </TableContainer>
      )}
    </Box>
  );
};

export default BatchComponent;
