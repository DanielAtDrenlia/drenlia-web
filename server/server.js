// Custom dotenv config to handle comments and empty lines
const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

// Load and parse .env file manually
try {
  const envPath = path.join(__dirname, '.env');
  const envConfig = fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(line => line.trim() && !line.trim().startsWith('#'))  // Remove empty lines and comments
    .join('\n');
  
  const parsedConfig = dotenv.parse(envConfig);
  
  // Set environment variables
  for (const k in parsedConfig) {
    process.env[k] = parsedConfig[k];
  }
} catch (error) {
  console.warn('Warning: .env file not found or has invalid format:', error);
}

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
const fsPromises = require('fs').promises;
const { createCanvas } = require('canvas');
const translateRouter = require('./routes/translate');
const { generateLetterAvatar } = require('./utils/avatarGenerator');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10; // Number of salt rounds for bcrypt

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
  resave: false,
  saveUninitialized: false,
  rolling: true,
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

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP to allow SVG rendering
}));

// CORS configuration
const corsOptions = {
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3010,http://localhost:5173').split(','),
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Configure multer for file upload
const logoImagesDir = path.join(__dirname, '../public/images/logo');

// Ensure the logo directory exists
if (!fs.existsSync(logoImagesDir)) {
  fs.mkdirSync(logoImagesDir, { recursive: true });
}

const logoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, logoImagesDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'logo.png');
  }
});

const logoUpload = multer({
  storage: logoStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
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
  // Store the return URL in the session if provided
  if (req.query.returnTo) {
    const decodedReturnTo = decodeURIComponent(req.query.returnTo);
    req.session.returnTo = decodedReturnTo;
  }
  
  // Save the session before continuing with authentication
  req.session.save((err) => {
    if (err) {
      console.error('Error saving session:', err);
    }
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  });
});

