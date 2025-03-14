# Drenlia Email Service

This is a simple Node.js server that handles email sending for the Drenlia website contact form.

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the server directory with the following variables:

```
# Server Configuration
PORT=3001

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-gmail-address@gmail.com
EMAIL_TO=recipient@example.com
```

### 3. Gmail App Password Setup

For security reasons, Gmail requires you to use an "App Password" instead of your regular password:

1. Go to your Google Account settings: https://myaccount.google.com/
2. Enable 2-Step Verification if you haven't already
3. Go to "Security" > "App passwords"
4. Select "Mail" as the app and "Other" as the device (name it "Drenlia Website")
5. Click "Generate" and copy the 16-character password
6. Paste this password as the `EMAIL_PASS` in your `.env` file

### 4. Start the Server

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

## Security Considerations

- Never commit your `.env` file to version control
- In production, use environment variables set on your hosting platform
- Consider using a dedicated email service like SendGrid or Mailgun for production
- Update CORS settings in `server.js` to match your production domain

## API Endpoints

- `POST /api/send-email`: Sends an email from the contact form
- `GET /api/health`: Health check endpoint 