require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const nodemailer = require('nodemailer');
const svgCaptcha = require('svg-captcha');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3001;

// Configure svg-captcha globally - removing this as we'll set options per request
// svgCaptcha.options.color = false;
// svgCaptcha.options.background = '#ffffff';

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'drenlia-captcha-secret',
  resave: true,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 1000 * 60 * 15, // 15 minutes
    httpOnly: true
  }
}));

// Debug middleware to log session info
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Request: ${req.method} ${req.path}`);
  console.log(`Session ID: ${req.session.id}`);
  console.log(`Session captchaText: ${req.session.captchaText || 'not set'}`);
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP to allow SVG rendering
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://drenlia.com' // Updated to the actual domain
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

// Generate captcha endpoint
app.get('/api/captcha', (req, res) => {
  console.log('Captcha generation request received');
  console.log('- Session ID:', req.session.id);
  
  // Create a captcha with options - simplified configuration
  const captcha = svgCaptcha.create({
    size: 6, // number of characters
    ignoreChars: '0o1il', // characters to exclude
    color: false,
    noise: 2,
    width: 200,
    height: 100,
    fontSize: 60,
    charPreset: 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789' // characters to use
  });
  
  // Store the captcha text in session
  req.session.captchaText = captcha.text;
  console.log('- Generated captcha text:', captcha.text);
  console.log('- SVG data length:', captcha.data.length);
  
  // Set proper headers for SVG
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  
  // Send the SVG image - using original SVG data without modifications
  res.status(200).send(captcha.data);
});

// Alternative captcha endpoint that returns a data URL
app.get('/api/captcha-data-url', (req, res) => {
  console.log('Data URL captcha generation request received');
  console.log('- Session ID:', req.session.id);
  
  // Create a captcha with options - simplified configuration
  const captcha = svgCaptcha.create({
    size: 6,
    ignoreChars: '0o1il',
    color: false,
    noise: 2,
    width: 200,
    height: 100,
    fontSize: 60,
    charPreset: 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  });
  
  // Store the captcha text in session
  req.session.captchaText = captcha.text;
  console.log('- Generated captcha text:', captcha.text);
  
  // Save session explicitly to ensure it's stored
  req.session.save(err => {
    if (err) {
      console.error('Error saving session:', err);
    }
    
    // Convert SVG to data URL - using original SVG data without modifications
    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(captcha.data).toString('base64')}`;
    
    // Send the data URL as JSON
    res.json({ 
      dataUrl,
      width: 200,
      height: 100
    });
  });
});

// Verify captcha endpoint
app.post('/api/verify-captcha', (req, res) => {
  const { captchaInput } = req.body;
  
  console.log('Captcha verification request received:');
  console.log('- Input:', captchaInput);
  console.log('- Session captcha text:', req.session.captchaText);
  console.log('- Session ID:', req.session.id);
  
  // Check if captcha text exists in session
  if (!req.session.captchaText) {
    console.log('Captcha text not found in session');
    return res.status(400).json({ 
      success: false, 
      message: 'Captcha expired. Please refresh and try again.' 
    });
  }
  
  // Trim and normalize both inputs for comparison
  const normalizedInput = (captchaInput || '').trim().toLowerCase();
  const normalizedCaptcha = (req.session.captchaText || '').trim().toLowerCase();
  
  console.log('Normalized input:', normalizedInput);
  console.log('Normalized captcha:', normalizedCaptcha);
  
  // Case-insensitive comparison
  const isValid = normalizedInput === normalizedCaptcha;
  console.log('Captcha validation result:', isValid);
  
  if (isValid) {
    // Set a flag in session indicating captcha is verified
    req.session.captchaVerified = true;
    
    // Save session explicitly
    req.session.save(err => {
      if (err) {
        console.error('Error saving session after verification:', err);
      }
      res.status(200).json({ success: true });
    });
  } else {
    res.status(200).json({ 
      success: false, 
      message: 'Incorrect captcha. Please try again.' 
    });
  }
});

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  // Check if captcha was verified
  if (!req.session.captchaVerified) {
    return res.status(403).json({ 
      success: false, 
      message: 'Please complete the captcha verification first.' 
    });
  }
  
  try {
    const { name, email, subject, message } = req.body;
    
    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and message' });
    }
    
    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      replyTo: email,
      subject: subject || `New message from ${name} via Drenlia website`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage: ${message}`,
      html: `
        <h3>Drenlia Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    // Reset captcha verification after successful submission
    req.session.captchaVerified = false;
    
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error.message);
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 