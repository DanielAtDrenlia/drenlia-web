import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const NavContainer = styled.nav`
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

const NavLink = styled(Link)`
  color: var(--primary-color);
  margin-left: 2rem;
  font-weight: 500;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background-color: var(--accent-color);
    transition: width 0.3s ease;
  }
  
  &:hover {
    color: var(--accent-color);
  }
  
  &:hover:after {
    width: 100%;
  }
  
  @media (max-width: 768px) {
    margin: 1rem 0;
    text-align: center;
    margin-left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
  }
`;

const NavLinkButton = styled.button`
  color: var(--primary-color);
  margin-left: 2rem;
  font-weight: 500;
  position: relative;
  background: none;
  border: none;
  padding: 0;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background-color: var(--accent-color);
    transition: width 0.3s ease;
  }
  
  &:hover {
    color: var(--accent-color);
  }
  
  &:hover:after {
    width: 100%;
  }
  
  @media (max-width: 768px) {
    margin: 1rem 0;
    text-align: center;
    margin-left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
  }
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

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const scrollToTop = () => {
    // If already on homepage, scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Close mobile menu if open
    if (isOpen) {
      setIsOpen(false);
    }
  };
  
  const scrollToServices = () => {
    if (location.pathname !== '/') {
      // If not on homepage, navigate to homepage first
      window.location.href = '/#services-section';
    } else {
      // If already on homepage, just scroll
      const servicesSection = document.getElementById('services-section');
      if (servicesSection) {
        // Set a flag in sessionStorage to indicate we're scrolling to services
        sessionStorage.setItem('scrollToServices', 'true');
        servicesSection.scrollIntoView({ behavior: 'smooth' });
        
        // Force the animation to be visible
        const event = new CustomEvent('servicesVisible');
        window.dispatchEvent(event);
      }
    }
    // Close mobile menu if open
    if (isOpen) {
      setIsOpen(false);
    }
  };
  
  // Check if a path is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <NavContainer>
      <NavContent>
        <LogoContainer to="/" onClick={(e) => {
          if (location.pathname === '/') {
            e.preventDefault();
            scrollToTop();
          }
        }}>
          <LogoImage src="/images/logo/logo.png" alt="Drenlia Logo" />
          <LogoText>Drenlia</LogoText>
        </LogoContainer>
        <MenuButton onClick={toggleMenu} aria-label="Toggle menu">
          {isOpen ? '✕' : '☰'}
        </MenuButton>
        <NavLinks isOpen={isOpen}>
          <NavLinkButton onClick={scrollToServices}>
            Services
            <ActiveIndicator isActive={location.hash === '#services-section'} />
          </NavLinkButton>
          <NavLink to="/about">
            About
            <ActiveIndicator isActive={isActive('/about')} />
          </NavLink>
          <NavLink to="/projects">
            Projects
            <ActiveIndicator isActive={isActive('/projects')} />
          </NavLink>
          <NavLink to="/contact">
            Contact
            <ActiveIndicator isActive={isActive('/contact')} />
          </NavLink>
        </NavLinks>
      </NavContent>
    </NavContainer>
  );
};

export default Navbar; 