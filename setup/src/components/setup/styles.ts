import styled from 'styled-components';

export const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const FormGroup = styled.div`
  display: grid;
  grid-template-columns: minmax(150px, 1fr) minmax(300px, 2fr);
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

export const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const LabelText = styled.span`
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
  text-transform: capitalize;
`;

export const KeyName = styled.span`
  font-size: 0.75rem;
  color: #64748b;
  font-family: monospace;
`;

export const Input = styled.input`
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

export const Button = styled.button`
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

export const IconButton = styled.button`
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

export const InputContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
`;

export const Section = styled.div`
  margin-bottom: 2rem;
`;

export const SectionTitle = styled.h3`
  font-size: 1.1rem;
  color: #1e293b;
  margin-bottom: 1rem;
  font-weight: 600;
`;

export const Divider = styled.div`
  height: 1px;
  background-color: #e2e8f0;
  margin: 1rem 0;
`;

export const PasswordToggle = styled(IconButton)`
  &:hover {
    background-color: #e2e8f0;
    border-color: #cbd5e1;
    color: #475569;
  }
`; 