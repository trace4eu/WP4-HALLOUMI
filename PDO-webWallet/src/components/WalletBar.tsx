import React, {useEffect, useState} from 'react';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import './govcy.uds.min.css';

import {CredentialStoredType, issuanceCertificateCardDetails} from '../types/typeCredential';
import {walletModel} from '../index';
import {useAppDispatch, useAppSelector} from '../features/hooks';
import {selectedCredential, selectCredentials} from '../features/credentialSlice';

import {useNavigate} from 'react-router-dom';

interface IWalletBarProps {
  open?: boolean;
  handleDrawerOpen?: () => void;
}

const LICENSE_TO_OPERATE = 'LicenseToOperate';
export const NO_LICENSE = 'No License found. Please request one using the Req License option';

const WalletBar = ({open, handleDrawerOpen}: IWalletBarProps) => {
  const actorInitialState = <Typography paddingTop={'10px'}>{NO_LICENSE}</Typography>;
  const [actorName, setActorName] = useState<JSX.Element[] | JSX.Element>(actorInitialState);
  const storedCredentials = (walletModel.getStoredCredentials() as CredentialStoredType[]) || [];
  const appStoredCredentials = useAppSelector(selectCredentials) || [];

  // State to handle menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dispatch = useAppDispatch();

  const handleSelectCredential = (jwt: string) => {
    dispatch(selectedCredential(jwt));
  };
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const onSelectLicense = (vc: CredentialStoredType) => {
    setActorName(createActorName(vc)); // Update actor name with selected VC details
    handleSelectCredential(vc.jwt);
    handleMenuClose();
  };

  const getProductDetails = (details: issuanceCertificateCardDetails) => {
    const allowedEvent = details.allowedEvent;
    const productDetails = (
      <Typography variant="body1" component="span">
        <span style={{color: '#ffad2d'}}>{details.productName}</span>&nbsp;and{' '}
        <span style={{color: '#ffad2d'}}>{allowedEvent}</span>&nbsp;supply chain operation
      </Typography>
    );
    return productDetails;
  };

  const createActorName = (vc: CredentialStoredType) => {
    const details = vc.vcDetails as issuanceCertificateCardDetails;
    const productDetails = getProductDetails(details);
    return (
      <>
        <Typography key="legalName">
          <span style={{color: '#ffad2d', fontWeight: 'bold'}}>{details.legalName}</span>
          {' Licensed For:'}
        </Typography>
        {productDetails}
      </>
    );
  };

  const updateActorName = () => {
    const vcArray =
      storedCredentials &&
      storedCredentials.filter((vc) => vc.type === LICENSE_TO_OPERATE && vc.vcDetails);

    if (vcArray.length > 0) {
      const firstVC = vcArray[0];
      setActorName(createActorName(firstVC));
    } else {
      setActorName(actorInitialState);
    }
  };

  useEffect(() => {
    if (storedCredentials && storedCredentials.length > 0) updateActorName();
  }, []);

  useEffect(() => {
    if (appStoredCredentials && appStoredCredentials !== null) {
      if (storedCredentials && storedCredentials.length > 0) {
        updateActorName();
      } else {
        setActorName(actorInitialState);
      }
    }
  }, [appStoredCredentials]);

  return (
    <MuiAppBar
      sx={{
        margin: 0,
        backgroundColor: '#ebf1f3',
        position: 'relative',
        minHeight: '66px',
        height: '68px',
      }}
      className="govcy-header-menu-area"
    >
      <Toolbar sx={{position: 'relative'}}>
        <Stack
          direction="row"
          spacing={2}
          className="govcy-menu-items"
          sx={{
            position: 'absolute',
            left: '240px',
            top: 0,
          }}
        >
          <Box
            sx={{
              borderLeft: '1px solid #bbbcbf',
              paddingLeft: '1rem',
              height: '65px',
            }}
          >
            <Box
              className="actor-name-wrapper"
              sx={{
                fontWeight: 'normal',
                color: '#474545',
                padding: '1.0625rem 0',
                paddingLeft: '16px',
                width: '40vw',
                minWidth: '600px',
                paddingTop: '5px',
              }}
            >
              {actorName}
              {storedCredentials && storedCredentials.length > 1 && (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleMenuOpen}
                    sx={{marginLeft: '8px', padding: '2px', marginBottom: '7px'}}
                  >
                    Select
                  </Button>
                  <Menu anchorEl={anchorEl} open={openMenu} onClose={handleMenuClose}>
                    {storedCredentials.map((vc) => (
                      <MenuItem key={vc.id} onClick={() => onSelectLicense(vc)}>
                        {getProductDetails(vc.vcDetails as issuanceCertificateCardDetails)}
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}
            </Box>
          </Box>
        </Stack>
      </Toolbar>
    </MuiAppBar>
  );
};

export default WalletBar;
