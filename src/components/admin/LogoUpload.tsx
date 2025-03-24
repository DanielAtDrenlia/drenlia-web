import React, { useState } from 'react';
import styled from 'styled-components';
import InitialsAvatar from '../../components/InitialsAvatar';

const Container = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
`;

const UploadArea = styled.div`
  border: 2px dashed #e2e8f0;
  border-radius: 6px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #3b82f6;
    background-color: #f8fafc;
  }
`;

const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const PreviewImage = styled.img`
  max-width: 200px;
  max-height: 100px;
  object-fit: contain;
`;

const UploadText = styled.p`
  color: #64748b;
  margin-bottom: 0.5rem;
`;

const FileInput = styled.input`
  display: none;
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

interface LogoUploadProps {
  currentLogoPath: string;
  siteName: string;
  onUpload: (file: File) => Promise<void>;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ currentLogoPath, siteName, onUpload }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoPath || null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);

      // Upload file
      await onUpload(file);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload logo. Please try again.';
      setError(errorMessage);
      console.error('Error uploading logo:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const isGeneratedLogo = (path: string): boolean => {
    return path.includes('/images/logo/logo-');
  };

  return (
    <Container>
      <Title>Site Logo</Title>
      <UploadArea>
        <label htmlFor="logo-upload">
          <PreviewContainer>
            {previewUrl ? (
              isGeneratedLogo(previewUrl) ? (
                <InitialsAvatar name={siteName} size={100} />
              ) : (
                <PreviewImage src={previewUrl} alt="Site logo" />
              )
            ) : (
              <InitialsAvatar name={siteName} size={100} />
            )}
            <UploadText>Click to upload a logo or generate one from site name</UploadText>
          </PreviewContainer>
          <FileInput
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </UploadArea>
    </Container>
  );
};

export default LogoUpload; 