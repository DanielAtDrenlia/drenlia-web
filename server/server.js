require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const nodemailer = require('nodemailer');
const svgCaptcha = require('svg-captcha');
const session = require('express-session');
const passport = require('passport');
const db = require('./db');
const auth = require('./auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createCanvas } = require('canvas');
const translateRouter = require('./routes/translate');

const app = express();
const PORT = process.env.PORT || 3011;

// Trust proxy headers - this is important for correct URL construction behind proxies
app.set('trust proxy', true);

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
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    httpOnly: true
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Debug middleware to log session info
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Request: ${req.method} ${req.path}`);
  console.log(`Session ID: ${req.session.id}`);
  console.log(`Session captchaText: ${req.session.captchaText || 'not set'}`);
  console.log(`Authenticated: ${req.isAuthenticated()}`);
  if (req.isAuthenticated()) {
    console.log(`User: ${req.user.email} (Admin: ${req.user.admin ? 'Yes' : 'No'})`);
  }
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP to allow SVG rendering
}));
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'https://drenlia.com',
      'https://dev.drenlia.com',
      'http://localhost:3010'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// Configure multer for file uploads
const teamImagesDir = path.join(__dirname, '../public/images/team');
const aboutImagesDir = path.join(__dirname, '../public/images/about');

// Ensure the directories exist
if (!fs.existsSync(teamImagesDir)) {
  fs.mkdirSync(teamImagesDir, { recursive: true });
}
if (!fs.existsSync(aboutImagesDir)) {
  fs.mkdirSync(aboutImagesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine the destination directory based on the route
    if (req.originalUrl.includes('/upload/team-image')) {
      cb(null, teamImagesDir);
    } else if (req.originalUrl.includes('/upload/about-image')) {
      cb(null, aboutImagesDir);
    } else {
      // Default to team images directory
      cb(null, teamImagesDir);
    }
  },
  filename: function (req, file, cb) {
    // Get file extension
    const ext = path.extname(file.originalname).toLowerCase();
    // Create a unique filename with timestamp
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Debug route to check request information
app.get('/api/debug', (req, res) => {
  const protocol = req.protocol;
  const host = req.get('host');
  const originalUrl = req.originalUrl;
  const fullUrl = `${protocol}://${host}${originalUrl}`;
  
  res.json({
    protocol,
    host,
    originalUrl,
    fullUrl,
    headers: req.headers,
    'x-forwarded-host': req.get('x-forwarded-host'),
    'x-forwarded-proto': req.get('x-forwarded-proto')
  });
});

// Authentication routes
app.get('/api/auth/google', (req, res, next) => {
  // Log the request information
  console.log('Google auth request:');
  console.log('- Protocol:', req.protocol);
  console.log('- Host:', req.get('host'));
  console.log('- Original URL:', req.originalUrl);
  console.log('- Full URL:', `${req.protocol}://${req.get('host')}${req.originalUrl}`);
  console.log('- Headers:', JSON.stringify(req.headers, null, 2));
  
  // Continue with authentication
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

app.get('/api/auth/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/admin/login',
    session: true
  }),
  (req, res) => {
    // Get the frontend URL based on the request
    let frontendUrl;
    
    // Check if we're behind a proxy
    if (req.headers['x-forwarded-host']) {
      // Use the protocol and host from the forwarded headers
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      frontendUrl = `${protocol}://${req.headers['x-forwarded-host']}`;
    } else if (process.env.FRONTEND_URL) {
      // Use the configured frontend URL
      frontendUrl = process.env.FRONTEND_URL;
    } else {
      // Default to localhost:3010 in development
      frontendUrl = 'http://localhost:3010';
    }
    
    console.log(`Redirecting to: ${frontendUrl}/admin`);
    
    // Successful authentication, redirect to admin page with absolute URL
    res.redirect(`${frontendUrl}/admin`);
  }
);

app.get('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).json({ success: false, message: 'Error during logout' });
    }
    res.json({ success: true });
  });
});

