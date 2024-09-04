import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

interface PrivateRouteProps {
  // Removed path prop, it should be declared in routing file.
  children?: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // If the user is not authenticated, navigate to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child components
  return <>{children ? children : <Outlet />}</>;
};

export default PrivateRoute;
