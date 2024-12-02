import React from 'react';
import {AppBar, Toolbar, Container, Typography, Link} from '@mui/material';
import WalletBar from './WalletBar';

const Header = ({isWalletBar = true}: {isWalletBar?: boolean}) => {
  return (
    <AppBar position="static" className="govcy-header-top-area" sx={{width: '100vw'}}>
      <Toolbar className="govcy-header-main-area" style={{height: '65px'}}>
        <Container className="govcy-main-area-items">
          <Link
            href="/"
            //className="govcy-logo"
            title="EBSIMy Wallet homepage"
            color="inherit"
            underline="none"
          >
            <Typography variant="h3" className="govcy-h3" fontWeight="700" style={{color: '#fff'}}>
              <span style={{color: '#ffad2d'}}>PDO</span>wallet
            </Typography>
          </Link>
        </Container>
      </Toolbar>
      {isWalletBar && <WalletBar />}
    </AppBar>
  );
};

export default Header;

// <header className="govcy-header">
//   <div className="govcy-header-main-area">
//     <div className="govcy-container govcy-main-area-items">
//       <div className="govcy-navigation-container">
//         <div className="govcy-service-container">
//           <a
//             href="/"
//             className="govcy-logo"
//             title="Go to EBSI GW Portal homepage"
//           >
//             EBSI GW Portals
//           </a>
//         </div>
//       </div>
//     </div>
//   </div>
// </header>
