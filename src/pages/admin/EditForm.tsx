import React, { useState } from 'react';
import styled from 'styled-components';
import { translateText } from '../../services/apiService';

interface AboutSection {
  _id: string;
  title: string;
  description: string;
  fr_title: string | null;
  fr_description: string | null;
  order: number;
}

interface EditFormProps {
  section: AboutSection;
  onSave: (section: AboutSection) => void;
  onCancel: () => void;
}

const EditForm: React.FC<EditFormProps> = ({ section, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: section.title,
    description: section.description,
    fr_title: section.fr_title || '',
    fr_description: section.fr_description || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTranslate = async (field: 'title' | 'description') => {
    try {
      const textToTranslate = field === 'title' ? formData.title : formData.description;
      if (!textToTranslate) return;

      const translatedText = await translateText(textToTranslate);
      setFormData(prev => ({
        ...prev,
        [field === 'title' ? 'fr_title' : 'fr_description']: translatedText,
      }));
    } catch (error) {
      console.error('Translation error:', error);
      // Handle error (e.g., show notification)
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...section,
      title: formData.title,
      description: formData.description,
      fr_title: formData.fr_title || null,
      fr_description: formData.fr_description || null,
    });
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormGroup>
        <Label>Title:</Label>
        <Input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </FormGroup>
      <FormGroup>
        <Label>French Title:</Label>
        <InputGroup>
          <Input
            type="text"
            name="fr_title"
            value={formData.fr_title}
            onChange={handleChange}
          />
          <TranslateButton type="button" onClick={() => handleTranslate('title')}>
            Translate
          </TranslateButton>
        </InputGroup>
      </FormGroup>
      <FormGroup>
        <Label>Description:</Label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </FormGroup>
      <FormGroup>
        <Label>French Description:</Label>
        <InputGroup>
          <Textarea
            name="fr_description"
            value={formData.fr_description}
            onChange={handleChange}
          />
          <TranslateButton type="button" onClick={() => handleTranslate('description')}>
            Translate
          </TranslateButton>
        </InputGroup>
      </FormGroup>
      <ButtonGroup>
        <SaveButton type="submit">Save</SaveButton>
        <CancelButton type="button" onClick={onCancel}>Cancel</CancelButton>
      </ButtonGroup>
    </FormContainer>
  );
};

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Textarea = styled.textarea`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-height: 100px;
  resize: vertical;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
`;

const SaveButton = styled(Button)`
  background-color: #4caf50;
  color: white;
  &:hover {
    background-color: #45a049;
  }
`;

const CancelButton = styled(Button)`
  background-color: #f44336;
  color: white;
  &:hover {
    background-color: #da190b;
  }
`;

const TranslateButton = styled(Button)`
  background-color: #2196f3;
  color: white;
  &:hover {
    background-color: #0b7dda;
  }
`;

export default EditForm; 