app.get('/api/auth/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        id: req.user.user_id,
        email: req.user.email,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        isAdmin: !!req.user.admin
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Admin routes
app.get('/api/admin/users', auth.isAdmin, (req, res) => {
  try {
    const users = db.users.getAllUsers();
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

// Create a new user
app.post('/api/admin/users', auth.isAdmin, (req, res) => {
  try {
    const { first_name, last_name, email, admin } = req.body;
    
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ success: false, message: 'First name, last name, and email are required' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    
    try {
      const id = db.users.createUser({
        first_name,
        last_name,
        email,
        admin: !!admin
      });
      
      res.json({ success: true, id });
    } catch (err) {
      if (err.message.includes('already exists')) {
        return res.status(400).json({ success: false, message: err.message });
      }
      throw err;
    }
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Error creating user' });
  }
});

// Update a user
app.put('/api/admin/users/:id', auth.isAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { first_name, last_name, email, admin } = req.body;
    
    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
      }
    }
    
    try {
      const success = db.users.updateUser(id, {
        first_name,
        last_name,
        email,
        admin: admin !== undefined ? !!admin : undefined
      });
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ success: false, message: 'User not found' });
      }
    } catch (err) {
      if (err.message.includes('already in use')) {
        return res.status(400).json({ success: false, message: err.message });
      }
      throw err;
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Error updating user' });
  }
});

// Delete a user
app.delete('/api/admin/users/:id', auth.isAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Prevent deleting the current user
    if (req.user.user_id === id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    
    const success = db.users.deleteUser(id);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
});

// Toggle admin status
app.put('/api/admin/users/:id/admin', auth.isAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { admin } = req.body;
    
    if (admin === undefined) {
      return res.status(400).json({ success: false, message: 'Admin status is required' });
    }
    
    // Prevent removing admin status from the current user
    if (req.user.user_id === id && !admin) {
      return res.status(400).json({ success: false, message: 'Cannot remove admin status from your own account' });
    }
    
    const success = db.users.toggleAdminStatus(id, !!admin);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user admin status:', error);
    res.status(500).json({ success: false, message: 'Error updating user admin status' });
  }
});

// About routes
app.get('/api/about', (req, res) => {
  try {
    const sections = db.about.getAllSections();
    res.json({ success: true, sections });
  } catch (error) {
    console.error('Error fetching about sections:', error);
    res.status(500).json({ success: false, message: 'Error fetching about sections' });
  }
});

app.post('/api/admin/about', auth.isAdmin, (req, res) => {
  try {
    const { title, fr_title, description, fr_description, image_url, display_order } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }
    
    const id = db.about.createSection({
      title,
      fr_title: fr_title || null,
      description,
      fr_description: fr_description || null,
      image_url: image_url || null,
      display_order: display_order || 0
    });
    
    res.json({ success: true, id });
  } catch (error) {
    console.error('Error creating about section:', error);
    res.status(500).json({ success: false, message: 'Error creating about section' });
  }
});

// New endpoint for batch updating about section orders
app.put('/api/admin/about/reorder', auth.isAdmin, (req, res) => {
  try {
    const { sections } = req.body;
    
    if (!Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ success: false, message: 'Sections array is required' });
    }
    
    // Update all sections in a transaction
    const success = db.about.updateSectionOrders(sections);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, message: 'Failed to update section orders' });
    }
  } catch (error) {
    console.error('Error updating about section orders:', error);
    res.status(500).json({ success: false, message: 'Error updating about section orders' });
  }
});

app.put('/api/admin/about/:id', auth.isAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, fr_title, description, fr_description, image_url, display_order } = req.body;
    
    const success = db.about.updateSection(id, {
      title,
      fr_title,
      description,
      fr_description,
      image_url,
      display_order
    });
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Section not found' });
    }
  } catch (error) {
    console.error('Error updating about section:', error);
    res.status(500).json({ success: false, message: 'Error updating about section' });
  }
});

app.delete('/api/admin/about/:id', auth.isAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = db.about.deleteSection(id);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Section not found' });
    }
  } catch (error) {
    console.error('Error deleting about section:', error);
    res.status(500).json({ success: false, message: 'Error deleting about section' });
  }
});

