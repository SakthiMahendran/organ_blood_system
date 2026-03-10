import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { PATHS } from './paths';
import { isRoleAllowed } from '../utils/roleUtils';
import PageLoader from '../components/common/PageLoader';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const auth = useAuth();
  const location = useLocation();

  if (auth.isLoading) {
    return <PageLoader />;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to={PATHS.LOGIN} replace state={{ from: location }} />;
  }

  if (!isRoleAllowed(auth.user?.user_type, allowedRoles)) {
    return <Navigate to={PATHS.UNAUTHORIZED} replace />;
  }

  if (children) {
    return children;
  }

  return <Outlet />;
};

export default ProtectedRoute;
