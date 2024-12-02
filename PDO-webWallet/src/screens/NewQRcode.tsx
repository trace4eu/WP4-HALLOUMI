import React, {useEffect, useState} from 'react';
import WalletModel from '../models/WalletModel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {useAppSelector} from '../features/hooks';
import {selectSingleCredential} from '../features/credentialSlice';
import {apiService} from '../index';
import {CompletedBatchType} from '../types/completedBatchType';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorDownloadAlert from '../components/ErrorDownloadAlert';
import TaskSelectionComponent from '../components/TaskSelectionComponent';
import QRModal from '../components/QRModal';

const response = [
  {
    documentId: '0x50444f2d48414c4c4f554d492d3331313032323032342d313233343536373839',
    createdAt: '0x67230069',
    batchId: '311022024',
    createdOnBehalfOfName: 'Halloumas Ltd',
    completedEvents: [
      {
        type: 'halloumi_produced',
        from: 'did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9KbpybdA8UrgNm7BhUsZBpZRvG4MXL6v46b9hUmi4WCQjyWAEELqfnh6EKQ3fgeJ6Eab7W6V8uhiScQyGQK9Ru3v74GuPUmQq1ps6E7cpxAsLCws7k5ReCrosph6p234vMDLp',
        fromName: 'Halloumas Ltd',
        lastInChain: true,
        vcJwt:
          'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRpZDplYnNpOnpvTDdtQkhIUW8yZ1dEVnoxWEpQZ1AzI1dpSS1GaUlOUTNkdW5naHhGM3QtYnRQd0pWTVRCREY5MVFhaHBPT3doZHMifQ.eyJqdGkiOiJ2YzpjeWVic2k6MDg1MTkyYWItODdlYi00NTczLTk2MGEtODExMDU1NThhN2Y0Iiwic3ViIjoiZGlkOmtleTp6MmRtekQ4MWNnUHg4VmtpN0pidXVNbUZZcldQZ1lveXR5a1VaM2V5cWh0MWo5S2JweWJkQThVcmdObTdCaFVzWkJwWlJ2RzRNWEw2djQ2YjloVW1pNFdDUWp5V0FFRUxxZm5oNkVLUTNmZ2VKNkVhYjdXNlY4dWhpU2NReUdRSzlSdTN2NzRHdVBVbVFxMXBzNkU3Y3B4QXNMQ3dzN2s1UmVDcm9zcGg2cDIzNHZNRExwIiwiaXNzIjoiZGlkOmVic2k6em9MN21CSEhRbzJnV0RWejFYSlBnUDMiLCJuYmYiOjE3Mjk5MTE4NzMsImV4cCI6MTc2MTQ0Nzg3MywiaWF0IjoxNzI5OTExODczLCJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJpZCI6InZjOmN5ZWJzaTowODUxOTJhYi04N2ViLTQ1NzMtOTYwYS04MTEwNTU1OGE3ZjQiLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiVmVyaWZpYWJsZUF0dGVzdGF0aW9uIiwiTGljZW5zZVRvT3BlcmF0ZSJdLCJpc3N1ZXIiOnsiaWQiOiJkaWQ6ZWJzaTp6b0w3bUJISFFvMmdXRFZ6MVhKUGdQMyIsImxlZ2FsTmFtZSI6Ik1pbmlzdHJ5IE9mIEFyZ2ljdWx0dXJlIn0sImlzc3VhbmNlRGF0ZSI6IjIwMjQtMTAtMjZUMDM6MDQ6MzNaIiwiaXNzdWVkIjoiMjAyNC0xMC0yNlQwMzowNDozM1oiLCJ2YWxpZEZyb20iOiIyMDI0LTEwLTI2VDAzOjA0OjMzWiIsImV4cGlyYXRpb25EYXRlIjoiMjAyNS0xMC0yNlQwMzowNDozM1oiLCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6ImRpZDprZXk6ejJkbXpEODFjZ1B4OFZraTdKYnV1TW1GWXJXUGdZb3l0eWtVWjNleXFodDFqOUticHliZEE4VXJnTm03QmhVc1pCcFpSdkc0TVhMNnY0NmI5aFVtaTRXQ1FqeVdBRUVMcWZuaDZFS1EzZmdlSjZFYWI3VzZWOHVoaVNjUXlHUUs5UnUzdjc0R3VQVW1RcTFwczZFN2NweEFzTEN3czdrNVJlQ3Jvc3BoNnAyMzR2TURMcCIsImxlZ2FsTmFtZSI6IkhhbGxvdW1hcyBMdGQiLCJwcm9kdWN0TmFtZSI6IkhBTExPVU1JIiwiYWxsb3dlZEV2ZW50IjoiaGFsbG91bWlfcHJvZHVjZWQiLCJsYXN0SW5DaGFpbiI6InRydWUifSwiY3JlZGVudGlhbFNjaGVtYSI6eyJpZCI6Imh0dHBzOi8vYXBpLXBpbG90LmVic2kuZXUvdHJ1c3RlZC1zY2hlbWFzLXJlZ2lzdHJ5L3YzL3NjaGVtYXMvMHgyMjY5MWY5ZDExMmY0MjEzYjcxN2E2ZDk1NGMwZmU0YTdkMmRiYmIxODM5YTMxYzI5YjQ4YTM1ZmRhMzZiMTNmIiwidHlwZSI6IkZ1bGxKc29uU2NoZW1hVmFsaWRhdG9yMjAyMSJ9LCJ0ZXJtc09mVXNlIjp7ImlkIjoiaHR0cHM6Ly9hcGktcGlsb3QuZWJzaS5ldS90cnVzdGVkLWlzc3VlcnMtcmVnaXN0cnkvdjUvaXNzdWVycy9kaWQ6ZWJzaTp6b0w3bUJISFFvMmdXRFZ6MVhKUGdQMy9hdHRyaWJ1dGVzLzBjOWNlOGQwNWEwZTZiZmQwNDFhMDQ1YWZiNmNkNGFlZTVlMjRhZDYzMTIzYTc5NjU0MGQ4YjY2MWQ3ZDhiMjYiLCJ0eXBlIjoiSXNzdWFuY2VDZXJ0aWZpY2F0ZSJ9fX0.G3ZjiFBQXOdnGv6g_cQTR5igBm09PKuGdCiJv0VL1--QbSw1o5aBfxVaSwV2QX39h2bse9M5qsdantlOyT4hlA',
        eventDetails: {
          production_date: 'data4',
          expiry_date: 'data5',
          milk_proportions: 'data6',
        },
        createdAt: '0x67230149',
      },
    ],
  },
];