// Function to generate letter avatar
const generateLetterAvatar = (name, size = 200) => {
  // Extract initials from name
  const initials = name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2); // Get at most 2 initials

  // Create canvas
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Define colors - pastel colors that work well with dark text
  const colors = [
    '#F4BFBF', // light pink
    '#FFD9C0', // peach
    '#FAF0D7', // cream
    '#8CC0DE', // light blue
    '#CCCCFF', // lavender
    '#D8F8B7', // light green
    '#FF9999', // salmon
    '#FFDAB9', // peachpuff
    '#B0E0E6', // powderblue
    '#FFC0CB', // pink
  ];

  // Get a consistent color based on the name
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const bgColor = colors[colorIndex];

  // Draw background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  // Draw text
  ctx.fillStyle = '#333333'; // Dark text for contrast
  ctx.font = `bold ${size / 2}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, size / 2, size / 2);

  return canvas.toBuffer('image/png');
};

// Team routes
app.get('/api/team', (req, res) => {
  try {
    const members = db.team.getAllMembers();
    res.json({ success: true, members });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ success: false, message: 'Error fetching team members' });
  }
});

app.post('/api/admin/team', auth.isAdmin, (req, res) => {
  try {
    const { name, title, bio, image_url, display_order } = req.body;
    
    if (!name || !title) {
      return res.status(400).json({ success: false, message: 'Name and title are required' });
    }
    
    // If no image_url is provided, generate a letter avatar
    let finalImageUrl = image_url;
    if (!finalImageUrl) {
      // Generate a unique filename
      const filename = `avatar-${Date.now()}-${Math.round(Math.random() * 1E9)}.png`;
      const avatarPath = path.join(teamImagesDir, filename);
      
      // Generate and save the avatar
      const avatarBuffer = generateLetterAvatar(name);
      fs.writeFileSync(avatarPath, avatarBuffer);
      
      // Set the image URL to the generated avatar
      finalImageUrl = `/images/team/${filename}`;
    }
    
    const id = db.team.createMember({
      name,
      title,
      bio,
      image_url: finalImageUrl,
      display_order: display_order || 0
    });
    
    res.json({ success: true, id });
  } catch (error) {
    console.error('Error creating team member:', error);
    res.status(500).json({ success: false, message: 'Error creating team member' });
  }
});

app.put('/api/admin/team/:id', auth.isAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, title, bio, image_url, display_order, fr_title, fr_bio } = req.body;
    
    if (!name || !title) {
      return res.status(400).json({ success: false, message: 'Name and title are required' });
    }
    
    // Get the current member to check if we need to generate an avatar
    const currentMember = db.team.getMemberById(id);
    
    // If no image_url is provided and there wasn't one before (or name changed), generate a letter avatar
    let finalImageUrl = image_url;
    if (!finalImageUrl && (!currentMember.image_url || currentMember.name !== name)) {
      // Generate a unique filename
      const filename = `avatar-${Date.now()}-${Math.round(Math.random() * 1E9)}.png`;
      const avatarPath = path.join(teamImagesDir, filename);
      
      // Generate and save the avatar
      const avatarBuffer = generateLetterAvatar(name);
      fs.writeFileSync(avatarPath, avatarBuffer);
      
      // Set the image URL to the generated avatar
      finalImageUrl = `/images/team/${filename}`;
    } else if (!finalImageUrl && currentMember.image_url) {
      // Keep the existing image if there is one
      finalImageUrl = currentMember.image_url;
    }
    
    const success = db.team.updateMember(id, {
      name,
      title,
      bio,
      image_url: finalImageUrl,
      display_order: display_order || 0,
      fr_title,
      fr_bio
    });
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Team member not found' });
    }
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ success: false, message: 'Error updating team member' });
  }
});

app.delete('/api/admin/team/:id', auth.isAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = db.team.deleteMember(id);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Team member not found' });
    }
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ success: false, message: 'Error deleting team member' });
  }
});

// File upload endpoint for team member profile pictures
app.post('/api/admin/upload/team-image', auth.isAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Return the path to the uploaded file (relative to public directory)
    const imagePath = `/images/team/${req.file.filename}`;
    
    res.json({ 
      success: true, 
      imagePath: imagePath
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ success: false, message: 'Error uploading file' });
  }
});

// File upload endpoint for about section images
app.post('/api/admin/upload/about-image', auth.isAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Move the file to the about images directory
    const oldPath = req.file.path;
    const filename = req.file.filename;
    const newPath = path.join(aboutImagesDir, filename);
    
    fs.renameSync(oldPath, newPath);
    
    // Return the path to the uploaded file (relative to public directory)
    const imagePath = `/images/about/${filename}`;
    
    res.json({ 
      success: true, 
      imagePath: imagePath
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ success: false, message: 'Error uploading file' });
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
  res.status(200).json({ 
    status: 'ok',
    version: db.settings.getSetting('version') || '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Close database connection when server is shutting down
process.on('SIGINT', () => {
  console.log('Closing database connection...');
  db.closeDb();
  process.exit(0);
});

// Routes
app.use('/api/translate', translateRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 