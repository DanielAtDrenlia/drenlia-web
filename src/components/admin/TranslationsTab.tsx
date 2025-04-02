import React, { useState, useMemo } from 'react';
import { useTranslations, TranslationPair } from '../../services/translationService';
import { useAuth } from '../../context/AuthContext';

interface TranslationFieldProps {
  label: string | React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  isLongText?: boolean;
}

const TranslationField: React.FC<TranslationFieldProps> = ({ label, value, onChange, disabled, id, isLongText }) => {
  return (
    <div className="mb-4" id={id}>
      <label className="block text-sm font-medium text-gray-400 mb-1">
        {label}
      </label>
      <div className="relative">
        {isLongText ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed resize-y"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        )}
      </div>
    </div>
  );
};

interface TranslationCardProps {
  pair: TranslationPair;
  onSave: (locale: 'en' | 'fr', filename: string, content: Record<string, any>) => Promise<void>;
  isAdmin: boolean;
  isExpanded: boolean;
  onToggleExpand: (expanded: boolean) => void;
  highlightText: (text: string, shouldHighlight: boolean) => React.ReactNode;
  selectedMatch: {
    path: string[];
    language: 'en' | 'fr';
  } | null;
}

const TranslationCard: React.FC<TranslationCardProps> = ({ 
  pair, 
  onSave, 
  isAdmin,
  isExpanded,
  onToggleExpand,
  highlightText,
  selectedMatch
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState({
    en: { ...pair.en.content },
    fr: { ...pair.fr.content }
  });

  const translateObject = async (obj: Record<string, any>, sourceLang: 'en' | 'fr'): Promise<Record<string, any>> => {
    const result: Record<string, any> = {};
    const targetLang = sourceLang === 'en' ? 'fr' : 'en';
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        result[key] = await translateObject(value, sourceLang);
      } else if (typeof value === 'string' && value.trim() !== '') {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            text: value,
            sourceLanguage: sourceLang,
            targetLanguage: targetLang
          }),
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Translation failed');
        }

        const data = await response.json();
        result[key] = data.translation;
      } else {
        result[key] = value;
      }
    }
    
    return result;
  };

  const handleTranslateToFrench = async () => {
    if (!isAdmin) return;
    try {
      setIsTranslating(true);
      const translatedContent = await translateObject(editedContent.en, 'en');
      setEditedContent(prev => ({
        ...prev,
        fr: translatedContent
      }));
      setSuccessMessage('Translation to French completed');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Translation error:', error);
      setSuccessMessage('Translation failed: Please try again.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateToEnglish = async () => {
    if (!isAdmin) return;
    try {
      setIsTranslating(true);
      const translatedContent = await translateObject(editedContent.fr, 'fr');
      setEditedContent(prev => ({
        ...prev,
        en: translatedContent
      }));
      setSuccessMessage('Translation to English completed');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Translation error:', error);
      setSuccessMessage('Translation failed: Please try again.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async () => {
    if (!isAdmin) return;
    try {
      setIsSaving(true);
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
      const fieldId = `${pair.en.name}-${locale}-${currentPath.join('-')}`;

      // Only highlight if this is the selected path and language matches
      const shouldHighlight = selectedMatch?.language === locale && 
        selectedMatch.path.join(' > ') === currentPath.join(' > ');

      if (typeof value === 'object' && value !== null) {
        return (
          <div key={key} className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {highlightText(fieldLabel, shouldHighlight)}
            </h3>
            {renderFields(value, locale, currentPath)}
          </div>
        );
      }

      // Get the corresponding value from the other language
      const otherLocale = locale === 'en' ? 'fr' : 'en';
      let otherValue = editedContent[otherLocale];
      for (const pathKey of currentPath) {
        otherValue = otherValue?.[pathKey];
      }

      // Use textarea if either language's text is long
      const isLongText = (value as string).length > 100 || (typeof otherValue === 'string' && otherValue.length > 100);

      return (
        <TranslationField
          key={key}
          id={fieldId}
          label={highlightText(fieldLabel, shouldHighlight)}
          value={value as string}
          disabled={!isAdmin}
          onChange={(newValue) => {
            if (!isAdmin) return;
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
          isLongText={isLongText}
        />
      );
    });
  };

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onToggleExpand(!isExpanded)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg
                className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-900">{pair.en.name}</h2>
          </div>
          {isAdmin && (
            <div className="space-x-4">
              <button
                onClick={handleSave}
                disabled={isSaving || !isAdmin}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {successMessage && (
          <div className="mt-4 p-4 rounded-md bg-green-50 border border-green-200">
            <p className="text-green-600">{successMessage}</p>
          </div>
        )}

        {!isAdmin && (
          <div className="mt-4 p-4 rounded-md bg-gray-50 border border-gray-200">
            <p className="text-gray-600">View-only mode. Contact an administrator to make changes.</p>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="sticky top-0 bg-white z-10 pb-4 mb-4 border-b">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium text-gray-900">English</h3>
                    {isAdmin && (
                      <button
                        onClick={handleTranslateToEnglish}
                        disabled={isTranslating || !isAdmin}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                      >
                        <span className="flex items-center">
                          Translate
                          <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                        </span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                  {renderFields(editedContent.en, 'en')}
                </div>
              </div>
              <div>
                <div className="sticky top-0 bg-white z-10 pb-4 mb-4 border-b">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium text-gray-900">French</h3>
                    {isAdmin && (
                      <button
                        onClick={handleTranslateToFrench}
                        disabled={isTranslating || !isAdmin}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                      >
                        <span className="flex items-center">
                          Translate
                          <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                        </span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                  {renderFields(editedContent.fr, 'fr')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TranslationsTab: React.FC = () => {
  const { translations, isLoading, error, updateTranslation } = useTranslations();
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showSearchResults, setShowSearchResults] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<{ path: string[]; language: 'en' | 'fr' } | null>(null);

  // Search through translations and highlight matches
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const results: {
      filename: string;
      matches: {
        path: string[];
        value: string;
        language: 'en' | 'fr';
        exactMatch: boolean;
      }[];
    }[] = [];

    const searchInObject = (
      obj: Record<string, any>,
      path: string[] = [],
      language: 'en' | 'fr',
      filename: string
    ) => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = [...path, key];
        
        if (typeof value === 'string' && value.toLowerCase().includes(searchQuery.toLowerCase())) {
          const existingFile = results.find(r => r.filename === filename);
          if (existingFile) {
            existingFile.matches.push({
              path: currentPath,
              value,
              language,
              exactMatch: value.toLowerCase() === searchQuery.toLowerCase()
            });
          } else {
            results.push({
              filename,
              matches: [{
                path: currentPath,
                value,
                language,
                exactMatch: value.toLowerCase() === searchQuery.toLowerCase()
              }]
            });
          }
        }
        
        if (typeof value === 'object' && value !== null) {
          searchInObject(value, currentPath, language, filename);
        }
      }
    };

    translations.forEach(pair => {
      // Search French content first, using the French filename
      searchInObject(pair.fr.content, [], 'fr', pair.fr.name);
      // Then search English content, using the English filename
      searchInObject(pair.en.content, [], 'en', pair.en.name);
      
      // Expand cards that have matches in either language
      if (results.some(r => r.filename === pair.en.name || r.filename === pair.fr.name)) {
        setExpandedCards(prev => {
          const newSet = new Set(prev);
          newSet.add(pair.en.name);
          return newSet;
        });
      }
    });

    return results;
  }, [searchQuery, translations]);

  const scrollToMatch = (filename: string, path: string[], language: 'en' | 'fr') => {
    setSelectedMatch({ path, language });
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      newSet.add(filename);
      return newSet;
    });
    setShowSearchResults(false);
    
    setTimeout(() => {
      const elementId = `${filename}-${language}-${path.join('-')}`;
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('bg-yellow-100');
        setTimeout(() => {
          element.classList.remove('bg-yellow-100');
        }, 2000);
      }
    }, 100);
  };

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

  const highlightText = (text: string, shouldHighlight: boolean) => {
    // If we should highlight this field (from clicking a result), just highlight the whole text
    if (shouldHighlight) {
      return <span className="bg-yellow-200">{text}</span>;
    }
    
    // Otherwise, do search query highlighting
    if (!searchQuery.trim()) return text;
    
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() ? 
        <span key={i} className="bg-yellow-200">{part}</span> : 
        part
    );
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Search Bar */}
      <div className="sticky top-0 bg-transparent z-20 pb-6 pt-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            placeholder="Search text across all files..."
            className="block w-full pl-10 pr-3 py-3 bg-white border border-gray-200 rounded-lg leading-5 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
            {searchResults && searchResults.length > 0 && (
              <button
                onClick={() => setShowSearchResults(!showSearchResults)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded-md hover:bg-gray-50"
                title={showSearchResults ? "Hide results" : "Show results"}
              >
                <svg className={`h-5 w-5 transform transition-transform ${showSearchResults ? 'rotate-0' : '-rotate-180'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Search Results */}
        {searchResults && searchResults.length > 0 && showSearchResults && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">
                Search Results ({searchResults.reduce((acc, curr) => acc + curr.matches.length, 0)} matches)
              </h3>
              <button
                onClick={() => setShowSearchResults(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Hide results
              </button>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-100">
              {searchResults.map((result, index) => (
                <div key={index} className="p-4">
                  <div className="font-medium text-gray-900 mb-2">{result.filename}</div>
                  <ul className="space-y-2">
                    {result.matches.map((match, matchIndex) => (
                      <li key={matchIndex} className="text-sm">
                        <button
                          onClick={() => scrollToMatch(result.filename, match.path, match.language)}
                          className="group flex items-center text-left w-full hover:bg-gray-50 p-2 rounded-md transition-colors duration-150"
                        >
                          <div className="flex-1">
                            <div className="text-gray-900 group-hover:text-indigo-600 font-medium">
                              {match.language.toUpperCase()}: {match.path.join(' > ')}
                            </div>
                            <div className="text-gray-500 text-xs mt-1">
                              {match.value}
                            </div>
                          </div>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {translations.map((pair) => (
        <TranslationCard
          key={pair.en.name}
          pair={pair}
          onSave={updateTranslation}
          isAdmin={isAdmin}
          isExpanded={expandedCards.has(pair.en.name)}
          onToggleExpand={(expanded) => {
            setExpandedCards(prev => {
              const newSet = new Set(prev);
              if (expanded) {
                newSet.add(pair.en.name);
              } else {
                newSet.delete(pair.en.name);
              }
              return newSet;
            });
          }}
          highlightText={highlightText}
          selectedMatch={selectedMatch}
        />
      ))}
    </div>
  );
};

export default TranslationsTab; 