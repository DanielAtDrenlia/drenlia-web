import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../services/emailService';

const FormCard = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: var(--primary-color);
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
  }
`;

const TextArea = styled.textarea`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
  }
`;

const SubmitButton = styled.button`
  background-color: var(--accent-color);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #c0392b;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div<{ $isError?: boolean }>`
  padding: 1rem;
  border-radius: 4px;
  background-color: ${props => props.$isError ? '#f8d7da' : '#d4edda'};
  color: ${props => props.$isError ? '#721c24' : '#155724'};
  margin-top: 1rem;
`;

const ServiceStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #28a745;
  margin-top: 1rem;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #28a745;
  }
`;

// Captcha styles
const CaptchaCard = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-top: 2rem;
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

// Captcha Component
const Captcha: React.FC<{ onValidationChange: (isValid: boolean) => void }> = ({ onValidationChange }) => {
  const { t } = useTranslation('contact');
  const [captchaImage, setCaptchaImage] = useState<string>('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const loadCaptcha = React.useCallback(async () => {
    if (isValid === true) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/captcha-data-url`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.dataUrl) {
          setCaptchaImage(data.dataUrl);
          setCaptchaInput('');
          setIsValid(null);
          setErrorMessage('');
          onValidationChange(false);
        } else {
          setErrorMessage(t('captcha.error'));
        }
      } else {
        setErrorMessage(t('captcha.error'));
      }
    } catch (error) {
      console.error('Captcha loading error:', error);
      setErrorMessage(t('captcha.error'));
    } finally {
      setIsLoading(false);
    }
  }, [isValid, onValidationChange, t]);
  
  React.useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);
  
  const handleVerify = async () => {
    if (!captchaInput.trim() || isVerifying) return;
    
    setIsVerifying(true);
    try {
      const response = await fetch(`${API_URL}/verify-captcha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ captchaInput: captchaInput.trim() }),
        credentials: 'include'
      });
      
      const result = await response.json();
      setIsValid(result.success);
      setErrorMessage(result.success ? '' : t('captcha.invalid'));
      onValidationChange(result.success);
      
      if (!result.success) {
        setTimeout(loadCaptcha, 1500);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setIsValid(false);
      setErrorMessage(t('captcha.error'));
      onValidationChange(false);
    } finally {
      setIsVerifying(false);
    }
  };
  
  return (
    <CaptchaCard>
      <CaptchaTitle>{t('captcha.title')}</CaptchaTitle>
      
      <CaptchaImageContainer>
        {isLoading && <CaptchaLoading>{t('captcha.loading')}</CaptchaLoading>}
        {!isLoading && captchaImage && (
          <img 
            src={captchaImage} 
            alt="Captcha" 
            style={{ maxWidth: '100%', height: 'auto' }} 
          />
        )}
      </CaptchaImageContainer>
      
      <CaptchaInput 
        type="text" 
        value={captchaInput}
        onChange={(e) => setCaptchaInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
        placeholder={t('captcha.placeholder')}
        disabled={isValid === true}
      />
      
      <ButtonsContainer>
        <RefreshButton 
          type="button" 
          onClick={loadCaptcha}
          disabled={isValid === true}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px' }}>
            <path d="M23 4v6h-6"></path>
            <path d="M1 20v-6h6"></path>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
            <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
          </svg>
          {t('captcha.refresh')}
        </RefreshButton>
        
        <VerifyButton 
          type="button" 
          onClick={handleVerify}
          disabled={isVerifying || !captchaInput.trim() || isValid === true}
        >
          {isVerifying ? t('captcha.verifying') : isValid === true ? t('captcha.valid') : t('captcha.verify')}
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
              {t('captcha.valid')}
            </>
          ) : (
            errorMessage
          )}
        </CaptchaStatus>
      )}
    </CaptchaCard>
  );
};

interface ContactFormProps {
  showCaptchaOnly?: boolean;
  showCaptchaInForm?: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({ showCaptchaOnly = false, showCaptchaInForm = true }) => {
  const { t } = useTranslation('contact');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isCaptchaValid) {
      setStatus({
        message: t('captcha.error'),
        isError: true
      });
      return;
    }
    
    setIsSending(true);
    setStatus(null);
    
    try {
      const response = await fetch(`${API_URL}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      
      if (response.ok) {
        setStatus({
          message: t('form.status.success'),
          isError: false
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus({
          message: t('form.status.error'),
          isError: true
        });
      }
    } catch (error) {
      setStatus({
        message: t('form.status.error'),
        isError: true
      });
    } finally {
      setIsSending(false);
    }
  };

  if (showCaptchaOnly) {
    return <Captcha onValidationChange={setIsCaptchaValid} />;
  }
  
  return (
    <div>
      <FormCard>
        <FormContainer onSubmit={handleSubmit}>
          <FormGroup>
            <Label>{t('form.name.label')}</Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('form.name.placeholder')}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>{t('form.email.label')}</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t('form.email.placeholder')}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>{t('form.subject.label')}</Label>
            <Input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder={t('form.subject.placeholder')}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>{t('form.message.label')}</Label>
            <TextArea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder={t('form.message.placeholder')}
              required
            />
          </FormGroup>
          
          <SubmitButton type="submit" disabled={isSending || !isCaptchaValid}>
            {isSending ? t('form.submit.sending') : t('form.submit.button')}
          </SubmitButton>
          
          {status && (
            <StatusMessage $isError={status.isError}>
              {status.message}
            </StatusMessage>
          )}
          
          <ServiceStatus>Email service is available</ServiceStatus>
        </FormContainer>
      </FormCard>
      
      {showCaptchaInForm && <Captcha onValidationChange={setIsCaptchaValid} />}
    </div>
  );
};

export default ContactForm; 