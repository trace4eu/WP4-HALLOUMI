import React, {useEffect, useState} from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';


import {Button, Checkbox, CircularProgress, IconButton, ListItemButton, ListItemIcon, TextField} from '@mui/material';
import ErrorAlert from '../components/ErrorAlert';
import InfoAlert from '../components/InfoAlert';
import { DeleteForever } from '@mui/icons-material';
import AdminApiService from '../api/AdminApiService';

interface IRequiredEvent {
  requiredEvent: string;
  lastInChain: boolean
}


const NewProduct = () => {
  const [events, setEvents] = useState<Array<string> | null>(null);
  const [error, setError] = useState<string >("");
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string>('Success!');
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState<string>('');
  const [requiredEvent, setRequiredEvent] = useState<string>('');
  const [requiredEvents, setRequiredEvents] = useState<string[]>([]);
  const [inputError, setInputError] = useState<string | null>(null);
  const [checked, setChecked] = React.useState(-1);
  const [products,setProducts] = useState<Array<string>>([])


    const getListOfProducts = async () => {
  
      const products = await AdminApiService.getProducts() as string[];
    //  const newproducts = products.map(product=> {return {value:product,label:product}})
      setProducts(products)
    };

  const handleToggle = (value: number) => () => {
    console.log('toggle value:'+value);

    if (checked == value) {
      setChecked(-1)
    } else
       setChecked(value);
  };


  const handleDelete = (value: number) => () => {
    console.log('delete value:'+value);

    if (checked == value) {
      setChecked(-1)
    } 

    const newrequiredEvents = [...requiredEvents];

    if (value > -1) { // only splice array when item is found
      newrequiredEvents.splice(value, 1); // 2nd parameter means remove one item only
    }
    setRequiredEvents(newrequiredEvents)
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


  const onHandleClick = (index:number) =>
  {

  }


  const handleAddEvent = async () => {
    
    if (requiredEvent.length < 5) {
      setInputError('product name must be at least 5 characters.');
      return;
    }

    const newrequiredEvents = [...requiredEvents];
    if (newrequiredEvents.some(reqEvent=> reqEvent == requiredEvent))
      return;
    newrequiredEvents.push(requiredEvent)
    console.log('newrequiredEvents:'+JSON.stringify(newrequiredEvents))
    setRequiredEvents(newrequiredEvents)
  }

  const handleAddProduct = async () => {
    
    if (productName.length <5) {
      setError('product Name must be at least 5 chars')
      return;
    }

   if (products.includes(productName)) {
    setError('product Name already exists')
    return;
   }

    if (checked == -1) {
      setError('please select a last in chain event')
      return;
    }

    try {
      setLoading(true);
      const parms = {
        productName,
        requiredEvents,
        lastInChainEvent: requiredEvents[checked]
      }

      console.log('parms:'+JSON.stringify(parms));
      const response = await AdminApiService.addProduct(parms);
      if (response.success) {
        setAlertSuccess(true);
        setAlertMessage('product added');
        setProductName('')
        setRequiredEvents([])
      } else {
        setError(response.errors ? response.errors[0] : 'something went wrong')
      }

    } catch (error) {
 
      let errorMessage = 'Error submitting batch';
      if (error instanceof Error) {
              errorMessage = error.message;
      }
      setError(errorMessage);

    } finally {
      setLoading(false)
    }
  }
  // const getRequiredEvents = async () => {
  //   try {
  //     setLoading(true);
  //     const reqEventsResp: ReqEventsRespType = await apiService.getRequiredEvents(
  //       license!.vcDetails.productName
  //     );
  //     // Filter requiredEvents to exclude the lastInChainEvent
  //     const filteredRequiredEvents: string[] = reqEventsResp.requiredEvents.filter(
  //       (event: string) => event !== reqEventsResp.lastInChainEvent
  //     );

  //     if (filteredRequiredEvents && filteredRequiredEvents.length > 0) {
  //       setEvents(filteredRequiredEvents);
  //     } else {
  //       throw new Error('request events error');
  //     }
  //   } catch (error: unknown) {
  //     console.error('request events error', error);
  //     let errorMessage = 'Error submitting batch';
  //     if (typeof error === 'string') {
  //       errorMessage = error;
  //     }
  //     if (error instanceof Error) {
  //       errorMessage = error.message;
  //     }
  //     setError(errorMessage);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  

 
  // useEffect(() => {
  
  // }, [requiredEvents]);

  useEffect(() => {
    getListOfProducts()
  }, []);

  const toCloseAlert = () => {
    setError('');
  };

  if (loading) {
    return (
      <Box sx={{height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <CircularProgress size="8vw" />
      </Box>
    );
  }

  return (
    <Container sx={{position: 'relative'}}>
       <ErrorAlert message={error} isErrorWindow={error.length > 0} onClose={onErrorAlertClose} />
       <InfoAlert message={alertMessage} open={alertSuccess} handleClose={onInfoAlertClose} />
 

      <Box sx={{px: 6}}>
        <Typography
          sx={{textAlign: 'center'}}
          variant="h5"
          pb={2}
        >
          NEW PRODUCT
        </Typography>
        <Typography
          sx={{textAlign: 'center'}}
       
        >
          define a new PDO product for supply chain traceability 
        </Typography>

        
          <Box sx={{marginTop: '20px',display:'flex',flexDirection:'column',alignItems: 'flex-start',}}>
         
              <Typography sx={{marginBottom: '15px'}}>
                Type the new product name and add the events required to complete a batch for this product.
              
              </Typography>
              {/* <BatchComponent
                productName={license!.vcDetails.productName}
                walletModel={walletModel}
                jwtvc={license!.jwt}
              /> */}
            
              <TextField
                label="Product Name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                error={!!inputError}
                helperText={inputError}
                margin="normal"
              />
               <Box sx={{marginTop: '20px',display:'flex',flexDirection:'row',alignItems: 'flex-start',}}>
                 
                  <TextField
                    label="Required Event"
                    value={requiredEvent}
                    onChange={(e) => setRequiredEvent(e.target.value)}
                    // error={!!inputError}
                    // helperText={inputError}
                    //margin="normal"
                  />
                    <Button
                    variant="contained"
                    onClick={handleAddEvent}
                    disabled={requiredEvent.length < 5}
                    sx={{ marginLeft: "25px"}}
                    
                  >
                    add event
                  </Button>
              </Box>

              <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
              {requiredEvents.map((event, index) => (
                <ListItem 
                  key={index}
                  secondaryAction={
                    <IconButton onClick={handleDelete(index)} edge="end" aria-label="comments">
                      <DeleteForever />
                    </IconButton>
                  }
                  disablePadding
                  >
                   <ListItemButton onClick={handleToggle(index)} dense>
                      <ListItemText primaryTypographyProps={{ fontStyle: 'italic', fontWeight: 'bold' }}
                        primary={`${event}`} secondary = 'Last In Chain:' />
                      <ListItemIcon sx={{alignSelf:'flex-end'}}>
                      <Checkbox 
                        edge="start"
                        checked={checked == index}
                        tabIndex={-1}
                        disableRipple
                       // inputProps={{ 'aria-labelledby': labelId }}
                      />
                       </ListItemIcon>
                   </ListItemButton>
                </ListItem>
              ))}
            </List>

          </Box>

      <Button
            variant="contained"
            onClick={handleAddProduct}
            disabled={requiredEvents.length ==0}
            sx={{ marginTop: "30px"}}
            style={(requiredEvents.length >0) ? {display:'inline'} : {display:'none'}}
            
          >
            add Product
      </Button>  
      </Box>
    </Container>
  );
};

export default NewProduct;
