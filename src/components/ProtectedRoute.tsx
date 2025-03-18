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
  useEffect(() => {
    console.log('ProtectedRoute: Checking auth status');
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
    // Encode the current path to handle special characters
    const returnTo = encodeURIComponent(location.pathname + location.search);
    console.log('ProtectedRoute: Redirecting to login with returnTo:', returnTo);
    // Redirect to login with return URL
    window.location.href = `/admin/login?returnTo=${returnTo}`;
    return null;
  }

  // Only check admin requirement for specific admin-only routes
  if (requireAdmin && !user?.isAdmin) {
    const path = location.pathname;
    // List of admin-only routes
    const adminOnlyRoutes = ['/admin/users', '/admin/settings'];
    
    if (adminOnlyRoutes.some(route => path.startsWith(route))) {
      console.log('ProtectedRoute: Admin-only route access denied');
      return <Navigate to="/admin" replace />;
    }
  }

  // Render the protected content
  console.log('ProtectedRoute: Rendering protected content');
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute; 