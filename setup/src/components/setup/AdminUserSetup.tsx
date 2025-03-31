import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Form,
  FormGroup,
  Label,
  LabelText,
  KeyName,
  Input as BaseInput,
  InputContainer,
  Section,
  SectionTitle,
} from './styles';
import styled from 'styled-components';

const Input = styled(BaseInput)`
  width: 90%;
`;

const PasswordToggleButton = styled.button`
  position: absolute;
  right: 10%;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:hover {
    color: var(--primary-color);
  }

  svg {
    width: 20px;
    height: 20px;
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

const ErrorText = styled.span`
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
`;

interface AdminUser {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  _isDefault?: boolean;
}

interface AdminUserSetupProps {
  initialValues: {
    first_name?: string;
    last_name?: string;
    email?: string;
    _isDefault?: boolean;
    password?: string;
  };
  onUpdate: (values: AdminUser) => void;
}

export const AdminUserSetup: React.FC<AdminUserSetupProps> = ({ initialValues, onUpdate }) => {
  const [values, setValues] = useState({
    first_name: initialValues.first_name || '',
    last_name: initialValues.last_name || '',
    email: initialValues.email || '',
    password: initialValues.password || '',
    _isDefault: initialValues._isDefault || false
  });
  const [previousValues, setPreviousValues] = useState(values);
  const [showPassword, setShowPassword] = useState(false);

  // Update from parent
  useEffect(() => {
    setValues(prev => ({
      ...prev,
      first_name: initialValues.first_name || '',
      last_name: initialValues.last_name || '',
      email: initialValues.email || '',
      _isDefault: initialValues._isDefault || false,
      password: prev.password
    }));
  }, [initialValues]);

  const handleChange = (field: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const newValues = { ...values, [field]: newValue };
    setValues(newValues);
    onUpdate(newValues);
  };

  return (
    <div className="space-y-6">
      {values._isDefault && (
        <WarningContainer>
          <WarningText>
            This is a default admin user. Please review and update the information before saving.
          </WarningText>
        </WarningContainer>
      )}
      <div className="space-y-4">
        <Container>
          <Form onSubmit={(e) => e.preventDefault()}>
            <Section>
              <SectionTitle>Admin Account Information</SectionTitle>
              <FormGroup>
                <Label htmlFor="first_name">
                  <LabelText>First Name</LabelText>
                  <KeyName>(first_name)</KeyName>
                </Label>
                <Input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={values.first_name}
                  onChange={handleChange('first_name')}
                  placeholder="Enter first name"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="last_name">
                  <LabelText>Last Name</LabelText>
                  <KeyName>(last_name)</KeyName>
                </Label>
                <Input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={values.last_name}
                  onChange={handleChange('last_name')}
                  placeholder="Enter last name"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="email">
                  <LabelText>Email</LabelText>
                  <KeyName>(email)</KeyName>
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange('email')}
                  placeholder="Enter email address"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="password">
                  <LabelText>Password</LabelText>
                  <KeyName>(password)</KeyName>
                </Label>
                <InputContainer>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={values.password}
                    onChange={handleChange('password')}
                    placeholder="Enter password"
                  />
                  <PasswordToggleButton
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </PasswordToggleButton>
                </InputContainer>
              </FormGroup>
            </Section>
          </Form>
        </Container>
      </div>
    </div>
  );
};

export default AdminUserSetup; 