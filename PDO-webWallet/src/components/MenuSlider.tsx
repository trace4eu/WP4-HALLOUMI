import {useEffect, useState} from 'react';
import {styled, useTheme} from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
// import Divider from '@mui/material/Divider';
// import IconButton from '@mui/material/IconButton';
// import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
// import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {useNavigate} from 'react-router-dom';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import SecurityIcon from '@mui/icons-material/Security';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
// import RestartAltIcon from '@mui/icons-material/RestartAlt';
import LogoutIcon from '@mui/icons-material/Logout';
// import {ExpandLess, ExpandMore} from '@mui/icons-material';
// import Collapse from '@mui/material/Collapse';
// import Box from '@mui/material/Box';

export let drawerWidth = 240;

export const DrawerHeader = styled('div')(({theme}) => ({
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
}

export default function MenuSlider({open, setOpen}: IMenuSliderProps) {
  const [openTab, setOpenTab] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    drawerWidth = 240;
  }, [openTab]);

  const handleDrawerClose = () => {
    setOpen(true);
  };

  const icons = {
    'My Wallet': <InboxIcon />,
    'My License VC': <SecurityIcon />,
    'Req License VC': <AccountBalanceWalletIcon />,
    'New batch': <AutoStoriesIcon />,
    'Pending Tasks': <AccountBalanceWalletIcon />,
    'Completed Tasks': <SecurityIcon />,
    'New QR code': <AccountBalanceWalletIcon />,
    // 'Deferred Credentials': <InboxIcon />,
    // 'Wallet Security': <SecurityIcon />,
    // 'Self-Sovereign Identity (DID)': <AccountBalanceWalletIcon />,
    // 'About eKibisis': <AutoStoriesIcon />,
    // 'Reset Wallet': <RestartAltIcon />,
    Logout: <LogoutIcon />,
  };

  const handleLogout = () => {
    navigate('/');
  };

  const onHandleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, item: string) => {
    e.preventDefault();

    switch (item) {
      case 'My Wallet':
        navigate('/wallet');
        break;
      case 'My License VC':
        navigate('/mylicensevc');
        break;
      case 'Req License VC':
        navigate('/reqlicensevc');
        break;
      case 'New batch':
        navigate('/newbatch');
        break;
      case 'Pending Tasks':
        navigate('/pendingtasks');
        break;
      case 'Completed Tasks':
        navigate('/completedtasks');
        break;
      case 'New QR code':
        navigate('/newqrcode');
        break;
      // case 'Deferred Credentials':
      //   navigate('/deferred-credentials');
      //   break;
      // case 'Self-Sovereign Identity (DID)':
      //   setOpenTab(!openTab);
      //   break;
      // case 'Reset Wallet':
      //   navigate('/reset');
      //   break;
      case 'Logout':
        handleLogout();
        break;
      default:
        // default handling
        return;
    }
  };

  // const handleClickDecentralised = () => {
  //   navigate('/self-sovereign-identity');
  // };

  // const handleClickBackup = () => {
  //   navigate('/backup');
  // };

  // const handleClickRestore = () => {
  //   navigate('/restore');
  // };

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          marginTop: '140px',
          height: 'auto',
          border: '1px solid #BBBCBF',
          borderBottomRightRadius: '5px',
        },
      }}
      variant="persistent"
      anchor="left"
      open={open}
    >
      {/* <DrawerHeader>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </DrawerHeader>
      <Divider /> */}
      <List key={'menu-list'}>
        {[
          'My Wallet',
          'My License VC',
          'Req License VC',
          'New batch',
          'Pending Tasks',
          'Completed Tasks',
          'New QR code',
          // 'Deferred Credentials',
          // 'Wallet Security',
          // 'Self-Sovereign Identity (DID)',
          // 'About eKibisis',
          // 'Reset Wallet',
          'Logout',
        ].map((text, index) => {
          // if (text === 'Self-Sovereign Identity (DID)') {
          //   return (
          //     <Box key={text}>
          //       <ListItem key={text + '-index-' + index} disablePadding>
          //         <ListItemButton onClick={(e) => onHandleClick(e, text)}>
          //           <ListItemIcon>{icons[text as keyof typeof icons]}</ListItemIcon>
          //           <ListItemText primary={text} />
          //           {openTab ? <ExpandLess /> : <ExpandMore />}
          //         </ListItemButton>
          //       </ListItem>
          //       <Collapse in={openTab} timeout="auto" unmountOnExit>
          //         <Divider />
          //         <List component="div" disablePadding key={text + 'sub-options'}>
          //           <ListItemButton
          //             key={'EBSI Decentralized ID'}
          //             sx={{pl: 4}}
          //             onClick={handleClickDecentralised}
          //           >
          //             <ListItemText primary="EBSI Decentralized ID" />
          //             <ListItemIcon>
          //               <ChevronRightIcon />
          //             </ListItemIcon>
          //           </ListItemButton>
          //           <ListItemButton sx={{pl: 4}} key={'Backup credentials'}>
          //             <ListItemText primary="Backup credentials" onClick={handleClickBackup} />
          //             <ListItemIcon>
          //               <ChevronRightIcon />
          //             </ListItemIcon>
          //           </ListItemButton>
          //           <ListItemButton sx={{pl: 4}} key={'Restore credentials'}>
          //             <ListItemText primary="Restore credentials" onClick={handleClickRestore} />
          //             <ListItemIcon>
          //               <ChevronRightIcon />
          //             </ListItemIcon>
          //           </ListItemButton>
          //           <ListItemButton sx={{pl: 4}} key={'Search credentials'}>
          //             <ListItemText primary="Search credentials" />
          //             <ListItemIcon>
          //               <ChevronRightIcon />
          //             </ListItemIcon>
          //           </ListItemButton>
          //         </List>
          //         <Divider />
          //       </Collapse>
          //     </Box>
          //   );
          // }
          return (
            <ListItem key={text + index} disablePadding>
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
