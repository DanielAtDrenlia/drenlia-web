import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
  white-space: nowrap;
  z-index: 10;
  margin-bottom: 5px;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.3s ease;
  pointer-events: none;
  
  &::before {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
  }
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

/**
 * ObfuscatedEmail component that prevents easy copy-pasting
 * by splitting the email into parts and using CSS to display it
 */
const ObfuscatedEmail: React.FC = () => {
  const [tooltipText, setTooltipText] = useState("Click to copy email");
  const [tooltipVisible, setTooltipVisible] = useState(false);
  
  // Email parts stored separately to avoid easy scraping
  const emailUser = "info";
  const emailDomain = "drenlia.com";
  
  const handleCopyEmail = () => {
    // Assemble the email only when clicked
    const email = `${emailUser}@${emailDomain}`;
    
    // Use the clipboard API to copy the email
    navigator.clipboard.writeText(email)
      .then(() => {
        setTooltipText("Email copied!");
        setTooltipVisible(true);
        
        // Hide the tooltip after 2 seconds
        setTimeout(() => {
          setTooltipVisible(false);
        }, 2000);
      })
      .catch(() => {
        setTooltipText("Failed to copy");
        setTooltipVisible(true);
        
        // Hide the tooltip after 2 seconds
        setTimeout(() => {
          setTooltipVisible(false);
        }, 2000);
      });
  };
  
  const handleMouseEnter = () => {
    setTooltipText("Click to copy email");
    setTooltipVisible(true);
  };
  
  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };
  
  return (
    <EmailContainer 
      onClick={handleCopyEmail}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Click to copy email address"
    >
      <Tooltip visible={tooltipVisible}>{tooltipText}</Tooltip>
      <span style={{ display: 'none' }}>email-protected</span>
      <EmailPart>i</EmailPart>
      <EmailPart>n</EmailPart>
      <EmailPart>f</EmailPart>
      <EmailPart>o</EmailPart>
      <EmailSymbol>@</EmailSymbol>
      <EmailPart>d</EmailPart>
      <EmailPart>r</EmailPart>
      <EmailPart>e</EmailPart>
      <EmailPart>n</EmailPart>
      <EmailPart>l</EmailPart>
      <EmailPart>i</EmailPart>
      <EmailPart>a</EmailPart>
      <EmailPart>.</EmailPart>
      <EmailPart>c</EmailPart>
      <EmailPart>o</EmailPart>
      <EmailPart>m</EmailPart>
    </EmailContainer>
  );
};

const Footer: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterTitle>{t('footer.about.title', 'About Us')}</FooterTitle>
          <FooterText>
          {t('footer.about.description', 'We create innovative solutions for modern problems. Explore our services and projects.')}
          </FooterText>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>{t('footer.links.title')}</FooterTitle>
          <FooterLinks>
            <FooterLink to={`/${i18n.language}`}>{t('nav.home')}</FooterLink>
            <FooterLink to={`/${i18n.language}/about`}>{t('nav.about')}</FooterLink>
            <FooterLink to={`/${i18n.language}/services`}>{t('nav.services')}</FooterLink>
            <FooterLink to={`/${i18n.language}/contact`}>{t('nav.contact')}</FooterLink>
          </FooterLinks>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>{t('footer.contact.title')}</FooterTitle>
          <ContactInfo>
            <ContactItem>
              <ContactLabel>Email:</ContactLabel> <ObfuscatedEmail />
            </ContactItem>
            <ContactItem>
              <PhoneContainer data-tooltip={t('footer.contact.phone_tooltip')}>{t('footer.contact.phone')}</PhoneContainer>
            </ContactItem>
            <ContactItem>
              <AddressContainer>
                {t('footer.contact.address').split('\n').map((line, index) => (
                  <AddressLine key={index}>{line}</AddressLine>
                ))}
              </AddressContainer>
            </ContactItem>
          </ContactInfo>
        </FooterSection>
      </FooterContent>
      
      <Copyright>
        {t('footer.copyright', { year: currentYear })}
      </Copyright>
    </FooterContainer>
  );
};

export default Footer; 