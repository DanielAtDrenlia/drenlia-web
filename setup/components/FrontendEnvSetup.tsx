import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface FrontendEnvSetupProps {
  onUpdate: (values: Record<string, string>) => void;
}

const Paper = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  &:required:invalid {
    border-color: #ff4444;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  &:required:invalid {
    border-color: #ff4444;
  }
`;

const HelperText = styled.span`
  font-size: 0.875rem;
  color: #666;
`;

const FrontendEnvSetup: React.FC<FrontendEnvSetupProps> = ({ onUpdate }) => {
  const [envValues, setEnvValues] = useState<Record<string, string>>({
    VITE_API_URL: '',
    VITE_APP_NAME: '',
    VITE_APP_DESCRIPTION: '',
  });

  useEffect(() => {
    // TODO: Load existing .env values
    onUpdate(envValues);
  }, [envValues]);

  const handleChange = (key: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValues = {
      ...envValues,
      [key]: event.target.value,
    };
    setEnvValues(newValues);
    onUpdate(newValues);
  };

  return (
    <Paper>
      <Title>Frontend Environment Variables</Title>
      <Form>
        <FormGroup>
          <Label htmlFor="api-url">API URL</Label>
          <Input
            id="api-url"
            type="text"
            value={envValues.VITE_API_URL}
            onChange={handleChange('VITE_API_URL')}
            required
          />
          <HelperText>The URL of your backend API</HelperText>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="app-name">App Name</Label>
          <Input
            id="app-name"
            type="text"
            value={envValues.VITE_APP_NAME}
            onChange={handleChange('VITE_APP_NAME')}
            required
          />
          <HelperText>The name of your application</HelperText>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="app-description">App Description</Label>
          <TextArea
            id="app-description"
            value={envValues.VITE_APP_DESCRIPTION}
            onChange={handleChange('VITE_APP_DESCRIPTION')}
            required
          />
          <HelperText>A brief description of your application</HelperText>
        </FormGroup>
      </Form>
    </Paper>
  );
};

export default FrontendEnvSetup; 