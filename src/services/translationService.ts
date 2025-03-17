import { useState, useEffect } from 'react';

export interface TranslationFile {
  name: string;
  content: Record<string, any>;
}

export interface TranslationPair {
  en: TranslationFile;
  fr: TranslationFile;
}

// API base URL - use relative path for all environments
const API_BASE_URL = '/api';

export function useTranslations() {
  const [translations, setTranslations] = useState<TranslationPair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTranslations();
  }, []);

  const fetchTranslations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/translations`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch translations');
      }

      const data = await response.json();
      if (data.success) {
        setTranslations(data.translations);
      } else {
        setError(data.error || 'Failed to fetch translations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching translations');
      console.error('Error fetching translations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTranslation = async (locale: 'en' | 'fr', filename: string, content: Record<string, any>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/translations`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locale, filename, content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update translation');
      }

      const data = await response.json();
      if (data.success) {
        // Update local state
        setTranslations(prev => 
          prev.map(pair => {
            if (pair[locale].name === filename) {
              return {
                ...pair,
                [locale]: {
                  ...pair[locale],
                  content
                }
              };
            }
            return pair;
          })
        );
      } else {
        throw new Error(data.error || 'Failed to update translation');
      }
    } catch (err) {
      console.error('Error updating translation:', err);
      throw err instanceof Error ? err : new Error('Failed to update translation');
    }
  };

  return {
    translations,
    isLoading,
    error,
    updateTranslation
  };
} 