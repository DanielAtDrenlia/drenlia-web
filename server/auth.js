/**
 * Authentication module
 * Handles Google OAuth authentication and user management
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production' 
      ? 'https://dev.drenlia.com/api/auth/google/callback'
      : '/api/auth/google/callback',
    // This is critical - it ensures the callback URL is constructed with the correct host
    proxy: true
  },
  (accessToken, refreshToken, profile, done) => {
    try {
      // Create or update user from Google profile
      const user = db.users.upsertUserFromGoogle(profile);
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

// Deserialize user from session
passport.deserializeUser((id, done) => {
  try {
    const stmt = db.getDb().prepare('SELECT * FROM users WHERE user_id = ?');
    const user = stmt.get(id);
    done(null, user || null);
  } catch (error) {
    done(error);
  }
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Not authenticated' });
}

// Middleware to check if user is an admin
function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.admin) {
    return next();
  }
  res.status(403).json({ success: false, message: 'Not authorized' });
}

module.exports = {
  passport,
  isAuthenticated,
  isAdmin
}; 