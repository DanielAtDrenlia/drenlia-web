/**
 * Database migration script
 * This script updates the database schema with new fields
 */

const Database = require('better-sqlite3');
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, 'database.sqlite');

// Open the database
const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log(`Database opened at ${DB_PATH}`);

// Check if image_url column exists in about table
const aboutColumns = db.prepare("PRAGMA table_info(about)").all();
const hasImageUrl = aboutColumns.some(col => col.name === 'image_url');

if (!hasImageUrl) {
  console.log('Adding image_url column to about table...');
  
  // Add image_url column to about table
  db.exec(`
    ALTER TABLE about
    ADD COLUMN image_url TEXT
  `);
  
  console.log('Added image_url column to about table');
  
  // Update version in settings
  const updateVersion = db.prepare('UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?');
  updateVersion.run('1.1.0', 'version');
  console.log('Updated version to 1.1.0');
}

// Close the database connection
db.close();
console.log('Database migration completed'); 