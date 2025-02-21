import React, { useEffect, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Input from '@mui/material/Input';
import Radio from '@mui/material/Radio';

import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

import Checkbox from '@mui/material/Checkbox';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { IPendingVCResponse } from '../screens/PendingVCs';
//import {IEvent, IEventResponse} from '../screens/GetBatches'
import { IIssuedVCResponse } from '../screens/IssuedVCs';
// import { ISubmittedVCResponse } from '../screens/SubmittedVCs';

import ErrorAlert from '../components/ErrorAlert';
import AdminApiService, { getVCsParamsType, metadaOrderType } from '../api/AdminApiService';

import Container from '@mui/material/Container';
import { CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { transformDataArray } from '../helpers/transformStringAndData';
import { checkedCellValue } from '../helpers/checkedCellValue';
import { serverErrorResponse } from '../api/ApiClient';
import EventModal from '../components/EventModal';
import VerifiedEventModal, { SubmittedDetails, VerifiedEventDetails } from '../components/VerifiedEventModal';
import { json } from 'stream/consumers';
import InfoAlert from './InfoAlert';
import Select from 'react-select'
window.Buffer = window.Buffer || require('buffer').Buffer;

interface DataTableProps {
  
  onRefreshData: (
    params?: getVCsParamsType
  ) =>
    | Promise<IIssuedVCResponse   >
    | Promise<typeof serverErrorResponse.TOKEN_REQUIRED>;
  navigateToVCDetails: (id: string) => void;

  header: string;
}

interface IProductOption {
  value:string;
  label:string;
}

const metadaOrder = {
  OLDEST: 'oldest',
  NEWEST: 'newest',
};

const DataTable: React.FC<DataTableProps> = ({
 
  onRefreshData,
  navigateToVCDetails,

  header,
}) => {
  const [loading, setLoading] = useState(false);
  const [firstTime, setFirstTime] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('HALLOUMI');
  const [searchValue, setSearchValue] = useState<string>('HALLOUMI');
  const [productName, setProductName] = useState<IProductOption|null>(null);
  const [products,setProducts] = useState<Array<IProductOption>>([])
  const [sortByNewest, setSortByNewest] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [tableData, setTableData] = useState<Record<string, string>[]>([]); //IPendingVC[] | IIssuedVC[]
 // const [events, setEvents] = useState<IEvent[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [totalCredentials, setTotalCredentials] = useState<number>(0);
  const [headCells, setHeadCells] = useState<string[]>([]);
  const [isShowDetails, setIsShowDetails] = useState<boolean>(false);
  const [event, setEvent] = useState<object|null>(null);
  const [personalData, setPersonalData] = useState<object|null>(null);
  const [isEventDetails, setIsEventDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
   const [alertSuccess, setAlertSuccess] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string>('Success!');
  //const [eventDetails, setEventDetails] = useState<SubmittedDetails | null>(null);

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
  const onShowDetailsClose = () => {
    setIsShowDetails(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEventDetails(false);
    //setEventDetails(null);
    
  };

  const getListOfProducts = async () => {

    const products = await AdminApiService.getProducts() as string[];
    const newproducts = products.map(product=> {return {value:product,label:product}})
    setProducts(newproducts)
  };

  const onProductSelect =(value: IProductOption | null) => {
    setProductName(value);
  }
 







  const manageTable = (
    serverResponse:  IIssuedVCResponse ,
    ignore: boolean
  ) => {
    const credentials = serverResponse.data;
    const events = serverResponse.data;
    const metadata = serverResponse.metadata;
    if (metadata && metadata.total) 
      setTotalCredentials(metadata.total);
    else {
      setTotalCredentials(0);
      setPage(0);
    }

    if (!ignore) {
      const transformedData = transformDataArray(credentials);
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
    console.log('Table metadata: ', metadata);
    console.log('table get data and data is: ', credentials);
  };

  useEffect(() => {
    let ignore = false;
    // const getData = async () => {
    //   try {
    //     const serverResponse = await onRefreshData();
    //     console.log('serverResponse on load:', serverResponse);

    //     if (serverResponse === serverErrorResponse.TOKEN_REQUIRED) {
    //       navigate('/login');
    //     } else {
    //       typeof serverResponse !== 'string' && manageTable(serverResponse, ignore);
    //     }
    //   } catch (e) {
    //     const error = e as Error;
    //     if (error.message === serverErrorResponse.TOKEN_REQUIRED) {
    //       navigate('/login');
    //     } else {
    //       console.error('Error on fetching table data:' + error);
    //       setError('Something went wrong.');
    //     }
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    getListOfProducts();
   // getData();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    const getData = async () => {
      const params: getVCsParamsType = {
        page: page + 1,
        limit: rowsPerPage,
        order: sortByNewest
          ? (metadaOrder.NEWEST as metadaOrderType)
          : (metadaOrder.OLDEST as metadaOrderType),
        productName: productName ? productName.value : "HALLOUMI"
      };

    

      try {
        setLoading(true);
        const serverResponse = await onRefreshData(params);
        console.log('serverResponse on refresh:', serverResponse);
        if (serverResponse === serverErrorResponse.TOKEN_REQUIRED) {
          navigate('/login');
        } else {
           typeof serverResponse !== 'string' && manageTable(serverResponse, ignore);
        }
      } catch (e) {
        console.error('Error on fetching table data:' + e);
        const error = e as Error;
        if (error.message === serverErrorResponse.TOKEN_REQUIRED) {
          navigate('/login');
        } else {
        setError('Something went wrong.');
        }
      } finally {
        setLoading(false);
      }
    };
    if (!firstTime)
    getData();

    return () => {
      ignore = true;
    };
  }, [sortByNewest,  page, rowsPerPage]);



  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    event?.preventDefault();
    setPage(newPage);
  };

  const handleItemChange = (event: React.SyntheticEvent, checked:boolean) => {
    event?.preventDefault();
    console.log('event:'+event.target);
    const radioEvent = event as React.ChangeEvent<HTMLInputElement>;
    console.log('selectedItemId: ', radioEvent.target.value);
    setSelectedItemId(radioEvent.target.value);
    // const selected= selectedRecordById(radioEvent.target.value);
    // setSelectedEventType(selected.eventType);
    // setSelectedStatus(selected.status)

  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    event?.preventDefault();
    console.log('RowsPerPage taget: ', parseInt(event.target.value, 10));
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const onRefresh = async () => {
    try {
      setFirstTime(false)
      setLoading(true);
      const params: getVCsParamsType = {
        page: page + 1,
        limit: rowsPerPage,
        order: sortByNewest
          ? (metadaOrder.NEWEST as metadaOrderType)
          : (metadaOrder.OLDEST as metadaOrderType),
        productName: productName ? productName.value : "HALLOUMI"
      };
      
      const serverResponse = await onRefreshData(params);
      if (serverResponse === serverErrorResponse.TOKEN_REQUIRED) {
        throw new Error(serverErrorResponse.TOKEN_REQUIRED);
      } else if (typeof serverResponse !== 'string') {
         manageTable(serverResponse, false);
        setPage(0);
      }
    } catch (e ) {
      console.log('error onREfresh:'+e);
      const error = e as Error;
      if (error.message === serverErrorResponse.TOKEN_REQUIRED) {
        navigate('/login');
      }
      console.error(e);
      typeof e === 'string' ? setError(e) : setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const onDetails = () => {
    // setLoading(true);
    // getEvent();
    navigateToVCDetails(selectedItemId as string);
  };



  const onErrorAlertClose = () => {
    setError('');
   // navigate('admin');
  };

  console.log('loading', loading);

  const onInfoAlertClose = () => {
    setAlertSuccess(false);
    //navigate('/issued-vc');
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

  return (
    
    <Container>
      
      <Typography variant={'h5'} paddingBottom={3} paddingLeft={3}>
        {header}
      </Typography>
      <ErrorAlert message={error} isErrorWindow={error.length > 0} onClose={onErrorAlertClose} />
      <InfoAlert message={alertMessage} open={alertSuccess} handleClose={onInfoAlertClose} />
    
        <Box>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={onRefresh}
              style={{ width: '150px', marginRight: '16px' }}
            >
              {' '}
              REFRESH{' '}
            </Button>

            <FormControlLabel
              control={
                <Checkbox
                  checked={sortByNewest}
                  onChange={(e) => {
                    e.preventDefault();
                    setSortByNewest(!sortByNewest);
                    setPage(0);
                  }}
                />
              }
              label="newest"
            />
        
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
              // theme={(theme) => ({
              //   ...theme,
              //   borderRadius: 0,
              //   colors: {
              //     ...theme.colors,
              //     primary25: 'hotpink',
              //     primary: 'black',
              //   },
              // })}
             //  isOptionSelected={(option) => productName === option ? true : false}
              // value={products.filter(function(option) {
              //   return option === productName;
              // })}
            //  values={[]}
              >
              </Select>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalCredentials} //{tableData.length | 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              style={{ marginTop: '16px' }}
            />
          </Box>

          <Box display={'flex'}>
         

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
                          value={item.issued_id}
                          control={
                            <Radio
                              checked={
                                selectedItemId === item.issued_id
                            
                              }
                            />
                          }
                          label={''}
                          onChange={(e,c)=>handleItemChange(e,c)}
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
    
          </Box>
          {!firstTime && tableData.length === 0 && (
            <Typography py={3}>There are no VCs</Typography>
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

export default DataTable;