app.get('/api/auth/google/callback', 
  (req, res, next) => {
    // Store returnTo URL before authentication
    const returnTo = req.session.returnTo;
    passport.authenticate('google', { 
      failureRedirect: '/admin/login',
      session: true
    })(req, res, (err) => {
      if (err) { return next(err); }
      
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
      
      // Use the stored returnTo URL or default to /admin
      const finalReturnTo = returnTo || '/admin';
      
      // Ensure the return URL starts with a forward slash
      const normalizedReturnTo = finalReturnTo.startsWith('/') ? finalReturnTo : `/${finalReturnTo}`;
      const finalUrl = `${frontendUrl}${normalizedReturnTo}`;
      
      // Redirect to the stored return URL or default to admin page
      res.redirect(finalUrl);
    });
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

// Move the local login endpoint here, before other routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Get user by email
    const user = db.users.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user has a password (is a local account)
    if (!user.password_hash) {
      return res.status(401).json({
        success: false,
        message: 'This account uses Google authentication'
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Set user in session using Passport
    req.login(user, (err) => {
      if (err) {
        console.error('Error logging in user:', err);
        return res.status(500).json({
          success: false,
          message: 'Error during login'
        });
      }

      // Save session before sending response
      req.session.save((err) => {
        if (err) {
          console.error('Error saving session:', err);
          return res.status(500).json({
            success: false,
            message: 'Error during login'
          });
        }

        res.json({
          success: true,
          user: {
            id: user.user_id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            isAdmin: !!user.admin
          }
        });
      });
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login'
    });
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
app.post('/api/admin/users', auth.isAdmin, async (req, res) => {
  try {
    const { first_name, last_name, email, admin, password } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and email are required'
      });
    }

    // Check if user with this email already exists
    const existingUser = db.users.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    // Hash password if provided (for local accounts)
    let password_hash = null;
    if (password) {
      password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    // Create user with hashed password
    const result = db.users.createUser({
      first_name,
      last_name,
      email,
      admin: Boolean(admin),
      password_hash
    });

    res.json({
      success: true,
      id: result.id
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
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

app.put('/api/admin/team/:id', auth.isAuthenticatedOrAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, title, bio, image_url, display_order, fr_title, fr_bio, email } = req.body;
    
    if (!name || !title) {
      return res.status(400).json({ success: false, message: 'Name and title are required' });
    }

    // Get the current member to check permissions and handle image
    const currentMember = db.team.getMemberById(id);
    if (!currentMember) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    // Check if user has permission to edit this member
    if (!req.user.admin && (!currentMember.email || currentMember.email !== req.user.email)) {
      return res.status(403).json({ success: false, message: 'You can only edit your own profile' });
    }

    // Non-admin users cannot change email or display_order
    const updateData = {
      name,
      title,
      bio,
      fr_title,
      fr_bio,
      image_url: image_url || currentMember.image_url
    };

    // Only allow admin users to update these fields
    if (req.user.admin) {
      updateData.email = email;
      updateData.display_order = display_order || 0;
    } else {
      updateData.email = currentMember.email;
      updateData.display_order = currentMember.display_order;
    }
    
    // Handle image removal and avatar generation
    if (image_url === null || image_url === '') {
      // Generate a unique filename
      const filename = `avatar-${Date.now()}-${Math.round(Math.random() * 1E9)}.png`;
      const avatarPath = path.join(teamImagesDir, filename);
      
      // Generate and save the avatar
      const avatarBuffer = generateLetterAvatar(name);
      fs.writeFileSync(avatarPath, avatarBuffer);
      
      // Set the image URL to the generated avatar
      updateData.image_url = `/images/team/${filename}`;
    }
    
    const success = db.team.updateMember(id, updateData);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, message: 'Failed to update team member' });
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

// Logo upload endpoint
app.post('/api/admin/logo', auth.isAuthenticated, auth.isAdmin, logoUpload.single('logo'), async (req, res) => {
  try {
    console.log('Logo upload request received:', {
      file: req.file,
      body: req.body,
      headers: req.headers
    });

    let logoPath = '/images/logo/logo.png';

    if (req.file) {
      console.log('File uploaded successfully:', req.file);
      // Use the uploaded file
      logoPath = `/images/logo/${req.file.filename}`;
    } else {
      console.log('No file uploaded, generating logo from site name');
      // Generate a new logo from site name
      const siteName = db.settings.getSetting('site_name') || 'Company Name';
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 1000);
      const filename = `logo-${timestamp}-${randomNum}.png`;
      
      // Use the correct path for the public directory
      const logoDir = path.join(__dirname, '..', 'public', 'images', 'logo');
      const filepath = path.join(logoDir, filename);

      console.log('Creating logo directory:', logoDir);
      // Ensure the directory exists
      await fs.promises.mkdir(logoDir, { recursive: true });

      console.log('Generating logo for site name:', siteName);
      // Generate and save the logo
      const avatarBuffer = await generateLetterAvatar(siteName, 200, 100);
      
      console.log('Saving logo to:', filepath);
      await fs.promises.writeFile(filepath, avatarBuffer);
      logoPath = `/images/logo/${filename}`;
    }

    console.log('Updating logo path in settings:', logoPath);
    // Update the logo path in settings
    db.settings.setSetting('logo_path', logoPath);

    res.json({
      success: true,
      path: logoPath
    });
  } catch (error) {
    console.error('Error handling logo:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to handle logo',
      error: error.message
    });
  }
});

// Generate captcha endpoint
app.get('/api/captcha', (req, res) => {
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
  
  // Set proper headers for SVG
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  
  // Send the SVG image
  res.status(200).send(captcha.data);
});

// Alternative captcha endpoint that returns a data URL
app.get('/api/captcha-data-url', (req, res) => {
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
  
  // Save session explicitly to ensure it's stored
  req.session.save(err => {
    if (err) {
      console.error('Error saving session:', err);
    }
    
    // Convert SVG to data URL
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
  
  // Check if captcha text exists in session
  if (!req.session.captchaText) {
    return res.status(400).json({ 
      success: false, 
      message: 'Captcha expired. Please refresh and try again.' 
    });
  }
  
  // Trim and normalize both inputs for comparison
  const normalizedInput = (captchaInput || '').trim().toLowerCase();
  const normalizedCaptcha = (req.session.captchaText || '').trim().toLowerCase();
  
  // Case-insensitive comparison
  const isValid = normalizedInput === normalizedCaptcha;
  
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
app.get('/api/health', async (req, res) => {
  try {
    // Check if email configuration is valid
    const hasValidEmailConfig = process.env.EMAIL_HOST && 
                               process.env.EMAIL_PORT && 
                               process.env.EMAIL_USER && 
                               process.env.EMAIL_PASS && 
                               process.env.EMAIL_FROM && 
                               process.env.EMAIL_TO &&
                               process.env.EMAIL_USER !== 'your-email@example.com' &&
                               process.env.EMAIL_PASS !== 'yourpassword';

    // Test the email connection if configured
    if (hasValidEmailConfig) {
      await transporter.verify();
    }

    res.json({
      success: true,
      emailService: {
        configured: hasValidEmailConfig,
        status: hasValidEmailConfig ? 'ready' : 'not_configured'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.json({
      success: true,
      emailService: {
        configured: false,
        status: 'error',
        error: error.message
      }
    });
  }
});

// Settings routes
app.get('/api/settings', (req, res) => {
  try {
    // Only return specific settings that are safe to expose publicly
    const settings = db.settings.getAllSettings().filter(setting => 
      ['contact_email', 'site_name'].includes(setting.key)
    );
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching public settings:', error);
    res.status(500).json({ success: false, message: 'Error fetching settings' });
  }
});

app.get('/api/admin/settings', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  try {
    const settings = db.settings.getAllSettings();
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    res.status(500).json({ success: false, message: 'Error fetching settings' });
  }
});

app.post('/api/admin/settings', auth.isAdmin, (req, res) => {
  try {
    const { key, value } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({ success: false, message: 'Key and value are required' });
    }
    
    db.settings.setSetting(key, value);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ success: false, message: 'Error updating setting' });
  }
});

// Translation routes
app.get('/api/admin/translations', auth.isAuthenticated, async (req, res) => {
  console.log('Translations GET route hit');
  try {
    const enDir = path.join(__dirname, '..', 'public', 'locales', 'en');
    const frDir = path.join(__dirname, '..', 'public', 'locales', 'fr');

    console.log('Directories:', { enDir, frDir });

    // Check if directories exist
    try {
      await fsPromises.access(enDir);
      await fsPromises.access(frDir);
      console.log('Directories exist');
    } catch (error) {
      console.error('Translation directories not found:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Translation directories not found',
        error: error.message,
        paths: { enDir, frDir }
      });
    }

    // Read all JSON files from both directories
    const [enFiles, frFiles] = await Promise.all([
      fsPromises.readdir(enDir).then(files => files.filter(file => file.endsWith('.json'))),
      fsPromises.readdir(frDir).then(files => files.filter(file => file.endsWith('.json')))
    ]);

    console.log('Files found:', { enFiles, frFiles });

    // Create pairs of translations
    const translations = await Promise.all(enFiles.map(async filename => {
      try {
        const [enContent, frContent] = await Promise.all([
          fsPromises.readFile(path.join(enDir, filename), 'utf8').then(JSON.parse),
          fsPromises.readFile(path.join(frDir, filename), 'utf8').then(JSON.parse)
        ]);

        return {
          en: {
            name: filename,
            content: enContent
          },
          fr: {
            name: filename,
            content: frContent
          }
        };
      } catch (error) {
        console.error(`Error processing file ${filename}:`, error);
        return null;
      }
    }));

    // Filter out any failed translations
    const validTranslations = translations.filter(t => t !== null);

    console.log('Sending response with translations');
    res.json({ success: true, translations: validTranslations });
  } catch (error) {
    console.error('Error fetching translations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching translations',
      error: error.message 
    });
  }
});

app.post('/api/admin/translations', auth.isAdmin, async (req, res) => {
  try {
    const { locale, filename, content } = req.body;

    if (!locale || !filename || !content) {
      return res.status(400).json({ success: false, message: 'Locale, filename, and content are required' });
    }

    if (!['en', 'fr'].includes(locale)) {
      return res.status(400).json({ success: false, message: 'Invalid locale' });
    }

    const filePath = path.join(__dirname, '..', 'public', 'locales', locale, filename);
    
    // Check if file exists
    try {
      await fsPromises.access(filePath);
    } catch (error) {
      console.error('Translation file not found:', error);
      return res.status(404).json({ 
        success: false, 
        message: 'Translation file not found',
        error: error.message,
        path: filePath
      });
    }

    // Validate that content is a valid object
    if (typeof content !== 'object' || content === null) {
      return res.status(400).json({
        success: false,
        message: 'Content must be a valid JSON object'
      });
    }

    // Create a backup of the current file
    const backupPath = `${filePath}.backup`;
    try {
      await fsPromises.copyFile(filePath, backupPath);
    } catch (error) {
      console.error('Failed to create backup:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create backup before update',
        error: error.message
      });
    }

    try {
      // Write the updated content back to the file
      await fsPromises.writeFile(filePath, JSON.stringify(content, null, 2), 'utf8');
      
      // If successful, remove the backup
      await fsPromises.unlink(backupPath);
      
      res.json({ success: true });
    } catch (error) {
      // If write fails, restore from backup
      try {
        await fsPromises.copyFile(backupPath, filePath);
        await fsPromises.unlink(backupPath);
      } catch (restoreError) {
        console.error('Failed to restore from backup:', restoreError);
      }
      
      console.error('Error updating translation:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error updating translation',
        error: error.message 
      });
    }
  } catch (error) {
    console.error('Error updating translation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating translation',
      error: error.message 
    });
  }
});

// Routes
app.use('/api/translate', translateRouter);

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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 