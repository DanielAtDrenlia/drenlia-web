import { useState, useRef, RefObject } from 'react';
import { FileValidationOptions, handleFileUpload, handleFileDrop, handleFileDragOver } from '../utils/fileUpload';

interface UseFileUploadOptions<T> extends FileValidationOptions {
  onUploadSuccess?: (result: T) => void;
  onUploadError?: (error: string) => void;
}

interface UseFileUploadResult {
  uploading: boolean;
  error: string | null;
  fileInputRef: RefObject<HTMLInputElement>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleDrop: (e: React.DragEvent<HTMLElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLElement>) => void;
  reset: () => void;
}

/**
 * Custom hook for handling file uploads with validation and drag-and-drop support
 * @param uploadFn Function that performs the actual upload
 * @param options Upload and validation options
 * @returns Object containing upload state and handler functions
 */
export const useFileUpload = <T extends { success: boolean }>(
  uploadFn: (file: File) => Promise<T>,
  options: UseFileUploadOptions<T> = {}
): UseFileUploadResult => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;

  const {
    onUploadSuccess,
    onUploadError,
    ...validationOptions
  } = options;

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);

    const result = await handleFileUpload(file, uploadFn, validationOptions);

    if (result.success && result.data) {
      onUploadSuccess?.(result.data as T);
    } else if (!result.success && result.error) {
      setError(result.error);
      onUploadError?.(result.error);
    }

    setUploading(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    handleFileDrop(e, handleUpload);
  };

  const reset = () => {
    setError(null);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    uploading,
    error,
    fileInputRef,
    handleFileSelect,
    handleDrop,
    handleDragOver: handleFileDragOver,
    reset
  };
}; 