import PageLoader from '../components/common/PageLoader';
import { useAuth } from '../contexts/AuthContext';

const PublicOnlyRoute = ({ children }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  return children;
};

export default PublicOnlyRoute;
