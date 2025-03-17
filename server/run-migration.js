const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Open database connection
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to database');
});

// Read and execute migration file
const migrationFile = path.join(__dirname, 'migrations', '20240320_add_french_translations.sql');
const migration = fs.readFileSync(migrationFile, 'utf8');

// Run migration in a transaction
db.serialize(() => {
  db.exec('BEGIN TRANSACTION');
  
  try {
    db.exec(migration);
    db.exec('COMMIT');
    console.log('Migration completed successfully');
  } catch (error) {
    db.exec('ROLLBACK');
    console.error('Error running migration:', error);
    process.exit(1);
  }
  
  // Close database connection
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
      process.exit(1);
    }
    console.log('Database connection closed');
  });
}); 