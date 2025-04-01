const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use(cors());

// Define paths relative to the container
const rootDir = path.join(__dirname, '..', '..');  // Points to /app
const serverDir = path.join(rootDir, 'server');    // Points to /app/server
const dbPath = path.join(serverDir, 'database.sqlite');

// Debug logging on startup
console.log('\n=== SETUP SERVER STARTING ===');
console.log('Current directory:', __dirname);
console.log('Root directory:', rootDir);
console.log('Server directory:', serverDir);
console.log('Database path:', dbPath);

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('Created data directory:', dataDir);
}

// Create a single database connection
let db;

// Helper function to check if tables have data
const checkTablesHaveData = () => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT 
        (SELECT COUNT(*) FROM users WHERE admin = 1) as has_admin,
        (SELECT COUNT(*) FROM settings) as has_settings`,
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({
          hasAdmin: result.has_admin > 0,
          hasSettings: result.has_settings > 0
        });
      }
    );
  });
};

// Helper function to ensure database is ready
const ensureDbReady = async () => {
  return new Promise((resolve, reject) => {
    const isNewDb = !fs.existsSync(dbPath);
    
    if (isNewDb) {
      console.log('Creating new database file...');
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }

    // Open or create database
    db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
        reject(err);
    return;
  }
      console.log('Connected to SQLite database');

      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON');

      // Create all tables in a transaction
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Create core tables (users and settings)
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            admin BOOLEAN NOT NULL DEFAULT 0,
            google_id TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            password_hash TEXT
          )
        `);

  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
            setting_id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Create and populate auxiliary tables (team and about) only for new database
        if (isNewDb) {
          // Create about table
          db.run(`
            CREATE TABLE IF NOT EXISTS about (
              about_id INTEGER PRIMARY KEY AUTOINCREMENT,
              title TEXT NOT NULL,
              description TEXT NOT NULL,
              display_order INTEGER NOT NULL DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              image_url TEXT,
              fr_title TEXT,
              fr_description TEXT
            )
          `);

          // Create project_types table
          db.run(`
            CREATE TABLE IF NOT EXISTS project_types (
              type_id INTEGER PRIMARY KEY AUTOINCREMENT,
              type TEXT NOT NULL UNIQUE,
              fr_type TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `);

          // Create projects table
          db.run(`
            CREATE TABLE IF NOT EXISTS projects (
              project_id INTEGER PRIMARY KEY AUTOINCREMENT,
              title TEXT NOT NULL,
              description TEXT NOT NULL,
              display_order INTEGER NOT NULL DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              image_url TEXT,
              fr_title TEXT,
              fr_description TEXT,
              type_id INTEGER NOT NULL,
              git_url TEXT,
              demo_url TEXT,
              status TEXT NOT NULL DEFAULT 'pending-approval',
              FOREIGN KEY (type_id) REFERENCES project_types(type_id)
            )
          `);

          // Create team table
          db.run(`
            CREATE TABLE IF NOT EXISTS team (
              team_id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              title TEXT NOT NULL,
              bio TEXT,
              image_url TEXT,
              display_order INTEGER NOT NULL DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              fr_title TEXT,
              fr_bio TEXT,
              email TEXT
            )
          `);

          // Insert sample data for about and team
          const aboutData = [
            {
              title: 'Our Mission',
              description: 'To provide innovative solutions that help businesses grow and succeed.',
              display_order: 1,
              fr_title: 'Notre Mission',
              fr_description: 'Fournir des solutions innovantes qui aident les entreprises à croître et à réussir.'
            },
            {
              title: 'Our Vision',
              description: 'To be the leading provider of business solutions in our industry.',
              display_order: 2,
              fr_title: 'Notre Vision',
              fr_description: 'Être le principal fournisseur de solutions commerciales dans notre industrie.'
            },
            {
              title: 'Our Values',
              description: 'Innovation, Integrity, and Excellence in everything we do.',
              display_order: 3,
              fr_title: 'Nos Valeurs',
              fr_description: 'Innovation, Intégrité et Excellence dans tout ce que nous faisons.'
            }
          ];

          const teamData = [
            {
              name: 'John Smith',
              title: 'CEO & Founder',
              bio: 'With over 20 years of experience in the industry.',
              display_order: 1,
              fr_title: 'PDG & Fondateur',
              fr_bio: 'Avec plus de 20 ans d\'expérience dans l\'industrie.',
              email: 'john@companyname.com'
            },
            {
              name: 'Sarah Johnson',
              title: 'CTO',
              bio: 'Leading our technical innovation and development.',
              display_order: 2,
              fr_title: 'Directrice Technique',
              fr_bio: 'Dirige notre innovation et développement technique.',
              email: 'sarah@companyname.com'
            },
            {
              name: 'Michael Chen',
              title: 'COO',
              bio: 'Optimizing our operations and processes.',
              display_order: 3,
              fr_title: 'Directeur des Opérations',
              fr_bio: 'Optimisation de nos opérations et processus.',
              email: 'michael@companyname.com'
            }
          ];

          // Insert default project types
          const projectTypesData = [
            { type: 'Web App', fr_type: 'Application Web' },
            { type: 'Mobile App', fr_type: 'Application Mobile' },
            { type: 'DevOps', fr_type: 'DevOps' }
          ];

          // Insert about data
          const aboutStmt = db.prepare(`
            INSERT OR IGNORE INTO about (title, description, display_order, fr_title, fr_description)
            VALUES (?, ?, ?, ?, ?)
          `);

          aboutData.forEach(item => {
            aboutStmt.run([item.title, item.description, item.display_order, item.fr_title, item.fr_description]);
          });
          aboutStmt.finalize();

          // Insert team data
          const teamStmt = db.prepare(`
            INSERT OR IGNORE INTO team (name, title, bio, display_order, fr_title, fr_bio, email)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);

          teamData.forEach(item => {
            teamStmt.run([item.name, item.title, item.bio, item.display_order, item.fr_title, item.fr_bio, item.email]);
          });
          teamStmt.finalize();

          // Insert project types data
          const projectTypesStmt = db.prepare(`
            INSERT OR IGNORE INTO project_types (type, fr_type)
            VALUES (?, ?)
          `);

          projectTypesData.forEach(item => {
            projectTypesStmt.run([item.type, item.fr_type]);
          });
          projectTypesStmt.finalize();
        }

        db.run('COMMIT', async (err) => {
          if (err) {
            console.error('Error committing transaction:', err);
            db.run('ROLLBACK');
            reject(err);
            return;
          }

          // Check if tables have data
          try {
            const { hasAdmin, hasSettings } = await checkTablesHaveData();
            console.log('Database status:', {
              isNewDb,
              hasAdmin,
              hasSettings
            });
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    });
  });
};

// Add error handler for database connection
process.on('exit', () => {
  if (db) {
    console.log('Closing database connection...');
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      }
    });
  }
});

// Create a router for API routes
const apiRouter = express.Router();

// Default values for empty database
const defaultValues = {
  admin: {
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@example.com',
    password: null
  },
  frontend: {
    NEXT_PUBLIC_API_URL: 'http://localhost:3001',
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    NEXT_PUBLIC_SITE_NAME: 'Company Name',
    NEXT_PUBLIC_CONTACT_EMAIL: 'contact@example.com'
  },
  backend: {
    PORT: '3001',
    NODE_ENV: 'development',
    JWT_SECRET: 'your-secret-key-here',
    DATABASE_URL: 'sqlite:./database.sqlite',
    GOOGLE_CLIENT_ID: '',
    GOOGLE_CLIENT_SECRET: '',
    GOOGLE_CALLBACK_URL: 'http://localhost:3001/auth/google/callback',
    SMTP_HOST: 'smtp.gmail.com',
    SMTP_PORT: '587',
    SMTP_USER: '',
    SMTP_PASS: '',
    SMTP_FROM: 'noreply@example.com'
  },
  settings: {
    version: '1.1.1',
    site_name: 'Company Name',
    contact_email: 'contact@example.com'
  }
};

// API Routes
apiRouter.get('/settings', async (req, res) => {
  try {
    const { hasSettings } = await checkTablesHaveData();
    
    if (!hasSettings) {
      // Case 1 & 2: No settings data
      res.json({ ...defaultValues.settings, _isDefault: true });
      return;
    }

    // Case 3: Settings exist
    db.all('SELECT key, value FROM settings', [], (err, rows) => {
      if (err) {
        console.error('Error fetching settings:', err);
        res.status(500).json({ error: 'Failed to load settings' });
        return;
      }

      const settings = {};
      rows.forEach(row => {
        settings[row.key] = row.value;
      });
      res.json({ ...settings, _isDefault: false });
    });
  } catch (error) {
    console.error('Error checking settings status:', error);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

apiRouter.post('/settings', async (req, res) => {
  try {
    await ensureDbReady();
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
    
    // Handle site_name updates
    if (req.body.site_name) {
      try {
        // Update index.html
        const indexHtmlPath = path.join(rootDir, 'public', 'index.html');
        const indexHtmlContent = await fsPromises.readFile(indexHtmlPath, 'utf-8');
        const updatedIndexHtml = indexHtmlContent.replace(
          /<title>.*?<\/title>/,
          `<title>${req.body.site_name}</title>`
        );
        await fsPromises.writeFile(indexHtmlPath, updatedIndexHtml);

        // Update manifest.json
        const manifestPath = path.join(rootDir, 'public', 'manifest.json');
        const manifestContent = await fsPromises.readFile(manifestPath, 'utf-8');
        const manifest = JSON.parse(manifestContent);
        manifest.short_name = req.body.site_name;
        await fsPromises.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
      } catch (error) {
        console.error('Error updating site name in files:', error);
        // Continue with saving to database even if file updates fail
      }
    }

    // Save to database
    Object.entries(req.body).forEach(([key, value]) => {
      stmt.run(key, value);
    });
    stmt.finalize();
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

apiRouter.get('/env/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    console.log('\n=== ENV FILE REQUEST ===');
    console.log('Requested filename:', filename);
    
    // Only allow .env files
    if (!filename.endsWith('.env')) {
      console.log('Invalid file type requested:', filename);
      res.status(400).json({ error: 'Invalid file type' });
      return;
    }

    // Map the requested file to the correct location
    let envPath;
    if (filename === '.env') {
      envPath = path.join(rootDir, '.env');  // Frontend .env in root (/app/.env)
      console.log('Loading frontend .env from:', envPath);
    } else if (filename === 'setup.env') {
      envPath = path.join(serverDir, '.env');  // Backend .env in server directory (/app/server/.env)
      console.log('Loading backend .env from:', envPath);
    } else {
      console.log('Invalid filename requested');
      res.status(400).json({ error: 'Invalid file name' });
      return;
    }

    console.log('Checking if file exists:', envPath);
    const exists = fs.existsSync(envPath);
    console.log('File exists:', exists);
    
    if (!exists) {
      console.log('Env file not found, returning empty object');
      res.json({});
      return;
    }

    const content = await fsPromises.readFile(envPath, 'utf-8');
    console.log('File content loaded:', content);
    
    const envVars = content.split('\n')
      .filter(line => line && !line.startsWith('#'))
      .reduce((acc, line) => {
        const [key, ...valueParts] = line.split('=');
        if (key) {
          acc[key.trim()] = valueParts.join('=').trim();
        }
        return acc;
      }, {});

    console.log('Parsed env vars:', envVars);
    res.json(envVars);
  } catch (error) {
    console.error('Error reading env file:', error);
    res.status(500).json({ error: 'Failed to read environment variables' });
  }
});

apiRouter.post('/env/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    // Only allow .env files
    if (!filename.endsWith('.env')) {
      res.status(400).json({ error: 'Invalid file type' });
      return;
    }

    // Map the requested file to the correct location
    let envPath;
    if (filename === '.env') {
      envPath = path.join(rootDir, '.env');  // Frontend .env in root
    } else if (filename === 'setup.env') {
      envPath = path.join(serverDir, '.env');  // Backend .env in server directory
    } else {
      res.status(400).json({ error: 'Invalid file name' });
      return;
    }

    console.log('Writing env file:', envPath);
    const envContent = Object.entries(req.body)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Ensure parent directory exists
    await fsPromises.mkdir(path.dirname(envPath), { recursive: true });
    
    await fsPromises.writeFile(envPath, envContent);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving env file:', error);
    res.status(500).json({ error: 'Failed to save environment variables' });
  }
});

// Mount API routes
app.use('/api/setup', apiRouter);

// Add admin user endpoints
apiRouter.get('/admin', async (req, res) => {
  try {
    const { hasAdmin } = await checkTablesHaveData();
    
    if (!hasAdmin) {
      // Case 1 & 2: No admin data
      res.json({ ...defaultValues.admin, _isDefault: true });
      return;
    }

    // Case 3: Admin exists
    db.get('SELECT * FROM users WHERE admin = 1 AND google_id IS NULL LIMIT 1', [], (err, row) => {
      if (err) {
        console.error('Error fetching admin user:', err);
        res.status(500).json({ error: 'Failed to load admin user' });
        return;
      }
      
      res.json({
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        password: null,
        _isDefault: false
      });
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ error: 'Failed to load admin user' });
  }
});

apiRouter.post('/admin', async (req, res) => {
  console.log('POST /api/setup/admin - Request received');
  const { first_name, last_name, email, password } = req.body;

  try {
    await ensureDbReady();
    // Hash the password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // First, check if an admin user already exists
    db.get(
      'SELECT user_id FROM users WHERE admin = 1 AND google_id IS NULL',
      [],
      (err, existingUser) => {
        if (err) {
          console.error('Error checking for existing admin:', err);
          res.status(500).json({ error: 'Database error' });
          return;
        }

        const query = existingUser
          ? `UPDATE users 
             SET first_name = ?, last_name = ?, email = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = ?`
          : `INSERT INTO users 
             (first_name, last_name, email, password_hash, admin, created_at, updated_at) 
             VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;

        const params = existingUser
          ? [first_name, last_name, email, password_hash, existingUser.user_id]
          : [first_name, last_name, email, password_hash];

        db.run(query, params, function(err) {
          if (err) {
            console.error('Error saving admin user:', err);
            res.status(500).json({ error: 'Failed to save admin user' });
            return;
          }

          console.log('Admin user saved successfully');
          res.json({ success: true });
        });
      }
    );
  } catch (error) {
    console.error('Error processing admin user:', error);
    res.status(500).json({ error: 'Failed to process admin user' });
  }
});

