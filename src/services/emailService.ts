interface EmailData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

interface EmailResponse {
  success: boolean;
  message: string;
}

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://yourdomain.com/api' // Replace with your production API URL
  : 'http://localhost:3001/api';

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