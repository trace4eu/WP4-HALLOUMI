import React, { useEffect, useState } from 'react';


import Box from '@mui/material/Box';
import Button from '@mui/material/Button';


import ErrorAlert from '../components/ErrorAlert';
import AdminApiService, { getVCsParamsType, metadaOrderType } from '../api/AdminApiService';

import Container from '@mui/material/Container';
import { CircularProgress, FormControl, FormControlLabel, List, ListItem, ListItemText, Paper, Radio, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { serverErrorResponse } from '../api/ApiClient';

import Select from 'react-select'
import { transformDataArray } from '../helpers/transformStringAndData';
import { checkedCellValue } from '../helpers/checkedCellValue';
import BatchModal from '../components/BatchModal'

interface IProductOption {
  value:string;
  label:string;
}


interface PropsEvents {
    status: string;
  }

const GetBatches = ({ status }: PropsEvents) => {
 
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState<IProductOption|null>(null);
  const [products,setProducts] = useState<Array<IProductOption>>([])
  const [error, setError] = useState<string>('');
  const [headCells, setHeadCells] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);
  const [batches, setBatches] = useState<{documentId:string}[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<object>()
  const [modalTitle, setModalTitle] = useState('');
  const [isShowDetails, setIsShowDetails] = useState<boolean>(false);

  const navigate = useNavigate();

  const customStyles = {
    control: (baseStyles: any, state: { isFocused: any; }) => ({
      ...baseStyles,
      borderColor: state.isFocused ? null : null,
      backgroundColor:null,
    }),

    singleValue: (styles: any) => ({
      ...styles,
      //...dot(),
      //fontSize: 19,
     // fontFamily: 'SF-regular',
      color: 'white',
      }),
  
    option: (base: any, { data, isDisabled, isFocused, isSelected }: any) => {
    return {
      ...base,
      backgroundColor: isFocused ? "blue" : "black",
      
    };
  }
};

  const HEADER = `${status.toUpperCase()} Batches`;

  const getListOfProducts = async () => {

    const products = await AdminApiService.getProducts() as string[];
    const newproducts = products.map(product=> {return {value:product,label:product}})
    setProducts(newproducts)
  };

  const onProductSelect =(value: IProductOption | null) => {
    setProductName(value);
  }

  const onDetails = () => {
    if (status == 'Pending')
      setModalTitle('Pending Batch Details')
    else 
      setModalTitle('Completed Batch Details')
    setIsShowDetails(true);
  };

  const onShowDetailsClose = () => {
    setIsShowDetails(false);
  };
  
    const onRefresh = async () : Promise<void> => {
  
      try {
       setLoading(true);
       const batches = await AdminApiService.getBatches(
        {
          productName: productName?.label ? productName.label : 'HALLOUMI',
          status
        })

       setBatches(batches)
       if ( typeof batches !== 'string')  manageTable(batches, false);
      // setProductObject(product);
      
      } catch (e) {
        const error = e as Error;
        if (error.message === serverErrorResponse.TOKEN_REQUIRED) {
          navigate('/login');
        } else {
          console.error('Error on fetching product:' + error);
          setError('Something went wrong.');
        }
      } finally {
        setLoading(false);
      }
  
    } 
  
      const handleItemChange = (event: React.SyntheticEvent, checked:boolean) => {
        event?.preventDefault();
        console.log('event:'+event.target);
        const radioEvent = event as React.ChangeEvent<HTMLInputElement>;
        console.log('selectedItemId: ', radioEvent.target.value);
        setSelectedItemId(radioEvent.target.value);
        // const selected= selectedRecordById(radioEvent.target.value);
        // setSelectedEventType(selected.eventType);
        // setSelectedStatus(selected.status)
       // console.log('selected batch:'+ (selectedItemId!=null) ? JSON.stringify((selectedItemId!=null) ?tableData[selectedItemId] :{}) :null )
        
       const selectedBatch = batches.filter(batch=> batch.documentId == radioEvent.target.value)[0]
       console.log('selectedbatch:'+JSON.stringify(selectedBatch));
       setSelectedBatch(selectedBatch)
      };
    
      const manageTable = (
        batches: Record<string, unknown>[] ,
        ignore: boolean
      ) => {
       
       
    
        if (!ignore) {
          const transformedData = transformDataArray(batches);
          console.log('transformedData: ', transformedData);
          //  keys to exclude from headers of table
          const excludeKeys = ['documentId', 'eventId', '_id', 'randomEncKey'];
    
          //Get unique keys excluding specified keys
          const headers = Array.from(
            new Set(
              transformedData.flatMap((item) =>
                Object.keys(item).filter((key) => !excludeKeys.includes(key))
              )
            )
          );
          //const headers = Object.keys(transformedData[0] || {});
          setHeadCells(headers);
          setTableData(transformedData);
          //setEvents(events);
        }
        
        console.log('table get data and data is: ', batches);
      };
    

  useEffect(() => {
    
  
    getListOfProducts();
   // getProduct();

  
  }, []);





  const onErrorAlertClose = () => {
    setError('');
   // navigate('admin');
  };

  console.log('loading', loading);


  if (loading) {
    return (
      <Box
        sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CircularProgress size="8vw" />
      </Box>
    );
  }

  return (
    
    <Container>
      
      <Typography variant={'h5'} paddingBottom={3} paddingLeft={3}>
        {HEADER}
      </Typography>
      <ErrorAlert message={error} isErrorWindow={error.length > 0} onClose={onErrorAlertClose} />
      
    
      <Box>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={onRefresh}
              disabled={productName === null}
              style={{ width: '150px', marginRight: '16px' }}
            >
              {' '}
              REFRESH{' '}
            </Button>

   
            <Select 
              placeholder= "select a product"
              name="select a product"
              options={products}
             getOptionLabel={(option) => `${option.label}`}
            //  getOptionLabel={()=>`${productName}}`}
             // labelField="bankName"
           //   valueField='bankUrl'
              onChange={value=>onProductSelect(value)} 
             // defaultValue={{value:"HALLOUMI",label:"HALLOUMI"}} 
              defaultValue={productName} 
              styles={customStyles}
          
              >
            </Select>

          </Box>

          <Typography sx={{marginTop: '20px'}}>
             List of {status} batches.
                    
          </Typography>
          </Box>

        <Box style={{ display: 'flex', flexDirection:'column', alignItems: 'start', justifyContent: 'space-between' }}>
         {selectedBatch && 
          <BatchModal onClose={onShowDetailsClose} jsonObject={selectedBatch} open={isShowDetails} title={modalTitle} />}

         <FormControl component="fieldset" style={{ marginTop: '16px' }}></FormControl>

         <TableContainer component={Paper} style={{ margin: '5vh 0' }}>
           <Table>
             <TableHead>
               <TableRow>
                 <TableCell sx={{ border: 'none' }}></TableCell>
                 {headCells.map((headCell, i) => {
                   const header = checkedCellValue(headCell);
                   return header && <TableCell key={headCell + i}>{header}</TableCell>;
                 })}
               </TableRow>
             </TableHead>

             <TableBody>
               {tableData.map((item, i) => (
                 <TableRow key={'' + i}>
                   <TableCell>
                     <FormControlLabel
                       // style={{ paddingTop: '5px' }} padding-left: 20px
                       style={{ paddingLeft: '20px' }}
                       value={item.documentId}
                       control={
                         <Radio
                           checked={
                             selectedItemId === item.documentId
                         
                           }
                         />
                       }
                       label={''}
                       onChange={handleItemChange}
                     />
                   </TableCell>
                   {headCells.map((header) => {
                     const displayHeader = checkedCellValue(header);
                     return (
                       displayHeader && (
                         <TableCell key={header}
                                    sx={ (header=='Allowed Event') ? {fontStyle: "italic" , color: 'violet'} : {}}
                          >
                           {item[displayHeader as string]}
                         </TableCell>
                       )
                     );
                   })}
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </TableContainer>
         {tableData.length === 0 && (
             <Typography py={3}>There are no batches</Typography>
          )}
         <Button
            variant="contained"
            color="primary"
            onClick={onDetails}
            disabled={selectedItemId === null}
            style={{ width: '150px',textTransform: 'none' }}
          >
            {' '}
            Details{' '}
          </Button>

        
       </Box>
      
      </Container>
    );
};

export default GetBatches;