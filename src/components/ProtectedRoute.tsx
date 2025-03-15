import React, { useEffect, ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
  children?: ReactNode;
}

/**
 * Protected route component
 * Redirects to login page if user is not authenticated
 * Redirects to home page if user is not an admin (when requireAdmin is true)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireAdmin = false, children }) => {
  const { isAuthenticated, user, isLoading, checkAuthStatus } = useAuth();
  const location = useLocation();

  // Force a check of authentication status when the component mounts
  // This is important for handling redirects from the server
  useEffect(() => {
    console.log('ProtectedRoute: Checking auth status');
    // Only check auth status if not already authenticated
    if (!isAuthenticated && !isLoading) {
      checkAuthStatus();
    }
  }, [checkAuthStatus, isAuthenticated, isLoading]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Log authentication status for debugging
  console.log('ProtectedRoute: Auth status', { isAuthenticated, isAdmin: user?.isAdmin });

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/admin/login" replace />;
  }

  // Redirect to home if not an admin (when requireAdmin is true)
  if (requireAdmin && !user?.isAdmin) {
    console.log('ProtectedRoute: Not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  // Render the protected content
  console.log('ProtectedRoute: Rendering protected content');
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute; 