/**
 * Database initialization script
 * This script creates the SQLite database and initializes it with the required tables and data
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, 'database.sqlite');

// Check if database file already exists
const dbExists = fs.existsSync(DB_PATH);

// Create or open the database
const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log(`Database ${dbExists ? 'opened' : 'created'} at ${DB_PATH}`);

// Initialize database schema if it doesn't exist
if (!dbExists) {
  console.log('Initializing database schema...');
  
  // Create users table
  db.exec(`
    CREATE TABLE users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      admin BOOLEAN NOT NULL DEFAULT 0,
      google_id TEXT UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Created users table');
  
  // Create settings table
  db.exec(`
    CREATE TABLE settings (
      setting_id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Created settings table');
  
  // Create about table
  db.exec(`
    CREATE TABLE about (
      about_id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Created about table');
  
  // Create team table
  db.exec(`
    CREATE TABLE team (
      team_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      bio TEXT,
      image_url TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Created team table');
  
  // Insert initial data
  
  // Add version to settings
  const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
  insertSetting.run('version', '1.0.0');
  console.log('Added initial settings');
  
  // Add sample about sections
  const insertAbout = db.prepare('INSERT INTO about (title, description, display_order) VALUES (?, ?, ?)');
  const aboutSections = [
    {
      title: 'Our Story',
      description: 'Founded in 2015, Drenlia has been at the forefront of innovation in our industry. What started as a small team with big dreams has grown into a company dedicated to excellence and customer satisfaction.',
      order: 1
    },
    {
      title: 'Our Mission',
      description: 'At Drenlia, our mission is to provide exceptional products and services that improve the lives of our customers. We strive to innovate, inspire, and make a positive impact in everything we do.',
      order: 2
    },
    {
      title: 'Our Values',
      description: 'Integrity, excellence, and customer focus are at the heart of everything we do. We believe in transparent business practices, continuous improvement, and building lasting relationships with our clients and partners.',
      order: 3
    }
  ];
  
  aboutSections.forEach(section => {
    insertAbout.run(section.title, section.description, section.order);
  });
  console.log('Added initial about sections');
  
  // Add sample team members
  const insertTeam = db.prepare('INSERT INTO team (name, title, bio, image_url, display_order) VALUES (?, ?, ?, ?, ?)');
  const teamMembers = [
    {
      name: 'John Doe',
      title: 'CEO & Founder',
      bio: 'John has over 15 years of experience in the industry and leads our company with vision and passion.',
      image_url: '/images/team/john-doe.jpg',
      order: 1
    },
    {
      name: 'Jane Smith',
      title: 'CTO',
      bio: 'Jane brings technical expertise and innovation to our team, driving our technological advancements.',
      image_url: '/images/team/jane-smith.jpg',
      order: 2
    },
    {
      name: 'Michael Johnson',
      title: 'Creative Director',
      bio: 'Michael\'s creative vision helps shape our brand and product design.',
      image_url: '/images/team/michael-johnson.jpg',
      order: 3
    }
  ];
  
  teamMembers.forEach(member => {
    insertTeam.run(member.name, member.title, member.bio, member.image_url, member.order);
  });
  console.log('Added initial team members');
  
  // Add an admin user (you should change this email to your own)
  const insertUser = db.prepare('INSERT INTO users (first_name, last_name, email, admin) VALUES (?, ?, ?, ?)');
  insertUser.run('Admin', 'User', 'admin@example.com', 1);
  console.log('Added initial admin user');
}

// Close the database connection
db.close();
console.log('Database initialization completed'); 