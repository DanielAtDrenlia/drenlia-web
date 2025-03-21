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
} from './styles';
import styled from 'styled-components';

const PasswordToggleButton = styled.button`
  position: absolute;
  right: 10px;
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

interface AdminUser {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

interface AdminUserSetupProps {
  initialValues: {
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    _isDefault?: boolean;
  };
  onUpdate: (values: AdminUser) => void;
}

export const AdminUserSetup: React.FC<AdminUserSetupProps> = ({ initialValues, onUpdate }) => {
  const [values, setValues] = useState<AdminUser>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [previousValues, setPreviousValues] = useState<AdminUser>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setValues(prev => ({
        ...prev,
        first_name: initialValues.first_name || '',
        last_name: initialValues.last_name || '',
        email: initialValues.email || '',
        password: '',
        confirm_password: ''
      }));
      setPreviousValues(prev => ({
        ...prev,
        first_name: initialValues.first_name || '',
        last_name: initialValues.last_name || '',
        email: initialValues.email || '',
        password: '',
        confirm_password: ''
      }));
      setIsDefault(initialValues._isDefault || false);
    }
  }, [initialValues]);

  const handleChange = (field: keyof AdminUser) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValues(prev => ({ ...prev, [field]: newValue }));
  };

  const handleBlur = (field: keyof AdminUser) => () => {
    if (values[field] !== previousValues[field]) {
      onUpdate(values);
      setPreviousValues(values);
    }
  };

  const handleKeyDown = (field: keyof AdminUser) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setValues(prev => ({ ...prev, [field]: previousValues[field] }));
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Enter') {
      const inputs = Array.from(document.querySelectorAll('input'));
      const currentIndex = inputs.indexOf(e.target as HTMLInputElement);
      const nextInput = inputs[currentIndex + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  return (
    <div className="space-y-6">
      {isDefault && (
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
              <SectionTitle>Personal Information</SectionTitle>
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
                  onBlur={handleBlur('first_name')}
                  onKeyDown={handleKeyDown('first_name')}
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
                  onBlur={handleBlur('last_name')}
                  onKeyDown={handleKeyDown('last_name')}
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
                  onBlur={handleBlur('email')}
                  onKeyDown={handleKeyDown('email')}
                  placeholder="Enter email address"
                />
              </FormGroup>
            </Section>

            <Section>
              <SectionTitle>Password</SectionTitle>
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
                    onBlur={handleBlur('password')}
                    onKeyDown={handleKeyDown('password')}
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
              <FormGroup>
                <Label htmlFor="confirm_password">
                  <LabelText>Confirm Password</LabelText>
                  <KeyName>(confirm_password)</KeyName>
                </Label>
                <InputContainer>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirm_password"
                    name="confirm_password"
                    value={values.confirm_password}
                    onChange={handleChange('confirm_password')}
                    onBlur={handleBlur('confirm_password')}
                    onKeyDown={handleKeyDown('confirm_password')}
                    placeholder="Confirm password"
                  />
                  <PasswordToggleButton
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
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