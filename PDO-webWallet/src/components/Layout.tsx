import {Outlet} from 'react-router-dom';
import {useState} from 'react';
import Box from '@mui/material/Box';
import styled from '@mui/material/styles/styled';
import MenuSlider, {DrawerHeader, drawerWidth} from '../components/MenuSlider';
import WalletBar from '../components/WalletBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../components/govcy.uds.min.css';
import './govcy.uds.min.css';

const Layout = () => {
  const [open, setOpen] = useState(true);

  const handleSliderOpen = () => {
    setOpen(true);
  };

  const Main = styled('main', {shouldForwardProp: (prop) => prop !== 'open'})<{
    open?: boolean;
  }>(({theme, open}) => ({
    flexGrow: 1,
    // padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    // marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
      width: window.screen.width - drawerWidth,
    }),
  }));

  return (
    <Box sx={{height: '100vh', display: 'flex', flexDirection: 'column'}}>
      <Header />
      {/* <WalletBar open={open} handleDrawerOpen={handleSliderOpen} /> */}

      <Box sx={{display: 'flex', flex: 1}} width="100vw">
        <MenuSlider open={open} setOpen={setOpen} />

        <Main open={open} style={{width: '100vw'}}>
          {/* <DrawerHeader /> */}
          <Outlet />
        </Main>
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;
