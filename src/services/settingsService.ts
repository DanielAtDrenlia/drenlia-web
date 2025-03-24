import { useState, useEffect } from 'react';

export interface Setting {
  key: string;
  value: string;
  updated_at: string;
}

// API base URL - handle both development and production environments
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

export function useSettings() {
  const [settings, setSettings] = useState<Setting[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Always use the admin endpoint when in the admin section
      const endpoint = window.location.pathname.startsWith('/admin') 
        ? `${API_BASE_URL}/admin/settings`
        : `${API_BASE_URL}/settings`;

      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You do not have permission to access these settings');
        }
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      } else {
        throw new Error(data.message || 'Failed to fetch settings');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching settings';
      setError(errorMessage);
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
      });

      if (!response.ok) {
        throw new Error('Failed to update setting');
      }

      const data = await response.json();
      if (data.success) {
        // Update local state
        setSettings(prev => {
          if (!prev) return [{ key, value, updated_at: new Date().toISOString() }];
          
          const existingIndex = prev.findIndex(setting => setting.key === key);
          if (existingIndex === -1) {
            // Add new setting
            return [...prev, { key, value, updated_at: new Date().toISOString() }];
          } else {
            // Update existing setting
            return prev.map(setting => 
              setting.key === key 
                ? { ...setting, value, updated_at: new Date().toISOString() }
                : setting
            );
          }
        });
      } else {
        throw new Error('Failed to update setting');
      }
    } catch (err) {
      console.error('Error updating setting:', err);
      throw err;
    }
  };

  const uploadLogo = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      console.log('Uploading logo to:', `${API_BASE_URL}/admin/logo`);
      const response = await fetch(`${API_BASE_URL}/admin/logo`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to upload logo');
      }

      if (data.success) {
        // Update local state with the new logo path
        setSettings(prev => {
          if (!prev) return [{ key: 'logo_path', value: data.path, updated_at: new Date().toISOString() }];
          
          const existingIndex = prev.findIndex(setting => setting.key === 'logo_path');
          if (existingIndex === -1) {
            return [...prev, { key: 'logo_path', value: data.path, updated_at: new Date().toISOString() }];
          } else {
            return prev.map(setting => 
              setting.key === 'logo_path'
                ? { ...setting, value: data.path, updated_at: new Date().toISOString() }
                : setting
            );
          }
        });
      } else {
        throw new Error(data.message || data.error || 'Failed to upload logo');
      }
    } catch (err) {
      console.error('Error uploading logo:', err);
      throw err;
    }
  };

  return {
    settings,
    isLoading,
    error,
    updateSetting,
    uploadLogo
  };
} 