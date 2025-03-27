import React, { useState } from 'react';
import styled from 'styled-components';
import FrontendEnvSetup from './components/FrontendEnvSetup';
import BackendEnvSetup from './components/BackendEnvSetup';
import AdminUserSetup from './components/AdminUserSetup';
import SiteSettingsSetup from './components/SiteSettingsSetup';

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 2rem;
  text-align: center;
`;

const Stepper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: #e0e0e0;
    z-index: 1;
  }
`;

const Step = styled.div<{ active: boolean; completed: boolean }>`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`;

const StepCircle = styled.div<{ active: boolean; completed: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.active ? 'var(--primary-color)' : props.completed ? 'var(--accent-color)' : '#e0e0e0'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const StepLabel = styled.span<{ active: boolean; completed: boolean }>`
  color: ${props => props.active ? 'var(--primary-color)' : props.completed ? 'var(--accent-color)' : '#666'};
  font-weight: ${props => props.active ? '600' : '400'};
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;

  ${props => props.variant === 'primary' ? `
    background: var(--primary-color);
    color: white;
    &:hover {
      background: var(--primary-color-dark);
    }
  ` : `
    background: #e0e0e0;
    color: #333;
    &:hover {
      background: #d0d0d0;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const steps = [
  'Frontend Environment',
  'Backend Environment',
  'Admin User',
  'Site Settings'
];

const SetupPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [frontendEnv, setFrontendEnv] = useState({});
  const [backendEnv, setBackendEnv] = useState({});
  const [adminUser, setAdminUser] = useState({});
  const [siteSettings, setSiteSettings] = useState({});

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSave = async () => {
    try {
      // TODO: Implement save functionality
      console.log('Saving setup data:', {
        frontendEnv,
        backendEnv,
        adminUser,
        siteSettings
      });
    } catch (error) {
      console.error('Error saving setup:', error);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <FrontendEnvSetup onUpdate={setFrontendEnv} />;
      case 1:
        return <BackendEnvSetup onUpdate={setBackendEnv} />;
      case 2:
        return <AdminUserSetup onUpdate={setAdminUser} />;
      case 3:
        return <SiteSettingsSetup onUpdate={setSiteSettings} />;
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container>
      <Title>System Setup</Title>
      <Stepper>
        {steps.map((label, index) => (
          <Step key={label} active={index === activeStep} completed={index < activeStep}>
            <StepCircle active={index === activeStep} completed={index < activeStep}>
              {index + 1}
            </StepCircle>
            <StepLabel active={index === activeStep} completed={index < activeStep}>
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      {getStepContent(activeStep)}
      <ButtonContainer>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button variant="primary" onClick={handleSave}>
            Save All
          </Button>
        ) : (
          <Button variant="primary" onClick={handleNext}>
            Next
          </Button>
        )}
      </ButtonContainer>
    </Container>
  );
};

export default SetupPage; 