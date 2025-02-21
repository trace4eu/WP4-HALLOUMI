import React, { useEffect, useState } from 'react';


import Box from '@mui/material/Box';
import Button from '@mui/material/Button';


import ErrorAlert from '../components/ErrorAlert';
import AdminApiService, { getVCsParamsType, metadaOrderType } from '../api/AdminApiService';

import Container from '@mui/material/Container';
import { CircularProgress, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { serverErrorResponse } from '../api/ApiClient';

import Select from 'react-select'
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



const Products = ({
 

}) => {
  const [loading, setLoading] = useState(false);

  const [productName, setProductName] = useState<IProductOption|null>(null);
  const [productObject, setProductObject] = useState<IProduct>()
  const [products,setProducts] = useState<Array<IProductOption>>([])
 
  const [error, setError] = useState<string>('');


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


  const getListOfProducts = async () => {

    const products = await AdminApiService.getProducts() as string[];
    const newproducts = products.map(product=> {return {value:product,label:product}})
    setProducts(newproducts)
  };

  const onProductSelect =(value: IProductOption | null) => {
    setProductName(value);
  }
 


 const ListEventDetails = (props: {eventDetails:RequiredDetails[]; requiredEventType:string, lastInchain:string}): JSX.Element => {

  const {eventDetails, requiredEventType, lastInchain} = props;

  let details: string[] = [];
  eventDetails.map(event => {
    if (event.type == requiredEventType) details = [...event.details]})
    
  console.log('requiredEventType:'+requiredEventType)
  console.log('details:'+details)

  return (
    <Box>
      <ListItemText 
        primaryTypographyProps={{ fontStyle: 'italic', fontWeight: 'bold', color:'orange' }}
        secondaryTypographyProps={{  fontWeight: 'bold', color:'green' }}
      primary={`${requiredEventType}`} 
      secondary = {(requiredEventType == lastInchain) && 'Last in Chain'}  />

      <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', marginLeft: '30px' }}>
      {details.map((requiredDetail, index) => (
        <ListItem 
          key={index}
        
          disablePadding
          >
         
         <ListItemText primaryTypographyProps={{ fontStyle: 'italic', }}
         primary={`${requiredDetail}`} 
        />
            
            
          
        </ListItem>
      ))}
    </List>
  </Box>
  )
  
 }




  const onRefresh = async () : Promise<void> => {

    try {
    setLoading(true);
    const product = await AdminApiService.getProduct({productName: productName?.label ? productName.label : 'HALLOUMI'}) as IProduct;
    setProductObject(product);
    
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
        {"PRODUCT DEFINITIONS"}
      </Typography>
      <ErrorAlert message={error} isErrorWindow={error.length > 0} onClose={onErrorAlertClose} />
      
    
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
             Required Events and their associated required event details.
                    
          </Typography>

          <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper',overflow: 'auto', marginTop:'20px' }}>
              {productObject?.requiredEvents.map((event, index) => (
                <ListItem 
                  key={index}
                
                  disablePadding
                  >
                 
                 <ListEventDetails 
                   eventDetails={productObject.eventsDetails}
                   requiredEventType = {event}
                   lastInchain = {productObject.lastInChainEvent}
                 />
                    
                    
                  
                </ListItem>
              ))}
            </List>
         



      </Box>
      
    </Container>
  );
};

export default Products;
