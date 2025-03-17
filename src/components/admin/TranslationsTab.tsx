import React, { useState } from 'react';
import { useTranslations, TranslationPair } from '../../services/translationService';

interface TranslationFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const TranslationField: React.FC<TranslationFieldProps> = ({ label, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
    />
  </div>
);

interface TranslationCardProps {
  pair: TranslationPair;
  onSave: (locale: 'en' | 'fr', filename: string, content: Record<string, any>) => Promise<void>;
}

const TranslationCard: React.FC<TranslationCardProps> = ({ pair, onSave }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState({
    en: { ...pair.en.content },
    fr: { ...pair.fr.content }
  });

  const translateText = async (text: string): Promise<string> => {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      return data.translation;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  };

  const translateObject = async (obj: Record<string, any>): Promise<Record<string, any>> => {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        result[key] = await translateObject(value);
      } else if (typeof value === 'string' && value.trim() !== '') {
        result[key] = await translateText(value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  };

  const handleTranslate = async () => {
    try {
      setIsTranslating(true);
      const translatedContent = await translateObject(editedContent.en);
      setEditedContent(prev => ({
        ...prev,
        fr: translatedContent
      }));
      setSuccessMessage('Translation completed');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Translation error:', error);
      setSuccessMessage('Translation failed');
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Save both English and French translations
      await Promise.all([
        onSave('en', pair.en.name, editedContent.en),
        onSave('fr', pair.fr.name, editedContent.fr)
      ]);
      setSuccessMessage('Saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error saving translations:', error);
      setSuccessMessage('Error saving translations');
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const renderFields = (content: Record<string, any>, locale: 'en' | 'fr', path: string[] = []) => {
    return Object.entries(content).map(([key, value]) => {
      const currentPath = [...path, key];
      const fieldLabel = currentPath.join(' > ');

      if (typeof value === 'object' && value !== null) {
        return (
          <div key={key} className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{fieldLabel}</h3>
            {renderFields(value, locale, currentPath)}
          </div>
        );
      }

      return (
        <TranslationField
          key={key}
          label={fieldLabel}
          value={value as string}
          onChange={(newValue) => {
            setEditedContent(prev => {
              const newContent = { ...prev };
              let current = newContent[locale];
              for (let i = 0; i < path.length; i++) {
                current = current[path[i]];
              }
              current[key] = newValue;
              return newContent;
            });
          }}
        />
      );
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{pair.en.name}</h2>
        <div className="space-x-4">
          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isTranslating ? 'Translating...' : 'Translate to French'}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="mb-4 p-4 rounded-md bg-green-50 border border-green-200">
          <p className="text-green-600">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">English</h3>
          {renderFields(editedContent.en, 'en')}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">French</h3>
          {renderFields(editedContent.fr, 'fr')}
        </div>
      </div>
    </div>
  );
};

const TranslationsTab: React.FC = () => {
  const { translations, isLoading, error, updateTranslation } = useTranslations();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading translations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {translations.map((pair) => (
        <TranslationCard
          key={pair.en.name}
          pair={pair}
          onSave={updateTranslation}
        />
      ))}
    </div>
  );
};

export default TranslationsTab; 