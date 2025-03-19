import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FaMapMarkerAlt } from 'react-icons/fa';
import type { IconBaseProps } from 'react-icons';
import ContactForm from '../components/ContactForm';
import { usePreserveScroll } from '../hooks/usePreserveScroll';

// Create a proper type for the icon component
const MapMarkerIcon = (props: IconBaseProps) => {
  const Icon = FaMapMarkerAlt as React.ComponentType<IconBaseProps>;
  return <Icon {...props} />;
};

const ContactContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 1rem;
`;

const ContactHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const ContactTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
`;

const ContactSubtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  max-width: 700px;
  margin: 0 auto;
`;

const ContactContent = styled.div`
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const LocationCard = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  height: fit-content;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const InfoContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
`;

const InfoText = styled.p`
  color: #666;
  line-height: 1.6;
  white-space: pre-line;
`;

const ContactPage: React.FC = () => {
  const { t, i18n } = useTranslation('contact');
  usePreserveScroll(i18n);
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  
  return (
    <ContactContainer>
      <ContactHeader>
        <ContactTitle>{t('title', 'Contact Us') as string}</ContactTitle>
        <ContactSubtitle>
          {t('subtitle', 'Get in touch with us for any questions or inquiries') as string}
        </ContactSubtitle>
      </ContactHeader>
      
      <ContactContent>
        <ContactForm showCaptchaInForm={false} isCaptchaValid={isCaptchaValid} />
        
        <RightColumn>
          <LocationCard>
            <InfoItem>
              <IconWrapper>
                <MapMarkerIcon size={24} color="white" />
              </IconWrapper>
              <InfoContent>
                <InfoTitle>{t('location.title', 'Our Location') as string}</InfoTitle>
                <InfoText>7037, rue des Tournesols{'\n'}Saint-Hubert, QC J3Y 8S2</InfoText>
              </InfoContent>
            </InfoItem>
          </LocationCard>
          <ContactForm showCaptchaOnly onValidationChange={setIsCaptchaValid} />
        </RightColumn>
      </ContactContent>
    </ContactContainer>
  );
};

export default ContactPage;