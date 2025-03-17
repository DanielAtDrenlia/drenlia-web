import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

const CTAContainer = styled.section`
  padding: 5rem 0;
  background: linear-gradient(135deg, var(--primary-color), #1a2a3a);
  color: var(--light-text-color);
  text-align: center;
`;

const CTAContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const CTATitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CTAText = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2.5rem;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CTAButton = styled(Link)`
  background-color: var(--accent-color);
  color: var(--light-text-color);
  padding: 1rem 2.5rem;
  border-radius: 4px;
  font-weight: 500;
  font-size: 1.1rem;
  transition: background-color 0.3s ease, transform 0.3s ease;
  display: inline-block;
  
  &:hover {
    background-color: #c0392b;
    color: var(--light-text-color);
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  }
`;

const CallToAction: React.FC = () => {
  const { t, i18n } = useTranslation('home');
  const translate = t as TFunction<'home', undefined>;
  
  return (
    <CTAContainer>
      <CTAContent>
        <CTATitle>{translate('cta.title', 'Ready to Transform Your Digital Presence?')}</CTATitle>
        <CTAText>
          {translate('cta.description', 'Let\'s discuss how we can help you achieve your goals and take your business to the next level.')}
        </CTAText>
        <CTAButton to={`/${i18n.language}/contact`}>
          {translate('cta.button', 'Get Started')}
        </CTAButton>
      </CTAContent>
    </CTAContainer>
  );
};

export default CallToAction; 