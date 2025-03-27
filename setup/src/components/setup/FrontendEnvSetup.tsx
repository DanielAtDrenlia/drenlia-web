import React, { useState, useEffect } from 'react';
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
} from './styles';

interface FrontendEnvSetupProps {
  onUpdate: (values: Record<string, string>) => void;
  initialValues?: Record<string, string>;
}

const defaultEnvValues = {
  REACT_APP_API_URL: '/api',
  WATCHPACK_POLLING: 'false',
};

const FrontendEnvSetup: React.FC<FrontendEnvSetupProps> = ({ onUpdate, initialValues }) => {
  const [envValues, setEnvValues] = useState<Record<string, string>>(defaultEnvValues);
  const [previousValues, setPreviousValues] = useState(envValues);

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

  const getInputType = (key: string): string => {
    if (key.includes('URL')) return 'url';
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
        />
      </InputContainer>
    </FormGroup>
  );

  return (
    <Container>
      <Form onSubmit={(e) => e.preventDefault()}>
        <Section>
          <SectionTitle>Frontend Environment</SectionTitle>
          {Object.entries(envValues).map(([key, value]) => renderField(key, value))}
        </Section>
      </Form>
    </Container>
  );
};

export default FrontendEnvSetup; 