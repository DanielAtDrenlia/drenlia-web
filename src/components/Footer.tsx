import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

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

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterTitle>Drenlia</FooterTitle>
          <p>Creating innovative solutions for modern problems.</p>
          <SocialLinks>
            <SocialIcon href="https://github.com/drenlia" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-github"></i>
            </SocialIcon>
            <SocialIcon href="https://twitter.com/drenlia" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i>
            </SocialIcon>
            <SocialIcon href="https://linkedin.com/in/drenlia" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin"></i>
            </SocialIcon>
          </SocialLinks>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Quick Links</FooterTitle>
          <FooterLink to="/">Home</FooterLink>
          <FooterLink to="/about">About</FooterLink>
          <FooterLink to="/projects">Projects</FooterLink>
          <FooterLink to="/contact">Contact</FooterLink>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Contact</FooterTitle>
          <p>Email: info@drenlia.com</p>
          <p>Phone: +1 (555) 123-4567</p>
          <p>Address: 123 Tech Street, San Francisco, CA</p>
        </FooterSection>
      </FooterContent>
      
      <Copyright>
        &copy; {currentYear} Drenlia. All rights reserved.
      </Copyright>
    </FooterContainer>
  );
};

export default Footer; 