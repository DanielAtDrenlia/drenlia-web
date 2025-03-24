import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { useSettings } from '../services/settingsService';

interface NavContainerProps {
  isScrolled: boolean;
}

const NavContainer = styled.nav<NavContainerProps>`
  background-color: #f8f9fa;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const NavContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const LogoImage = styled.img`
  height: 40px;
  margin-right: 10px;
`;

const LogoText = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  font-family: var(--font-heading);
  
  &:hover {
    color: var(--accent-color);
  }
`;

const NavLinks = styled.div<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: #f8f9fa;
    padding: 1rem 0;
    transform: ${({ isOpen }) => isOpen ? 'translateY(0)' : 'translateY(-100%)'};
    opacity: ${({ isOpen }) => isOpen ? '1' : '0'};
    visibility: ${({ isOpen }) => isOpen ? 'visible' : 'hidden'};
    transition: all 0.3s ease;
    z-index: 99;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    align-items: center;
  }
`;

// Base styles for all navigation items
const navItemStyles = `
  color: var(--primary-color);
  font-weight: 500;
  font-size: 1rem;
  font-family: inherit;
  position: relative;
  text-decoration: none;
  padding: 0.5rem 0;
  background: none;
  border: none;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  outline: none;
  user-select: none;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background-color: var(--accent-color);
    transition: width 0.3s ease;
  }
  
  &:hover {
    color: var(--accent-color);
    background: none;
  }
  
  &:hover:after {
    width: 100%;
  }
  
  &:focus {
    outline: none;
    background: none;
  }
  
  &:active {
    background: none;
  }
  
  @media (max-width: 768px) {
    margin: 0.5rem 0;
    text-align: center;
    width: 100%;
    display: flex;
    justify-content: center;
  }
`;

const StyledNavLink = styled(Link)`
  ${navItemStyles}
`;

const NavLinkButton = styled.button`
  ${navItemStyles}
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 1.5rem;
  cursor: pointer;
  
  &:hover {
    color: var(--accent-color);
  }
  
  @media (max-width: 768px) {
    display: block;
  }
`;

// Active link indicator
const ActiveIndicator = styled.span<{ isActive: boolean }>`
  display: ${props => props.isActive ? 'block' : 'none'};
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--accent-color);
`;

const NavbarEnd = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    align-items: center;
  }
`;

const NavLinkContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === `/${i18n.language}`;
  const { settings } = useSettings();
  const siteName = settings?.find(s => s.key === 'site_name')?.value || 'Company Name';
  const logoPath = settings?.find(s => s.key === 'logo_path')?.value || '/images/logo/logo.png';

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    if (path === 'services') {
      if (isHomePage) {
        const servicesSection = document.getElementById('services-section');
        if (servicesSection) {
          servicesSection.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate(`/${i18n.language}`);
        // Wait for navigation to complete before scrolling
        setTimeout(() => {
          const servicesSection = document.getElementById('services-section');
          if (servicesSection) {
            servicesSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    } else {
      navigate(`/${i18n.language}${path}`);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    if (isOpen) {
      setIsOpen(false);
    }
  };
  
  const scrollToServices = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
    if (isOpen) {
      setIsOpen(false);
    }
  };
  
  // Check if a path is active
  const isActive = (path: string): boolean => {
    return window.location.pathname.endsWith(path);
  };
  
  // Get the current language prefix for links
  const getLangPath = (path: string): string => {
    return `/${i18n.language}${path}`;
  };
  
  return (
    <NavContainer isScrolled={false}>
      <NavContent>
        <LogoContainer to={getLangPath('/')} onClick={scrollToTop}>
          <LogoImage src={logoPath} alt={siteName} />
          <LogoText>{siteName}</LogoText>
        </LogoContainer>
        
        <MenuButton onClick={toggleMenu}>
          <i className="fas fa-bars" />
        </MenuButton>
        
        <NavLinks isOpen={isOpen}>
          <NavLinkButton onClick={() => handleNavigation('services')}>
            <NavLinkContent>
              <>
                {t('nav.services', { defaultValue: 'Services' })}
                <ActiveIndicator isActive={false} />
              </>
            </NavLinkContent>
          </NavLinkButton>
          <StyledNavLink to={getLangPath('/about')}>
            <NavLinkContent>
              <>
                {t('nav.about', { defaultValue: 'About' })}
                <ActiveIndicator isActive={isActive('/about')} />
              </>
            </NavLinkContent>
          </StyledNavLink>
          <StyledNavLink to={getLangPath('/contact')}>
            <NavLinkContent>
              <>
                {t('nav.contact', { defaultValue: 'Contact' })}
                <ActiveIndicator isActive={isActive('/contact')} />
              </>
            </NavLinkContent>
          </StyledNavLink>
          <LanguageSwitcher />
        </NavLinks>
      </NavContent>
    </NavContainer>
  );
};

export default Navbar; 