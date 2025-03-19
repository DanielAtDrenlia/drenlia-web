import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { BiRefresh } from 'react-icons/bi';
import type { IconBaseProps } from 'react-icons';
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

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
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

// Create a proper type for the icon component
const RefreshIcon = (props: IconBaseProps) => {
  const Icon = BiRefresh as React.ComponentType<IconBaseProps>;
  return <Icon {...props} />;
};

const RefreshButton = styled.button`
  background: none;
  border: none;
  color: var(--accent-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(231, 76, 60, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    transform: rotate(180deg);
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

// Helper function to ensure type safety for translations
const translateString = (t: TFunction<'contact'>, key: string, defaultValue: string): string => {
  return t(key, defaultValue);
};

// Helper function for React components that need translated content
const translateReact = (t: TFunction<'contact'>, key: string, defaultValue: string): React.ReactNode => {
  return t(key, defaultValue);
};

// Captcha Component
const Captcha: React.FC<{ onValidationChange: (isValid: boolean) => void }> = ({ onValidationChange }) => {
  const { t } = useTranslation('contact');
  const [captchaImage, setCaptchaImage] = useState<string>('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const loadCaptcha = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/captcha-data-url`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok && data.dataUrl) {
        setCaptchaImage(data.dataUrl);
        setCaptchaInput('');
        setIsValid(null);
        setErrorMessage('');
        onValidationChange(false);
      } else {
        setErrorMessage(translateString(t, 'captcha.error.load', 'Failed to load captcha'));
      }
    } catch (error) {
      setErrorMessage(translateString(t, 'captcha.error.load', 'Failed to load captcha'));
    } finally {
      setIsLoading(false);
    }
  }, [t, onValidationChange]);
  
  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);
  
  const handleVerify = async () => {
    if (!captchaInput.trim() || isVerifying) return;
    
    setIsVerifying(true);
    setErrorMessage('');
    
    try {
      const response = await fetch(`${API_URL}/verify-captcha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ captchaInput: captchaInput.trim() }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsValid(true);
        onValidationChange(true);
      } else {
        setIsValid(false);
        onValidationChange(false);
        setErrorMessage(t('captcha.invalid', 'Incorrect code, please try again') as string);
      }
    } catch (error) {
      setErrorMessage(t('captcha.error', 'Error loading captcha. Please try again.') as string);
      setIsValid(false);
      onValidationChange(false);
    } finally {
      setIsVerifying(false);
    }
  };
  
  return (
    <CaptchaCard>
      <CaptchaTitle>{t('captcha.title', 'Security Check') as string}</CaptchaTitle>
      <CaptchaImageContainer>
        {isLoading ? (
          <CaptchaLoading>{t('captcha.loading', 'Loading captcha...') as string}</CaptchaLoading>
        ) : (
          <img src={captchaImage} alt={t('captcha.alt', 'CAPTCHA image') as string} />
        )}
      </CaptchaImageContainer>
      
      <CaptchaInput
        type="text"
        value={captchaInput}
        onChange={(e) => setCaptchaInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
        placeholder={t('captcha.placeholder', 'Enter the text shown above') as string}
        disabled={isVerifying || isValid === true}
      />
      
      <ButtonsContainer>
        <RefreshButton
          type="button"
          onClick={loadCaptcha}
          disabled={isVerifying || isLoading}
        >
          <RefreshIcon size={20} color="currentColor" />
          {t('captcha.refresh', 'Refresh') as string}
        </RefreshButton>
        
        <VerifyButton
          type="button"
          onClick={handleVerify}
          disabled={!captchaInput.trim() || isVerifying || isValid === true}
        >
          {isVerifying
            ? t('captcha.verifying', 'Verifying...') as string
            : t('captcha.verify', 'Verify') as string
          }
        </VerifyButton>
      </ButtonsContainer>
      
      {errorMessage && (
        <CaptchaStatus $isValid={false}>
          {errorMessage}
        </CaptchaStatus>
      )}
      
      {isValid === true && (
        <CaptchaStatus $isValid={true}>
          {t('captcha.valid', 'Verification successful') as string}
        </CaptchaStatus>
      )}
    </CaptchaCard>
  );
};

interface ContactFormProps {
  showCaptchaOnly?: boolean;
  showCaptchaInForm?: boolean;
  isCaptchaValid?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ 
  showCaptchaOnly = false, 
  showCaptchaInForm = true,
  isCaptchaValid: externalCaptchaValid,
  onValidationChange 
}) => {
  const { t } = useTranslation('contact');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [internalCaptchaValid, setInternalCaptchaValid] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  // Use external captcha state if provided, otherwise use internal state
  const isCaptchaValid = externalCaptchaValid ?? internalCaptchaValid;
  const handleCaptchaValidation = onValidationChange ?? setInternalCaptchaValid;

  const validateForm = () => {
    const errors = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = translateString(t, 'form.error.name', 'Please enter your name');
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = translateString(t, 'form.error.email', 'Please enter your email');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = translateString(t, 'form.error.invalidEmail', 'Please enter a valid email address');
      isValid = false;
    }

    if (!formData.message.trim()) {
      errors.message = translateString(t, 'form.error.message', 'Please enter your message');
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!isCaptchaValid) {
      setStatus({
        success: false,
        message: translateString(t, 'form.error.captcha', 'Please complete the captcha verification')
      });
      return;
    }

    setIsSending(true);
    setStatus(null);

    try {
      const response = await fetch(`${API_URL}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (response.ok) {
        setStatus({
          success: true,
          message: translateString(t, 'form.error.success', 'Message sent successfully!')
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
        handleCaptchaValidation(false);
      } else {
        setStatus({
          success: false,
          message: translateString(t, 'form.error.submit', 'Failed to send message. Please try again.')
        });
      }
    } catch (error) {
      setStatus({
        success: false,
        message: translateString(t, 'form.error.submit', 'Failed to send message. Please try again.')
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: '' });
    }
  };

  if (showCaptchaOnly) {
    return <Captcha onValidationChange={handleCaptchaValidation} />;
  }
  
  return (
    <FormCard>
      <FormContainer onSubmit={handleSubmit} noValidate>
        <FormGroup>
          <Label>{translateString(t, 'form.name.label', 'Name')}</Label>
          <Input
            type="text"
            value={formData.name}
            onChange={handleInputChange('name')}
            placeholder={translateString(t, 'form.name.placeholder', 'Your name')}
          />
          {fieldErrors.name && <ErrorMessage>{fieldErrors.name}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label>{translateString(t, 'form.email.label', 'Email')}</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            placeholder={translateString(t, 'form.email.placeholder', 'Your email address')}
          />
          {fieldErrors.email && <ErrorMessage>{fieldErrors.email}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label>{translateString(t, 'form.subject.label', 'Subject')}</Label>
          <Input
            type="text"
            value={formData.subject}
            onChange={handleInputChange('subject')}
            placeholder={translateString(t, 'form.subject.placeholder', 'Message subject')}
          />
          {fieldErrors.subject && <ErrorMessage>{fieldErrors.subject}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label>{translateString(t, 'form.message.label', 'Message')}</Label>
          <TextArea
            value={formData.message}
            onChange={handleInputChange('message')}
            placeholder={translateString(t, 'form.message.placeholder', 'Your message')}
          />
          {fieldErrors.message && <ErrorMessage>{fieldErrors.message}</ErrorMessage>}
        </FormGroup>
        
        {showCaptchaInForm && (
          <Captcha onValidationChange={handleCaptchaValidation} />
        )}
        
        <SubmitButton type="submit" disabled={isSending || !isCaptchaValid}>
          {isSending 
            ? translateString(t, 'form.submit.sending', 'Sending...')
            : translateString(t, 'form.submit.button', 'Send Message')
          }
        </SubmitButton>
        
        {status && (
          <StatusMessage $isError={!status.success}>
            {status.message}
          </StatusMessage>
        )}
        
        <ServiceStatus>{translateString(t, 'form.service.available', 'Email service is available')}</ServiceStatus>
      </FormContainer>
    </FormCard>
  );
};

export default ContactForm; 