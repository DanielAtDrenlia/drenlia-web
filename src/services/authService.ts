/**
 * Authentication service
 * Handles authentication and API calls to the backend
 */

// API base URL - use relative path for all environments
const API_BASE_URL = '/api';

// User interface
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

// Authentication status interface
export interface AuthStatus {
  authenticated: boolean;
  user?: User;
}

/**
 * Get the current authentication status
 * @returns Promise with authentication status
 */
export const getAuthStatus = async (): Promise<AuthStatus> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/status`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get authentication status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting auth status:', error);
    return { authenticated: false };
  }
};

/**
 * Logout the current user
 * @returns Promise with logout result
 */
export const logout = async (): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to logout');
    }

    return await response.json();
  } catch (error) {
    console.error('Error during logout:', error);
    return { success: false };
  }
};

/**
 * Login with Google
 * Redirects to Google OAuth login page
 */
export const loginWithGoogle = (): void => {
  window.location.href = `${API_BASE_URL}/auth/google`;
}; 