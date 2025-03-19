interface EmailData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

interface EmailResponse {
  success: boolean;
  message: string;
  captchaError?: boolean;
}

export const API_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production'
    ? '/api' // Default to relative path in production
    : 'http://localhost:3011/api'); // Fallback for development

/**
 * Send an email through the backend API
 */
export const sendEmail = async (data: EmailData): Promise<EmailResponse> => {
  try {
    const response = await fetch(`${API_URL}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });

    const result = await response.json();
    
    if (!response.ok) {
      // Check if this is a captcha verification error (403 status)
      if (response.status === 403) {
        return {
          success: false,
          message: result.message || 'Captcha verification required',
          captchaError: true
        };
      }
      
      throw new Error(result.message || 'Failed to send email');
    }
    
    return result;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};

/**
 * Check if the email service is available
 */
export const checkEmailService = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/health`, {
      credentials: 'include'
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
}; 