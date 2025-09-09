import { Navigate } from 'react-router-dom';

// Protect this route; send unauthenticated users to login
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('ams_token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
