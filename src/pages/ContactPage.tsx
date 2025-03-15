import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ContactForm from '../components/ContactForm';
import { API_URL } from '../services/emailService';

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
  gap: 2rem;
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

// Updated Captcha Styles
const CaptchaContainer = styled.div`
  margin-top: 1rem;
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
`;

const CaptchaTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
`;

const CaptchaImageContainer = styled.div`
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
  position: relative;
  
  svg {
    max-width: 100%;
    height: auto;
  }
`;

const CaptchaLoading = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  color: #666;
`;

const CaptchaInput = styled.input`
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  font-size: 1rem;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const RefreshButton = styled.button`
  background: none;
  border: none;
  color: var(--accent-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const VerifyButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #2c3e50;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const CaptchaStatus = styled.div<{ $isValid: boolean | null }>`
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: ${props => 
    props.$isValid === null ? '#666' : 
    props.$isValid ? '#155724' : '#721c24'
  };
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 5px;
  }
`;

// Server-side Captcha Component
const Captcha: React.FC<{ onValidationChange: (isValid: boolean) => void }> = ({ onValidationChange }) => {
  const [captchaImage, setCaptchaImage] = useState<string>('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const loadCaptcha = React.useCallback(async () => {
    // Don't reload captcha if already verified successfully
    if (isValid === true) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Fetching captcha from:', `${API_URL}/captcha-data-url`);
      const response = await fetch(`${API_URL}/captcha-data-url`, {
        credentials: 'include'
      });
      
      // Log the response headers to debug
      console.log('Response status:', response.status);
      console.log('Response type:', response.headers.get('content-type'));
      
      if (response.ok) {
        // First get the raw text to see what's being returned
        const rawText = await response.text();
        console.log('Raw response first 100 chars:', rawText.substring(0, 100));
        
        // Check if it looks like HTML (error page)
        if (rawText.trim().startsWith('<!DOCTYPE') || rawText.trim().startsWith('<html')) {
          console.error('Received HTML instead of JSON. Server error occurred.');
          setErrorMessage('Server error. Please try again later.');
          setIsLoading(false);
          return;
        }
        
        try {
          // Parse the text as JSON
          const data = JSON.parse(rawText);
          if (data.dataUrl) {
            setCaptchaImage(data.dataUrl);
            setCaptchaInput('');
            setIsValid(null);
            setErrorMessage('');
            onValidationChange(false);
          } else {
            console.error('Data URL is missing in the response');
            setErrorMessage('Invalid captcha response. Please try again.');
          }
        } catch (jsonError) {
          console.error('JSON parsing error:', jsonError);
          setErrorMessage('Error processing captcha. Please try again.');
        }
      } else {
        console.error('Failed to load captcha:', response.status, response.statusText);
        setErrorMessage('Failed to load captcha. Please try again.');
      }
    } catch (error) {
      console.error('Captcha loading error:', error);
      setErrorMessage('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [isValid, onValidationChange]);
  
  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Don't allow changes if already verified
    if (isValid === true) {
      return;
    }
    
    setCaptchaInput(e.target.value);
    
    // Only reset validation state if it was previously invalid, not if it was valid
    if (isValid === false) {
      setIsValid(null);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Don't process key press if already verified
    if (isValid === true) {
      return;
    }
    
    if (e.key === 'Enter' && captchaInput.trim() && !isVerifying) {
      e.preventDefault();
      handleVerify();
    }
  };
  
  const handleVerify = async () => {
    if (!captchaInput.trim()) {
      setIsValid(false);
      setErrorMessage('Please enter the captcha text');
      return;
    }
    
    setIsVerifying(true);
    
    try {
      console.log('Sending verification request with input:', captchaInput);
      
      const response = await fetch(`${API_URL}/verify-captcha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ captchaInput: captchaInput.trim() }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error('Verification request failed:', response.status, response.statusText);
        setIsValid(false);
        setErrorMessage('Server error. Please try again.');
        onValidationChange(false);
        return;
      }
      
      const result = await response.json();
      console.log('Verification result:', result);
      
      setIsValid(result.success);
      setErrorMessage(result.message || '');
      onValidationChange(result.success);
      
      if (!result.success) {
        // Only reload captcha if verification failed
        setTimeout(loadCaptcha, 1500);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setIsValid(false);
      setErrorMessage('Network error. Please try again.');
      onValidationChange(false);
    } finally {
      setIsVerifying(false);
    }
  };
  
  return (
    <CaptchaContainer>
      <CaptchaTitle>Verify you're human</CaptchaTitle>
      
      <CaptchaImageContainer>
        {isLoading && <CaptchaLoading>Loading captcha...</CaptchaLoading>}
        {!isLoading && (
          captchaImage ? (
            <img 
              src={captchaImage} 
              alt="Captcha" 
              style={{ maxWidth: '100%', height: 'auto' }} 
            />
          ) : (
            <div>Failed to load captcha image</div>
          )
        )}
      </CaptchaImageContainer>
      
      <CaptchaInput 
        type="text" 
        value={captchaInput}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Enter the text from the image"
        aria-label="Captcha text"
        disabled={isValid === true}
      />
      
      <ButtonsContainer>
        <RefreshButton 
          type="button" 
          onClick={loadCaptcha}
          disabled={isValid === true}
          style={{ opacity: isValid === true ? 0.5 : 1 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px' }}>
            <path d="M23 4v6h-6"></path>
            <path d="M1 20v-6h6"></path>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
            <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
          </svg>
          New captcha
        </RefreshButton>
        
        <VerifyButton 
          type="button" 
          onClick={handleVerify}
          disabled={isVerifying || !captchaInput.trim() || isValid === true}
        >
          {isVerifying ? 'Verifying...' : isValid === true ? 'Verified' : 'Verify'}
        </VerifyButton>
      </ButtonsContainer>
      
      {(isValid !== null || errorMessage) && (
        <CaptchaStatus $isValid={isValid}>
          {isValid ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Verification successful! You can now submit the form.
            </>
          ) : (
            errorMessage || 'Verification failed. Please try again.'
          )}
        </CaptchaStatus>
      )}
    </CaptchaContainer>
  );
};

const ContactPage: React.FC = () => {
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaKey, setCaptchaKey] = useState(0); // Key to force captcha refresh
  
  const handleCaptchaValidation = (isValid: boolean) => {
    console.log('Captcha validation changed:', isValid);
    setCaptchaValid(isValid);
  };
  
  const handleCaptchaError = () => {
    console.log('Captcha error occurred, resetting state');
    // Reset captcha validation state
    setCaptchaValid(false);
    // Force captcha component to reload
    setCaptchaKey(prevKey => prevKey + 1);
  };
  
  // Log when captchaValid changes
  useEffect(() => {
    console.log('captchaValid state updated:', captchaValid);
  }, [captchaValid]);
  
  return (
    <ContactContainer>
      <ContactHeader>
        <ContactTitle>Contact Us</ContactTitle>
        <ContactSubtitle>
          Have a question or want to work with us? Fill out the form below and we'll get back to you as soon as possible.
        </ContactSubtitle>
      </ContactHeader>
      
      <ContactContent>
        <ContactForm 
          captchaValid={captchaValid} 
          onCaptchaError={handleCaptchaError}
        />
        
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
          
          <Captcha 
            key={captchaKey}
            onValidationChange={handleCaptchaValidation} 
          />
        </LocationInfo>
      </ContactContent>
    </ContactContainer>
  );
};

export default ContactPage;