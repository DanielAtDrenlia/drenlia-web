import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import ObfuscatedEmail from './ObfuscatedEmail';

const FooterContainer = styled.footer`
  background-color: var(--primary-color);
  color: var(--light-text-color);
  padding: 3rem 0 1.5rem;
  margin-top: 3rem;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const FooterTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 50px;
    height: 2px;
    background-color: var(--accent-color);
  }
`;

const FooterLink = styled(Link)`
  color: var(--light-text-color);
  margin-bottom: 0.8rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: var(--accent-color);
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const SocialIcon = styled.a`
  color: var(--light-text-color);
  font-size: 1.5rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: var(--accent-color);
  }
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
`;

const EmailContainer = styled.span`
  display: inline-flex;
  align-items: center;
  user-select: none;
  position: relative;
  cursor: pointer;
  
  &:hover {
    color: var(--accent-color);
  }
`;

const EmailPart = styled.span`
  display: inline-block;
`;

const EmailSymbol = styled.span`
  margin: 0 2px;
  font-family: monospace;
`;

const Tooltip = styled.span<{ visible: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: pre-line;
  text-align: center;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
  z-index: 1000;
  pointer-events: none;
`;

const PhoneContainer = styled.span`
  position: relative;
  cursor: help;
  
  &:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 0.8rem;
    white-space: nowrap;
    z-index: 10;
    margin-bottom: 5px;
  }
  
  &:hover::before {
    content: "";
    position: absolute;
    top: -5px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent rgba(0, 0, 0, 0.8) transparent;
  }
`;

const AddressContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 0.3rem;
  line-height: 1.4;
  padding-left: 1.5rem;
`;

const AddressLine = styled.span`
  display: block;
`;

const ContactLabel = styled.span`
  display: inline-block;
  vertical-align: top;
`;

const FooterText = styled.p`
  margin-bottom: 0.8rem;
  line-height: 1.6;
`;

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
`;

const ContactInfo = styled.div`
  margin-top: 1rem;
`;

const ContactItem = styled.div`
  margin-bottom: 0.8rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
`;

const FooterBottom = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

// Helper function to ensure type safety for translations
const translateString = (t: TFunction<'common', undefined>, key: string, defaultValue: string): string => {
  return t(key, defaultValue);
};

// Helper function for React components that need translated content
const translateReact = (t: TFunction<'common', undefined>, key: string, defaultValue: string, options?: Record<string, any>): React.ReactNode => {
  return t(key, { ...options, defaultValue });
};

const Footer: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterTitle>
            {translateReact(t, 'footer.about.title', 'About Us')}
          </FooterTitle>
          <FooterText>
            {translateReact(t, 'footer.about.description', 'We create innovative solutions for modern problems. Explore our services.')}
          </FooterText>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>
            {translateReact(t, 'footer.links.title', 'Quick Links')}
          </FooterTitle>
          <FooterLinks>
            <FooterLink to={`/${i18n.language}`}>
              {translateReact(t, 'nav.home', 'Home')}
            </FooterLink>
            <FooterLink to={`/${i18n.language}/about`}>
              {translateReact(t, 'nav.about', 'About')}
            </FooterLink>
            <FooterLink to={`/${i18n.language}/services`}>
              {translateReact(t, 'nav.services', 'Services')}
            </FooterLink>
            <FooterLink to={`/${i18n.language}/contact`}>
              {translateReact(t, 'nav.contact', 'Contact')}
            </FooterLink>
          </FooterLinks>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>
            {translateReact(t, 'footer.contact.title', 'Contact Us')}
          </FooterTitle>
          <ContactInfo>
            <ContactItem>
              <ContactLabel>Email:</ContactLabel> <ObfuscatedEmail />
            </ContactItem>
            <ContactItem>
              <PhoneContainer data-tooltip={translateString(t, 'footer.contact.phone_tooltip', 'Click to call')}>
                {translateReact(t, 'footer.contact.phone', '+1 (555) 123-4567')}
              </PhoneContainer>
            </ContactItem>
            <ContactItem>
              <AddressContainer>
                {(translateString(t, 'footer.contact.address', '123 Business Street\nSuite 100\nCity, State 12345'))
                  .split('\n')
                  .map((line: string, index: number) => (
                    <AddressLine key={index}>{line}</AddressLine>
                  ))}
              </AddressContainer>
            </ContactItem>
          </ContactInfo>
        </FooterSection>
      </FooterContent>

      <Copyright>
        {translateReact(t, 'footer.copyright', '© {{year}}. All rights reserved.', { year: currentYear })}
      </Copyright>
    </FooterContainer>
  );
};

export default Footer; 