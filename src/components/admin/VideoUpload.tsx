import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import type { IconBaseProps } from 'react-icons';
import { FaVideo, FaTrash } from 'react-icons/fa6';

interface VideoUploadProps {
  currentVideoPath: string | null;
  onUpload: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
  isLoading?: boolean;
}

const Container = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h3`
  margin: 0 0 20px 0;
  color: #333;
`;

const DropZone = styled.div<{ isDragging: boolean }>`
  border: 2px dashed ${props => props.isDragging ? '#4a90e2' : '#ccc'};
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isDragging ? 'rgba(74, 144, 226, 0.1)' : 'transparent'};

  &:hover {
    border-color: #4a90e2;
    background: rgba(74, 144, 226, 0.05);
  }
`;

const IconContainer = styled.div`
  font-size: 2rem;
  color: #666;
  margin-bottom: 10px;
`;

const Text = styled.p`
  margin: 0;
  color: #666;
`;

const PreviewContainer = styled.div`
  position: relative;
  margin-top: 20px;
`;

const VideoPreview = styled.video`
  width: 100%;
  max-height: 300px;
  border-radius: 4px;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #e74c3c;

  &:hover {
    background: white;
    transform: scale(1.1);
  }
`;

const ProgressContainer = styled.div`
  margin-top: 20px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  width: 100%;
  height: 100%;
  background-color: #4a90e2;
  animation: progressAnimation 2s infinite;
  transform-origin: 0% 50%;

  @keyframes progressAnimation {
    0% {
      transform: scaleX(0);
    }
    50% {
      transform: scaleX(1);
    }
    100% {
      transform: scaleX(0);
    }
  }
`;

const ProgressText = styled.p`
  text-align: center;
  color: #4a90e2;
  margin-top: 8px;
  font-size: 0.875rem;
`;

// Create proper types for the icon components
const VideoIcon = (props: IconBaseProps) => {
  const Icon = FaVideo as React.ComponentType<IconBaseProps>;
  return <Icon {...props} />;
};

const TrashIcon = (props: IconBaseProps) => {
  const Icon = FaTrash as React.ComponentType<IconBaseProps>;
  return <Icon {...props} />;
};

const VideoUpload: React.FC<VideoUploadProps> = ({
  currentVideoPath,
  onUpload,
  onDelete,
  isLoading = false
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      await onUpload(file);
    }
  }, [onUpload]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      await onUpload(file);
    }
  }, [onUpload]);

  return (
    <Container>
      <Title>Hero Background Video</Title>
      {!currentVideoPath ? (
        <>
          <DropZone
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('video-upload')?.click()}
          >
            <IconContainer>
              <VideoIcon size={24} />
            </IconContainer>
            <Text>Drag and drop a video file here, or click to select</Text>
            <Text style={{ fontSize: '0.8rem', marginTop: '5px' }}>
              Supported formats: MP4, WebM, Ogg
            </Text>
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              disabled={isLoading}
            />
          </DropZone>
          {isLoading && (
            <ProgressContainer>
              <ProgressBar>
                <ProgressFill />
              </ProgressBar>
              <ProgressText>Uploading video... Please wait</ProgressText>
            </ProgressContainer>
          )}
        </>
      ) : (
        <PreviewContainer>
          <VideoPreview
            src={currentVideoPath}
            controls
            muted
            loop
            playsInline
          />
          <DeleteButton onClick={onDelete} disabled={isLoading}>
            <TrashIcon size={16} />
          </DeleteButton>
        </PreviewContainer>
      )}
    </Container>
  );
};

export default VideoUpload; 