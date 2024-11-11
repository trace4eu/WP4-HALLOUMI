import {Navigate, Outlet, useLocation} from 'react-router-dom';

interface PropsRequireLogin {
  isLoggedIn: boolean;
}

const RequireLogin = ({isLoggedIn}: PropsRequireLogin) => {
  const {pathname, search} = useLocation();
  console.log(pathname+' '+search);
  if (!isLoggedIn) {
    return <Navigate to='/login' state={{ previousPath: pathname+search }} />;
  }

  return <Outlet />;
};

export default RequireLogin;
