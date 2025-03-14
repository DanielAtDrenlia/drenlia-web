import React from 'react';
import styled from 'styled-components';
import ContactForm from '../components/ContactForm';

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

const LocationInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-self: flex-start;
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
`;

const ContactPage: React.FC = () => {
  return (
    <ContactContainer>
      <ContactHeader>
        <ContactTitle>Contact Us</ContactTitle>
        <ContactSubtitle>
          Have a question or want to work with us? Fill out the form below and we'll get back to you as soon as possible.
        </ContactSubtitle>
      </ContactHeader>
      
      <ContactContent>
        <ContactForm />
        
        <LocationInfo>
          <InfoItem>
            <IconWrapper>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </IconWrapper>
            <InfoContent>
              <InfoTitle>Our Location</InfoTitle>
              <InfoText>7037 rue des Tournesols<br />Saint-Hubert, QC J3Y 8S2</InfoText>
            </InfoContent>
          </InfoItem>
        </LocationInfo>
      </ContactContent>
    </ContactContainer>
  );
};

export default ContactPage;