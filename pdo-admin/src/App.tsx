import { useState } from 'react';
import { Routes, Route, BrowserRouter as Router, Navigate } from 'react-router-dom';
import Login from './screens/Login';
import RequireLogin from './components/RequireLogin';
import Layout from './components/Layout';
import AdminPanel from './screens/AdminPanel';
import useAutoLogout from './components/useAutoLogout';
//import PendingVCs from './screens/PendingVCs';
import IssuedVCs from './screens/IssuedVCs';
// import SubmittedVCs from './screens/SubmittedVCs';
import IssuedVCDetails from './screens/IssuedVCDetails';
import UserDataDetails from './screens/UserDataDetails';

import SubmittedVCDetails from './screens/SubmittedVCDetails';
import { cardType } from './types';
import RegisterProxy from './screens/RegisterProxy';
import WalletCapabilities from './screens/WalletCapabilities';
import NewWallet from './screens/NewWallet';
import OnBoardPage from './screens/OnBoardPage';
import AccreditationPage from './screens/AccreditationPage';
import NewPIN from './screens/NewPIN';
import RemoveAccreditation from './screens/RemoveAccreditation';
import IssueVC from './screens/IssueVC'
import GetBatches from './screens/GetBatches';
import NewProduct from './screens/NewProduct'
import Products from './screens/Products'
import EventDetails from './screens/EventDetails'

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useAutoLogout(setIsLoggedIn);
  //const [opMode, setOpMode] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);

  return (
    <>
      <> {console.log('App started')}</>
      <> {console.log('isLoggedIn? ', isLoggedIn)}</>

      <Router>
        <Routes>
          <Route
            path="/"
            element={!isLoggedIn ? <Navigate to={'/login'} /> : <Navigate to={'/admin'} />}
          />

          <Route
            path="/login"
            element={<Login setIsLoggedIn={setIsLoggedIn}  setOrgName={setOrgName} />}
          />

          <Route path="/" element={<Layout setIsLoggedIn={setIsLoggedIn} orgName={orgName} />}>
            <Route element={<RequireLogin isLoggedIn={isLoggedIn} />}>
              <Route path="/admin" element={<AdminPanel orgName={orgName} />} />

              {/* <Route path="/pending-vc" element={<PendingVCs />} /> */}
              <Route path="/pendingBatches" element={<GetBatches status={'pending'} />} />
              <Route path="/completedBatches" element={<GetBatches status={'completed'} />} />
              <Route path="/allEvents" element={<GetBatches status={'all'} />} />
              <Route path="/userdata/:id" element={<UserDataDetails vcType={orgName as cardType} />} />
              <Route path="/issued-vc" element={<IssuedVCs />} />
              <Route path="/issued-vc/:id" element={<IssuedVCDetails />} />
           
              <Route path="/submitted-vc/:id" element={<SubmittedVCDetails />} />
              <Route path="/register-proxy" element={<RegisterProxy />} />
              <Route path="/wallet-capabilities" element={<WalletCapabilities />} />

              <Route path="/create-wallet" element={<NewWallet />} />
              <Route path="/request-onboard" element={<OnBoardPage />} />
              <Route path="/request-accredit" element={<AccreditationPage />} />
              <Route path="/generate-pin" element={<NewPIN />} />
              <Route path="/remove-accredit" element={<RemoveAccreditation />} />
              <Route path="/issue-vc" element={<IssueVC />} />
              <Route path="/add-product" element={<NewProduct />} />
              <Route path="/products" element={<Products />} />
              <Route path="/event-details" element={<EventDetails />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to={'/'} />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
