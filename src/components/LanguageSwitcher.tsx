import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const SwitcherContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LanguageButton = styled.button<{ isActive: boolean }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: ${props => props.isActive ? 'var(--accent-color)' : 'transparent'};
  color: ${props => props.isActive ? 'white' : 'var(--text-primary)'};
  border: 1px solid ${props => props.isActive ? 'var(--accent-color)' : 'var(--border-color)'};

  &:hover {
    background: var(--accent-color);
    color: white;
  }
`;

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const switchLanguage = (lang: string) => {
    const currentPath = location.pathname;
    const pathParts = currentPath.split('/');
    
    // If we're on a language path, replace it
    if (pathParts[1] === 'en' || pathParts[1] === 'fr') {
      pathParts[1] = lang;
    } else {
      // If we're not on a language path (e.g., admin pages), don't change anything
      return;
    }
    
    const newPath = pathParts.join('/');
    navigate(newPath);
    i18n.changeLanguage(lang);
  };

  // Don't show language switcher on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <SwitcherContainer>
      <LanguageButton
        isActive={i18n.language === 'en'}
        onClick={() => switchLanguage('en')}
      >
        EN
      </LanguageButton>
      <LanguageButton
        isActive={i18n.language === 'fr'}
        onClick={() => switchLanguage('fr')}
      >
        FR
      </LanguageButton>
    </SwitcherContainer>
  );
};

export default LanguageSwitcher; 