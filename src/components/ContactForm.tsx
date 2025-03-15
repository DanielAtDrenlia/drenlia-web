import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { sendEmail, checkEmailService } from '../services/emailService';

const FormContainer = styled.div`
  width: 100%;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
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
  transition: border-color 0.3s ease;
  
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
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
  }
`;

const SubmitButton = styled.button`
  background-color: var(--accent-color);
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  
  &:hover {
    background-color: #c0392b;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const Message = styled.div<{ type: 'success' | 'error' }>`
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  background-color: ${props => props.type === 'success' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.type === 'success' ? '#155724' : '#721c24'};
  border: 1px solid ${props => props.type === 'success' ? '#c3e6cb' : '#f5c6cb'};
`;

const ServiceStatus = styled.div<{ available: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: ${props => props.available ? '#155724' : '#721c24'};
  margin-top: 1rem;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props => props.available ? '#28a745' : '#dc3545'};
  }
`;

interface ContactFormProps {
  captchaValid?: boolean;
  onCaptchaError?: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ 
  captchaValid = true,
  onCaptchaError = () => {}
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [serviceAvailable, setServiceAvailable] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkService = async () => {
      try {
        const available = await checkEmailService();
        setServiceAvailable(available);
      } catch (error) {
        setServiceAvailable(false);
      }
    };
    
    checkService();
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      setFormMessage({
        text: 'Please fill out all required fields.',
        type: 'error'
      });
      return;
    }
    
    if (!captchaValid) {
      setFormMessage({
        text: 'Please complete the captcha verification.',
        type: 'error'
      });
      return;
    }
    
    setIsSubmitting(true);
    setFormMessage(null);
    
    try {
      const result = await sendEmail(formData);
      
      if (result.success) {
        setFormMessage({
          text: 'Your message has been sent successfully! We will get back to you soon.',
          type: 'success'
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        
        // Reset captcha if there's an error handler
        if (onCaptchaError) {
          onCaptchaError();
        }
      } else {
        if (result.captchaError && onCaptchaError) {
          onCaptchaError();
        }
        
        setFormMessage({
          text: result.message || 'Failed to send message. Please try again.',
          type: 'error'
        });
      }
    } catch (error) {
      setFormMessage({
        text: 'An error occurred. Please try again later.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <FormContainer>
      {formMessage && (
        <Message type={formMessage.type}>
          {formMessage.text}
        </Message>
      )}
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="name">Name *</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="email">Email *</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="subject">Subject</Label>
          <Input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="message">Message *</Label>
          <TextArea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
          />
        </FormGroup>
        
        <SubmitButton 
          type="submit" 
          disabled={isSubmitting || serviceAvailable === false || !captchaValid}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </SubmitButton>
      </Form>
      
      {serviceAvailable !== null && (
        <ServiceStatus available={serviceAvailable}>
          {serviceAvailable 
            ? 'Email service is available' 
            : 'Email service is currently unavailable'
          }
        </ServiceStatus>
      )}
    </FormContainer>
  );
};

export default ContactForm; 