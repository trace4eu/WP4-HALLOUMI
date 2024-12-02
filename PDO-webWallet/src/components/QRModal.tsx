import React, {useRef} from 'react';
import {QRCodeSVG} from 'qrcode.react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
}

const QRModal: React.FC<QRModalProps> = ({isOpen, onClose, documentId}) => {
  const url = `${
    process.env.REACT_APP_PDO_BACKEND_URL
  }/v3/tnt/document?documentId=${encodeURIComponent(documentId)}&fromCustomer=true`;

  const qrCodeRef = useRef<HTMLDivElement | null>(null);

  const QR_CODE_MSG = `Please print and attach this QR code on this batch\'s production items. 
Customers scanning this QR code will see the show As customer page`;

  const qrCodeSize = 200; // px

  const handlePrint = () => {
    if (qrCodeRef.current) {
      const printWindow = window.open('', '_blank', 'width=300,height=300');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print QR Code</title>
              <style>
                body {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
                }
              </style>
            </head>
            <body>
              ${qrCodeRef.current.outerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{QR_CODE_MSG}</DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: qrCodeSize, // Optional: Ensure enough space for centering
        }}
      >
        <div ref={qrCodeRef}>
          <QRCodeSVG
            value={url} // The URL to encode in the QR code
            size={qrCodeSize} // Size of the QR code
            level="H" // Error correction level (L, M, Q, H)
          />
        </div>
      </DialogContent>
      <DialogActions sx={{paddingRight: '25px', gap: '20px'}}>
        <Button onClick={handlePrint} variant="contained" color="primary">
          Print
        </Button>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRModal;
