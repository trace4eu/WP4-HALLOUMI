import { Outlet, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import styled from '@mui/material/styles/styled';
import MenuSlider, { DrawerHeader, drawerWidth } from './MenuSlider';
import TopBar from './TopBar';

interface IlayoutProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
 
  orgName:string|null;
}

const Layout = ({ setIsLoggedIn,  orgName }: IlayoutProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSliderOpen = () => {
    setOpen(true);
  };

  const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
    open?: boolean;
  }>(({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
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
    <Box sx={{ display: 'flex' }} width="100vw">
      <TopBar open={open} handleDrawerOpen={handleSliderOpen}  orgName={orgName}/>

      <MenuSlider open={open} setOpen={setOpen} setIsLoggedIn={setIsLoggedIn} />

      <Main open={open} style={{ width: '100vw' }}>
        <DrawerHeader />
        <Outlet />
      </Main>
    </Box>
  );
};

export default Layout;