const NOT_LAST_IN_CHAIN_MSG =
  'only last in chain actors can generate a QR code for the final product';

const NewQRcode = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState<CompletedBatchType[] | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<CompletedBatchType | null>(null);
  const [isQRcode, setIsQRcode] = useState(false);

  const license = useAppSelector(selectSingleCredential);

  const getCompletedBacthes = async () => {
    if (batches) setBatches(null);
    if (selectedBatch) setSelectedBatch(null);

    setLoading(true);
    const completedBatches = await apiService.getCompletedBatches(
      license!.vcDetails.productName,
      license!.vcDetails.ownerDID,
      license!.vcDetails.allowedEvent
    );

    setBatches(completedBatches);
  };

  const onGetBatches = () => {
    getCompletedBacthes()
      .catch((e: unknown) => {
        console.error('Error on fetching completed batches: ', e);
        let msg = 'Error on fetching completed batches';
        if (e instanceof Error) msg = msg + ': ' + e.message;
        if (typeof e === 'string') msg = msg + ': ' + e;
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    license && license.vcDetails.lastInChain && onGetBatches();
  }, [license]);

  const scrollWindowTop = () =>
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

  const toCloseAlert = () => {
    setError(null);
    setSelectedBatch(null);
    setIsQRcode(false);
  };

  if (loading) {
    return (
      <Box sx={{height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <CircularProgress size="8vw" />
      </Box>
    );
  }

  if (error) scrollWindowTop();

  const handleShowTask = async () => {
    // opens https://PDO-url/document?id=documentId&fromCustomer=true
    // in a new browser window.
    // The call should return a formatted web page which will be displayed in a new browser window.
    // not implemented yet on the backend.
    if (!selectedBatch?.documentId) {
      const errTxt = 'Document ID is missing. Cannot open the document.';
      console.error(errTxt);
      setError(errTxt);
      return;
    }

    window.open( `${process.env.REACT_APP_PDO_BACKEND_URL}/v3/tnt/document?documentId=${selectedBatch.documentId}&fromCustomer=true`)
    //alert('not implemented yet');
    //uncomment below once server part is implemented
    // try {
    //   setLoading(true);
    //   const fromCustomer = true;
    //   // Get the HTML content as text
    //   const htmlContent =
    //     selectedBatch && (await apiService.getShowTaskPage(selectedBatch.documentId, fromCustomer));
    //   if (htmlContent) {
    //     // Open a new browser window
    //     const newWindow = window.open('', '_blank');

    //     if (newWindow) {
    //       // Write the HTML content into the new window
    //       newWindow.document.open();
    //       newWindow.document.write(htmlContent as unknown as string);
    //       // newWindow.document.close(); ??
    //     } else {
    //       console.error(
    //         'Failed to open the new browser window. Please check your browser settings.'
    //       );
    //     }

    //     console.log(' success show task page resp', htmlContent);
    //   }
    // } catch {
    //   (e: unknown) => {
    //     console.error('Error on fetching task HTML document: ', e);
    //     let msg = 'Error on fetching task html document';
    //     if (e instanceof Error) msg = msg + ': ' + e.message;
    //     if (typeof e === 'string') msg = msg + ': ' + e;
    //     setError(msg);
    //     setSelectedBatch(null);
    //   };
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleGenerateQRcode = async () => {
    //  generates a QRcode of the url  https://PDO-url/document?id=documentId&fromCustomer=true
    setIsQRcode(true);
  };

  return (
    <Container>
      <Box sx={{px: 6}}>
        {error !== null && (
          <ErrorDownloadAlert
            message={error as string}
            isErrorWindow={error !== null}
            onClose={toCloseAlert}
          />
        )}

        <Typography
          sx={{textAlign: 'center'}}
          variant="h2"
          className="govcy-h2"
          fontWeight="fontWeightBold"
        >
          New QR code
        </Typography>
        <Typography variant="subtitle1" sx={{textAlign: 'center'}}>
          Generate a QR code for a completed batch. Valid for Last In Chain actor only.
        </Typography>
        {!license?.vcDetails.lastInChain && (
          <Typography  sx={{textAlign: 'center', color:'red'}}>
            {NOT_LAST_IN_CHAIN_MSG}
          </Typography>
        )}
        {license?.vcDetails.lastInChain && batches && (
          <TaskSelectionComponent<CompletedBatchType>
            tasks={batches}
            selectedTask={selectedBatch}
            setSelectedTask={setSelectedBatch}
            handleShowTask={handleShowTask}
            handleGenerateQRcode={handleGenerateQRcode}
          />
        )}

        {isQRcode && (
          <QRModal
            isOpen={isQRcode}
            onClose={toCloseAlert}
            documentId={selectedBatch?.documentId as string}
          />
        )}
      </Box>
    </Container>
  );
};

export default NewQRcode;
