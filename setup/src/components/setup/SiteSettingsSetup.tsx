import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import path from 'path';
import fs from 'fs/promises';

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: grid;
  grid-template-columns: minmax(150px, 1fr) minmax(300px, 3fr);
  gap: 1rem;
  align-items: center;
  position: relative;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  &:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const LabelText = styled.span`
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
  text-transform: capitalize;
`;

const KeyName = styled.span`
  font-size: 0.75rem;
  color: #64748b;
  font-family: monospace;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #2d3748;
  background: #f8fafc;
  transition: all 0.2s ease;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    background: white;
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const AddButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  width: 100%;
  margin-top: 0.5rem;

  &:hover {
    background-color: #2563eb;
  }

  &:active {
    transform: translateY(1px);
  }
`;

const RemoveButton = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  color: #94a3b8;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  margin-left: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: #fee2e2;
    border-color: #fecaca;
    color: #ef4444;
  }
`;

const KeyValueContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
`;

const Divider = styled.div`
  height: 1px;
  background-color: #e2e8f0;
  margin: 1rem 0;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  color: #1e293b;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const AddNewSection = styled(FormGroup)`
  background-color: #f8fafc;
  border: 2px dashed #e2e8f0;
  padding: 1.5rem;
  display: block;

  &:hover {
    border-color: #3b82f6;
    background-color: #f0f9ff;
  }
`;

const AddNewContainer = styled.div`
  display: grid;
  grid-template-columns: minmax(150px, 1fr) minmax(300px, 2fr);
  gap: 1rem;
  margin-bottom: 0.5rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const WarningContainer = styled.div`
  background-color: #fef3c7;
  border-left: 4px solid #f59e0b;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const WarningText = styled.p`
  color: #ea580c;
  font-size: 0.875rem;
  font-weight: 500;
`;

interface SiteSettingsSetupProps {
  onUpdate: (values: Record<string, string>) => void;
  initialValues?: Record<string, string>;
}

// Default settings as a starting point
const defaultSettings: Record<string, string> = {
  version: '1.1.1',
  site_name: 'Company Name',
  contact_email: 'contact@example.com'
};

export const SiteSettingsSetup: React.FC<SiteSettingsSetupProps> = ({ initialValues, onUpdate }) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [previousValues, setPreviousValues] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (initialValues) {
      const { _isDefault, ...rest } = initialValues;
      // Only keep the fields we want
      const filteredValues = {
        version: rest.version || defaultSettings.version,
        site_name: rest.site_name || defaultSettings.site_name,
        contact_email: rest.contact_email || defaultSettings.contact_email
      };
      setValues(filteredValues);
      setPreviousValues(filteredValues);
      setIsDefault(Boolean(_isDefault));
    }
  }, [initialValues]);

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleBlur = async () => {
    // Only update if values have changed
    if (JSON.stringify(values) !== JSON.stringify(previousValues)) {
      onUpdate(values);
      setPreviousValues(values);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, key: string) => {
    if (e.key === 'Escape') {
      // Restore previous value on escape
      setValues(prev => ({ ...prev, [key]: previousValues[key] }));
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

  const handleRemove = (keyToRemove: string) => {
    const newValues = { ...values };
    delete newValues[keyToRemove];
    setValues(newValues);
    onUpdate(newValues);
  };

  const handleAdd = () => {
    if (newKey.trim() && !values[newKey]) {
      setValues(prev => ({ ...prev, [newKey]: newValue }));
      onUpdate({ ...values, [newKey]: newValue });
      setNewKey('');
      setNewValue('');
    }
  };

  const getInputType = (key: string): string => {
    if (key.includes('email')) return 'email';
    if (key.includes('phone')) return 'tel';
    return 'text';
  };

  return (
    <div className="space-y-6">
      {isDefault && (
        <WarningContainer>
          <WarningText>
            These are default site settings. Please review and update the information before saving.
          </WarningText>
        </WarningContainer>
      )}
      <div className="space-y-4">
        <Container>
          <Form onSubmit={(e) => e.preventDefault()}>
            <Section>
              <SectionTitle>Site Settings</SectionTitle>
              {Object.entries(values).map(([key, value]) => (
                <FormGroup key={key}>
                  <Label>
                    <LabelText>{key.replace(/_/g, ' ')}</LabelText>
                    <KeyName>({key})</KeyName>
                  </Label>
                  <KeyValueContainer>
                    <Input
                      type={getInputType(key)}
                      value={value}
                      onChange={(e) => handleChange(key, e.target.value)}
                      onBlur={handleBlur}
                      onKeyDown={(e) => handleKeyDown(e, key)}
                      placeholder={`Enter value for ${key.replace(/_/g, ' ')}`}
                    />
                    <RemoveButton
                      type="button"
                      onClick={() => handleRemove(key)}
                      title="Remove setting"
                    >
                      ×
                    </RemoveButton>
                  </KeyValueContainer>
                </FormGroup>
              ))}
            </Section>

            <Divider />

            <Section>
              <SectionTitle>Add New Setting</SectionTitle>
              <AddNewSection>
                <AddNewContainer>
                  <Input
                    type="text"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Setting name"
                  />
                  <Input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Setting value"
                  />
                </AddNewContainer>
                <AddButton type="button" onClick={handleAdd}>
                  Add Setting
                </AddButton>
              </AddNewSection>
            </Section>
          </Form>
        </Container>
      </div>
    </div>
  );
};

export default SiteSettingsSetup; 