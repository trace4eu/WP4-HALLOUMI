import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { useJwt } from 'react-jwt';
import { List, ListItem, ListItemText, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { transformDataArray, transformDataArray2 } from '../helpers/transformStringAndData';
import { checkedCellValue } from '../helpers/checkedCellValue';



interface IPendingEvent {
  type:string;
  fromName:string;
  notesToActor:string;

}

interface ICompletedEvent {
  createdAt:string;
  type:string;
  fromName:string;
  eventDetails:object;

}

interface IPendingBatch {
  documentId:string;
  createdAt:string;
  batchId:string;
  createdOnBehalfOfName:string;
  pendingRequiredEvents: IPendingEvent[];
  completedEvents: ICompletedEvent[];
}

interface ICompletedBatch {
  documentId:string;
  createdAt:string;
  batchId:string;
  createdOnBehalfOfName:string;
  completedEvents: ICompletedEvent[];
}


interface IModalWindowProps {
  jsonObject: object;
  onClose: () => void;
  open: boolean;
  title: string;
}

const BatchModal: React.FC<IModalWindowProps> = ({ jsonObject, onClose, open, title }) => {
  const handleCloseModal = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
  };

 
 
  const batchObject =  jsonObject as  IPendingBatch



  const ListBatchEvents = (props: {events:IPendingEvent[]|ICompletedEvent[],subtitle:string} ): JSX.Element => {

    const {events,subtitle} = props;
  
    if (!events || events.length == 0) 
      return (<></>)

      const tableData = transformDataArray2(events as any);
      console.log('transformedData: ', tableData);
      //  keys to exclude from headers of table
      const excludeKeys = ['Last In Chain','vcJwt','from', '_id', 'randomEncKey'];

      //Get unique keys excluding specified keys
      const headCells = Array.from(
        new Set(
          tableData.flatMap((item) =>
            Object.keys(item).filter((key) => !excludeKeys.includes(key))
          )
        )
      );
    
      const Details =(props:{ value:string }): JSX.Element => {
        const {value} = props
        const lines = value.split(",");
      
        return (
          <List>
            {lines.map((line, i) => (
              <ListItem key={i}>{line}</ListItem>
            ))}
          </List>
        );
      }
      
  
    return (
      <>
      <Typography aria-labelledby="modal-title"  component="div" gutterBottom
        sx={(subtitle.includes('Pending')) ? { color: 'red' } : {color: 'green'}}
        >
        {subtitle}
      </Typography>
      <TableContainer component={Paper} style={{ margin: '5vh 0' }}>
          <Table>
            <TableHead>
              <TableRow>
                {/* <TableCell sx={{ border: 'none' }}></TableCell> */}
                {headCells.map((headCell, i) => {
                  const header = checkedCellValue(headCell);
                  return header && <TableCell key={headCell}>{header == 'VC Type' ? 'Event Type' : header}</TableCell>;
                })}
              </TableRow>
            </TableHead>

            <TableBody>
              {tableData.map((item, i) => (
                <TableRow key={'' + i}>

                  {headCells.map((header) => {
                    const displayHeader = checkedCellValue(header);
                    return (
                      displayHeader && (
                        <TableCell key={header}
                          sx={(header == 'VC Type') ? { fontStyle: "italic", color: 'violet' } : {}}
                        >
                          {header !== 'Event Details' && item[displayHeader as string] }
                          {header == 'Event Details' && <Details value={item[displayHeader]}/> }
                        </TableCell>
                      )
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer></>
    )
    
   }

  return (
    <Modal
      open={open}
      onClose={handleCloseModal}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '80%',
          bgcolor: 'background.paper',
          border: '2px solid grey',
          boxShadow: 24,
          borderRadius: '50px',
          p: 4,
          overflowY: "scroll",
        }}
      >
        
        <Typography aria-labelledby="modal-title" variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        
        <ListBatchEvents events={batchObject.pendingRequiredEvents} subtitle='Pending Required Events'/>
        <ListBatchEvents events={batchObject.completedEvents} subtitle='Completed Events'/>
      
        <Button
          variant="outlined"
          onClick={handleCloseModal}
          sx={{ mt: 2, position: 'relative', float: 'inline-end', width: '100px' }}
        >
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default BatchModal;
