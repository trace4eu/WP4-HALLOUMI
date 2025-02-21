import React, { useEffect, useState } from 'react';


import Box from '@mui/material/Box';
import Button from '@mui/material/Button';


import ErrorAlert from '../components/ErrorAlert';
import AdminApiService, { getVCsParamsType, metadaOrderType } from '../api/AdminApiService';

import Container from '@mui/material/Container';
import { CircularProgress, List, ListItem, ListItemText, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { serverErrorResponse } from '../api/ApiClient';

import Select from 'react-select'
import InfoAlert from '../components/InfoAlert';
window.Buffer = window.Buffer || require('buffer').Buffer;



interface IProductOption {
  value:string;
  label:string;
}

interface RequiredDetails {
  type:string;
  details: string[];
}

interface IProduct {
  requiredEvents:string[];
  lastInChainEvent:string;
  eventsDetails:RequiredDetails[];
}

let updatedProduct:IProduct ;

const EventDetails = ({
 

}) => {
  const [loading, setLoading] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string>('Success!');
  const [productName, setProductName] = useState<IProductOption|null>();
  const [productObject, setProductObject] = useState<IProduct>()
  const [products,setProducts] = useState<Array<IProductOption>>([])
 
  const [error, setError] = useState<string>('');


  const navigate = useNavigate();
  console.log('init');
  

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


  const getListOfProducts = async () => {

    const products = await AdminApiService.getProducts() as string[];
    const newproducts = products.map(product=> {return {value:product,label:product}})
    setProducts(newproducts)
  };

  const onProductSelect =(value: IProductOption | null) => {
    setProductName(value);
  }
 


 const ListEventDetails = (props: {
  eventDetails:RequiredDetails[]; 
  requiredEventType:string, 
  lastInchain:string
  onChangeParent: (type:string, newvalue:string)=>void
  }): JSX.Element => {

  const {eventDetails, requiredEventType, lastInchain, onChangeParent} = props;

  let details: string = '';
  eventDetails.map(event => {
    if (event.type == requiredEventType) {
      event.details.map(detail=> details = details=='' ? detail : details+', '+detail);
      return;
    }
  })
    
  console.log('requiredEventType:'+requiredEventType)
  console.log('details:'+details)

  const onChangDetails = (value: string) => {
    onChangeParent(requiredEventType,value)
  }

  return (
    <Box>
      <ListItemText 
        primaryTypographyProps={{ fontStyle: 'italic', fontWeight: 'bold', color:'orange' }}
        secondaryTypographyProps={{  fontWeight: 'bold', color:'green' }}
      primary={`${requiredEventType}`} 
      secondary = {(requiredEventType == lastInchain) && 'Last in Chain'}  />
  
     <TextField sx={{marginLeft: '30px'}}
      // slotProps={{ htmlInput: { style: { resize: 'both' } } }}
         id="outlined-multiline-static"
         // label="Multiline"
          multiline
         // rows={4}
         onChange = {(e)=>onChangDetails(e.target.value)}
          defaultValue={details}
        />
  
  </Box>
  )
  
 }


 

  const onRefresh = async () : Promise<void> => {

    try {
    setLoading(true);
    const product = await AdminApiService.getProduct({productName: productName?.label ? productName.label : 'HALLOUMI'}) as IProduct;
    setProductObject(product);

    updatedProduct= {
      requiredEvents:[...product.requiredEvents],
      lastInChainEvent:product.lastInChainEvent,
      eventsDetails:[...product.eventsDetails]
    }
    console.log('updatedProduct:'+JSON.stringify(updatedProduct))
    
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

  const onUpdate = async () => {

     const updateProductReq = {
      productName: productName?.value,
      eventsDetails: updatedProduct.eventsDetails
     }

     try {
     setLoading(true)
     const response = await AdminApiService.updateProduct(updateProductReq)

     if (response.success) {
      setAlertSuccess(true);
      setAlertMessage('product updated');
      onRefresh()
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

  const getProduct = async () => {
    try {
       await onRefresh();
    //  console.log('serverResponse on load:', serverResponse);

      // if (serverResponse === serverErrorResponse.TOKEN_REQUIRED) {
      //   navigate('/login');
      // } else if (typeof  serverResponse == 'object') {
      //   setProductObject(serverResponse);
      // }
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
  };

  useEffect(() => {
    
  
    getListOfProducts();
  //  getProduct();

  
  }, []);





  const onErrorAlertClose = () => {
    setError('');
   // navigate('admin');
  };

  
  const onInfoAlertClose = () => {
    setAlertSuccess(false);
    //navigate('/issued-vc');
  };

  const onChangeDetails = (type:string, newvalue:string) => {

    console.log('updatedProduct1:'+JSON.stringify(updatedProduct))
    let found=false;
    console.log('type:'+type, 'newvalue:'+newvalue)
    updatedProduct.eventsDetails.map((event,index) => {
      if (event.type==type) {
        const newDetails = newvalue.trim().replace(/\s+/g,'').split(',')
        updatedProduct.eventsDetails[index].details = [...newDetails]
        found=true;
        return
      }
    })

    if (!found) {
      const newEntry = {
        type,
        details: newvalue.trim().replace(/\s+/g,'').split(',')
      }
      updatedProduct.eventsDetails.push(newEntry);
    }

    console.log('updatedProduct2:'+JSON.stringify(updatedProduct))

  }


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
        {"EVENT DETAILS DEFINITIONS"}
      </Typography>
      <ErrorAlert message={error} isErrorWindow={error.length > 0} onClose={onErrorAlertClose} />
      <InfoAlert message={alertMessage} open={alertSuccess} handleClose={onInfoAlertClose} />
      
    
      <Box>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={onRefresh}
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

          </Box>

          <Typography sx={{marginTop: '20px'}}>
             Add or modify the event details for each required event
                    
          </Typography>

          <List sx={{ width: '100%', maxWidth: 460, bgcolor: 'background.paper',overflow: 'auto', marginTop:'20px' }}>
              {productObject?.requiredEvents.map((event, index) => (
                <ListItem 
                  key={index}
                
                  disablePadding
                  >
                 
                 <ListEventDetails 
                   eventDetails={productObject.eventsDetails}
                   requiredEventType = {event}
                   lastInchain = {productObject.lastInChainEvent}
                   onChangeParent={onChangeDetails}
                 />
                    
                    
                  
                </ListItem>
              ))}
            </List>
         

            <Button
            variant="contained"
            color="primary"
            onClick={onUpdate}
            disabled={updatedProduct == undefined}
            style={updatedProduct ? { width: '150px',textTransform: 'none', marginTop: '20px'} : {display: 'none'}}
          >
            {' '}
            Update Product{' '}
          </Button>

      </Box>
      
    </Container>
  );
};

export default EventDetails;


