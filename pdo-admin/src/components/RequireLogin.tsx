import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface PropsRequireLogin {
  isLoggedIn: boolean;
}

const RequireLogin = ({ isLoggedIn }: PropsRequireLogin) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default RequireLogin;
