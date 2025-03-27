export interface FileValidationOptions {
  maxSizeInMB?: number;
  allowedTypes?: string[];
}

export interface FileUploadResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a file based on size and type
 * @param file The file to validate
 * @param options Validation options including max size and allowed types
 * @returns Validation result with error message if invalid
 */
export const validateFile = (file: File, options: FileValidationOptions = {}): FileValidationResult => {
  const {
    maxSizeInMB = 5,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  } = options;

  // Validate file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  // Validate file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeInMB}MB`
    };
  }

  return { isValid: true };
};

/**
 * Generic file upload handler with validation
 * @param file The file to upload
 * @param uploadFn The function that performs the actual upload
 * @param options Validation options
 * @returns Upload result with data or error
 */
export const handleFileUpload = async <T>(
  file: File,
  uploadFn: (file: File) => Promise<T>,
  options: FileValidationOptions = {}
): Promise<FileUploadResult<T>> => {
  try {
    // Validate file
    const validationResult = validateFile(file, options);
    if (!validationResult.isValid) {
      return {
        success: false,
        error: validationResult.error
      };
    }

    // Perform upload
    const result = await uploadFn(file);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: 'Failed to upload file. Please try again.'
    };
  }
};

/**
 * Creates a FormData object with a file
 * @param file The file to include in FormData
 * @param fieldName The name of the file field
 * @param additionalData Additional data to include in FormData
 * @returns FormData object
 */
export const createFileFormData = (
  file: File,
  fieldName: string = 'file',
  additionalData: Record<string, any> = {}
): FormData => {
  const formData = new FormData();
  formData.append(fieldName, file);

  // Add any additional data
  Object.entries(additionalData).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return formData;
};

/**
 * Handles drag and drop events for file uploads
 * @param event The drag event
 * @param callback Function to call with the file when dropped
 */
export const handleFileDrop = (
  event: React.DragEvent<HTMLElement>,
  callback: (file: File) => void
): void => {
  event.preventDefault();
  event.stopPropagation();

  const file = event.dataTransfer.files?.[0];
  if (file) {
    callback(file);
  }
};

/**
 * Prevents default behavior for drag over events
 * @param event The drag event
 */
export const handleFileDragOver = (event: React.DragEvent<HTMLElement>): void => {
  event.preventDefault();
  event.stopPropagation();
}; 