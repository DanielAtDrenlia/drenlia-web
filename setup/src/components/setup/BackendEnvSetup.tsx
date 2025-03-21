import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Form,
  FormGroup,
  Label,
  LabelText,
  KeyName,
  Input,
  InputContainer,
  Section,
  SectionTitle,
  PasswordToggle
} from './styles';

interface BackendEnvSetupProps {
  onUpdate: (values: Record<string, string>) => void;
  initialValues?: Record<string, string>;
}

const defaultEnvValues = {
  // Server Configuration
  PORT: '3011',
  FRONTEND_URL: 'http://dev.drenlia.com',
  
  // Email Configuration
  EMAIL_HOST: 'smtp.gmail.com',
  EMAIL_PORT: '587',
  EMAIL_USER: 'support@drenlia.com',
  EMAIL_PASS: '',
  EMAIL_FROM: 'support@drenlia.com',
  EMAIL_TO: 'info@drenlia.com',
  
  // Session Configuration
  SESSION_SECRET: '',
  
  // Google OAuth Configuration
  GOOGLE_CLIENT_ID: '',
  GOOGLE_CLIENT_SECRET: '',
  
  // Google Cloud Translation API
  GOOGLE_CLOUD_API_KEY: '',
};

const passwordFields = [
  'EMAIL_PASS',
  'SESSION_SECRET',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CLOUD_API_KEY'
];

const BackendEnvSetup: React.FC<BackendEnvSetupProps> = ({ onUpdate, initialValues }) => {
  const [envValues, setEnvValues] = useState<Record<string, string>>(defaultEnvValues);
  const [previousValues, setPreviousValues] = useState(envValues);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    passwordFields.reduce((acc, field) => ({ ...acc, [field]: false }), {})
  );

  useEffect(() => {
    if (initialValues) {
      const newValues = { ...defaultEnvValues, ...initialValues };
      setEnvValues(newValues);
      setPreviousValues(newValues);
    }
  }, [initialValues]);

  const handleChange = (key: string, value: string) => {
    setEnvValues(prev => ({ ...prev, [key]: value }));
  };

  const handleBlur = () => {
    // Only update if values have changed
    if (JSON.stringify(envValues) !== JSON.stringify(previousValues)) {
      onUpdate(envValues);
      setPreviousValues(envValues);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, key: string) => {
    if (e.key === 'Escape') {
      // Restore previous value on escape
      setEnvValues(prev => ({ ...prev, [key]: previousValues[key] }));
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Enter') {
      // Move to next field on enter
      const form = (e.target as HTMLInputElement).form;
      if (form) {
        const inputs = Array.from(form.querySelectorAll('input'));
        const index = inputs.indexOf(e.target as HTMLInputElement);
        if (index < inputs.length - 1) {
          inputs[index + 1].focus();
        } else {
          (e.target as HTMLInputElement).blur();
        }
      }
    }
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getInputType = (key: string): string => {
    if (passwordFields.includes(key)) {
      return showPasswords[key] ? 'text' : 'password';
    }
    return 'text';
  };

  const renderField = (key: string, value: string) => (
    <FormGroup key={key}>
      <Label>
        <LabelText>{key.toLowerCase().replace(/_/g, ' ')}</LabelText>
        <KeyName>({key})</KeyName>
      </Label>
      <InputContainer>
        <Input
          type={getInputType(key)}
          value={value}
          onChange={(e) => handleChange(key, e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => handleKeyDown(e, key)}
          placeholder={`Enter ${key.toLowerCase().replace(/_/g, ' ')}`}
          inputMode={key.includes('PORT') ? 'numeric' : 'text'}
          pattern={key.includes('PORT') ? '[0-9]*' : undefined}
        />
        {passwordFields.includes(key) && (
          <PasswordToggle
            type="button"
            onClick={() => togglePasswordVisibility(key)}
            title={showPasswords[key] ? "Hide password" : "Show password"}
          >
            {showPasswords[key] ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </PasswordToggle>
        )}
      </InputContainer>
    </FormGroup>
  );

  const renderSection = (title: string, keys: string[]) => (
    <Section key={title}>
      <SectionTitle>{title}</SectionTitle>
      {keys.map(key => renderField(key, envValues[key]))}
    </Section>
  );

  const sections = [
    {
      title: 'Server Configuration',
      keys: ['PORT', 'FRONTEND_URL']
    },
    {
      title: 'Email Configuration',
      keys: ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM', 'EMAIL_TO']
    },
    {
      title: 'Session Configuration',
      keys: ['SESSION_SECRET']
    },
    {
      title: 'Google OAuth Configuration',
      keys: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
    },
    {
      title: 'Google Cloud Translation API',
      keys: ['GOOGLE_CLOUD_API_KEY']
    }
  ];

  return (
    <Container>
      <Form onSubmit={(e) => e.preventDefault()}>
        {sections.map(section => renderSection(section.title, section.keys))}
      </Form>
    </Container>
  );
};

export default BackendEnvSetup; 