apiRouter.get('/frontend-env', async (req, res) => {
  try {
    if (!fs.existsSync(frontendEnvPath)) {
      res.json(defaultValues.frontend);
      return;
    }
    const content = await fs.promises.readFile(frontendEnvPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        env[key.trim()] = value.replace(/^["']|["']$/g, '');
      }
    });
    res.json(env);
  } catch (error) {
    console.error('Error fetching frontend environment:', error);
    res.json(defaultValues.frontend);
  }
});

apiRouter.get('/backend-env', async (req, res) => {
  try {
    if (!fs.existsSync(backendEnvPath)) {
      res.json(defaultValues.backend);
      return;
    }
    const content = await fs.promises.readFile(backendEnvPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        env[key.trim()] = value.replace(/^["']|["']$/g, '');
      }
    });
    res.json(env);
  } catch (error) {
    console.error('Error fetching backend environment:', error);
    res.json(defaultValues.backend);
  }
});

const PORT = process.env.PORT || 3013;

// Initialize server only after database is ready
const initializeServer = async () => {
  try {
    console.log('\n=== SETUP SERVER STARTING ===');
    console.log('Current directory:', __dirname);
    console.log('Root directory:', rootDir);
    console.log('Server directory:', serverDir);
    console.log('Database path:', dbPath);

    // Ensure data directory exists
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('Created data directory:', dataDir);
    }

    // Initialize database and wait for it to be ready
    await ensureDbReady();
    console.log('Database initialized successfully');

    // Start listening only after database is ready
app.listen(PORT, () => {
      console.log(`Setup API server running on port ${PORT}`);
      console.log('Root directory:', rootDir);
  console.log('Server directory:', serverDir);
  console.log('Database path:', dbPath);
}); 
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

// Start the server
initializeServer(); 
