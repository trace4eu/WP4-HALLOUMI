import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorModal from '../components/ErrorModal';
import AdminApiService from '../api/AdminApiService';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Select from 'react-select';
import axios, { AxiosError } from 'axios';

interface IIssueVC {
  pin: string;
}

interface IProductOption {
  value:string;
  label:string;
}

interface IEventOption {
  value:string;
  label:string;
}

const IssueVC = () => {
  const [success, setSuccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string[]>([]);
  const [actorDID, setactorDID] = useState<string>('');
  const [legalName, setlegalName] = useState<string>('');
 // const [productName, setProductName] = useState<string>('');
 // const [allowedEvent, setAllowedEvent] = useState<string>('');
  const [openConfirmModal, setOpenConfirmModal] = useState<boolean>(false);
  const [pin, setPin] = useState<string>('');
  const [productName, setProductName] = useState<IProductOption|null>();
  const [products,setProducts] = useState<Array<IProductOption>>([])
  const [allowedEvent, setAllowedEvent] = useState<IEventOption|null>();
  const [allowedEvents,setAllowedEvents] = useState<Array<IEventOption>>([])

  const customStyles = {
    control: (baseStyles: any, state: { isFocused: any; }) => ({
      ...baseStyles,
      borderColor: state.isFocused ? 'grey' : 'blue',
      marginTop: '20px',
      backgroundColor:null,
      
    }),

    placeholder: (styles: any) => ({
      ...styles,
      //...dot(),
      //fontSize: 19,
     // fontFamily: 'SF-regular',
      color: 'orange',
      }),
  
      input: (styles: any) => ({
        ...styles,
        //...dot(),
        //fontSize: 19,
       // fontFamily: 'SF-regular',
        color: 'orange',
        }),
        
        singleValue: (styles: any, { data }: any) => ({ ...styles, color: 'orange' }),
    
    option: (base: any, { data, isDisabled, isFocused, isSelected }: any) => {
     
    return {
      ...base,
      backgroundColor: isFocused ? "blue" : "black",
      
      
    };
  }
};

  const getListOfProducts = async () => {

    const products = await AdminApiService.getProducts() as string[];
    const newproducts = products.map(product=> {return {value:product,label:product}})
    setProducts(newproducts)
  };

  const getAllowedEvents = async () => {

    const parms = {
      productName: productName? productName.value : 'na'
    }

    const allowedEvents = await AdminApiService.getAllowedEvents(parms) as {requiredEvents:string[]};
    if (allowedEvents.requiredEvents) {
     const newpallowedEvents = allowedEvents.requiredEvents.map(event=> {return {value:event,label:event}})
     setAllowedEvents(newpallowedEvents)
    }
  };

  const onProductSelect =(value: IProductOption | null) => {
    setProductName(value);
    console.log('seelcted product:'+JSON.stringify(value));
    //getAllowedEvents();
  }
 
  const onEventSelect =(value: IEventOption | null) => {
    setAllowedEvent(value);
  }
 

  const issuevc = async () => {
    try {
      setLoading(true);
      setError([]);
      setPin('');

      if (!actorDID) {
        setError(['actor DID is required.']);
        setSuccess(false);
        return;
      }

      if (!legalName) {
        setError(['actor legal Name is required.']);
        setSuccess(false);
        return;
      }

      if (!productName?.value) {
        setError(['product is required.']);
        setSuccess(false);
        return;
      }

      if (!allowedEvent?.value) {
        setError(['allowed event is required.']);
        setSuccess(false);
        return;
      }

      const parms = {
        productName: productName?.value,
        actorDID: actorDID,
        legalName: legalName,
        allowedEvent: allowedEvent?.value
      }

      console.log('parms:'+JSON.stringify(parms));

      const issuevcResp: IIssueVC = await AdminApiService.issueVC(parms);
      console.log('response on issuevc: ', issuevcResp);

      if (issuevcResp && issuevcResp.pin) {
        setSuccess(true);
        setactorDID('');
        setAllowedEvent(null);
        setProductName(null);
        setlegalName('');
        setPin(issuevcResp.pin);
        setOpenConfirmModal(true);
      } else {
        setError(['something went wrong']);
        setSuccess(false);
      }
    } catch (err: unknown) {
      console.log('err: ', err);
     // const error = err as Error|AxiosError;
     // setSuccess(true);
      setSuccess(false);
    if (typeof err === 'string') {
        setError([err]);
      } else if (!(err as Error).message) {
        setError(['An error occurred']);
      } else {
        setError([(err as Error).message]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Proceed button click call GET remove accredit endpoint
  const handleProceed = () => {
    issuevc();
   // setOpenConfirmModal(false);
  };

  // Open confirmation modal
  const handleOpenModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (!actorDID) {
      setError(['actor DID is required.']);
      setSuccess(false);
      return;
    }
    setOpenConfirmModal(true);
  };

  const handleCloseModal = () => {
    setOpenConfirmModal(false);
  };

  const closeErrorModal = () => {
    setError([]);
    setSuccess(null);
  };

 useEffect(() => {

    getListOfProducts();
   

  }, []);

  useEffect(() => {
    setAllowedEvents([]);
    setAllowedEvent(null);
    getAllowedEvents();
   

  }, [productName]);

  // useEffect(() => {

   

  // }, [allowedEvents]);

  if (loading) {
    return (
      <Box
        sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CircularProgress size="8vw" />
      </Box>
    );
  }

  // if (success === true) {
  //   return (
  //     <Stack display={'flex'} flexDirection="column" alignItems="center" pt={4}>
  //       <Typography color={'green'} variant="h6" gutterBottom textAlign={'center'}>
  //         Pre-Auth VC for {legalName} has been issued successfully
  //       </Typography>
  //     </Stack>
  //   );
  // }

  return (
    // !success && (
      <Stack display={'flex'} flexDirection="column" alignItems="center" pt={3}>
        {success === false && <ErrorModal error={error} setError={closeErrorModal} />}

        <Typography variant="h4" textAlign={'center'} pb={2}>
          Issue Pre-Auth VC
        </Typography>

        <Paper elevation={3} sx={{ mt: 2, p: 4, width: 'fit-content' }}>
          <Typography variant="body1" pb={1}>
            Fill in the details below to issue a License to Operate VC for the specified Actor DID.
          </Typography>
          <Typography variant="body1" pb={1}>
           A pin code will be returned which must be sent to the Actor to be able to download this VC
          </Typography>
        
         

          <Stack maxWidth={'500px'}>
            <TextField
              label="Actor DID"
              type="text"
              variant="outlined"
              fullWidth
              margin="normal"
              value={actorDID}
              onChange={(e) => setactorDID(e.target.value)}
            />
            <TextField
              label="Actor Legal Name"
              type="text"
              variant="outlined"
              fullWidth
              margin="normal"
              value={legalName}
              onChange={(e) => setlegalName(e.target.value)}
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
             // defaultValue={productName} 
              styles={customStyles}
              isOptionSelected={(option) => productName === option ? true : false}
              value={products.filter(function(option) {
                return option === productName;
              })}
        
        
              >
              </Select>
              <Select 
              placeholder= "select an allowed event"
              name="select an allowed event"
              options={allowedEvents}
             getOptionLabel={(option) => `${option.label}`}
            //  getOptionLabel={()=>`${productName}}`}
             // labelField="bankName"
           //   valueField='bankUrl'
              onChange={value=>onEventSelect(value)} 
             // defaultValue={{value:"HALLOUMI",label:"HALLOUMI"}} 
             // defaultValue={productName} 
              styles={customStyles}
              isOptionSelected={(option) => allowedEvent === option ? true : false}
              value={allowedEvents.filter(function(option) {
                return option === allowedEvent;
              })}
        
              >
              </Select>
          </Stack>

          <Button
            variant="outlined"
            color="primary"
            style={{ marginTop: '20px' }}
            onClick={handleProceed}
          >
            Proceed
          </Button>
        </Paper>

        {/* Confirmation Modal */}
        <Dialog
          open={openConfirmModal}
          onClose={handleCloseModal}
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
          sx={{ ml: '200px' }}
        >
          <DialogTitle id="confirm-dialog-title">Pin for Pre-auth VC</DialogTitle>
          <DialogContent>
            <DialogContentText id="confirm-dialog-description">
              {pin}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="primary">
              Ok
            </Button>
           
          </DialogActions>
        </Dialog> 
      </Stack>
    
  );
};

export default IssueVC;
