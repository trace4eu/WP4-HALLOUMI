import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LinkIcon from '@mui/icons-material/Link';

import LogoutIcon from '@mui/icons-material/Logout';
import DnsIcon from '@mui/icons-material/Dns';
import {  ExpandLess, ExpandMore} from '@mui/icons-material';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import CardMembership from '@mui/icons-material/CardMembership';
import PlaylistAddCheck from '@mui/icons-material/PlaylistAddCheck';
import PlaylistAdd from '@mui/icons-material/PlaylistAdd';

export const drawerWidth = 240;

export const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

interface IMenuSliderProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function MenuSlider({ open, setOpen, setIsLoggedIn }: IMenuSliderProps) {
  const [openTab, setOpenTab] = React.useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const icons = {
    Logout: <LogoutIcon />,
    'Issue License VC': <CardMembership />,
    'Products': <PlaylistAddCheck />,
    'Add Product': <PlaylistAdd />,
    'Event Details': <PlaylistAdd />,
    'Register Proxy': <DnsIcon />,
    'Trust Chain': <LinkIcon />,
  };

  const handleLogout = () => {
    navigate('/login');
    setIsLoggedIn(false);
  };

  const handleRegisterProxy = () => {
    navigate('/register-proxy');
  };

  const handleTrustChain = () => {
    setOpenTab(!openTab);
  };

  const onHandleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, item: string) => {
    e.preventDefault();

    switch (item) {
      case 'Logout':
        handleLogout();
        break;
      case 'Issue License VC':
          handleIssueVC();
          break;
      case 'Products':
        handleProducts();
        break;
      case 'Add Product':
          handleAddProduct();
          break;
      case 'Event Details':
        handleEventDetails();
        break;
      case 'Register Proxy':
        handleRegisterProxy();
        break;
      case 'Trust Chain':
        handleTrustChain();
        break;
      default:
        // default handling
        return;
    }
  };

  const handleViewWallet = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    navigate('/wallet-capabilities');
  };

  const handleNewWallet = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    navigate('/create-wallet');
  };

  const handleReqOnBoard = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    navigate('/request-onboard');
  };

  const handleReqAccredit = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    navigate('/request-accredit');
  };

  const handleNewPIN = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    navigate('/generate-pin');
  };

  const handleRemoveAccredit = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    navigate('/remove-accredit');
  };

  const handleIssueVC = () => {
    //e.preventDefault();
    navigate('/issue-vc');
  };

  const handleProducts = () => {
    //e.preventDefault();
    navigate('/products');
  };


  const handleAddProduct = () => {
    //e.preventDefault();
    navigate('/add-product');
  };

  const handleEventDetails = () => {
    //e.preventDefault();
    navigate('/event-details');
  };


  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="persistent"
      anchor="left"
      open={open}
    >
      <DrawerHeader>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List>
        {['Issue License VC','Products','Add Product','Event Details','Register Proxy', 'Logout', 'Trust Chain'].map((text, index) => {
          if (text === 'Trust Chain') {
            return (
              <Box key={text}>
                <ListItem key={text + '-index-' + index} disablePadding>
                  <ListItemButton onClick={(e) => onHandleClick(e, text)}>
                    <ListItemIcon>{icons[text as keyof typeof icons]}</ListItemIcon>
                    <ListItemText primary={text} />
                    {openTab ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={openTab} timeout="auto" unmountOnExit>
                  <Divider />
                  <List component="div" disablePadding key={text + 'sub-options'}>
                    <ListItemButton key={'View wallet'} sx={{ pl: 4 }} onClick={handleViewWallet}>
                      <ListItemText primary="Vew wallet" />
                      <ListItemIcon>
                        <ChevronRightIcon />
                      </ListItemIcon>
                    </ListItemButton>
                    <ListItemButton sx={{ pl: 4 }} key={'New wallet'}>
                      <ListItemText primary="New wallet" onClick={handleNewWallet} />
                      <ListItemIcon>
                        <ChevronRightIcon />
                      </ListItemIcon>
                    </ListItemButton>
                    {/* <ListItemButton sx={{ pl: 4 }} key={'Issue VC'}>
                      <ListItemText primary="Issue VC" onClick={handleIssueVC} />
                      <ListItemIcon>
                        <ChevronRightIcon />
                      </ListItemIcon>
                    </ListItemButton> */}
                    <ListItemButton sx={{ pl: 4 }} key={'Req on board'}>
                      <ListItemText primary="Req on board" onClick={handleReqOnBoard} />
                      <ListItemIcon>
                        <ChevronRightIcon />
                      </ListItemIcon>
                    </ListItemButton>
                    <ListItemButton sx={{ pl: 4 }} key={'Req Accredit'}>
                      <ListItemText primary="Req Accredit" onClick={handleReqAccredit} />
                      <ListItemIcon>
                        <ChevronRightIcon />
                      </ListItemIcon>
                    </ListItemButton>
                    <ListItemButton sx={{ pl: 4 }} key={'new PIN'}>
                      <ListItemText primary="New PIN" onClick={handleNewPIN} />
                      <ListItemIcon>
                        <ChevronRightIcon />
                      </ListItemIcon>
                    </ListItemButton>
                    <ListItemButton sx={{ pl: 4 }} key={'Remove Accredit'}>
                      <ListItemText primary="Remove Accredit" onClick={handleRemoveAccredit} />
                      <ListItemIcon>
                        <ChevronRightIcon />
                      </ListItemIcon>
                    </ListItemButton>
                  </List>
                  <Divider />
                </Collapse>
              </Box>
            );
          }
          return (
            <ListItem key={text} disablePadding>
              <ListItemButton onClick={(e) => onHandleClick(e, text)}>
                <ListItemIcon>{icons[text as keyof typeof icons]}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      {/* <Divider /> */}
    </Drawer>
  );
}
