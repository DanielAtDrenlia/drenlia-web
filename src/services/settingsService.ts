import { useState, useEffect } from 'react';

export interface Setting {
  key: string;
  value: string;
  updated_at: string;
}

// API base URL - use relative path for all environments
const API_BASE_URL = '/api';

export function useSettings() {
  const [settings, setSettings] = useState<Setting[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      } else {
        setError('Failed to fetch settings');
      }
    } catch (err) {
      setError('Error fetching settings');
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

  return {
    settings,
    isLoading,
    error,
    updateSetting
  };
} 