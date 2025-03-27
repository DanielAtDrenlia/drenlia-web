import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { getAuthStatus, logout, User } from '../services/authService';

// Auth context interface
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to track the last check time and pending promise
  const lastCheckedRef = useRef<number>(0);
  const checkPromiseRef = useRef<Promise<void> | null>(null);

  // Check authentication status with throttling
  const checkAuthStatus = useCallback(async (): Promise<void> => {
    // If we already have a check in progress, return that promise
    if (checkPromiseRef.current) {
      return checkPromiseRef.current;
    }
    
    // Throttle checks to once every 2 seconds
    const now = Date.now();
    const timeSinceLastCheck = now - lastCheckedRef.current;
    if (timeSinceLastCheck < 2000 && lastCheckedRef.current !== 0) {
      console.log('Auth check throttled, last check was', timeSinceLastCheck, 'ms ago');
      return Promise.resolve();
    }
    
    // Create a new promise for this check
    const checkPromise = (async () => {
      try {
        if (!isLoading) {
          setIsLoading(true);
        }
        setError(null);
        
        const status = await getAuthStatus();
        
        setIsAuthenticated(status.authenticated);
        setUser(status.user || null);
        lastCheckedRef.current = Date.now();
      } catch (error) {
        setError('Failed to check authentication status');
        console.error('Auth status error:', error);
      } finally {
        setIsLoading(false);
        // Clear the promise reference
        checkPromiseRef.current = null;
      }
    })();
    
    // Store the promise
    checkPromiseRef.current = checkPromise;
    return checkPromise;
  }, [isLoading]);

  // Logout function
  const handleLogout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await logout();
      
      if (result.success) {
        setIsAuthenticated(false);
        setUser(null);
      } else {
        setError('Failed to logout');
      }
    } catch (error) {
      setError('Failed to logout');
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Context value
  const value = {
    isAuthenticated,
    user,
    isLoading,
    error,
    logout: handleLogout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 